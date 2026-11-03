'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { heroVideo } from '../../data/heroClips';
import { localePath } from '../../i18n/config';
import styles from './Hero.module.css';

// Vídeo de portada a sangre: póster (imagen LCP, prioridad alta) + <video> silencioso en bucle que solo se monta en
// cliente, sin movimiento reducido ni ahorro de datos, y después del póster. preload="metadata" para no competir con
// el LCP. El rótulo «Ahora · jugador · club» sigue al clip en reproducción (heroClips.js) y enlaza a su ficha.
export default function HeroVideo({ lang, dict }) {
    const ref = useRef(null);
    // En servidor y en la hidratación no hay vídeo (solo póster); en cliente se decide por reduced motion y save-data.
    const canPlay = useSyncExternalStore(() => () => {}, () => {
        if (!heroVideo.sources) return false;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const saveData = navigator.connection && navigator.connection.saveData;
        return !reduced && !saveData;
    }, () => false);
    const [blocked, setBlocked] = useState(false);
    const showVideo = canPlay && !blocked;
    const [clip, setClip] = useState(heroVideo.clips[0]);

    useEffect(() => {
        const video = ref.current;
        if (!video) return undefined;
        video.play().catch(() => setBlocked(true));  // autoplay bloqueado: se queda el póster
        const onTime = () => {
            const t = video.currentTime;
            const current = [...heroVideo.clips].reverse().find(c => t >= c.start) || heroVideo.clips[0];
            if (current !== clip) setClip(current);
        };
        video.addEventListener('timeupdate', onTime);
        return () => video.removeEventListener('timeupdate', onTime);
    }, [showVideo, clip]);

    const src = heroVideo.sources;
    return (
        <>
            <div className={styles.media} aria-hidden="true">
                <picture>
                    <source media="(orientation: portrait) and (max-width: 760px)" srcSet={heroVideo.poster.portrait} />
                    <Image src={heroVideo.poster.landscape} alt="" fill priority fetchPriority="high" sizes="100vw" className={styles.poster} />
                </picture>
                {showVideo && src && (
                    <video ref={ref} className={styles.video} muted loop playsInline autoPlay preload="metadata" poster={heroVideo.poster.landscape} aria-label={dict.videoLabel}>
                        <source src={src.portrait.webm} type="video/webm" media="(orientation: portrait) and (max-width: 760px)" />
                        <source src={src.portrait.mp4} type="video/mp4" media="(orientation: portrait) and (max-width: 760px)" />
                        <source src={src.landscape.webm} type="video/webm" />
                        <source src={src.landscape.mp4} type="video/mp4" />
                    </video>
                )}
                <div className={styles.veil} />
            </div>
            <Link href={localePath(lang, `/players/${clip.playerId}`)} className={styles.now}>
                <span className={styles.nowLabel}>{dict.now}</span>
                <span className={styles.nowName}>{clip.name}</span>
                <span className={styles.nowClub}>{clip.club}</span>
                <span aria-hidden="true">↗</span>
            </Link>
        </>
    );
}
