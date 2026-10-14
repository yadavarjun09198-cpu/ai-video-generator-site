const navItems = ['Products', 'Solutions', 'Support', 'Pricing', 'Buy'];

const stats = [
  { value: '40+', label: 'years of innovation' },
  { value: '30M+', label: 'designers worldwide' },
  { value: '2D & 3D', label: 'in one connected workflow' },
  { value: '99.9%', label: 'uptime for cloud workflows' },
];

const featureCards = [
  {
    title: 'Draft with precision',
    text: 'Create accurate 2D drawings with familiar tools, annotation workflows, and smart dimensioning built for professionals.',
    accent: 'blue',
  },
  {
    title: 'Model in 3D',
    text: 'Move from concept to production with stronger modeling tools, reusable blocks, and seamless design iteration.',
    accent: 'mint',
  },
  {
    title: 'Collaborate in real time',
    text: 'Share files, track design changes, and coordinate with project teams using connected cloud workflows.',
    accent: 'gold',
  },
  {
    title: 'Automate repetitive work',
    text: 'Reduce manual effort with scripts, actions, and CAD-based automations tailored to your design process.',
    accent: 'purple',
  },
];

const workflowCards = [
  'Architecture & planning',
  'Electrical & schematics',
  'Mechanical design',
  'Construction details',
  'Product design',
  'Interior layouts',
];

const planCards = [
  {
    name: 'AutoCAD',
    price: '$1,875',
    sub: '/year',
    highlight: 'Best for individuals',
    features: ['2D drafting and design', '3D modeling tools', 'DWG file compatibility', 'Cloud storage access'],
  },
  {
    name: 'AutoCAD + Design Suite',
    price: '$2,790',
    sub: '/year',
    highlight: 'Most popular',
    features: ['Everything in AutoCAD', 'Advanced visualization tools', 'Additional industry workflows', 'Priority support'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    sub: '',
    highlight: 'For teams',
    features: ['Multi-seat deployment', 'Administrative controls', 'SSO and security features', 'Dedicated onboarding'],
  },
];

const customers = ['AEC', 'Manufacturing', 'Infrastructure', 'Energy', 'Education'];

export default function App() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">
            <span className="brand-block blue" />
            <span className="brand-block orange" />
          </div>
          <span className="brand-name">Autodesk</span>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a href="#" key={item}>
              {item}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="secondary-btn">Sign in</button>
          <button className="primary-btn">Get started</button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">Design, draft, and deliver</div>
            <h1>Precision design software built for every project stage.</h1>
            <p>
              AutoCAD helps teams create accurate 2D drawings, powerful 3D models, and
              connected documentation workflows with fewer manual steps and faster delivery.
            </p>

            <div className="cta-row">
              <button className="primary-btn large">Try AutoCAD</button>
              <button className="ghost-btn large">Watch demo</button>
            </div>

            <div className="hero-meta">
              <span>Trusted by professionals in architecture, engineering, and construction.</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="AutoCAD workspace preview">
            <div className="screen-window">
              <div className="window-header">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>

              <div className="workspace-panel">
                <div className="panel-sidebar">
                  <span className="chip active">Model</span>
                  <span className="chip">Layout</span>
                  <span className="chip">Annotate</span>
                  <span className="chip">View</span>
                </div>

                <div className="drawing-surface">
                  <div className="grid-lines" />
                  <div className="draw-shape shape-one" />
                  <div className="draw-shape shape-two" />
                  <div className="draw-shape shape-three" />
                  <div className="measure-card">
                    <strong>42.8m</strong>
                    <span>Measured distance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-strip">
          {stats.map((item) => (
            <div key={item.label} className="stat-item">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </section>

        <section className="feature-showcase">
          <div className="section-heading">
            <span className="eyebrow alt">Powerful tools</span>
            <h2>Everything you need to move from idea to build.</h2>
          </div>

          <div className="feature-grid">
            {featureCards.map((feature) => (
              <article key={feature.title} className={`feature-card ${feature.accent}`}>
                <div className="feature-icon" aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="solutions-panel">
          <div className="solutions-copy">
            <span className="eyebrow alt">Built for real-world teams</span>
            <h2>Stay coordinated across every phase of the project.</h2>
            <p>
              From early concepts to final documentation, AutoCAD gives design teams a single
              source of truth for drawings, measurements, revisions, and approval-ready files.
            </p>
            <ul>
              <li>Reuse blocks and standards for faster drafting.</li>
              <li>Share models and updates with project stakeholders.</li>
              <li>Reduce rework with design consistency and version control.</li>
            </ul>
          </div>

          <div className="workflow-list">
            {workflowCards.map((item) => (
              <div key={item} className="workflow-tag">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="pricing-section">
          <div className="section-heading centered">
            <span className="eyebrow alt">Flexible plans</span>
            <h2>Choose the right AutoCAD experience for your work.</h2>
          </div>

          <div className="pricing-grid">
            {planCards.map((plan) => (
              <article key={plan.name} className={`price-card ${plan.featured ? 'featured' : ''}`}>
                <div className="plan-top">
                  <span className="plan-label">{plan.highlight}</span>
                  <h3>{plan.name}</h3>
                </div>

                <div className="plan-price">
                  <strong>{plan.price}</strong>
                  <span>{plan.sub}</span>
                </div>

                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>

                <button className={plan.featured ? 'primary-btn' : 'ghost-btn'}>
                  {plan.featured ? 'Buy now' : 'Learn more'}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="customer-strip">
          <span className="eyebrow alt">Used by teams across</span>
          <div className="customer-row">
            {customers.map((customer) => (
              <div key={customer} className="customer-badge">
                {customer}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="brand-wrap">
          <div className="brand-mark">
            <span className="brand-block blue" />
            <span className="brand-block orange" />
          </div>
          <span className="brand-name">Autodesk</span>
        </div>

        <div className="footer-links">
          <a href="#">Products</a>
          <a href="#">Solutions</a>
          <a href="#">Support</a>
          <a href="#">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
