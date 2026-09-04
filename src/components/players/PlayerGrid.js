import PlayerCard from './PlayerCard';
import { players } from '../../data/players';
import styles from './PlayerGrid.module.css';

const PlayerGrid = ({ lang = 'en', dict }) => {
    return (
        <div>
            <div className={styles.grid}>
                {players.map(player => (
                    <PlayerCard key={player.id} player={player} lang={lang} dict={dict} />
                ))}
            </div>
        </div>
    );
};

export default PlayerGrid;
