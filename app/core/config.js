/* Orbit BizAssist — runtime configuration */
(() => {
  "use strict";
  const CONFIG = Object.freeze({
    appName: "Orbit BizAssist",
    companyName: "Orbit East",
    version: "1.0.0",
    currency: "INR",
    routes: { home: "dashboard", login: "login", onboarding: "onboarding" }
  });
  window.OrbitBizAssist = window.OrbitBizAssist || {};
  window.OrbitBizAssist.config = CONFIG;
})();
