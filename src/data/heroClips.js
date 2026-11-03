// Mini vídeo de portada. Los archivos se montan con 04 — Marketing/Web/Planteamiento_Web_Animada/02_montar_video_portada.sh
// a partir de los clips de HQ/04 — Marketing/Video/Portada/_Clips/, que genera también portada_clips.json (tiempos reales).
// Mientras no haya clips, `sources` queda en null y la portada muestra solo el póster.
export const heroVideo = {
    sources: null,
    // sources: {
    //     landscape: { mp4: '/video/portada_16x9.mp4', webm: '/video/portada_16x9.webm' },
    //     portrait: { mp4: '/video/portada_9x16.mp4', webm: '/video/portada_9x16.webm' },
    // },
    poster: { landscape: '/assets/brand/julio-melbourne-hero.jpg', portrait: '/assets/brand/julio-melbourne-hero-mobile.jpg' },
    // Rótulo «AHORA ·» por clip: start en segundos (de portada_clips.json), playerId de src/data/players.js.
    clips: [
        { start: 0, playerId: 8, name: 'Julio Cascante', club: 'Melbourne City' },
    ],
};
