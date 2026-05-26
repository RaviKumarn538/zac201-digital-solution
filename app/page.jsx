import Image from "next/image";
import Header from "./components/Header";
import HeroCarousel from "./components/HeroCarousel";
import MotionReveal from "./components/MotionReveal";
import PricingSection from "./components/PricingSection";

const services = [
  ["Premium Websites", "Fast, polished, conversion-ready business websites."],
  ["Strategy", "Sharp messaging, CTAs, proof, and enquiry flow."],
  ["E-commerce", "Catalogues, checkout-ready pages, and premium product UI."],
  ["Local SEO", "Clean structure for maps, search, and local discovery."],
  ["Brand Direction", "Modern positioning, content, and visual hierarchy."],
  ["Growth Care", "Updates, improvements, and ongoing support."],
];

const work = [
  ["Clinic Website", "Trust-first patient enquiry flow.", "Healthcare", "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=82", "#contact"],
  ["Coaching Website", "Admissions, batches, results, and leads.", "Education", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=82", "#contact"],
  ["Restaurant Website", "Menu, booking, location, and delivery links.", "Hospitality", "https://images.pexels.com/photos/11090935/pexels-photo-11090935.jpeg?auto=compress&cs=tinysrgb&w=1200", "#contact"],
  ["Live Website Case Study", "A deployed product-style local business site.", "Live Project", "/images/zac-living-preview.png", "https://zac-living.onrender.com"],
];

export default function Home() {
  return (
    <>
      <Header />

      <main id="top">
        <section className="hero section-shell">
          <MotionReveal className="hero-copy">
            <div className="trust-pill"><span /> Premium websites for Bhopal businesses</div>
            <h1>Premium websites. Built to convert.</h1>
            <p>Modern web design and development for ambitious local businesses.</p>
            <div className="hero-actions">
              <a className="btn primary" href="https://wa.me/919301942717?text=Hi%20ZAc201%20Digital%20Solutions%2C%20I%20want%20a%20premium%20website%20for%20my%20business.">Get a Premium Website</a>
              <a className="btn secondary" href="#packages">See Packages</a>
            </div>
            <div className="microproof">
              <span><strong>7-21 days</strong> launch</span>
              <span><strong>Mobile-first</strong> UX</span>
              <span><strong>SEO-ready</strong> build</span>
            </div>
          </MotionReveal>
          <MotionReveal className="hero-media-motion" delay={0.12}>
            <HeroCarousel />
          </MotionReveal>
        </section>

        <section className="live-section section-shell" id="live-work">
          <article className="live-card">
            <a className="live-preview" href="https://zac-living.onrender.com" target="_blank" rel="noreferrer">
              <Image src="/images/zac-living-preview.png" alt="Screenshot preview of Zac.Living live website" width={1280} height={720} priority />
            </a>
            <div className="live-copy">
              <span className="kicker">Live case study</span>
              <h2>Real project. Premium execution.</h2>
              <p>Clean UI, search flow, listings, and responsive product pages.</p>
              <div className="split-actions">
                <a className="btn primary" href="https://zac-living.onrender.com" target="_blank" rel="noreferrer">View Live Website</a>
                <a className="btn secondary" href="#contact">Build Mine</a>
              </div>
            </div>
          </article>
        </section>

        <section className="trust-band section-shell">
          {[["30+", "business categories supported"], ["5", "conversion touchpoints per page"], ["100%", "responsive delivery focus"], ["Bhopal", "local market understanding"]].map(([stat, label]) => (
            <div className="stat-card" key={label}><strong>{stat}</strong><span>{label}</span></div>
          ))}
        </section>

        <section className="content-section" id="services">
          <div className="section-head">
            <span className="kicker">Services</span>
            <h2>Premium digital presence, built with intent.</h2>
          </div>
          <div className="card-grid service-grid">
            {services.map(([title, text]) => (
              <article className="premium-card" key={title}>
                <span className="card-icon">✦</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section proof-section">
          <div>
            <span className="kicker">Why ZAc201</span>
            <h2>Built for quick trust.</h2>
          </div>
          <div className="proof-stack">
            {["Instant clarity", "Premium visual depth", "WhatsApp-ready CTAs", "Proof-led sections"].map((item) => (
              <div key={item}>{"\u2713"} <span>{item}</span></div>
            ))}
          </div>
        </section>

        <section className="content-section" id="work">
          <div className="section-head">
            <span className="kicker">Work</span>
            <h2>Premium website directions.</h2>
          </div>
          <div className="work-grid">
            {work.map(([title, text, tag, src, href]) => (
              <article className="work-card" key={title}>
                <a className="work-visual" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  <Image src={src} alt={`${title} preview`} fill sizes="(max-width: 768px) 82vw, 25vw" loading="eager" />
                  <span>{tag}</span>
                </a>
                <h3>{title}</h3>
                <p>{text}</p>
                <a className="text-link" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {href.startsWith("http") ? "View live website" : "Discuss similar project"} {"\u2192"}
                </a>
              </article>
            ))}
          </div>
        </section>

        <PricingSection />

        <section className="content-section faq-section" id="faq">
          <div className="section-head">
            <span className="kicker">FAQ</span>
            <h2>Quick answers.</h2>
          </div>
          <div className="faq-list">
            {[
              ["How fast can we launch?", "Most business sites launch in 7 to 21 days."],
              ["What if I have no content?", "We shape the copy, sections, and presentation."],
              ["Is it mobile-first?", "Yes. Mobile experience is designed first."],
            ].map(([question, answer]) => (
              <details className="faq-item" key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="final-cta section-shell" id="contact">
          <div>
            <span className="kicker">Start now</span>
            <h2>Launch a sharper website.</h2>
            <p>Send your business name and goal.</p>
          </div>
          <a className="btn primary" href="https://wa.me/919301942717?text=Hi%20ZAc201%20Digital%20Solutions%2C%20I%20want%20a%20premium%20website%20for%20my%20business.">Start on WhatsApp</a>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <a className="footer-logo" href="#top">ZAc201 Digital Solutions</a>
            <p className="footer-tagline">Build. Launch. Grow.</p>
            <p>Premium websites for Bhopal businesses.</p>
          </div>
          <div>
            <h3>Explore</h3>
            <a href="#services">Services</a>
            <a href="#live-work">Live Work</a>
            <a href="#work">Portfolio</a>
            <a href="#packages">Packages</a>
          </div>
          <div>
            <h3>Contact</h3>
            <a href="mailto:contact.zac201@gmail.com">contact.zac201@gmail.com</a>
            <a href="https://wa.me/919301942717" target="_blank" rel="noreferrer">+91 9301942717</a>
            <span>Bhopal, Madhya Pradesh</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{"\u00a9"} 2026 ZAc201 Digital Solutions.</span>
          <span>Build. Launch. Grow.</span>
        </div>
      </footer>
    </>
  );
}
