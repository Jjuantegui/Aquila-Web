import { Redis } from "@upstash/redis";

/**
 * Cliente Upstash Redis con modo "memoria" de respaldo.
 *
 * Vercel crea las variables al conectar Upstash desde Storage → Marketplace.
 * Según cómo se conecte pueden llamarse UPSTASH_REDIS_REST_* o KV_REST_API_*;
 * se aceptan ambas. Sin ellas, `getRedis()` devuelve null y los módulos que
 * lo usan guardan en memoria (solo para desarrollo local; se pierde al reiniciar).
 */
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

let client = null;

export const isDbConnected = () => Boolean(url && token);

export function getRedis() {
    if (!isDbConnected()) return null;
    if (!client) {
        client = new Redis({ url, token, automaticDeserialization: true });
    }
    return client;
}

/**
 * Almacén en memoria para desarrollo sin Redis. Imita el subconjunto de
 * comandos que usa src/lib/opens.js (listas, hashes y claves con TTL).
 */
// En globalThis para que lo compartan todos los bundles del proceso (cada ruta
// de Next se empaqueta por separado y duplicaría un Map a nivel de módulo).
const mem = (globalThis.__aquilaMemoryStore ??= { lists: new Map(), hashes: new Map(), keys: new Map() });

export const memoryStore = {
    lpush(key, value) {
        const list = mem.lists.get(key) || [];
        list.unshift(value);
        mem.lists.set(key, list);
        return list.length;
    },
    ltrim(key, start, stop) {
        const list = mem.lists.get(key) || [];
        mem.lists.set(key, list.slice(start, stop + 1));
    },
    lrange(key, start, stop) {
        const list = mem.lists.get(key) || [];
        return list.slice(start, stop === -1 ? undefined : stop + 1);
    },
    hgetall(key) {
        const h = mem.hashes.get(key);
        return h ? { ...h } : null;
    },
    hset(key, fields) {
        const h = mem.hashes.get(key) || {};
        Object.assign(h, fields);
        mem.hashes.set(key, h);
    },
    hincrby(key, field, by) {
        const h = mem.hashes.get(key) || {};
        h[field] = Number(h[field] || 0) + by;
        mem.hashes.set(key, h);
        return h[field];
    },
    hsetnx(key, field, value) {
        const h = mem.hashes.get(key) || {};
        if (h[field] !== undefined) return 0;
        h[field] = value;
        mem.hashes.set(key, h);
        return 1;
    },
    hdel(key, field) {
        const h = mem.hashes.get(key);
        if (h) delete h[field];
    },
    /** SET NX EX: devuelve "OK" si la clave no existía (o había caducado). */
    setNxEx(key, value, seconds) {
        const now = Date.now();
        const existing = mem.keys.get(key);
        if (existing && existing.expires > now) return null;
        mem.keys.set(key, { value, expires: now + seconds * 1000 });
        return "OK";
    },
};
