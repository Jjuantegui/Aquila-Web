import { Inter, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { getDictionary, locales, isLocale, alternatesFor } from "../../i18n";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return {
    metadataBase: new URL("https://www.aquilasports.es"),
    title: {
      default: dict.meta.home.title,
      template: "%s | Aquila Sports Management",
    },
    description: dict.meta.home.description,
    alternates: alternatesFor("/"),
    openGraph: {
      siteName: dict.meta.siteName,
      locale: lang === "es" ? "es_ES" : "en_GB",
      type: "website",
      images: ["/assets/hero-banner-v2.jpg"],
    },
    icons: {
      icon: "/assets/logo-mark-dark.png",
      apple: "/assets/logo-mark-dark.png",
    },
  };
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <html lang={lang}>
      <body className={`${inter.variable} ${playfair.variable}`}>
        <Header lang={lang} dict={dict.nav} />
        <main style={{ minHeight: "80vh", paddingTop: "80px" }}>
          {children}
        </main>
        <Footer lang={lang} dict={dict} />
      </body>
    </html>
  );
}
