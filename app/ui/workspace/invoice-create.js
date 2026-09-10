/* OrbitBiz — invoice creator. */
(() => {
  "use strict";
  const core = window.OrbitBiz = window.OrbitBiz || {};
  const w = core.workspace = core.workspace || {};
  const esc = v => w.esc(v);
  const money = v => w.money(v);
  const today = () => new Date().toISOString().slice(0,10);

  const line = (i, row={}, items=[]) => `<div class="ob-invoice-line" data-invoice-line="${i}">
    <select name="item_id" data-item><option value="">Custom line</option>${items.map(x=>`<option value="${esc(x.id)}" ${row.item_id===x.id?"selected":""}>${esc(x.name)}${x.sku?` · ${esc(x.sku)}`:""}</option>`).join("")}</select>
    <input name="description" data-description value="${esc(row.description || "")}" placeholder="Description" required>
    <input name="quantity" data-quantity type="number" min="0.001" step="0.001" value="${row.quantity ?? 1}" aria-label="Quantity">
    <input name="unit_price" data-price type="number" min="0" step="0.01" value="${row.unit_price ?? 0}" aria-label="Unit price">
    <input name="discount" data-discount type="number" min="0" step="0.01" value="${row.discount ?? 0}" aria-label="Discount">
    <input name="tax_rate" data-tax type="number" min="0" step="0.01" value="${row.tax_rate ?? 0}" aria-label="Tax rate">
    <strong data-line-total>₹0</strong><button type="button" class="ob-line-remove" data-remove-line aria-label="Remove line">×</button>
  </div>`;

  w.invoiceCreator = async (state, presetCustomerId="") => {
    const client = w.db();
    if (!client || !state.businessId) { w.toast("Workspace is not ready"); return; }
    const [customersResult, itemsResult] = await Promise.all([
      client.from("customers").select("id,name,company_name,gstin").eq("business_id", state.businessId).eq("is_active", true).order("name").limit(500),
      client.from("items").select("id,name,sku,selling_price,tax_rate,unit,item_type").eq("business_id", state.businessId).eq("is_active", true).order("name").limit(500)
    ]);
    if (customersResult.error) { w.toast("Could not load customers"); return; }
    if (itemsResult.error) { w.toast("Could not load catalogue"); return; }
    const customers = customersResult.data || [], items = itemsResult.data || [];
    const node = w.modal("New invoice", `<form class="ob-form ob-invoice-form" data-form="invoice">
      <div class="ob-invoice-head-grid"><label class="ob-field"><span>Customer</span><select name="customer_id" data-customer required><option value="">Select customer</option>${customers.map(c=>`<option value="${esc(c.id)}" ${presetCustomerId===c.id?"selected":""}>${esc(c.name)}${c.company_name?` · ${esc(c.company_name)}`:""}</option>`).join("")}</select></label>${w.field("Issue date","issue_date","date",true,today())}${w.field("Due date","due_date","date",false)}</div>
      <div class="ob-invoice-lines-wrap"><div class="ob-invoice-lines-head"><span>ITEMS</span><button type="button" class="ob-soft" data-add-line>${w.icon("plus")} Add line</button></div><div class="ob-invoice-line labels"><span>Catalogue</span><span>Description</span><span>Qty</span><span>Rate</span><span>Discount</span><span>Tax %</span><span>Total</span><span></span></div><div data-invoice-lines>${line(0,{},items)}</div></div>
      <div class="ob-invoice-footer"><div class="ob-invoice-notes">${w.textarea("Notes","notes","","Optional payment terms or notes")}</div><div class="ob-invoice-summary"><div><span>Subtotal</span><strong data-subtotal>₹0</strong></div><div><span>Discount</span><strong data-discount-total>₹0</strong></div><div><span>Tax</span><strong data-tax-total>₹0</strong></div><div class="grand"><span>Total</span><strong data-grand-total>₹0</strong></div></div></div>
      <button class="ob-primary" type="submit">Save draft ${w.icon("arrow")}</button>
    </form>`);
    const form = node.querySelector("form");
    const lines = node.querySelector("[data-invoice-lines]");
    const recalc = () => {
      let subtotal=0, discount=0, tax=0, total=0;
      lines.querySelectorAll("[data-invoice-line]").forEach(row => {
        const qty=Math.max(0,Number(row.querySelector("[data-quantity]").value||0));
        const price=Math.max(0,Number(row.querySelector("[data-price]").value||0));
        const disc=Math.min(Math.max(0,Number(row.querySelector("[data-discount]").value||0)),qty*price);
        const rate=Math.max(0,Number(row.querySelector("[data-tax]").value||0));
        const base=qty*price, tx=(base-disc)*rate/100, lt=base-disc+tx;
        subtotal+=base; discount+=disc; tax+=tx; total+=lt;
        row.querySelector("[data-line-total]").textContent=money(lt);
      });
      node.querySelector("[data-subtotal]").textContent=money(subtotal);
      node.querySelector("[data-discount-total]").textContent=money(discount);
      node.querySelector("[data-tax-total]").textContent=money(tax);
      node.querySelector("[data-grand-total]").textContent=money(total);
    };
    const addLine = row => { const i=lines.children.length; lines.insertAdjacentHTML("beforeend",line(i,row,items)); bindLine(lines.lastElementChild); recalc(); };
    const bindLine = row => {
      row.querySelector("[data-item]").addEventListener("change", event => {
        const item=items.find(x=>x.id===event.target.value); if(!item) return;
        row.querySelector("[data-description]").value=item.name;
        row.querySelector("[data-price]").value=Number(item.selling_price||0);
        row.querySelector("[data-tax]").value=Number(item.tax_rate||0);
        recalc();
      });
      row.querySelectorAll("input").forEach(input=>input.addEventListener("input",recalc));
      row.querySelector("[data-remove-line]").addEventListener("click",()=>{ if(lines.children.length===1){w.toast("An invoice needs at least one line");return;} row.remove(); recalc(); });
    };
    bindLine(lines.firstElementChild); node.querySelector("[data-add-line]").addEventListener("click",()=>addLine());
    form.addEventListener("submit", event => w.saveInvoice(event,state,node));
    recalc();
  };

  w.saveInvoice = async (event,state,node) => {
    event.preventDefault();
    const form=event.currentTarget, lines=[...node.querySelectorAll("[data-invoice-line]")];
    const raw=Object.fromEntries(new FormData(form).entries());
    const items=lines.map(row=>({item_id:row.querySelector("[data-item]").value||null,description:row.querySelector("[data-description]").value.trim(),quantity:Number(row.querySelector("[data-quantity]").value||0),unit_price:Number(row.querySelector("[data-price]").value||0),discount:Number(row.querySelector("[data-discount]").value||0),tax_rate:Number(row.querySelector("[data-tax]").value||0)}));
    if(!raw.customer_id){w.toast("Select a customer");return;}
    if(items.some(x=>!x.description||x.quantity<=0||x.unit_price<0||x.discount<0||x.tax_rate<0)){w.toast("Check the invoice lines");return;}
    const button=form.querySelector("button[type=submit]"); button.disabled=true; button.textContent="Saving…";
    try{
      const result=await w.db().rpc("create_invoice_with_items",{p_business_id:state.businessId,p_customer_id:raw.customer_id,p_issue_date:raw.issue_date,p_due_date:raw.due_date||null,p_notes:raw.notes||null,p_items:items});
      if(result.error) throw result.error;
      node.remove(); w.toast("Invoice draft saved"); await state.renderPage();
    }catch(error){console.error(error);w.toast(error.message||"Could not save invoice");button.disabled=false;button.innerHTML=`Save draft ${w.icon("arrow")}`;}
  };
})();
