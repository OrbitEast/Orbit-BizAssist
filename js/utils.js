 /* =========================================================
    ORBIT BIZASSIST — UTILITIES
    Shared, dependency-light helper functions.
    ========================================================= */

(() => {
  /* =======================================================
     DATE / TIME
     ======================================================= */

  function now() {
    return new Date().toISOString();
  }


  function formatDate(value, options = {}) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    const defaults = {
      day: "2-digit",
      month: "short",
      year: "numeric"
    };

    return new Intl.DateTimeFormat(
      options.locale || "en-IN",
      {
        ...defaults,
        ...options
      }
    ).format(date);
  }


  function formatDateTime(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }


  /* =======================================================
     SECURITY / HTML
     ======================================================= */

  function esc(value) {
    return String(value ?? "").replace(
      /[&<>'"]/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      }[character])
    );
  }


  /* =======================================================
     NUMBERS / MONEY
     ======================================================= */

  function number(value, fallback = 0) {
    const parsed = Number(value);

    return Number.isFinite(parsed)
      ? parsed
      : fallback;
  }


  function round(value, decimals = 2) {
    const factor = 10 ** decimals;

    return Math.round(
      (number(value) + Number.EPSILON) * factor
    ) / factor;
  }


  function money(value, currency, locale) {
    const business =
      window.AppState?.business?.() || null;

    const activeCurrency =
      currency ||
      business?.currency ||
      window.AppState?.config?.currency ||
      "INR";

    const activeLocale =
      locale ||
      business?.locale ||
      window.AppState?.config?.locale ||
      "en-IN";

    return new Intl.NumberFormat(
      activeLocale,
      {
        style: "currency",
        currency: activeCurrency,
        maximumFractionDigits: 0
      }
    ).format(number(value));
  }


  /* =======================================================
     IDs
     ======================================================= */

  function id(prefix = "id") {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }


  /* =======================================================
     STRINGS
     ======================================================= */

  function slug(value) {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }


  function initials(value, fallback = "O") {
    const result = String(value ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join("");

    return result || fallback;
  }


  /* =======================================================
     DOM
     ======================================================= */

  function $(selector, root = document) {
    return root.querySelector(selector);
  }


  function $$(selector, root = document) {
    return Array.from(
      root.querySelectorAll(selector)
    );
  }


  /* =======================================================
     GENERAL HELPERS
     ======================================================= */

  function clamp(value, min, max) {
    return Math.min(
      Math.max(number(value), min),
      max
    );
  }


  function sleep(milliseconds) {
    return new Promise(resolve => {
      window.setTimeout(resolve, milliseconds);
    });
  }


  function debounce(callback, delay = 250) {
    let timer = null;

    return (...args) => {
      window.clearTimeout(timer);

      timer = window.setTimeout(
        () => callback(...args),
        delay
      );
    };
  }


  function isToday(value) {
    if (!value) return false;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.AppUtils = Object.freeze({
    now,
    formatDate,
    formatDateTime,

    esc,

    number,
    round,
    money,

    id,

    slug,
    initials,

    $,
    $$,

    clamp,
    sleep,
    debounce,

    isToday
  });


  /* =======================================================
     BACKWARD COMPATIBILITY
     Existing modules can use these globals during migration.
     ======================================================= */

  window.now = window.now || now;
  window.esc = window.esc || esc;
  window.money = window.money || money;
  window.$ = window.$ || $;
})();
