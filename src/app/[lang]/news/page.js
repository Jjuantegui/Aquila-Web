import { sortedNews } from '../../../data/news';
import { getDictionary, alternatesFor } from '../../../i18n';
import NewsList from '../../../components/news/NewsList';
import styles from '../../../components/news/News.module.css';

export async function generateMetadata({ params }) {
    const { lang } = await params;
    const dict = getDictionary(lang);
    return {
        title: { absolute: dict.meta.news.title },
        description: dict.meta.news.description,
        alternates: alternatesFor('/news'),
    };
}

export default async function NewsPage({ params }) {
    const { lang } = await params;
    const dict = getDictionary(lang);
    const items = sortedNews();

    return (
        <section className="container" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
            <header className={styles.pageHead}>
                <h1 className={styles.pageTitle}>{dict.news.title}</h1>
                <p className={styles.pageIntro}>{dict.news.intro}</p>
            </header>
            <NewsList items={items} lang={lang} dict={dict} />
        </section>
    );
}
