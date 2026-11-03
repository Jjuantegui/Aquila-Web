'use client';

import { useState } from 'react';
import Reveal from '../motion/Reveal';
import StatWidget from '../motion/StatWidget';
import styles from './SeasonStats.module.css';

// Stats de temporada con los widgets del reel C «Marcador vivo»: cuatro tarjetas HUD que entran una a una (0,45 s)
// con rebote y cifras que cuentan. `accent` es el color del club (solo en la ficha). Sin datos, estado vacío sin animar.
const SeasonStats = ({ stats, dict, lang = 'en', accent }) => {
    const t = (dict && dict.players) || {};
    const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
    const hasStats = Array.isArray(stats) && stats.length > 0;
    const currentStats = hasStats ? stats[Math.min(selectedSeasonIndex, stats.length - 1)] : null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>{t.seasonMetrics || 'Season Metrics'}</h3>
                {hasStats && stats.length > 1 && (
                    <select className={styles.select} onChange={(e) => setSelectedSeasonIndex(Number(e.target.value))} value={selectedSeasonIndex} aria-label={t.seasonMetrics}>
                        {stats.map((stat, index) => (
                            <option key={index} value={index}>{stat.season} - {stat.competition}</option>
                        ))}
                    </select>
                )}
            </div>

            {!hasStats ? (
                <div className={styles.emptyState}>{t.statsSoon || 'Stats available soon'}</div>
            ) : (
                <Reveal key={selectedSeasonIndex} variant="items" ease="back" className={styles.grid} style={{ '--stagger': '0.45s' }}>
                    <StatWidget kind="pips" index={0} value={currentStats.appearances} label={t.appearances || 'Appearances'} accent={accent} lang={lang} />
                    <StatWidget kind="minutes" index={1} value={currentStats.minutes} label={t.minutes || 'Minutes'} accent={accent} lang={lang} />
                    <StatWidget kind="pips" index={2} value={currentStats.goals} label={t.goals || 'Goals'} accent={accent} lang={lang} />
                    <StatWidget kind="pips" index={3} value={currentStats.assists} label={t.assists || 'Assists'} accent={accent} lang={lang} />
                    <div className={`${styles.metaInfo} m-rise`} style={{ '--i': 4 }}>
                        <div className={styles.cardsContainer}>
                            <div className={styles.cardStat}><span className={styles.yellowCard}></span><span>{currentStats.yellowCards}</span></div>
                            <div className={styles.cardStat}><span className={styles.redCard}></span><span>{currentStats.redCards}</span></div>
                        </div>
                        <span>{t.lastUpdated || 'Last updated'}: {currentStats.lastUpdated}</span>
                    </div>
                </Reveal>
            )}
        </div>
    );
};

export default SeasonStats;
