import { issueSignedToken, presignUrl, parseStoreIdFromDelegationToken, del } from "@vercel/blob";

/**
 * Vídeos de Instagram (stories en vídeo y reels) en Vercel Blob.
 *
 * Los MP4 pesan 10–25 MB: no caben en Redis ni pasan por una función de Vercel (límite de 4,5 MB
 * por petición). El Mac de Joaquín los sube directamente a Blob con una URL PUT prefirmada
 * (30 minutos, una sola vez, solo video/mp4, máx. 60 MB) y Meta los descarga de la URL pública
 * del blob, que ya sirve Content-Type video/mp4 y Range.
 *
 *   BLOB_READ_WRITE_TOKEN  lo crea Vercel al activar Blob en el proyecto (Storage → Blob)
 *
 * Sin token y fuera de Vercel (desarrollo) se usa un almacén en memoria y la subida va a
 * /api/ig/upload/<id>?kind=video, que valida el MP4 al recibirlo.
 */

export const MAX_VIDEO_BYTES = 60 * 1024 * 1024;
const PRESIGN_TTL_MS = 30 * 60 * 1000;
const BLOB_API_VERSION = "13";

function blobToken() {
    return (process.env.BLOB_READ_WRITE_TOKEN || "").trim();
}
export const isBlobConfigured = () => Boolean(blobToken());
/** En Vercel sin Blob no hay dónde guardar vídeos (la memoria no se comparte entre instancias). */
export const canUseMemoryVideos = () => !isBlobConfigured() && !process.env.VERCEL;

export const videoPathname = (id) => `ig/videos/${id}.mp4`;

/** URL pública del blob: https://<storeId>.public.blob.vercel-storage.com/<pathname> (el storeId va en el token). */
export function blobPublicUrl(pathname) {
    const storeId = blobToken().split("_")[3];
    if (!storeId) throw new Error("BLOB_READ_WRITE_TOKEN no tiene el formato esperado.");
    return `https://${storeId}.public.blob.vercel-storage.com/${pathname}`;
}

/** URL PUT prefirmada de Blob para un único MP4 y las cabeceras que hay que enviar con ella. */
export async function presignVideoUpload(pathname) {
    const validUntil = Date.now() + PRESIGN_TTL_MS;
    const options = {
        pathname,
        operations: ["put"],
        validUntil,
        allowedContentTypes: ["video/mp4"],
        maximumSizeInBytes: MAX_VIDEO_BYTES,
    };
    const signed = await issueSignedToken(options);
    const { presignedUrl } = await presignUrl(signed, {
        operation: "put",
        access: "public",
        pathname,
        validUntil,
        allowedContentTypes: ["video/mp4"],
        maximumSizeInBytes: MAX_VIDEO_BYTES,
        allowOverwrite: false,
        addRandomSuffix: false,
    });
    const storeId = parseStoreIdFromDelegationToken(signed.delegationToken);
    return {
        upload_url: presignedUrl,
        headers: {
            "Content-Type": "video/mp4",
            "x-content-type": "video/mp4",
            "x-vercel-blob-access": "public",
            "x-api-version": BLOB_API_VERSION,
            "x-vercel-blob-store-id": storeId,
        },
        expires_at: new Date(validUntil).toISOString(),
    };
}

export async function deleteBlob(url) {
    if (!isBlobConfigured() || !url) return;
    await del(url);
}

// ---------- validación MP4 (sin dependencias) ----------
const fourcc = (buf, at) => buf.toString("latin1", at, at + 4);

/**
 * Lee la estructura de cajas de un MP4: exige `ftyp` al principio y saca la duración del `mvhd`.
 * `readAt(offset, length)` devuelve un Buffer (de memoria o con peticiones Range).
 * Devuelve { ok, error?, status?, duration_s, faststart }.
 */
export async function inspectMp4(readAt, size) {
    if (!size) return { ok: false, status: 415, error: "El archivo está vacío." };
    if (size > MAX_VIDEO_BYTES) return { ok: false, status: 413, error: `El vídeo pesa ${(size / 1048576).toFixed(1)} MB; el máximo es 60 MB.` };
    const first = await readAt(0, Math.min(size, 64 * 1024));
    if (first.length < 12 || fourcc(first, 4) !== "ftyp") return { ok: false, status: 415, error: "No es un MP4 (falta la caja ftyp al principio)." };
    const read = async (off, len) => (off + len <= first.length ? first.subarray(off, off + len) : readAt(off, len));

    let off = 0;
    let duration_s = null;
    let faststart = false;
    let sawMdat = false;
    for (let i = 0; i < 64 && off + 8 <= size; i++) {
        const h = await read(off, 16);
        if (h.length < 8) break;
        let boxSize = h.readUInt32BE(0);
        const type = fourcc(h, 4);
        let headerLen = 8;
        if (boxSize === 1) {
            boxSize = Number(h.readBigUInt64BE(8));
            headerLen = 16;
        } else if (boxSize === 0) {
            boxSize = size - off;
        }
        if (boxSize < headerLen) return { ok: false, status: 415, error: `MP4 corrupto (caja ${type} con tamaño ${boxSize}).` };
        if (type === "mdat") sawMdat = true;
        if (type === "moov") {
            faststart = !sawMdat;
            duration_s = await readMvhdDuration(read, off + headerLen, off + boxSize);
            break;
        }
        off += boxSize;
    }
    return { ok: true, duration_s, faststart };
}

async function readMvhdDuration(read, start, end) {
    let off = start;
    for (let i = 0; i < 32 && off + 8 <= end; i++) {
        const h = await read(off, 8);
        const boxSize = h.readUInt32BE(0);
        if (fourcc(h, 4) === "mvhd") {
            const b = await read(off + 8, 32);
            const version = b[0];
            const timescale = version === 1 ? b.readUInt32BE(20) : b.readUInt32BE(12);
            const duration = version === 1 ? Number(b.readBigUInt64BE(24)) : b.readUInt32BE(16);
            return timescale ? Math.round((duration / timescale) * 100) / 100 : null;
        }
        if (boxSize < 8) return null;
        off += boxSize;
    }
    return null;
}

/** Inspecciona un MP4 publicado en una URL (Blob o /api/ig/vid) con HEAD + peticiones Range. */
export async function inspectRemoteMp4(url) {
    const head = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (head.status === 404) return { ok: false, status: 404, error: "El vídeo no se ha subido todavía (o la subida falló)." };
    if (!head.ok) return { ok: false, status: 502, error: `No se pudo leer el vídeo (HTTP ${head.status}).` };
    const size = Number(head.headers.get("content-length") || 0);
    const type = head.headers.get("content-type") || "";
    if (!type.startsWith("video/mp4")) return { ok: false, status: 415, error: `El vídeo se sirve como "${type}", no como video/mp4.`, bytes: size };
    let ranged = true;
    const readAt = async (offset, length) => {
        const res = await fetch(url, { headers: { Range: `bytes=${offset}-${offset + length - 1}` }, cache: "no-store" });
        if (res.status !== 206) ranged = false;
        const buf = Buffer.from(await res.arrayBuffer());
        return res.status === 206 ? buf : buf.subarray(offset, offset + length);
    };
    const info = await inspectMp4(readAt, size);
    return { ...info, bytes: size, range: ranged };
}
