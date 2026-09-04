import styles from './About.module.css';

const About = ({ dict }) => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h3 className={styles.heading}>{dict.heading}</h3>
                <p className={styles.text}>{dict.text}</p>
                {/* Standards Block - Simple Text Flow */}
                <div className={styles.standardsBlock}>
                    <div className={styles.standardsContent}>
                        <span className={styles.standardsKicker}>{dict.kicker}</span>
                        <h4 className={styles.standardsHeadline}>{dict.headline}</h4>
                        <p className={styles.standardsText}>
                            <strong>{dict.strongA}</strong>{dict.body}<strong>{dict.strongB}</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
