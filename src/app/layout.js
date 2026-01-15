import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Aquila Sports Management",
  description: "Boutique agency built on trust. Elite representation.",
  icons: {
    icon: '/assets/logo-mark-dark.png',
    apple: '/assets/logo-mark-dark.png',
  },
};

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <Header />
        <main style={{ minHeight: '80vh', paddingTop: '80px' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
