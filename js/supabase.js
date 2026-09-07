(() => {
  "use strict";

  /*
   * Orbit BizAssist — Supabase Cloud Layer
   * --------------------------------------
   * Google OAuth
   * Session persistence + refresh
   * Cloud state sync
   * Local-first compatibility
   */

  const CONFIG = Object.freeze({
    url: "https://tquanlpmtvizjbdounnj.supabase.co",
    key: "sb_publishable_sjDaL7MyAXoYoM1KIbYLbg_EGfo6Omq",
    table: "orbit_bizassist_state",
    storageKey: "orbit-bizassist-auth",
    sessionRefreshMargin: 60
  });

  let currentSession = null;
  let currentProfile = null;
  let initialized = false;
  let refreshTimer = null;

  /* -------------------------------------------------------
     Helpers
  ------------------------------------------------------- */

  function apiUrl(path = "") {
    return `${CONFIG.url}${path}`;
  }

  function getRedirectUrl() {
    return `${window.location.origin}${window.location.pathname}`;
  }

  function getStoredSession() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !parsed.access_token ||
        !parsed.refresh_token
      ) {
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn("Orbit Cloud: unable to read stored session.", error);
      return null;
    }
  }

  function storeSession(session) {
    if (!session) return;

    currentSession = session;

    try {
      localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify(session)
      );
    } catch (error) {
      console.warn("Orbit Cloud: unable to store session.", error);
    }

    scheduleRefresh(session);
  }

  function clearSession() {
    currentSession = null;
    currentProfile = null;

    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }

    try {
      localStorage.removeItem(CONFIG.storageKey);
    } catch (error) {
      console.warn("Orbit Cloud: unable to clear stored session.", error);
    }
  }

  function decodeJwt(token) {
    try {
      const parts = String(token).split(".");
      if (parts.length !== 3) return null;

      const payload = parts[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const padded =
        payload + "=".repeat((4 - (payload.length % 4)) % 4);

      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }

  function sessionExpired(session) {
    if (!session?.access_token) return true;

    const payload = decodeJwt(session.access_token);
    if (!payload?.exp) return false;

    return payload.exp <= Math.floor(Date.now() / 1000);
  }

  function sessionNeedsRefresh(session) {
    if (!session?.access_token) return true;

    const payload = decodeJwt(session.access_token);

    if (!payload?.exp) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);

    return (
      payload.exp <=
      now + CONFIG.sessionRefreshMargin
    );
  }

  function authHeaders(accessToken = null) {
    return {
      apikey: CONFIG.key,
      Authorization: `Bearer ${
        accessToken || currentSession?.access_token || CONFIG.key
      }`,
      "Content-Type": "application/json"
    };
  }

  async function request(path, options = {}) {
    const response = await fetch(apiUrl(path), {
      ...options,
      headers: {
        ...authHeaders(options.accessToken),
        ...(options.headers || {})
      }
    });

    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error_description ||
        data?.error ||
        data?.msg ||
        text ||
        `Request failed with status ${response.status}`;

      const error = new Error(message);
      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  }

  /* -------------------------------------------------------
     Session refresh
  ------------------------------------------------------- */

  async function refreshSession(refreshToken) {
    if (!refreshToken) {
      throw new Error("No refresh token available.");
    }

    const response = await fetch(
      apiUrl("/auth/v1/token?grant_type=refresh_token"),
      {
        method: "POST",
        headers: {
          apikey: CONFIG.key,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      }
    );

    const text = await response.text();

    let data;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message =
        data?.msg ||
        data?.message ||
        data?.error_description ||
        data?.error ||
        text ||
        "Unable to refresh Supabase session.";

      throw new Error(message);
    }

    storeSession(data);

    return data;
  }

  function scheduleRefresh(session) {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }

    const payload = decodeJwt(session?.access_token);

    if (!payload?.exp || !session?.refresh_token) {
      return;
    }

    const now = Date.now();
    const expiresAt = payload.exp * 1000;

    const refreshIn = Math.max(
      10_000,
      expiresAt -
        now -
        CONFIG.sessionRefreshMargin * 1000
    );

    refreshTimer = setTimeout(async () => {
      try {
        await refreshSession(session.refresh_token);
      } catch (error) {
        console.warn(
          "Orbit Cloud: automatic session refresh failed.",
          error
        );
      }
    }, refreshIn);
  }

  /* -------------------------------------------------------
     OAuth callback
  ------------------------------------------------------- */

  function readOAuthSession() {
    const hash = window.location.hash;

    if (!hash || !hash.includes("access_token=")) {
      return null;
    }

    const params = new URLSearchParams(
      hash.replace(/^#/, "")
    );

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      return null;
    }

    const expiresIn = Number(
      params.get("expires_in") || 3600
    );

    const session = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      token_type: params.get("token_type") || "bearer",
      expires_at:
        Math.floor(Date.now() / 1000) + expiresIn
    };

    return session;
  }

  function cleanOAuthHash() {
    if (!window.location.hash.includes("access_token=")) {
      return;
    }

    const cleanUrl =
      `${window.location.pathname}` +
      `${window.location.search}` +
      "#dashboard";

    window.history.replaceState(
      null,
      "",
      cleanUrl
    );
  }

  /* -------------------------------------------------------
     User profile
  ------------------------------------------------------- */

  async function getUser(accessToken) {
    if (!accessToken) {
      throw new Error("Missing Supabase access token.");
    }

    const response = await fetch(
      apiUrl("/auth/v1/user"),
      {
        method: "GET",
        headers: {
          apikey: CONFIG.key,
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const text = await response.text();

    let data;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error_description ||
        data?.error ||
        text ||
        `Unable to load user (${response.status})`;

      throw new Error(message);
    }

    return data;
  }

  /* -------------------------------------------------------
     Cloud state
  ------------------------------------------------------- */

  async function loadCloudState() {
    if (!currentSession?.access_token) {
      return null;
    }

    const userId =
      currentProfile?.id ||
      decodeJwt(currentSession.access_token)?.sub;

    if (!userId) {
      return null;
    }

    const params = new URLSearchParams({
      select: "user_id,state,updated_at",
      user_id: `eq.${userId}`,
      limit: "1"
    });

    const response = await fetch(
      apiUrl(
        `/rest/v1/${CONFIG.table}?${params.toString()}`
      ),
      {
        method: "GET",
        headers: {
          apikey: CONFIG.key,
          Authorization:
            `Bearer ${currentSession.access_token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const text = await response.text();

    let data;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        data?.hint ||
        text ||
        `Unable to load cloud state (${response.status})`;

      throw new Error(message);
    }

    if (!Array.isArray(data) || !data.length) {
      return null;
    }

    return data[0]?.state || null;
  }

  async function saveCloudState(nextState) {
    if (!currentSession?.access_token) {
      return false;
    }

    const userId =
      currentProfile?.id ||
      decodeJwt(currentSession.access_token)?.sub;

    if (!userId) {
      throw new Error(
        "Cannot save cloud state without user ID."
      );
    }

    const payload = {
      user_id: userId,
      state: nextState,
      updated_at: new Date().toISOString()
    };

    const response = await fetch(
      apiUrl(`/rest/v1/${CONFIG.table}`),
      {
        method: "POST",
        headers: {
          apikey: CONFIG.key,
          Authorization:
            `Bearer ${currentSession.access_token}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify(payload)
      }
    );

    const text = await response.text();

    if (!response.ok) {
      let data = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      const message =
        data?.message ||
        data?.error ||
        data?.hint ||
        text ||
        `Unable to save cloud state (${response.status})`;

      throw new Error(message);
    }

    return true;
  }

  /* -------------------------------------------------------
     Google authentication
  ------------------------------------------------------- */

  function signInGoogle() {
    const redirectTo = getRedirectUrl();

    const params = new URLSearchParams({
      provider: "google",
      redirect_to: redirectTo
    });

    const url =
      apiUrl(
        `/auth/v1/authorize?${params.toString()}`
      );

    window.location.assign(url);
  }

  /* -------------------------------------------------------
     Sign out
  ------------------------------------------------------- */

  async function signOut() {
    const token = currentSession?.access_token;

    try {
      if (token) {
        await fetch(
          apiUrl("/auth/v1/logout"),
          {
            method: "POST",
            headers: {
              apikey: CONFIG.key,
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
    } catch (error) {
      console.warn(
        "Orbit Cloud: remote sign-out failed.",
        error
      );
    } finally {
      clearSession();
    }
  }

  /* -------------------------------------------------------
     Initialization
  ------------------------------------------------------- */

  async function init(onReady) {
    if (initialized && currentSession) {
      return true;
    }

    try {
      /* -----------------------------------------------
         1. Check Google OAuth callback
      ------------------------------------------------ */

      const oauthSession = readOAuthSession();

      if (oauthSession) {
        storeSession(oauthSession);
        cleanOAuthHash();
      }

      /* -----------------------------------------------
         2. Restore previous session
      ------------------------------------------------ */

      if (!currentSession) {
        const stored = getStoredSession();

        if (stored) {
          currentSession = stored;
        }
      }

      if (!currentSession) {
        initialized = true;
        return false;
      }

      /* -----------------------------------------------
         3. Refresh if necessary
      ------------------------------------------------ */

      if (
        sessionNeedsRefresh(currentSession) &&
        currentSession.refresh_token
      ) {
        try {
          await refreshSession(
            currentSession.refresh_token
          );
        } catch (refreshError) {
          console.warn(
            "Orbit Cloud: stored session could not be refreshed.",
            refreshError
          );

          clearSession();
          initialized = true;

          return false;
        }
      }

      /* -----------------------------------------------
         4. Validate current user
      ------------------------------------------------ */

      currentProfile = await getUser(
        currentSession.access_token
      );

      /* -----------------------------------------------
         5. Restore cloud state
      ------------------------------------------------ */

      let remoteState = null;

      try {
        remoteState = await loadCloudState();
      } catch (cloudError) {
        console.warn(
          "Orbit Cloud: cloud state unavailable.",
          cloudError
        );
      }

      initialized = true;

      /* -----------------------------------------------
         6. Send data back to application
      ------------------------------------------------ */

      if (typeof onReady === "function") {
        onReady(
          remoteState,
          {
            user: currentProfile
          }
        );
      }

      return true;

    } catch (error) {
      console.error(
        "Orbit Cloud initialization failed:",
        error
      );

      clearSession();
      initialized = true;

      throw error;
    }
  }

  /* -------------------------------------------------------
     Public API
  ------------------------------------------------------- */

  window.orbitCloud = {
    config: CONFIG,

    init,

    signInGoogle,

    signOut,

    session() {
      return currentSession;
    },

    user() {
      return currentProfile;
    },

    async refresh() {
      if (!currentSession?.refresh_token) {
        return null;
      }

      return refreshSession(
        currentSession.refresh_token
      );
    },

    async load() {
      return loadCloudState();
    },

    async save(nextState) {
      return saveCloudState(nextState);
    },

    isAuthenticated() {
      return Boolean(
        currentSession?.access_token &&
        !sessionExpired(currentSession)
      );
    }
  };
})();
