export const ADMIN_COOKIE = "aquila_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

/** Comparación en tiempo constante sin dependencias de Node (se usa también en proxy.js). */
function safeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

/** Sin ADMIN_TOKEN configurado nada es válido (el panel siempre responde 404). */
export function isValidAdminToken(candidate) {
    // trim(): al pegar en Vercel es fácil colar un espacio o salto de línea final.
    const expected = (process.env.ADMIN_TOKEN || "").trim();
    if (expected.length < 16 || typeof candidate !== "string") return false;
    candidate = candidate.trim();
    if (!candidate) return false;
    return safeEqual(candidate, expected);
}

/** Token desde ?token=, cabecera Authorization: Bearer o cookie del panel. */
export function tokenFromRequest(request) {
    const url = new URL(request.url);
    const fromQuery = url.searchParams.get("token");
    if (fromQuery) return fromQuery;
    const auth = request.headers.get("authorization") || "";
    if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
    return null;
}
