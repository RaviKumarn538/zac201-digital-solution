const plans = [
  {
    name: "Lite Plan",
    badge: "Starter",
    oneTime: "\u20b97,999",
    monthly: "\u20b9999/month",
    cycleOneTime: "one-time setup",
    cycleMonthly: "monthly WaaS",
    features: [
      "3-5 Pages",
      "Mobile Responsive",
      "Free Domain & Hosting (1st Year)",
      "SSL Security",
      "WhatsApp & Call CTAs",
      "Google Maps",
    ],
  },
  {
    name: "Business Plan",
    badge: "Popular",
    label: "Best Seller",
    oneTime: "\u20b914,999",
    monthly: "\u20b91,999/month",
    cycleOneTime: "one-time setup",
    cycleMonthly: "monthly WaaS",
    popular: true,
    features: [
      "5-8 Pages",
      "Easy Admin Panel (CMS)",
      "3 Professional Emails",
      "Local SEO Setup",
      "Database Inquiry Forms",
      "Priority Launch",
    ],
  },
  {
    name: "Custom Enterprise / E-Com",
    badge: "Scale",
    oneTime: "\u20b934,999",
    monthly: "\u20b93,499/month",
    cycleOneTime: "one-time setup",
    cycleMonthly: "monthly WaaS",
    features: [
      "Custom React/Next.js",
      "Payment Gateway Integration",
      "Shopping Cart & Checkout",
      "Inventory Dashboard",
      "1 Year Priority Support",
    ],
  },
];

const pricingScript = `
(() => {
  const section = document.querySelector('[data-pricing-section]');
  if (!section || section.dataset.ready === 'true') return;
  section.dataset.ready = 'true';

  const selectedPlanInput = document.querySelector('#contact-form input[name="selectedPlan"]');
  const whatsappButton = document.querySelector('#contact-form [data-whatsapp-plan]');
  const buttons = [...section.querySelectorAll('[data-billing]')];
  const cards = [...section.querySelectorAll('[data-plan-card]')];

  const setWhatsappText = (plan) => {
    if (!whatsappButton) return;
    const message = 'Hi ZAc201 Digital Solutions, I want to discuss ' + (plan || 'a website plan') + '.';
    whatsappButton.href = 'https://wa.me/919301942717?text=' + encodeURIComponent(message);
  };

  const setBilling = (mode) => {
    const isMonthly = mode === 'monthly';
    buttons.forEach((button) => {
      const active = button.dataset.billing === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    cards.forEach((card) => {
      const amount = card.querySelector('.price-amount');
      const cycle = card.querySelector('.price-cycle');
      if (!amount || !cycle) return;
      amount.textContent = isMonthly ? card.dataset.monthlyPrice : card.dataset.oneTimePrice;
      cycle.textContent = isMonthly ? card.dataset.monthlyCycle : card.dataset.oneTimeCycle;
      amount.style.animation = 'none';
      window.requestAnimationFrame(() => {
        amount.style.animation = '';
      });
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => setBilling(button.dataset.billing));
  });

  section.querySelectorAll('[data-select-plan]').forEach((button) => {
    button.addEventListener('click', () => {
      const activeMode = section.querySelector('[data-billing].is-active')?.dataset.billing || 'one-time';
      const billingLabel = activeMode === 'monthly' ? 'Monthly Subscription (WaaS)' : 'One-Time Setup';
      const selectedPlan = button.dataset.selectPlan + ' - ' + billingLabel;
      if (selectedPlanInput) selectedPlanInput.value = selectedPlan;
      setWhatsappText(selectedPlan);
      document.querySelector('#contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  selectedPlanInput?.addEventListener('input', (event) => setWhatsappText(event.target.value));
})();
`;

export default function PricingSection() {
  return (
    <section className="pricing-experience content-section" id="packages" data-pricing-section>
      <div className="section-head pricing-head">
        <span className="kicker">Pricing</span>
        <h2>Simple plans. Premium delivery.</h2>
      </div>

      <div className="billing-toggle" role="group" aria-label="Pricing billing mode">
        <button type="button" className="is-active" data-billing="one-time" aria-pressed="true">
          One-Time Setup
        </button>
        <button type="button" data-billing="monthly" aria-pressed="false">
          Monthly Subscription (WaaS)
        </button>
      </div>

      <div className="glass-pricing-grid">
        {plans.map((plan) => (
          <article
            className={`glass-price-card ${plan.popular ? "is-popular" : ""}`}
            data-plan-card
            data-one-time-price={plan.oneTime}
            data-monthly-price={plan.monthly}
            data-one-time-cycle={plan.cycleOneTime}
            data-monthly-cycle={plan.cycleMonthly}
            key={plan.name}
          >
            <div className="price-card-top">
              <span className={`price-badge ${plan.popular ? "popular-badge" : ""}`}>{plan.badge}</span>
              {plan.label && <span className="best-seller">{plan.label}</span>}
            </div>
            <h3>{plan.name}</h3>
            <div className="price-wrap" aria-live="polite">
              <strong className="price-amount">{plan.oneTime}</strong>
              <span className="price-cycle">{plan.cycleOneTime}</span>
            </div>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <span aria-hidden="true">{"\u2713"}</span> {feature}
                </li>
              ))}
            </ul>
            <button type="button" className="glass-cta" data-select-plan={plan.name}>
              Get Started
            </button>
          </article>
        ))}
      </div>

      <form className="pricing-contact-form" id="contact-form">
        <div>
          <span className="kicker">Quick enquiry</span>
          <h3>Selected plan</h3>
        </div>
        <label>
          Selected Plan
          <input name="selectedPlan" placeholder="Click Get Started on any plan" />
        </label>
        <label>
          Your Business Name
          <input name="businessName" placeholder="Example: Sharma Dental Clinic" />
        </label>
        <label>
          WhatsApp Number
          <input name="whatsapp" inputMode="tel" placeholder="+91 93019 42717" />
        </label>
        <a className="btn primary" href="https://wa.me/919301942717?text=Hi%20ZAc201%20Digital%20Solutions%2C%20I%20want%20to%20discuss%20a%20website%20plan." data-whatsapp-plan>
          Continue on WhatsApp
        </a>
      </form>

      <script dangerouslySetInnerHTML={{ __html: pricingScript }} />
    </section>
  );
}
