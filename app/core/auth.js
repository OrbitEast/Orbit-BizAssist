/* Orbit Biz — Supabase authentication */
(() => {
  "use strict";

  const core = window.OrbitBiz = window.OrbitBiz || {};
  const config = core.config?.supabase;
  let client = null;

  const appRoot = () => document.querySelector("#app");

  function ensureClient() {
    if (client) return client;
    if (!window.supabase?.createClient) throw new Error("Supabase client library is not loaded.");
    if (!config?.url || !config?.publishableKey) throw new Error("Supabase configuration is missing.");
    client = window.supabase.createClient(config.url, config.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return client;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]));
  }

  function showAuth(mode = "signin", error = "") {
    const root = appRoot();
    if (!root) return;
    document.querySelector("#orbit-biz-landing")?.remove();
    document.querySelector(".ref-app")?.remove();
    const isSignup = mode === "signup";
    root.innerHTML = `<section class="ob-auth" aria-label="Orbit Biz authentication">
      <div class="ob-auth-card">
        <button class="ob-auth-brand" type="button" data-auth-back><span>O</span><b>Orbit</b><small>Biz</small></button>
        <div class="ob-auth-label">${isSignup ? "GET STARTED" : "WELCOME BACK"}</div>
        <h1>${isSignup ? "Create your Orbit Biz workspace." : "Sign in to Orbit Biz."}</h1>
        <p>${isSignup ? "Start with your business and build your workspace from there." : "Continue to your business workspace."}</p>
        <button class="ob-google-btn" type="button" data-google><span class="ob-google-g">G</span><span>Continue with Google</span></button>
        ${error ? `<div class="ob-auth-error" role="alert">${escapeHtml(error)}</div>` : ""}
        <div class="ob-auth-divider"><span>Secure authentication</span></div>
        <small class="ob-auth-note">Your account is secured by Supabase Auth. Orbit Biz never asks for your Google password.</small>
        <button class="ob-auth-back" type="button" data-auth-back>← Back to Orbit Biz</button>
      </div>
    </section>`;
    root.querySelectorAll("[data-auth-back]").forEach(button => button.addEventListener("click", () => location.reload()));
    root.querySelector("[data-google]")?.addEventListener("click", signInWithGoogle);
  }

  async function signInWithGoogle() {
    const button = document.querySelector("[data-google]");
    if (button) { button.disabled = true; button.textContent = "Connecting to Google…"; }
    try {
      const { error } = await ensureClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + window.location.pathname }
      });
      if (error) throw error;
    } catch (error) {
      showAuth("signin", error?.message || "Google sign-in could not be started.");
    }
  }

  function showLanding() {
    document.querySelector(".ref-app")?.remove();
    document.querySelector(".ob-auth")?.remove();
    if (!document.querySelector("#orbit-biz-landing")) location.reload();
  }

  async function handleSession(session) {
    if (session?.user) {
      document.querySelector("#orbit-biz-landing")?.remove();
      document.querySelector(".ob-auth")?.remove();
      window.OrbitBiz.events?.emit("auth:ready", { user: session.user, session });
      return;
    }
    showLanding();
  }

  async function init() {
    try {
      const supabase = ensureClient();
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      await handleSession(data.session);
      supabase.auth.onAuthStateChange((_event, session) => handleSession(session));
    } catch (error) {
      console.error("Orbit Biz auth initialization failed:", error);
      showAuth("signin", "Authentication could not be initialized. Check the Supabase configuration.");
    }
  }

  const api = Object.freeze({
    signInWithGoogle,
    getClient: ensureClient,
    getSession: async () => (await ensureClient().auth.getSession()).data.session,
    signOut: async () => ensureClient().auth.signOut()
  });

  core.auth = api;
  window.addEventListener("orbitbiz:auth-request", event => showAuth(event.detail?.mode || "signin"));
  core.events?.on("auth:request", detail => showAuth(detail?.mode || "signin"));
  document.addEventListener("DOMContentLoaded", init, { once: true });
})();
