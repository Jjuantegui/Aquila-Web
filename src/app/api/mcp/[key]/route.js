import {
    isValidConnectorKey,
    createUpload,
    scheduleStory,
    listStories,
    cancelStory,
    publishDue,
    publishNow,
    checkConnection,
    refreshToken,
} from "../../../../lib/igStories";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Conector privado «Aquila Instagram» (MCP sobre HTTP, respuestas JSON).
 * URL para Claude → Conectores → Añadir conector personalizado:
 *   https://www.aquilasports.es/api/mcp/<CONNECTOR_KEY>
 * Con una clave incorrecta responde 404, para no anunciar que existe.
 */

const SERVER = { name: "aquila-instagram", version: "1.0.0" };
const PROTOCOLS = ["2025-06-18", "2025-03-26", "2024-11-05"];

const TOOLS = [
    {
        name: "check_connection",
        description: "Comprueba que el token de Instagram funciona y devuelve la cuenta conectada y cuántas stories hay programadas.",
        inputSchema: { type: "object", properties: {} },
        run: () => checkConnection(),
    },
    {
        name: "create_image_upload",
        description:
            "Prepara la subida de una imagen JPEG (story 1080x1920, máx. 700 KB). Devuelve image_id y una upload_url firmada: súbela con PUT y Content-Type image/jpeg (por ejemplo: curl -X PUT -H 'Content-Type: image/jpeg' --data-binary @archivo.jpg '<upload_url>'). La URL caduca en 30 minutos y sirve una sola vez.",
        inputSchema: {
            type: "object",
            properties: { filename: { type: "string", description: "Nombre del archivo, solo como referencia." } },
        },
        run: (a) => createUpload(a.filename),
    },
    {
        name: "schedule_story",
        description:
            "Programa una story de Instagram con una imagen ya subida. Solo debe usarse con piezas que Joaquín haya aprobado explícitamente en el chat. publish_at en ISO 8601 con zona (p. ej. 2026-10-30T11:00:00+01:00). mention: usuario de Instagram del jugador, sin @.",
        inputSchema: {
            type: "object",
            properties: {
                image_id: { type: "string" },
                publish_at: { type: "string" },
                mention: { type: "string" },
                label: { type: "string", description: "Descripción corta, p. ej. 'Matchday Ruxi vs KuPS'." },
            },
            required: ["image_id", "publish_at"],
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
        description: "Publica en Instagram las stories programadas cuya hora ya ha llegado. Lo llama la tarea programada a la hora de cada story.",
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
                        "Conector privado de Aquila Sports Management para publicar stories en @aquilasportsm. No programes ni publiques nada sin el OK explícito de Joaquín en el chat.",
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
