/* OrbitBiz — public landing experience */
(() => {
  "use strict";
  const root = document.querySelector("#app");
  if (!root) return;

  const apps = [
    ["CRM", "◎", "Turn conversations into opportunities."],
    ["Sales", "↗", "Quotes, orders and invoices in one flow."],
    ["Invoices", "▤", "Create, track and collect with clarity."],
    ["Inventory", "◈", "Know what is moving, where and when."],
    ["Purchasing", "⌁", "Keep suppliers and buying organised."],
    ["Expenses", "⌂", "Capture spending without the paperwork."],
    ["Accounting", "₹", "A cleaner view of business money."],
    ["Reports", "▥", "See the numbers behind every decision."],
    ["Customers", "○", "Keep every relationship in context."],
    ["Team", "◇", "Roles, people and access in one place."],
    ["Payments", "↔", "Track money in and money out."],
    ["AI Assistant", "✦", "Ask questions about the work that matters."]
  ];

  const landing = () => `
  <div class="ob-landing" id="orbit-biz-landing">
    <div class="ob-grain"></div>
    <header class="ob-nav">
      <div class="ob-nav-inner">
        <button class="ob-brand" data-ob-action="top" aria-label="OrbitBiz home">
          <img src="assets/orbiteastfavicon.png" alt="" class="ob-brand-mark">
          <span>OrbitBiz</span>
        </button>
        <nav class="ob-nav-links" aria-label="Main navigation">
          <button data-ob-action="apps">Apps</button>
          <button data-ob-action="industries">Solutions</button>
          <button data-ob-action="platform">Platform</button>
          <button data-ob-action="pricing">Pricing</button>
        </nav>
        <div class="ob-nav-cta">
          <button class="ob-signin" data-ob-action="signin">Sign in</button>
          <button class="ob-nav-start" data-ob-action="start">Start free <span>↗</span></button>
        </div>
        <button class="ob-mobile-menu" data-ob-action="menu" aria-label="Open menu">☰</button>
      </div>
      <div class="ob-mobile-nav">
        <button data-ob-action="apps">Apps</button>
        <button data-ob-action="industries">Solutions</button>
        <button data-ob-action="platform">Platform</button>
        <button data-ob-action="pricing">Pricing</button>
        <button data-ob-action="signin">Sign in</button>
        <button data-ob-action="start">Start free</button>
      </div>
    </header>

    <main>
      <section class="ob-hero" id="ob-top">
        <div class="ob-hero-orb ob-orb-a"></div>
        <div class="ob-hero-orb ob-orb-b"></div>
        <div class="ob-hero-content">
          <div class="ob-pill"><span></span> The operating system for modern business</div>
          <h1>Run your business<br><em>as one.</em></h1>
          <p class="ob-hero-lead">OrbitBiz brings customers, sales, stock, purchasing, expenses and finance into one connected workspace.</p>
          <div class="ob-hero-actions">
            <button class="ob-primary ob-large" data-ob-action="start">Create your workspace <b>→</b></button>
            <button class="ob-ghost ob-large" data-ob-action="product">See how it works <b>↓</b></button>
          </div>
          <div class="ob-trust-line"><span>Built for real businesses</span><i></i><span>Simple to start</span><i></i><span>Ready to scale</span></div>
        </div>

        <div class="ob-hero-product" id="ob-product-preview">
          <div class="ob-window-bar"><div class="ob-window-dots"><i></i><i></i><i></i></div><div class="ob-window-url">workspace / overview</div><div class="ob-window-avatar">N</div></div>
          <div class="ob-product-body">
            <aside class="ob-product-side">
              <div class="ob-product-logo"><img src="assets/orbiteastfavicon.png" alt=""> <b>OrbitBiz</b></div>
              <div class="ob-side-label">WORKSPACE</div>
              <div class="ob-side-link selected"><span>▦</span> Overview</div>
              <div class="ob-side-link"><span>◎</span> CRM</div>
              <div class="ob-side-link"><span>↗</span> Sales</div>
              <div class="ob-side-link"><span>▤</span> Invoices</div>
              <div class="ob-side-link"><span>◈</span> Inventory</div>
              <div class="ob-side-link"><span>⌁</span> Purchases</div>
              <div class="ob-side-link"><span>₹</span> Finance</div>
              <div class="ob-side-label second">MANAGE</div>
              <div class="ob-side-link"><span>▥</span> Reports</div>
              <div class="ob-side-link"><span>⚙</span> Settings</div>
            </aside>
            <div class="ob-product-main">
              <div class="ob-product-heading"><div><span>MONDAY, SEPTEMBER 10</span><h3>Good morning.</h3></div><button>＋ New</button></div>
              <div class="ob-kpi-row">
                <div class="ob-kpi"><span>Revenue</span><strong>₹2,84,500</strong><small class="up">↑ 12.4%</small></div>
                <div class="ob-kpi"><span>Receivables</span><strong>₹48,200</strong><small>8 invoices</small></div>
                <div class="ob-kpi"><span>Expenses</span><strong>₹96,400</strong><small>this month</small></div>
              </div>
              <div class="ob-main-grid">
                <div class="ob-panel sales-panel"><div class="ob-panel-top"><b>Revenue</b><span>Last 30 days⌄</span></div><div class="ob-line-chart"><div class="ob-chart-grid"></div><svg viewBox="0 0 720 220" preserveAspectRatio="none"><path d="M0 183 C60 174 74 164 124 171 S192 144 238 151 S300 118 352 130 S418 97 463 109 S528 73 575 82 S636 45 720 24" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg><div class="ob-chart-axis"><span>Aug 12</span><span>Aug 19</span><span>Aug 26</span><span>Sep 2</span><span>Sep 10</span></div></div></div>
                <div class="ob-panel"><div class="ob-panel-top"><b>Needs attention</b><span>View all</span></div><div class="ob-task"><span class="ob-task-dot amber"></span><div><b>3 overdue invoices</b><small>₹18,450 outstanding</small></div><em>→</em></div><div class="ob-task"><span class="ob-task-dot"></span><div><b>Low stock</b><small>7 products need restock</small></div><em>→</em></div><div class="ob-task"><span class="ob-task-dot green"></span><div><b>5 payments received</b><small>₹32,800 today</small></div><em>→</em></div></div>
              </div>
            </div>
          </div>
          <div class="ob-float-card ob-float-payment"><span class="ob-float-icon">✓</span><div><small>Payment received</small><b>+ ₹8,900</b></div><strong>just now</strong></div>
          <div class="ob-float-card ob-float-stock"><span class="ob-float-icon">◈</span><div><small>Stock health</small><b>Healthy</b></div><span class="ob-stock-bars"><i></i><i></i><i></i><i></i><i></i></span></div>
        </div>
      </section>

      <section class="ob-logo-band">
        <p>ONE WORKSPACE FOR THE WORK THAT KEEPS BUSINESS MOVING</p>
        <div><span>CRM</span><span>SALES</span><span>INVENTORY</span><span>FINANCE</span><span>REPORTS</span><span>AI</span></div>
      </section>

      <section class="ob-apps-section ob-section" id="ob-apps-grid">
        <div class="ob-section-intro"><div class="ob-overline">THE BUSINESS STACK</div><h2>Everything connected.<br><em>Nothing scattered.</em></h2><p>Use one system for the everyday work. Every module shares the same records, permissions and business context.</p></div>
        <div class="ob-app-grid">${apps.map(([name, icon, desc], i) => `<article class="ob-app-card ${i === 0 ? "featured" : ""}"><div class="ob-app-top"><span class="ob-app-icon">${icon}</span><span class="ob-app-arrow">↗</span></div><h3>${name}</h3><p>${desc}</p></article>`).join("")}</div>
        <button class="ob-text-link" data-ob-action="apps">Explore the full workspace <span>→</span></button>
      </section>

      <section class="ob-workflow ob-section" id="ob-industries">
        <div class="ob-workflow-copy"><div class="ob-overline">ONE FLOW, FROM START TO FINISH</div><h2>Enter it once.<br><em>Use it everywhere.</em></h2><p>A customer, product or transaction should not have to be entered five times. OrbitBiz keeps the chain connected from the first interaction to the final payment.</p><button class="ob-dark-link" data-ob-action="start">Build your connected workflow <span>→</span></button></div>
        <div class="ob-flow-card"><div class="ob-flow-head"><span>BUSINESS FLOW</span><b>Live connection</b></div><div class="ob-flow-line"><div class="ob-flow-node active"><span>01</span><b>Customer</b><small>Relationship</small></div><i></i><div class="ob-flow-node"><span>02</span><b>Quotation</b><small>Opportunity</small></div><i></i><div class="ob-flow-node"><span>03</span><b>Invoice</b><small>Transaction</small></div><i></i><div class="ob-flow-node"><span>04</span><b>Payment</b><small>Complete</small></div></div><div class="ob-flow-footer"><span>Every step keeps the same business context.</span><b>Connected by OrbitBiz</b></div></div>
      </section>

      <section class="ob-productivity ob-section" id="ob-platform">
        <div class="ob-section-intro"><div class="ob-overline">MADE FOR MOMENTUM</div><h2>Powerful where it matters.<br><em>Quiet where it doesn't.</em></h2><p>No clutter for the sake of features. Just the tools, connections and visibility your team needs to move faster.</p></div>
        <div class="ob-feature-grid">
          <article class="ob-feature-card dark"><div class="ob-feature-number">01</div><div class="ob-feature-symbol">⌘</div><h3>Find anything.</h3><p>Search customers, invoices, products and transactions from one place.</p><div class="ob-search-demo"><kbd>⌘</kbd><span>Search your workspace</span><b>↵</b></div></article>
          <article class="ob-feature-card"><div class="ob-feature-number">02</div><div class="ob-feature-symbol">↗</div><h3>See what matters.</h3><p>Dashboards and reports turn daily activity into a clear picture of the business.</p><div class="ob-mini-chart"><i style="height:35%"></i><i style="height:48%"></i><i style="height:41%"></i><i style="height:62%"></i><i style="height:58%"></i><i style="height:79%"></i><i style="height:92%"></i></div></article>
          <article class="ob-feature-card"><div class="ob-feature-number">03</div><div class="ob-feature-symbol">✦</div><h3>Ask for the answer.</h3><p>Use the assistant to summarise activity, find records and understand trends.</p><div class="ob-ai-demo"><span>✦</span><div>What changed this month?</div><b>→</b></div></article>
        </div>
      </section>

      <section class="ob-ai-section">
        <div class="ob-ai-glow"></div><div class="ob-ai-copy"><div class="ob-overline">INTELLIGENCE, BUILT IN</div><h2>Your business has<br><em>questions.</em></h2><p>OrbitBiz is designed so useful intelligence can sit directly beside the records and workflows that create it.</p><div class="ob-ai-prompts"><span>“What is overdue?”</span><span>“Summarise this month.”</span><span>“Which products are low?”</span></div></div>
        <div class="ob-ai-window"><div class="ob-ai-window-top"><span>ORBIT ASSISTANT</span><i>● Online</i></div><div class="ob-ai-message user">How did sales perform this month?</div><div class="ob-ai-message answer"><span>✦</span><div><b>Sales are up 12.4%.</b><p>Revenue reached ₹2,84,500 across 126 invoices. Receivables are ₹48,200, with 8 invoices currently outstanding.</p><a>Open sales report →</a></div></div><div class="ob-ai-input">Ask anything about your workspace <span>↵</span></div></div>
      </section>

      <section class="ob-foundation ob-section">
        <div class="ob-foundation-head"><div class="ob-overline">BUILT ON A SOLID FOUNDATION</div><h2>Your data.<br><em>Your business.</em></h2><p>Structured workspaces, controlled access and connected records give you a reliable base as your operation grows.</p></div>
        <div class="ob-foundation-grid"><div><span>01</span><b>Secure workspace access</b><p>Authentication and business-level access keep the workspace protected.</p></div><div><span>02</span><b>Role-based control</b><p>Give people access to the tools they actually need.</p></div><div><span>03</span><b>Connected history</b><p>Important activity stays tied to the right customer, product or transaction.</p></div><div><span>04</span><b>Designed to expand</b><p>Start with the essentials and add more workflows as you grow.</p></div></div>
      </section>

      <section class="ob-pricing-section ob-section" id="ob-pricing"><div class="ob-pricing-card"><div><div class="ob-overline">START SIMPLE</div><h2>Build your workspace<br><em>without the friction.</em></h2><p>Start with the core tools. Grow into the platform as your business needs more.</p></div><button class="ob-primary ob-large" data-ob-action="start">Get started free <b>→</b></button></div></section>

      <section class="ob-final"><div class="ob-final-orbit"><img src="assets/orbiteastfavicon.png" alt=""></div><div class="ob-overline">THE NEXT STEP IS YOURS</div><h2>Bring the whole business<br><em>into focus.</em></h2><p>One workspace for the work behind your business.</p><div class="ob-final-actions"><button class="ob-primary ob-large" data-ob-action="start">Start using OrbitBiz <b>→</b></button><button class="ob-final-signin" data-ob-action="signin">Already have an account? Sign in</button></div></section>
    </main>

    <footer class="ob-footer"><div class="ob-footer-main"><div class="ob-footer-brand"><img src="assets/orbiteastfavicon.png" alt=""><b>OrbitBiz</b><p>Business, connected.</p></div><div class="ob-footer-col"><b>Product</b><button data-ob-action="apps">Apps</button><button data-ob-action="platform">Platform</button><button data-ob-action="pricing">Pricing</button></div><div class="ob-footer-col"><b>Company</b><button data-ob-action="industries">Solutions</button><button data-ob-action="help">Help</button><button data-ob-action="signin">Sign in</button></div></div><div class="ob-footer-bottom"><span>© 2026 Orbit East</span><span>OrbitBiz · Business operating platform</span></div></footer>
  </div>`;

  root.insertAdjacentHTML("afterbegin", landing());
  const page = document.querySelector("#orbit-biz-landing");
  if (!page) return;
  const scrollTo = id => document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  page.addEventListener("click", event => {
    const button = event.target.closest("[data-ob-action]");
    if (!button) return;
    const action = button.dataset.obAction;
    if (action === "top") scrollTo("#ob-top");
    if (action === "apps") scrollTo("#ob-apps-grid");
    if (action === "industries") scrollTo("#ob-industries");
    if (action === "platform") scrollTo("#ob-platform");
    if (action === "pricing") scrollTo("#ob-pricing");
    if (action === "product") scrollTo("#ob-product-preview");
    if (action === "help") window.dispatchEvent(new CustomEvent("orbitbiz:help-request"));
    if (action === "menu") page.classList.toggle("menu-open");
    if (action === "signin" || action === "start") {
      const mode = action === "signin" ? "signin" : "signup";
      window.dispatchEvent(new CustomEvent("orbitbiz:auth-request", { detail: { mode } }));
      if (window.OrbitBiz?.events?.emit) window.OrbitBiz.events.emit("auth:request", { mode });
    }
  });
})();
