'use client';

import { useState } from 'react';
import Link from 'next/link';
import { localePath } from '../../i18n/config';
import styles from './ServicesDetailed.module.css';

const ServicesDetailed = ({ lang = 'en', dict }) => {
    const t = dict.detailed;
    const [activeIndex, setActiveIndex] = useState(0);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className={styles.section}>
            <div className={`container ${styles.container}`}>

                {/* LEFT COLUMN */}
                <div className={styles.leftColumn}>
                    <span className={styles.label}>{dict.label}</span>
                    <h2 className={styles.headline}>{t.headlineA}<br />{t.headlineB}</h2>
                    <p className={styles.intro}>{t.intro}</p>

                    <div className={styles.actions}>
                        <Link href={localePath(lang, '#contact')} className={styles.primaryBtn}>
                            {t.getInTouch}
                        </Link>
                        <Link href={localePath(lang, '/deals')} className={styles.secondaryLink}>
                            {t.viewDeals} <span>→</span>
                        </Link>
                    </div>
                </div>

                {/* RIGHT COLUMN - ACCORDION */}
                <div className={styles.accordion}>
                    {t.items.map((item, index) => {
                        const isActive = activeIndex === index;

                        return (
                            <div
                                key={index}
                                className={`${styles.accordionItem} ${isActive ? styles.active : ''}`}
                            >
                                <button
                                    className={styles.accordionHeader}
                                    onClick={() => toggleAccordion(index)}
                                    aria-expanded={isActive}
                                >
                                    <h3 className={styles.itemTitle}>{item.title}</h3>
                                    <span className={styles.icon}>{isActive ? '−' : '+'}</span>
                                </button>

                                <div
                                    className={styles.accordionContent}
                                    style={{ height: isActive ? 'auto' : 0 }}
                                >
                                    <div className={styles.accordionContentInner}>
                                        <div className={styles.microSection}>
                                            <span className={styles.microLabel}>{t.whatWeDo}</span>
                                            <ul className={styles.checkList}>
                                                {item.whatWeDo.map((line, i) => <li key={i}>{line}</li>)}
                                            </ul>
                                        </div>

                                        <div className={styles.microSection}>
                                            <span className={styles.microLabel}>{t.howWeWork}</span>
                                            <ul className={styles.checkList}>
                                                {item.howWeWork.map((line, i) => <li key={i}>{line}</li>)}
                                            </ul>
                                        </div>

                                        <div className={styles.microSection}>
                                            <span className={styles.microLabel}>{t.outcomes}</span>
                                            <p className={styles.outcomeText}>{item.outcomes}</p>
                                        </div>

                                        <Link href={localePath(lang, '#contact')} className={styles.itemFooterLink}>
                                            {t.discuss}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};

export default ServicesDetailed;
