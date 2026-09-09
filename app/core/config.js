/* OrbitBiz — runtime configuration */
(() => {
  "use strict";
  const CONFIG = Object.freeze({
    appName: "OrbitBiz",
    companyName: "Orbit East",
    version: "1.0.0",
    currency: "INR",
    routes: { home: "dashboard", login: "login", onboarding: "onboarding" }
  });
  window.OrbitBiz = window.OrbitBiz || {};
  window.OrbitBiz.config = CONFIG;
})();
