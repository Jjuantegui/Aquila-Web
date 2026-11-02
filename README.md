# Aquila Sports Management — web

Next.js 16 (App Router) desplegado en Vercel. Sin CMS: los datos viven en `src/data`.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Idiomas

- Inglés en la raíz (`/`, `/deals`, `/news`, `/players/1`).
- Español bajo `/es` (`/es`, `/es/deals`, `/es/news`, `/es/players/1`).
- Los textos de la interfaz están en `src/i18n/en.js` y `src/i18n/es.js`.
  Los valores enumerados de los datos (posiciones, tipos de operación, estado…) se traducen en `terms` dentro de `es.js`.
- Cada jugador puede llevar `bioBullets_es` en `src/data/players.js` para el informe en español.

## Añadir una noticia

1. Abre `src/data/news.js`.
2. Copia un objeto existente y pégalo **al principio** del array.
3. Cambia `slug` (único, minúsculas y guiones), `date` (`YYYY-MM-DD`), `type` (`aquila` | `press` | `player`), `playerIds`, y los textos `title`, `excerpt` y `body` en `en` y `es`.
4. Opcional: `image` (ruta en `/public/assets/...`), `dealId`, `source: { name, url }` para menciones en prensa, `tags`.
5. `git commit` y `git push`: Vercel despliega solo.

La entrada aparece en `/news`, en las tres últimas de la home y en la ficha de cada jugador enlazado.

## Añadir un jugador o una operación

- Jugadores: `src/data/players.js` (foto en `public/assets/players/`).
- Operaciones: `src/data/deals.js` (`playerId` enlaza con la ficha; sin `playerId` para intermediaciones).

## Dossieres rastreables

Enlaces de PDF distintos por club que registran cada apertura (fecha, ciudad, dispositivo) sin exponer el archivo en `/public`.

- **Enlace que se comparte:** `https://www.aquilasports.es/d/<dossier>/<club>` (p. ej. `/d/rivera/oviedo`). Añade `?lang=en` o `?lang=es` para forzar el idioma del PDF.
- **PDF:** en `private/dossiers/` (nunca en `public/`). Se sirven con `fs` desde `src/app/d/[dossier]/[recipient]/route.js`; `next.config.mjs` los incluye en el bundle de Vercel con `outputFileTracingIncludes`.
- **Dossieres y destinatarios:** `src/data/dossiers.js`. Un `<club>` no dado de alta **también funciona**: se sirve el PDF y se registra como `unknown:<club>`.
- **Panel privado:** `https://www.aquilasports.es/admin/aperturas?token=<ADMIN_TOKEN>`. La primera vez fija una cookie de 30 días; sin token válido responde 404. Muestra la tabla por destinatario, el historial (con conmutador "mostrar bots"), permite crear enlaces sueltos y **generar enlaces en bloque** (pegas los clubes de un mercado, uno por línea, con código de mercado e idioma — inglés por defecto — y obtienes un enlace por club con *Copiar todos* y descarga CSV). Los destinatarios creados desde el panel guardan etiqueta e idioma en Redis, así el enlace no necesita `?lang=`.
- **API para automatizaciones:** `GET /api/opens?token=<ADMIN_TOKEN>&since=<ISO>&dossier=rivera` → JSON con aperturas humanas y resumen por destinatario (nunca IPs).
- **Bots:** las vistas previas de WhatsApp, LinkedIn, Telegram, etc. y las peticiones `HEAD` se guardan con `isBot: true` y no cuentan como apertura. La misma persona recargando el PDF en menos de dos minutos cuenta una sola vez.

### Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Qué es |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Las crea Vercel al conectar Upstash Redis (Storage → Marketplace). También se aceptan `KV_REST_API_URL` / `KV_REST_API_TOKEN`. |
| `ADMIN_TOKEN` | Contraseña larga y aleatoria del panel y de la API. |
| `IP_SALT` | Cadena aleatoria para hashear las IP (no se guardan en claro). |

Copia `.env.example` a `.env.local` para desarrollo. Sin Redis, los PDF se sirven igual y las aperturas se guardan solo en memoria (el panel lo avisa).

### Añadir un dossier

1. Sube el PDF a `private/dossiers/` (en GitHub: abre la carpeta → *Add file* → *Upload files*).
2. Añade una entrada en `dossiers` dentro de `src/data/dossiers.js` con `slug`, `title`, `file` (y opcionalmente `files: { es, en }`).
3. Opcional: añade destinatarios en `recipients` con `label` e idioma. Si no, crea los enlaces desde el panel.

Datos en Redis: `opens:{dossier}:{club}` (últimos 500 eventos), `opens:all` (últimos 2.000), `stats:{dossier}:{club}` (`count`, `first`, `last`) y `recipients:{dossier}` (destinatarios creados desde el panel: `{ label, lang }` por slug).

