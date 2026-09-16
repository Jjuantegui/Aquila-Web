"use client";

import { useActionState, useState } from "react";
import CopyButton from "./CopyButton";
import { bulkCreateRecipients } from "./actions";
import styles from "./aperturas.module.css";

const LANG_NAMES = { en: "English", es: "Español" };

/** Descarga un CSV (separador ";" y BOM para que Excel en español lo abra bien). */
function downloadCsv(rows, filename) {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [["Club", "Enlace", "Idioma", "Identificador"].join(";")];
    rows.forEach((r) => lines.push([r.label, r.url, r.lang.toUpperCase(), r.slug].map(esc).join(";")));
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/**
 * Alta de enlaces en bloque: un club por línea → un enlace por club, con su
 * etiqueta e idioma guardados. Pensado para atacar un mercado entero de una vez.
 */
export default function BulkBuilder({ dossiers, dbConnected }) {
    const [dossier, setDossier] = useState(dossiers[0]?.slug || "");
    const [lang, setLang] = useState("en");
    const [prefix, setPrefix] = useState("");
    const [lines, setLines] = useState("");
    const [state, formAction, pending] = useActionState(bulkCreateRecipients, null);

    const count = lines.split(/\r?\n/).filter((l) => l.trim()).length;
    const created = state?.ok ? state.created : [];
    const allText = created.map((r) => `${r.label}\t${r.url}`).join("\n");

    return (
        <div className={styles.builder}>
            <form action={formAction} className={styles.builder}>
                <div className={styles.bulkGrid}>
                    <label className={styles.field}>
                        <span>Dossier</span>
                        <select name="dossier" value={dossier} onChange={(e) => setDossier(e.target.value)}>
                            {dossiers.map((d) => (
                                <option key={d.slug} value={d.slug}>
                                    {d.title}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={styles.field}>
                        <span>Código de mercado (prefijo del enlace, opcional)</span>
                        <input
                            type="text"
                            name="prefix"
                            value={prefix}
                            onChange={(e) => setPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 8))}
                            placeholder="p. ej. pl, ind, mx"
                            autoComplete="off"
                        />
                    </label>
                    <fieldset className={styles.field}>
                        <span>Idioma del PDF</span>
                        <div className={styles.radioRow}>
                            {["en", "es"].map((l) => (
                                <label key={l} className={styles.radio}>
                                    <input type="radio" name="lang" value={l} checked={lang === l} onChange={() => setLang(l)} />
                                    {LANG_NAMES[l]}
                                    {l === "en" ? " (extranjero)" : " (España)"}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                </div>

                <label className={styles.field}>
                    <span>Clubes, uno por línea (puedes añadir el cargo: &quot;Legia Warszawa — Sporting director&quot;)</span>
                    <textarea
                        name="lines"
                        value={lines}
                        onChange={(e) => setLines(e.target.value)}
                        placeholder={"Legia Warszawa\nLech Poznań\nRaków Częstochowa\nJagiellonia Białystok"}
                        rows={8}
                    />
                </label>

                <div className={styles.btnRow}>
                    <button type="submit" className={styles.primaryBtn} disabled={pending || !count || !dbConnected}>
                        {pending ? "Creando…" : `Crear ${count || ""} enlace${count === 1 ? "" : "s"}`.replace("  ", " ")}
                    </button>
                    <span className={styles.muted}>
                        {count ? `${count} club${count === 1 ? "" : "es"} · enlaces tipo ` : "Enlaces tipo "}
                        <code>/d/{dossier}/{prefix ? `${prefix}-` : ""}legia-warszawa</code> · PDF en {LANG_NAMES[lang]}
                    </span>
                </div>
            </form>

            {!dbConnected && (
                <p className={styles.hint}>Sin base de datos conectada: no se pueden guardar destinatarios en bloque.</p>
            )}
            {state?.message && (
                <p className={state.ok ? styles.okMsg : styles.errMsg} role="status">
                    {state.message}
                </p>
            )}

            {created.length > 0 && (
                <>
                    <div className={styles.btnRow}>
                        <CopyButton text={allText} label="Copiar todos (club + enlace)" />
                        <button
                            type="button"
                            className={styles.copyBtn}
                            onClick={() => downloadCsv(created, `enlaces-${state.dossier}-${prefix || state.lang}.csv`)}
                        >
                            Descargar Excel (CSV)
                        </button>
                    </div>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Club</th>
                                    <th>Enlace</th>
                                    <th>Idioma</th>
                                </tr>
                            </thead>
                            <tbody>
                                {created.map((r) => (
                                    <tr key={r.slug}>
                                        <td>
                                            <div className={styles.labelCell}>
                                                <span>{r.label}</span>
                                                <span className={styles.slug}>
                                                    {r.slug}
                                                    {r.existed ? " · ya existía" : ""}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.linkCell}>
                                                <code className={styles.urlSmall}>{r.url}</code>
                                                <CopyButton text={r.url} />
                                            </div>
                                        </td>
                                        <td>{r.lang.toUpperCase()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {state.skipped?.length > 0 && (
                        <p className={styles.hint}>Omitidas: {state.skipped.join(" · ")}</p>
                    )}
                </>
            )}

            <p className={styles.hint}>
                Cada club recibe su propio enlace y aparece con su nombre en la tabla de arriba en cuanto lo abra. Manda el
                enlace por WhatsApp o email tal cual; el idioma ya va guardado, no hace falta añadir nada.
            </p>
        </div>
    );
}
