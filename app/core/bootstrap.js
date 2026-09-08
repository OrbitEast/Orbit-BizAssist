/* Orbit BizAssist V2 — bootstrap contract */
(() => {
  "use strict";

  function assertCore() {
    const core = window.OrbitV2 || {};
    const required = ["config", "store", "events", "models", "money", "validate", "permissions"];
    const missing = required.filter(key => !core[key]);

    if (missing.length) {
      throw new Error(`Orbit BizAssist V2 core incomplete: ${missing.join(", ")}`);
    }
  }

  function start() {
    assertCore();
    window.OrbitV2.events.emit("app:ready", {
      version: window.OrbitV2.config.version,
      startedAt: new Date().toISOString()
    });
  }

  window.OrbitV2 = window.OrbitV2 || {};
  window.OrbitV2.bootstrap = Object.freeze({ start });
})();
