export const locales = ['en', 'es'];
export const defaultLocale = 'en';

export const isLocale = (value) => locales.includes(value);

/**
 * Builds a locale-aware path.
 * English lives at the root (/deals), Spanish under /es (/es/deals).
 * Hash-only paths ("#players") resolve to the localized home.
 */
export const localePath = (lang, path = '/') => {
    if (path.startsWith('#')) {
        return lang === defaultLocale ? `/${path}` : `/${lang}${path}`;
    }
    if (lang === defaultLocale) return path;
    if (path === '/') return `/${lang}`;
    return `/${lang}${path}`;
};

/** Strips any locale prefix from a pathname: /es/deals -> /deals, /en -> / (rewrites expose /en internally) */
export const stripLocale = (pathname) => {
    for (const l of locales) {
        if (pathname === `/${l}`) return '/';
        if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
    }
    return pathname;
};

/** hreflang alternates for a canonical (unprefixed) path */
export const alternatesFor = (path) => ({
    canonical: path,
    languages: {
        en: localePath('en', path),
        es: localePath('es', path),
        'x-default': localePath('en', path),
    },
});
