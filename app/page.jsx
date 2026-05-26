import Image from "next/image";
import Header from "./components/Header";
import HeroCarousel from "./components/HeroCarousel";
import MotionReveal from "./components/MotionReveal";
import PricingSection from "./components/PricingSection";

const services = [
  ["Premium Business Websites", "High-end landing pages and multi-page websites built for credibility, speed, and customer action."],
  ["Conversion Strategy", "Hero messaging, CTA hierarchy, proof placement, pricing flow, and enquiry paths designed around buyer psychology."],
  ["E-commerce & Catalogues", "Product showcases, order flows, WhatsApp commerce, payment-ready layouts, and premium product presentation."],
  ["Local SEO Foundation", "Clean headings, metadata, service pages, location intent, maps, and Google-friendly structure."],
  ["Brand & Content Direction", "Sharper positioning, premium copywriting, visual hierarchy, and trust-building section architecture."],
  ["Care, Updates & Growth", "Ongoing improvements, content changes, landing page iteration, analytics review, and technical maintenance."],
];

const work = [
  ["Clinic Growth Site", "Doctor profiles, treatment pages, appointment CTA, patient FAQs, and trust-first layout.", "Healthcare", "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=82", "#contact"],
  ["Coaching Admission Site", "Course structure, results highlights, batch enquiry, parent trust, and lead capture.", "Education", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=82", "#contact"],
  ["Restaurant Brand Site", "Menu, ambience, location, booking, delivery links, and event promotion.", "Hospitality", "https://images.pexels.com/photos/11090935/pexels-photo-11090935.jpeg?auto=compress&cs=tinysrgb&w=1200", "#contact"],
  ["Zac.Living Live Website", "A real deployed website with listing discovery, search experience, detailed pages, and Bhopal-focused user flow.", "Live Project", "/images/zac-living-preview.png", "https://zac-living.onrender.com"],
];

export default function Home() {
  return (
    <>
      <Header />

      <main id="top">
        <section className="hero section-shell">
          <MotionReveal className="hero-copy">
            <div className="trust-pill"><span /> Premium websites for Bhopal businesses</div>
            <h1>Websites that make your business look trusted, modern, and ready to buy from.</h1>
            <p>ZAc201 Digital Solutions designs and builds high-conversion websites for MSMEs, startups, clinics, coaching institutes, hotels, restaurants, shops, and service brands.</p>
            <div className="hero-actions">
              <a className="btn primary" href="https://wa.me/919301942717?text=Hi%20ZAc201%20Digital%20Solutions%2C%20I%20want%20a%20premium%20website%20for%20my%20business.">Get a Premium Website</a>
              <a className="btn secondary" href="#packages">See Packages</a>
            </div>
            <div className="microproof">
              <span><strong>7-21 days</strong> launch window</span>
              <span><strong>Mobile-first</strong> customer journey</span>
              <span><strong>SEO-ready</strong> page structure</span>
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
              <span className="kicker">Live website built</span>
              <h2>Zac.Living live website is now part of our portfolio.</h2>
              <p>A deployed website with listing discovery, search experience, detailed pages, and Bhopal-focused user flow.</p>
              <div className="split-actions">
                <a className="btn primary" href="https://zac-living.onrender.com" target="_blank" rel="noreferrer">View Live Website</a>
                <a className="btn secondary" href="#contact">Build Similar Website</a>
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
            <h2>Not just a website. A premium sales surface for your business.</h2>
            <p>Every section is designed to reduce doubt, create trust, and move visitors toward calling, messaging, booking, enquiring, or buying.</p>
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
            <h2>Designed for the way local customers actually decide.</h2>
            <p>Most visitors scan the first screen, look for proof, compare effort, and choose the easiest trustworthy option.</p>
          </div>
          <div className="proof-stack">
            {["Clear positioning within the first 5 seconds", "Premium visual depth without clutter", "WhatsApp, calls, enquiries, bookings, and directions", "Trust sections for reviews, credentials, FAQs, and sample work"].map((item) => (
              <div key={item}>✓ <span>{item}</span></div>
            ))}
          </div>
        </section>

        <section className="content-section" id="work">
          <div className="section-head">
            <span className="kicker">Portfolio directions</span>
            <h2>Premium website systems for different business models.</h2>
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
                  {href.startsWith("http") ? "View live website" : "Discuss similar project"} →
                </a>
              </article>
            ))}
          </div>
        </section>

        <PricingSection />

        <section className="content-section faq-section" id="faq">
          <div className="section-head">
            <span className="kicker">FAQ</span>
            <h2>Reduce doubt before the first conversation.</h2>
          </div>
          <div className="faq-list">
            {[
              ["How fast can my website launch?", "Most small business websites can launch in 7 to 21 days depending on pages, content, approvals, and integrations."],
              ["Can you make my business look premium if I do not have content?", "Yes. We help shape service copy, section flow, CTA wording, FAQs, and visual presentation."],
              ["Will it work well on mobile?", "Yes. The layout is designed mobile-first because most local discovery and WhatsApp enquiries begin on phones."],
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
            <h2>Your website should make customers feel confident before they ever call.</h2>
            <p>Send your business name, industry, location, and goal. We will help shape the best website direction.</p>
          </div>
          <a className="btn primary" href="https://wa.me/919301942717?text=Hi%20ZAc201%20Digital%20Solutions%2C%20I%20want%20a%20premium%20website%20for%20my%20business.">Start on WhatsApp</a>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <a className="footer-logo" href="#top">ZAc201 Digital Solutions</a>
            <p className="footer-tagline">Build. Launch. Grow.</p>
            <p>Premium website development for Bhopal-based MSMEs, startups, shops, institutes, hotels, clinics, restaurants, and service businesses.</p>
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
          <span>© 2026 ZAc201 Digital Solutions. All rights reserved.</span>
          <span>Professional websites for local business growth.</span>
        </div>
      </footer>
    </>
  );
}
