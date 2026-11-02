import {
    isValidConnectorKey,
    createUpload,
    createMediaUpload,
    scheduleReel,
    listReels,
    cancelReel,
    publishReelNow,
    scheduleStory,
    listStories,
    cancelStory,
    publishDue,
    publishNow,
    checkConnection,
    refreshToken,
} from "../../../../lib/igStories";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // publish_due espera a que Meta procese los vídeos (reels: hasta 5 min)

/**
 * Conector privado «Aquila Instagram» (MCP sobre HTTP, respuestas JSON).
 * URL para Claude → Conectores → Añadir conector personalizado:
 *   https://www.aquilasports.es/api/mcp/<CONNECTOR_KEY>
 * Con una clave incorrecta responde 404, para no anunciar que existe.
 */

const SERVER = { name: "aquila-instagram", version: "1.1.0" };
const PROTOCOLS = ["2025-06-18", "2025-03-26", "2024-11-05"];

const TOOLS = [
    {
        name: "check_connection",
        description: "Comprueba que el token de Instagram funciona y devuelve la cuenta conectada y cuántas stories hay programadas.",
        inputSchema: { type: "object", properties: {} },
        run: () => checkConnection(),
    },
    {
        name: "create_media_upload",
        description:
            "Prepara la subida de una pieza. kind=image: JPEG de story (1080x1920, máx. 700 KB), igual que create_image_upload. kind=video: MP4 H.264 1080x1920 (máx. 60 MB; story 3–60 s, reel 3 s–15 min). Devuelve media_id, upload_url, headers y un comando curl listo: sube el archivo con PUT enviando TODAS las cabeceras de headers (por ejemplo: curl -X PUT -H 'Content-Type: video/mp4' ... -T archivo.mp4 '<upload_url>'). La URL caduca en 30 minutos y sirve una sola vez. El vídeo se valida al programarlo.",
        inputSchema: {
            type: "object",
            properties: {
                kind: { type: "string", enum: ["image", "video"] },
                filename: { type: "string", description: "Nombre del archivo, solo como referencia." },
            },
            required: ["kind"],
        },
        run: (a) => createMediaUpload({ kind: a.kind, filename: a.filename }),
    },
    {
        name: "create_image_upload",
        description:
            "Prepara la subida de una imagen JPEG (story 1080x1920, máx. 700 KB). Devuelve image_id y una upload_url firmada: súbela con PUT y Content-Type image/jpeg (por ejemplo: curl -X PUT -H 'Content-Type: image/jpeg' --data-binary @archivo.jpg '<upload_url>'). La URL caduca en 30 minutos y sirve una sola vez.",
        inputSchema: {
            type: "object",
            properties: { filename: { type: "string", description: "Nombre del archivo, solo como referencia." } },
        },
        run: (a) => createUpload(a.filename), // alias de create_media_upload con kind=image
    },
    {
        name: "schedule_story",
        description:
            "Programa una story de Instagram con una imagen (image_id) o un vídeo MP4 de 3–60 s (media_id de create_media_upload con kind=video) ya subidos. Solo debe usarse con piezas que Joaquín haya aprobado explícitamente en el chat. publish_at en ISO 8601 con zona (p. ej. 2026-10-30T11:00:00+01:00). mention: usuario de Instagram del jugador, sin @.",
        inputSchema: {
            type: "object",
            properties: {
                image_id: { type: "string" },
                media_id: { type: "string", description: "ID de la subida (imagen o vídeo). Alternativa a image_id." },
                publish_at: { type: "string" },
                mention: { type: "string" },
                label: { type: "string", description: "Descripción corta, p. ej. 'Matchday Ruxi vs KuPS'." },
            },
            required: ["publish_at"],
        },
        run: (a) => scheduleStory(a),
    },
    {
        name: "list_stories",
        description: "Lista las stories programadas, publicadas, canceladas o fallidas.",
        inputSchema: {
            type: "object",
            properties: { status: { type: "string", enum: ["scheduled", "published", "cancelled", "failed"] } },
        },
        run: (a) => listStories(a.status),
    },
    {
        name: "cancel_story",
        description: "Cancela una story programada que aún no se ha publicado.",
        inputSchema: { type: "object", properties: { story_id: { type: "string" } }, required: ["story_id"] },
        run: (a) => cancelStory(a.story_id),
    },
    {
        name: "publish_due",
        description:
            "Publica en Instagram las stories y reels programados cuya hora ya ha llegado (como mucho 1 reel por llamada). Lo llama la tarea programada a la hora de cada pieza. Con vídeos puede tardar varios minutos mientras Meta los procesa.",
        inputSchema: { type: "object", properties: { max: { type: "number" } } },
        run: (a) => publishDue({ max: a.max }),
    },
    {
        name: "publish_now",
        description: "Publica ya una story programada concreta (solo si Joaquín lo pide en el chat).",
        inputSchema: { type: "object", properties: { story_id: { type: "string" } }, required: ["story_id"] },
        run: (a) => publishNow(a.story_id),
    },
    {
        name: "schedule_reel",
        description:
            "Programa un Reel en el feed con un vídeo ya subido (create_media_upload kind=video, 3 s–15 min). Solo con piezas que Joaquín haya aprobado explícitamente en el chat. caption: máx. 2.200 caracteres, 30 hashtags y 20 menciones (los @usuario del caption mencionan). share_to_feed (por defecto true). Portada: cover_url (JPEG público, p. ej. el public_url de una imagen subida) o thumb_offset en ms. collaborators: hasta 3 usuarios sin @; reciben una invitación en la app. Para la story del reel programa aparte una story en vídeo: la API no permite compartir un reel a stories.",
        inputSchema: {
            type: "object",
            properties: {
                media_id: { type: "string" },
                publish_at: { type: "string" },
                label: { type: "string", description: "Descripción corta, p. ej. 'Aquila in numbers octubre'." },
                caption: { type: "string" },
                share_to_feed: { type: "boolean" },
                cover_url: { type: "string" },
                thumb_offset: { type: "number" },
                collaborators: { type: "array", items: { type: "string" }, maxItems: 3 },
            },
            required: ["media_id", "publish_at"],
        },
        run: (a) => scheduleReel(a),
    },
    {
        name: "list_reels",
        description: "Lista los reels programados, publicados, cancelados o fallidos (con permalink cuando ya están publicados).",
        inputSchema: {
            type: "object",
            properties: { status: { type: "string", enum: ["scheduled", "published", "cancelled", "failed"] } },
        },
        run: (a) => listReels(a.status),
    },
    {
        name: "cancel_reel",
        description: "Cancela un reel programado que aún no se ha publicado.",
        inputSchema: { type: "object", properties: { reel_id: { type: "string" } }, required: ["reel_id"] },
        run: (a) => cancelReel(a.reel_id),
    },
    {
        name: "publish_reel_now",
        description: "Publica ya un reel programado concreto (solo si Joaquín lo pide en el chat). Puede tardar hasta 5 minutos.",
        inputSchema: { type: "object", properties: { reel_id: { type: "string" } }, required: ["reel_id"] },
        run: (a) => publishReelNow(a.reel_id),
    },
    {
        name: "refresh_token",
        description: "Renueva el token de Instagram (dura 60 días). Conviene hacerlo cada mes.",
        inputSchema: { type: "object", properties: {} },
        run: () => refreshToken(),
    },
];

