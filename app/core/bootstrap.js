/* OrbitBiz — bootstrap contract */
(() => {
  "use strict";

  function assertCore() {
    const core = window.OrbitBiz || {};
    const required = ["config", "store", "events", "models", "money", "validate", "permissions"];
    const missing = required.filter(key => !core[key]);

    if (missing.length) {
      throw new Error(`OrbitBiz core incomplete: ${missing.join(", ")}`);
    }
  }

  function start() {
    assertCore();
    window.OrbitBiz.events.emit("app:ready", {
      version: window.OrbitBiz.config.version,
      startedAt: new Date().toISOString()
    });
  }

  window.OrbitBiz = window.OrbitBiz || {};
  window.OrbitBiz.bootstrap = Object.freeze({ start });
})();
