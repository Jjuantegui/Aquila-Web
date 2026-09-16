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
