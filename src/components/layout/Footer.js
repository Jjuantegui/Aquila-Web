import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footerContainer}`}>
                <div className={styles.column}>
                    <div className={styles.logo}>
                        <img src="/assets/logo-mark-beige.png" alt="Aquila SM" style={{ height: '50px', width: 'auto' }} />
                    </div>
                    <p className={styles.tagline}>A boutique agency built on trust.</p>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.heading}>Navigation</h4>
                    <Link href="/" className={styles.link}>Home</Link>
                    <Link href="/#players" className={styles.link}>Players</Link>
                    <Link href="/#services" className={styles.link}>Services</Link>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.heading}>Socials</h4>
                    <a href="https://www.instagram.com/aquilasportsm/" target="_blank" rel="noopener noreferrer" className={styles.link}>Instagram</a>
                    <a href="https://www.linkedin.com/company/aquila-sports-management/" target="_blank" rel="noopener noreferrer" className={styles.link}>LinkedIn</a>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.heading}>Contact</h4>
                    <a href="mailto:j@aquilasports.es" className={styles.link}>j@aquilasports.es</a>
                    <a href="tel:+34636321577" className={styles.link}>+34 636 321 577</a>
                </div>
            </div>
            <div className={`container ${styles.copyright}`}>
                &copy; {new Date().getFullYear()} Aquila Sports Management. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
