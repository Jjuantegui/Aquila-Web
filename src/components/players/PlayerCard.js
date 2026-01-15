import Link from 'next/link';
// import Image from 'next/image'; // Can use Image for optimization, but placeholders for now
import { calculateAge } from '../../utils/dateHelpers';
import styles from './PlayerCard.module.css';

const PlayerCard = ({ player }) => {
    const age = calculateAge(player.birthDate);

    return (
        <Link href={`/players/${player.id}`} className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={player.photoUrl} alt={player.name} className={styles.image} />
                <div className={styles.gradient}></div>
            </div>

            <span className={styles.statusBadge}>{player.status}</span>

            <div className={styles.info}>
                <h3 className={styles.name}>{player.name}</h3>
                <p className={styles.meta}>
                    {player.position} <span className={styles.separator}>•</span> {age} <span className={styles.separator}>•</span> {player.nationality}
                </p>
                <span className={styles.cta}>
                    View Profile
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </span>
            </div>
        </Link>
    );
};

export default PlayerCard;
