/* Orbit BizAssist — bootstrap contract */
(() => {
  "use strict";

  function assertCore() {
    const core = window.OrbitBizAssist || {};
    const required = ["config", "store", "events", "models", "money", "validate", "permissions"];
    const missing = required.filter(key => !core[key]);

    if (missing.length) {
      throw new Error(`Orbit BizAssist core incomplete: ${missing.join(", ")}`);
    }
  }

  function start() {
    assertCore();
    window.OrbitBizAssist.events.emit("app:ready", {
      version: window.OrbitBizAssist.config.version,
      startedAt: new Date().toISOString()
    });
  }

  window.OrbitBizAssist = window.OrbitBizAssist || {};
  window.OrbitBizAssist.bootstrap = Object.freeze({ start });
})();
