import styles from './Knockout.module.css';

// Titular en «knockout» como MATCH / DAY del reel A: verde sobre beige y, donde pasa por encima del bloque verde,
// beige. Son dos capas con el mismo texto; la segunda va recortada con clip-path a la columna del bloque y oculta
// a lectores de pantalla. Las dos entran deslizando 120 px desde la izquierda (.m-knock) dentro de un Reveal «items».
// `block` es el contenido del bloque verde (imagen, isotipo…); `children`, lo que va debajo del titular.
export default function Knockout({ as: Tag = 'h2', text, block, children, className = '' }) {
    return (
        <div className={`${styles.wrap} ${className}`.trim()}>
            <div className={styles.block}>{block}</div>
            <Tag className={`${styles.text} m-knock`}>{text}</Tag>
            <div className={`${styles.text} ${styles.over} m-knock`} aria-hidden="true">{text}</div>
            {children && <div className={styles.below}>{children}</div>}
        </div>
    );
}
