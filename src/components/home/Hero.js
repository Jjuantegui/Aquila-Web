import Link from 'next/link';
import { localePath } from '../../i18n/config';
import styles from './Hero.module.css';

const Hero = ({ lang = 'en', dict }) => {
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
                        {dict.titleA} <br />
                        <span className={styles.highlight}>{dict.titleB}</span>
                    </h1>
                    <p className={styles.subtitle}>{dict.subtitle}</p>
                    <div className={styles.actions}>
                        <Link href={localePath(lang, '#players')} className={styles.primaryBtn}>
                            {dict.explorePlayers}
                            <span className={styles.btnIcon}>→</span>
                        </Link>
                        <Link href={localePath(lang, '/deals')} className={styles.secondaryBtn}>
                            {dict.viewDeals}
                        </Link>
                    </div>

                    <div className={styles.trustSignals}>
                        {dict.chips.map((chip, i) => (
                            <span key={chip} style={{ display: 'contents' }}>
                                {i > 0 && <span className={styles.separator}>·</span>}
                                <span className={styles.trustChip}>{chip}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
