/* OrbitBiz workspace — customer profile and transaction history. */
(() => {
  "use strict";
  const core = window.OrbitBiz = window.OrbitBiz || {};
  const w = core.workspace = core.workspace || {};

  const esc = value => w.esc ? w.esc(value) : String(value ?? "");
  const money = value => w.money ? w.money(value) : `₹${Number(value || 0).toLocaleString("en-IN")}`;
  const date = value => value ? new Date(value).toLocaleDateString("en-IN", {day:"2-digit", month:"short", year:"numeric"}) : "—";

  w.customerProfileData = async (state, id) => {
    const client = w.db();
    if (!client || !state.businessId || !id) throw new Error("Customer is not available");
    const customerResult = await client.from("customers").select("*").eq("id", id).eq("business_id", state.businessId).maybeSingle();
    if (customerResult.error) throw customerResult.error;
    if (!customerResult.data) throw new Error("Customer could not be found");
    const [invoiceResult, paymentResult] = await Promise.all([
      client.from("invoices").select("id,invoice_number,total,amount_paid,status,created_at,due_date").eq("business_id", state.businessId).eq("customer_id", id).order("created_at", {ascending:false}).limit(50),
      client.from("payments").select("id,amount,payment_date,created_at,reference,notes").eq("business_id", state.businessId).eq("customer_id", id).order("created_at", {ascending:false}).limit(50)
    ]);
    if (invoiceResult.error) console.warn("OrbitBiz: customer invoices unavailable", invoiceResult.error);
    if (paymentResult.error) console.warn("OrbitBiz: customer payments unavailable", paymentResult.error);
    return {customer: customerResult.data, invoices: invoiceResult.data || [], payments: paymentResult.data || []};
  };

  w.customerProfileView = ({customer, invoices, payments}) => {
    const billed = invoices.reduce((sum, row) => sum + Number(row.total || 0), 0);
    const paidOnInvoices = invoices.reduce((sum, row) => sum + Number(row.amount_paid || 0), 0);
    const received = payments.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const outstanding = Math.max(0, billed - paidOnInvoices);
    const initial = String(customer.name || "?").trim().charAt(0).toUpperCase();
    const contact = [customer.phone, customer.email].filter(Boolean);
    return `<div class="ob-profile-head"><button class="ob-soft" data-action="back-customers">${w.icon("arrow")} Back to customers</button><div class="ob-profile-actions"><button class="ob-soft" data-action="edit-customer" data-id="${esc(customer.id)}">Edit customer</button><button class="ob-primary small" data-action="new-invoice-for-customer" data-id="${esc(customer.id)}">${w.icon("plus")} New invoice</button></div></div>
    <section class="ob-dashboard-grid"><article class="ob-panel ob-profile-card"><div class="ob-profile-identity"><div class="ob-profile-avatar">${esc(initial)}</div><div><span class="ob-eyebrow">CUSTOMER PROFILE</span><h2>${esc(customer.name)}</h2><p>${esc(customer.company_name || "Individual customer")}</p></div><span class="ob-status ${customer.is_active === false ? "open" : "done"}">${customer.is_active === false ? "Inactive" : "Active"}</span></div><div class="ob-profile-details"><div><small>PHONE</small><strong>${esc(customer.phone || "Not added")}</strong></div><div><small>EMAIL</small><strong>${esc(customer.email || "Not added")}</strong></div><div><small>GSTIN</small><strong>${esc(customer.gstin || "Not registered")}</strong></div><div><small>CREATED</small><strong>${date(customer.created_at)}</strong></div></div>${customer.notes ? `<div class="ob-profile-note"><small>NOTES</small><p>${esc(customer.notes)}</p></div>` : ""}</article><article class="ob-panel ob-profile-card"><div class="ob-panel-head"><div><span>ACCOUNT</span><h3>Customer balance</h3></div></div><div class="ob-profile-balance"><strong>${money(outstanding + Number(customer.opening_balance || 0))}</strong><span>Current outstanding</span></div><div class="ob-profile-details compact"><div><small>OPENING BALANCE</small><strong>${money(customer.opening_balance)}</strong></div><div><small>CREDIT LIMIT</small><strong>${customer.credit_limit == null ? "No limit" : money(customer.credit_limit)}</strong></div></div></article></section>
    <section class="ob-metrics ob-profile-metrics">${w.metric("Billed", money(billed), `${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`, "yellow", "invoices")}${w.metric("Received", money(received || paidOnInvoices), `${payments.length} payment${payments.length === 1 ? "" : "s"}`, "green", "finance")}${w.metric("Outstanding", money(outstanding), "From recorded invoices", "blue", "reports")}${w.metric("Contact", contact.length, "Details available", "pink", "customers")}</section>
    <section class="ob-dashboard-grid"><article class="ob-panel ob-full-panel"><div class="ob-panel-head"><div><span>SALES HISTORY</span><h3>Recent invoices</h3></div><button data-action="new-invoice-for-customer" data-id="${esc(customer.id)}">New invoice ${w.icon("arrow")}</button></div>${invoices.length ? `<div class="ob-table-scroll"><table class="ob-table"><thead><tr><th>Invoice</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>${invoices.map(row => {const total=Number(row.total||0),paid=Number(row.amount_paid||0);return `<tr><td><strong>${esc(row.invoice_number||"Invoice")}</strong></td><td>${date(row.created_at)}</td><td>${money(total)}</td><td>${money(paid)}</td><td>${money(Math.max(0,total-paid))}</td><td><span class="ob-status ${paid>=total?"done":"open"}">${esc(row.status||(paid>=total?"Paid":"Open"))}</span></td></tr>`;}).join("")}</tbody></table></div>`:`<div class="ob-empty"><div>${w.icon("invoices")}</div><h4>No invoices yet</h4><p>Invoices linked to this customer will appear here.</p></div>`}</article><article class="ob-panel ob-full-panel"><div class="ob-panel-head"><div><span>PAYMENT HISTORY</span><h3>Recent payments</h3></div><span>${payments.length} record${payments.length===1?"":"s"}</span></div>${payments.length?`<div class="ob-list">${payments.slice(0,8).map(row=>`<div class="ob-list-row"><div class="ob-list-avatar tone-2">${w.icon("finance")}</div><div class="ob-list-main"><strong>${money(row.amount)}</strong><small>${date(row.payment_date||row.created_at)}${row.reference?` · ${esc(row.reference)}`:""}</small></div><span class="ob-status done">Received</span></div>`).join("")}</div>`:`<div class="ob-empty"><div>${w.icon("finance")}</div><h4>No payments yet</h4><p>Payments recorded against this customer will appear here.</p></div>`}</article></section>`;
  };
})();
