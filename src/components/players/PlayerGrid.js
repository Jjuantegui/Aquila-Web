'use client';

import { useState } from 'react';
import PlayerCard from './PlayerCard';
import { players } from '../../data/players';
import styles from './PlayerGrid.module.css';

const PlayerGrid = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [positionFilter, setPositionFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const positions = ['All', ...new Set(players.map(p => p.position))];
    const statuses = ['All', ...new Set(players.map(p => p.status))];

    const filteredPlayers = players.filter(player => {
        const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = positionFilter === 'All' || player.position === positionFilter;
        const matchesStatus = statusFilter === 'All' || player.status === statusFilter;
        return matchesSearch && matchesPosition && matchesStatus;
    });

    return (
        <div>
            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <select
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                        className={styles.select}
                    >
                        <option value="All">All Positions</option>
                        {positions.filter(p => p !== 'All').map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={styles.select}
                    >
                        <option value="All">All Statuses</option>
                        {statuses.filter(s => s !== 'All').map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.grid}>
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map(player => (
                        <PlayerCard key={player.id} player={player} />
                    ))
                ) : (
                    <p className={styles.noResults}>No players found matching your criteria.</p>
                )}
            </div>
        </div>
    );
};

export default PlayerGrid;
