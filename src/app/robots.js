export default function robots() {
    return {
        // /d (dossieres privados), /admin (panel) y /api no deben indexarse.
        rules: { userAgent: '*', allow: '/', disallow: ['/d/', '/admin/', '/api/'] },
        sitemap: 'https://www.aquilasports.es/sitemap.xml',
    };
}
