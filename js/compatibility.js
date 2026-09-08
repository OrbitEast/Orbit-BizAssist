/* Orbit BizAssist — compatibility bridge
 *
 * Legacy modules may call AppState.updateBusiness(id, patch).
 * That signature is implemented directly by state.js.
 * This file only supplies safe browser compatibility helpers.
 */
(() => {
  "use strict";

  if (typeof window.structuredClone !== "function") {
    window.structuredClone = value => JSON.parse(JSON.stringify(value));
  }
})();
