/* Orbit Biz — repository abstraction
 * Keeps Supabase-specific persistence out of domain/UI code.
 */
(() => {
  "use strict";

  function assertAdapter(adapter) {
    if (!adapter || typeof adapter !== "object") throw new TypeError("Repository adapter is required.");
    ["list", "get", "insert", "update", "remove"].forEach(method => {
      if (typeof adapter[method] !== "function") throw new TypeError(`Repository adapter missing ${method}().`);
    });
  }

  function createRepository(adapter) {
    assertAdapter(adapter);
    return Object.freeze({
      list: (filters = {}) => adapter.list(filters),
      get: id => adapter.get(id),
      insert: record => adapter.insert(record),
      update: (id, patch) => adapter.update(id, patch),
      remove: id => adapter.remove(id)
    });
  }

  window.OrbitBiz = window.OrbitBiz || {};
  window.OrbitBiz.data = window.OrbitBiz.data || {};
  window.OrbitBiz.data.createRepository = createRepository;
})();
