/* =========================================================
   ORBIT BIZASSIST — PUBLIC LANDING PAGE
   First touchpoint before authentication.
   ========================================================= */
(() => {
  "use strict";

  const features = [
    { icon: "▣", title: "Invoices", text: "Create clean, professional bills in seconds." },
    { icon: "▤", title: "Inventory", text: "Know what is selling, low, or out of stock." },
    { icon: "₹", title: "Khata", text: "Keep customer credit and payments organized." },
    { icon: "◴", title: "Reports", text: "Turn everyday transactions into useful insight." }
  ];

  const escapeHTML = value =>
    window.AppUtils?.esc
      ? window.AppUtils.esc(value)
      : String(value ?? "").replace(/[&<>'"]/g, char => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;"
        }[char]));

  function goLogin() {
    const url = new URL(window.location.href);
    url.searchParams.set("login", "1");
    url.hash = "dashboard";
    window.history.pushState({}, "", url);
    window.render?.();
  }

  function goHome() {
    const url = new URL(window.location.href);
    url.searchParams.delete("login");
    url.hash = "dashboard";
    window.history.pushState({}, "", url);
    window.render?.();
  }

  function isLoginView() {
    return new URLSearchParams(window.location.search).get("login") === "1";
  }

  function featureCard(item) {
    return `
      <article class="landing-feature-card">
        <span class="landing-feature-icon" aria-hidden="true">${item.icon}</span>
        <div>
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.text)}</p>
        </div>
      </article>
    `;
  }

  function preview() {
    return `
      <div class="landing-preview" aria-label="Orbit BizAssist product preview">
        <div class="landing-preview-glow" aria-hidden="true"></div>
        <div class="landing-app-window">
          <div class="landing-window-top">
            <div class="landing-window-brand"><span class="brand-mark" aria-hidden="true">O</span><span>Orbit BizAssist</span></div>
            <span class="landing-live-dot"><i></i> Workspace</span>
          </div>
          <div class="landing-window-body">
            <aside class="landing-mini-sidebar" aria-hidden="true">
              <span class="active"></span><span></span><span></span><span></span><span></span>
            </aside>
            <div class="landing-mini-content">
              <div class="landing-mini-heading">
                <div><small>Overview</small><strong>Your business, in one place.</strong></div>
                <span>Today</span>
              </div>
              <div class="landing-stat-row">
                <div><small>Today's sales</small><strong>₹24,860</strong><em>+12.4%</em></div>
                <div><small>Orders</small><strong>42</strong><em>8 pending</em></div>
                <div><small>Low stock</small><strong>07</strong><em>Needs attention</em></div>
              </div>
              <div class="landing-mini-grid">
                <div class="landing-chart-card"><div class="mini-line"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div><small>Sales activity</small></div>
                <div class="landing-list-card"><div><b>Recent invoices</b><span>View all</span></div><p><i></i> INV-1042 <strong>₹2,480</strong></p><p><i></i> INV-1041 <strong>₹1,920</strong></p><p><i></i> INV-1040 <strong>₹760</strong></p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function view() {
    return `
      <main class="landing-page">
        <nav class="landing-nav" aria-label="Public navigation">
          <a class="landing-brand" href="#dashboard" data-landing-home>
            <span class="brand-mark" aria-hidden="true">O</span>
            <span><strong>Orbit BizAssist</strong><small>by Orbit East</small></span>
          </a>
          <div class="landing-nav-actions">
            <a href="#features">Features</a>
            <button class="landing-login-link" type="button" data-landing-login>Sign in</button>
          </div>
        </nav>

        <section class="landing-hero">
          <div class="landing-hero-copy">
            <span class="landing-kicker"><i></i> Business, without the busywork.</span>
            <h1>Run the work.<br><span>See the whole business.</span></h1>
            <p>Orbit BizAssist brings sales, invoices, inventory, customers, Khata and business reporting into one calm workspace.</p>
            <div class="landing-hero-actions">
              <button class="landing-primary" type="button" data-landing-login>Get started <span aria-hidden="true">→</span></button>
              <a class="landing-secondary" href="#features">Explore features <span aria-hidden="true">↓</span></a>
            </div>
            <div class="landing-trust-row"><span>✓ Simple workflow</span><span>✓ Cloud-connected</span><span>✓ Built for growing businesses</span></div>
          </div>
          ${preview()}
        </section>

        <section class="landing-features" id="features">
          <div class="landing-section-head">
            <div><span class="landing-kicker">One workspace</span><h2>The essentials, finally working together.</h2></div>
            <p>Start with the tools your business needs today. Add depth as you grow.</p>
          </div>
          <div class="landing-feature-grid">${features.map(featureCard).join("")}</div>
        </section>

        <section class="landing-bottom-cta">
          <div><span class="landing-kicker">Ready when you are.</span><h2>Give your business a cleaner way to work.</h2><p>Start with your workspace and keep everything in one place.</p></div>
          <button class="landing-primary" type="button" data-landing-login>Continue with Google <span aria-hidden="true">→</span></button>
        </section>

        <footer class="landing-footer"><span>© ${new Date().getFullYear()} Orbit East</span><span>Orbit BizAssist</span></footer>
      </main>
    `;
  }

  function bind() {
    document.querySelectorAll("[data-landing-login]").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        goLogin();
      });
    });

    document.querySelector("[data-landing-home]")?.addEventListener("click", event => {
      event.preventDefault();
      goHome();
      document.querySelector("#features")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  window.AppLanding = Object.freeze({
    view,
    bind,
    goLogin,
    goHome,
    isLoginView
  });
})();
