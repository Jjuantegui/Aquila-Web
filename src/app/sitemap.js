import { players } from '../data/players';
import { news } from '../data/news';
import { localePath } from '../i18n/config';

const BASE = 'https://www.aquilasports.es';

export default function sitemap() {
    const paths = [
        { path: '/', priority: 1 },
        { path: '/deals', priority: 0.9 },
        { path: '/news', priority: 0.9 },
        { path: '/services', priority: 0.7 },
        ...players.map((p) => ({ path: `/players/${p.id}`, priority: 0.8 })),
        ...news.map((n) => ({ path: `/news/${n.slug}`, priority: 0.6, lastModified: n.date })),
    ];

    return paths.flatMap(({ path, priority, lastModified }) =>
        ['en', 'es'].map((lang) => ({
            url: `${BASE}${localePath(lang, path)}`,
            lastModified: lastModified ? new Date(lastModified) : new Date(),
            priority,
            alternates: {
                languages: {
                    en: `${BASE}${localePath('en', path)}`,
                    es: `${BASE}${localePath('es', path)}`,
                },
            },
        }))
    );
}
