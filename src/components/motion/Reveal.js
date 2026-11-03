'use client';

import { useEffect, useRef } from 'react';

// Revela un bloque una sola vez cuando entra en pantalla (IntersectionObserver). Sin JS todo queda visible:
// los estados ocultos solo se aplican bajo `html.js` (ver globals.css, «Sistema de movimiento»).
// variant: rise (el bloque sube) · stagger (los hijos suben uno a uno) · ticket (los hijos suben 72 px) ·
//          curtain (cortina de abajo arriba) · items (los hijos llevan sus propias piezas .m-*)
// ease: out | back. immediate: revela al montar (portada). delay/stagger en segundos.
export default function Reveal({
    as: Tag = 'div', variant = 'rise', ease = 'out', delay = 0, stagger, immediate = false, className = '', style, children, ...rest
}) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        Array.from(el.children).forEach((child, i) => child.style.setProperty('--i', i));
        const show = () => el.classList.add('is-in');
        if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
            show();
            return undefined;
        }
        const io = new IntersectionObserver((entries) => {
            if (entries.some(e => e.isIntersecting)) { show(); io.disconnect(); }
        }, { rootMargin: '0px 0px -15% 0px', threshold: 0.01 });
        io.observe(el);
        return () => io.disconnect();
    }, [immediate]);

    const vars = { ...style, '--delay': `${delay}s` };
    if (stagger !== undefined) vars['--stagger'] = `${stagger}s`;

    return (
        <Tag ref={ref} className={`reveal reveal-${variant} reveal-ease-${ease} ${className}`.trim()} style={vars} {...rest}>
            {children}
        </Tag>
    );
}
