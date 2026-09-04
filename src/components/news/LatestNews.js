import Link from 'next/link';
import { sortedNews } from '../../data/news';
import { localePath } from '../../i18n';
import NewsCard from './NewsCard';
import styles from './News.module.css';

const LatestNews = ({ lang, dict, limit = 3 }) => {
    const items = sortedNews().slice(0, limit);
    if (items.length === 0) return null;

    return (
        <section id="news" className="section container animate-fade-in">
            <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>{dict.home.latestNews}</h2>
                <Link href={localePath(lang, '/news')} className={styles.sectionLink}>{dict.home.allNews} →</Link>
            </div>
            <div className={styles.grid}>
                {items.map(item => (
                    <NewsCard key={item.slug} item={item} lang={lang} dict={dict} />
                ))}
            </div>
        </section>
    );
};

export default LatestNews;
