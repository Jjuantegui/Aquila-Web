import crypto from "node:crypto";
import { getRedis } from "./redis";
import {
    MAX_VIDEO_BYTES,
    isBlobConfigured,
    canUseMemoryVideos,
    videoPathname,
    blobPublicUrl,
    presignVideoUpload,
    deleteBlob,
    inspectRemoteMp4,
} from "./igVideo";

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
 *   ig:lock:<id>     candado para no publicar dos veces la misma story o reel
 *   ig:media         hash  id → JSON con los metadatos de cada vídeo ({ media_id, kind, blob_url, bytes, ... })
 *   ig:reels         hash  id → JSON del reel programado
 *
 * Los vídeos (stories en vídeo y reels) viven en Vercel Blob, no en Redis: ver src/lib/igVideo.js.
 */

const IMG_TTL = 60 * 60 * 24 * 21;
export const MAX_IMAGE_BYTES = 700 * 1024; // con base64 queda por debajo del límite de 1 MB por petición de Upstash
const UPLOAD_TTL = 60 * 30;

const mem = (globalThis.__aquilaIgStore ??= { keys: new Map(), stories: new Map() });
mem.reels ??= new Map();
mem.media ??= new Map();
mem.videos ??= new Map(); // MP4 en memoria (solo desarrollo, sin Blob)

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
async function hashPut(key, memMap, item) {
    const r = getRedis();
    if (r) return r.hset(key, { [item.id]: JSON.stringify(item) });
    memMap.set(item.id, JSON.stringify(item));
}
async function hashAll(key, memMap) {
    const r = getRedis();
    const raw = r ? (await r.hgetall(key)) || {} : Object.fromEntries(memMap);
    return Object.values(raw).map((v) => (typeof v === "string" ? JSON.parse(v) : v));
}
async function hashGet(key, memMap, id) {
    const r = getRedis();
    const v = r ? await r.hget(key, id) : memMap.get(id);
    if (!v) return null;
    return typeof v === "string" ? JSON.parse(v) : v;
}
async function hashDel(key, memMap, id) {
    const r = getRedis();
    if (r) return r.hdel(key, id);
    memMap.delete(id);
}
const reelPut = (reel) => hashPut("ig:reels", mem.reels, reel);
const reelGet = (id) => hashGet("ig:reels", mem.reels, id);
async function reelAll() {
    return (await hashAll("ig:reels", mem.reels)).sort((a, b) => String(a.publish_at).localeCompare(String(b.publish_at)));
}
const mediaPut = (m) => hashPut("ig:media", mem.media, { ...m, id: m.media_id });
const mediaGet = (id) => hashGet("ig:media", mem.media, id);

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
        media_id: id,
        kind: "image",
        upload_url: `${siteUrl()}/api/ig/upload/${id}?exp=${exp}&sig=${sig}`,
        method: "PUT",
        content_type: "image/jpeg",
        max_bytes: MAX_IMAGE_BYTES,
        public_url: `${siteUrl()}/api/ig/img/${id}.jpg`,
        expires_in_seconds: UPLOAD_TTL,
        filename: filename || null,
    };
}

export function verifyUpload(id, exp, sig, kind = "image") {
    if (!connectorKey() || !id || !exp || !sig) return false;
    if (Number(exp) < Date.now() / 1000) return false;
    return safeEqual(sig, sign(kind === "video" ? `${id}.${exp}.video` : `${id}.${exp}`));
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
    const reels = await reelAll();
    return {
        ok: true,
        username: me.username,
        user_id: me.user_id,
        account_type: me.account_type || null,
        token_source: parsed?.token ? "redis (renovado)" : "IG_ACCESS_TOKEN",
        token_refreshed_at: parsed?.refreshedAt || null,
        scheduled: stories.filter((s) => s.status === "scheduled").length,
        scheduled_reels: reels.filter((r) => r.status === "scheduled").length,
        storage: getRedis() ? "redis" : "memoria (solo desarrollo)",
        video_storage: isBlobConfigured() ? "vercel blob" : canUseMemoryVideos() ? "memoria (solo desarrollo)" : "sin configurar (falta BLOB_READ_WRITE_TOKEN)",
    };
}

/** Renueva el token largo (válido 60 días más). Hay que llamarlo antes de que caduque. */
export async function refreshToken() {
    const data = await ig("refresh_access_token", { params: { grant_type: "ig_refresh_token" } });
    await kvSet("ig:token", JSON.stringify({ token: data.access_token, refreshedAt: new Date().toISOString() }));
    return { ok: true, expires_in_days: Math.round((data.expires_in || 0) / 86400) };
}

