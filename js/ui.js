/* =========================================================
   ORBIT BIZASSIST — UI CORE
   Premium application shell, navigation and account surface
   ========================================================= */

(() => {
  "use strict";

  const APP = "#app";

  const NAV_ITEMS = [
    { id: "dashboard", label: "Overview", icon: "⌂", hint: "Home" },
    { id: "invoices", label: "Invoices", icon: "▣", hint: "Billing" },
    { id: "khata", label: "Khata", icon: "₹", hint: "Receivables" },
    { id: "inventory", label: "Inventory", icon: "▤", hint: "Stock" },
    { id: "expenses", label: "Expenses", icon: "↗", hint: "Spending" },
    { id: "reports", label: "Reports", icon: "◴", hint: "Insights" }
  ];

  const MORE_ITEMS = [
    { id: "staff", label: "Staff", icon: "♙", hint: "Team" },
    { id: "settings", label: "Settings", icon: "⚙", hint: "Workspace" }
  ];

  function activeRoute() { return window.AppRouter?.current?.() || "dashboard"; }
  function getState() { return window.AppState?.get?.() || {}; }
  function getUser() { return getState().user || null; }
  function getBusiness() {
    const current = getState();
    return current.businesses?.find(b => b.id === current.activeBusiness) || current.businesses?.[0] || null;
  }
  function userName() {
    const user = getUser();
    return user?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Owner";
  }
  function userAvatar() { return getUser()?.avatar || ""; }
  function initials(name) {
    return String(name || "Owner").trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join("") || "O";
  }
  function escapeHTML(value) {
    if (window.AppUtils?.esc) return window.AppUtils.esc(value);
    return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));
  }
  function avatarHTML(size = "sm") {
    const name = userName();
    const avatar = userAvatar();
    return avatar
      ? `<img class="app-avatar ${size}" src="${escapeHTML(avatar)}" alt="${escapeHTML(name)}">`
      : `<span class="app-avatar ${size}" aria-hidden="true">${escapeHTML(initials(name))}</span>`;
  }

  function navigationItem(item, current) {
    const active = item.id === current;
    return `<button class="nav-item ${active ? "active" : ""}" type="button" data-route="${item.id}" aria-current="${active ? "page" : "false"}"
      title="${escapeHTML(item.label)} — ${escapeHTML(item.hint)}">
      <span class="nav-icon" aria-hidden="true">${item.icon}</span>
      <span class="nav-copy"><strong>${escapeHTML(item.label)}</strong><small>${escapeHTML(item.hint)}</small></span>
      ${active ? `<i class="nav-active-dot" aria-hidden="true"></i>` : ""}
    </button>`;
  }

  function sidebar() {
    const current = activeRoute();
    const business = getBusiness();
    const name = userName();
    return `<aside class="sidebar" aria-label="Orbit BizAssist navigation">
      <div class="sidebar-brand-row">
        <div class="sidebar-brand"><span class="brand-mark" aria-hidden="true">O</span><span><strong>Orbit</strong><small>BizAssist</small></span></div>
        <button class="sidebar-collapse" type="button" aria-label="Collapse navigation" title="Collapse navigation" data-action="sidebar-collapse">‹</button>
      </div>

      <button class="business-switch" type="button" data-action="business-switch" aria-label="Current business: ${escapeHTML(business?.name || "My Business")}">
        <span class="business-logo" aria-hidden="true">${escapeHTML(initials(business?.name || "MB").charAt(0))}</span>
        <span class="business-copy"><small>WORKSPACE</small><strong>${escapeHTML(business?.name || "My Business")}</strong></span>
        <span class="business-chevron" aria-hidden="true">⌄</span>
      </button>

      <button class="global-search" type="button" data-action="global-search" aria-label="Search Orbit BizAssist" title="Search (Ctrl/Cmd + K)">
        <span aria-hidden="true">⌕</span><span>Search anything…</span><kbd>⌘K</kbd>
      </button>

      <div class="nav-section-label">Workspace</div>
      <nav class="sidebar-nav" aria-label="Main navigation">${NAV_ITEMS.map(item => navigationItem(item, current)).join("")}</nav>
      <div class="nav-divider"></div>
      <div class="nav-section-label">Manage</div>
      <nav class="sidebar-nav" aria-label="Management navigation">${MORE_ITEMS.map(item => navigationItem(item, current)).join("")}</nav>

      <div class="sidebar-bottom">
        <div class="sidebar-status"><span class="status-dot" aria-hidden="true"></span><span><strong>Cloud synced</strong><small>Your data is up to date</small></span></div>
        <button class="sidebar-profile" type="button" data-action="profile" aria-label="Open profile for ${escapeHTML(name)}">
          ${avatarHTML("sm")}<span><strong>${escapeHTML(name)}</strong><small>${escapeHTML(getUser()?.role || "Owner / Admin")}</small></span><span class="profile-more" aria-hidden="true">•••</span>
        </button>
      </div>
    </aside>`;
  }

  function pageTitle(route) {
    const item = [...NAV_ITEMS, ...MORE_ITEMS].find(entry => entry.id === route);
    return item?.label || "Overview";
  }

  function topbar() {
    const route = activeRoute();
    const business = getBusiness();
    return `<header class="topbar">
      <div class="topbar-heading"><span class="breadcrumb">${escapeHTML(business?.name || "Workspace")} <b>›</b> ${escapeHTML(pageTitle(route))}</span><h1>${escapeHTML(pageTitle(route))}</h1></div>
      <div class="topbar-actions">
        <button class="topbar-search" type="button" data-action="global-search" aria-label="Search" title="Search (Ctrl/Cmd + K)"><span aria-hidden="true">⌕</span><span>Search</span><kbd>⌘K</kbd></button>
        <button class="icon-btn mobile-menu-button" type="button" data-action="mobile-menu" aria-label="Open navigation" title="Menu">☰</button>
        <button class="icon-btn notification-button" type="button" data-action="notifications" aria-label="Notifications" title="Notifications"><span aria-hidden="true">♢</span><i aria-hidden="true"></i></button>
        <button class="topbar-avatar" type="button" data-action="profile" aria-label="Open your profile" title="Profile">${avatarHTML("sm")}</button>
      </div>
    </header>`;
  }

  function routeView() {
    const route = activeRoute();
    if (route === "dashboard" && typeof window.dashboard === "function") return window.dashboard();
    if (route === "invoices" && typeof window.POS?.view === "function") {
      const html = window.POS.view(); setTimeout(() => window.POS.render(), 0); return html;
    }
    if (route === "inventory" && typeof window.Inventory?.view === "function") {
      const html = window.Inventory.view(); setTimeout(() => window.Inventory.render(), 0); return html;
    }
    if (route === "khata" && typeof window.Khata?.view === "function") {
      const html = window.Khata.view(); setTimeout(() => window.Khata.render(), 0); return html;
    }
    return `<main class="page"><section class="empty-state"><div class="empty-icon" aria-hidden="true">✦</div><span class="eyebrow">Coming next</span><h4>${escapeHTML(pageTitle(route))}</h4><p>This workspace is being built module by module. Your business data and authentication remain connected.</p><button class="primary-btn" type="button" data-route="dashboard">Back to Overview</button></section></main>`;
  }

  function appShell() { return `<div class="app-shell">${sidebar()}<div class="main-content">${topbar()}${routeView()}</div></div>`; }

  function render() {
    const root = document.querySelector(APP);
    if (!root) { console.error("Orbit BizAssist: #app element not found."); return; }
    const user = getUser();
    if (!user) {
      root.innerHTML = typeof window.auth === "function" ? window.auth() : `<section class="auth-page"><div class="auth-panel"><div class="login-box"><h2>Orbit BizAssist</h2><p>Authentication interface unavailable.</p></div></div></section>`;
      root.setAttribute("aria-busy", "false"); return;
    }
    const onboarding = getState().onboarding;
    if (!onboarding?.completed) {
      root.innerHTML = typeof window.AppOnboarding?.view === "function" ? window.AppOnboarding.view() : `<section class="auth-card"><h2>Setting up your workspace…</h2></section>`;
      root.setAttribute("aria-busy", "false"); setTimeout(() => window.AppOnboarding?.bind?.(), 0); return;
    }
    root.innerHTML = appShell();
    root.setAttribute("aria-busy", "false");
  }

  function toggleMobileNavigation() { document.body.classList.toggle("mobile-nav-open"); }
  function closeMobileNavigation() { document.body.classList.remove("mobile-nav-open"); }
  function openGlobalSearch() {
    const existing = document.querySelector("[data-command-palette]");
    if (existing) { existing.querySelector("input")?.focus(); return; }
    document.body.insertAdjacentHTML("beforeend", `<div class="command-overlay" data-command-palette role="dialog" aria-modal="true" aria-label="Search Orbit BizAssist"><div class="command-palette"><div class="command-head"><span class="command-icon">⌕</span><input type="search" autocomplete="off" placeholder="Search pages, customers, products…" aria-label="Search Orbit BizAssist"><button type="button" data-action="close-command" aria-label="Close search">×</button></div><div class="command-results"><button type="button" data-route="dashboard"><span>⌂</span><strong>Overview</strong><small>Dashboard</small></button><button type="button" data-route="invoices"><span>▣</span><strong>Invoices</strong><small>Create and manage invoices</small></button><button type="button" data-route="inventory"><span>▤</span><strong>Inventory</strong><small>Products and stock</small></button><button type="button" data-route="khata"><span>₹</span><strong>Khata</strong><small>Customer balances</small></button></div><div class="command-foot"><span>Navigate</span><kbd>↑</kbd><kbd>↓</kbd><span>Select</span><kbd>↵</kbd><span>Close</span><kbd>Esc</kbd></div></div></div>`);
    document.querySelector("[data-command-palette] input")?.focus();
  }
  function closeGlobalSearch() { document.querySelector("[data-command-palette]")?.remove(); }
  function signOut() {
    try { window.orbitCloud?.signOut?.(); } catch (error) { console.error("Orbit BizAssist sign-out error:", error); }
    if (window.AppState?.merge) window.AppState.merge({ user: null, page: "dashboard" });
    closeMobileNavigation(); closeGlobalSearch();
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    render();
  }

  function handleClick(event) {
    const routeTarget = event.target.closest("[data-route]");
    if (routeTarget) { event.preventDefault(); closeGlobalSearch(); closeMobileNavigation(); window.AppRouter?.go?.(routeTarget.dataset.route); return; }
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;
    if (action === "signout") { signOut(); return; }
    if (action === "profile") { window.AppProfile?.open?.(); return; }
    if (action === "global-search") { openGlobalSearch(); return; }
    if (action === "close-command") { closeGlobalSearch(); return; }
    if (action === "notifications") { if (typeof toast === "function") toast("You’re all caught up."); return; }
    if (action === "mobile-menu") { toggleMobileNavigation(); return; }
    if (action === "sidebar-collapse") { document.body.classList.toggle("sidebar-collapsed"); return; }
    if (action === "business-switch") { if (typeof toast === "function") toast("Business switching will be available in Workspace settings."); return; }
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openGlobalSearch(); return; }
    if (event.key === "Escape") { closeGlobalSearch(); closeMobileNavigation(); }
  });
  window.addEventListener("hashchange", () => { closeMobileNavigation(); closeGlobalSearch(); render(); });

  window.AppUI = Object.freeze({ render, appShell, sidebar, topbar, routeView, closeMobileNavigation, signOut });
  window.render = render;
})();