## Stories de Instagram (conector privado «Aquila Instagram»)

Publica las stories aprobadas en @aquilasportsm con la API de Instagram (inicio de sesión empresarial), con mención al jugador. Lo usan las tareas programadas de Claude a través de un conector MCP privado.

- **Conector (MCP):** `POST /api/mcp/<CONNECTOR_KEY>`. Con otra clave responde 404. Herramientas: `check_connection`, `create_media_upload`, `create_image_upload` (alias de `create_media_upload` con `kind=image`), `schedule_story`, `list_stories`, `cancel_story`, `publish_now`, `schedule_reel`, `list_reels`, `cancel_reel`, `publish_reel_now`, `publish_due`, `refresh_token`.
- **Subida de imágenes:** `PUT /api/ig/upload/<id>?exp=&sig=` (URL firmada de 30 min que da `create_image_upload`; solo JPEG, máx. 700 KB).
- **Imagen pública para Meta:** `GET /api/ig/img/<id>.jpg` (id aleatorio, sin enlaces en la web, caduca a los 21 días).
- **Datos en Redis:** `ig:img:<id>`, `ig:stories` (hash id → JSON), `ig:reels` (hash id → JSON), `ig:media` (metadatos de los vídeos), `ig:token` (token renovado), `ig:lock:<id>`.

### Vídeos: stories en vídeo y Reels

Los MP4 (H.264, 1080×1920, máx. 60 MB) viven en **Vercel Blob**, no en Redis; en Redis solo van los metadatos (`media_id`, `kind`, `blob_url`, `bytes`, `duration_s`, `created_at`).

1. `create_media_upload(kind=video)` devuelve `media_id`, una `upload_url` PUT prefirmada de Blob (30 min, una sola vez, solo `video/mp4`, máx. 60 MB), las `headers` que hay que enviar y un `curl` listo. La subida va directa del Mac a Blob (las funciones de Vercel no admiten cuerpos de más de 4,5 MB).
2. Al programar (`schedule_story` con `media_id`, o `schedule_reel`) se valida el MP4 leyendo el blob con Range: caja `ftyp`, tamaño y duración del `mvhd`. Si no vale, se borra el blob y se rechaza (415/413 en el mensaje). Story: 3–60 s. Reel: 3 s–15 min.
3. `publish_due` publica stories y reels: crea el contenedor con `video_url` (la URL pública del blob), sondea cada 5 s (stories hasta 120 s, reels hasta 5 min) y publica. Antes consulta `content_publishing_limit`; sin cuota deja la pieza en `scheduled` con `last_error`. Como mucho 1 reel por llamada. Si se acaba el tiempo de la función mientras Meta procesa, guarda el `container_id` y lo retoma en la siguiente llamada. Tres fallos seguidos → `failed`.
4. Cada pieza de vídeo guarda `attempts`, `last_error`, `container_id`, `ig_media_id`, `permalink` y `published_at`.
5. El blob se borra 7 días después de que la última pieza que lo usa quede `published`, `cancelled` o `failed` (o 7 días después de subirlo si nunca se programó).

- **Vídeo público:** `GET /api/ig/vid/<id>.mp4` redirige (302) a la URL del blob. En local, sin Blob, sirve el vídeo desde memoria con Range, y la subida va a `PUT /api/ig/upload/<id>?kind=video&exp=&sig=`, que valida el MP4 al recibirlo.
- **Reels:** `caption` (≤ 2.200 caracteres, ≤ 30 hashtags, ≤ 20 menciones; los `@usuario` del caption mencionan), `share_to_feed` (por defecto `true`), `cover_url` (JPEG público, p. ej. el `public_url` de una imagen subida) **o** `thumb_offset` en ms, y `collaborators` (máx. 3, sin `@`; reciben una invitación en la app y no pasa nada si no la aceptan).
- **No existe «compartir el reel en stories» por la API.** Si se quiere la story del reel, se programa aparte una story en vídeo (p. ej. el clip de 9 s) o se comparte a mano desde la app.

| Variable | Valor |
|---|---|
| `IG_ACCESS_TOKEN` | Token largo de Meta for Developers (app «Aquila Stories»). Dura 60 días; `refresh_token` lo renueva y lo guarda en Redis. |
| `IG_USER_ID` | `17841471503444352` (@aquilasportsm). |
| `CONNECTOR_KEY` | Cadena aleatoria de 32+ caracteres. Forma parte de la URL del conector y firma las subidas. No compartir. |
| `BLOB_READ_WRITE_TOKEN` | Lo crea Vercel al activar Blob en el proyecto (Storage → Blob). Sin él, en producción no se pueden subir vídeos. |
