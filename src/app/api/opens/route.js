import { dossiers } from "../../../data/dossiers";
import { isValidAdminToken, tokenFromRequest } from "../../../lib/adminAuth";
import { listEvents, getSummary, isDbConnected, publicEvent } from "../../../lib/opens";

export const dynamic = "force-dynamic";

/**
 * GET /api/opens?token=<ADMIN_TOKEN>[&since=<ISO>][&dossier=rivera][&limit=500]
 *
 * Pensada para automatizaciones (reporte matinal de outreach). Devuelve solo
 * aperturas humanas (sin vistas previas de mensajería ni duplicados) y el
 * resumen por destinatario. Nunca incluye IPs, ni siquiera hasheadas.
 * Sin token válido responde 404 para no anunciar que existe.
 */
async function fingerprint(value) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(buf).slice(0, 6), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function GET(request) {
    // Diagnóstico temporal: longitud y huella de ADMIN_TOKEN (nunca el valor).
    if (new URL(request.url).searchParams.has("diag")) {
        const raw = process.env.ADMIN_TOKEN || "";
        console.log("[opens diag]", JSON.stringify({ set: !!raw, len: raw.length, trimmedLen: raw.trim().length, fp: await fingerprint(raw.trim()), head: raw.slice(0, 2), tail: raw.slice(-2) }));
    }
    if (!isValidAdminToken(tokenFromRequest(request))) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    const params = new URL(request.url).searchParams;
    const dossier = params.get("dossier") || undefined;
    const sinceRaw = params.get("since");
    const since = sinceRaw && !Number.isNaN(new Date(sinceRaw).getTime()) ? new Date(sinceRaw).toISOString() : null;
    const limit = Math.min(Math.max(Number(params.get("limit")) || 500, 1), 2000);

    const [events, summary] = await Promise.all([
        listEvents({ limit, includeBots: false, dossier, since: since || undefined }),
        getSummary({ dossier, dossiers }),
    ]);

    return Response.json(
        {
            ok: true,
            generatedAt: new Date().toISOString(),
            timezoneNote: "Los campos ts/first/last son ISO en UTC; mostrar en Europe/Madrid.",
            db: isDbConnected() ? "redis" : "memory",
            since,
            dossier: dossier || null,
            summary: summary.map((r) => ({
                dossier: r.dossier,
                recipient: r.recipient,
                unknown: r.unknown,
                label: r.label,
                url: r.url,
                count: r.count,
                first: r.first,
                last: r.last,
                lastCity: r.lastEvent?.city || null,
                lastCountry: r.lastEvent?.country || null,
                lastDevice: r.lastEvent?.device || null,
            })),
            events: events.map(publicEvent),
        },
        { headers: { "Cache-Control": "no-store" } }
    );
}
