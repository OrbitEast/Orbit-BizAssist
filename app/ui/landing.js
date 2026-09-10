/* OrbitBiz — public landing page */
(() => {
  "use strict";
  const root = document.querySelector("#app");
  if (!root) return;

  const appItems = [
    ["▣", "Accounting", "Invoices, payments & financial control"],
    ["◎", "CRM", "Leads, opportunities & customers"],
    ["₹", "Sales", "Quotations, orders & invoicing"],
    ["◈", "Inventory", "Products, stock & warehouses"],
    ["▤", "Purchasing", "Suppliers, orders & receipts"],
    ["⌁", "Expenses", "Business expenses & approvals"],
    ["↗", "Reports", "Business insights & performance"],
    ["✓", "Payments", "Accounts & receivables"],
    ["□", "Customers", "Contacts & business records"],
    ["◫", "Projects", "Work, tasks & progress"],
    ["◇", "Team", "Users, roles & permissions"],
    ["✦", "AI Assistant", "Ask, analyse & automate"]
  ];

  const landing = () => `
  <div class="ob-landing" id="orbit-biz-landing">
    <div class="ob-site">
      <header class="ob-nav">
        <button class="ob-brand ob-brand-button" data-ob-action="top" aria-label="OrbitBiz home">
          <img src="assets/orbiteastfavicon.png" alt="OrbitBiz" class="ob-brand-mark">
          <span>OrbitBiz</span>
        </button>
        <nav class="ob-nav-actions" aria-label="Main navigation">
          <button class="ob-link" data-ob-action="apps">Apps</button>
          <button class="ob-link" data-ob-action="industries">Industries</button>
          <button class="ob-link" data-ob-action="community">Platform</button>
          <button class="ob-link" data-ob-action="pricing">Pricing</button>
          <button class="ob-link" data-ob-action="help">Help</button>
          <button class="ob-btn ob-btn-light" data-ob-action="signin">Sign in</button>
          <button class="ob-btn ob-btn-dark" data-ob-action="start">Get started</button>
        </nav>
        <button class="ob-mobile-menu" data-ob-action="menu" aria-label="Open menu">☰</button>
      </header>

      <main>
        <section class="ob-hero" id="ob-top">
          <div class="ob-hero-glow"></div>
          <div class="ob-hero-copy">
            <div class="ob-eyebrow"><span class="ob-dot"></span> One platform. Your whole business.</div>
            <h1>All your business.<br><span>One connected platform.</span></h1>
            <p>Run sales, CRM, accounting, inventory, purchasing, expenses, payments and more from one beautifully connected workspace.</p>
            <div class="ob-hero-actions">
              <button class="ob-btn ob-btn-dark ob-btn-lg" data-ob-action="start">Start using OrbitBiz <b>→</b></button>
              <button class="ob-btn ob-btn-outline ob-btn-lg" data-ob-action="apps">Explore apps <b>↓</b></button>
            </div>
            <div class="ob-hero-note">Simple to start · Built to grow · No complicated setup</div>
          </div>

          <div class="ob-product" id="ob-product-preview">
            <div class="ob-browser"><i></i><i></i><i></i><span class="ob-browser-address">app.orbitbiz</span></div>
            <div class="ob-dashboard-preview">
              <aside class="ob-side">
                <div class="ob-side-logo"><img src="assets/orbiteastfavicon.png" alt=""> OrbitBiz</div>
                <div class="ob-side-section">WORKSPACE</div>
                <div class="ob-side-item active">▦ <span>Dashboard</span></div>
                <div class="ob-side-item">◎ <span>CRM</span></div>
                <div class="ob-side-item">₹ <span>Sales</span></div>
                <div class="ob-side-item">▤ <span>Invoices</span></div>
                <div class="ob-side-item">◈ <span>Inventory</span></div>
                <div class="ob-side-item">⌁ <span>Expenses</span></div>
                <div class="ob-side-item">↗ <span>Reports</span></div>
              </aside>
              <div class="ob-preview-main">
                <div class="ob-preview-head"><div><small>OVERVIEW</small><strong>Good morning</strong></div><button>+ Create</button></div>
                <div class="ob-stats">
                  <div class="ob-stat"><small>Sales this month</small><strong>₹2,84,500</strong><em>↑ 12.4%</em></div>
                  <div class="ob-stat"><small>Receivables</small><strong>₹48,200</strong><em>8 outstanding</em></div>
                  <div class="ob-stat"><small>Expenses</small><strong>₹96,400</strong><em>This month</em></div>
                  <div class="ob-stat"><small>Inventory value</small><strong>₹3,42,800</strong><em>126 items</em></div>
                </div>
                <div class="ob-preview-grid">
                  <div class="ob-card ob-chart-card"><div class="ob-card-head"><b>Sales overview</b><span>Last 30 days⌄</span></div><div class="ob-chart"><svg viewBox="0 0 700 170" preserveAspectRatio="none"><path d="M0 140 C70 125 85 132 145 112 S230 123 285 90 S370 112 420 78 S505 93 560 50 S635 66 700 20" fill="none" stroke="currentColor" stroke-width="4"/></svg></div></div>
                  <div class="ob-card"><div class="ob-card-head"><b>Recent activity</b><span>Today</span></div><div class="ob-activity"><span>Invoice #1048</span><b>₹12,400</b></div><div class="ob-activity"><span>Payment received</span><b>₹8,900</b></div><div class="ob-activity"><span>New customer</span><b>Today</b></div><div class="ob-activity"><span>Stock updated</span><b>12 items</b></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="ob-app-strip" id="ob-apps">
          <div class="ob-section-kicker">BUILT AS ONE ECOSYSTEM</div>
          <div class="ob-app-strip-items"><span>CRM</span><span>Sales</span><span>Accounting</span><span>Inventory</span><span>Purchasing</span><span>Expenses</span><span>Reports</span><span>AI</span></div>
        </section>

        <section class="ob-apps-section" id="ob-apps-grid">
          <div class="ob-section-head"><div class="ob-section-kicker">A COMPLETE BUSINESS TOOLKIT</div><h2>One platform.<br><span>Many powerful apps.</span></h2><p>Everything works together. Enter information once and let it flow through the rest of your business.</p></div>
          <div class="ob-app-grid">${appItems.map(([icon, title, desc]) => `<article class="ob-app-card"><div class="ob-app-icon">${icon}</div><div><h3>${title}</h3><p>${desc}</p></div><span class="ob-app-arrow">↗</span></article>`).join("")}</div>
          <button class="ob-all-apps" data-ob-action="apps">Explore all OrbitBiz apps <span>→</span></button>
        </section>

        <section class="ob-highlight" id="ob-industries">
          <div class="ob-highlight-inner"><div><div class="ob-section-kicker">DESIGNED AROUND YOUR WORK</div><h2>Simple enough for everyday work.<br><span>Powerful enough to grow.</span></h2><p>From the first customer to a growing team, OrbitBiz keeps the important parts of your operation connected without forcing you to manage a pile of separate tools.</p><button class="ob-btn ob-btn-dark" data-ob-action="start">Build your workspace →</button></div><div class="ob-metrics"><div><strong>01</strong><span>Capture</span><small>Customers, products & transactions</small></div><div><strong>02</strong><span>Connect</span><small>Sales, stock, payments & accounts</small></div><div><strong>03</strong><span>Understand</span><small>Reports, trends & decisions</small></div></div></div>
        </section>

        <section class="ob-productivity" id="ob-community">
          <div class="ob-section-head"><div class="ob-section-kicker">OPTIMIZED FOR PRODUCTIVITY</div><h2>Less repetitive work.<br><span>More done.</span></h2><p>Keep records connected, reduce duplicate entry and find the information you need without jumping between disconnected systems.</p></div>
          <div class="ob-productivity-grid"><div class="ob-speed-card"><div class="ob-speed-number">01</div><h3>Fast workflows</h3><p>Search, create, edit and move between records without losing context.</p><div class="ob-command">⌘ K <span>Quick search anything...</span></div></div><div class="ob-speed-card"><div class="ob-speed-number">02</div><h3>Connected records</h3><p>A customer can flow into a quotation, sale, invoice, payment and report.</p><div class="ob-flow-mini"><b>Customer</b><i>→</i><b>Sale</b><i>→</i><b>Invoice</b><i>→</i><b>Payment</b></div></div><div class="ob-speed-card"><div class="ob-speed-number">03</div><h3>Smart visibility</h3><p>See what needs attention through dashboards, filters, reports and activity.</p><div class="ob-mini-bars"><i style="height:34%"></i><i style="height:52%"></i><i style="height:44%"></i><i style="height:70%"></i><i style="height:84%"></i><i style="height:62%"></i><i style="height:96%"></i></div></div></div>
        </section>

        <section class="ob-ai">
          <div class="ob-ai-orbit">✦</div><div class="ob-section-kicker">NATIVE AI, WHEN YOU NEED IT</div><h2>Ask your business.<br><span>Get useful answers.</span></h2><p>Use an intelligent assistant to understand activity, find information, create useful summaries and turn business data into clearer decisions.</p><div class="ob-ai-pills"><span>“How were sales this month?”</span><span>“Show overdue invoices.”</span><span>“Summarise expenses.”</span></div>
        </section>

        <section class="ob-platform">
          <div class="ob-platform-grid"><div><div class="ob-section-kicker">THE ORBITBIZ FOUNDATION</div><h2>Business software,<br><span>without the mess.</span></h2><p>One structured foundation for your data, users and workflows. Start with the tools you need and expand as your business grows.</p></div><div class="ob-platform-list"><div><b>Secure access</b><span>Authentication and controlled workspace access.</span></div><div><b>Business isolation</b><span>Your business records stay separated by workspace.</span></div><div><b>Role-based permissions</b><span>Give every team member the right level of access.</span></div><div><b>Connected history</b><span>Keep important activity tied to the right records.</span></div></div></div>
        </section>

        <section class="ob-pricing" id="ob-pricing"><div class="ob-pricing-card"><div><div class="ob-section-kicker">FAIR, SIMPLE ACCESS</div><h2>Start without the friction.</h2><p>Get into your workspace first. OrbitBiz is being built around straightforward access, useful tools and a business-first experience.</p></div><button class="ob-btn ob-btn-dark ob-btn-lg" data-ob-action="start">Get started <b>→</b></button></div></section>

        <section class="ob-cta"><div class="ob-cta-box"><img src="assets/orbiteastfavicon.png" alt="OrbitBiz"><div class="ob-section-kicker">READY WHEN YOU ARE</div><h2>Your business.<br><span>One workspace.</span></h2><p>Bring customers, sales, stock, payments and business information together with OrbitBiz.</p><div class="ob-cta-actions"><button class="ob-btn ob-btn-light ob-btn-lg" data-ob-action="start">Start using OrbitBiz →</button><button class="ob-cta-text" data-ob-action="signin">Already have an account? Sign in</button></div></div></section>
      </main>

      <footer class="ob-footer"><div><img src="assets/orbiteastfavicon.png" alt=""> <strong>OrbitBiz</strong></div><span>© 2026 Orbit East · Business operating platform</span><nav><button data-ob-action="apps">Apps</button><button data-ob-action="pricing">Pricing</button><button data-ob-action="help">Help</button></nav></footer>
    </div>
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
    if (action === "community") scrollTo("#ob-community");
    if (action === "pricing") scrollTo("#ob-pricing");
    if (action === "help") window.dispatchEvent(new CustomEvent("orbitbiz:help-request"));
    if (action === "product") scrollTo("#ob-product-preview");
    if (action === "menu") page.classList.toggle("menu-open");
    if (action === "signin" || action === "start") {
      const mode = action === "signin" ? "signin" : "signup";
      window.dispatchEvent(new CustomEvent("orbitbiz:auth-request", { detail: { mode } }));
      if (window.OrbitBiz?.events?.emit) window.OrbitBiz.events.emit("auth:request", { mode });
    }
  });
})();
