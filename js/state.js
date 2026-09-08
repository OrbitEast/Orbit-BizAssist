/* =========================================================
   ORBIT BIZASSIST — STATE
   Single source of truth for the SPA.
   Supabase-compatible + future module ready.
   ========================================================= */

(() => {
  const CONFIG = Object.freeze({
    brand: "Orbit BizAssist",
    parentBrand: "Orbit East",
    tagline: "Simple tools for running your business.",
    defaultBusiness: "Orbit Café",
    currency: "INR",
    locale: "en-IN",
    taxRate: 5,
    categories: ["Beverages", "Snacks", "Bakery", "Retail"]
  });

  const SEED_ITEMS = [
    ["Chai", "Beverages", 20, 8, "☕"],
    ["Coffee", "Beverages", 90, 5, "🥤"],
    ["Veg Momos", "Snacks", 120, 4, "🥟"],
    ["Club Sandwich", "Snacks", 160, 9, "🥪"],
    ["Brownie", "Bakery", 80, 6, "🍫"]
  ];

  function createSeedItems() {
    return SEED_ITEMS.map((item, index) => ({
      id: `item-${index + 1}`,
      name: item[0],
      category: item[1],
      selling: Number(item[2]),
      cost: Math.round(Number(item[2]) * 0.45),
      stock: Number(item[3]),
      threshold: 5,
      sku: `OB-${101 + index}`,
      icon: item[4],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  function createBusiness(name = CONFIG.defaultBusiness) {
    const timestamp = Date.now();
    return {
      id: `biz-${timestamp}`,
      name,
      phone: "",
      email: "",
      address: "",
      gstin: "",
      currency: CONFIG.currency,
      locale: CONFIG.locale,
      taxRate: CONFIG.taxRate,
      items: createSeedItems(),
      invoices: [],
      contacts: [],
      ledger: [],
      expenses: [],
      stockLog: [],
      staff: [{ id: "owner", name: "Owner", role: "Owner / Admin" }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  function createInitialState() {
    const business = createBusiness();
    return {
      version: 1,
      businesses: [business],
      activeBusiness: business.id,
      cart: [],
      documentType: "Invoice",
      payment: "UPI",
      discount: { type: "flat", value: 0 },
      user: null,
      page: "dashboard",
      ui: { sidebarOpen: false, modalOpen: false, loading: false },
      meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    };
  }

  let state = createInitialState();

  function getState() { return state; }

  function setState(nextState) {
    if (!nextState || typeof nextState !== "object") {
      console.error("Orbit BizAssist: invalid state update.");
      return state;
    }
    state = nextState;
    return state;
  }

  function mergeState(patch) {
    if (!patch || typeof patch !== "object") return state;
    state = {
      ...state,
      ...patch,
      meta: { ...(state.meta || {}), updatedAt: new Date().toISOString() }
    };
    return state;
  }

  function resetState() {
    state = createInitialState();
    return state;
  }

  function getBusiness(businessId = state.activeBusiness) {
    return state.businesses?.find(business => business.id === businessId) || state.businesses?.[0] || null;
  }

  function setActiveBusiness(businessId) {
    const exists = state.businesses?.some(business => business.id === businessId);
    if (!exists) return getBusiness();
    state = {
      ...state,
      activeBusiness: businessId,
      cart: [],
      meta: { ...(state.meta || {}), updatedAt: new Date().toISOString() }
    };
    return getBusiness();
  }

  function addBusiness(data = {}) {
    const business = {
      ...createBusiness(data.name || `Business ${state.businesses.length + 1}`),
      ...data,
      id: data.id || `biz-${Date.now()}`
    };
    state = {
      ...state,
      businesses: [...(state.businesses || []), business],
      activeBusiness: business.id,
      cart: []
    };
    return business;
  }

  /*
   * Supports both the current API:
   *   updateBusiness(patch)
   * and the legacy API:
   *   updateBusiness(businessId, patch)
   *
   * Keeping this compatibility here avoids wrapping the frozen AppState
   * object in a Proxy, which causes strict ECMAScript invariant errors.
   */
  function updateBusiness(first = {}, second = null) {
    let businessId = state.activeBusiness;
    let patch = first;

    if (typeof first === "string" && second && typeof second === "object") {
      businessId = first;
      patch = second;
    }

    if (!patch || typeof patch !== "object") return getBusiness(businessId);

    const current = getBusiness(businessId);
    if (!current) return null;

    const updated = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString()
    };

    state = {
      ...state,
      businesses: state.businesses.map(business => business.id === current.id ? updated : business),
      meta: { ...(state.meta || {}), updatedAt: new Date().toISOString() }
    };

    return updated;
  }

  function items() { return getBusiness()?.items || []; }
  function invoices() { return getBusiness()?.invoices || []; }
  function contacts() { return getBusiness()?.contacts || []; }
  function expenses() { return getBusiness()?.expenses || []; }
  function staff() { return getBusiness()?.staff || []; }
  function ledger() { return getBusiness()?.ledger || []; }

  function save() {
    const cloud = window.orbitCloud;
    const snapshot = { ...state, cart: [] };

    try {
      localStorage.setItem("orbit-bizassist-state", JSON.stringify(snapshot));
    } catch (error) {
      console.warn("Orbit BizAssist local save failed:", error);
    }

    if (!cloud || typeof cloud.save !== "function") return Promise.resolve(false);

    return cloud.save(snapshot).then(() => true).catch(error => {
      console.error("Orbit BizAssist cloud save failed:", error);
      if (typeof window.toast === "function") window.toast("Saved locally. Cloud sync failed.");
      return false;
    });
  }

  window.AppState = Object.freeze({
    get: getState,
    set: setState,
    merge: mergeState,
    reset: resetState,
    initial: createInitialState,
    config: CONFIG,
    business: getBusiness,
    setActiveBusiness,
    addBusiness,
    updateBusiness,
    items,
    invoices,
    contacts,
    expenses,
    staff,
    ledger,
    save
  });

  Object.defineProperty(window, "state", {
    configurable: true,
    get() { return state; },
    set(value) { if (value && typeof value === "object") state = value; }
  });

  window.$ = window.$ || (selector => document.querySelector(selector));
  window.esc = window.esc || (value => String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[character])));
  window.money = window.money || (value => {
    const business = getBusiness();
    return new Intl.NumberFormat(business?.locale || CONFIG.locale, {
      style: "currency",
      currency: business?.currency || CONFIG.currency,
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  });
  window.now = window.now || (() => new Date().toISOString());
})();