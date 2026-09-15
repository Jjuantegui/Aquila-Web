import { createHash } from "node:crypto";

/**
 * Rastreadores y apps de mensajería que piden el enlace para generar una
 * vista previa. No cuentan como apertura real (se guardan con isBot = true).
 */
const BOT_PATTERNS = [
    "WhatsApp",
    "LinkedInBot",
    "facebookexternalhit",
    "Twitterbot",
    "TelegramBot",
    "Slackbot",
    "Discordbot",
    "Googlebot",
    "bingbot",
    "HeadlessChrome",
    "curl",
    "python-requests",
];

export function isBotUserAgent(ua = "") {
    const lower = ua.toLowerCase();
    return BOT_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
}

export function deviceFromUserAgent(ua = "") {
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
    if (/Mobi|iPhone|iPod|Android|BlackBerry|Opera Mini|IEMobile/i.test(ua)) return "mobile";
    return "desktop";
}

/** IP del cliente a partir de las cabeceras de Vercel / proxies. */
export function clientIp(headers) {
    const forwarded = headers.get("x-forwarded-for") || "";
    const first = forwarded.split(",")[0].trim();
    return first || headers.get("x-real-ip") || "";
}

/** SHA-256(sal + ip), truncado. Nunca se guarda la IP en claro. */
export function hashIp(ip) {
    if (!ip) return null;
    const salt = process.env.IP_SALT || "";
    return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/** Vercel envía la ciudad URL-encoded (p. ej. "Oviedo" o "M%C3%A1laga"). */
export function decodeHeader(value) {
    if (!value) return null;
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}
