'use client';

import { useId, useRef } from 'react';
import PlayerCard from './PlayerCard';
import CopyLinkButton from './CopyLinkButton';
import usePlayerFilters from './usePlayerFilters';
import { filterPlayers, hasPlayerFilters, playerListPath, positionGroups } from './playerFilters.mjs';
import { players } from '../../data/players';
import { fill, getDictionary, localePath } from '../../i18n';
import styles from './PlayerGrid.module.css';

const PlayerGrid = ({ lang = 'en', dict }) => {
    const { filters, updateFilters } = usePlayerFilters();
    const searchRef = useRef(null);
    const gridId = useId();
    const t = dict.players;
    // Search in both languages so changing locale preserves matching results.
    const searchTerms = getDictionary('es').terms;
    const matchingPlayers = filterPlayers(players, { ...filters, status: 'all' }, searchTerms);
    const visiblePlayers = filterPlayers(players, filters, searchTerms);
    const availabilityOptions = [
        { value: 'all', label: t.allPlayers, count: matchingPlayers.length },
        { value: 'free', label: t.freeAgents, count: matchingPlayers.filter(player => player.status === 'Free Agent').length },
    ];
    const hasFilters = hasPlayerFilters(filters);
    const shareUrl = `https://www.aquilasports.es${playerListPath(localePath(lang, '/'), { ...filters, query: filters.query.trim() })}`;
    const reset = () => {
        updateFilters({ status: 'all', position: 'all', query: '' });
        searchRef.current?.focus();
    };

    return (
        <div>
            <div className={styles.searchControls}>
                <div className={styles.field}>
                    <label htmlFor={`${gridId}-search`}>{t.searchPlayers}</label>
                    <input
                        ref={searchRef}
                        id={`${gridId}-search`}
                        type="search"
                        value={filters.query}
                        onChange={event => updateFilters({ query: event.target.value }, { replace: true })}
                        placeholder={t.searchPlaceholder}
                        maxLength={100}
                        aria-controls={gridId}
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor={`${gridId}-position`}>{t.filterPosition} <span>{t.secondaryIncluded}</span></label>
                    <select id={`${gridId}-position`} value={filters.position} onChange={event => updateFilters({ position: event.target.value })} aria-controls={gridId}>
                        <option value="all">{t.allPositions}</option>
                        {positionGroups.map(position => <option key={position} value={position}>{t.positionGroups[position]}</option>)}
                    </select>
                </div>
            </div>
            <div className={styles.toolbar}>
                <div className={styles.filters} role="group" aria-label={t.filterPlayers}>
                    {availabilityOptions.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            className={styles.filter}
                            aria-pressed={filters.status === option.value}
                            aria-controls={gridId}
                            onClick={() => updateFilters({ status: option.value })}
                        >
                            {option.label}<span className={styles.count}>{option.count}</span>
                        </button>
                    ))}
                    {hasFilters && <button type="button" className={styles.reset} onClick={reset}>{t.clearFilters}</button>}
                </div>
                <div className={styles.summary}>
                    <p className={styles.results} role="status" aria-atomic="true">
                        {fill(t.showingPlayers, { count: visiblePlayers.length, total: players.length })}
                    </p>
                    <CopyLinkButton key={shareUrl} url={shareUrl} label={t.copySelection} dict={t} />
                </div>
            </div>
            <div id={gridId} className={styles.grid}>
                {visiblePlayers.map(player => (
                    <PlayerCard key={player.id} player={player} lang={lang} dict={dict} />
                ))}
            </div>
            {visiblePlayers.length === 0 && (
                <div className={styles.empty}>
                    <h3>{t.noMatches}</h3>
                    <p>{t.tryOtherFilters}</p>
                    <button type="button" onClick={reset}>{t.resetPlayers} <span aria-hidden="true">↗</span></button>
                </div>
            )}
        </div>
    );
};

export default PlayerGrid;
