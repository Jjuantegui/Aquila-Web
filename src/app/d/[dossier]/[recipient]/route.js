import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { getDossier, recipientKey, resolveLang, resolvePdfPath } from "../../../../lib/dossiers";
import { recordOpen, findRecipient } from "../../../../lib/opens";
import { isBotUserAgent, deviceFromUserAgent, clientIp, hashIp, decodeHeader } from "../../../../lib/detect";

export const dynamic = "force-dynamic";

/**
 * GET /d/<dossier>/<destinatario>[?lang=es|en]
 *
 * Sirve el PDF inline y registra la apertura. Un destinatario desconocido no
 * da 404: se sirve igual y se registra como "unknown:<slug>" para no perder
 * aperturas de enlaces reenviados. El registro ocurre después de responder
 * (`after`) y nunca impide servir el PDF.
 */
async function handle(request, ctx, method) {
    const { dossier: dossierSlug, recipient: recipientSlug } = await ctx.params;
    const dossier = getDossier(dossierSlug);
    if (!dossier) return new Response("Not found", { status: 404 });

    // Del repo o dado de alta desde el panel; un fallo de Redis no impide servir el PDF.
    const recipient = await findRecipient(dossierSlug, recipientSlug).catch(() => null);
    const lang = resolveLang({ query: new URL(request.url).searchParams.get("lang"), recipient, dossier });

    const pdfPath = await resolvePdfPath(dossier, lang);
    if (!pdfPath) {
        console.error(`[dossiers] no hay PDF en private/dossiers para "${dossierSlug}" (${lang})`);
        return new Response("Not found", { status: 404 });
    }

    const event = buildEvent(request, { method, dossierSlug, recipientSlug, known: Boolean(recipient), lang });
    after(() => recordOpen(event));

    const body = method === "HEAD" ? null : await fs.readFile(pdfPath);
    const filename = dossier.downloadName || `${dossierSlug}.pdf`;
    return new Response(body, {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${filename}"`,
            "Cache-Control": "no-store, max-age=0",
            "X-Robots-Tag": "noindex, nofollow",
            ...(body ? { "Content-Length": String(body.length) } : {}),
        },
    });
}

function buildEvent(request, { method, dossierSlug, recipientSlug, known, lang }) {
    const h = request.headers;
    const ua = h.get("user-agent") || "";
    // Algunos visores piden el PDF por trozos (Range) tras la primera petición: no es otra apertura.
    const range = h.get("range");
    const continuation = Boolean(range) && !/^bytes=0-/.test(range);

    return {
        id: randomUUID(),
        ts: new Date().toISOString(),
        dossier: dossierSlug,
        recipient: recipientKey(known, recipientSlug),
        lang,
        ip: hashIp(clientIp(h)),
        country: h.get("x-vercel-ip-country") || null,
        region: h.get("x-vercel-ip-country-region") || null,
        city: decodeHeader(h.get("x-vercel-ip-city")),
        ua: ua.slice(0, 300),
        device: deviceFromUserAgent(ua),
        isBot: method === "HEAD" || isBotUserAgent(ua),
        dup: continuation || undefined,
        referer: h.get("referer") || null,
    };
}

export async function GET(request, ctx) {
    return handle(request, ctx, "GET");
}

// Las apps de mensajería suelen hacer HEAD para la vista previa: se registra como bot.
export async function HEAD(request, ctx) {
    return handle(request, ctx, "HEAD");
}
