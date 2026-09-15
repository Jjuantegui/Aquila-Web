import { getRedis, memoryStore, isDbConnected } from "./redis";
import { recipients } from "../data/dossiers";
import { dossierLink, recipientSlugFromKey, isUnknownKey } from "./dossiers";

/**
 * Registro de aperturas de dossieres.
 *
 * Estructura en Redis:
 *   opens:{dossier}:{recipient}  → lista (LPUSH) de eventos JSON, máx. 500
 *   opens:all                    → lista global, últimos 2.000 eventos (panel y API)
 *   stats:{dossier}:{recipient}  → hash { count (solo humanos), first, last }
 *   recipients:{dossier}         → hash slug → etiqueta (editable desde el panel)
 *   seen:{dossier}:{recipient}:{ip} → marca temporal para no contar dos veces la
 *                                     misma apertura (visores PDF que piden el
 *                                     archivo varias veces seguidas)
 *
 * Sin Redis (desarrollo local) todo se guarda en memoria.
 */
const MAX_PER_RECIPIENT = 500;
const MAX_ALL = 2000;
const DEDUPE_SECONDS = 120;

const opensKey = (d, r) => `opens:${d}:${r}`;
const statsKey = (d, r) => `stats:${d}:${r}`;
const labelsKey = (d) => `recipients:${d}`;
const seenKey = (d, r, ip) => `seen:${d}:${r}:${ip || "noip"}`;
const ALL_KEY = "opens:all";

export { isDbConnected };

/** Una apertura "humana" es la que cuenta en las estadísticas. */
export const isHumanOpen = (e) => Boolean(e) && !e.isBot && !e.dup;

/**
 * Guarda un evento. Marca `dup` si el mismo visitante (IP hasheada) ya abrió
 * ese enlace en los últimos DEDUPE_SECONDS. Nunca lanza: cualquier fallo se
 * registra en consola y se ignora (el PDF ya se ha servido).
 */
export async function recordOpen(event) {
    try {
        const redis = getRedis();
        const e = { ...event };

        if (!e.isBot && !e.dup) {
            const key = seenKey(e.dossier, e.recipient, e.ip);
            const fresh = redis
                ? await redis.set(key, 1, { nx: true, ex: DEDUPE_SECONDS })
                : memoryStore.setNxEx(key, 1, DEDUPE_SECONDS);
            if (fresh !== "OK") e.dup = true;
        }

        const countable = isHumanOpen(e);
        const oKey = opensKey(e.dossier, e.recipient);
        const sKey = statsKey(e.dossier, e.recipient);

        if (redis) {
            const p = redis.pipeline();
            p.lpush(oKey, e);
            p.ltrim(oKey, 0, MAX_PER_RECIPIENT - 1);
            p.lpush(ALL_KEY, e);
            p.ltrim(ALL_KEY, 0, MAX_ALL - 1);
            if (countable) {
                p.hincrby(sKey, "count", 1);
                p.hsetnx(sKey, "first", e.ts);
                p.hset(sKey, { last: e.ts });
            }
            await p.exec();
        } else {
            memoryStore.lpush(oKey, e);
            memoryStore.ltrim(oKey, 0, MAX_PER_RECIPIENT - 1);
            memoryStore.lpush(ALL_KEY, e);
            memoryStore.ltrim(ALL_KEY, 0, MAX_ALL - 1);
            if (countable) {
                memoryStore.hincrby(sKey, "count", 1);
                memoryStore.hsetnx(sKey, "first", e.ts);
                memoryStore.hset(sKey, { last: e.ts });
            }
        }
        return e;
    } catch (err) {
        console.error("[dossiers] no se pudo registrar la apertura:", err?.message || err);
        return event;
    }
}

