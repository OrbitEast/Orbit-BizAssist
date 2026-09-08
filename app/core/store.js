/* Orbit BizAssist V2 — normalized application store */
(() => {
  "use strict";

  const initialState = () => ({
    session: null,
    business: null,
    user: null,
    customers: [],
    vendors: [],
    products: [],
    invoices: [],
    payments: [],
    expenses: [],
    inventoryMovements: [],
    ledgerEntries: [],
    auditEvents: [],
    ui: {
      route: "dashboard",
      modal: null,
      busy: false,
      notice: null
    },
    sync: {
      status: "idle",
      lastSyncedAt: null,
      pendingMutations: []
    }
  });

  let state = initialState();
  const listeners = new Set();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getState() {
    return state;
  }

  function replace(nextState) {
    if (!nextState || typeof nextState !== "object") {
      throw new TypeError("Orbit store requires an object state.");
    }
    state = nextState;
    listeners.forEach(listener => listener(state));
  }

  function patch(partial) {
    replace({ ...state, ...partial });
  }

  function reset() {
    replace(initialState());
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new TypeError("Orbit store listener must be a function.");
    }
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  window.OrbitV2 = window.OrbitV2 || {};
  window.OrbitV2.store = Object.freeze({
    get: getState,
    snapshot: () => clone(state),
    replace,
    patch,
    reset,
    subscribe
  });
})();
