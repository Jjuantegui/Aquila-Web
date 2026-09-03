'use client';

import { useState } from 'react';
import styles from './Contact.module.css';

const Contact = ({ dict }) => {
    const [copied, setCopied] = useState(false);
    const email = "j@aquilasports.es";
    const whatsappHref = `https://wa.me/34636321577?text=${encodeURIComponent(dict.whatsappMessage + ' ')}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className={styles.wrapper}>
            <div className={styles.panel}>

                <div className={styles.grid}>
                    {/* EMAIL COLUMN */}
                    <div className={styles.item}>
                        <span className={styles.label}>{dict.email}</span>
                        <span className={styles.value}>{email}</span>
                        <div className={styles.actions}>
                            <a href={`mailto:${email}`} className={`${styles.btn} ${styles.btnPrimary}`}>
                                {dict.emailUs}
                            </a>
                            <button
                                onClick={handleCopy}
                                className={`${styles.btn} ${copied ? styles.btnCopied : styles.btnSecondary}`}
                            >
                                {copied ? dict.copied : dict.copy}
                            </button>
                        </div>
                    </div>

                    {/* SEPARATOR */}
                    <div className={styles.divider}></div>

                    {/* PHONE COLUMN */}
                    <div className={styles.item}>
                        <span className={styles.label}>{dict.phone}</span>
                        <span className={styles.value}>+34 636 321 577</span>
                        <div className={styles.actions}>
                            <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.btn} ${styles.btnPrimary}`}
                            >
                                {dict.whatsapp}
                            </a>
                            <a href="tel:+34636321577" className={`${styles.btn} ${styles.btnSecondary}`}>
                                {dict.call}
                            </a>
                        </div>
                    </div>
                </div>

                <div className={styles.microcopy}>{dict.microcopy}</div>
            </div>
        </section>
    );
};

export default Contact;
