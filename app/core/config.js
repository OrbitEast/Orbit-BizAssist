/* Orbit Biz — runtime configuration */
(() => {
  "use strict";

  const CONFIG = Object.freeze({
    appName: "Orbit Biz",
    companyName: "Orbit East",
    version: "1.0.0",
    currency: "INR",
    routes: { home: "dashboard", login: "login", onboarding: "onboarding" },
    supabase: {
      url: "https://tquanlpmtvizjbdounnj.supabase.co",
      publishableKey: "sb_publishable_sjDaL7MyAXoYoM1KIbYLbg_EGfo6Omq"
    }
  });

  window.OrbitBiz = window.OrbitBiz || {};
  window.OrbitBiz.config = CONFIG;
})();
