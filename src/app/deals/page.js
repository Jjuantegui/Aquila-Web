'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deals } from '../../data/deals';
import styles from './page.module.css';
import dynamic from 'next/dynamic';
// Dynamic import for DealsMap to avoid hydration errors with SVG paths
const DealsMap = dynamic(() => import('../../components/deals/DealsMap'), { ssr: false });
import NationalShowcase from '../../components/deals/NationalShowcase';
import { getFlagUrl } from '../../utils/countryHelpers';

export default function DealsPage() {
    const [activeTab, setActiveTab] = useState('All'); // All | National | International
    const [highlightedId, setHighlightedId] = useState(null);

    // Filter Logic
    const filteredDeals = deals.filter(deal => {
        if (activeTab === 'All') return true;
        return deal.scope === activeTab;
    }).sort((a, b) => {
        const months = { "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5, "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11 };
        const parseDate = (d) => {
            const [mon, year] = d.split(' ');
            return new Date(year, months[mon.substring(0, 3)]);
        };
        return parseDate(b.date) - parseDate(a.date);
    });

    // Stats Calculation
    const stats = {
        count: filteredDeals.length,
        countries: new Set(filteredDeals.flatMap(d => [d.fromClub.country, d.toClub.country]).filter(Boolean)).size,
        seasons: new Set(filteredDeals.map(d => d.season)).size
    };

    return (

        <main className={styles.main}>

            <div className={styles.splitLayout}>

                {/* LEFT COLUMN: SCROLLABLE LIST */}
                <div className={styles.scrollableContent}>

                    {/* DASHBOARD STATS */}
                    <div className={styles.statsDashboard}>
                        <div className={styles.dashboardValues}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{stats.count}</span>
                                <span className={styles.statLabel}>Deals Closed</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{stats.countries}</span>
                                <span className={styles.statLabel}>Countries Involved</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{stats.seasons}</span>
                                <span className={styles.statLabel}>Active Seasons</span>
                            </div>
                        </div>

                        {/* CONTROLS */}
                        <div className={styles.controlsBar}>
                            <div className={styles.toggleContainer}>
                                {['All', 'International', 'National'].map(tab => (
                                    <button
                                        key={tab}
                                        className={`${styles.toggleBtn} ${activeTab === tab ? styles.active : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className={styles.secondaryFilters}>
                                <select className={styles.filterSelect}>
                                    <option>2025/26</option>
                                    <option>2026/27</option>
                                    <option>All Seasons</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* DEALS GRID */}
                    <div className={styles.grid}>
                        {filteredDeals.map(deal => (
                            <div
                                key={deal.id}
                                className={styles.card}
                                onMouseEnter={() => setHighlightedId(deal.id)}
                                onMouseLeave={() => setHighlightedId(null)}
                            >
                                <div className={styles.cardHeader}>
                                    {deal.playerId ? (
                                        <Link href={`/players/${deal.playerId}`} style={{ textDecoration: 'none' }}>
                                            <h3 className={styles.cardTitle}>{deal.playerName}</h3>
                                        </Link>
                                    ) : (
                                        <h3 className={styles.cardTitle}>{deal.playerName}</h3>
                                    )}
                                    <div className={styles.badges}>
                                        <span className={styles.badge}>{deal.dealType}</span>
                                        {deal.intermediation && (
                                            <span className={`${styles.badge} ${styles.badgeIntermediation}`}>Intermediation</span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.transferRoute}>
                                    {/* FROM */}
                                    <div className={styles.club}>
                                        {getFlagUrl(deal.fromClub.country) && (
                                            <img src={getFlagUrl(deal.fromClub.country)} alt={deal.fromClub.country} className={styles.flag} />
                                        )}
                                        <span>{deal.fromClub.name}</span>
                                    </div>

                                    <span className={styles.arrow} size={20}>→</span>

                                    {/* TO */}
                                    <div className={styles.club}>
                                        {getFlagUrl(deal.toClub.country) && (
                                            <img src={getFlagUrl(deal.toClub.country)} alt={deal.toClub.country} className={styles.flag} />
                                        )}
                                        <span>{deal.toClub.name}</span>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <span className={styles.date}>{deal.season} · {deal.date}</span>
                                    <div className={styles.actions}>
                                        {deal.links.transfermarkt && (
                                            <a href={deal.links.transfermarkt} target="_blank" rel="noopener noreferrer" className={styles.linkWrapper}>
                                                <span className={styles.linkText}>View Deal</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* RIGHT COLUMN: STICKY MAP */}
                <div className={styles.stickyMapColumn}>
                    {activeTab === 'National' ? (
                        <NationalShowcase deals={filteredDeals} />
                    ) : (
                        <div className={styles.mapContainer}>
                            <DealsMap
                                deals={filteredDeals}
                                filter={activeTab}
                                highlightedId={highlightedId}
                            />
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
