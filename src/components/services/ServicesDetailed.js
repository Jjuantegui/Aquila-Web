'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './ServicesDetailed.module.css';

const ServicesDetailed = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const SERVICES_DATA = [
        {
            title: "Representation",
            whatWeDo: [
                "Career planning: next step, right league, right timing.",
                "Contract negotiation: salary, bonuses, options, clauses, protection.",
                "Club relationship management: alignment with sporting directors and coaches."
            ],
            howWeWork: [
                "Small roster, high availability. You have direct access.",
                "We move fast, stay discreet, and keep decisions player-first."
            ],
            outcomes: "Better opportunities, stronger contracts, fewer mistakes."
        },
        {
            title: "Intermediation",
            whatWeDo: [
                "Identify the right counterpart and open the right door.",
                "Structure deals: permanent, loan, option/obligation, free moves.",
                "Coordinate all parties: clubs, legal, agents, player, compliance."
            ],
            howWeWork: [
                "Discreet execution and clear communication.",
                "Focus on closing: timelines, documents, approvals."
            ],
            outcomes: "Faster deals, fewer frictions, cleaner execution."
        },
        {
            title: "Sponsorship",
            whatWeDo: [
                "Brand positioning: story, image, and market fit.",
                "Partner sourcing: brands that align with the player’s values.",
                "Deal negotiation: deliverables, rights, usage, protection."
            ],
            howWeWork: [
                "Authentic partnerships over one-off campaigns.",
                "Clear assets, clear expectations, measurable value."
            ],
            outcomes: "Better partners, longer deals, stronger personal brand."
        }
    ];

    return (
        <section className={styles.section}>
            <div className={`container ${styles.container}`}>

                {/* LEFT COLUMN */}
                <div className={styles.leftColumn}>
                    <span className={styles.label}>OUR SERVICES</span>
                    <h2 className={styles.headline}>What we do —<br />end to end.</h2>
                    <p className={styles.intro}>
                        We cover the full cycle: sporting decisions, contract execution, and commercial growth — with a selective, hands-on approach.
                    </p>

                    <div className={styles.actions}>
                        <Link href="/#contact" className={styles.primaryBtn}>
                            Get in touch
                        </Link>
                        <Link href="/deals" className={styles.secondaryLink}>
                            View Deals <span>→</span>
                        </Link>
                    </div>
                </div>

                {/* RIGHT COLUMN - ACCORDION */}
                <div className={styles.accordion}>
                    {SERVICES_DATA.map((item, index) => {
                        const isActive = activeIndex === index;

                        return (
                            <div
                                key={index}
                                className={`${styles.accordionItem} ${isActive ? styles.active : ''}`}
                            >
                                <button
                                    className={styles.accordionHeader}
                                    onClick={() => toggleAccordion(index)}
                                >
                                    <h3 className={styles.itemTitle}>{item.title}</h3>
                                    <span className={styles.icon}>{isActive ? '−' : '+'}</span>
                                </button>

                                <div
                                    className={styles.accordionContent}
                                    style={{ height: isActive ? 'auto' : 0 }}
                                >
                                    {/* Inner wrapper needed for animation padding calculation */}
                                    <div className={styles.accordionContentInner}>

                                        {/* WHAT WE DO */}
                                        <div className={styles.microSection}>
                                            <span className={styles.microLabel}>WHAT WE DO</span>
                                            <ul className={styles.checkList}>
                                                {item.whatWeDo.map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* HOW WE WORK */}
                                        <div className={styles.microSection}>
                                            <span className={styles.microLabel}>HOW WE WORK</span>
                                            <ul className={styles.checkList}>
                                                {item.howWeWork.map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* OUTCOMES */}
                                        <div className={styles.microSection}>
                                            <span className={styles.microLabel}>TYPICAL OUTCOMES</span>
                                            <p className={styles.outcomeText}>{item.outcomes}</p>
                                        </div>

                                        <Link href="/#contact" className={styles.itemFooterLink}>
                                            Discuss a case →
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
