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
