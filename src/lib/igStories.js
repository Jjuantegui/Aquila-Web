import crypto from "node:crypto";
import { getRedis } from "./redis";

/**
 * Publicador de stories de Instagram para Aquila (API de Instagram con inicio de sesión empresarial).
 *
 * Variables de entorno (Vercel → Settings → Environment Variables):
 *   IG_ACCESS_TOKEN  token largo generado en Meta for Developers (60 días; se renueva con refresh_token)
 *   IG_USER_ID       ID de la cuenta profesional de Instagram (17841471503444352 para @aquilasportsm)
 *   CONNECTOR_KEY    clave larga aleatoria; forma parte de la URL privada del conector y firma las subidas
 *   SITE_URL         (opcional) por defecto https://www.aquilasports.es
 *   IG_API_BASE      (opcional) por defecto https://graph.instagram.com/v26.0 (se usa también en pruebas)
 *
 * Datos en Redis (Upstash, el mismo que usan los dossieres):
 *   ig:img:<id>      JPEG en base64 (caduca a los 21 días)
 *   ig:stories       hash  id → JSON de la story programada
 *   ig:token         token renovado { token, refreshedAt } (tiene prioridad sobre IG_ACCESS_TOKEN)
 *   ig:lock:<id>     candado para no publicar dos veces la misma story
 */

const IMG_TTL = 60 * 60 * 24 * 21;
export const MAX_IMAGE_BYTES = 700 * 1024; // con base64 queda por debajo del límite de 1 MB por petición de Upstash
const UPLOAD_TTL = 60 * 30;

const mem = (globalThis.__aquilaIgStore ??= { keys: new Map(), stories: new Map() });

function apiBase() {
    return (process.env.IG_API_BASE || "https://graph.instagram.com/v26.0").replace(/\/$/, "");
}
export function siteUrl() {
    return (process.env.SITE_URL || "https://www.aquilasports.es").replace(/\/$/, "");
}
function connectorKey() {
    return (process.env.CONNECTOR_KEY || "").trim();
}

/** Comparación en tiempo constante. */
export function safeEqual(a, b) {
    const x = Buffer.from(String(a));
    const y = Buffer.from(String(b));
    if (x.length !== y.length) return false;
    return crypto.timingSafeEqual(x, y);
}

/** La URL del conector es /api/mcp/<CONNECTOR_KEY>. Sin clave configurada (o demasiado corta) nada es válido. */
export function isValidConnectorKey(candidate) {
    const expected = connectorKey();
    if (expected.length < 24 || typeof candidate !== "string") return false;
    return safeEqual(candidate.trim(), expected);
}

const newId = (n = 18) => crypto.randomBytes(n).toString("base64url");

// ---------- almacenamiento ----------
async function kvGet(key) {
    const r = getRedis();
    if (r) return r.get(key);
    const e = mem.keys.get(key);
    if (!e || (e.exp && e.exp < Date.now())) return null;
    return e.value;
}
async function kvSet(key, value, ttlSeconds) {
    const r = getRedis();
    if (r) return ttlSeconds ? r.set(key, value, { ex: ttlSeconds }) : r.set(key, value);
    mem.keys.set(key, { value, exp: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0 });
    return "OK";
}
async function kvSetNx(key, value, ttlSeconds) {
    const r = getRedis();
    if (r) return r.set(key, value, { nx: true, ex: ttlSeconds });
    const e = mem.keys.get(key);
    if (e && (!e.exp || e.exp > Date.now())) return null;
    mem.keys.set(key, { value, exp: Date.now() + ttlSeconds * 1000 });
    return "OK";
}
async function kvDel(key) {
    const r = getRedis();
    if (r) return r.del(key);
    mem.keys.delete(key);
}
async function storyPut(story) {
    const r = getRedis();
    if (r) return r.hset("ig:stories", { [story.id]: JSON.stringify(story) });
    mem.stories.set(story.id, JSON.stringify(story));
}
async function storyAll() {
    const r = getRedis();
    const raw = r ? (await r.hgetall("ig:stories")) || {} : Object.fromEntries(mem.stories);
    return Object.values(raw)
        .map((v) => (typeof v === "string" ? JSON.parse(v) : v))
        .sort((a, b) => String(a.publish_at).localeCompare(String(b.publish_at)));
}
async function storyGet(id) {
    return (await storyAll()).find((s) => s.id === id) || null;
}

