import Link from 'next/link';
import { localePath } from '../../i18n/config';
import styles from './Footer.module.css';

const Footer = ({ lang = 'en', dict }) => {
    const t = dict.footer;
    const nav = dict.nav;
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footerContainer}`}>
                <div className={styles.column}>
                    <div className={styles.logo}>
                        <img src="/assets/logo-mark-beige.png" alt="Aquila SM" style={{ height: '50px', width: 'auto' }} />
                    </div>
                    <p className={styles.tagline}>{t.tagline}</p>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.heading}>{t.navigation}</h4>
                    <Link href={localePath(lang, '/')} className={styles.link}>{nav.home}</Link>
                    <Link href={localePath(lang, '#players')} className={styles.link}>{nav.players}</Link>
                    <Link href={localePath(lang, '/deals')} className={styles.link}>{nav.deals}</Link>
                    <Link href={localePath(lang, '/news')} className={styles.link}>{nav.news}</Link>
                    <Link href={localePath(lang, '/services')} className={styles.link}>{nav.services}</Link>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.heading}>{t.socials}</h4>
                    <a href="https://www.instagram.com/aquilasportsm/" target="_blank" rel="noopener noreferrer" className={styles.link}>Instagram</a>
                    <a href="https://www.linkedin.com/company/aquila-sports-management/" target="_blank" rel="noopener noreferrer" className={styles.link}>LinkedIn</a>
                </div>

                <div className={styles.column}>
                    <h4 className={styles.heading}>{t.contact}</h4>
                    <a href="mailto:j@aquilasports.es" className={styles.link}>j@aquilasports.es</a>
                    <a href="tel:+34636321577" className={styles.link}>+34 636 321 577</a>
                </div>
            </div>
            <div className={`container ${styles.copyright}`}>
                &copy; {new Date().getFullYear()} Aquila Sports Management. {t.rights}
            </div>
        </footer>
    );
};

export default Footer;
