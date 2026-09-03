import Link from 'next/link';
import { players } from '../../../../data/players';
import { deals } from '../../../../data/deals';
import { getNewsForPlayer } from '../../../../data/news';
import { calculateAge } from '../../../../utils/dateHelpers';
import { getDictionary, locales, localePath, alternatesFor, term, clubLabel, dealDate, fill } from '../../../../i18n';
import NewsCard from '../../../../components/news/NewsCard';
import newsStyles from '../../../../components/news/News.module.css';
import styles from '../../../../components/players/PlayerProfile.module.css';

export function generateStaticParams() {
    return locales.flatMap((lang) =>
        players.map((player) => ({ lang, id: player.id.toString() }))
    );
}

export async function generateMetadata({ params }) {
    const { lang, id } = await params;
    const dict = getDictionary(lang);
    const player = players.find((p) => p.id.toString() === id);
    if (!player) return {};
    return {
        title: { absolute: fill(dict.meta.player, { name: player.name }) },
        description: fill(dict.meta.playerDescription, { name: player.name, position: term(dict, player.position), club: clubLabel(dict, player.currentClub) }),
        alternates: alternatesFor(`/players/${id}`),
        openGraph: {
            title: player.name,
            images: [player.photoUrl],
            type: 'profile',
        },
    };
}

export default async function PlayerProfile({ params }) {
    const { lang, id } = await params;
    const dict = getDictionary(lang);
    const t = dict.players;
    const player = players.find((p) => p.id.toString() === id);

    if (!player) {
        return <div className="container section">{t.notFound}</div>;
    }

    const age = calculateAge(player.birthDate);
    const playerDeals = deals.filter(d => d.playerId === parseInt(player.id));
    const playerNews = getNewsForPlayer(player.id);
    const bullets = (lang === 'es' && player.bioBullets_es) ? player.bioBullets_es : player.bioBullets;

    return (
        <article className={`container section ${styles.profileContainer}`}>
            {/* Breadcrumb / Back */}
            <Link href={localePath(lang, '#players')} className={styles.backLink}>
                {t.breadcrumb} <span className={styles.breadcrumb}>/</span> {player.name}
            </Link>

            <div className={styles.grid}>
                {/* LEFT: Image & Video */}
                <div className={styles.leftColumn}>
                    <div className={styles.imageCard}>
                        <img src={player.photoUrl} alt={player.name} className={styles.image} />
                    </div>

                    {/* Video Embed if available */}
                    {player.videoUrl && (
                        <div className={styles.videoContainer}>
                            <iframe
                                className={styles.videoFrame}
                                src={player.videoUrl}
                                title="Player Highlights"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                </div>

                {/* RIGHT: Info & Stats */}
                <div className={styles.rightColumn}>
                    {/* Header */}
                    <header className={styles.header}>
                        <span className={styles.statusBadge}>{term(dict, player.status)}</span>
                        <h1 className={styles.name}>{player.name}</h1>
                        <p className={styles.metaPosition}>
                            {term(dict, player.position)}
                            {player.secondaryPosition && <span style={{ opacity: 0.6 }}> / {term(dict, player.secondaryPosition)}</span>}
                            <span style={{ margin: '0 0.8rem', opacity: 0.3 }}>|</span>
                            {clubLabel(dict, player.currentClub)}
                        </p>

                        <div className={styles.actions}>
                            {player.videoUrl && (
                                <button className="btn btn-primary">{t.watchHighlights}</button>
                            )}
                            <a
                                href={player.transfermarktUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.linkBtn}
                            >
                                Transfermarkt
                                <svg className={styles.linkIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                    <polyline points="7 7 17 7 17 17"></polyline>
                                </svg>
                            </a>
                            {player.instagramUrl && (
                                <a
                                    href={player.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.linkBtn}
                                    style={{ padding: '0.6rem' }}
                                    title="Instagram"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                    </svg>
                                </a>
                            )}
                        </div>
                    </header>

                    {/* Info Chips Grid */}
                    <div className={styles.infoGrid}>
                        <div className={styles.infoChip}>
                            <span className={styles.chipLabel}>{t.nationality}</span>
                            <span className={styles.chipValue}>{term(dict, player.nationality)}</span>
                        </div>
                        <div className={styles.infoChip}>
                            <span className={styles.chipLabel}>{t.age}</span>
                            <span className={styles.chipValue}>{age} {t.years}</span>
                        </div>
                        <div className={styles.infoChip}>
                            <span className={styles.chipLabel}>{t.preferredFoot}</span>
                            <span className={styles.chipValue}>{term(dict, player.preferredFoot)}</span>
                        </div>
                        <div className={styles.infoChip}>
                            <span className={styles.chipLabel}>{t.height}</span>
                            <span className={styles.chipValue}>{player.height || t.na}</span>
                        </div>
                        <div className={styles.infoChip}>
                            <span className={styles.chipLabel}>{t.contractUntil}</span>
                            <span className={styles.chipValue}>{player.contractUntil || t.na}</span>
                        </div>
                    </div>

                    {/* Scouting Report */}
                    <div className={styles.scoutingSection}>
                        <h3 className={styles.sectionTitle}>{t.scoutingReport}</h3>
                        <div className={styles.scoutingText}>
                            {bullets ? (
                                <ul>
                                    {bullets.map((bullet, index) => (
                                        <li key={index}>{bullet}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>{player.bio}</p>
                            )}
                        </div>
                        {player.strengths && (
                            <div className={styles.strengthsList}>
                                {player.strengths.map(s => (
                                    <span key={s} className={styles.strengthChip}>{term(dict, s)}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Timeline (Aquila Movements) */}
                    {playerDeals.length > 0 && (
                        <div>
                            <h3 className={styles.sectionTitle}>{t.movements}</h3>
                            <div className={styles.timeline}>
                                {playerDeals.map(deal => (
                                    <div key={deal.id} className={styles.timelineItem}>
                                        <div className={styles.timelineDot}></div>
                                        <div className={styles.timelineDate}>{deal.season} • {dealDate(dict, deal.date)}</div>
                                        <div className={styles.timelineContent}>
                                            <div className={styles.timelineTitle}>
                                                {term(dict, deal.fromClub.name)} &rarr; {term(dict, deal.toClub.name)}
                                            </div>
                                            <div className={styles.timelineSubtitle}>
                                                {term(dict, deal.dealType)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Related news */}
                    {playerNews.length > 0 && (
                        <div style={{ marginTop: '3rem' }}>
                            <h3 className={styles.sectionTitle}>{t.relatedNews}</h3>
                            <div className={newsStyles.compactList}>
                                {playerNews.map(item => (
                                    <NewsCard key={item.slug} item={item} lang={lang} dict={dict} compact />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
