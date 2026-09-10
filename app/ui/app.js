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
    customerId: "",
    invoiceCustomerId: "",
    invoiceId: "",
    navigate(page) { this.page = page; this.customerId = ""; this.invoiceCustomerId = ""; this.invoiceId = ""; sync(); },
    openCustomer(id) { this.page = "customers"; this.customerId = id; this.invoiceCustomerId = ""; this.invoiceId = ""; sync(); },
    openInvoice(id) { this.page = "invoices"; this.invoiceId = id; this.invoiceCustomerId = ""; sync(); },
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
      } else if (state.page === "customers" && state.customerId) {
        html = w.customerProfileView(await w.customerProfileData(state, state.customerId));
      } else if (state.page === "customers") {
        html = w.customersView(await w.safe(state, "customers"));
      } else if (state.page === "inventory") {
        html = w.inventoryView(await w.safe(state, "items"));
      } else if (state.page === "invoices" && state.invoiceId) {
        html = w.invoiceDetailView(await w.invoiceDetailData(state, state.invoiceId));
      } else if (state.page === "invoices") {
        html = w.invoicesView(await w.safe(state, "invoices"));
      } else {
        html = w.genericView(state.page);
      }
      content.innerHTML = html;
      if (state.page === "invoices" && state.invoiceCustomerId) {
        const customerId = state.invoiceCustomerId;
        state.invoiceCustomerId = "";
        w.invoiceCreator(state, customerId);
      }
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

  async function openInvoiceFromRow(row) {
    const number = row?.querySelector("td")?.textContent?.trim();
    if (!number || !state.businessId) return;
    const result = await w.db().from("invoices").select("id").eq("business_id", state.businessId).eq("invoice_number", number).maybeSingle();
    if (result.error) { w.toast("Could not open invoice"); return; }
    if (result.data?.id) state.openInvoice(result.data.id);
  }

  function handleClick(event) {
    const customerRow = event.target.closest("[data-customer-row]");
    if (customerRow && !event.target.closest("button")) {
      const id = customerRow.querySelector('[data-action="edit-customer"]')?.dataset.id;
      if (id) { event.preventDefault(); state.openCustomer(id); return; }
    }
    if (state.page === "invoices" && !state.invoiceId) {
      const invoiceRow = event.target.closest(".ob-table tbody tr");
      if (invoiceRow && !event.target.closest("button")) { event.preventDefault(); openInvoiceFromRow(invoiceRow); return; }
    }
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
    else if (action === "back-customers") state.navigate("customers");
    else if (action === "back-invoices") state.navigate("invoices");
    else if (action === "new-item") w.newItem(state);
    else if (action === "quick-invoice") { state.invoiceCustomerId = ""; state.navigate("invoices"); }
    else if (action === "new-invoice-for-customer") { state.invoiceCustomerId = actionButton.dataset.id || ""; state.navigate("invoices"); }
    else if (action === "record-payment" && state.invoiceId) w.invoiceDetailData(state,state.invoiceId).then(data => w.recordInvoicePayment(state,data)).catch(error => w.toast(error.message||"Could not load invoice"));
    else if (action === "print-invoice") window.print();
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
