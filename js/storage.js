/* =========================================================
   ORBIT BIZASSIST — STORAGE
   Local persistence layer.
   Cloud persistence remains handled by Supabase.
   ========================================================= */

(() => {
  const STORAGE_KEY = "orbit-bizassist-state";
  const STORAGE_VERSION = 1;


  /* =======================================================
     SAFE JSON
     ======================================================= */

  function parse(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn(
        "Orbit BizAssist: stored data could not be parsed.",
        error
      );

      return null;
    }
  }


  function serialize(value) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error(
        "Orbit BizAssist: state could not be serialized.",
        error
      );

      return null;
    }
  }


  /* =======================================================
     LOCAL STORAGE
     ======================================================= */

  function read() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return null;
      }

      const parsed = parse(raw);

      if (!parsed || typeof parsed !== "object") {
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn(
        "Orbit BizAssist: local storage unavailable.",
        error
      );

      return null;
    }
  }


  function write(state) {
    if (!state || typeof state !== "object") {
      return false;
    }

    const serialized = serialize({
      ...state,

      /*
       * Storage metadata allows future migrations
       * without breaking old user data.
       */
      storageVersion: STORAGE_VERSION,

      /*
       * Cart is temporary and should not survive
       * a browser restart.
       */
      cart: []
    });

    if (!serialized) {
      return false;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        serialized
      );

      return true;
    } catch (error) {
      console.warn(
        "Orbit BizAssist: unable to write local storage.",
        error
      );

      return false;
    }
  }


  function clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.warn(
        "Orbit BizAssist: unable to clear local storage.",
        error
      );

      return false;
    }
  }


  /* =======================================================
     STATE RESTORE
     ======================================================= */

  function restore() {
    const stored = read();

    if (!stored) {
      return null;
    }

    /*
     * Future schema migrations can be added here.
     *
     * Example:
     *
     * if (stored.storageVersion === 1) {
     *   return migrateV1ToV2(stored);
     * }
     */

    return stored;
  }


  /* =======================================================
     STATE SAVE
     ======================================================= */

  function save(state) {
    const localSaved = write(state);

    /*
     * Supabase remains the source of truth when an
     * authenticated cloud session exists.
     */
    const cloud = window.orbitCloud;

    if (
      cloud &&
      typeof cloud.session === "function" &&
      cloud.session() &&
      typeof cloud.push === "function"
    ) {
      return cloud
        .push({
          ...state,
          cart: []
        })
        .then(() => true)
        .catch(error => {
          console.warn(
            "Orbit BizAssist: cloud save failed; local copy retained.",
            error
          );

          return localSaved;
        });
    }

    return Promise.resolve(localSaved);
  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.AppStorage = Object.freeze({
    key: STORAGE_KEY,
    version: STORAGE_VERSION,

    read,
    write,
    clear,

    restore,
    save
  });
})();
