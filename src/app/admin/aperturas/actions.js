"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, isValidAdminToken } from "../../../lib/adminAuth";
import { getDossier, normalizeSlug } from "../../../lib/dossiers";
import { setLabel } from "../../../lib/opens";

/** Guarda (o borra, si la etiqueta va vacía) la etiqueta de un destinatario en Redis. */
export async function saveRecipientLabel(_prevState, formData) {
    const cookieStore = await cookies();
    if (!isValidAdminToken(cookieStore.get(ADMIN_COOKIE)?.value)) {
        return { ok: false, message: "Sesión no válida. Vuelve a entrar con el token." };
    }

    const dossierSlug = String(formData.get("dossier") || "");
    const slug = normalizeSlug(formData.get("slug"));
    const label = String(formData.get("label") || "").trim().slice(0, 120);

    if (!getDossier(dossierSlug)) return { ok: false, message: "Dossier no válido." };
    if (!slug) return { ok: false, message: "Escribe un identificador (solo letras, números y guiones)." };

    try {
        await setLabel(dossierSlug, slug, label);
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
