/* =========================================================
   ORBIT BIZASSIST — PRODUCTION ENHANCEMENTS
   Safe, non-invasive utilities that do not mutate the SPA DOM.
   ========================================================= */
(() => {
  "use strict";

  function exportData() {
    const state = window.AppState?.get?.();
    if (!state) return false;

    const payload = JSON.stringify({ ...state, user: null }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `orbit-bizassist-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    window.toast?.("Backup downloaded");
    return true;
  }

  document.addEventListener("click", event => {
    const action = event.target.closest('[data-production-action="backup"]');
    if (!action) return;
    event.preventDefault();
    exportData();
  });

  window.OrbitProduction = Object.freeze({ exportData });
})();
