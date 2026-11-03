import styles from './Ribbon.module.css';

// Cinta con texto en bucle, como la cinta del reel B. El texto va duplicado para el bucle sin salto y oculto a
// lectores de pantalla; una copia completa queda disponible visualmente oculta. Con reduced motion no se mueve.
// size: small (portada, ficha) | large (valores). accent: color de fondo (por defecto salvia).
export default function Ribbon({ text, items, size = 'small', accent, color, className = '', speed }) {
    const content = items ? items.join('  ·  ') + '  ·  ' : text;
    const style = {};
    if (accent) style['--ribbon-bg'] = accent;
    if (color) style['--ribbon-fg'] = color;
    if (speed) style['--ribbon-speed'] = `${speed}s`;
    return (
        <div className={`${styles.ribbon} ${size === 'large' ? styles.large : ''} ${className}`.trim()} style={style}>
            <span className="visually-hidden">{content}</span>
            <div className={styles.track} aria-hidden="true">
                <span>{content}</span><span>{content}</span>
            </div>
        </div>
    );
}
