import Image from "next/image";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import styles from "./admin.module.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const playfair = Playfair_Display({
    variable: "--font-playfair",
    subsets: ["latin"],
    weight: ["400", "500", "600"],
});

export const metadata = {
    title: "Panel privado · Aquila Sports Management",
    robots: "noindex",
    icons: { icon: "/assets/logo-mark-dark.png" },
};

/** Root layout del panel privado (vive fuera de [lang], sin cabecera ni pie públicos). */
export default function AdminLayout({ children }) {
    return (
        <html lang="es">
            <body className={`${inter.variable} ${playfair.variable}`}>
                <header className={styles.topbar}>
                    <div className={`container ${styles.topbarInner}`}>
                        <Image src="/assets/logo-mark-beige.png" alt="Aquila SM" width={36} height={36} className={styles.logo} priority />
                        <span className={styles.topbarTitle}>Panel privado</span>
                    </div>
                </header>
                <main className={styles.main}>{children}</main>
            </body>
        </html>
    );
}
