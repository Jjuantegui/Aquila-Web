'use client';

import { useState } from 'react';
import styles from './SeasonStats.module.css';

const SeasonStats = ({ stats }) => {
    // If no stats available
    if (!stats || stats.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Season Metrics</h3>
                </div>
                <div className={styles.emptyState}>
                    Stats available soon
                </div>
            </div>
        );
    }

    // Default to the first item (assuming most recent is first in array)
    const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
    const currentStats = stats[selectedSeasonIndex];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Season Metrics</h3>
                <select
                    className={styles.select}
                    onChange={(e) => setSelectedSeasonIndex(Number(e.target.value))}
                    value={selectedSeasonIndex}
                >
                    {stats.map((stat, index) => (
                        <option key={index} value={index}>
                            {stat.season} - {stat.competition}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.card}>
                <div className={styles.statsGrid}>

                    {/* Appearances */}
                    <div className={styles.statBlock}>
                        <span className={styles.value}>{currentStats.appearances}</span>
                        <span className={styles.label}>Appearances</span>
                        {/* Micro Bar: max assumed e.g., 50 matches */}
                        <div className={styles.barContainer}>
                            <div className={styles.barFill} style={{ width: `${Math.min((currentStats.appearances / 50) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                    {/* Minutes */}
                    <div className={styles.statBlock}>
                        <span className={styles.value}>{currentStats.minutes}</span>
                        <span className={styles.label}>Minutes</span>
                        {/* Micro Bar: max assumed e.g., 4500 min */}
                        <div className={styles.barContainer}>
                            <div className={styles.barFill} style={{ width: `${Math.min((currentStats.minutes / 4000) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                    {/* Goals */}
                    <div className={styles.statBlock}>
                        <span className={styles.value}>{currentStats.goals}</span>
                        <span className={styles.label}>Goals</span>
                        {/* Micro Bar: goal ratio roughly */}
                        <div className={styles.barContainer}>
                            <div className={styles.barFill} style={{ width: `${Math.min((currentStats.goals / 25) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                    {/* Assists */}
                    <div className={styles.statBlock}>
                        <span className={styles.value}>{currentStats.assists}</span>
                        <span className={styles.label}>Assists</span>
                        <div className={styles.barContainer}>
                            <div className={styles.barFill} style={{ width: `${Math.min((currentStats.assists / 15) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                </div>

                <div className={styles.divider}></div>

                <div className={styles.metaInfo}>
                    <div className={styles.cardsContainer}>
                        <div className={styles.cardStat}>
                            <span className={styles.yellowCard}></span>
                            <span>{currentStats.yellowCards}</span>
                        </div>
                        <div className={styles.cardStat}>
                            <span className={styles.redCard}></span>
                            <span>{currentStats.redCards}</span>
                        </div>
                    </div>
                    <span>Last updated: {currentStats.lastUpdated}</span>
                </div>
            </div>
        </div>
    );
};

export default SeasonStats;
