# Directrices de Aquila Web

Las directrices de la web se mantienen en la carpeta de Marketing del escritorio. Antes de modificar tarjetas, creatividades de noticias o el movimiento de la web, consultar y aplicar:

[Directrices web](/Users/jaunaconsulting/Desktop/Aquila%20Sports%20—%20HQ/04%20—%20Marketing/Web/Directrices%20web.md)

Ruta local: `/Users/jaunaconsulting/Desktop/Aquila Sports — HQ/04 — Marketing/Web/Directrices web.md`.

## Sistema de movimiento (resumen)

- Tokens únicos en `src/lib/motion.js` y `globals.css` (`--m-*`); componentes en `src/components/motion/` (`Reveal`, `CountUp`, `Knockout`, `Ribbon`, `StatWidget`) y `HeroVideo` en `src/components/home/`.
- Solo `transform`, `opacity` y `clip-path`; cada pieza entra una vez. Sin JS o con `prefers-reduced-motion` todo queda visible y quieto (los estados ocultos solo existen bajo `html.js`).
- Color del club solo en la ficha (`src/data/clubColors.js`); dorsal solo si `players[].number` está confirmado; «Aquila in numbers» se calcula en `src/lib/numbers.js`, nunca a mano.
- Vídeo de portada: `src/data/heroClips.js` (`sources = null` hasta que haya clips; se monta con `Planteamiento_Web_Animada/02_montar_video_portada.sh` en HQ).
- Antes de un PR: `npm run build`, `npm run lint`, `node --test src/components/players/playerFilters.test.mjs`, Lighthouse móvil ≥ 90 y revisión en Chrome, Safari y 390 px.