const ok = (id, result) => ({ jsonrpc: "2.0", id, result });
const err = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });

async function handle(msg) {
    const { id, method, params = {} } = msg || {};
    const isNotification = id === undefined || id === null;
    try {
        switch (method) {
            case "initialize": {
                const requested = params.protocolVersion;
                return ok(id, {
                    protocolVersion: PROTOCOLS.includes(requested) ? requested : PROTOCOLS[0],
                    capabilities: { tools: { listChanged: false } },
                    serverInfo: SERVER,
                    instructions:
                        "Conector privado de Aquila Sports Management para publicar stories y reels en @aquilasportsm. No programes ni publiques nada sin el OK explícito de Joaquín en el chat.",
                });
            }
            case "ping":
                return ok(id, {});
            case "tools/list":
                return ok(id, { tools: TOOLS.map(({ run, ...t }) => t) });
            case "tools/call": {
                const tool = TOOLS.find((t) => t.name === params.name);
                if (!tool) return err(id, -32602, `Herramienta desconocida: ${params.name}`);
                try {
                    const out = await tool.run(params.arguments || {});
                    return ok(id, { content: [{ type: "text", text: JSON.stringify(out, null, 2) }], structuredContent: out && typeof out === "object" && !Array.isArray(out) ? out : { items: out } });
                } catch (e) {
                    return ok(id, { content: [{ type: "text", text: String(e.message || e) }], isError: true });
                }
            }
            default:
                if (isNotification) return null;
                return err(id, -32601, `Método no soportado: ${method}`);
        }
    } catch (e) {
        return isNotification ? null : err(id, -32603, String(e.message || e));
    }
}

const notFound = () => Response.json({ error: "Not found" }, { status: 404 });

export async function POST(request, { params }) {
    const { key } = await params;
    if (!isValidConnectorKey(key)) return notFound();
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json(err(null, -32700, "JSON inválido"), { status: 400 });
    }
    const batch = Array.isArray(body);
    const replies = (await Promise.all((batch ? body : [body]).map(handle))).filter(Boolean);
    if (!replies.length) return new Response(null, { status: 202 });
    return Response.json(batch ? replies : replies[0], { headers: { "Cache-Control": "no-store" } });
}

export async function GET(request, { params }) {
    const { key } = await params;
    if (!isValidConnectorKey(key)) return notFound();
    // Sin stream SSE: este servidor solo responde en JSON.
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
}

export async function DELETE(request, { params }) {
    const { key } = await params;
    if (!isValidConnectorKey(key)) return notFound();
    return new Response(null, { status: 204 });
}
