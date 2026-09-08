/* =========================================================
   ORBIT BIZASSIST — UI CORE
   Central rendering + application shell
   ========================================================= */

(() => {
  const APP = "#app";

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: "⌂" },
    { id: "invoices", label: "Invoices", icon: "▣" },
    { id: "khata", label: "Khata", icon: "₹" },
    { id: "inventory", label: "Inventory", icon: "▤" },
    { id: "expenses", label: "Expenses", icon: "↗" },
    { id: "reports", label: "Reports", icon: "◴" }
  ];

  const MORE_ITEMS = [
    { id: "staff", label: "Staff", icon: "♙" },
    { id: "settings", label: "Settings", icon: "⚙" }
  ];


  /* =======================================================
     HELPERS
     ======================================================= */

  function activeRoute() {
    return window.AppRouter?.current?.() || "dashboard";
  }

  function getUser() {
    return window.AppState?.get?.()?.user || null;
  }

  function getBusiness() {
    const current = window.AppState?.get?.();

    if (!current) return null;

    return (
      current.businesses?.find(
        business => business.id === current.activeBusiness
      ) ||
      current.businesses?.[0] ||
      null
    );
  }

  function userName() {
    const user = getUser();

    return (
      user?.name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Owner"
    );
  }

  function initials(name) {
    return String(name || "Owner")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join("") || "O";
  }

  function escapeHTML(value) {
    if (window.AppUtils?.esc) {
      return window.AppUtils.esc(value);
    }

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }


  /* =======================================================
     SIDEBAR
     ======================================================= */

  function navigationItem(item, current) {
    const active = item.id === current;

    return `
      <button
        class="nav-item ${active ? "active" : ""}"
        type="button"
        data-route="${item.id}"
        aria-current="${active ? "page" : "false"}"
      >
        <span aria-hidden="true">${item.icon}</span>
        <strong>${item.label}</strong>
      </button>
    `;
  }

  function sidebar() {
    const current = activeRoute();
    const business = getBusiness();

    return `
      <aside class="sidebar">

        <div class="sidebar-brand">
          <span class="brand-mark" aria-hidden="true">O</span>
          <span>Orbit BizAssist</span>
        </div>

        <div class="business-switch">
          <small>BUSINESS</small>
          <strong>
            ${escapeHTML(business?.name || "My Business")}
          </strong>
        </div>

        <nav
          class="sidebar-nav"
          aria-label="Main navigation"
        >
          ${NAV_ITEMS.map(item => navigationItem(item, current)).join("")}

          <div class="nav-divider"></div>

          ${MORE_ITEMS.map(item => navigationItem(item, current)).join("")}
        </nav>

        <div class="sidebar-bottom">
          <button
            class="nav-item"
            type="button"
            data-action="signout"
          >
            <span aria-hidden="true">↪</span>
            <strong>Sign out</strong>
          </button>
        </div>

      </aside>
    `;
  }


  /* =======================================================
     TOP BAR
     ======================================================= */

  function pageTitle(route) {
    const item = [...NAV_ITEMS, ...MORE_ITEMS]
      .find(entry => entry.id === route);

    return item?.label || "Dashboard";
  }

  function topbar() {
    const route = activeRoute();
    const name = userName();

    return `
      <header class="topbar">

        <div>
          <span class="eyebrow">
            ${escapeHTML(getBusiness()?.name || "Workspace")}
          </span>

          <h1>${pageTitle(route)}</h1>
        </div>

        <div class="topbar-actions">

          <button
            class="icon-btn mobile-menu-button"
            type="button"
            data-action="mobile-menu"
            aria-label="Open navigation"
            title="Menu"
          >
            ☰
          </button>

          <button
            class="icon-btn"
            type="button"
            data-action="notifications"
            aria-label="Notifications"
            title="Notifications"
          >
            ♢
          </button>

          <div
            class="user-avatar"
            title="${escapeHTML(name)}"
            aria-label="${escapeHTML(name)}"
          >
            ${escapeHTML(initials(name))}
          </div>

        </div>

      </header>
    `;
  }


  /* =======================================================
     ROUTE VIEW
     ======================================================= */

  function routeView() {
    const route = activeRoute();

    if (
  route === "invoices" &&
  typeof window.POS?.view === "function"
) {
  const html = window.POS.view();

  setTimeout(() => {
    window.POS.render();
  }, 0);

  return html;
}
     if (
  route === "inventory" &&
  typeof window.Inventory?.view === "function"
) {
  const html = window.Inventory.view();

  setTimeout(() => {
    window.Inventory.render();
  }, 0);

  return html;
}
     if (
  route === "khata" &&
  typeof window.Khata?.view === "function"
) {
  const html = window.Khata.view();

  setTimeout(() => {
    window.Khata.render();
  }, 0);

  return html;
}
    return `
      <main class="page">
        <section class="empty-state">
          <div class="empty-icon" aria-hidden="true">✦</div>

          <h4>
            ${escapeHTML(pageTitle(route))} is coming next
          </h4>

          <p>
            This workspace is being built module by module.
            Your business data and authentication stay connected.
          </p>

          <button
            class="primary-btn"
            type="button"
            data-route="dashboard"
          >
            Back to Dashboard
          </button>
        </section>
      </main>
    `;
  }


  /* =======================================================
     APPLICATION SHELL
     ======================================================= */

  function appShell() {
    return `
      <div class="app-shell">

        ${sidebar()}

        <div class="main-content">

          ${topbar()}

          ${routeView()}

        </div>

      </div>
    `;
  }


  /* =======================================================
     AUTH / APP RENDER
     ======================================================= */

  function render() {
    const root = document.querySelector(APP);

    if (!root) {
      console.error("Orbit BizAssist: #app element not found.");
      return;
    }

    const user = getUser();

    if (!user) {
      root.innerHTML =
        typeof window.auth === "function"
          ? window.auth()
          : `
            <section class="auth-page">
              <div class="auth-panel">
                <div class="login-box">
                  <h2>Orbit BizAssist</h2>
                  <p>Authentication interface unavailable.</p>
                </div>
              </div>
            </section>
          `;

      root.setAttribute("aria-busy", "false");
      return;
    }

    root.innerHTML = appShell();
    root.setAttribute("aria-busy", "false");
  }


  /* =======================================================
     EVENT HANDLING
     Event delegation = future-proof.
     No onclick handlers required for navigation.
     ======================================================= */

  function handleClick(event) {
    const routeTarget = event.target.closest("[data-route]");

    if (routeTarget) {
      event.preventDefault();

      const route = routeTarget.dataset.route;

      if (window.AppRouter?.go) {
        window.AppRouter.go(route);
      }

      return;
    }

    const actionTarget = event.target.closest("[data-action]");

    if (!actionTarget) return;

    const action = actionTarget.dataset.action;

    if (action === "signout") {
      signOut();
      return;
    }

    if (action === "notifications") {
      if (typeof toast === "function") {
        toast("No new notifications.");
      }
      return;
    }

    if (action === "mobile-menu") {
      toggleMobileNavigation();
    }
  }


  /* =======================================================
     MOBILE NAVIGATION
     ======================================================= */

  function toggleMobileNavigation() {
    document.body.classList.toggle("mobile-nav-open");
  }


  function closeMobileNavigation() {
    document.body.classList.remove("mobile-nav-open");
  }


  /* =======================================================
     SIGN OUT
     ======================================================= */

  function signOut() {
    try {
      window.orbitCloud?.signOut?.();
    } catch (error) {
      console.error("Orbit BizAssist sign-out error:", error);
    }

    if (window.AppState?.merge) {
      window.AppState.merge({
        user: null,
        page: "dashboard"
      });
    }

    closeMobileNavigation();

    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }

    render();
  }


  /* =======================================================
     GLOBAL EVENTS
     ======================================================= */

  document.addEventListener("click", handleClick);

  window.addEventListener("hashchange", () => {
    closeMobileNavigation();
    render();
  });


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.AppUI = Object.freeze({
    render,
    appShell,
    sidebar,
    topbar,
    routeView,
    closeMobileNavigation
  });

  window.render = render;
})();
