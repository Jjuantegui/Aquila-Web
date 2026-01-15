import Link from 'next/link';
import { players } from '../../../data/players';
import { deals } from '../../../data/deals';
import { calculateAge } from '../../../utils/dateHelpers';
import { getFlagUrl } from '../../../utils/countryHelpers';
import styles from './page.module.css';

export function generateStaticParams() {
    return players.map((player) => ({
        id: player.id.toString(),
    }));
}

export default async function PlayerProfile({ params }) {
    const { id } = await params;
    const player = players.find((p) => p.id.toString() === id);

    if (!player) {
        return <div className="container section">Player not found</div>;
    }

    const age = calculateAge(player.birthDate);
    const playerDeals = deals.filter(d => d.playerId === parseInt(player.id));

    return (
        <article className={`container section ${styles.profileContainer}`}>
            {/* Breadcrumb / Back */}
            <Link href="/#players" className={styles.backLink}>
                Players <span className={styles.breadcrumb}>/</span> {player.name}
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
                        <span className={styles.statusBadge}>{player.status}</span>
                        <h1 className={styles.name}>{player.name}</h1>
                        <p className={styles.metaPosition}>
                            {player.position}
                            {player.secondaryPosition && <span style={{ opacity: 0.6 }}> / {player.secondaryPosition}</span>}
                            <span style={{ margin: '0 0.8rem', opacity: 0.3 }}>|</span>
                            {player.currentClub}
                        </p>

                        <div className={styles.actions}>
                            {/* Primary CTA: Watch (scroll to video or external) */}
                            {player.videoUrl && (
                                <button className="btn btn-primary">Watch Highlights</button>
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
                            <span className={styles.chipLabel}>Nationality</span>
                            <span className={styles.chipValue}>{player.nationality}</span>
                        </div>
                        <div className={styles.infoChip}>
                            <span className={styles.chipLabel}>Age</span>
                            <span className={styles.chipValue}>{age} Years</span>
                        </div>
                        <div className={styles.infoChip}>
                            <span className={styles.chipLabel}>Preferred Foot</span>
                            <span className={styles.chipValue}>{player.preferredFoot}</span>
                        </div>
                        <div className={styles.infoChip}>
                            <span className={styles.chipLabel}>Height</span>
                            <span className={styles.chipValue}>{player.height || "N/A"}</span>
                        </div>
                        <div className={styles.infoChip}>
                            <span className={styles.chipLabel}>Contract Until</span>
                            <span className={styles.chipValue}>{player.contractUntil || "N/A"}</span>
                        </div>
                    </div>


                    {/* Scouting Report */}
                    <div className={styles.scoutingSection}>
                        <h3 className={styles.sectionTitle}>Scouting Report</h3>
                        <div className={styles.scoutingText}>
                            {player.bioBullets ? (
                                <ul>
                                    {player.bioBullets.map((bullet, index) => (
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
                                    <span key={s} className={styles.strengthChip}>{s}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Timeline (Aquila Movements) */}
                    {playerDeals.length > 0 && (
                        <div>
                            <h3 className={styles.sectionTitle}>Aquila Movements</h3>
                            <div className={styles.timeline}>
                                {playerDeals.map(deal => (
                                    <div key={deal.id} className={styles.timelineItem}>
                                        <div className={styles.timelineDot}></div>
                                        <div className={styles.timelineDate}>{deal.season} • {deal.date}</div>
                                        <div className={styles.timelineContent}>
                                            <div className={styles.timelineTitle}>
                                                {deal.fromClub.name} &rarr; {deal.toClub.name}
                                            </div>
                                            <div className={styles.timelineSubtitle}>
                                                {deal.dealType}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
