import Link from 'next/link';
import { localePath } from '../../i18n/config';
import Reveal from '../motion/Reveal';
import Ribbon from '../motion/Ribbon';
import HeroVideo from './HeroVideo';
import styles from './Hero.module.css';

// Palabra a palabra: cada palabra es un <span> con --i para el escalonado; el <h1> sigue siendo un solo texto legible.
const Words = ({ text, offset = 0 }) => text.split(' ').map((word, i, all) => (
    <span key={i} className={styles.word} style={{ '--i': i + offset }}>{word}{i < all.length - 1 ? ' ' : ''}</span>
));

const Hero = ({ lang = 'en', dict }) => {
    const wordsA = dict.titleA.split(' ').length;
    return (
        <Reveal as="section" variant="items" immediate className={styles.hero}>
            <img src="/assets/logo-mark-beige.png" alt="" className={styles.iso} aria-hidden="true" />
            <HeroVideo lang={lang} dict={dict} />
            <div className={`container ${styles.content}`}>
                <h1 className={styles.title}>
                    <span className={styles.lineA}><Words text={dict.titleA} /></span>
                    <span className={styles.lineB}><Words text={dict.titleB} offset={wordsA} /></span>
                </h1>
                <p className="visually-hidden">{dict.eyebrow}</p>
                <Ribbon items={dict.ribbon} className={styles.ribbon} speed={18} />
                <div className={`${styles.actions} m-rise`}>
                    <Link href={localePath(lang, '#players')} className={styles.primaryBtn}>
                        {dict.explorePlayers} <span aria-hidden="true">↗</span>
                    </Link>
                    <Link href={localePath(lang, '/deals')} className={styles.secondaryBtn}>
                        {dict.viewDeals} <span aria-hidden="true">→</span>
                    </Link>
                </div>
                <ul className={styles.trustSignals}>
                    {dict.chips.map((chip, i) => <li key={chip} className="m-rise" style={{ '--i': i }}>{chip}</li>)}
                </ul>
            </div>
            <a href="#players" className={styles.scrollHint} aria-label={dict.scroll}><span /></a>
        </Reveal>
    );
};

export default Hero;
