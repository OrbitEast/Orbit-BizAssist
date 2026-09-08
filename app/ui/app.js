(() => {
  "use strict";

  const root = document.querySelector("#app");
  const core = window.OrbitBizAssist;
  if (!root || !core) return;

  const navGroups = [
    { label: "Workspace", items: [["dashboard", "Overview"]] },
    { label: "Sales", items: [["invoices", "Invoices"], ["quotations", "Quotations"], ["orders", "Sales orders"], ["payments", "Payments"]] },
    { label: "Purchases", items: [["purchases", "Purchases"], ["vendors", "Vendors"], ["expenses", "Expenses"]] },
    { label: "Inventory", items: [["products", "Products"], ["stock", "Stock & movements"]] },
    { label: "Finance", items: [["accounting", "Accounting"], ["reports", "Reports"]] }
  ];

  const icon = name => {
    const icons = {
      overview: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v7H4zM14 4h6v4h-6zM14 12h6v8h-6zM4 15h6v5H4z"/></svg>',
      invoice: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6M9 15h4"/></svg>',
      box: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4-8 4-8-4 8-4Zm-8 8 8 4 8-4M4 15l8 4 8-4"/></svg>',
      wallet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6Zm0 0V4h14M15 13h5"/><circle cx="15" cy="13" r=".8"/></svg>',
      cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h2l2 11h9l2-8H7M10 20h.01M17 20h.01"/></svg>',
      users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M15 5a3 3 0 0 1 0 6M16 14a5 5 0 0 1 5 5"/></svg>',
      chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h16M8 16v-5M12 16V7M16 16v-3M20 16V4"/></svg>',
      search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>',
      bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>'
    };
    return icons[name] || icons.overview;
  };

  const itemIcon = key => {
    if (key === "dashboard") return "overview";
    if (key.includes("invoice") || key.includes("quotation")) return "invoice";
    if (key.includes("product") || key.includes("stock")) return "box";
    if (key.includes("payment") || key.includes("accounting")) return "wallet";
    if (key.includes("purchase") || key.includes("orders")) return "cart";
    if (key.includes("vendor")) return "users";
    if (key.includes("report")) return "chart";
    return "overview";
  };

  function sidebar() {
    return `
      <aside class="app-sidebar">
        <div class="brand-lockup">
          <span class="brand-orbit-mark" aria-hidden="true"><span></span></span>
          <span><strong>Orbit</strong><small>BizAssist</small></span>
        </div>
        <button class="workspace-switcher" type="button">
          <span class="workspace-avatar">O</span>
          <span class="workspace-copy"><strong>Your business</strong><small>Personal workspace</small></span>
          <span class="workspace-chevron">⌄</span>
        </button>
        <nav class="side-nav" aria-label="Main navigation">
          ${navGroups.map(group => `
            <div class="nav-group">
              <span class="nav-label">${group.label}</span>
              ${group.items.map(([key, label]) => `
                <button class="nav-item ${key === "dashboard" ? "is-active" : ""}" type="button" data-nav="${key}">
                  <span class="nav-icon">${icon(itemIcon(key))}</span><span>${label}</span>
                </button>`).join("")}
            </div>`).join("")}
        </nav>
        <div class="side-bottom">
          <button class="nav-item" type="button"><span class="nav-icon">${icon("users")}</span><span>Team</span></button>
          <button class="nav-item" type="button"><span class="nav-icon settings-glyph">⚙</span><span>Settings</span></button>
          <div class="sidebar-user">
            <span class="user-avatar">N</span>
            <span><strong>Nayanjyoti</strong><small>Owner</small></span>
            <span class="sidebar-more">•••</span>
          </div>
        </div>
      </aside>`;
  }

  function topbar() {
    return `
      <header class="app-topbar">
        <div class="topbar-mobile-brand"><span class="brand-orbit-mini"></span><strong>Orbit</strong></div>
        <div class="topbar-search"><span>${icon("search")}</span><input aria-label="Search" placeholder="Search anything…" /><kbd>⌘ K</kbd></div>
        <div class="topbar-actions">
          <button class="icon-button" aria-label="Notifications">${icon("bell")}<i></i></button>
          <button class="help-button" type="button">Help</button>
          <span class="top-divider"></span>
          <button class="profile-chip" type="button"><span class="user-avatar small">N</span><span>Nayanjyoti</span><b>⌄</b></button>
        </div>
      </header>`;
  }

  function metricCard(title, detail, symbol) {
    return `<article class="metric-card"><div class="metric-top"><span>${title}</span><span class="metric-symbol">${symbol}</span></div><strong>—</strong><small>${detail}</small></article>`;
  }

  function dashboard() {
    return `
      <div class="dashboard-page">
        <div class="page-heading">
          <div><div class="eyebrow">Overview</div><h1>Your business, in orbit.</h1><p>A calm command centre for sales, money, customers and everything moving through your business.</p></div>
          <button class="primary-button" type="button"><span>＋</span> Create invoice</button>
        </div>
        <section class="setup-banner">
          <div class="setup-orbit-art" aria-hidden="true"><span class="setup-core"></span><span class="setup-ring one"></span><span class="setup-ring two"></span><i>✦</i></div>
          <div class="setup-copy"><span class="setup-kicker">FIRST STEPS</span><h2>Set up your workspace</h2><p>Add your business details, tax preferences and document settings before your first transaction.</p></div>
          <button class="secondary-button" type="button">Open setup <span>→</span></button>
        </section>
        <section class="metrics-grid" aria-label="Business summary">
          ${metricCard("Sales", "No sales recorded yet", "↗")}
          ${metricCard("Outstanding", "No receivables yet", "₹")}
          ${metricCard("Expenses", "No expenses yet", "−")}
          ${metricCard("Stock value", "No inventory yet", "▣")}
        </section>
        <section class="dashboard-grid">
          <article class="dashboard-card chart-card">
            <div class="card-header"><div><span class="card-eyebrow">SALES</span><h3>Sales performance</h3></div><button class="ghost-button" type="button">This month⌄</button></div>
            <div class="empty-chart"><div class="chart-lines"><span></span><span></span><span></span><span></span></div><div class="chart-axis"><b>Week 1</b><b>Week 2</b><b>Week 3</b><b>Week 4</b></div><div class="chart-message"><div class="empty-icon">↗</div><strong>Your sales story starts here</strong><span>Record your first invoice to see performance trends.</span></div></div>
          </article>
          <article class="dashboard-card activity-card">
            <div class="card-header"><div><span class="card-eyebrow">ACTIVITY</span><h3>Recent activity</h3></div><button class="ghost-link" type="button">View all →</button></div>
            <div class="activity-empty"><div class="empty-icon">◌</div><strong>Nothing here yet</strong><span>Your latest invoices, payments and business events will appear here.</span></div>
          </article>
        </section>
        <section class="quick-grid">
          <article class="dashboard-card quick-card"><div><span class="quick-icon">＋</span><strong>Create an invoice</strong><small>Send a professional bill in minutes.</small></div><span class="quick-arrow">→</span></article>
          <article class="dashboard-card quick-card"><div><span class="quick-icon">◫</span><strong>Add a product</strong><small>Start your inventory catalogue.</small></div><span class="quick-arrow">→</span></article>
          <article class="dashboard-card quick-card"><div><span class="quick-icon">◯</span><strong>Add a customer</strong><small>Keep relationships and balances connected.</small></div><span class="quick-arrow">→</span></article>
        </section>
      </div>`;
  }

  function renderApp() {
    root.innerHTML = `<div class="app-frame">${sidebar()}<div class="app-main">${topbar()}<main class="app-content"><div class="ambient-orbit" aria-hidden="true"><span class="ambient-core"></span><span class="ambient-ring ring-1"></span><span class="ambient-ring ring-2"></span><span class="ambient-ring ring-3"></span><i class="orbit-star">✦</i></div>${dashboard()}</main></div></div>`;
  }

  const start = () => {
    try {
      core.bootstrap?.start?.();
      renderApp();
    } catch (error) {
      console.error("Orbit BizAssist failed to start:", error);
      root.innerHTML = `<main class="app-error"><h1>Orbit BizAssist</h1><p>The application foundation could not start.</p></main>`;
    }
  };

  start();
})();
