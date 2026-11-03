// Sistema de movimiento único de la web. Mismas curvas y tiempos que los reels de Instagram
// (_Scripts/aquila_matchday_reel.py, aquila_stats_reel.py): `ease` = ease-out cúbico, `back` = ease-out con rebote (c = 1,7).
// Los mismos valores viven como variables CSS en globals.css (--m-*): si se cambia uno, se cambia en los dos sitios.
export const motion = {
    duration: { fast: 0.25, base: 0.5, slow: 0.8 },   // segundos
    ease: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        back: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    stagger: 0.12,   // segundos entre hermanos
    rise: 32,        // px de subida al entrar
    count: { min: 1.0, max: 1.4 },   // segundos de los contadores
};

// Ease-out cúbico en JS, para los contadores (misma curva que `ease` en los generadores de reels).
export const easeOut = (x) => 1 - Math.pow(1 - x, 3);

export const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