const parseEvent = (raw) => {
    if (!raw) return null;
    if (typeof raw === "object") return raw;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

/** Últimos eventos (más recientes primero) de la lista global. */
async function readAllEvents() {
    const redis = getRedis();
    const raw = redis ? await redis.lrange(ALL_KEY, 0, MAX_ALL - 1) : memoryStore.lrange(ALL_KEY, 0, -1);
    return (raw || []).map(parseEvent).filter(Boolean);
}

/**
 * Lista de eventos con filtros. `since` es ISO; `includeBots` incluye vistas
 * previas de mensajería y duplicados.
 */
export async function listEvents({ limit = 200, includeBots = false, dossier, since } = {}) {
    try {
        const sinceMs = since ? new Date(since).getTime() : null;
        let events = await readAllEvents();
        if (dossier) events = events.filter((e) => e.dossier === dossier);
        if (!includeBots) events = events.filter(isHumanOpen);
        if (sinceMs && !Number.isNaN(sinceMs)) events = events.filter((e) => new Date(e.ts).getTime() >= sinceMs);
        return events.slice(0, limit);
    } catch (err) {
        console.error("[dossiers] no se pudieron leer los eventos:", err?.message || err);
        return [];
    }
}

/** Etiquetas de destinatarios guardadas desde el panel: { slug: label }. */
export async function getLabels(dossier) {
    try {
        const redis = getRedis();
        const h = redis ? await redis.hgetall(labelsKey(dossier)) : memoryStore.hgetall(labelsKey(dossier));
        return h || {};
    } catch (err) {
        console.error("[dossiers] no se pudieron leer las etiquetas:", err?.message || err);
        return {};
    }
}

export async function setLabel(dossier, slug, label) {
    const redis = getRedis();
    if (!label) {
        if (redis) await redis.hdel(labelsKey(dossier), slug);
        else memoryStore.hdel(labelsKey(dossier), slug);
        return;
    }
    if (redis) await redis.hset(labelsKey(dossier), { [slug]: label });
    else memoryStore.hset(labelsKey(dossier), { [slug]: label });
}

async function readStats(pairs) {
    const redis = getRedis();
    if (!pairs.length) return [];
    if (redis) {
        const p = redis.pipeline();
        pairs.forEach(([d, r]) => p.hgetall(statsKey(d, r)));
        return p.exec();
    }
    return pairs.map(([d, r]) => memoryStore.hgetall(statsKey(d, r)));
}

/**
 * Resumen por dossier y destinatario. Une los destinatarios del repo, las
 * etiquetas guardadas en Redis y cualquier slug que aparezca en el historial
 * (incluidos los "unknown:*").
 */
export async function getSummary({ dossier: onlyDossier, dossiers = [] } = {}) {
    try {
        const events = await readAllEvents();
        const humans = events.filter(isHumanOpen);
        const activeDossiers = dossiers.filter((d) => !onlyDossier || d.slug === onlyDossier);

        const rows = new Map(); // key "dossier|recipientKey" → row
        const add = (dossierSlug, key, extra = {}) => {
            const id = `${dossierSlug}|${key}`;
            if (!rows.has(id)) {
                rows.set(id, {
                    dossier: dossierSlug,
                    recipientKey: key,
                    recipient: recipientSlugFromKey(key),
                    unknown: isUnknownKey(key),
                    label: null,
                    lang: null,
                    notes: "",
                    count: 0,
                    first: null,
                    last: null,
                    lastEvent: null,
                    url: dossierLink(dossierSlug, recipientSlugFromKey(key)),
                });
            }
            Object.assign(rows.get(id), extra);
        };

        for (const d of activeDossiers) {
            recipients
                .filter((r) => r.dossier === d.slug)
                .forEach((r) => add(d.slug, r.slug, { label: r.label, lang: r.lang, notes: r.notes || "" }));
            const labels = await getLabels(d.slug);
            Object.entries(labels).forEach(([slug, label]) => {
                const known = recipients.some((r) => r.dossier === d.slug && r.slug === slug);
                add(d.slug, known ? slug : `unknown:${slug}`, { label });
            });
        }
        for (const e of events) {
            if (onlyDossier && e.dossier !== onlyDossier) continue;
            add(e.dossier, e.recipient);
        }

        const list = [...rows.values()];
        const stats = await readStats(list.map((r) => [r.dossier, r.recipientKey]));
        list.forEach((row, i) => {
            const s = stats[i] || {};
            row.count = Number(s.count || 0);
            row.first = s.first || null;
            row.last = s.last || null;
            row.lastEvent = humans.find((e) => e.dossier === row.dossier && e.recipient === row.recipientKey) || null;
            if (!row.label) row.label = row.unknown ? `(sin etiqueta) ${row.recipient}` : row.recipient;
        });

        return list.sort((a, b) => {
            if (a.dossier !== b.dossier) return a.dossier.localeCompare(b.dossier);
            const la = a.last ? new Date(a.last).getTime() : 0;
            const lb = b.last ? new Date(b.last).getTime() : 0;
            if (la !== lb) return lb - la;
            return a.label.localeCompare(b.label);
        });
    } catch (err) {
        console.error("[dossiers] no se pudo construir el resumen:", err?.message || err);
        return [];
    }
}

/** Copia del evento sin la IP (ni siquiera hasheada sale por la API). */
export const publicEvent = (e) => {
    const rest = { ...e };
    delete rest.ip;
    return rest;
};
