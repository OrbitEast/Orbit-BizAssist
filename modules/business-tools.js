/* =========================================================
   ORBIT BIZASSIST — BUSINESS TOOLS
   Expenses • Reports • Staff • Settings
   ========================================================= */
(() => {
  "use strict";
  const esc = v => window.AppUtils?.esc ? window.AppUtils.esc(v) : String(v ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const money = v => window.money ? window.money(v) : `₹${Number(v || 0).toLocaleString("en-IN", {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  const state = () => window.AppState?.get?.() || {};
  const biz = () => window.AppState?.business?.() || {};
  const notify = m => typeof window.toast === "function" && window.toast(m);
  const save = () => window.AppState?.save?.();
  const uid = p => `${p}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  const today = () => new Date().toISOString().slice(0,10);
  const dateOf = v => { const d = new Date(v || 0); return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0,10); };

  const metric = (label, value, sub="") => `<div class="bt-metric"><span>${esc(label)}</span><strong>${value}</strong><small>${esc(sub)}</small></div>`;
  const shell = (eyebrow,title,desc,body,actions="") => `<main class="bt-page"><div class="bt-head"><div><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2><p>${esc(desc)}</p></div><div class="bt-head-actions">${actions}</div></div>${body}</main>`;
  const empty = (title,text) => `<div class="bt-empty"><div class="bt-empty-icon">✦</div><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;

  /* EXPENSES */
  function expensesView(){
    const rows = Array.isArray(biz().expenses) ? biz().expenses : [];
    const total = rows.reduce((s,e)=>s+Number(e.amount||0),0);
    const month = rows.filter(e=>String(e.date||"").slice(0,7)===today().slice(0,7)).reduce((s,e)=>s+Number(e.amount||0),0);
    const cats = [...new Set(rows.map(e=>e.category).filter(Boolean))];
    return shell("Money out", "Expenses", "Track every business expense and keep your profit picture clean.", `<div class="bt-metrics">${metric("Total expenses",money(total),`${rows.length} entries`)}${metric("This month",money(month),"Current month")}${metric("Categories",cats.length,"Tracked categories")}</div><section class="bt-card"><div class="bt-card-head"><div><h3>Record expense</h3><p>Add a business cost in a few seconds.</p></div></div><form class="bt-form" id="expense-form"><label>Description<input name="description" required maxlength="100" placeholder="e.g. Electricity bill"></label><label>Amount<input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00"></label><label>Category<select name="category"><option>General</option><option>Rent</option><option>Utilities</option><option>Inventory</option><option>Salary</option><option>Transport</option><option>Marketing</option><option>Tax</option><option>Other</option></select></label><label>Date<input name="date" type="date" value="${today()}" required></label><label class="bt-wide">Note<input name="note" maxlength="180" placeholder="Optional note"></label><button class="primary-btn" type="submit">Add expense</button></form></section><section class="bt-card"><div class="bt-card-head"><div><h3>Recent expenses</h3><p>Your latest recorded spending.</p></div></div>${rows.length?`<div class="bt-table"><div class="bt-tr bt-th"><span>Date</span><span>Description</span><span>Category</span><span>Amount</span><span></span></div>${rows.slice().sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))).slice(0,30).map(e=>`<div class="bt-tr"><span>${esc(e.date||"—")}</span><span><strong>${esc(e.description||"Expense")}</strong>${e.note?`<small>${esc(e.note)}</small>`:""}</span><span>${esc(e.category||"General")}</span><strong>${money(e.amount)}</strong><button class="bt-icon-danger" data-expense-delete="${esc(e.id)}" type="button" aria-label="Delete expense">×</button></div>`).join("")}</div>`:empty("No expenses yet","Record your first expense above.")}</section>`);
  }
  function bindExpenses(){
    document.querySelector("#expense-form")?.addEventListener("submit",e=>{e.preventDefault();const f=e.currentTarget,d=new FormData(f);const amount=Number(d.get("amount"));if(!amount||amount<0)return;const next=[...(biz().expenses||[]),{id:uid("exp"),description:String(d.get("description")||"").trim(),amount,date:String(d.get("date")||today()),category:String(d.get("category")||"General"),note:String(d.get("note")||"").trim(),createdAt:new Date().toISOString()}];window.AppState.updateBusiness({expenses:next});save();notify("Expense recorded.");render();});
    document.addEventListener("click",expenseClick,{once:true});
  }
  function expenseClick(e){const b=e.target.closest("[data-expense-delete]");if(!b)return;const id=b.dataset.expenseDelete;window.AppState.updateBusiness({expenses:(biz().expenses||[]).filter(x=>x.id!==id)});save();notify("Expense removed.");render();}
  function expenses(){return `<div id="business-tools-view"></div>`}

  /* REPORTS */
  function reportsView(){
    const inv=biz().invoices||[], expenses=biz().expenses||[];
    const start=document.querySelector("#report-start")?.value || new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().slice(0,10);
    const end=document.querySelector("#report-end")?.value || today();
    const inRange=x=>{const d=dateOf(x.createdAt||x.date||x.invoiceDate);return d>=start&&d<=end;};
    const filtered=inv.filter(inRange), ex=expenses.filter(inRange);
    const sales=filtered.reduce((s,i)=>s+Number(i.total||i.grandTotal||0),0), spent=ex.reduce((s,i)=>s+Number(i.amount||0),0);
    const tax=filtered.reduce((s,i)=>s+Number(i.tax||i.totalTax||0),0);
    const orders=filtered.length;
    const avg=orders?sales/orders:0;
    const productMap={};
    filtered.forEach(i=>(i.items||i.lines||[]).forEach(l=>{const n=l.name||l.itemName||"Item";productMap[n]=(productMap[n]||0)+Number(l.quantity||l.qty||0);}));
    const top=Object.entries(productMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
    return shell("Business intelligence","Reports","Understand sales, costs and product performance without leaving Orbit.",`<section class="bt-card bt-report-filter"><div class="bt-card-head"><div><h3>Report period</h3><p>Choose the dates you want to analyse.</p></div></div><div class="bt-inline-form"><label>From<input id="report-start" type="date" value="${esc(start)}"></label><label>To<input id="report-end" type="date" value="${esc(end)}"></label><button class="secondary-btn" data-report-apply type="button">Apply</button></div></section><div class="bt-metrics">${metric("Sales",money(sales),`${orders} invoices`)}${metric("Expenses",money(spent),`${ex.length} entries`)}${metric("Gross movement",money(sales-spent),"Sales minus expenses")}${metric("Average invoice",money(avg),"Per invoice")}</div><div class="bt-grid-2"><section class="bt-card"><div class="bt-card-head"><div><h3>Tax collected</h3><p>Tax included in invoices for this period.</p></div><strong class="bt-big-number">${money(tax)}</strong></div><div class="bt-progress"><span style="width:${sales?Math.min(100,(tax/sales)*100):0}%"></span></div><small>${sales?((tax/sales)*100).toFixed(1):"0.0"}% of sales</small></section><section class="bt-card"><div class="bt-card-head"><div><h3>Top products</h3><p>Units sold in the selected period.</p></div></div>${top.length?`<div class="bt-rank-list">${top.map(([n,q],i)=>`<div><b>${i+1}</b><span>${esc(n)}</span><strong>${q} units</strong></div>`).join("")}</div>`:empty("No sales yet","Complete invoices will appear here.")}</section></div>`);
  }
  function reports(){return `<div id="business-tools-view"></div>`}

  /* STAFF */
  function staffView(){
    const rows=biz().staff||[];
    return shell("Team management","Staff","Control who works in your business and keep roles clear.",`<section class="bt-card"><div class="bt-card-head"><div><h3>Add team member</h3><p>Create a simple staff profile for your workspace.</p></div></div><form class="bt-form" id="staff-form"><label>Name<input name="name" required maxlength="80" placeholder="Staff member name"></label><label>Role<select name="role"><option>Sales</option><option>Cashier</option><option>Manager</option><option>Accountant</option><option>Inventory</option><option>Owner / Admin</option></select></label><label>Phone<input name="phone" maxlength="20" placeholder="Optional phone"></label><button class="primary-btn" type="submit">Add staff</button></form></section><section class="bt-card"><div class="bt-card-head"><div><h3>Team</h3><p>${rows.length} member${rows.length===1?"":"s"} in this workspace.</p></div></div><div class="bt-staff-list">${rows.map(s=>`<div class="bt-staff"><span class="bt-avatar">${esc(String(s.name||"S").trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase())}</span><div><strong>${esc(s.name||"Staff")}</strong><small>${esc(s.role||"Staff")}${s.phone?` · ${esc(s.phone)}`:""}</small></div>${s.id!=="owner"?`<button class="bt-icon-danger" data-staff-delete="${esc(s.id)}" type="button">×</button>`:`<span class="bt-owner-pill">Owner</span>`}</div>`).join("")}</div></section>`);
  }
  function staff(){return `<div id="business-tools-view"></div>`}
  function bindStaff(){document.querySelector("#staff-form")?.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.currentTarget);const name=String(d.get("name")||"").trim();if(!name)return;window.AppState.updateBusiness({staff:[...(biz().staff||[]),{id:uid("staff"),name,role:String(d.get("role")||"Sales"),phone:String(d.get("phone")||"").trim()}]});save();notify("Staff member added.");render();});document.querySelectorAll("[data-staff-delete]").forEach(b=>b.addEventListener("click",()=>{window.AppState.updateBusiness({staff:(biz().staff||[]).filter(x=>x.id!==b.dataset.staffDelete)});save();notify("Staff member removed.");render();}));}

  /* SETTINGS */
  function settingsView(){const b=biz();return shell("Workspace","Settings","Manage the business identity, tax defaults and workspace preferences.",`<form class="bt-card bt-settings-form" id="settings-form"><div class="bt-card-head"><div><h3>Business profile</h3><p>These details can appear across invoices and reports.</p></div></div><div class="bt-form"><label>Business name<input name="name" required maxlength="100" value="${esc(b.name||"")}"></label><label>Phone<input name="phone" maxlength="30" value="${esc(b.phone||"")}"></label><label>Email<input name="email" type="email" maxlength="120" value="${esc(b.email||"")}"></label><label>GSTIN<input name="gstin" maxlength="20" value="${esc(b.gstin||"")}" placeholder="Optional"></label><label>Currency<select name="currency"><option value="INR" ${b.currency==="INR"?"selected":""}>INR — Indian Rupee</option><option value="USD" ${b.currency==="USD"?"selected":""}>USD — US Dollar</option><option value="EUR" ${b.currency==="EUR"?"selected":""}>EUR — Euro</option><option value="GBP" ${b.currency==="GBP"?"selected":""}>GBP — Pound</option></select></label><label>Default tax rate<input name="taxRate" type="number" min="0" max="100" step="0.01" value="${Number(b.taxRate||0)}"> </label><label class="bt-wide">Address<textarea name="address" rows="3" maxlength="300">${esc(b.address||"")}</textarea></label></div><div class="bt-form-actions"><button class="primary-btn" type="submit">Save workspace settings</button></div></form><section class="bt-card"><div class="bt-card-head"><div><h3>Workspace status</h3><p>Orbit keeps your business state locally and syncs it to the connected cloud account when available.</p></div><span class="bt-status">● Connected</span></div></section>`);}
  function settings(){return `<div id="business-tools-view"></div>`}
  function bindSettings(){document.querySelector("#settings-form")?.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.currentTarget);const patch={name:String(d.get("name")||"").trim(),phone:String(d.get("phone")||"").trim(),email:String(d.get("email")||"").trim(),gstin:String(d.get("gstin")||"").trim().toUpperCase(),currency:String(d.get("currency")||"INR"),taxRate:Number(d.get("taxRate")||0),address:String(d.get("address")||"").trim()};if(!patch.name)return;window.AppState.updateBusiness(patch);save();notify("Workspace settings saved.");render();});}

  function render(){const root=document.querySelector("#business-tools-view");if(!root)return;const route=window.AppRouter?.current?.();if(route==="expenses")root.innerHTML=expensesView(),bindExpenses();if(route==="reports")root.innerHTML=reportsView();if(route==="staff")root.innerHTML=staffView(),bindStaff();if(route==="settings")root.innerHTML=settingsView(),bindSettings();document.querySelector("[data-report-apply]")?.addEventListener("click",()=>render());}
  window.BusinessTools=Object.freeze({expenses,reports,staff,settings,render});
})();