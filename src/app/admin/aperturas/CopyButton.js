"use client";

import { useState } from "react";
import styles from "./aperturas.module.css";

export default function CopyButton({ text, label = "Copiar" }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            window.prompt("Copia el enlace:", text);
        }
    };

    return (
        <button type="button" onClick={copy} className={styles.copyBtn} title={text}>
            {copied ? "Copiado ✓" : label}
        </button>
    );
}
