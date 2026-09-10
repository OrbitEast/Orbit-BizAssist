/* OrbitBiz — invoice detail, payment entry and print-ready document view. */
(() => {
  "use strict";
  const core = window.OrbitBiz = window.OrbitBiz || {};
  const w = core.workspace = core.workspace || {};
  const esc = v => w.esc(v);
  const money = v => w.money(v);
  const date = v => v ? new Date(v).toLocaleDateString("en-IN", {day:"2-digit", month:"short", year:"numeric"}) : "—";
  const today = () => new Date().toISOString().slice(0,10);

  w.invoiceDetailData = async (state, id) => {
    const client = w.db();
    if (!client || !state.businessId || !id) throw new Error("Invoice is not available");
    const invoiceResult = await client.from("invoices").select("*").eq("id", id).eq("business_id", state.businessId).maybeSingle();
    if (invoiceResult.error) throw invoiceResult.error;
    if (!invoiceResult.data) throw new Error("Invoice could not be found");
    const invoice = invoiceResult.data;
    const [customerResult, linesResult, paymentsResult] = await Promise.all([
      invoice.customer_id ? client.from("customers").select("id,name,company_name,email,phone,gstin,billing_address,shipping_address").eq("id", invoice.customer_id).eq("business_id", state.businessId).maybeSingle() : Promise.resolve({data:null,error:null}),
      client.from("invoice_items").select("id,item_id,description,quantity,unit_price,discount,tax_rate,line_total,created_at").eq("invoice_id", id).order("created_at"),
      client.from("payments").select("id,payment_date,amount,method,reference,notes,created_at").eq("business_id", state.businessId).eq("invoice_id", id).order("payment_date", {ascending:false}).limit(100)
    ]);
    if (customerResult.error) throw customerResult.error;
    if (linesResult.error) throw linesResult.error;
    if (paymentsResult.error) throw paymentsResult.error;
    return {invoice, customer:customerResult.data, lines:linesResult.data || [], payments:paymentsResult.data || []};
  };

  w.invoiceDetailView = data => {
    const {invoice, customer, lines, payments} = data;
    const total = Number(invoice.total || 0), paid = Number(invoice.amount_paid || 0), balance = Math.max(0,total-paid);
    const status = invoice.status || (paid >= total ? "paid" : paid > 0 ? "partial" : "draft");
    const statusTone = status === "paid" ? "done" : status === "cancelled" ? "open" : status === "partial" ? "blue" : "yellow";
    return `<section class="ob-invoice-detail-head"><div><button class="ob-soft" data-action="back-invoices">${w.icon("arrow")} Invoices</button><div class="ob-invoice-title"><span class="ob-eyebrow">SALES DOCUMENT</span><h2>${esc(invoice.invoice_number)}</h2><span class="ob-status ${statusTone === "done" ? "done" : "open"}">${esc(status.replace(/_/g," "))}</span></div><p>${esc(customer?.company_name || customer?.name || "Customer")}</p></div><div class="ob-profile-actions"><button class="ob-soft" data-action="print-invoice">Print</button>${status !== "cancelled" && balance > 0 ? `<button class="ob-primary" data-action="record-payment">${w.icon("plus")} Record payment</button>` : ""}</div></section>
    <section class="ob-invoice-detail-grid"><article class="ob-panel ob-invoice-paper" id="invoice-print-area"><header class="ob-paper-top"><div><span>ORBITBIZ</span><h3>INVOICE</h3></div><div><strong>${esc(invoice.invoice_number)}</strong><small>Issued ${date(invoice.issue_date)}</small>${invoice.due_date ? `<small>Due ${date(invoice.due_date)}</small>` : ""}</div></header><div class="ob-paper-parties"><div><small>BILL TO</small><strong>${esc(customer?.name || "Customer")}</strong>${customer?.company_name ? `<span>${esc(customer.company_name)}</span>` : ""}${customer?.phone ? `<span>${esc(customer.phone)}</span>` : ""}${customer?.email ? `<span>${esc(customer.email)}</span>` : ""}${customer?.gstin ? `<span>GSTIN: ${esc(customer.gstin)}</span>` : ""}</div><div><small>STATUS</small><strong>${esc(status.replace(/_/g," "))}</strong><span>Created ${date(invoice.created_at)}</span></div></div><div class="ob-paper-table"><table class="ob-table"><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Discount</th><th>Tax</th><th>Total</th></tr></thead><tbody>${lines.map(row=>`<tr><td><strong>${esc(row.description)}</strong></td><td>${Number(row.quantity||0).toLocaleString("en-IN")}</td><td>${money(row.unit_price)}</td><td>${money(row.discount)}</td><td>${Number(row.tax_rate||0)}%</td><td><strong>${money(row.line_total)}</strong></td></tr>`).join("")}</tbody></table></div><div class="ob-paper-bottom"><div>${invoice.notes ? `<small>NOTES</small><p>${esc(invoice.notes)}</p>` : ""}</div><div class="ob-paper-totals"><div><span>Subtotal</span><b>${money(invoice.subtotal)}</b></div><div><span>Discount</span><b>${money(invoice.discount_total)}</b></div><div><span>Tax</span><b>${money(invoice.tax_total)}</b></div><div class="grand"><span>Total</span><strong>${money(total)}</strong></div></div></div></article><aside class="ob-invoice-side"><article class="ob-panel"><div class="ob-panel-head"><div><span>ACCOUNT</span><h3>Payment position</h3></div></div><div class="ob-payment-position"><div><small>TOTAL</small><strong>${money(total)}</strong></div><div><small>RECEIVED</small><strong>${money(paid)}</strong></div><div class="balance"><small>OUTSTANDING</small><strong>${money(balance)}</strong></div></div></article><article class="ob-panel"><div class="ob-panel-head"><div><span>PAYMENTS</span><h3>${payments.length ? `${payments.length} recorded` : "No payments"}</h3></div></div>${payments.length ? `<div class="ob-list">${payments.map(row=>`<div class="ob-list-row"><div class="ob-list-avatar tone-2">${w.icon("finance")}</div><div class="ob-list-main"><strong>${money(row.amount)}</strong><small>${date(row.payment_date)} · ${esc(String(row.method||"bank_transfer").replace(/_/g," "))}${row.reference?` · ${esc(row.reference)}`:""}</small></div><span class="ob-status done">Received</span></div>`).join("")}</div>` : `<div class="ob-empty compact"><div>${w.icon("finance")}</div><h4>No payment yet</h4><p>Record a payment when money is received.</p></div>`}</article></aside></section>`;
  };

  w.recordInvoicePayment = (state, data) => {
    const invoice = data.invoice, balance = Math.max(0, Number(invoice.total||0)-Number(invoice.amount_paid||0));
    const node = w.modal("Record payment", `<form class="ob-form ob-payment-form"><div class="ob-payment-callout"><span>OUTSTANDING</span><strong>${money(balance)}</strong><small>For ${esc(invoice.invoice_number)}</small></div><div class="ob-form-grid"><label class="ob-field"><span>Amount</span><input name="amount" type="number" min="0.01" max="${balance.toFixed(2)}" step="0.01" value="${balance.toFixed(2)}" required></label>${w.field("Payment date","payment_date","date",true,today())}<label class="ob-field"><span>Method</span><select name="method"><option value="bank_transfer">Bank transfer</option><option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option><option value="cheque">Cheque</option><option value="other">Other</option></select></label><label class="ob-field"><span>Reference</span><input name="reference" placeholder="Transaction / receipt reference"></label></div>${w.textarea("Notes","notes","","Optional payment note")}<button class="ob-primary" type="submit">Save payment ${w.icon("arrow")}</button></form>`);
    const form = node.querySelector("form");
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const raw = Object.fromEntries(new FormData(form).entries());
      const amount = Number(raw.amount || 0);
      if (!(amount > 0) || amount > balance) { w.toast("Enter a valid amount within the outstanding balance"); return; }
      const button=form.querySelector("button[type=submit]"); button.disabled=true; button.textContent="Saving…";
      const result=await w.db().rpc("record_invoice_payment",{p_business_id:state.businessId,p_invoice_id:invoice.id,p_payment_date:raw.payment_date,p_amount:amount,p_method:raw.method,p_reference:raw.reference||null,p_notes:raw.notes||null});
      if(result.error){w.toast(result.error.message||"Could not record payment");button.disabled=false;button.innerHTML=`Save payment ${w.icon("arrow")}`;return;}
      node.remove(); w.toast("Payment recorded"); await state.renderPage();
    });
  };
})();
