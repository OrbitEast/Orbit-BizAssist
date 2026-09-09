/* Orbit Biz — public landing page */
(() => {
  "use strict";
  const root = document.querySelector("#app");
  if (!root) return;

  const landing = () => `
    <div class="ob-landing" id="orbit-biz-landing">
      <div class="ob-landing-inner">
        <header class="ob-nav">
          <div class="ob-brand"><span class="ob-brand-mark">O</span><span>Orbit</span><small>Biz</small></div>
          <div class="ob-nav-actions">
            <button class="ob-link" data-ob-action="features">Features</button>
            <button class="ob-link" data-ob-action="product">Product</button>
            <button class="ob-btn ob-btn-light" data-ob-action="signin">Sign in</button>
            <button class="ob-btn ob-btn-dark" data-ob-action="start">Get started</button>
          </div>
        </header>

        <section class="ob-hero">
          <div class="ob-eyebrow"><span class="ob-dot"></span> Business operations, simplified</div>
          <h1>Run your business from <span>one place.</span></h1>
          <p>Orbit Biz brings sales, customers, invoices, expenses, inventory, payments and reports together in one clear workspace.</p>
          <div class="ob-hero-actions">
            <button class="ob-btn ob-btn-dark" data-ob-action="start">Start managing your business&nbsp; →</button>
            <button class="ob-btn ob-btn-light" data-ob-action="product">See how it works</button>
          </div>
          <div class="ob-note">Built for growing businesses · Designed by Orbit East</div>

          <div class="ob-product" id="ob-product-preview" aria-label="Orbit Biz product preview">
            <div class="ob-browser"><i></i><i></i><i></i><span class="ob-browser-line"></span></div>
            <div class="ob-dashboard">
              <aside class="ob-side">
                <div class="ob-side-logo">Orbit Biz</div>
                <div class="ob-side-item active">▦ &nbsp; Dashboard</div><div class="ob-side-item">◎ &nbsp; Sales CRM</div><div class="ob-side-item">▤ &nbsp; Invoices</div><div class="ob-side-item">□ &nbsp; Customers</div><div class="ob-side-item">◈ &nbsp; Inventory</div><div class="ob-side-item">◌ &nbsp; Expenses</div><div class="ob-side-item">⌁ &nbsp; Reports</div>
              </aside>
              <div class="ob-preview-main">
                <div class="ob-preview-head"><b>Dashboard</b><span class="ob-mini-btn">+ Create new</span></div>
                <div class="ob-stats"><div class="ob-stat"><small>Total sales</small><strong>₹2,84,500</strong><em>↑ 12.4%</em></div><div class="ob-stat"><small>Receivables</small><strong>₹48,200</strong><em>8 invoices</em></div><div class="ob-stat"><small>Expenses</small><strong>₹96,400</strong><em>This month</em></div><div class="ob-stat"><small>Stock value</small><strong>₹3,42,800</strong><em>126 items</em></div></div>
                <div class="ob-preview-grid"><div class="ob-card"><b>Sales overview</b><div class="ob-chart"><svg viewBox="0 0 600 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 78 C55 65 75 72 120 58 S205 62 250 43 S335 58 380 31 S470 45 520 22 S570 28 600 10" fill="none" stroke="currentColor" stroke-width="3"/></svg></div></div><div class="ob-card"><b>Recent activity</b><div class="ob-list-row" style="margin-top:15px">Invoice #1048 <span>₹12,400</span></div><div class="ob-list-row">Payment received <span>₹8,900</span></div><div class="ob-list-row">New customer <span>Today</span></div><div class="ob-list-row">Stock updated <span>12 items</span></div></div></div>
              </div>
            </div>
          </div>
        </section>

        <section class="ob-strip"><div class="ob-strip-inner"><span><strong>Sales</strong> & CRM</span><span><strong>Invoices</strong> & payments</span><span><strong>Inventory</strong> control</span><span><strong>Reports</strong> & insights</span><span><strong>Business</strong> workspace</span></div></section>

        <section class="ob-features" id="ob-features">
          <div class="ob-section-head"><h2>Everything your business needs.</h2><p>Less switching between tools. Less manual work. One workspace that keeps your business information connected.</p></div>
          <div class="ob-feature-grid">
            <article class="ob-feature"><div class="ob-feature-icon">₹</div><h3>Sales & invoices</h3><p>Create quotations, invoices and receipts while keeping payments and customer balances organised.</p></article>
            <article class="ob-feature"><div class="ob-feature-icon">□</div><h3>Inventory</h3><p>Know what you have, what moved and what needs attention without maintaining separate spreadsheets.</p></article>
            <article class="ob-feature"><div class="ob-feature-icon">◎</div><h3>Customers & vendors</h3><p>Keep customer and supplier information connected to the transactions that matter.</p></article>
            <article class="ob-feature"><div class="ob-feature-icon">↗</div><h3>Reports</h3><p>Turn everyday business activity into a clearer picture of sales, expenses and performance.</p></article>
            <article class="ob-feature"><div class="ob-feature-icon">⌁</div><h3>Payments</h3><p>Track payment accounts and outstanding amounts so your cash position is easier to understand.</p></article>
            <article class="ob-feature"><div class="ob-feature-icon">✓</div><h3>Built to grow</h3><p>A structured workspace designed to become more capable as your business becomes more complex.</p></article>
          </div>
        </section>

        <section class="ob-cta"><div class="ob-cta-box"><h2>Your business. One workspace.</h2><p>Start with the essentials and build from there. Orbit Biz is designed to keep everyday operations simple and connected.</p><button class="ob-btn ob-btn-light" data-ob-action="start">Get started with Orbit Biz&nbsp; →</button></div></section>
        <footer class="ob-footer"><span>© 2026 <strong>Orbit East</strong></span><span>Orbit Biz · Business operating software</span></footer>
      </div>
    </div>`;

  root.insertAdjacentHTML("afterbegin", landing());
  const page = document.querySelector("#orbit-biz-landing");
  const scrollTo = id => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  page.addEventListener("click", event => {
    const button = event.target.closest("[data-ob-action]");
    if (!button) return;
    const action = button.dataset.obAction;
    if (action === "features") scrollTo("#ob-features");
    if (action === "product") scrollTo("#ob-product-preview");
    if (action === "signin" || action === "start") {
      window.dispatchEvent(new CustomEvent("orbitbiz:auth-request", { detail: { mode: action === "signin" ? "signin" : "signup" } }));
      page.classList.add("ob-auth-requested");
      alert("Orbit Biz authentication is ready to be connected here. We’ll wire this to Supabase Auth next.");
      page.classList.remove("ob-auth-requested");
    }
  });
})();
