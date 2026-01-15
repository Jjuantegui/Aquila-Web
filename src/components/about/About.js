import styles from './About.module.css';

const About = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h3 className={styles.heading}>The Boutique Model</h3>
                <p className={styles.text}>
                    We keep a finite roster to protect what matters most: time, attention, and outcomes. Quality over quantity isn’t a slogan — it’s our operating model. By staying selective, we can be present when decisions need to be made, move quickly when opportunities appear, and support our players beyond the contract. Fewer clients means deeper work, clearer strategy, and better execution — every step of the way.
                </p>
                {/* Standards Block - Simple Text Flow */}
                <div className={styles.standardsBlock}>
                    <div className={styles.standardsContent}>
                        <span className={styles.standardsKicker}>Our Standards</span>
                        <h4 className={styles.standardsHeadline}>Selective by design.</h4>
                        <p className={styles.standardsText}>
                            <strong>We’re selective by design.</strong> We don’t chase volume — we build partnerships. We work with players who show up every day: committed to the craft, ambitious, and grounded in strong values. <strong>Talent matters. Character matters more.</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
