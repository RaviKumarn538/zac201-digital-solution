const navItems = [
  ["Services", "#services"],
  ["Work", "#work"],
  ["Packages", "#packages"],
  ["FAQ", "#faq"],
];

const whatsappUrl =
  "https://wa.me/919301942717?text=Hi%20ZAc201%20Digital%20Solutions%2C%20I%20need%20a%20premium%20website%20for%20my%20business.";

const headerScript = `
(() => {
  const header = document.querySelector('[data-site-header]');
  if (!header || header.dataset.ready === 'true') return;
  header.dataset.ready = 'true';
  const button = header.querySelector('[data-menu-toggle]');
  const drawer = header.querySelector('[data-mobile-drawer]');
  const links = drawer ? [...drawer.querySelectorAll('a')] : [];

  const setOpen = (open) => {
    header.classList.toggle('is-menu-open', open);
    button?.setAttribute('aria-expanded', String(open));
    drawer?.setAttribute('aria-hidden', String(!open));
  };

  button?.addEventListener('click', () => setOpen(!header.classList.contains('is-menu-open')));
  links.forEach((link) => link.addEventListener('click', () => setOpen(false)));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
})();
`;

export default function Header() {
  return (
    <header className="nav-wrap" data-site-header>
      <nav className="site-nav" aria-label="Primary navigation">
        <a className="brand" href="#top">
          <span>ZAc201</span>
          <small>Digital Solutions</small>
        </a>

        <div className="nav-links">
          {navItems.map(([label, href]) => (
            <a href={href} key={label}>
              {label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <a className="nav-cta" href={whatsappUrl}>
            Book Call
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-label="Open menu"
            aria-expanded="false"
            data-menu-toggle
          >
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className="mobile-drawer" data-mobile-drawer aria-hidden="true">
        {navItems.map(([label, href]) => (
          <a href={href} key={label}>
            {label}
          </a>
        ))}
        <a className="btn primary" href={whatsappUrl}>
          Start on WhatsApp
        </a>
      </div>

      <script dangerouslySetInnerHTML={{ __html: headerScript }} />
    </header>
  );
}
