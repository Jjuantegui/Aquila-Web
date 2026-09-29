import Image from 'next/image';
import Link from 'next/link';
import { calculateAge } from '../../utils/dateHelpers';
import { localePath, term, clubLabel } from '../../i18n';
import styles from './PlayerCard.module.css';

const PlayerCard = ({ player, lang = 'en', dict }) => (
    <Link href={localePath(lang, `/players/${player.id}`)} className={styles.card}>
        <div className={styles.imageContainer}>
            <Image src={player.photoUrl} alt={player.name} className={styles.image} fill sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, (min-width: 1400px) 25vw, 33vw" />
        </div>
        <div className={styles.info}>
            <span className={styles.statusBadge}>{term(dict, player.status)}</span>
            <h3 className={styles.name}>{player.name}</h3>
            <p className={styles.club}>{clubLabel(dict, term(dict, player.currentClub))}</p>
            <p className={styles.meta}>
                <span>{term(dict, player.position)}</span>
                <span aria-hidden="true">·</span>
                <span>{calculateAge(player.birthDate)}</span>
                <span aria-hidden="true">·</span>
                <span>{term(dict, player.nationality)}</span>
            </p>
            <span className={styles.cta}>{dict.players.viewProfile}<span aria-hidden="true">↗</span></span>
        </div>
    </Link>
);

export default PlayerCard;
