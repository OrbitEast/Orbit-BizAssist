(() => {
  "use strict";

  const CONFIG = Object.freeze({
    url: "https://tquanlpmtvizjbdounnj.supabase.co",
    key: "sb_publishable_sjDaL7MyAXoYoM1KlbYLbg_EGfo6Omq",
    table: "orbit_bizassist_state",
    storageKey: "orbit-bizassist-auth",
    sessionRefreshMargin: 60
  });

  let session = null;
  let user = null;
  let enabled = false;

  const authHeaders = (accessToken = session?.access_token) => ({
    apikey: CONFIG.key,
    Authorization: `Bearer ${accessToken || CONFIG.key}`,
    "Content-Type": "application/json"
  });

  function appRedirectUrl() {
    return `${window.location.origin}${window.location.pathname}`;
  }

  function safeJson(value) {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function saveSession(nextSession) {
    session = nextSession || null;

    if (session) {
      localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify(session)
      );
    } else {
      localStorage.removeItem(CONFIG.storageKey);
    }

    enabled = Boolean(session?.access_token);
  }

  function loadStoredSession() {
    const raw = localStorage.getItem(CONFIG.storageKey);
    if (!raw) return null;

    const stored = safeJson(raw);

    if (!stored?.access_token) {
      localStorage.removeItem(CONFIG.storageKey);
      return null;
    }

    session = stored;
    enabled = true;

    return session;
  }

  function decodeJwtPayload(token) {
    try {
      const part = token.split(".")[1];
      if (!part) return null;

      const normalized = part
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      return JSON.parse(atob(normalized));
    } catch {
      return null;
    }
  }

  function isTokenExpiring(token) {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return false;

    const now = Math.floor(Date.now() / 1000);

    return payload.exp - now <= CONFIG.sessionRefreshMargin;
  }

  async function request(path, options = {}) {
    const response = await fetch(`${CONFIG.url}${path}`, options);

    const text = await response.text();
    const data = text ? safeJson(text) : null;

    if (!response.ok) {
      const message =
        data?.msg ||
        data?.message ||
        data?.error_description ||
        text ||
        `Supabase request failed (${response.status})`;

      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  async function refreshSession() {
    const refreshToken = session?.refresh_token;

    if (!refreshToken) {
      saveSession(null);
      user = null;
      return false;
    }

    try {
      const refreshed = await request(
        "/auth/v1/token?grant_type=refresh_token",
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

      if (!refreshed?.access_token) {
        throw new Error("Supabase did not return a new access token.");
      }

      saveSession({
        access_token: refreshed.access_token,
        refresh_token:
          refreshed.refresh_token || refreshToken,
        expires_in: refreshed.expires_in,
        expires_at:
          refreshed.expires_at ||
          Math.floor(Date.now() / 1000) +
            (refreshed.expires_in || 3600),
        token_type: refreshed.token_type || "bearer",
        user: refreshed.user || session?.user || null
      });

      user = refreshed.user || session?.user || null;

      return true;
    } catch (error) {
      console.warn("Orbit Auth refresh failed:", error);
      saveSession(null);
      user = null;
      enabled = false;
      return false;
    }
  }

  async function ensureValidSession() {
    if (!session?.access_token) {
      loadStoredSession();
    }

    if (!session?.access_token) {
      return false;
    }

    if (isTokenExpiring(session.access_token)) {
      return refreshSession();
    }

    return true;
  }

  function readOAuthSession() {
    const hash = window.location.hash;

    if (!hash || hash.length < 2) {
      return false;
    }

    const params = new URLSearchParams(hash.slice(1));

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken) {
      const error =
        params.get("error_description") ||
        params.get("error");

      if (error) {
        console.error("Google authentication failed:", error);
      }

      return false;
    }

    const expiresIn = Number(params.get("expires_in") || 3600);

    saveSession({
      access_token: accessToken,
      refresh_token: refreshToken || null,
      expires_in: expiresIn,
      expires_at:
        Number(params.get("expires_at")) ||
        Math.floor(Date.now() / 1000) + expiresIn,
      token_type: params.get("token_type") || "bearer"
    });

    // Remove OAuth tokens from the visible browser URL.
    window.history.replaceState(
      null,
      document.title,
      `${window.location.pathname}${window.location.search}`
    );

    return true;
  }

  async function fetchUser() {
    if (!session?.access_token) {
      throw new Error("No active Supabase session.");
    }

    const profile = await request("/auth/v1/user", {
      headers: authHeaders()
    });

    user = profile;

    if (session) {
      session.user = profile;
      localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify(session)
      );
    }

    return profile;
  }

  async function loadCloudState() {
    const rows = await request(
      `/rest/v1/${CONFIG.table}?user_id=eq.${encodeURIComponent(
        user.id
      )}&select=state&limit=1`,
      {
        headers: authHeaders()
      }
    );

    return rows?.[0]?.state || null;
  }

  async function push(nextState) {
    if (!(await ensureValidSession())) {
      throw new Error("Supabase session is not active.");
    }

    if (!user?.id) {
      await fetchUser();
    }

    await request(
      `/rest/v1/${CONFIG.table}?on_conflict=user_id`,
      {
        method: "POST",
        headers: {
          ...authHeaders(),
          Prefer: "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify({
          user_id: user.id,
          state: nextState,
          updated_at: new Date().toISOString()
        })
      }
    );

    return true;
  }

  function signInGoogle() {
    const redirectTo = appRedirectUrl();

    const authorizeUrl =
      `${CONFIG.url}/auth/v1/authorize` +
      `?provider=google` +
      `&redirect_to=${encodeURIComponent(redirectTo)}`;

    window.location.assign(authorizeUrl);
  }

  async function init(onCloudState) {
    try {
      // First priority: OAuth callback tokens.
      const callbackSession = readOAuthSession();

      // Otherwise restore the persisted session.
      if (!callbackSession) {
        loadStoredSession();
      }

      if (!(await ensureValidSession())) {
        return false;
      }

      const profile = await fetchUser();

      const cloudState = await loadCloudState();

      enabled = true;

      if (typeof onCloudState === "function") {
        onCloudState(
          cloudState || window.AppState.initial(),
          profile
        );
      }

      // New account: create its initial cloud state.
      if (!cloudState) {
        const initialState = window.AppState.initial();

        await push(initialState);

        if (typeof onCloudState === "function") {
          onCloudState(initialState, profile);
        }
      }

      return true;
    } catch (error) {
      console.error("Orbit Cloud initialization failed:", error);
      enabled = false;
      return false;
    }
  }

  async function signOut() {
    try {
      if (session?.access_token) {
        await request("/auth/v1/logout", {
          method: "POST",
          headers: authHeaders()
        });
      }
    } catch (error) {
      console.warn("Supabase logout request failed:", error);
    } finally {
      saveSession(null);
      session = null;
      user = null;
      enabled = false;
    }
  }

  window.orbitCloud = {
    signInGoogle,
    init,
    push,
    signOut,

    session: () => enabled,

    getSession: () =>
      session
        ? Object.freeze({ ...session })
        : null,

    getUser: () =>
      user
        ? Object.freeze({ ...user })
        : null
  };
})();
