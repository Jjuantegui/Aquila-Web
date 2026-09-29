import { fill, localePath } from '../../i18n';
import styles from './PlayerContact.module.css';

export default function PlayerContact({ player, lang, dict }) {
    const t = dict.players;
    const profileUrl = `https://www.aquilasports.es${localePath(lang, `/players/${player.id}`)}`;
    const message = `${fill(t.contactMessage, { name: player.name })}\n\n${profileUrl}`;
    const emailHref = `mailto:j@aquilasports.es?subject=${encodeURIComponent(fill(t.contactSubject, { name: player.name }))}&body=${encodeURIComponent(message)}`;

    return (
        <section id="player-contact" className={styles.panel} aria-labelledby="player-contact-title">
            <p className={styles.label}>{t.directContact}</p>
            <h2 id="player-contact-title" className={styles.title}>{t.contactTitle}</h2>
            <p className={styles.description}>{player.status === 'Free Agent' ? t.freeAgentContact : t.playerContact}</p>
            <div className={styles.actions}>
                <a href={`https://wa.me/34636321577?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className={styles.whatsapp}>
                    {t.contactWhatsapp} <span aria-hidden="true">↗</span>
                </a>
                <a href={emailHref} className={styles.email}>{t.contactEmail} <span aria-hidden="true">↗</span></a>
            </div>
        </section>
    );
}
