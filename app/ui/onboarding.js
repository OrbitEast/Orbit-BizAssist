/* Orbit Biz — first-time business onboarding */
(() => {
  "use strict";

  const core = window.OrbitBiz = window.OrbitBiz || {};
  const root = () => document.querySelector("#app");
  let busy = false;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>\"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]));
  }

  function render() {
    const app = root();
    if (!app) return;
    document.querySelector("#orbit-biz-landing")?.remove();
    document.querySelector(".ob-auth")?.remove();
    document.querySelector(".ref-app")?.remove();

    const user = core.auth?.currentUser || null;
    const email = user?.email || "";
    app.innerHTML = `<section class="ob-onboarding" aria-label="Business setup">
      <div class="ob-onboarding-card">
        <div class="ob-onboarding-brand"><span>O</span><b>Orbit</b><small>Biz</small></div>
        <div class="ob-onboarding-step">STEP 1 OF 1</div>
        <h1>Set up your business.</h1>
        <p>Tell us a few basics. You can complete the rest of your workspace later.</p>
        <form id="ob-business-form" novalidate>
          <label>Business name <input name="name" maxlength="120" autocomplete="organization" required placeholder="e.g. Orbit Café"></label>
          <div class="ob-onboarding-grid">
            <label>Business email <input name="email" type="email" maxlength="160" autocomplete="email" value="${escapeHtml(email)}" placeholder="business@example.com"></label>
            <label>Phone <input name="phone" type="tel" maxlength="30" autocomplete="tel" placeholder="98765 43210"></label>
          </div>
          <label>Address <textarea name="address" rows="3" maxlength="500" autocomplete="street-address" placeholder="Shop / office address"></textarea></label>
          <div class="ob-onboarding-grid">
            <label>City <input name="city" maxlength="80" autocomplete="address-level2" placeholder="Golaghat"></label>
            <label>State <input name="state" maxlength="80" autocomplete="address-level1" value="Assam" placeholder="Assam"></label>
          </div>
          <div class="ob-onboarding-grid">
            <label>PIN code <input name="pincode" inputmode="numeric" maxlength="10" autocomplete="postal-code" placeholder="785621"></label>
            <label>GSTIN <input name="gstin" maxlength="20" autocapitalize="characters" placeholder="Optional"></label>
          </div>
          <div class="ob-onboarding-error" id="ob-onboarding-error" role="alert" hidden></div>
          <button class="ob-onboarding-submit" type="submit">Create business & continue <span>→</span></button>
        </form>
        <button class="ob-onboarding-signout" type="button" id="ob-onboarding-signout">Sign out</button>
      </div>
    </section>`;

    app.querySelector("#ob-business-form")?.addEventListener("submit", createBusiness);
    app.querySelector("#ob-onboarding-signout")?.addEventListener("click", async () => {
      await core.auth?.signOut();
    });
  }

  function showError(message) {
    const box = document.querySelector("#ob-onboarding-error");
    if (!box) return;
    box.textContent = message;
    box.hidden = false;
  }

  async function createBusiness(event) {
    event.preventDefault();
    if (busy) return;
    busy = true;
    const form = event.currentTarget;
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    button.innerHTML = "Creating your workspace…";

    try {
      const data = new FormData(form);
      const address = {
        line1: String(data.get("address") || "").trim(),
        city: String(data.get("city") || "").trim(),
        state: String(data.get("state") || "").trim(),
        pincode: String(data.get("pincode") || "").trim()
      };
      Object.keys(address).forEach(key => { if (!address[key]) delete address[key]; });

      const { data: businessId, error } = await core.auth.getClient().rpc("create_business_for_current_user", {
        p_name: String(data.get("name") || "").trim(),
        p_email: String(data.get("email") || "").trim() || null,
        p_phone: String(data.get("phone") || "").trim() || null,
        p_gstin: String(data.get("gstin") || "").trim().toUpperCase() || null,
        p_address: address
      });
      if (error) throw error;
      if (!businessId) throw new Error("Business was not created. Please try again.");

      localStorage.setItem("orbitbiz.activeBusinessId", businessId);
      core.activeBusinessId = businessId;
      window.location.reload();
    } catch (error) {
      console.error("Orbit Biz onboarding failed:", error);
      showError(error?.message || "We couldn't create your business. Please try again.");
      button.disabled = false;
      button.innerHTML = "Create business & continue <span>→</span>";
      busy = false;
    }
  }

  core.onboarding = Object.freeze({ render });
})();
