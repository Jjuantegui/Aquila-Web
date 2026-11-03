'use client';

import { useEffect, useRef } from 'react';
import { easeOut, motion } from '../../lib/motion';

// Cifra que cuenta de 0 al valor cuando entra en pantalla (requestAnimationFrame, ease-out cúbico, 1,0–1,4 s).
// Se renderiza con el valor final (servidor, sin JS, movimiento reducido); el conteo solo sustituye el texto en cliente.
export default function CountUp({ value, duration = 1.2, delay = 0, decimals = 0, suffix = '', lang = 'en', className }) {
    const ref = useRef(null);
    const fmt = (n) => new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);

    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return undefined;
        const dur = Math.min(motion.count.max, Math.max(motion.count.min, duration)) * 1000;
        let raf = 0;
        const io = new IntersectionObserver((entries) => {
            if (!entries.some(e => e.isIntersecting)) return;
            io.disconnect();
            const t0 = performance.now() + delay * 1000;
            const step = (now) => {
                const k = Math.min(1, Math.max(0, (now - t0) / dur));
                el.textContent = fmt(value * easeOut(k)) + suffix;
                if (k < 1) raf = requestAnimationFrame(step);
            };
            el.textContent = fmt(0) + suffix;
            raf = requestAnimationFrame(step);
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
        io.observe(el);
        return () => { io.disconnect(); cancelAnimationFrame(raf); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, duration, delay, decimals, suffix, lang]);

    return <span ref={ref} className={className}>{fmt(value)}{suffix}</span>;
}
