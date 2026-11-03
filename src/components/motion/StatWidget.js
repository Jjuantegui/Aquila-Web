import CountUp from './CountUp';
import styles from './StatWidget.module.css';

// Widgets del reel C «Marcador vivo», en SVG/CSS. kind: minutes (anillo hasta 90' + 6 tramos de 15') · gauge
// (medidor 0–10) · dots (fichas n/m) · bar (%) · pips (fichas apiladas ≤ 20, barra si más) · number (solo cifra).
// Entra dentro de un Reveal «items»: el trazo se anima con transform/stroke-dashoffset y la cifra con CountUp.
// accent: color del club (solo en fichas); por defecto salvia.
const R = 26, C = 2 * Math.PI * R;

export default function StatWidget({ kind = 'number', value, max, label, suffix = '', decimals = 0, accent, lang, index = 0 }) {
    const num = Number(value) || 0;
    const style = { '--i': index };
    if (accent) style['--accent'] = accent;
    let frac = 0, body = null;

    if (kind === 'minutes') {
        frac = Math.min(1, num / 90);
        body = (
            <div className={styles.minutes}>
                <svg viewBox="0 0 64 64" className={styles.ring} aria-hidden="true">
                    <circle cx="32" cy="32" r={R} className={styles.ringBg} />
                    <circle cx="32" cy="32" r={R} className={`${styles.ringFg} m-ring`} style={{ strokeDasharray: C, '--dasharray': C, '--dash': C * (1 - frac) }} />
                </svg>
                <span className={styles.ringNum}><CountUp value={num} suffix="'" lang={lang} delay={0.35 + index * 0.45} /></span>
                <div className={styles.segments}>
                    {[0, 1, 2, 3, 4, 5].map(i => <i key={i} className={`m-seg ${num >= i * 15 + 1 ? styles.on : ''}`} style={{ '--k': i }} />)}
                </div>
            </div>
        );
    } else if (kind === 'gauge') {
        frac = Math.min(1, num / 10);
        const half = Math.PI * R;
        body = (
            <div className={styles.gauge}>
                <svg viewBox="0 0 64 36" className={styles.arc} aria-hidden="true">
                    <path d="M6 32 A26 26 0 0 1 58 32" className={styles.ringBg} />
                    <path d="M6 32 A26 26 0 0 1 58 32" className={`${styles.ringFg} m-ring`} style={{ strokeDasharray: half, '--dasharray': half, '--dash': half * (1 - frac) }} />
                </svg>
                <span className={styles.gaugeNum}><CountUp value={num} decimals={decimals || 1} lang={lang} delay={0.35 + index * 0.45} /></span>
            </div>
        );
    } else if (kind === 'dots') {
        const total = Math.min(16, Number(max) || num);
        body = (
            <div className={styles.dots}>
                <span className={styles.num}><CountUp value={num} lang={lang} delay={0.35 + index * 0.45} />/{max}</span>
                <div className={styles.dotRow}>{Array.from({ length: total }, (_, i) => <i key={i} className={`m-seg ${i < num ? styles.on : ''}`} style={{ '--k': i }} />)}</div>
            </div>
        );
    } else if (kind === 'bar') {
        frac = Math.min(1, num / (Number(max) || 100));
        body = (
            <div className={styles.barWrap}>
                <span className={styles.num}><CountUp value={num} suffix={suffix || '%'} decimals={decimals} lang={lang} delay={0.35 + index * 0.45} /></span>
                <div className={styles.bar}><i className="m-grow" style={{ width: `${frac * 100}%` }} /></div>
            </div>
        );
    } else if (kind === 'pips') {
        body = (
            <div className={styles.pipsWrap}>
                <span className={styles.num}><CountUp value={num} suffix={suffix} lang={lang} delay={0.35 + index * 0.45} /></span>
                {num <= 20
                    ? <div className={styles.pips}>{Array.from({ length: Math.max(1, num) }, (_, i) => <i key={i} className="m-seg" style={{ '--k': i, '--n': Math.max(1, num) }} />)}</div>
                    : <div className={styles.bar}><i className="m-grow" style={{ width: '100%' }} /></div>}
            </div>
        );
    } else {
        body = <span className={styles.num}><CountUp value={num} suffix={suffix} decimals={decimals} lang={lang} delay={0.35 + index * 0.45} /></span>;
    }

    return (
        <div className={`${styles.card} m-rise`} style={style}>
            <span className={styles.label}>{label}</span>
            {body}
        </div>
    );
}
