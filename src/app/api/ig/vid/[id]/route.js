import { getVideoMeta, loadMemoryVideo } from "../../../../../lib/igStories";

export const dynamic = "force-dynamic";

/**
 * GET /api/ig/vid/<id>.mp4 — vídeo público para Meta. Con Blob redirige (302) a la URL del blob,
 * que ya sirve video/mp4 con Range; en desarrollo lo sirve desde memoria con soporte de Range.
 */
async function serve(request, { params }, headOnly) {
    const { id } = await params;
    const clean = String(id).replace(/\.mp4$/i, "");
    if (!/^[A-Za-z0-9_-]{10,40}$/.test(clean)) return new Response("Not found", { status: 404 });
    const meta = await getVideoMeta(clean);
    if (!meta || meta.kind !== "video" || meta.status === "rejected") return new Response("Not found", { status: 404 });
    if (meta.storage === "blob") return Response.redirect(meta.blob_url, 302);
    const buf = loadMemoryVideo(clean);
    if (!buf) return new Response("Not found", { status: 404 });
    const headers = {
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400",
        "X-Robots-Tag": "noindex",
    };
    const m = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") || "");
    if (m && (m[1] || m[2])) {
        const start = m[1] ? Number(m[1]) : Math.max(0, buf.length - Number(m[2]));
        const end = m[1] && m[2] ? Math.min(Number(m[2]), buf.length - 1) : buf.length - 1;
        if (start >= buf.length || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${buf.length}` } });
        const part = buf.subarray(start, end + 1);
        return new Response(headOnly ? null : part, {
            status: 206,
            headers: { ...headers, "Content-Length": String(part.length), "Content-Range": `bytes ${start}-${end}/${buf.length}` },
        });
    }
    return new Response(headOnly ? null : buf, { headers: { ...headers, "Content-Length": String(buf.length) } });
}

export const GET = (request, ctx) => serve(request, ctx, false);
export const HEAD = (request, ctx) => serve(request, ctx, true);
