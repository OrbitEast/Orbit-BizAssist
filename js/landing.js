/* =========================================================
   ORBIT BIZASSIST — PUBLIC LANDING EXPERIENCE
   Orbit East company page + BizAssist product introduction.
   ========================================================= */
(() => {
  "use strict";

  const features = [
    { icon: "▣", title: "Invoices", text: "Create clean, professional bills and keep every transaction organized." },
    { icon: "▤", title: "Inventory", text: "Track products, stock levels and movement without losing the bigger picture." },
    { icon: "₹", title: "Khata & Payments", text: "Keep customer credit, payments and outstanding balances connected." },
    { icon: "◴", title: "Reports", text: "Turn everyday business activity into a clearer view of what is happening." }
  ];

  const principles = [
    ["01", "Useful by default", "Technology should remove steps, not add another layer of work."],
    ["02", "Built to grow", "Start with the essentials and evolve into a deeper operating system over time."],
    ["03", "Made with intent", "Every screen should feel deliberate, calm and easy to understand." ]
  ];

  const escapeHTML = value =>
    window.AppUtils?.esc
      ? window.AppUtils.esc(value)
      : String(value ?? "").replace(/[&<>'\"]/g, char => ({
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goHome() {
    const url = new URL(window.location.href);
    url.searchParams.delete("login");
    url.hash = "dashboard";
    window.history.pushState({}, "", url);
    window.render?.();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function isLoginView() {
    return new URLSearchParams(window.location.search).get("login") === "1";
  }

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function featureCard(item, index) {
    return `
      <article class="landing-feature-card" style="--delay:${index * 70}ms">
        <span class="landing-feature-icon" aria-hidden="true">${item.icon}</span>
        <div>
          <span class="landing-card-index">0${index + 1}</span>
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.text)}</p>
        </div>
      </article>
    `;
  }

  function miniKpi(label, value, detail) {
    return `<div class="landing-mini-kpi"><small>${escapeHTML(label)}</small><strong>${escapeHTML(value)}</strong><span>${escapeHTML(detail)}</span></div>`;
  }

  function productPreview() {
    return `
      <div class="landing-stage" aria-label="Orbit BizAssist product preview">
        <div class="landing-orbit-ring landing-orbit-ring-a" aria-hidden="true"></div>
        <div class="landing-orbit-ring landing-orbit-ring-b" aria-hidden="true"></div>
        <div class="landing-stage-orb landing-stage-orb-a" aria-hidden="true"></div>
        <div class="landing-stage-orb landing-stage-orb-b" aria-hidden="true"></div>

        <div class="landing-product-card landing-product-back landing-float-one">
          <span>INVENTORY</span><strong>07</strong><small>Low stock items</small>
        </div>
        <div class="landing-product-card landing-product-side landing-float-two">
          <span>PAYMENTS</span><strong>₹18,420</strong><small>Collected today</small>
        </div>

        <div class="landing-app-window">
          <div class="landing-window-top">
            <div class="landing-window-brand"><span class="brand-mark" aria-hidden="true">O</span><span>Orbit BizAssist</span></div>
            <span class="landing-live-dot"><i></i> Workspace</span>
          </div>
          <div class="landing-window-body">
            <aside class="landing-mini-sidebar" aria-hidden="true">
              <span class="active"></span><span></span><span></span><span></span><span></span><span></span>
            </aside>
            <div class="landing-mini-content">
              <div class="landing-mini-heading">
                <div><small>Overview</small><strong>Everything in motion.</strong></div>
                <span>Live view</span>
              </div>
              <div class="landing-stat-row">
                ${miniKpi("Today's sales", "₹24,860", "+12.4% today")}
                ${miniKpi("Orders", "42", "Sales recorded")}
                ${miniKpi("Inventory", "128", "Active products")}
              </div>
              <div class="landing-mini-grid">
                <div class="landing-chart-card">
                  <div class="landing-chart-head"><div><small>Sales activity</small><b>Steady movement</b></div><span>30 DAYS</span></div>
                  <div class="mini-line" aria-hidden="true"><span style="height:24%"></span><span style="height:40%"></span><span style="height:34%"></span><span style="height:58%"></span><span style="height:51%"></span><span style="height:73%"></span><span style="height:66%"></span><span style="height:88%"></span></div>
                </div>
                <div class="landing-list-card">
                  <div><b>Recent invoices</b><span>View all</span></div>
                  <p><i></i><span>INV-1042</span><strong>₹2,480</strong></p>
                  <p><i></i><span>INV-1041</span><strong>₹1,920</strong></p>
                  <p><i></i><span>INV-1040</span><strong>₹760</strong></p>
                  <p><i></i><span>INV-1039</span><strong>₹3,180</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function companySection() {
    return `
      <section class="landing-company-wrap" id="company">
        <div class="landing-company-grid">
          <article class="landing-company-card landing-company-main">
            <span class="landing-kicker">Orbit East</span>
            <h2>Software &amp; technology, built for real work.</h2>
            <p>Orbit East is building a family of practical software products and digital solutions. Orbit BizAssist is one of those products—focused on making everyday business operations simpler, clearer and more connected.</p>
            <div class="landing-principles">
              ${principles.map(([n, title, text]) => `<div><span>${n}</span><strong>${escapeHTML(title)}</strong><p>${escapeHTML(text)}</p></div>`).join("")}
            </div>
          </article>
          <article class="landing-company-card landing-contact-card" id="contact">
            <span class="landing-kicker">Contact</span>
            <h3>Talk to Orbit East.</h3>
            <p>For product questions, feedback, support or business enquiries.</p>
            <div class="landing-company-meta">
              <div><span>Email</span><a href="mailto:support.orbiteast@gmail.com">support.orbiteast@gmail.com</a></div>
              <div><span>Address</span><strong>Main Road, Ranjit Mansion, Golaghat</strong></div>
              <div><span>Founder</span><strong>Nayanjyoti Ghosh</strong></div>
            </div>
          </article>
        </div>
      </section>
    `;
  }

  function view() {
    return `
      <main class="landing-page">
        <nav class="landing-nav" aria-label="Public navigation">
          <a class="landing-brand" href="#dashboard" data-landing-home>
            <span class="brand-mark" aria-hidden="true">O</span>
            <span><strong>Orbit BizAssist</strong><small>Software by Orbit East</small></span>
          </a>
          <div class="landing-nav-links">
            <a href="#product">Product</a>
            <a href="#company">Company</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="landing-nav-actions">
            <button class="landing-login-link" type="button" data-landing-login>Sign in</button>
            <button class="landing-nav-cta" type="button" data-landing-login>Get started <span>→</span></button>
          </div>
        </nav>

        <section class="landing-hero" id="product">
          <div class="landing-hero-copy">
            <span class="landing-kicker"><i></i> The business workspace from Orbit East</span>
            <h1>Less admin.<br><span>More momentum.</span></h1>
            <p>Orbit BizAssist brings sales, invoices, inventory, customers, Khata, payments, expenses and reporting into one focused workspace.</p>
            <div class="landing-hero-actions">
              <button class="landing-primary" type="button" data-landing-login>Start building your workspace <span aria-hidden="true">→</span></button>
              <a class="landing-secondary" href="#features">See what is inside <span aria-hidden="true">↓</span></a>
            </div>
            <div class="landing-trust-row"><span>✓ One workspace</span><span>✓ Cloud-connected</span><span>✓ Designed to grow with the business</span></div>
          </div>
          ${productPreview()}
        </section>

        <section class="landing-marquee" aria-label="Product areas">
          <div><span>SALES</span><b>×</b><span>INVOICING</span><b>×</b><span>INVENTORY</span><b>×</b><span>KHATA</span><b>×</b><span>PAYMENTS</span><b>×</b><span>REPORTS</span></div>
        </section>

        <section class="landing-features" id="features">
          <div class="landing-section-head">
            <div><span class="landing-kicker">Inside BizAssist</span><h2>The essentials, connected instead of scattered.</h2></div>
            <p>Start simple. Keep the data connected. Give the business one reliable place to work from.</p>
          </div>
          <div class="landing-feature-grid">${features.map(featureCard).join("")}</div>
        </section>

        ${companySection()}

        <section class="landing-bottom-cta">
          <div><span class="landing-kicker">Ready when you are.</span><h2>Build a cleaner business workflow.</h2><p>Open your Orbit BizAssist workspace and get started.</p></div>
          <button class="landing-primary" type="button" data-landing-login>Continue with Google <span aria-hidden="true">→</span></button>
        </section>

        <footer class="landing-footer"><span>© ${new Date().getFullYear()} Orbit East</span><span>Orbit BizAssist · Software &amp; Technology</span></footer>
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
    });

    document.querySelectorAll(".landing-page a[href^=\"#\"]").forEach(link => {
      link.addEventListener("click", event => {
        const id = link.getAttribute("href")?.slice(1);
        if (!id || id === "dashboard") return;
        event.preventDefault();
        scrollToId(id);
      });
    });
  }

  window.addEventListener("popstate", () => window.render?.());
  window.AppLanding = Object.freeze({ view, bind, goLogin, goHome, isLoginView });
})();
