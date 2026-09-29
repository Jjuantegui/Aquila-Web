import Link from 'next/link';
import { deals } from '../../data/deals';
import { dealDate, fill, localePath, term } from '../../i18n';
import styles from './FeaturedDeals.module.css';

export default function FeaturedDeals({ lang, dict }) {
    const t = dict.featuredDeals;
    const selected = deals
        .filter(deal => Number.isInteger(deal.homepageOrder))
        .sort((a, b) => a.homepageOrder - b.homepageOrder)
        .slice(0, 3);

    if (!selected.length) return null;

    return (
        <section id="selected-deals" className={`section ${styles.section}`} aria-labelledby="selected-deals-title">
            <div className="container">
                <div className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>{t.eyebrow}</p>
                        <h2 id="selected-deals-title" className={styles.title}>{t.title}</h2>
                    </div>
                    <div className={styles.intro}>
                        <p>{t.intro}</p>
                        <Link href={localePath(lang, '/deals')} className={styles.allLink}>
                            {t.viewAll} <span aria-hidden="true">↗</span>
                        </Link>
                    </div>
                </div>
                <div className={styles.grid}>
                    {selected.map((deal, index) => (
                        <article key={deal.id} className={styles.card}>
                            <div className={styles.edition}>
                                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                                <span>{dealDate(dict, deal.date)}</span>
                            </div>
                            <p className={styles.type}>{deal.intermediation ? dict.deals.intermediation : deal.dealType === 'Free Transfer' ? t.freeTransfer : term(dict, deal.dealType)}</p>
                            <h3 className={styles.player}>{deal.playerName}</h3>
                            <ol className={styles.route}>
                                <li>
                                    <span className={styles.place}>{t.from} · {term(dict, deal.fromClub.country)}</span>
                                    <span className={styles.club}>{term(dict, deal.fromClub.name)}</span>
                                </li>
                                <li>
                                    <span className={styles.place}>{t.to} · {term(dict, deal.toClub.country)}</span>
                                    <span className={styles.club}>{term(dict, deal.toClub.name)}</span>
                                </li>
                            </ol>
                            <Link href={localePath(lang, `/deals#deal-${deal.id}`)} className={styles.dealLink} aria-label={fill(t.viewDealFor, { name: deal.playerName })}>
                                {dict.deals.viewDeal} <span aria-hidden="true">↗</span>
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
