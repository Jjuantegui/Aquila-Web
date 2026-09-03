import Link from 'next/link';
import { notFound } from 'next/navigation';
import { news, getNewsBySlug } from '../../../../data/news';
import { players } from '../../../../data/players';
import { getDictionary, locales, localePath, alternatesFor, longDate } from '../../../../i18n';
import { newsImage } from '../../../../components/news/NewsCard';
import styles from '../../../../components/news/News.module.css';

export const dynamicParams = false;

export function generateStaticParams() {
    return locales.flatMap((lang) => news.map((n) => ({ lang, slug: n.slug })));
}

export async function generateMetadata({ params }) {
    const { lang, slug } = await params;
    const item = getNewsBySlug(slug);
    if (!item) return {};
    const title = item.title[lang] || item.title.en;
    const description = item.excerpt[lang] || item.excerpt.en;
    return {
        title,
        description,
        alternates: alternatesFor(`/news/${slug}`),
        openGraph: {
            title,
            description,
            type: 'article',
            publishedTime: item.date,
            images: [newsImage(item)],
        },
    };
}

export default async function NewsArticle({ params }) {
    const { lang, slug } = await params;
    const dict = getDictionary(lang);
    const t = dict.news;
    const item = getNewsBySlug(slug);
    if (!item) notFound();

    const title = item.title[lang] || item.title.en;
    const excerpt = item.excerpt[lang] || item.excerpt.en;
    const body = item.body[lang] || item.body.en;
    const relatedPlayers = (item.playerIds || []).map(id => players.find(p => p.id === id)).filter(Boolean);
    const url = `https://www.aquilasports.es${localePath(lang, `/news/${item.slug}`)}`;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: title,
        description: excerpt,
        datePublished: item.date,
        image: [`https://www.aquilasports.es${newsImage(item)}`],
        inLanguage: lang,
        author: { '@type': 'Organization', name: 'Aquila Sports Management' },
        publisher: { '@type': 'Organization', name: 'Aquila Sports Management', logo: { '@type': 'ImageObject', url: 'https://www.aquilasports.es/assets/logo-mark-dark.png' } },
        mainEntityOfPage: url,
    };

    return (
        <article className={`container ${styles.article}`} style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <Link href={localePath(lang, '/news')} className={styles.backLink}>← {t.back}</Link>

            <div className={styles.cardMeta}>
                <span className={`${styles.typeBadge} ${item.type === 'press' ? styles.typePress : ''} ${item.type === 'player' ? styles.typePlayer : ''}`}>
                    {t.types[item.type] || item.type}
                </span>
                <time dateTime={item.date}>{longDate(lang, item.date)}</time>
            </div>

            <h1 className={styles.articleTitle}>{title}</h1>
            <p className={styles.articleExcerpt}>{excerpt}</p>

            <div className={styles.articleImage}>
                <img src={newsImage(item)} alt={title} />
            </div>

            <div className={styles.articleBody}>
                {body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
            </div>

            {item.source && item.source.url && (
                <div className={styles.sourceBox}>
                    {t.source}: <a href={item.source.url} target="_blank" rel="noopener noreferrer">{item.source.name}</a>
                </div>
            )}

            <footer className={styles.articleFooter}>
                {relatedPlayers.length > 0 && (
                    <div className={styles.playerLinks}>
                        <span>{t.relatedPlayers}:</span>
                        {relatedPlayers.map(p => (
                            <Link key={p.id} href={localePath(lang, `/players/${p.id}`)} className={styles.playerChip}>{p.name}</Link>
                        ))}
                    </div>
                )}
                <a href={shareUrl} target="_blank" rel="noopener noreferrer" className={styles.shareBtn}>{t.share}</a>
            </footer>
        </article>
    );
}