// ---------- cola ----------
export async function scheduleStory({ image_id, media_id, publish_at, mention, label }) {
    if (!image_id && media_id) {
        if (await kvGet(`ig:img:${media_id}`)) image_id = media_id;
        else return scheduleVideoStory({ media_id, publish_at, mention, label });
    }
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

/**
 * Publica las stories y reels cuya hora ya ha llegado (con 2 minutos de margen).
 * Como mucho 1 reel por ejecución, y sin pasarse del tiempo de la función: si Meta sigue
 * procesando un vídeo al acabar el presupuesto, se guarda el contenedor y se retoma en la siguiente.
 */
export async function publishDue({ max = 10 } = {}) {
    const started = Date.now();
    const deadline = started + RUN_BUDGET_MS;
    const now = started + 2 * 60 * 1000;
    const isDue = (p) => p.status === "scheduled" && new Date(p.publish_at).getTime() <= now;
    const dueStories = (await storyAll()).filter(isDue).slice(0, max);
    const dueReels = (await reelAll()).filter(isDue);
    const results = [];
    for (const s of dueStories) {
        if (s.kind !== "video") {
            results.push(await publishOne(s));
            continue;
        }
        if (deadline - Date.now() < MIN_VIDEO_BUDGET_MS) {
            results.push({ id: s.id, type: "story", skipped: "sin tiempo en esta ejecución; sale en la siguiente" });
            continue;
        }
        results.push(await publishVideo(s, "story", deadline));
    }
    const reel = dueReels[0];
    if (reel) {
        if (deadline - Date.now() < MIN_VIDEO_BUDGET_MS) results.push({ id: reel.id, type: "reel", skipped: "sin tiempo en esta ejecución; sale en la siguiente" });
        else results.push(await publishVideo(reel, "reel", deadline));
    }
    const cleaned = await cleanupVideos().catch((e) => ({ error: String(e.message || e) }));
    return {
        checked_at: new Date().toISOString(),
        due: dueStories.length + (reel ? 1 : 0),
        reels_waiting: Math.max(0, dueReels.length - 1),
        results,
        cleaned_videos: cleaned,
    };
}

export async function publishNow(id) {
    const s = await storyGet(id);
    if (!s) throw new Error("No existe esa story.");
    if (s.status !== "scheduled") throw new Error(`No se puede publicar: estado ${s.status}.`);
    if (s.kind === "video") return publishVideo(s, "story", Date.now() + RUN_BUDGET_MS);
    return publishOne(s);
}

// ---------- vídeos: subidas ----------
const RUN_BUDGET_MS = 270 * 1000; // la función tiene maxDuration 300
const MIN_VIDEO_BUDGET_MS = 30 * 1000;
const POLL_MS = 5000;
const POLL_LIMIT_MS = { story: 120 * 1000, reel: 5 * 60 * 1000 };
const LIMITS_S = { story: [3, 60], reel: [3, 15 * 60] };
const CLEANUP_GRACE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 3;

/** Prepara una subida (imagen o vídeo). Para vídeo devuelve una URL PUT de un solo uso (30 min, video/mp4, máx. 60 MB). */
export async function createMediaUpload({ kind = "image", filename } = {}) {
    if (kind === "image") return createUpload(filename);
    if (kind !== "video") throw new Error('kind debe ser "image" o "video".');
    if (!connectorKey()) throw new Error("Falta CONNECTOR_KEY en Vercel.");
    const id = newId(16);
    const pathname = videoPathname(id);
    let upload;
    let blob_url;
    if (isBlobConfigured()) {
        upload = await presignVideoUpload(pathname);
        blob_url = blobPublicUrl(pathname);
    } else if (canUseMemoryVideos()) {
        const exp = Math.floor(Date.now() / 1000) + UPLOAD_TTL;
        upload = {
            upload_url: `${siteUrl()}/api/ig/upload/${id}?kind=video&exp=${exp}&sig=${sign(`${id}.${exp}.video`)}`,
            headers: { "Content-Type": "video/mp4" },
            expires_at: new Date(exp * 1000).toISOString(),
        };
        blob_url = `${siteUrl()}/api/ig/vid/${id}.mp4`;
    } else {
        throw new Error("Falta BLOB_READ_WRITE_TOKEN en Vercel: activa Vercel Blob en el proyecto (Storage → Blob).");
    }
    await mediaPut({
        media_id: id,
        kind: "video",
        storage: isBlobConfigured() ? "blob" : "memory",
        pathname,
        blob_url,
        bytes: null,
        duration_s: null,
        status: "pending",
        filename: filename ? String(filename).slice(0, 140) : null,
        created_at: new Date().toISOString(),
    });
    const curlHeaders = Object.entries(upload.headers)
        .map(([k, v]) => `-H '${k}: ${v}'`)
        .join(" ");
    return {
        media_id: id,
        kind: "video",
        upload_url: upload.upload_url,
        method: "PUT",
        headers: upload.headers,
        content_type: "video/mp4",
        max_bytes: MAX_VIDEO_BYTES,
        public_url: `${siteUrl()}/api/ig/vid/${id}.mp4`,
        expires_in_seconds: UPLOAD_TTL,
        expires_at: upload.expires_at,
        curl: `curl -X PUT ${curlHeaders} -T archivo.mp4 '${upload.upload_url}'`,
        filename: filename || null,
    };
}

/** Desarrollo sin Blob: guarda el MP4 recibido en /api/ig/upload/<id>?kind=video. */
export async function saveMemoryVideo(id, buf, info) {
    const m = await mediaGet(id);
    if (!m || m.kind !== "video") throw new Error("No existe esa subida.");
    if (mem.videos.has(id)) throw new Error("Esta subida ya se usó.");
    mem.videos.set(id, buf);
    Object.assign(m, { status: "ready", bytes: buf.length, duration_s: info.duration_s, faststart: info.faststart, validated_at: new Date().toISOString() });
    await mediaPut(m);
    return m;
}
export const loadMemoryVideo = (id) => mem.videos.get(id) || null;
export const getVideoMeta = (id) => mediaGet(id);

/**
 * Comprueba que el vídeo está subido y es un MP4 válido (ftyp, tamaño, duración del mvhd).
 * Con Blob la subida va directa a Vercel, así que la validación se hace aquí, la primera vez que se usa.
 * Si no es válido se borra el blob y se marca como rechazado.
 */
async function ensureVideoReady(media_id) {
    const m = media_id ? await mediaGet(media_id) : null;
    if (!m || m.kind !== "video") throw new Error("El vídeo no existe: créalo con create_media_upload(kind=video) y súbelo primero.");
    if (m.status === "rejected") throw new Error(`El vídeo se rechazó: ${m.error}`);
    if (m.status === "ready") return m;
    const info = await inspectRemoteMp4(m.blob_url);
    if (!info.ok) {
        if (info.status === 404) throw new Error(info.error);
        Object.assign(m, { status: "rejected", error: `${info.status}: ${info.error}`, bytes: info.bytes ?? null });
        await mediaPut(m);
        await deleteBlob(m.storage === "blob" ? m.blob_url : null).catch(() => {});
        throw new Error(`El vídeo se rechazó (${info.status}): ${info.error}`);
    }
    Object.assign(m, {
        status: "ready",
        bytes: info.bytes,
        duration_s: info.duration_s,
        faststart: info.faststart,
        range: info.range,
        validated_at: new Date().toISOString(),
    });
    await mediaPut(m);
    return m;
}

function checkDuration(m, type) {
    const [min, max] = LIMITS_S[type];
    if (m.duration_s == null) return;
    if (m.duration_s > max) throw new Error(`El vídeo dura ${m.duration_s} s; el máximo para ${type === "story" ? "una story" : "un reel"} es ${max} s.`);
    if (m.duration_s < min) throw new Error(`El vídeo dura ${m.duration_s} s; el mínimo es ${min} s.`);
}

function parseWhen(publish_at) {
    const when = new Date(publish_at);
    if (Number.isNaN(when.getTime())) throw new Error("publish_at no es una fecha válida (usa ISO 8601 con zona, p. ej. 2026-10-30T11:00:00+01:00).");
    return when;
}

const IG_USERNAME = /^[A-Za-z0-9._]{1,30}$/;

const videoFields = () => ({
    attempts: 0,
    last_error: null,
    container_id: null,
    container_created_at: null,
    ig_media_id: null,
    permalink: null,
    published_at: null,
});

// ---------- stories en vídeo ----------
async function scheduleVideoStory({ media_id, publish_at, mention, label }) {
    const m = await ensureVideoReady(media_id);
    checkDuration(m, "story");
    const when = parseWhen(publish_at);
    const username = mention ? String(mention).trim().replace(/^@/, "") : null;
    if (username && !IG_USERNAME.test(username)) throw new Error("La mención no parece un usuario de Instagram válido.");
    const story = {
        id: newId(9),
        kind: "video",
        media_id,
        video_url: m.blob_url,
        duration_s: m.duration_s,
        publish_at: when.toISOString(),
        mention: username,
        label: label ? String(label).slice(0, 140) : null,
        status: "scheduled",
        created_at: new Date().toISOString(),
        ...videoFields(),
    };
    await storyPut(story);
    return story;
}

// ---------- reels ----------
export async function scheduleReel({ media_id, publish_at, label, caption, share_to_feed = true, cover_url, thumb_offset, collaborators }) {
    const m = await ensureVideoReady(media_id);
    checkDuration(m, "reel");
    const when = parseWhen(publish_at);
    const text = caption ? String(caption) : "";
    if (text.length > 2200) throw new Error(`El caption tiene ${text.length} caracteres; el máximo es 2.200.`);
    const hashtags = text.match(/#[\p{L}\p{N}_]+/gu) || [];
    if (hashtags.length > 30) throw new Error(`El caption tiene ${hashtags.length} hashtags; el máximo es 30.`);
    const mentions = text.match(/@[A-Za-z0-9._]+/g) || [];
    if (mentions.length > 20) throw new Error(`El caption tiene ${mentions.length} menciones; el máximo es 20.`);
    if (cover_url != null && thumb_offset != null) throw new Error("Usa cover_url o thumb_offset, no los dos.");
    if (cover_url != null && !/^https:\/\/\S+$/i.test(String(cover_url))) throw new Error("cover_url debe ser una URL https pública de un JPEG.");
    let offset = null;
    if (thumb_offset != null) {
        offset = Number(thumb_offset);
        if (!Number.isInteger(offset) || offset < 0) throw new Error("thumb_offset debe ser un número entero de milisegundos.");
        if (m.duration_s != null && offset > m.duration_s * 1000) throw new Error(`thumb_offset (${offset} ms) supera la duración del vídeo.`);
    }
    const collabs = (collaborators || []).map((u) => String(u).trim().replace(/^@/, "")).filter(Boolean);
    if (collabs.length > 3) throw new Error("Instagram admite como máximo 3 colaboradores por reel.");
    for (const u of collabs) if (!IG_USERNAME.test(u)) throw new Error(`"${u}" no parece un usuario de Instagram válido.`);
    const reel = {
        id: newId(9),
        kind: "reel",
        media_id,
        video_url: m.blob_url,
        duration_s: m.duration_s,
        publish_at: when.toISOString(),
        label: label ? String(label).slice(0, 140) : null,
        caption: text,
        share_to_feed: share_to_feed !== false,
        cover_url: cover_url || null,
        thumb_offset: offset,
        collaborators: collabs,
        status: "scheduled",
        created_at: new Date().toISOString(),
        ...videoFields(),
    };
    await reelPut(reel);
    return reel;
}

export async function listReels(status) {
    const all = await reelAll();
    return status ? all.filter((r) => r.status === status) : all;
}

export async function cancelReel(id) {
    const r = await reelGet(id);
    if (!r) throw new Error("No existe ese reel.");
    if (r.status !== "scheduled") throw new Error(`No se puede cancelar: estado ${r.status}.`);
    r.status = "cancelled";
    r.cancelled_at = new Date().toISOString();
    await reelPut(r);
    return r;
}

export async function publishReelNow(id) {
    const r = await reelGet(id);
    if (!r) throw new Error("No existe ese reel.");
    if (r.status !== "scheduled") throw new Error(`No se puede publicar: estado ${r.status}.`);
    return publishVideo(r, "reel", Date.now() + RUN_BUDGET_MS);
}

// ---------- vídeos: publicación ----------
/** Cuota de publicaciones de la API en 24 h. Si no se puede leer, no bloquea. */
async function publishingQuota() {
    try {
        const d = await ig(`${igUserId()}/content_publishing_limit`, { params: { fields: "quota_usage,config" } });
        const row = d?.data?.[0] || {};
        return { usage: Number(row.quota_usage ?? 0), total: Number(row.config?.quota_total ?? Infinity) };
    } catch {
        return null;
    }
}

function containerParams(p, type) {
    if (type === "story") {
        const params = { media_type: "STORIES", video_url: p.video_url };
        if (p.mention) params.user_tags = JSON.stringify([{ username: p.mention }]);
        return params;
    }
    const params = { media_type: "REELS", video_url: p.video_url, share_to_feed: p.share_to_feed ? "true" : "false" };
    if (p.caption) params.caption = p.caption;
    if (p.cover_url) params.cover_url = p.cover_url;
    if (p.thumb_offset != null) params.thumb_offset = String(p.thumb_offset);
    if (p.collaborators?.length) params.collaborators = JSON.stringify(p.collaborators);
    return params;
}

class StillProcessing extends Error {}

async function publishVideo(p, type, deadline) {
    const put = type === "reel" ? reelPut : storyPut;
    const base = { id: p.id, type, label: p.label };
    const lock = await kvSetNx(`ig:lock:${p.id}`, "1", 600);
    if (!lock) return { ...base, skipped: "otra ejecución la está publicando" };
    try {
        const quota = await publishingQuota();
        if (quota && quota.usage >= quota.total) {
            p.last_error = `Sin cuota de publicación de Meta (${quota.usage}/${quota.total} en 24 h); se reintentará.`;
            await put(p);
            return { ...base, published: false, skipped: p.last_error };
        }
        // Reutiliza el contenedor si una ejecución anterior lo dejó procesando (caducan a las 24 h).
        const fresh = p.container_id && Date.now() - new Date(p.container_created_at).getTime() < 23 * 3600 * 1000;
        if (!fresh) {
            const container = await ig(`${igUserId()}/media`, { method: "POST", params: containerParams(p, type) });
            Object.assign(p, { container_id: container.id, container_created_at: new Date().toISOString() });
            await put(p);
        }
        const limitAt = Date.now() + POLL_LIMIT_MS[type];
        const until = Math.min(limitAt, deadline);
        let status = "IN_PROGRESS";
        while (true) {
            const st = await ig(p.container_id, { params: { fields: "status_code,status" } });
            status = st.status_code;
            if (status === "FINISHED") break;
            if (status === "ERROR" || status === "EXPIRED") {
                p.container_id = null;
                throw new Error(`Meta rechazó el vídeo (${status})${st.status ? `: ${st.status}` : ""}.`);
            }
            if (Date.now() + POLL_MS > until) break;
            await sleep(POLL_MS);
        }
        if (status !== "FINISHED") {
            if (deadline < limitAt) throw new StillProcessing();
            throw new Error(`Meta no terminó de procesar el vídeo en ${POLL_LIMIT_MS[type] / 1000} s; se reintentará.`);
        }
        const pub = await ig(`${igUserId()}/media_publish`, { method: "POST", params: { creation_id: p.container_id } });
        let permalink = null;
        try {
            permalink = (await ig(pub.id, { params: { fields: "permalink" } })).permalink || null;
        } catch {
            // El permalink es informativo: la pieza ya está publicada.
        }
        Object.assign(p, { status: "published", ig_media_id: pub.id, permalink, published_at: new Date().toISOString(), last_error: null });
        await put(p);
        return { ...base, published: true, ig_media_id: pub.id, permalink };
    } catch (e) {
        if (e instanceof StillProcessing) {
            p.last_error = "Meta sigue procesando el vídeo; se retoma en la siguiente ejecución.";
            await put(p);
            return { ...base, published: false, pending: true, container_id: p.container_id };
        }
        p.attempts = (p.attempts || 0) + 1;
        p.last_error = String(e.message || e);
        if (p.attempts >= MAX_ATTEMPTS) {
            p.status = "failed";
            p.failed_at = new Date().toISOString();
        }
        await put(p);
        return { ...base, published: false, error: p.last_error, attempts: p.attempts };
    } finally {
        await kvDel(`ig:lock:${p.id}`);
    }
}

/**
 * Borra los vídeos que ya no hacen falta: ninguna pieza programada los usa y la última terminó
 * (publicada, cancelada o fallida) hace más de 7 días. Los vídeos subidos y nunca usados, a los 7 días.
 */
async function cleanupVideos() {
    const media = await hashAll("ig:media", mem.media);
    if (!media.length) return 0;
    const pieces = [...(await storyAll()), ...(await reelAll())].filter((p) => p.kind === "video" || p.kind === "reel");
    const cutoff = Date.now() - CLEANUP_GRACE_MS;
    let cleaned = 0;
    for (const m of media) {
        const refs = pieces.filter((p) => p.media_id === m.media_id);
        if (refs.some((p) => p.status === "scheduled")) continue;
        const last = Math.max(
            new Date(m.created_at).getTime(),
            ...refs.map((p) => new Date(p.published_at || p.cancelled_at || p.failed_at || p.created_at).getTime()),
        );
        if (last > cutoff) continue;
        if (m.storage === "blob") await deleteBlob(m.blob_url);
        mem.videos.delete(m.media_id);
        await hashDel("ig:media", mem.media, m.media_id);
        cleaned++;
    }
    return cleaned;
}
