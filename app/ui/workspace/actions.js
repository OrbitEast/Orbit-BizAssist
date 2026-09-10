/* OrbitBiz workspace — data access, forms and interaction layer. */
(() => {
  "use strict";
  const core = window.OrbitBiz = window.OrbitBiz || {};
  const w = core.workspace = core.workspace || {};

  w.db = () => core.auth?.getClient?.();
  w.query = async (state, table, columns="*") => {
    const client = w.db();
    if (!client || !state.businessId) return [];
    const result = await client.from(table).select(columns).eq("business_id", state.businessId).order("created_at", {ascending:false}).limit(100);
    if (result.error) throw result.error;
    return result.data || [];
  };
  w.safe = async (state, table, columns="*") => { try { return await w.query(state, table, columns); } catch (error) { console.warn(`OrbitBiz: ${table} unavailable`, error); return []; } };

  w.toast = message => {
    let node = document.querySelector(".ob-toast");
    if (!node) { node = document.createElement("div"); node.className = "ob-toast"; document.body.appendChild(node); }
    node.textContent = message;
    node.classList.add("show");
    setTimeout(() => node.classList.remove("show"), 2200);
  };

  w.field = (label, name, type="text", required=false) => `<label class="ob-field"><span>${label}</span><input name="${name}" type="${type}" ${required ? "required" : ""}></label>`;

  w.modal = (title, body) => {
    document.querySelector(".ob-modal")?.remove();
    const node = document.createElement("div");
    node.className = "ob-modal";
    node.innerHTML = `<div class="ob-modal-backdrop" data-close></div><div class="ob-modal-card"><div class="ob-modal-head"><div><span class="ob-eyebrow">ORBITBIZ</span><h3>${title}</h3></div><button data-close aria-label="Close">×</button></div>${body}</div>`;
    document.body.appendChild(node);
    node.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => node.remove()));
    return node;
  };

  w.newCustomer = state => {
    const node = w.modal("Add customer", `<form class="ob-form" data-form="customer">${w.field("Name","name","text",true)}${w.field("Company","company_name")}${w.field("Phone","phone","tel")}${w.field("Email","email","email")}<button class="ob-primary" type="submit">Save customer ${w.icon("arrow")}</button></form>`);
    node.querySelector("form")?.addEventListener("submit", event => w.saveCustomer(event, state));
  };
  w.saveCustomer = async (event, state) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    data.business_id = state.businessId;
    try {
      const result = await w.db().from("customers").insert(data);
      if (result.error) throw result.error;
      form.closest(".ob-modal")?.remove();
      w.toast("Customer added");
      await state.renderPage();
    } catch (error) { w.toast(error.message || "Could not save customer"); }
  };

  w.newItem = state => {
    const node = w.modal("Add item", `<form class="ob-form" data-form="item">${w.field("Item name","name","text",true)}${w.field("SKU","sku")}${w.field("Sale price","selling_price","number")}${w.field("Tax rate","tax_rate","number")}<button class="ob-primary" type="submit">Save item ${w.icon("arrow")}</button></form>`);
    node.querySelector("form")?.addEventListener("submit", event => w.saveItem(event, state));
  };
  w.saveItem = async (event, state) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    data.business_id = state.businessId;
    data.selling_price = Number(data.selling_price || 0);
    data.tax_rate = Number(data.tax_rate || 0);
    try {
      const result = await w.db().from("items").insert(data);
      if (result.error) throw result.error;
      form.closest(".ob-modal")?.remove();
      w.toast("Item added");
      await state.renderPage();
    } catch (error) { w.toast(error.message || "Could not save item"); }
  };

  w.quickAdd = state => {
    const node = w.modal("Choose an action", `<div class="ob-choice-grid"><button data-action="new-customer"><i class="tone-pink">${w.icon("customers")}</i><b>Customer</b><small>Add a relationship</small></button><button data-action="quick-invoice"><i class="tone-yellow">${w.icon("invoices")}</i><b>Invoice</b><small>Create a sale</small></button><button data-action="new-item"><i class="tone-green">${w.icon("inventory")}</i><b>Item</b><small>Add to catalogue</small></button></div>`);
    node.querySelectorAll("[data-action]").forEach(button => button.addEventListener("click", () => {
      const action = button.dataset.action;
      node.remove();
      if (action === "new-customer") w.newCustomer(state);
      if (action === "new-item") w.newItem(state);
      if (action === "quick-invoice") state.navigate("invoices");
    }));
  };
})();
