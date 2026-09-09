/* Orbit Biz — production workflow enhancements */
(()=>{
  "use strict";
  const cfg=window.OrbitBiz?.config||{};
  const businessId=()=>localStorage.getItem("orbitbiz.activeBusinessId")||"";
  const client=()=>window.OrbitBiz?.auth?.getClient?.()||window.supabase?.createClient?.(cfg.supabaseUrl,cfg.supabaseKey);
  const db=()=>{const c=client();if(!c)throw Error("Supabase client unavailable");return c};
  const esc=s=>String(s??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
  const money=n=>`₹${Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const today=()=>new Date().toISOString().slice(0,10);
  const toast=m=>{let x=document.querySelector(".wb-toast");if(!x){x=document.createElement("div");x.className="wb-toast";document.body.appendChild(x)}x.textContent=m;x.classList.add("show");clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove("show"),2600)};
  const modal=(title,body)=>{document.querySelector(".wbe-modal")?.remove();const x=document.createElement("div");x.className="wb-modal wbe-modal";x.innerHTML=`<div class="wb-modal-backdrop" data-close></div><div class="wb-modal-card"><div class="wb-modal-head"><div><h2>${title}</h2><p>Saved securely to your business workspace.</p></div><button class="wb-modal-close" data-close>×</button></div>${body}</div>`;document.body.appendChild(x);x.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>x.remove());return x};
  const field=(label,name,type="text",extra="")=>`<div class="wb-field"><label>${label}</label><input name="${name}" type="${type}" ${extra}></div>`;
  const select=(label,name,options)=>`<div class="wb-field"><label>${label}</label><select name="${name}">${options}</select></div>`;

  async function paymentsPage(){
    const [{data:payments,error:pe},{data:invoices,error:ie}]=await Promise.all([
      db().from("payments").select("id,payment_date,amount,method,reference,invoice_id,customer_id,notes").eq("business_id",businessId()).order("payment_date",{ascending:false}).limit(100),
      db().from("invoices").select("id,invoice_number,total,amount_paid,status").eq("business_id",businessId()).order("created_at",{ascending:false}).limit(100)
    ]);
    if(pe)throw pe;if(ie)throw ie;
    const panel=document.querySelector("#workspace-content .wb-panel");if(!panel)return;
    panel.dataset.wbeEnhanced="receipts";
    const map=Object.fromEntries((invoices||[]).map(i=>[i.id,i]));
    panel.innerHTML=`<div class="wb-panel-head"><div><h2>Receipts</h2><p>${(payments||[]).length} payment${payments?.length===1?"":"s"}</p></div><button class="wb-btn primary" data-wbe="new-payment">＋ Record payment</button></div>${payments?.length?`<div class="wb-table-wrap"><table class="wb-table"><thead><tr><th>Date</th><th>Invoice</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead><tbody>${payments.map(p=>`<tr><td>${esc(p.payment_date)}</td><td><strong>${esc(map[p.invoice_id]?.invoice_number||"Unapplied")}</strong></td><td><strong>${money(p.amount)}</strong></td><td>${esc(p.method||"—")}</td><td>${esc(p.reference||"—")}</td></tr>`).join("")}</tbody></table></div>`:`<div class="wb-empty"><div class="wb-empty-icon">✓</div><h3>No payments recorded</h3><p>Record customer payments here and invoice balances will update automatically.</p></div>`}`;
    panel.querySelector("[data-wbe='new-payment']").onclick=()=>openPayment(invoices||[]);
  }

  function openPayment(invoices){
    const choices=invoices.filter(i=>Number(i.total)>Number(i.amount_paid)).map(i=>`<option value="${i.id}" data-due="${Math.max(0,Number(i.total)-Number(i.amount_paid))}">${esc(i.invoice_number)} · Due ${money(Math.max(0,Number(i.total)-Number(i.amount_paid)))}</option>`).join("");
    if(!choices){toast("There are no outstanding invoices");return}
    const x=modal("Record payment",`<form class="wb-form" id="payment-form">${select("Invoice *","invoice_id",`<option value="">Select invoice</option>${choices}`)}${field("Payment date","payment_date","date",`value="${today()}"`)}${field("Amount *","amount","number","required min=0.01 step=0.01")}${select("Method","method",'<option value="bank_transfer">Bank transfer</option><option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option><option value="cheque">Cheque</option>')}${field("Reference","reference")}${field("Notes","notes")}<div class="wb-form-actions"><button type="button" class="wb-btn" data-close>Cancel</button><button class="wb-btn primary">Save payment</button></div></form>`);
    const invoice=x.querySelector('[name="invoice_id"]'),amount=x.querySelector('[name="amount"]');
    invoice.onchange=()=>{const o=invoice.selectedOptions[0];amount.value=o?.dataset.due||""};
    x.querySelector("form").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),invoiceId=String(f.get("invoice_id")||""),inv=invoices.find(i=>i.id===invoiceId),value=Number(f.get("amount")||0);if(!inv||value<=0){toast("Select an invoice and enter a valid amount");return}const due=Math.max(0,Number(inv.total)-Number(inv.amount_paid));if(value>due+0.005){toast(`Payment cannot exceed ${money(due)}`);return}const ins=await db().from("payments").insert({business_id:businessId(),invoice_id:invoiceId,customer_id:inv.customer_id||null,payment_date:f.get("payment_date")||today(),amount:value,method:String(f.get("method")||"bank_transfer"),reference:String(f.get("reference")||"").trim()||null,notes:String(f.get("notes")||"").trim()||null});if(ins.error){toast(ins.error.message);return}const paid=Number(inv.amount_paid)+value,status=paid>=Number(inv.total)-0.005?"paid":"partial";const up=await db().from("invoices").update({amount_paid:paid,status}).eq("id",invoiceId).eq("business_id",businessId());if(up.error){toast(`Payment saved, but invoice update failed: ${up.error.message}`);x.remove();return}x.remove();toast("Payment recorded successfully");await paymentsPage()};
  }

  async function expensesPage(){
    const {data,error}=await db().from("expenses").select("id,expense_date,description,category,amount,tax_amount,payment_method,reference").eq("business_id",businessId()).order("expense_date",{ascending:false}).limit(100);if(error)throw error;
    const panel=document.querySelector("#workspace-content .wb-panel");if(!panel)return;panel.dataset.wbeEnhanced="purchases";
    panel.innerHTML=`<div class="wb-panel-head"><div><h2>Expenses</h2><p>${(data||[]).length} expense${data?.length===1?"":"s"}</p></div><button class="wb-btn primary" data-wbe="new-expense">＋ Add expense</button></div>${data?.length?`<div class="wb-table-wrap"><table class="wb-table"><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead><tbody>${data.map(r=>`<tr><td>${esc(r.expense_date)}</td><td><strong>${esc(r.description||"Expense")}</strong></td><td>${esc(r.category)}</td><td>${money(r.amount)}</td><td>${esc(r.payment_method||"—")}</td><td>${esc(r.reference||"—")}</td></tr>`).join("")}</tbody></table></div>`:`<div class="wb-empty"><div class="wb-empty-icon">₹</div><h3>No expenses yet</h3><p>Track business spending so your dashboard and reports stay accurate.</p></div>`}`;
    panel.querySelector("[data-wbe='new-expense']").onclick=openExpense;
  }

  function openExpense(){
    const x=modal("Add expense",`<form class="wb-form" id="expense-form">${field("Date","expense_date","date",`value="${today()}" required`)}${field("Category *","category","text",'required placeholder="Rent, travel, utilities…"')}${field("Amount *","amount","number","required min=0.01 step=0.01")}${field("Tax amount","tax_amount","number","min=0 step=0.01 value=0")}${select("Payment method","payment_method",'<option value="bank_transfer">Bank transfer</option><option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option><option value="cheque">Cheque</option>')}${field("Reference","reference")}<div class="wb-field" style="grid-column:1/-1"><label>Description</label><textarea name="description" rows="3" placeholder="What was this expense for?"></textarea></div><div class="wb-form-actions"><button type="button" class="wb-btn" data-close>Cancel</button><button class="wb-btn primary">Save expense</button></div></form>`);
    x.querySelector("form").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),category=String(f.get("category")||"").trim(),amount=Number(f.get("amount")||0);if(!category||amount<=0){toast("Enter a category and a valid amount");return}const r=await db().from("expenses").insert({business_id:businessId(),expense_date:f.get("expense_date")||today(),category,description:String(f.get("description")||"").trim()||null,amount,tax_amount:Number(f.get("tax_amount")||0),payment_method:String(f.get("payment_method")||"")||null,reference:String(f.get("reference")||"").trim()||null});if(r.error){toast(r.error.message);return}x.remove();toast("Expense added successfully");await expensesPage()};
  }

  async function accountsPage(){
    const {data,error}=await db().from("payment_accounts").select("id,name,account_type,opening_balance,current_balance,is_active").eq("business_id",businessId()).order("name").limit(100);if(error)throw error;
    const panel=document.querySelector("#workspace-content .wb-panel");if(!panel)return;panel.dataset.wbeEnhanced="accounts";
    panel.innerHTML=`<div class="wb-panel-head"><div><h2>Payment accounts</h2><p>${(data||[]).length} account${data?.length===1?"":"s"}</p></div><button class="wb-btn primary" data-wbe="new-account">＋ Add account</button></div>${data?.length?`<div class="wb-table-wrap"><table class="wb-table"><thead><tr><th>Account</th><th>Type</th><th>Opening balance</th><th>Current balance</th><th>Status</th></tr></thead><tbody>${data.map(r=>`<tr><td><strong>${esc(r.name)}</strong></td><td>${esc(r.account_type)}</td><td>${money(r.opening_balance)}</td><td><strong>${money(r.current_balance)}</strong></td><td><span class="wb-badge ${r.is_active?"paid":"draft"}">${r.is_active?"Active":"Inactive"}</span></td></tr>`).join("")}</tbody></table></div>`:`<div class="wb-empty"><div class="wb-empty-icon">₹</div><h3>No payment accounts</h3><p>Add bank, cash and UPI accounts to organize payments.</p></div>`}`;
    panel.querySelector("[data-wbe='new-account']").onclick=openAccount;
  }

  function openAccount(){
    const x=modal("Add payment account",`<form class="wb-form" id="account-form">${field("Account name *","name","text",'required placeholder="Bank account, Cash, UPI…"')}${select("Account type","account_type",'<option value="bank">Bank</option><option value="cash">Cash</option><option value="upi">UPI</option><option value="wallet">Wallet</option><option value="other">Other</option>')}${field("Opening balance","opening_balance","number","step=0.01 value=0")}${field("Current balance","current_balance","number","step=0.01 value=0")}<div class="wb-form-actions"><button type="button" class="wb-btn" data-close>Cancel</button><button class="wb-btn primary">Save account</button></div></form>`);
    x.querySelector("form").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),name=String(f.get("name")||"").trim();if(!name){toast("Account name is required");return}const r=await db().from("payment_accounts").insert({business_id:businessId(),name,account_type:String(f.get("account_type")||"bank"),opening_balance:Number(f.get("opening_balance")||0),current_balance:Number(f.get("current_balance")||0),is_active:true});if(r.error){toast(r.error.message);return}x.remove();toast("Payment account added successfully");await accountsPage()};
  }

  async function postNewInvoiceStock(){
    const key=`orbitbiz.stock.posted.${businessId()}`;let posted;try{posted=new Set(JSON.parse(localStorage.getItem(key)||"[]"))}catch{posted=new Set()}
    const {data:invoices,error}=await db().from("invoices").select("id,invoice_number").eq("business_id",businessId()).order("created_at",{ascending:false}).limit(30);if(error)return;
    for(const inv of invoices||[]){if(posted.has(inv.id))continue;const {data:lines}=await db().from("invoice_items").select("item_id,quantity").eq("invoice_id",inv.id);if(!lines?.length)continue;for(const line of lines){if(!line.item_id)continue;const {data:exists}=await db().from("stock_movements").select("id").eq("business_id",businessId()).eq("reference_id",inv.id).eq("item_id",line.item_id).eq("movement_type","sale").limit(1);if(exists?.length)continue;await db().from("stock_movements").insert({business_id:businessId(),item_id:line.item_id,quantity:-Math.abs(Number(line.quantity||0)),movement_type:"sale",reference_id:inv.id,notes:`Invoice ${inv.invoice_number}`})}posted.add(inv.id)}
    localStorage.setItem(key,JSON.stringify([...posted].slice(-100)));
  }

  async function enhance(){
    if(!businessId())return;
    const content=document.querySelector("#workspace-content"),panel=content?.querySelector(".wb-panel");if(!content||!panel)return;
    const heading=content.querySelector("h2")?.textContent?.trim().toLowerCase();
    try{
      if(heading==="receipts"&&panel.dataset.wbeEnhanced!=="receipts")await paymentsPage();
      else if(heading==="purchases"&&panel.dataset.wbeEnhanced!=="purchases")await expensesPage();
      else if(heading==="payment accounts"&&panel.dataset.wbeEnhanced!=="accounts")await accountsPage();
      if(heading==="invoices")await postNewInvoiceStock();
    }catch(e){console.error("Orbit Biz workflow enhancement",e);toast(e.message||"Workflow update failed")}
  }

  let timer=0;
  const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(enhance,120)});
  window.addEventListener("orbitbiz:auth-ready",()=>setTimeout(enhance,150));
  window.addEventListener("auth:ready",()=>setTimeout(enhance,150));
  observer.observe(document.getElementById("app")||document.body,{childList:true,subtree:true});
  setTimeout(enhance,500);
})();
