import { aquilaNumbers } from '../../lib/numbers';
import Reveal from '../motion/Reveal';
import CountUp from '../motion/CountUp';
import styles from './InNumbers.module.css';

// «Aquila in numbers», como el reel D «Dato héroe»: una cifra protagonista que cuenta y tres tarjetas con fichas.
// Todas las cifras salen de src/lib/numbers.js (players.js, deals.js); nunca se escriben a mano.
export default function InNumbers({ lang, dict }) {
    const t = dict.inNumbers;
    const n = aquilaNumbers();
    const cards = [
        { key: 'players', label: t.players, value: n.players },
        { key: 'deals', label: t.deals, value: n.deals },
        { key: 'leagues', label: t.leagues, value: n.leagues },
    ];
    return (
        <Reveal as="section" id="numbers" variant="items" className={`section ${styles.section}`} aria-labelledby="numbers-title">
            <img src="/assets/logo-mark-dark.png" alt="" className={styles.iso} aria-hidden="true" />
            <div className="container">
                <p id="numbers-title" className={`${styles.eyebrow} m-rise`}>{t.eyebrow}</p>
                <div className={styles.hero}>
                    <div className={`${styles.heroFigure} m-rise`}><CountUp value={n.countries} duration={1.4} delay={0.2} lang={lang} /></div>
                    <p className={`${styles.heroLabel} m-rise`} style={{ '--d': '0.6s' }}>{t.countries}</p>
                    <div className={styles.heroBar}><i className="m-grow" style={{ '--d': '0.2s' }} /></div>
                </div>
                <div className={styles.cards}>
                    {cards.map((card, i) => (
                        <div key={card.key} className={`${styles.card} m-rise`} style={{ '--i': i, '--stagger': '0.35s', '--d': '1.2s' }}>
                            <span className={styles.label}>{card.label}</span>
                            <span className={styles.figure}><CountUp value={card.value} duration={1} delay={1.5 + i * 0.35} lang={lang} /></span>
                            <div className={styles.pips} aria-hidden="true">
                                {Array.from({ length: Math.min(card.value, 20) }, (_, k) => <i key={k} style={{ '--k': k, '--n': Math.min(card.value, 20), '--i': i }} />)}
                            </div>
                        </div>
                    ))}
                </div>
                <p className={styles.note}>{t.note}</p>
            </div>
        </Reveal>
    );
}
