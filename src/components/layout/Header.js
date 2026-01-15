'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className={styles.header}>
            <div className={`container ${styles.headerContainer}`}>
                {/* LOGO */}
                <Link href="/" className={styles.logo} onClick={closeMenu}>
                    <img src="/assets/logo-mark-dark.png" alt="Aquila SM" style={{ height: '40px', width: 'auto' }} />
                </Link>

                {/* DESKTOP NAV */}
                <nav className={styles.nav}>
                    <Link href="/" className={styles.navLink}>Home</Link>
                    <Link href="/#players" className={styles.navLink}>Players</Link>
                    <Link href="/deals" className={styles.navLink}>Deals</Link>
                    <Link href="/#services" className={styles.navLink}>Services</Link>
                    <Link href="/#about" className={styles.navLink}>About</Link>
                    <Link href="/#contact" className={styles.navLinkButton}>Get in touch</Link>
                </nav>

                {/* HAMBURGER BUTTON (Mobile) */}
                <button
                    className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* MOBILE OVERLAY */}
                <div className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.open : ''}`}>
                    <Link href="/" className={styles.mobileNavLink} onClick={closeMenu}>Home</Link>
                    <Link href="/#players" className={styles.mobileNavLink} onClick={closeMenu}>Players</Link>
                    <Link href="/deals" className={styles.mobileNavLink} onClick={closeMenu}>Deals</Link>
                    <Link href="/#services" className={styles.mobileNavLink} onClick={closeMenu}>Services</Link>
                    <Link href="/#about" className={styles.mobileNavLink} onClick={closeMenu}>About</Link>
                    <Link href="/#contact" className={`${styles.navLinkButton} ${styles.mobileNavButton}`} onClick={closeMenu}>Get in touch</Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
