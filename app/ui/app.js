/* OrbitBiz workspace — application controller. Views, data and actions live in ./workspace/. */
(() => {
  "use strict";
  const root = document.getElementById("app");
  const core = window.OrbitBiz = window.OrbitBiz || {};
  const w = core.workspace = core.workspace || {};
  const state = {
    businessId: localStorage.getItem("orbitbiz.activeBusinessId") || "",
    user: null,
    page: "dashboard",
    navigate(page) { this.page = page; sync(); },
    renderPage: () => renderPage()
  };

  async function renderPage() {
    const content = document.getElementById("workspace-content");
    if (!content) return;
    content.innerHTML = `<div class="ob-loading"><span></span><span></span><span></span></div>`;
    try {
      let html;
      if (state.page === "dashboard") {
        const [customers, items, invoices, payments] = await Promise.all([
          w.safe(state, "customers", "id,name,company_name,created_at"),
          w.safe(state, "items", "id,name,selling_price,opening_stock,created_at"),
          w.safe(state, "invoices", "id,invoice_number,total,amount_paid,status,created_at"),
          w.safe(state, "payments", "id,amount,payment_date,created_at")
        ]);
        html = w.dashboardView({customers, items, invoices, payments});
      } else if (state.page === "customers") {
        html = w.customersView(await w.safe(state, "customers"));
      } else if (state.page === "inventory") {
        html = w.inventoryView(await w.safe(state, "items"));
      } else if (state.page === "invoices") {
        html = w.invoicesView(await w.safe(state, "invoices"));
      } else {
        html = w.genericView(state.page);
      }
      content.innerHTML = html;
    } catch (error) {
      console.error("OrbitBiz workspace render failed:", error);
      content.innerHTML = `<div class="ob-error"><div>${w.icon("spark")}</div><h3>Something interrupted this view.</h3><p>Your session is safe. Try again.</p><button class="ob-primary" data-action="retry">Try again</button></div>`;
    }
  }

  function sync() {
    if (!root || !w.layout) return;
    root.innerHTML = w.layout(state);
    renderPage();
  }

  function handleClick(event) {
    const pageButton = event.target.closest("[data-page]");
    if (pageButton) {
      event.preventDefault();
      state.navigate(pageButton.dataset.page);
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.action;
    if (action === "signout") core.auth?.signOut?.().then(() => location.reload());
    else if (action === "quick-add") w.quickAdd(state);
    else if (action === "new-customer") w.newCustomer(state);
    else if (action === "edit-customer") w.editCustomer(state, actionButton.dataset.id);
    else if (action === "new-item") w.newItem(state);
    else if (action === "quick-invoice") state.navigate("invoices");
    else if (action === "retry") renderPage();
    else if (action === "search") w.toast("Use the customer search field to filter your directory");
  }

  function handleCustomerSearch(event) {
    const input = event.target.closest("[data-customer-search]");
    if (!input) return;
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    document.querySelectorAll("[data-customer-row]").forEach(row => {
      const match = !query || row.dataset.search.includes(query);
      row.hidden = !match;
      if (match) visible += 1;
    });
    const counter = document.querySelector("[data-customer-count]");
    if (counter) counter.textContent = `${visible} customer${visible === 1 ? "" : "s"}`;
  }

  function mount(detail = {}) {
    state.user = detail.user || core.auth?.currentUser || null;
    state.businessId = detail.businessId || core.activeBusinessId || localStorage.getItem("orbitbiz.activeBusinessId") || "";
    if (!state.businessId) return;
    document.querySelector("#orbit-biz-landing")?.remove();
    document.querySelector(".ob-auth")?.remove();
    document.querySelector(".ob-onboarding")?.remove();
    sync();
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("input", handleCustomerSearch);
  core.events?.on("auth:ready", mount);
  window.addEventListener("auth:ready", event => mount(event.detail || {}));
  if (core.auth?.currentUser && state.businessId) mount({user: core.auth.currentUser, businessId: state.businessId});
})();
