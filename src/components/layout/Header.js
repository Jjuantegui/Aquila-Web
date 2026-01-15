import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={`container ${styles.headerContainer}`}>
                <Link href="/" className={styles.logo}>
                    <img src="/assets/logo-mark-dark.png" alt="Aquila SM" style={{ height: '40px', width: 'auto' }} />
                </Link>

                <nav className={styles.nav}>
                    <Link href="/" className={styles.navLink}>Home</Link>
                    <Link href="/#players" className={styles.navLink}>Players</Link>
                    <Link href="/deals" className={styles.navLink}>Deals</Link>
                    <Link href="/#services" className={styles.navLink}>Services</Link>
                    <Link href="/#about" className={styles.navLink}>About</Link>
                    <Link href="/#contact" className={styles.navLinkButton}>Get in touch</Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
