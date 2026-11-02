import { verifyUpload, isJpeg, saveImage, MAX_IMAGE_BYTES, siteUrl, saveMemoryVideo } from "../../../../../lib/igStories";
import { MAX_VIDEO_BYTES, canUseMemoryVideos, inspectMp4 } from "../../../../../lib/igVideo";

export const dynamic = "force-dynamic";

/** PUT /api/ig/upload/<id>?exp=&sig= — subida firmada (la URL la da la herramienta create_image_upload del conector). */
export async function PUT(request, { params }) {
    const { id } = await params;
    const q = new URL(request.url).searchParams;
    if (q.get("kind") === "video") return putVideo(request, id, q);
    if (!verifyUpload(id, q.get("exp"), q.get("sig"))) return Response.json({ error: "Not found" }, { status: 404 });
    const buf = Buffer.from(await request.arrayBuffer());
    if (buf.length > MAX_IMAGE_BYTES) return Response.json({ error: `La imagen pesa ${Math.round(buf.length / 1024)} KB; el máximo es ${MAX_IMAGE_BYTES / 1024} KB.` }, { status: 413 });
    if (!isJpeg(buf)) return Response.json({ error: "Solo se aceptan JPEG (Instagram no acepta PNG por la API)." }, { status: 415 });
    try {
        await saveImage(id, buf);
    } catch (e) {
        return Response.json({ error: String(e.message || e) }, { status: 409 });
    }
    return Response.json({ ok: true, image_id: id, bytes: buf.length, public_url: `${siteUrl()}/api/ig/img/${id}.jpg` });
}

/**
 * Vídeo en desarrollo (sin Vercel Blob): lee el cuerpo por trozos cortando al pasar de 60 MB
 * y valida el MP4 antes de guardarlo. En producción el MP4 va directo a Blob con la URL prefirmada.
 */
async function putVideo(request, id, q) {
    if (!canUseMemoryVideos() || !verifyUpload(id, q.get("exp"), q.get("sig"), "video")) return Response.json({ error: "Not found" }, { status: 404 });
    const type = (request.headers.get("content-type") || "").split(";")[0].trim();
    if (type !== "video/mp4") return Response.json({ error: "Envía el vídeo con Content-Type video/mp4." }, { status: 415 });
    const declared = Number(request.headers.get("content-length") || 0);
    if (declared > MAX_VIDEO_BYTES) return Response.json({ error: "El vídeo supera los 60 MB." }, { status: 413 });
    const chunks = [];
    let total = 0;
    if (request.body) {
        const reader = request.body.getReader();
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.length;
            if (total > MAX_VIDEO_BYTES) {
                await reader.cancel();
                return Response.json({ error: "El vídeo supera los 60 MB." }, { status: 413 });
            }
            chunks.push(value);
        }
    }
    const buf = Buffer.concat(chunks);
    const info = await inspectMp4(async (off, len) => buf.subarray(off, off + len), buf.length);
    if (!info.ok) return Response.json({ error: info.error }, { status: info.status });
    try {
        const m = await saveMemoryVideo(id, buf, info);
        return Response.json({ ok: true, media_id: id, bytes: m.bytes, duration_s: m.duration_s, public_url: `${siteUrl()}/api/ig/vid/${id}.mp4` });
    } catch (e) {
        return Response.json({ error: String(e.message || e) }, { status: 409 });
    }
}
