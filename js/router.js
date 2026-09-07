/* =========================================================
   ORBIT BIZASSIST — ROUTER
   Hash-based SPA routing
   ========================================================= */

(() => {
  const DEFAULT_ROUTE = "dashboard";

  const ROUTES = new Set([
    "dashboard",
    "invoices",
    "khata",
    "inventory",
    "expenses",
    "reports",
    "staff",
    "settings"
  ]);

  function normalize(route) {
    const value = String(route || "")
      .trim()
      .toLowerCase()
      .replace(/^#/, "")
      .replace(/^\/+/, "")
      .split("?")[0];

    return ROUTES.has(value) ? value : DEFAULT_ROUTE;
  }

  function current() {
    return normalize(window.location.hash);
  }

  function go(route) {
    const next = normalize(route);

    if (current() === next) {
      render();
      return;
    }

    window.location.hash = next;
  }

  function handleChange() {
    const route = current();

    if (window.AppState && typeof window.AppState.merge === "function") {
      window.AppState.merge({ page: route });
    }

    if (typeof render === "function") {
      render();
    }
  }

  function init() {
    if (!window.location.hash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}#${DEFAULT_ROUTE}`
      );
    }

    window.addEventListener("hashchange", handleChange);

    return current();
  }

  window.AppRouter = {
    routes: Object.freeze([...ROUTES]),
    current,
    go,
    init
  };

  /* Safe initialization. */
  init();
})();
