const CACHE="orbit-bizassist-v5";
const APP_SHELL=[
  "/",
  "/index.html",
  "/css/variables.css",
  "/css/base.css",
  "/css/layout.css",
  "/css/components.css",
  "/css/theme.css",
  "/css/onboarding.css",
  "/css/profile.css",
  "/css/app-shell.css",
  "/css/invoice-final.css",
  "/css/business-tools.css",
  "/css/customers.css",
  "/css/responsive.css",
  "/css/landing.css",
  "/css/orbit-visual.css",
  "/css/orbit-depth.css",
  "/js/state.js",
  "/js/utils.js",
  "/js/compatibility.js",
  "/js/storage.js",
  "/js/supabase.js",
  "/js/auth.js",
  "/js/router.js",
  "/modules/invoice-engine.js",
  "/modules/payments.js",
  "/modules/dashboard.js",
  "/modules/pos.js",
  "/modules/invoice-workspace.js",
  "/modules/inventory.js",
  "/modules/khata.js",
  "/modules/customers.js",
  "/modules/business-tools.js",
  "/js/landing.js",
  "/js/onboarding.js",
  "/js/ui.js",
  "/js/profile.js",
  "/js/app.js",
  "/js/production-enhancements.js"
];
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => undefined);
        return response;
      }).catch(() => cached)
    )
  );
});
