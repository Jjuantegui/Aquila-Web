'use client';

import { useState } from 'react';
import { newsTypes } from '../../data/news';
import NewsCard from './NewsCard';
import styles from './News.module.css';

const NewsList = ({ items, lang, dict }) => {
    const t = dict.news;
    const [type, setType] = useState('all');
    const visible = items.filter(n => type === 'all' || n.type === type);
    const available = newsTypes.filter(ty => items.some(n => n.type === ty));

    return (
        <>
            <div className={styles.filters}>
                <button className={`${styles.filterBtn} ${type === 'all' ? styles.filterActive : ''}`} onClick={() => setType('all')}>{t.all}</button>
                {available.map(ty => (
                    <button key={ty} className={`${styles.filterBtn} ${type === ty ? styles.filterActive : ''}`} onClick={() => setType(ty)}>
                        {t.types[ty]}
                    </button>
                ))}
            </div>
            {visible.length === 0 ? (
                <p className={styles.empty}>{t.empty}</p>
            ) : (
                <div className={styles.grid}>
                    {visible.map(item => (
                        <NewsCard key={item.slug} item={item} lang={lang} dict={dict} />
                    ))}
                </div>
            )}
        </>
    );
};

export default NewsList;
