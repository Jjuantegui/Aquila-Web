'use client';

import { useId, useState } from 'react';
import PlayerCard from './PlayerCard';
import { players } from '../../data/players';
import { fill } from '../../i18n';
import styles from './PlayerGrid.module.css';

const PlayerGrid = ({ lang = 'en', dict }) => {
    const [filter, setFilter] = useState('all');
    const gridId = useId();
    const t = dict.players;
    const freeAgents = players.filter(player => player.status === 'Free Agent');
    const visiblePlayers = filter === 'free' ? freeAgents : players;
    const filters = [
        { value: 'all', label: t.allPlayers, count: players.length },
        { value: 'free', label: t.freeAgents, count: freeAgents.length },
    ];

    return (
        <div>
            <div className={styles.toolbar}>
                <div className={styles.filters} role="group" aria-label={t.filterPlayers}>
                    {filters.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            className={styles.filter}
                            aria-pressed={filter === option.value}
                            aria-controls={gridId}
                            onClick={() => setFilter(option.value)}
                        >
                            {option.label}<span className={styles.count}>{option.count}</span>
                        </button>
                    ))}
                </div>
                <p className={styles.results} role="status" aria-atomic="true">
                    {fill(t.showingPlayers, { count: visiblePlayers.length, total: players.length })}
                </p>
            </div>
            <div id={gridId} className={styles.grid}>
                {visiblePlayers.map(player => (
                    <PlayerCard key={player.id} player={player} lang={lang} dict={dict} />
                ))}
            </div>
            {visiblePlayers.length === 0 && <p className={styles.empty}>{t.noFreeAgents}</p>}
        </div>
    );
};

export default PlayerGrid;
