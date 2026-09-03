import en from './en';
import es from './es';
import { defaultLocale } from './config';

const dictionaries = { en, es };

export const getDictionary = (lang) => dictionaries[lang] || dictionaries[defaultLocale];

/** Fills '{name}' style placeholders in a dictionary string */
export const fill = (template, vars = {}) =>
    Object.keys(vars).reduce((out, k) => out.split(`{${k}}`).join(vars[k]), template);

/** Translates an enumerated data value (position, status, deal type...). Falls back to the original. */
export const term = (dict, value) => {
    if (!value) return value;
    return (dict.terms && dict.terms[value]) || value;
};

/** "Sydney FC - Australia" -> "Sydney FC - Australia" / "Sydney FC - Australia" with country translated */
export const clubLabel = (dict, label) => {
    if (!label) return label;
    const parts = label.split(' - ');
    if (parts.length !== 2) return label;
    return `${parts[0]} - ${term(dict, parts[1])}`;
};

/** "Sep 2025" -> "Sep 2025" (en) / "Sep 2025" (es), month abbreviations translated */
export const dealDate = (dict, date) => {
    if (!date) return date;
    const [mon, year] = date.split(' ');
    return `${(dict.months && dict.months[mon]) || mon} ${year}`;
};

/** ISO date "2026-02-10" -> localized long date */
export const longDate = (lang, iso) => {
    const d = new Date(`${iso}T12:00:00Z`);
    return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
};

export { localePath, locales, defaultLocale, isLocale, stripLocale, alternatesFor } from './config';
