import Link from 'next/link';
import styles from './Hero.module.css';

const Hero = () => {
    return (
        <section className={styles.hero}>
            {/* Background Banner */}
            <div className={styles.bannerWrapper}>
                <img src="/assets/hero-banner-v2.jpg" alt="Aquila Sports" className={styles.bannerImage} />
                <div className={styles.overlay}></div>
            </div>

            <div className={`container ${styles.heroContainer}`}>
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        A boutique agency <br />
                        <span className={styles.highlight}>built on trust.</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Selective representation with a human approach. We manage careers, not just contracts.
                    </p>
                    <div className={styles.actions}>
                        <Link href="/#players" className={styles.primaryBtn}>
                            Explore Players
                            <span className={styles.btnIcon}>→</span>
                        </Link>
                        <Link href="/deals" className={styles.secondaryBtn}>
                            View Deals
                        </Link>
                    </div>

                    <div className={styles.trustSignals}>
                        <span className={styles.trustChip}>Selective Roster</span>
                        <span className={styles.separator}>·</span>
                        <span className={styles.trustChip}>International Network</span>
                        <span className={styles.separator}>·</span>
                        <span className={styles.trustChip}>Discreet Execution</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
