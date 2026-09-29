'use client';

import Image from 'next/image';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localePath, stripLocale } from '../../i18n/config';
import usePlayerFilters from '../players/usePlayerFilters';
import { hasPlayerFilters, playerListPath } from '../players/playerFilters.mjs';
import styles from './Header.module.css';

const Header = ({ lang = 'en', dict }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const toggleRef = useRef(null);
    const pathname = usePathname() || '/';
    const { filters: playerFilters } = usePlayerFilters();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    useEffect(() => {
        if (!isMenuOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        menuRef.current?.querySelector('a')?.focus();
        const onResize = () => { if (window.innerWidth > 1080) setIsMenuOpen(false); };
        window.addEventListener('resize', onResize);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('resize', onResize);
        };
    }, [isMenuOpen]);

    const handleMenuKey = (event) => {
        if (!isMenuOpen) return;
        if (event.key === 'Escape') {
            closeMenu();
            toggleRef.current?.focus();
        }
        if (event.key === 'Tab') {
            const items = [toggleRef.current, ...menuRef.current.querySelectorAll('a')];
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    };

    // Same page, other language
    const otherLang = lang === 'es' ? 'en' : 'es';
    const switchHref = stripLocale(pathname) === '/' && hasPlayerFilters(playerFilters)
        ? playerListPath(localePath(otherLang, '/'), playerFilters)
        : localePath(otherLang, stripLocale(pathname));

    const links = [
        { href: localePath(lang, '/'), label: dict.home },
        { href: localePath(lang, '#players'), label: dict.players },
        { href: localePath(lang, '/deals'), label: dict.deals },
        { href: localePath(lang, '/news'), label: dict.news },
        { href: localePath(lang, '#services'), label: dict.services },
        { href: localePath(lang, '#about'), label: dict.about },
    ];

    return (
        <header className={styles.header} onKeyDown={handleMenuKey}>
            <div className={`container ${styles.headerContainer}`}>
                {/* LOGO */}
                <Link href={localePath(lang, '/')} className={styles.logo} onClick={closeMenu}>
                    <Image sizes="280px" src="/assets/brand/aquila-primary-green.png" alt="Aquila Sports Management" width="1400" height="420" />
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
                    ref={toggleRef}
                    aria-controls="mobile-navigation"
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
                <div id="mobile-navigation" ref={menuRef} inert={!isMenuOpen} className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.open : ''}`}>
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
