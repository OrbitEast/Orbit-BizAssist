/* Orbit BizAssist — compatibility bridge */
(() => {
  "use strict";

  /*
   * A few legacy modules still call updateBusiness(id, patch),
   * while the current state API uses updateBusiness(patch).
   * Keep both signatures valid during the module migration.
   */
  const api = window.AppState;
  if (!api || typeof api.updateBusiness !== "function") return;

  const updateBusiness = api.updateBusiness.bind(api);

  window.AppState = new Proxy(api, {
    get(target, property, receiver) {
      if (property !== "updateBusiness") {
        return Reflect.get(target, property, receiver);
      }

      return (first, second) => {
        if (typeof first === "string" && second && typeof second === "object") {
          return updateBusiness({ ...second, id: second.id || first });
        }
        return updateBusiness(first || {});
      };
    }
  });
})();
