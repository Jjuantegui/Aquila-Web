'use client';

import { useId, useState } from 'react';
import styles from './CopyLinkButton.module.css';

export default function CopyLinkButton({ url, label, dict }) {
    const [state, setState] = useState('idle');
    const inputId = useId();
    const copy = async () => {
        setState('copying');
        try {
            await navigator.clipboard.writeText(url);
            setState('copied');
        } catch {
            setState('manual');
        }
    };

    return (
        <div className={styles.wrapper}>
            <button type="button" className={styles.button} onClick={copy} disabled={state === 'copying'}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <rect x="8" y="8" width="12" height="12" rx="1" />
                    <path d="M15 4H4v11" />
                </svg>
                {state === 'copied' ? dict.linkCopied : label}
            </button>
            <span role="status" className={styles.srOnly}>{state === 'copied' ? dict.linkCopied : state === 'manual' ? dict.copyManually : ''}</span>
            {state === 'manual' && (
                <div className={styles.fallback}>
                    <label htmlFor={inputId}>{dict.copyManually}</label>
                    <input id={inputId} readOnly value={url} onFocus={event => event.currentTarget.select()} />
                </div>
            )}
        </div>
    );
}
