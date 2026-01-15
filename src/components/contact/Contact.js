'use client';

import { useState } from 'react';
import styles from './Contact.module.css';

const Contact = () => {
    const [copied, setCopied] = useState(false);
    const email = "j@aquilasports.es";

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
                        <span className={styles.label}>Email</span>
                        <span className={styles.value}>{email}</span>
                        <div className={styles.actions}>
                            <a href={`mailto:${email}`} className={`${styles.btn} ${styles.btnPrimary}`}>
                                Email Us ↗
                            </a>
                            <button
                                onClick={handleCopy}
                                className={`${styles.btn} ${copied ? styles.btnCopied : styles.btnSecondary}`}
                            >
                                {copied ? "Copied ✓" : "Copy"}
                            </button>
                        </div>
                    </div>

                    {/* SEPARATOR */}
                    <div className={styles.divider}></div>

                    {/* PHONE COLUMN */}
                    <div className={styles.item}>
                        <span className={styles.label}>Phone & WhatsApp</span>
                        <span className={styles.value}>+34 636 321 577</span>
                        <div className={styles.actions}>
                            <a
                                href="https://wa.me/34636321577"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.btn} ${styles.btnPrimary}`}
                            >
                                WhatsApp ↗
                            </a>
                            <a href="tel:+34636321577" className={`${styles.btn} ${styles.btnSecondary}`}>
                                Call
                            </a>
                        </div>
                    </div>
                </div>

                <div className={styles.microcopy}>
                    Discreet. Fast. Direct. — Typically reply within 24h.
                </div>
            </div>
        </section>
    );
};

export default Contact;
