/* =========================================================
   ORBIT BIZASSIST — ONBOARDING
   First-run business setup experience.
   ========================================================= */

(() => {
  "use strict";

  const USE_CASES = [
    { id: "invoicing", icon: "▣", title: "Invoicing", text: "Create professional invoices and get paid." },
    { id: "accounting", icon: "◴", title: "Accounting", text: "Keep your business finances organized." },
    { id: "inventory", icon: "▤", title: "Inventory", text: "Track stock, products and low-stock items." },
    { id: "khata", icon: "₹", title: "Khata", text: "Manage customer credits and payments." },
    { id: "pos", icon: "⌘", title: "POS", text: "Sell faster at your counter or store." },
    { id: "complete", icon: "✦", title: "Complete Business Management", text: "Bring sales, stock, money and operations together." }
  ];

  const BUSINESS_TYPES = [
    ["manufacturer", "Manufacturer", "Produce and sell goods."],
    ["trading", "Trading", "Buy and resell goods."],
    ["retail", "Retail", "Sell through physical stores."],
    ["online", "Online", "Run an online store or marketplace business."],
    ["services", "Professional Services", "Provide expertise, consulting or services."],
    ["contractor", "Contractor", "Deliver projects from start to finish."],
    ["software", "Software", "Sell software or digital products."],
    ["other", "Something else", "My business is different."]
  ];

  const COUNTRIES = [
    ["IN", "India", "INR"], ["US", "United States", "USD"],
    ["GB", "United Kingdom", "GBP"], ["AE", "United Arab Emirates", "AED"],
    ["SG", "Singapore", "SGD"], ["AU", "Australia", "AUD"],
    ["CA", "Canada", "CAD"], ["OTHER", "Other", "USD"]
  ];

  function esc(value) {
    return window.AppUtils?.esc ? window.AppUtils.esc(value) : String(value ?? "")
      .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }

  function current() {
    return window.AppState?.get?.() || {};
  }

  function view() {
    const data = current().onboarding || {};
    const step = Number(data.step || 1);

    return `
      <section class="onboarding-page" aria-label="Set up your business">
        <div class="onboarding-shell">
          <header class="onboarding-header">
            <div class="onboarding-brand">
              <span class="brand-mark">O</span>
              <strong>Orbit BizAssist</strong>
            </div>
            <span class="onboarding-save">Secure setup · Step ${step} of 2</span>
          </header>

          <div class="onboarding-progress" aria-label="Setup progress">
            <span class="progress-track"><i style="width:${step === 1 ? "50%" : "100%"}"></i></span>
          </div>

          <main class="onboarding-card">
            ${step === 1 ? stepOne(data) : stepTwo(data)}
          </main>

          <p class="onboarding-footnote">You can update these details later from Settings.</p>
        </div>
      </section>
    `;
  }

  function stepOne(data) {
    const country = data.country || "IN";
    const currency = data.currency || "INR";

    return `
      <div class="onboarding-intro">
        <span class="onboarding-kicker">Let's get started</span>
        <h1>Tell us about your business.</h1>
        <p>We'll use these details across invoices, reports and your workspace.</p>
      </div>

      <form id="onboarding-step-one" class="onboarding-form" novalidate>
        <div class="form-grid two">
          ${field("Business name", "businessName", data.businessName, "e.g. Sharma Traders", true)}
          ${field("Phone number", "phone", data.phone, "+91 98765 43210", true, "tel")}
        </div>

        <div class="form-grid two">
          <label class="onboarding-field">
            <span>Team size <b>*</b></span>
            <select name="teamSize" required>
              ${["Just me", "2–5 people", "6–10 people", "11–25 people", "26–50 people", "51–100 people", "100+ people"].map(v => `<option ${data.teamSize === v ? "selected" : ""}>${v}</option>`).join("")}
            </select>
          </label>
          ${field("Website", "website", data.website, "https://yourbusiness.com", false, "url")}
        </div>

        <div class="form-grid two">
          <label class="onboarding-field">
            <span>Country <b>*</b></span>
            <select name="country" id="onboarding-country" required>
              ${COUNTRIES.map(([id, label]) => `<option value="${id}" ${country === id ? "selected" : ""}>${label}</option>`).join("")}
            </select>
          </label>
          <label class="onboarding-field">
            <span>Currency <b>*</b></span>
            <select name="currency" id="onboarding-currency" required>
              ${[...new Set(COUNTRIES.map(item => item[2]))].map(v => `<option ${currency === v ? "selected" : ""}>${v}</option>`).join("")}
            </select>
          </label>
        </div>

        <div class="onboarding-actions">
          <span class="required-note"><b>*</b> Required fields</span>
          <button class="primary-btn onboarding-next" type="submit">Continue <span>→</span></button>
        </div>
      </form>
    `;
  }

  function field(label, name, value, placeholder, required = false, type = "text") {
    return `
      <label class="onboarding-field">
        <span>${label} ${required ? "<b>*</b>" : ""}</span>
        <input name="${name}" type="${type}" value="${esc(value || "")}" placeholder="${placeholder}" ${required ? "required" : ""} autocomplete="${name === "businessName" ? "organization" : name}">
      </label>
    `;
  }

  function stepTwo(data) {
    const selected = Array.isArray(data.useCases) ? data.useCases : [];
    const businessType = data.businessType || "";

    return `
      <div class="onboarding-intro">
        <span class="onboarding-kicker">Make it yours</span>
        <h1>How will you use Orbit BizAssist?</h1>
        <p>Choose what matters most. We'll tailor your workspace around your business.</p>
      </div>

      <form id="onboarding-step-two" class="onboarding-form" novalidate>
        <fieldset class="choice-section">
          <legend>What do you want to manage? <small>Select all that apply</small></legend>
          <div class="choice-grid use-case-grid">
            ${USE_CASES.map(item => `
              <label class="choice-card ${selected.includes(item.id) ? "selected" : ""}">
                <input type="checkbox" name="useCases" value="${item.id}" ${selected.includes(item.id) ? "checked" : ""}>
                <span class="choice-icon">${item.icon}</span>
                <span class="choice-copy"><strong>${item.title}</strong><small>${item.text}</small></span>
                <span class="choice-check">✓</span>
              </label>
            `).join("")}
          </div>
        </fieldset>

        <fieldset class="choice-section">
          <legend>What best describes your business? <small>Choose one</small></legend>
          <div class="choice-grid business-type-grid">
            ${BUSINESS_TYPES.map(([id, title, text]) => `
              <label class="choice-card compact ${businessType === id ? "selected" : ""}">
                <input type="radio" name="businessType" value="${id}" ${businessType === id ? "checked" : ""} required>
                <span class="choice-copy"><strong>${title}</strong><small>${text}</small></span>
                <span class="choice-check">✓</span>
              </label>
            `).join("")}
          </div>
        </fieldset>

        <div class="onboarding-actions">
          <button class="secondary-btn onboarding-back" type="button" data-onboarding="back">← Back</button>
          <button class="primary-btn onboarding-next" type="submit">Finish setup <span>→</span></button>
        </div>
      </form>
    `;
  }

  function collectForm(form) {
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
      if (key === "useCases") {
        data.useCases = data.useCases || [];
        data.useCases.push(value);
      } else {
        data[key] = value;
      }
    }
    return data;
  }

  function saveDraft(patch) {
    const state = current();
    window.AppState.merge({ onboarding: { ...(state.onboarding || {}), ...patch } });
  }

  async function complete() {
    const state = current();
    const data = state.onboarding || {};
    const business = window.AppState.business?.();

    if (business) {
      window.AppState.updateBusiness({
        name: data.businessName || business.name,
        phone: data.phone || "",
        email: state.user?.email || business.email || "",
        website: data.website || "",
        country: data.country || "IN",
        currency: data.currency || "INR",
        locale: data.country === "IN" ? "en-IN" : business.locale || "en-US",
        teamSize: data.teamSize || "Just me",
        businessType: data.businessType || "other",
        useCases: data.useCases || []
      });
    }

    window.AppState.merge({
      onboarding: {
        ...data,
        completed: true,
        completedAt: new Date().toISOString(),
        step: 2
      },
      page: "dashboard"
    });

    const saveResult = window.AppState.save?.();
    if (saveResult && typeof saveResult.then === "function") {
      await saveResult;
    }

    window.location.hash = "dashboard";
    window.render?.();
  }

  function bind() {
    const formOne = document.querySelector("#onboarding-step-one");
    const formTwo = document.querySelector("#onboarding-step-two");

    if (formOne) {
      formOne.addEventListener("submit", event => {
        event.preventDefault();
        if (!formOne.reportValidity()) return;
        saveDraft({ ...collectForm(formOne), step: 2 });
        window.render?.();
      });
    }

    if (formTwo) {
      formTwo.addEventListener("submit", async event => {
        event.preventDefault();
        if (!formTwo.reportValidity()) return;
        saveDraft({ ...collectForm(formTwo) });
        await complete();
      });

      formTwo.addEventListener("change", event => {
        const card = event.target.closest(".choice-card");
        if (card) {
          if (event.target.type === "radio") {
            formTwo.querySelectorAll('.choice-card input[type="radio"]').forEach(input => input.closest(".choice-card")?.classList.toggle("selected", input.checked));
          } else if (event.target.type === "checkbox") {
            card.classList.toggle("selected", event.target.checked);
          }
        }
      });
    }

    document.querySelector("[data-onboarding='back']")?.addEventListener("click", () => {
      saveDraft({ step: 1 });
      window.render?.();
    });

    const country = document.querySelector("#onboarding-country");
    const currency = document.querySelector("#onboarding-currency");
    country?.addEventListener("change", () => {
      const match = COUNTRIES.find(item => item[0] === country.value);
      if (match && currency) currency.value = match[2];
    });
  }

  window.AppOnboarding = Object.freeze({ view, bind });
})();
