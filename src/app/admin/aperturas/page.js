import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { dossiers } from "../../../data/dossiers";
import { ADMIN_COOKIE, isValidAdminToken } from "../../../lib/adminAuth";
import { SITE_URL } from "../../../lib/dossiers";
import { getSummary, listEvents, isDbConnected } from "../../../lib/opens";
import { formatMadrid, deviceLabel, placeLabel } from "../../../lib/format";
import CopyButton from "./CopyButton";
import LinkBuilder from "./LinkBuilder";
import BulkBuilder from "./BulkBuilder";
import styles from "./aperturas.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Aperturas de dossieres · Aquila Sports Management",
    robots: "noindex",
};

/**
 * /admin/aperturas — panel privado con el historial de aperturas.
 * Acceso: ?token=<ADMIN_TOKEN> (src/proxy.js lo convierte en cookie) o la
 * cookie `aquila_admin`. Sin token válido → 404.
 */
export default async function AperturasPage({ searchParams }) {
    const sp = await searchParams;
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value || sp?.token;
    if (!isValidAdminToken(token)) notFound();

    const showBots = sp?.bots === "1";
    const activeDossiers = dossiers.filter((d) => d.active);
    const [summary, events] = await Promise.all([
        getSummary({ dossiers: activeDossiers }),
        listEvents({ limit: 200, includeBots: showBots }),
    ]);
    const dbConnected = isDbConnected();
    const totalHuman = summary.reduce((n, r) => n + r.count, 0);

    return (
        <div className="container">
            <header className={styles.pageHeader}>
                <p className={styles.eyebrow}>Aquila Sports Management</p>
                <h1 className={styles.title}>Aperturas de dossieres</h1>
                <p className={styles.lead}>
                    {activeDossiers.length} dossier{activeDossiers.length === 1 ? "" : "es"} · {summary.length} enlace
                    {summary.length === 1 ? "" : "s"} · {totalHuman} apertura{totalHuman === 1 ? "" : "s"} humana
                    {totalHuman === 1 ? "" : "s"} · hora de Madrid
                </p>
                {!dbConnected && (
                    <div className={styles.banner}>
                        <strong>Sin base de datos conectada.</strong> Los enlaces funcionan y sirven el PDF, pero las
                        aperturas solo se guardan en memoria y se pierden al reiniciar. Conecta Upstash Redis en Vercel
                        (Storage → Marketplace) y añade <code>UPSTASH_REDIS_REST_URL</code> y{" "}
                        <code>UPSTASH_REDIS_REST_TOKEN</code>.
                    </div>
                )}
            </header>

            {/* 1. Resumen por dossier y destinatario */}
            {activeDossiers.map((d) => {
                const rows = summary.filter((r) => r.dossier === d.slug);
                return (
                    <section key={d.slug} className={styles.card}>
                        <div className={styles.cardHead}>
                            <div>
                                <h2 className={styles.h2}>{d.title}</h2>
                                <p className={styles.muted}>
                                    <code>{SITE_URL}/d/{d.slug}/…</code> · PDF por defecto en {d.lang.toUpperCase()}
                                </p>
                            </div>
                            <span className={styles.pill}>{rows.reduce((n, r) => n + r.count, 0)} aperturas</span>
                        </div>
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Club / etiqueta</th>
                                        <th>Enlace</th>
                                        <th className={styles.num}>Aperturas</th>
                                        <th>Primera</th>
                                        <th>Última</th>
                                        <th>Última ciudad / país</th>
                                        <th>Dispositivo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className={styles.empty}>
                                                Todavía no hay destinatarios ni aperturas para este dossier.
                                            </td>
                                        </tr>
                                    )}
                                    {rows.map((r) => (
                                        <tr key={`${r.dossier}|${r.recipientKey}`} className={r.unknown ? styles.unknownRow : ""}>
                                            <td>
                                                <div className={styles.labelCell}>
                                                    <span>{r.label}</span>
                                                    <span className={styles.slug}>
                                                        {r.recipient}
                                                        {r.lang ? ` · ${r.lang.toUpperCase()}` : ""}
                                                        {r.unknown ? " · no dado de alta" : ""}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.linkCell}>
                                                    <code className={styles.urlSmall}>{r.url}</code>
                                                    <CopyButton text={r.url} />
                                                </div>
                                            </td>
                                            <td className={styles.num}>
                                                <strong>{r.count}</strong>
                                            </td>
                                            <td className={styles.nowrap}>{formatMadrid(r.first)}</td>
                                            <td className={styles.nowrap}>{formatMadrid(r.last)}</td>
                                            <td>{placeLabel(r.lastEvent)}</td>
                                            <td>{r.lastEvent ? deviceLabel(r.lastEvent.device) : "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                );
            })}

            {/* 3a. Un mercado entero de una vez */}
            <section className={styles.card}>
                <div className={styles.cardHead}>
                    <div>
                        <h2 className={styles.h2}>Generar enlaces en bloque</h2>
                        <p className={styles.muted}>
                            Pega la lista de clubes de un mercado y sale un enlace exclusivo por club, con su nombre e idioma
                            guardados. Por defecto en inglés.
                        </p>
                    </div>
                </div>
                <BulkBuilder dossiers={activeDossiers} dbConnected={dbConnected} />
            </section>

            {/* 3b. Crear un enlace suelto */}
            <section className={styles.card}>
                <div className={styles.cardHead}>
                    <div>
                        <h2 className={styles.h2}>Crear un enlace para un club</h2>
                        <p className={styles.muted}>Un enlace distinto por club o persona. No hace falta tocar el código.</p>
                    </div>
                </div>
                <LinkBuilder dossiers={activeDossiers} siteUrl={SITE_URL} dbConnected={dbConnected} />
            </section>

            {/* 2. Historial completo */}
            <section className={styles.card}>
                <div className={styles.cardHead}>
                    <div>
                        <h2 className={styles.h2}>Historial</h2>
                        <p className={styles.muted}>Últimos 200 eventos, los más recientes primero.</p>
                    </div>
                    <Link
                        href={showBots ? "/admin/aperturas" : "/admin/aperturas?bots=1"}
                        className={`${styles.toggle} ${showBots ? styles.toggleOn : ""}`}
                        prefetch={false}
                    >
                        <span className={styles.toggleDot} />
                        {showBots ? "Ocultar bots y duplicados" : "Mostrar bots"}
                    </Link>
                </div>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Dossier</th>
                                <th>Destinatario</th>
                                <th>Idioma</th>
                                <th>Ciudad / país</th>
                                <th>Dispositivo</th>
                                <th>Tipo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.length === 0 && (
                                <tr>
                                    <td colSpan={7} className={styles.empty}>
                                        Sin aperturas todavía.
                                    </td>
                                </tr>
                            )}
                            {events.map((e) => {
                                const row = summary.find((r) => r.dossier === e.dossier && r.recipientKey === e.recipient);
                                const kind = e.isBot ? "Bot / vista previa" : e.dup ? "Duplicado" : "Apertura";
                                return (
                                    <tr key={e.id} className={e.isBot || e.dup ? styles.botRow : ""}>
                                        <td className={styles.nowrap}>{formatMadrid(e.ts)}</td>
                                        <td>{e.dossier}</td>
                                        <td>
                                            <div className={styles.labelCell}>
                                                <span>{row?.label || e.recipient}</span>
                                                <span className={styles.slug}>{e.recipient}</span>
                                            </div>
                                        </td>
                                        <td>{(e.lang || "").toUpperCase()}</td>
                                        <td>{placeLabel(e)}</td>
                                        <td title={e.ua || ""}>{deviceLabel(e.device)}</td>
                                        <td>
                                            <span className={e.isBot || e.dup ? styles.tagBot : styles.tagHuman}>{kind}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p className={styles.hint}>
                    La primera &quot;apertura&quot; sin ciudad y marcada como bot suele ser la vista previa de WhatsApp o
                    LinkedIn al pegar el enlace, no el club. Un &quot;duplicado&quot; es el mismo visitante recargando el PDF
                    en menos de dos minutos.
                </p>
            </section>
        </div>
    );
}
