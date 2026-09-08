/* Orbit BizAssist V2 — runtime configuration */
(() => {
  "use strict";
  const CONFIG = Object.freeze({
    appName: "Orbit BizAssist",
    companyName: "Orbit East",
    version: "2.0.0-foundation",
    currency: "INR",
    routes: { home: "dashboard", login: "login", onboarding: "onboarding" }
  });
  window.OrbitV2 = window.OrbitV2 || {};
  window.OrbitV2.config = CONFIG;
})();
