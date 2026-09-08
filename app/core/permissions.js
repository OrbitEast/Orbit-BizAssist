/* Orbit BizAssist — centralized permissions */
(() => {
  "use strict";

  const ROLE_LEVEL = Object.freeze({ viewer: 10, staff: 20, manager: 30, admin: 40, owner: 50 });
  const REQUIREMENTS = Object.freeze({ view: "viewer", create: "staff", edit: "staff", manage: "manager", administer: "admin", transferOwnership: "owner" });

  function can(role, action) {
    const roleLevel = ROLE_LEVEL[role] || 0;
    const requiredLevel = ROLE_LEVEL[REQUIREMENTS[action]] || Infinity;
    return roleLevel >= requiredLevel;
  }

  function assert(role, action) {
    if (!can(role, action)) {
      const error = new Error(`Permission denied for ${action}.`);
      error.code = "PERMISSION_DENIED";
      throw error;
    }
  }

  window.OrbitBizAssist = window.OrbitBizAssist || {};
  window.OrbitBizAssist.permissions = Object.freeze({ ROLE_LEVEL, REQUIREMENTS, can, assert });
})();
