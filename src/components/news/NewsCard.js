import Link from 'next/link';
import { players } from '../../data/players';
import { localePath, longDate } from '../../i18n';
import styles from './News.module.css';

export const newsImage = (item) => {
    if (item.image) return item.image;
    const firstPlayer = (item.playerIds || []).map(id => players.find(p => p.id === id)).find(Boolean);
    return firstPlayer ? firstPlayer.photoUrl : '/assets/hero-banner-v2.jpg';
};

const typeClass = { press: styles.typePress, player: styles.typePlayer };

const NewsCard = ({ item, lang, dict, compact = false }) => {
    const href = localePath(lang, `/news/${item.slug}`);
    const t = dict.news;

    if (compact) {
        return (
            <Link href={href} className={styles.compact}>
                <span className={styles.compactDate}>{longDate(lang, item.date)}</span>
                <span className={styles.compactTitle}>{item.title[lang] || item.title.en}</span>
            </Link>
        );
    }

    return (
        <Link href={href} className={styles.card}>
            <div className={styles.cardImage}>
                <img src={newsImage(item)} alt={item.title[lang] || item.title.en} loading="lazy" />
            </div>
            <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                    <span className={`${styles.typeBadge} ${typeClass[item.type] || ''}`}>{t.types[item.type] || item.type}</span>
                    <span>{longDate(lang, item.date)}</span>
                </div>
                <h3 className={styles.cardTitle}>{item.title[lang] || item.title.en}</h3>
                <p className={styles.cardExcerpt}>{item.excerpt[lang] || item.excerpt.en}</p>
                <span className={styles.cardCta}>{t.readMore} →</span>
            </div>
        </Link>
    );
};

export default NewsCard;
