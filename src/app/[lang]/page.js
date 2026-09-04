import Hero from "../../components/home/Hero";
import ValuesCarousel from "../../components/home/ValuesCarousel";
import GlobalPresenceMap from "../../components/home/GlobalPresenceMap";
import PlayerGrid from "../../components/players/PlayerGrid";
import Services from "../../components/services/Services";
import LatestNews from "../../components/news/LatestNews";

import About from "../../components/about/About";
import Contact from "../../components/contact/Contact";
import { getDictionary, alternatesFor } from "../../i18n";

const sectionTitleStyle = {
  fontSize: '2rem',
  marginBottom: '2rem',
  color: 'var(--color-aquila-green)',
  borderBottom: '1px solid var(--color-aquila-green)',
  paddingBottom: '1rem'
};

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return {
    title: { absolute: dict.meta.home.title },
    description: dict.meta.home.description,
    alternates: alternatesFor("/"),
  };
}

export default async function Home({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <>
      <Hero lang={lang} dict={dict.hero} />

      {/* 1. LATEST NEWS */}
      <LatestNews lang={lang} dict={dict} />

      {/* 2. THE BOUTIQUE MODEL */}
      <section id="about" className="section container animate-fade-in">
        <About dict={dict.about} />
      </section>

      {/* 3. OUR SERVICES (SUMMARY) */}
      <section id="services" className="section container animate-fade-in">
        <Services lang={lang} dict={dict.services} />
      </section>

      {/* 4. PLAYERS */}
      <section id="players" className="section container animate-fade-in">
        <h2 style={sectionTitleStyle}>{dict.home.players}</h2>
        <PlayerGrid lang={lang} dict={dict} />
      </section>

      {/* 5. GLOBAL REACH */}
      <section className="section animate-fade-in" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={sectionTitleStyle}>{dict.home.globalReach}</h2>
          <GlobalPresenceMap />
        </div>
      </section>

      {/* 6. WORD CAROUSEL (BRIDGE) */}
      <ValuesCarousel values={dict.values} />

      {/* 7. CONTACT US */}
      <section id="contact" className="section container animate-fade-in">
        <h2 style={sectionTitleStyle}>{dict.home.contact}</h2>
        <Contact dict={dict.contact} />
      </section>
    </>
  );
}
