import styles from './ValuesCarousel.module.css';

const ValuesCarousel = ({ values = [] }) => {
    // Duplicate values enough times to ensure smooth scrolling on wide screens
    // and to create the seamless loop effect
    const carouselItems = [...values, ...values, ...values, ...values];

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
