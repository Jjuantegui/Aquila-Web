import { verifyUpload, isJpeg, saveImage, MAX_IMAGE_BYTES, siteUrl } from "../../../../../lib/igStories";

export const dynamic = "force-dynamic";

/** PUT /api/ig/upload/<id>?exp=&sig= — subida firmada (la URL la da la herramienta create_image_upload del conector). */
export async function PUT(request, { params }) {
    const { id } = await params;
    const q = new URL(request.url).searchParams;
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
