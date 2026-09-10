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

    const state = {
      x: 0, y: 0, targetX: 0, targetY: 0,
      mode: "idle", frame: null, idleTimer: null,
      lastPointer: 0, lastBlink: performance.now() + 2600,
      nextBlink: 3200 + Math.random() * 3000,
      runToken: 0
    };

    const clearIdle = () => {
      if (state.idleTimer) window.clearTimeout(state.idleTimer);
      state.idleTimer = null;
    };

    const clampTarget = (x, y) => {
      const rect = stage.getBoundingClientRect();
      const padX = Math.min(86, Math.max(58, rect.width * .11));
      const top = Math.min(210, Math.max(125, rect.height * .25));
      const bottom = Math.max(top + 80, rect.height - 72);
      return {
        x: Math.max(padX, Math.min(rect.width - padX, x)),
        y: Math.max(top, Math.min(bottom, y))
      };
    };

    const setTarget = (x, y, mode = "curious") => {
      const target = clampTarget(x, y);
      state.targetX = target.x;
      state.targetY = target.y;
      state.mode = mode;
      companion.classList.toggle("is-curious", mode === "curious");
      companion.classList.toggle("is-running", mode === "running");
      companion.classList.remove("is-sad");
    };

    const chooseRunTarget = () => {
      const rect = stage.getBoundingClientRect();
      const current = { x: state.x, y: state.y };
      const candidates = [
        { x: rect.width * .18, y: rect.height * .30 },
        { x: rect.width * .78, y: rect.height * .31 },
        { x: rect.width * .20, y: rect.height * .70 },
        { x: rect.width * .78, y: rect.height * .67 },
        { x: rect.width * .52, y: rect.height * .80 }
      ].map(point => clampTarget(point.x, point.y));
      candidates.sort((a, b) => {
        const da = Math.hypot(a.x - current.x, a.y - current.y);
        const db = Math.hypot(b.x - current.x, b.y - current.y);
        return db - da;
      });
      return candidates[Math.floor(Math.random() * Math.min(3, candidates.length))];
    };

    const runAway = () => {
      const target = chooseRunTarget();
      state.runToken += 1;
      const token = state.runToken;
      setTarget(target.x, target.y, "running");
      const distance = Math.hypot(target.x - state.x, target.y - state.y);
      const duration = Math.max(1150, Math.min(1900, 1050 + distance * 1.15));
      companionTimers.push(window.setTimeout(() => {
        if (token !== state.runToken) return;
        state.mode = "idle";
        companion.classList.remove("is-running", "is-curious");
      }, duration));
    };

    const scheduleEscape = () => {
      clearIdle();
      state.idleTimer = window.setTimeout(() => {
        if (state.mode === "curious") runAway();
      }, 1500);
    };

    const pointerMove = event => {
      if (event.pointerType === "touch") return;
      const now = performance.now();
      if (now - state.lastPointer < 40) return;
      state.lastPointer = now;
      const rect = stage.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      const companionDistance = Math.hypot(px - state.x, py - state.y);
      if (companionDistance < 105) {
        companion.classList.add("is-curious");
      }
      setTarget(px * .34 + state.x * .66, py * .34 + state.y * .66, "curious");
      scheduleEscape();
    };

    const pointerLeave = () => {
      clearIdle();
      state.idleTimer = window.setTimeout(() => {
        if (state.mode === "curious") runAway();
      }, 900);
    };

    const hurt = () => {
      clearIdle();
      state.mode = "sad";
      companion.classList.remove("is-curious", "is-running");
      void companion.offsetWidth;
      companion.classList.add("is-sad");
      companionTimers.push(window.setTimeout(() => {
        companion.classList.remove("is-sad");
        state.mode = "idle";
      }, 1500));
    };

    const blink = now => {
      if (now - state.lastBlink < state.nextBlink) return;
      state.lastBlink = now;
      state.nextBlink = 2600 + Math.random() * 4200;
      companion.classList.add("is-blinking");
      companionTimers.push(window.setTimeout(() => companion.classList.remove("is-blinking"), 150));
    };

    const animate = now => {
      const dx = state.targetX - state.x;
      const dy = state.targetY - state.y;
      const distance = Math.hypot(dx, dy);
      const speed = state.mode === "running" ? .045 : state.mode === "curious" ? .026 : .014;
      state.x += dx * speed;
      state.y += dy * speed;
      const angle = Math.max(-7, Math.min(7, dx * .025));
      const bob = state.mode === "idle" ? Math.sin(now / 850) * 1.6 : Math.sin(now / 170) * Math.min(2.2, distance * .015);
      companion.style.transform = `translate3d(${state.x}px,${state.y + bob}px,0) rotate(${angle}deg)`;
      companion.style.setProperty("--move-angle", `${angle}deg`);
      blink(now);
      state.frame = requestAnimationFrame(animate);
    };

    const rect = stage.getBoundingClientRect();
    state.x = rect.width * .72;
    state.y = Math.min(rect.height - 80, Math.max(145, rect.height * .52));
    state.targetX = state.x;
    state.targetY = state.y;
    stage.addEventListener("pointermove", pointerMove, { passive: true });
    stage.addEventListener("pointerleave", pointerLeave, { passive: true });
    companion.addEventListener("click", hurt);
    companion.addEventListener("pointerdown", event => { if (event.pointerType !== "mouse") hurt(); }, { passive: true });
    state.frame = requestAnimationFrame(animate);

    companionCleanup = () => {
      stage.removeEventListener("pointermove", pointerMove);
      stage.removeEventListener("pointerleave", pointerLeave);
      companion.removeEventListener("click", hurt);
      cancelAnimationFrame(state.frame);
      clearIdle();
    };
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
        <div class="ob-auth-companion-wrap"><div class="ob-auth-companion" data-companion role="img" aria-label="Mira, the Orbit companion"><div class="companion-shadow"></div><div class="companion-body"><i class="companion-ear left"></i><i class="companion-ear right"></i><i class="companion-eye left"></i><i class="companion-eye right"></i><i class="companion-mouth"></i><i class="companion-heart"></i></div></div><span class="ob-auth-companion-tip">Mira is curious. Move your cursor.</span></div>
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
