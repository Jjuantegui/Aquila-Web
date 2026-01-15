'use client';

import { useState } from 'react';
import PlayerCard from './PlayerCard';
import { players } from '../../data/players';
import styles from './PlayerGrid.module.css';

const PlayerGrid = () => {
    return (
        <div>
            <div className={styles.grid}>
                {players.map(player => (
                    <PlayerCard key={player.id} player={player} />
                ))}
            </div>
        </div>
    );
};

export default PlayerGrid;
