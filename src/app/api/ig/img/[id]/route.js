import { loadImage } from "../../../../../lib/igStories";

export const dynamic = "force-dynamic";

/** GET /api/ig/img/<id>.jpg — sirve la imagen para que Meta la descargue al publicar. El id es aleatorio y no se enlaza en la web. */
export async function GET(request, { params }) {
    const { id } = await params;
    const clean = String(id).replace(/\.jpe?g$/i, "");
    if (!/^[A-Za-z0-9_-]{10,40}$/.test(clean)) return new Response("Not found", { status: 404 });
    const buf = await loadImage(clean);
    if (!buf) return new Response("Not found", { status: 404 });
    return new Response(buf, {
        headers: {
            "Content-Type": "image/jpeg",
            "Content-Length": String(buf.length),
            "Cache-Control": "public, max-age=86400",
            "X-Robots-Tag": "noindex",
        },
    });
}
