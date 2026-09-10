/* OrbitBiz — authentication and session routing */
(() => {
  "use strict";

  const core = window.OrbitBiz = window.OrbitBiz || {};
  const config = core.config?.supabase;
  let client = null;
  let routing = false;
  let companionTimers = [];
  let companionCleanup = null;
  const appRoot = () => document.querySelector("#app");

  function ensureClient() {
    if (client) return client;
    if (!window.supabase?.createClient) throw new Error("Supabase client library is not loaded.");
    if (!config?.url || !config?.publishableKey) throw new Error("Supabase configuration is missing.");
    client = window.supabase.createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    return client;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>\"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]));
  }

  function stopCompanion() {
    companionTimers.forEach(window.clearTimeout);
    companionTimers = [];
    companionCleanup?.();
    companionCleanup = null;
  }

  function wireCompanion(root) {
    const companion = root.querySelector("[data-companion]");
    const stage = root.querySelector("[data-companion-stage]");
    if (!companion || !stage || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    const state = { targetX: 0, targetY: 0, x: 0, y: 0, active: false, idle: null, frame: null, lastPointer: 0 };
    const setTarget = (x, y) => { state.targetX = x; state.targetY = y; state.active = true; companion.classList.add("is-curious"); companion.classList.remove("is-sad", "is-running"); };
    const runAway = () => {
      const rect = stage.getBoundingClientRect();
      const margin = 65;
      const maxX = Math.max(margin, rect.width - margin);
      const maxY = Math.max(150, rect.height - margin);
      state.targetX = margin + Math.random() * Math.max(1, maxX - margin);
      state.targetY = Math.min(maxY, Math.max(120, 150 + Math.random() * Math.max(1, maxY - 150)));
      state.active = true;
      companion.classList.remove("is-curious");
      companion.classList.add("is-running");
      companionTimers.push(window.setTimeout(() => companion.classList.remove("is-running"), 520));
    };
    const scheduleEscape = () => {
      if (state.idle) window.clearTimeout(state.idle);
      state.idle = window.setTimeout(() => { runAway(); state.idle = window.setTimeout(runAway, 900); }, 720);
    };
    const pointerMove = event => {
      if (event.pointerType === "touch") return;
      const now = performance.now();
      if (now - state.lastPointer < 28) return;
      state.lastPointer = now;
      const rect = stage.getBoundingClientRect();
      setTarget(Math.max(45, Math.min(rect.width - 45, event.clientX - rect.left)), Math.max(105, Math.min(rect.height - 45, event.clientY - rect.top)));
      scheduleEscape();
    };
    const pointerLeave = () => { if (state.idle) window.clearTimeout(state.idle); state.idle = window.setTimeout(runAway, 280); };
    const hurt = () => {
      companion.classList.remove("is-curious", "is-running");
      void companion.offsetWidth;
      companion.classList.add("is-sad");
      companionTimers.push(window.setTimeout(() => companion.classList.remove("is-sad"), 1450));
    };
    const animate = () => {
      const dx = state.targetX - state.x;
      const dy = state.targetY - state.y;
      state.x += dx * (state.active ? .075 : .035);
      state.y += dy * (state.active ? .075 : .035);
      const angle = Math.max(-10, Math.min(10, dx * .055));
      companion.style.transform = `translate3d(${state.x}px,${state.y}px,0) rotate(${angle}deg)`;
      state.frame = requestAnimationFrame(animate);
    };

    const rect = stage.getBoundingClientRect();
    state.x = rect.width * .74;
    state.y = Math.min(rect.height - 70, Math.max(150, rect.height * .52));
    state.targetX = state.x;
    state.targetY = state.y;
    stage.addEventListener("pointermove", pointerMove, { passive: true });
    stage.addEventListener("pointerleave", pointerLeave, { passive: true });
    companion.addEventListener("click", hurt);
    companion.addEventListener("pointerdown", event => { if (event.pointerType !== "mouse") hurt(); }, { passive: true });
    state.idle = window.setTimeout(runAway, 1600);
    state.frame = requestAnimationFrame(animate);
    companionCleanup = () => { stage.removeEventListener("pointermove", pointerMove); stage.removeEventListener("pointerleave", pointerLeave); companion.removeEventListener("click", hurt); cancelAnimationFrame(state.frame); if (state.idle) window.clearTimeout(state.idle); };
  }

  function showAuth(mode = "signin", error = "") {
    stopCompanion();
    const root = appRoot();
    if (!root) return;
    document.querySelector("#orbit-biz-landing")?.remove();
    document.querySelector(".ref-app")?.remove();
    document.querySelector(".ob-onboarding")?.remove();
    const isSignup = mode === "signup";
    root.innerHTML = `<section class="ob-auth" aria-label="Orbit Biz authentication">
      <div class="ob-auth-art" data-companion-stage>
        <button class="ob-auth-brand" type="button" data-auth-back aria-label="Back to Orbit Biz"><img src="assets/orbiteastfavicon.png" alt="Orbit East"><b>Orbit</b><small>Biz</small></button>
        <div class="ob-auth-art-copy"><span class="ob-auth-kicker">Business, in one orbit</span><h2>Run it<br><em>your way.</em></h2><p>Customers, sales, inventory, finance and reports — one connected workspace designed to make everyday business simpler.</p></div>
        <div class="ob-auth-companion-wrap"><div class="ob-auth-companion" data-companion role="img" aria-label="Mira, the Orbit companion"><div class="companion-shadow"></div><div class="companion-body"><i class="companion-ear left"></i><i class="companion-ear right"></i><i class="companion-eye left"></i><i class="companion-eye right"></i><i class="companion-mouth"></i><i class="companion-heart"></i></div></div><span class="ob-auth-companion-tip">Mira likes to chase your cursor.</span></div>
        <div class="ob-auth-stickers" aria-hidden="true"><span class="ob-auth-sticker">CRM</span><span class="ob-auth-sticker">INVENTORY</span><span class="ob-auth-sticker">FINANCE</span></div>
      </div>
      <div class="ob-auth-panel"><div class="ob-auth-card"><div class="ob-auth-label">${isSignup ? "GET STARTED" : "WELCOME BACK"}</div><h1>${isSignup ? "Create your workspace." : "Welcome back."}</h1><p>${isSignup ? "Start with your Google account. We’ll take you into business setup next." : "Sign in securely and continue to your business workspace."}</p><button class="ob-google-btn" type="button" data-google><span class="ob-google-g" aria-hidden="true">G</span><span>Continue with Google</span></button>${error ? `<div class="ob-auth-error" role="alert">${escapeHtml(error)}</div>` : ""}<div class="ob-auth-divider"><span>Secure sign-in</span></div><small class="ob-auth-note">Authentication is handled securely through your connected account. Your Google password is never shared with Orbit Biz.</small><button class="ob-auth-back" type="button" data-auth-back>← Back to Orbit Biz</button></div></div>
    </section>`;
    root.querySelectorAll("[data-auth-back]").forEach(button => button.addEventListener("click", () => location.reload()));
    root.querySelector("[data-google]")?.addEventListener("click", signInWithGoogle);
    wireCompanion(root);
  }

  async function signInWithGoogle() {
    const button = document.querySelector("[data-google]");
    if (button) { button.disabled = true; button.innerHTML = "<span>Connecting to Google…</span>"; }
    try { const { error } = await ensureClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + window.location.pathname } }); if (error) throw error; }
    catch (error) { showAuth("signin", error?.message || "Google sign-in could not be started."); }
  }

  async function resolveBusiness(user) {
    const { data, error } = await ensureClient().from("business_members").select("business_id, role").eq("user_id", user.id).order("created_at", { ascending: true }).limit(1);
    if (error) throw error;
    if (data?.[0]?.business_id) { core.activeBusinessId = data[0].business_id; core.activeBusinessRole = data[0].role; localStorage.setItem("orbitbiz.activeBusinessId", data[0].business_id); return true; }
    return false;
  }

  function showLanding() { stopCompanion(); document.querySelector(".ref-app")?.remove(); document.querySelector(".ob-auth")?.remove(); document.querySelector(".ob-onboarding")?.remove(); if (!document.querySelector("#orbit-biz-landing")) location.reload(); }

  async function handleSession(session) {
    if (!session?.user) { core.auth.currentUser = null; showLanding(); return; }
    if (routing) return;
    routing = true; core.auth.currentUser = session.user;
    try { const hasBusiness = await resolveBusiness(session.user); document.querySelector("#orbit-biz-landing")?.remove(); document.querySelector(".ob-auth")?.remove(); if (!hasBusiness) { document.querySelector(".ref-app")?.remove(); core.onboarding?.render(); } else { document.querySelector(".ob-onboarding")?.remove(); core.events?.emit("auth:ready", { user: session.user, session, businessId: core.activeBusinessId, role: core.activeBusinessRole }); } }
    catch (error) { console.error("Orbit Biz business resolution failed:", error); document.querySelector(".ref-app")?.remove(); showAuth("signin", "We couldn't load your business workspace. Please refresh and try again."); }
    finally { routing = false; }
  }

  async function init() {
    try { const supabase = ensureClient(); const { data, error } = await supabase.auth.getSession(); if (error) throw error; await handleSession(data.session); supabase.auth.onAuthStateChange((_event, session) => { void handleSession(session); }); }
    catch (error) { console.error("Orbit Biz auth initialization failed:", error); showAuth("signin", "Authentication could not be initialized. Check the Supabase configuration."); }
  }

  const api = { signInWithGoogle, getClient: ensureClient, getSession: async () => (await ensureClient().auth.getSession()).data.session, signOut: async () => { localStorage.removeItem("orbitbiz.activeBusinessId"); core.activeBusinessId = null; return ensureClient().auth.signOut(); }, currentUser: null };
  core.auth = api;
  window.addEventListener("orbitbiz:auth-request", event => showAuth(event.detail?.mode || "signin"));
  core.events?.on("auth:request", detail => showAuth(detail?.mode || "signin"));
  document.addEventListener("DOMContentLoaded", init, { once: true });
})();
