'use client';

import styles from './NationalShowcase.module.css';

import { term, dealDate } from '../../i18n';

const NationalShowcase = ({ deals, dict }) => {
    const t = dict.deals;
    // Basic stats
    const total = deals.length;
    const featured = deals[0]; // Pick the latest/first deal as featured
    const timeline = deals.slice(1, 5); // Next 4 deals for timeline

    if (!featured) return null;

    return (
        <section className={styles.container}>
            {/* Header / Summary */}
            <div className={styles.header}>
                <span className={styles.label}>{t.nationalLabel}</span>
                <h2 className={styles.title}>
                    {total} {t.nationalTitleA}<br />{t.nationalTitleB}
                </h2>
            </div>

            {/* Featured Deal */}
            <div className={styles.featured}>
                <span className={styles.featuredLabel}>{t.latestMovement}</span>
                <div className={styles.featuredCard}>
                    <h3 className={styles.featuredPlayer}>{featured.playerName}</h3>
                    <div className={styles.featuredRoute}>
                        <span>{term(dict, featured.fromClub.name)}</span>
                        <span className={styles.arrow}>→</span>
                        <span>{term(dict, featured.toClub.name)}</span>
                    </div>
                    <div className={styles.featuredMeta}>
                        <span>{featured.season}</span>
                        <span>•</span>
                        <span>{term(dict, featured.dealType)}</span>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className={styles.timeline}>
                {timeline.map(deal => (
                    <div key={deal.id} className={styles.timelineItem}>
                        <span className={styles.timelineDate}>{dealDate(dict, deal.date)}</span>
                        <h4 className={styles.timelinePlayer}>{deal.playerName}</h4>
                        <div className={styles.timelineClubs}>
                            {term(dict, deal.fromClub.name)} → {term(dict, deal.toClub.name)}
                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
};

export default NationalShowcase;
