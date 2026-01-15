import styles from './ValuesCarousel.module.css';

const VALUES = [
    "Transparency",
    "Dedication",
    "Integrity",
    "International",
    "Comfort",
    "Long-term Vision"
];

const ValuesCarousel = () => {
    // Duplicate values enough times to ensure smooth scrolling on wide screens
    // and to create the seamless loop effect
    const carouselItems = [...VALUES, ...VALUES, ...VALUES, ...VALUES];

    return (
        <div className={styles.carouselContainer}>
            <div className={styles.track}>
                {carouselItems.map((value, index) => (
                    <span key={index} className={styles.item}>
                        {value}
                        <span className={styles.separator}></span>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ValuesCarousel;
