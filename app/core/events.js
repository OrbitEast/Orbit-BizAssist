/* Orbit BizAssist V2 — explicit event bus */
(() => {
  "use strict";

  const listeners = new Map();

  function on(eventName, listener) {
    if (!listeners.has(eventName)) listeners.set(eventName, new Set());
    listeners.get(eventName).add(listener);
    return () => listeners.get(eventName)?.delete(listener);
  }

  function emit(eventName, detail = {}) {
    listeners.get(eventName)?.forEach(listener => {
      try {
        listener(detail);
      } catch (error) {
        console.error(`Orbit event ${eventName} failed:`, error);
      }
    });
  }

  window.OrbitV2 = window.OrbitV2 || {};
  window.OrbitV2.events = Object.freeze({ on, emit });
})();
