"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, isValidAdminToken } from "../../../lib/adminAuth";
import { getDossier, getRecipient, normalizeSlug, dossierLink, SUPPORTED_LANGS } from "../../../lib/dossiers";
import { setLabel, bulkSetRecipients, getRecipientMeta } from "../../../lib/opens";

const MAX_BULK = 200;

async function checkSession() {
    const cookieStore = await cookies();
    return isValidAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

const pickLang = (raw) => (SUPPORTED_LANGS.includes(raw) ? raw : null);

/** Guarda (o borra, si la etiqueta va vacía) la etiqueta de un destinatario en Redis. */
export async function saveRecipientLabel(_prevState, formData) {
    if (!(await checkSession())) return { ok: false, message: "Sesión no válida. Vuelve a entrar con el token." };

    const dossierSlug = String(formData.get("dossier") || "");
    const slug = normalizeSlug(formData.get("slug"));
    const label = String(formData.get("label") || "").trim().slice(0, 120);
    const lang = pickLang(String(formData.get("lang") || ""));

    if (!getDossier(dossierSlug)) return { ok: false, message: "Dossier no válido." };
    if (!slug) return { ok: false, message: "Escribe un identificador (solo letras, números y guiones)." };

    try {
        await setLabel(dossierSlug, slug, label, lang);
    } catch (err) {
        console.error("[dossiers] no se pudo guardar la etiqueta:", err?.message || err);
        return { ok: false, message: "No se pudo guardar. ¿Está conectada la base de datos?" };
    }

    revalidatePath("/admin/aperturas");
    return {
        ok: true,
        message: label ? `Etiqueta guardada para "${slug}".` : `Etiqueta de "${slug}" eliminada.`,
        slug,
    };
}

/**
 * Alta en bloque desde el panel: una línea por club. El slug sale del nombre
 * (con el código de mercado como prefijo, p. ej. "pl-legia-warszawa") y el
 * idioma se guarda con el destinatario para que el enlace no necesite ?lang=.
 */
export async function bulkCreateRecipients(_prevState, formData) {
    if (!(await checkSession())) return { ok: false, message: "Sesión no válida. Vuelve a entrar con el token." };

    const dossierSlug = String(formData.get("dossier") || "");
    if (!getDossier(dossierSlug)) return { ok: false, message: "Dossier no válido." };

    const lang = pickLang(String(formData.get("lang") || "")) || "en";
    const prefix = normalizeSlug(formData.get("prefix")).slice(0, 8).replace(/-+$/, "");
    const lines = String(formData.get("lines") || "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    if (!lines.length) return { ok: false, message: "Pega al menos un club (uno por línea)." };
    if (lines.length > MAX_BULK) return { ok: false, message: `Máximo ${MAX_BULK} clubes por tanda (has pegado ${lines.length}).` };

    let existing = {};
    try {
        existing = await getRecipientMeta(dossierSlug);
    } catch {
        // sin lectura previa solo perdemos el aviso de "ya existía"
    }

    const seen = new Set();
    const created = [];
    const skipped = [];
    for (const line of lines) {
        const label = line.slice(0, 120);
        // El identificador sale solo del nombre del club; el cargo ("— DD", ", scout") se queda en la etiqueta.
        const club = label.split(/\s+[—–-]\s+|,|\(|\|/)[0].trim() || label;
        const slug = normalizeSlug(prefix ? `${prefix}-${club}` : club);
        if (!slug || seen.has(slug)) {
            skipped.push(line);
            continue;
        }
        seen.add(slug);
        created.push({
            slug,
            label,
            lang,
            url: dossierLink(dossierSlug, slug),
            existed: Boolean(existing[slug] || getRecipient(dossierSlug, slug)),
        });
    }

    try {
        await bulkSetRecipients(dossierSlug, created);
    } catch (err) {
        console.error("[dossiers] no se pudo guardar el bloque:", err?.message || err);
        return { ok: false, message: "No se pudo guardar. ¿Está conectada la base de datos?" };
    }

    revalidatePath("/admin/aperturas");
    const updated = created.filter((c) => c.existed).length;
    return {
        ok: true,
        message:
            `${created.length} enlace${created.length === 1 ? "" : "s"} listo${created.length === 1 ? "" : "s"} en ${lang.toUpperCase()}` +
            (updated ? ` (${updated} ya existía${updated === 1 ? "" : "n"}; etiqueta actualizada)` : "") +
            (skipped.length ? ` · ${skipped.length} línea${skipped.length === 1 ? "" : "s"} omitida${skipped.length === 1 ? "" : "s"} por repetida o vacía` : "") +
            ".",
        dossier: dossierSlug,
        lang,
        created,
        skipped,
    };
}
