import Image from 'next/image';
import Link from 'next/link';
import { localePath } from '../../i18n/config';
import styles from './Hero.module.css';

const Hero = ({ lang = 'en', dict }) => (
    <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
            <div className={styles.content}>
                <p className={styles.eyebrow}>{dict.eyebrow}</p>
                <h1 className={styles.title}>
                    {dict.titleA}
                    <span className={styles.highlight}>{dict.titleB}</span>
                </h1>
                <p className={styles.subtitle}>{dict.subtitle}</p>
                <div className={styles.actions}>
                    <Link href={localePath(lang, '#players')} className={styles.primaryBtn}>
                        {dict.explorePlayers} <span aria-hidden="true">↗</span>
                    </Link>
                    <Link href={localePath(lang, '/deals')} className={styles.secondaryBtn}>
                        {dict.viewDeals} <span aria-hidden="true">→</span>
                    </Link>
                </div>
                <ul className={styles.trustSignals}>
                    {dict.chips.map(chip => <li key={chip}>{chip}</li>)}
                </ul>
            </div>
            <Link href={localePath(lang, '/players/8')} className={styles.portrait} aria-label={dict.featuredLink}>
                <Image
                    src="/assets/brand/julio-melbourne-smile.jpg"
                    alt="Julio Cascante — Melbourne City"
                    fill
                    sizes="(max-width: 760px) 100vw, 45vw"
                    priority
                    className={styles.photo}
                />
                <div className={styles.caption}>
                    <span className={styles.captionLabel}>{dict.featured}</span>
                    <div className={styles.captionRow}><span>Julio Cascante</span><span aria-hidden="true">↗</span></div>
                    <span className={styles.club}>Melbourne City · Australia</span>
                </div>
            </Link>
        </div>
    </section>
);

export default Hero;
