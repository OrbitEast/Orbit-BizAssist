/* =========================================================
   ORBIT BIZASSIST — STORAGE
   Local persistence layer.
   Cloud persistence remains handled by Supabase.
   ========================================================= */

(() => {
  const STORAGE_KEY = "orbit-bizassist-state";
  const STORAGE_VERSION = 1;

  function parse(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn("Orbit BizAssist: stored data could not be parsed.", error);
      return null;
    }
  }

  function serialize(value) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error("Orbit BizAssist: state could not be serialized.", error);
      return null;
    }
  }

  function read() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      console.warn("Orbit BizAssist: local storage unavailable.", error);
      return null;
    }
  }

  function write(state) {
    if (!state || typeof state !== "object") return false;

    const serialized = serialize({
      ...state,
      storageVersion: STORAGE_VERSION,
      cart: []
    });

    if (!serialized) return false;

    try {
      window.localStorage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (error) {
      console.warn("Orbit BizAssist: unable to write local storage.", error);
      return false;
    }
  }

  function clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.warn("Orbit BizAssist: unable to clear local storage.", error);
      return false;
    }
  }

  function restore() {
    const stored = read();
    if (!stored) return null;
    return stored;
  }

  function save(state) {
    const localSaved = write(state);
    const cloud = window.orbitCloud;

    if (
      cloud &&
      typeof cloud.session === "function" &&
      cloud.session() &&
      typeof cloud.save === "function"
    ) {
      return cloud
        .save({
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
