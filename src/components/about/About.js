import Knockout from '../motion/Knockout';
import styles from './About.module.css';

const About = ({ dict }) => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h3 className={`${styles.heading} m-rise`}>{dict.heading}</h3>
                <p className={`${styles.text} m-rise`} style={{ '--d': '0.15s' }}>{dict.text}</p>
                {/* Criterio en knockout (MATCH / DAY del reel A) sobre un bloque verde con el isotipo */}
                <div className={styles.standardsBlock}>
                    <Knockout as="h4" text={dict.headline} className={styles.knockout}
                        block={<img src="/assets/logo-mark-beige.png" alt="" className={styles.knockoutIso} aria-hidden="true" />}>
                        <span className={`${styles.standardsKicker} m-rise`} style={{ '--d': '0.5s' }}>{dict.kicker}</span>
                        <p className={`${styles.standardsText} m-rise`} style={{ '--d': '0.6s' }}>
                            <strong>{dict.strongA}</strong>{dict.body}<strong>{dict.strongB}</strong>
                        </p>
                    </Knockout>
                </div>
            </div>
        </div>
    );
};

export default About;
