import fs from "node:fs/promises";
import path from "node:path";
import { dossiers, recipients } from "../data/dossiers";

export const SITE_URL = process.env.SITE_URL || "https://www.aquilasports.es";
export const SUPPORTED_LANGS = ["es", "en"];

/** Carpeta privada (fuera de /public) con los PDF. Incluida en el bundle vía next.config.mjs. */
export const DOSSIERS_DIR = path.join(process.cwd(), "private", "dossiers");

export const UNKNOWN_PREFIX = "unknown:";

export const getDossier = (slug) => dossiers.find((d) => d.slug === slug && d.active) || null;

export const getRecipient = (dossierSlug, slug) =>
    recipients.find((r) => r.dossier === dossierSlug && r.slug === slug) || null;

/** Slug tal y como se guarda en el registro: los desconocidos llevan prefijo "unknown:". */
export const recipientKey = (known, slug) => (known ? slug : `${UNKNOWN_PREFIX}${slug}`);

/** Slug limpio a partir de la clave registrada (quita "unknown:"). */
export const recipientSlugFromKey = (key) =>
    key.startsWith(UNKNOWN_PREFIX) ? key.slice(UNKNOWN_PREFIX.length) : key;

export const isUnknownKey = (key) => key.startsWith(UNKNOWN_PREFIX);

/** Enlace que se comparte con el club. */
export const dossierLink = (dossierSlug, recipientSlug) => `${SITE_URL}/d/${dossierSlug}/${recipientSlug}`;

/** Solo minúsculas, números y guiones; máximo 40 caracteres. */
export const normalizeSlug = (raw = "") =>
    String(raw)
        .toLowerCase()
        .replace(/[łŀ]/g, "l")
        .replace(/ø/g, "o")
        .replace(/đ/g, "d")
        .replace(/ß/g, "ss")
        .replace(/æ/g, "ae")
        .replace(/œ/g, "oe")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40)
        .replace(/-+$/, "");

/** ?lang= si es válido → idioma del destinatario → idioma del dossier. */
export function resolveLang({ query, recipient, dossier }) {
    if (query && SUPPORTED_LANGS.includes(query)) return query;
    if (recipient?.lang && SUPPORTED_LANGS.includes(recipient.lang)) return recipient.lang;
    return dossier.lang || "es";
}

/**
 * Devuelve la ruta absoluta del PDF a servir: el del idioma pedido si existe,
 * si no el archivo por defecto. `null` si no hay ninguno en disco.
 */
export async function resolvePdfPath(dossier, lang) {
    const candidates = [dossier.files?.[lang], dossier.file, dossier.files?.[dossier.lang]]
        .filter(Boolean)
        .map((name) => path.basename(name)); // nunca rutas relativas
    for (const name of candidates) {
        const full = path.join(DOSSIERS_DIR, name);
        try {
            await fs.access(full);
            return full;
        } catch {
            // probar el siguiente candidato
        }
    }
    return null;
}
