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

    categories: [
      "Beverages",
      "Snacks",
      "Bakery",
      "Retail"
    ]
  });


  /* =======================================================
     SEED DATA
     Used only when a brand-new workspace is created.
     ======================================================= */

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


  /* =======================================================
     BUSINESS FACTORY
     ======================================================= */

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

      staff: [
        {
          id: "owner",
          name: "Owner",
          role: "Owner / Admin"
        }
      ],

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }


  /* =======================================================
     INITIAL STATE
     ======================================================= */

  function createInitialState() {
    const business = createBusiness();

    return {
      version: 1,

      businesses: [business],

      activeBusiness: business.id,

      /*
       * POS state
       */
      cart: [],
      documentType: "Invoice",
      payment: "UPI",

      discount: {
        type: "flat",
        value: 0
      },

      /*
       * Authentication
       */
      user: null,

      /*
       * Router
       */
      page: "dashboard",

      /*
       * UI state
       * Kept separate so future modules can expand it
       * without changing the main data model.
       */
      ui: {
        sidebarOpen: false,
        modalOpen: false,
        loading: false
      },

      /*
       * Future-ready application metadata.
       */
      meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }


  /* =======================================================
     GLOBAL STATE
     ======================================================= */

  let state = createInitialState();


  /* =======================================================
     BASIC HELPERS
     ======================================================= */

  function getState() {
    return state;
  }


  function setState(nextState) {
    if (!nextState || typeof nextState !== "object") {
      console.error(
        "Orbit BizAssist: invalid state update."
      );

      return state;
    }

    state = nextState;

    return state;
  }


  function mergeState(patch) {
    if (!patch || typeof patch !== "object") {
      return state;
    }

    state = {
      ...state,
      ...patch,
      meta: {
        ...(state.meta || {}),
        updatedAt: new Date().toISOString()
      }
    };

    return state;
  }


  function resetState() {
    state = createInitialState();

    return state;
  }


  /* =======================================================
     BUSINESS HELPERS
     ======================================================= */

  function getBusiness(businessId = state.activeBusiness) {
    return (
      state.businesses?.find(
        business => business.id === businessId
      ) ||
      state.businesses?.[0] ||
      null
    );
  }


  function setActiveBusiness(businessId) {
    const exists = state.businesses?.some(
      business => business.id === businessId
    );

    if (!exists) {
      return getBusiness();
    }

    state = {
      ...state,
      activeBusiness: businessId,
      cart: [],
      meta: {
        ...(state.meta || {}),
        updatedAt: new Date().toISOString()
      }
    };

    return getBusiness();
  }


  function addBusiness(data = {}) {
    const business = {
      ...createBusiness(
        data.name || `Business ${state.businesses.length + 1}`
      ),
      ...data,
      id: data.id || `biz-${Date.now()}`
    };

    state = {
      ...state,
      businesses: [
        ...(state.businesses || []),
        business
      ],
      activeBusiness: business.id,
      cart: []
    };

    return business;
  }


  function updateBusiness(patch = {}) {
    const current = getBusiness();

    if (!current) return null;

    const updated = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString()
    };

    state = {
      ...state,

      businesses: state.businesses.map(
        business =>
          business.id === current.id
            ? updated
            : business
      ),

      meta: {
        ...(state.meta || {}),
        updatedAt: new Date().toISOString()
      }
    };

    return updated;
  }


  /* =======================================================
     DATA ACCESS
     ======================================================= */

  function items() {
    return getBusiness()?.items || [];
  }


  function invoices() {
    return getBusiness()?.invoices || [];
  }


  function contacts() {
    return getBusiness()?.contacts || [];
  }


  function expenses() {
    return getBusiness()?.expenses || [];
  }


  function staff() {
    return getBusiness()?.staff || [];
  }


  function ledger() {
    return getBusiness()?.ledger || [];
  }


  /* =======================================================
     PERSISTENCE
     ======================================================= */

  function save() {
    const cloud = window.orbitCloud;

    if (
      !cloud ||
      typeof cloud.push !== "function"
    ) {
      return Promise.resolve(false);
    }

    const snapshot = {
      ...state,

      /*
       * Cart is temporary UI state and should never
       * accidentally be restored as an unfinished sale.
       */
      cart: []
    };

    return cloud
      .push(snapshot)
      .then(() => true)
      .catch(error => {
        console.error(
          "Orbit BizAssist cloud save failed:",
          error
        );

        if (typeof window.toast === "function") {
          window.toast(
            "Cloud save failed. Please try again."
          );
        }

        return false;
      });
  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

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


  /*
   * Backwards compatibility for modules that still
   * expect a global `state` variable during migration.
   */
  Object.defineProperty(window, "state", {
    configurable: true,

    get() {
      return state;
    },

    set(value) {
      if (value && typeof value === "object") {
        state = value;
      }
    }
  });


  /*
   * Compatibility helpers.
   * Existing/future modules can gradually move to
   * AppUtils without breaking the application.
   */

  window.$ = window.$ || (
    selector => document.querySelector(selector)
  );

  window.esc = window.esc || (
    value =>
      String(value ?? "")
        .replace(/[&<>'"]/g, character => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;"
        }[character]))
  );

  window.money = window.money || (
    value => {
      const business = getBusiness();

      return new Intl.NumberFormat(
        business?.locale || CONFIG.locale,
        {
          style: "currency",
          currency:
            business?.currency || CONFIG.currency,
          maximumFractionDigits: 0
        }
      ).format(Number(value) || 0);
    }
  );

  window.now = window.now || (
    () => new Date().toISOString()
  );
})();
