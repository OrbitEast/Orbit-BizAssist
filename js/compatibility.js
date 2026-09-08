/* Orbit BizAssist — compatibility bridge
 *
 * Legacy modules may call AppState.updateBusiness(id, patch).
 * That signature is now supported directly by state.js, so this file
 * intentionally does not replace or Proxy the frozen AppState object.
 */
(() => {
  "use strict";
  // Compatibility is implemented at the AppState API boundary.
})();