// ---------- imágenes ----------
function sign(payload) {
    return crypto.createHmac("sha256", connectorKey()).update(payload).digest("base64url");
}

/** Prepara una subida: devuelve la URL firmada (PUT, image/jpeg) válida 30 minutos. */
export function createUpload(filename) {
    if (!connectorKey()) throw new Error("Falta CONNECTOR_KEY en Vercel.");
    const id = newId(16);
    const exp = Math.floor(Date.now() / 1000) + UPLOAD_TTL;
    const sig = sign(`${id}.${exp}`);
    return {
        image_id: id,
        upload_url: `${siteUrl()}/api/ig/upload/${id}?exp=${exp}&sig=${sig}`,
        method: "PUT",
        content_type: "image/jpeg",
        max_bytes: MAX_IMAGE_BYTES,
        public_url: `${siteUrl()}/api/ig/img/${id}.jpg`,
        expires_in_seconds: UPLOAD_TTL,
        filename: filename || null,
    };
}

export function verifyUpload(id, exp, sig) {
    if (!connectorKey() || !id || !exp || !sig) return false;
    if (Number(exp) < Date.now() / 1000) return false;
    return safeEqual(sig, sign(`${id}.${exp}`));
}

export function isJpeg(buf) {
    return buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8 && buf[buf.length - 2] === 0xff && buf[buf.length - 1] === 0xd9;
}

export async function saveImage(id, buf) {
    if (await kvGet(`ig:img:${id}`)) throw new Error("Esta subida ya se usó.");
    await kvSet(`ig:img:${id}`, buf.toString("base64"), IMG_TTL);
}
export async function loadImage(id) {
    const b64 = await kvGet(`ig:img:${id}`);
    return b64 ? Buffer.from(String(b64), "base64") : null;
}

// ---------- Instagram ----------
async function accessToken() {
    const stored = await kvGet("ig:token");
    const parsed = typeof stored === "string" ? JSON.parse(stored) : stored;
    if (parsed?.token) return parsed.token;
    const t = (process.env.IG_ACCESS_TOKEN || "").trim();
    if (!t) throw new Error("Falta IG_ACCESS_TOKEN en Vercel.");
    return t;
}
function igUserId() {
    const id = (process.env.IG_USER_ID || "").trim();
    if (!id) throw new Error("Falta IG_USER_ID en Vercel.");
    return id;
}

async function ig(path, { method = "GET", params = {} } = {}) {
    const token = await accessToken();
    const url = new URL(`${apiBase()}/${path.replace(/^\//, "")}`);
    const body = new URLSearchParams({ ...params, access_token: token });
    let res;
    if (method === "GET") {
        for (const [k, v] of body) url.searchParams.set(k, v);
        res = await fetch(url, { cache: "no-store" });
    } else {
        res = await fetch(url, { method, body, cache: "no-store" });
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
        const msg = data?.error?.message || `HTTP ${res.status}`;
        // Nunca devolvemos el token: los mensajes de Meta no lo incluyen, pero por si acaso se limpia.
        throw new Error(`Instagram: ${msg.replaceAll(token, "[token]")}`);
    }
    return data;
}

export async function checkConnection() {
    const me = await ig("me", { params: { fields: "user_id,username,account_type" } });
    const stored = await kvGet("ig:token");
    const parsed = typeof stored === "string" ? JSON.parse(stored) : stored;
    const stories = await storyAll();
    return {
        ok: true,
        username: me.username,
        user_id: me.user_id,
        account_type: me.account_type || null,
        token_source: parsed?.token ? "redis (renovado)" : "IG_ACCESS_TOKEN",
        token_refreshed_at: parsed?.refreshedAt || null,
        scheduled: stories.filter((s) => s.status === "scheduled").length,
        storage: getRedis() ? "redis" : "memoria (solo desarrollo)",
    };
}

