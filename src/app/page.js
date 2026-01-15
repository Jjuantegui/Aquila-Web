import Hero from "../components/home/Hero";
import ValuesCarousel from "../components/home/ValuesCarousel";
import GlobalPresenceMap from "../components/home/GlobalPresenceMap";
import PlayerGrid from "../components/players/PlayerGrid";
import Services from "../components/services/Services";

import About from "../components/about/About";
import Contact from "../components/contact/Contact";

export default function Home() {
  return (
    <>
      <Hero />



      {/* 2. THE BOUTIQUE MODEL */}
      <section id="about" className="section container animate-fade-in">
        <About />
      </section>

      {/* 3. OUR SERVICES (SUMMARY) */}
      <section id="services" className="section container animate-fade-in">
        <Services />
      </section>

      {/* 6. PLAYERS */}
      <section id="players" className="section container animate-fade-in">
        <h2 style={{
          fontSize: '2rem',
          marginBottom: '2rem',
          color: 'var(--color-aquila-green)',
          borderBottom: '1px solid var(--color-aquila-green)',
          paddingBottom: '1rem'
        }}>
          Selected Players
        </h2>
        <PlayerGrid />
      </section>

      {/* 5. GLOBAL REACH */}
      <section className="section animate-fade-in" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{
            fontSize: '2rem',
            marginBottom: '2rem',
            color: 'var(--color-aquila-green)',
            borderBottom: '1px solid var(--color-aquila-green)',
            paddingBottom: '1rem'
          }}>
            Global Reach
          </h2>
          <GlobalPresenceMap />
        </div>
      </section>

      {/* 6. WORD CAROUSEL (BRIDGE) */}
      <ValuesCarousel />

      {/* 7. CONTACT US */}
      <section id="contact" className="section container animate-fade-in">
        <h2 style={{
          fontSize: '2rem',
          marginBottom: '2rem',
          color: 'var(--color-aquila-green)',
          borderBottom: '1px solid var(--color-aquila-green)',
          paddingBottom: '1rem'
        }}>
          Contact Us
        </h2>
        <Contact />
      </section>
    </>
  );
}
