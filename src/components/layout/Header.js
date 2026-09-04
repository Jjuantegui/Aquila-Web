'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localePath, stripLocale } from '../../i18n/config';
import styles from './Header.module.css';

const Header = ({ lang = 'en', dict }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname() || '/';

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    // Same page, other language
    const otherLang = lang === 'es' ? 'en' : 'es';
    const switchHref = localePath(otherLang, stripLocale(pathname));

    const links = [
        { href: localePath(lang, '/'), label: dict.home },
        { href: localePath(lang, '#players'), label: dict.players },
        { href: localePath(lang, '/deals'), label: dict.deals },
        { href: localePath(lang, '/news'), label: dict.news },
        { href: localePath(lang, '#services'), label: dict.services },
        { href: localePath(lang, '#about'), label: dict.about },
    ];

    return (
        <header className={styles.header}>
            <div className={`container ${styles.headerContainer}`}>
                {/* LOGO */}
                <Link href={localePath(lang, '/')} className={styles.logo} onClick={closeMenu}>
                    <img src="/assets/logo-mark-dark.png" alt="Aquila SM" style={{ height: '40px', width: 'auto' }} />
                </Link>

                {/* DESKTOP NAV */}
                <nav className={styles.nav}>
                    {links.map(l => (
                        <Link key={l.href} href={l.href} className={styles.navLink}>{l.label}</Link>
                    ))}
                    <Link href={switchHref} className={styles.langSwitch} aria-label={dict.switchLabel} hrefLang={otherLang}>
                        {otherLang.toUpperCase()}
                    </Link>
                    <Link href={localePath(lang, '#contact')} className={styles.navLinkButton}>{dict.contact}</Link>
                </nav>

                {/* HAMBURGER BUTTON (Mobile) */}
                <button
                    className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`}
                    onClick={toggleMenu}
                    aria-label={dict.toggleMenu}
                    aria-expanded={isMenuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* MOBILE OVERLAY */}
                <div className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.open : ''}`}>
                    {links.map(l => (
                        <Link key={l.href} href={l.href} className={styles.mobileNavLink} onClick={closeMenu}>{l.label}</Link>
                    ))}
                    <Link href={switchHref} className={styles.mobileNavLink} onClick={closeMenu} hrefLang={otherLang}>
                        {dict.switchTo}
                    </Link>
                    <Link href={localePath(lang, '#contact')} className={`${styles.navLinkButton} ${styles.mobileNavButton}`} onClick={closeMenu}>{dict.contact}</Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