/** Renueva el token largo (válido 60 días más). Hay que llamarlo antes de que caduque. */
export async function refreshToken() {
    const data = await ig("refresh_access_token", { params: { grant_type: "ig_refresh_token" } });
    await kvSet("ig:token", JSON.stringify({ token: data.access_token, refreshedAt: new Date().toISOString() }));
    return { ok: true, expires_in_days: Math.round((data.expires_in || 0) / 86400) };
}

// ---------- cola ----------
export async function scheduleStory({ image_id, publish_at, mention, label }) {
    if (!image_id || !(await kvGet(`ig:img:${image_id}`))) throw new Error("La imagen no existe o ha caducado: súbela primero.");
    const when = new Date(publish_at);
    if (Number.isNaN(when.getTime())) throw new Error("publish_at no es una fecha válida (usa ISO 8601 con zona, p. ej. 2026-10-30T11:00:00+01:00).");
    const username = mention ? String(mention).trim().replace(/^@/, "") : null;
    if (username && !/^[A-Za-z0-9._]{1,30}$/.test(username)) throw new Error("La mención no parece un usuario de Instagram válido.");
    const story = {
        id: newId(9),
        image_id,
        image_url: `${siteUrl()}/api/ig/img/${image_id}.jpg`,
        publish_at: when.toISOString(),
        mention: username,
        label: label ? String(label).slice(0, 140) : null,
        status: "scheduled",
        created_at: new Date().toISOString(),
    };
    await storyPut(story);
    return story;
}

export async function listStories(status) {
    const all = await storyAll();
    return status ? all.filter((s) => s.status === status) : all;
}

export async function cancelStory(id) {
    const s = await storyGet(id);
    if (!s) throw new Error("No existe esa story.");
    if (s.status !== "scheduled") throw new Error(`No se puede cancelar: estado ${s.status}.`);
    s.status = "cancelled";
    s.cancelled_at = new Date().toISOString();
    await storyPut(s);
    return s;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function publishOne(s) {
    const lock = await kvSetNx(`ig:lock:${s.id}`, "1", 600);
    if (!lock) return { id: s.id, skipped: "otra ejecución la está publicando" };
    try {
        const params = { image_url: s.image_url, media_type: "STORIES" };
        if (s.mention) params.user_tags = JSON.stringify([{ username: s.mention }]);
        const container = await ig(`${igUserId()}/media`, { method: "POST", params });
        let status = "IN_PROGRESS";
        for (let i = 0; i < 15 && status !== "FINISHED"; i++) {
            const st = await ig(container.id, { params: { fields: "status_code" } });
            status = st.status_code;
            if (status === "ERROR" || status === "EXPIRED") throw new Error(`Meta rechazó el contenedor (${status}).`);
            if (status !== "FINISHED") await sleep(2000);
        }
        if (status !== "FINISHED") throw new Error("Meta no terminó de procesar la imagen a tiempo; se reintentará.");
        const pub = await ig(`${igUserId()}/media_publish`, { method: "POST", params: { creation_id: container.id } });
        Object.assign(s, { status: "published", media_id: pub.id, published_at: new Date().toISOString(), error: null });
        await storyPut(s);
        return { id: s.id, published: true, media_id: pub.id, label: s.label, mention: s.mention };
    } catch (e) {
        s.attempts = (s.attempts || 0) + 1;
        s.error = String(e.message || e);
        if (s.attempts >= 3) s.status = "failed";
        await storyPut(s);
        return { id: s.id, published: false, error: s.error, attempts: s.attempts, label: s.label };
    } finally {
        await kvDel(`ig:lock:${s.id}`);
    }
}

/** Publica las stories cuya hora ya ha llegado (con 2 minutos de margen). */
export async function publishDue({ max = 10 } = {}) {
    const now = Date.now() + 2 * 60 * 1000;
    const due = (await storyAll()).filter((s) => s.status === "scheduled" && new Date(s.publish_at).getTime() <= now).slice(0, max);
    const results = [];
    for (const s of due) results.push(await publishOne(s));
    return { checked_at: new Date().toISOString(), due: due.length, results };
}

export async function publishNow(id) {
    const s = await storyGet(id);
    if (!s) throw new Error("No existe esa story.");
    if (s.status !== "scheduled") throw new Error(`No se puede publicar: estado ${s.status}.`);
    return publishOne(s);
}
