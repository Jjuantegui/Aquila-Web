"use client";

import { useActionState, useState } from "react";
import CopyButton from "./CopyButton";
import { saveRecipientLabel } from "./actions";
import styles from "./aperturas.module.css";

/** Solo minúsculas, números y guiones (misma regla que en el servidor). */
const clean = (raw) =>
    raw
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
        .replace(/^-+/, "")
        .slice(0, 40);

export default function LinkBuilder({ dossiers, siteUrl, dbConnected }) {
    const [dossier, setDossier] = useState(dossiers[0]?.slug || "");
    const [slug, setSlug] = useState("");
    const [lang, setLang] = useState("");
    const [state, formAction, pending] = useActionState(saveRecipientLabel, null);

    const finalSlug = slug.replace(/-+$/, "");
    const url = finalSlug ? `${siteUrl}/d/${dossier}/${finalSlug}${lang ? `?lang=${lang}` : ""}` : "";

    return (
        <div className={styles.builder}>
            <div className={styles.builderGrid}>
                <label className={styles.field}>
                    <span>Dossier</span>
                    <select value={dossier} onChange={(e) => setDossier(e.target.value)}>
                        {dossiers.map((d) => (
                            <option key={d.slug} value={d.slug}>
                                {d.title}
                            </option>
                        ))}
                    </select>
                </label>
                <label className={styles.field}>
                    <span>Identificador del club (solo tú lo ves en la URL)</span>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(clean(e.target.value))}
                        placeholder="p. ej. oviedo, kerala, sevilla-dd"
                        autoComplete="off"
                    />
                </label>
                <label className={styles.field}>
                    <span>Idioma del PDF</span>
                    <select value={lang} onChange={(e) => setLang(e.target.value)}>
                        <option value="">Automático (según destinatario / dossier)</option>
                        <option value="es">Español</option>
                        <option value="en">English</option>
                    </select>
                </label>
            </div>

            <div className={styles.result}>
                {url ? (
                    <>
                        <code className={styles.url}>{url}</code>
                        <CopyButton text={url} label="Copiar enlace" />
                    </>
                ) : (
                    <span className={styles.muted}>Escribe un identificador para generar el enlace.</span>
                )}
            </div>
            <p className={styles.hint}>
                Este es el enlace que se manda por WhatsApp o email. Funciona aunque el identificador no esté dado de
                alta: las aperturas se registran igual y aparecen en la tabla marcadas como &quot;sin etiqueta&quot;.
            </p>

            <form action={formAction} className={styles.labelForm}>
                <input type="hidden" name="dossier" value={dossier} />
                <input type="hidden" name="slug" value={finalSlug} />
                <input type="hidden" name="lang" value={lang} />
                <label className={styles.field}>
                    <span>Etiqueta para la tabla (club / persona){lang ? ` · se guarda en ${lang.toUpperCase()}` : ""}</span>
                    <input type="text" name="label" placeholder="p. ej. Sevilla FC — Director deportivo" maxLength={120} />
                </label>
                <button type="submit" className={styles.primaryBtn} disabled={pending || !finalSlug || !dbConnected}>
                    {pending ? "Guardando…" : "Guardar etiqueta"}
                </button>
            </form>
            {!dbConnected && (
                <p className={styles.hint}>Sin base de datos conectada: los enlaces funcionan, pero las etiquetas no se pueden guardar.</p>
            )}
            {state?.message && (
                <p className={state.ok ? styles.okMsg : styles.errMsg} role="status">
                    {state.message}
                </p>
            )}
        </div>
    );
}
