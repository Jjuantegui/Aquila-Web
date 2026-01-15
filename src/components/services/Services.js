import Link from 'next/link';
import styles from './Services.module.css';

const Services = () => {
    const SERVICE_ROWS = [
        {
            id: 'rep',
            title: 'Representation',
            bullets: ['Career strategy & contracts', 'Daily off-pitch support'],
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            )
        },
        {
            id: 'inter',
            title: 'Intermediation',
            bullets: ['Club-to-club negotiations', 'Discreet global execution'],
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
            )
        },
        {
            id: 'spon',
            title: 'Sponsorship',
            bullets: ['Brand alignment strategy', 'Long-term partnerships'],
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
            )
        }
    ];

    return (
        <div className={styles.container}>
            {/* LEFT COLUMN: Editorial */}
            <div className={styles.leftColumn}>
                <span className={styles.label}>Our Services</span>
                <h2 className={styles.headline}>
                    Three pillars. <br />
                    One standard: trust.
                </h2>
                <p className={styles.body}>
                    We represent, negotiate, and build commercial value — with a selective, hands-on approach.
                </p>
            </div>

            {/* RIGHT COLUMN: Feature Rows */}
            <div className={styles.rightColumn}>
                {SERVICE_ROWS.map((service) => (
                    <Link href="/services" key={service.id} className={styles.serviceRow} style={{ textDecoration: 'none' }}>
                        <div className={styles.iconWrapper}>
                            {service.icon}
                        </div>

                        <div className={styles.rowContent}>
                            <h3 className={styles.rowTitle}>{service.title}</h3>
                            <div className={styles.rowBullets}>
                                {service.bullets.map((bullet, i) => (
                                    <div key={i} className={styles.bulletItem}>
                                        {bullet}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.linkWrapper}>
                            Explore <span>→</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Services;
