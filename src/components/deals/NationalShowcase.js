'use client';

import styles from './NationalShowcase.module.css';

const NationalShowcase = ({ deals }) => {
    // Basic stats
    const total = deals.length;
    const featured = deals[0]; // Pick the latest/first deal as featured
    const timeline = deals.slice(1, 5); // Next 4 deals for timeline

    if (!featured) return null;

    return (
        <section className={styles.container}>
            {/* Header / Summary */}
            <div className={styles.header}>
                <span className={styles.label}>National Market Dominance</span>
                <h2 className={styles.title}>
                    {total} Major<br />Domestic Deals
                </h2>
            </div>

            {/* Featured Deal */}
            <div className={styles.featured}>
                <span className={styles.featuredLabel}>Latest Movement</span>
                <div className={styles.featuredCard}>
                    <h3 className={styles.featuredPlayer}>{featured.playerName}</h3>
                    <div className={styles.featuredRoute}>
                        <span>{featured.fromClub.name}</span>
                        <span className={styles.arrow}>→</span>
                        <span>{featured.toClub.name}</span>
                    </div>
                    <div className={styles.featuredMeta}>
                        <span>{featured.season}</span>
                        <span>•</span>
                        <span>{featured.dealType}</span>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className={styles.timeline}>
                {timeline.map(deal => (
                    <div key={deal.id} className={styles.timelineItem}>
                        <span className={styles.timelineDate}>{deal.date}</span>
                        <h4 className={styles.timelinePlayer}>{deal.playerName}</h4>
                        <div className={styles.timelineClubs}>
                            {deal.fromClub.name} → {deal.toClub.name}
                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
};

export default NationalShowcase;
