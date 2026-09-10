/* OrbitBiz — modern ERP workspace inspired by Odoo patterns. */
(()=>{
  "use strict";
  const apps=[
    ["Sales","invoices","Sales, quotations and customers","▣"],["CRM","crm","Leads and opportunities","♢"],["Contacts","clients","Customers and contacts","♙"],
    ["Inventory","stock","Products, stock and warehouses","◈"],["Purchase","purchases","Purchases and vendors","🛒"],["Accounting","accounting-reports","Invoices, payments and reports","▤"],
    ["Expenses","expenses","Business expenses","▦"],["Reporting","reports","Business analytics","◒"],["Settings","settings","Workspace configuration","⚙"]
  ];
  const iconMap={Sales:"▣",CRM:"♢",Contacts:"♙",Inventory:"◈",Purchase:"🛒",Accounting:"▤",Expenses:"▦",Reporting:"◒",Settings:"⚙"};
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
  const titleMap={dashboard:"Dashboard",invoices:"Sales",clients:"Contacts",crm:"CRM",quotations:"Quotations",proforma:"Proforma Invoices",receipts:"Receipts",items:"Products",stock:"Inventory",warehouses:"Warehouses",purchases:"Purchase",["purchase-orders"]:"Purchase Orders",["vendor-payments"]:"Vendor Payments",expenses:"Expenses",["payment-accounts"]:"Payment Accounts",reports:"Reporting",gst:"GST",["accounting-reports"]:"Accounting",reconciliation:"Reconciliation",settings:"Settings"};
  const appRoot=()=>document.getElementById("app");
  const current=()=>document.querySelector(".workspace-nav-item.active")?.dataset.page||"dashboard";
  function navigate(page){
    const b=document.querySelector(`.workspace-nav-item[data-page="${CSS.escape(page)}"]`); if(b){b.click();return;}
    document.dispatchEvent(new CustomEvent("orbit:navigate",{detail:{page}}));
  }
  function launcher(){
    if(document.querySelector(".orbit-app-launcher"))return;
    const x=document.createElement("div");x.className="orbit-app-launcher";x.innerHTML=`
      <div class="orbit-launcher-backdrop" data-launch-close></div>
      <section class="orbit-launcher-panel" role="dialog" aria-label="Applications">
        <header><div><strong>Applications</strong><span>OrbitBiz</span></div><button data-launch-close aria-label="Close">×</button></header>
        <div class="orbit-launcher-search"><span>⌕</span><input placeholder="Search applications…" data-launcher-search></div>
        <div class="orbit-app-grid" data-app-grid></div>
      </section>`;
    document.body.appendChild(x);
    const grid=x.querySelector("[data-app-grid]");
    grid.innerHTML=apps.map(([name,key,desc,ic])=>`<button class="orbit-app-tile" data-launch-app="${key}"><span class="orbit-app-icon">${ic}</span><span><b>${esc(name)}</b><small>${esc(desc)}</small></span></button>`).join("");
    x.querySelectorAll("[data-launch-close]").forEach(b=>b.onclick=()=>x.remove());
    x.querySelectorAll("[data-launch-app]").forEach(b=>b.onclick=()=>{const p=b.dataset.launchApp;x.remove();navigate(p)});
    x.querySelector("[data-launcher-search]")?.addEventListener("input",e=>{const q=e.target.value.toLowerCase();x.querySelectorAll(".orbit-app-tile").forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(q))});
  }
  function appGridHome(){
    const content=document.querySelector("#workspace-content");
    if(!content||current()!=="dashboard")return;
    if(content.dataset.orbitHome)return;
    const old=content.innerHTML;
    const launcherHome=document.createElement("div");launcherHome.className="orbit-home-grid";
    launcherHome.innerHTML=`<div class="orbit-home-heading"><div><h2>OrbitBiz</h2><p>Choose an application to get started.</p></div><button class="wb-btn primary" data-open-launcher>All applications</button></div><div class="orbit-home-apps">${apps.map(([name,key,desc,ic])=>`<button data-home-app="${key}"><span class="orbit-app-icon">${ic}</span><b>${esc(name)}</b><small>${esc(desc)}</small></button>`).join("")}</div><div class="orbit-home-secondary">${old}</div>`;
    content.innerHTML="";content.appendChild(launcherHome);content.dataset.orbitHome="1";
    launcherHome.querySelector("[data-open-launcher]").onclick=launcher;
    launcherHome.querySelectorAll("[data-home-app]").forEach(b=>b.onclick=()=>navigate(b.dataset.homeApp));
  }
  function modernize(){
    const shell=document.querySelector(".workspace-shell");if(!shell)return;
    const brand=shell.querySelector(".workspace-brand");
    if(brand&&!brand.dataset.modernized){
      brand.dataset.modernized="1";
      brand.innerHTML=`<button class="orbit-brand-button" data-open-launcher title="Applications"><img src="assets/orbit-east-logo.png" alt="OrbitBiz"><span>OrbitBiz</span><i>⌄</i></button>`;
      brand.querySelector("button").onclick=launcher;
    }
    const top=shell.querySelector(".workspace-topbar");
    if(top&&!top.dataset.modernized){
      top.dataset.modernized="1";
      const p=top.querySelector("h1")?.textContent||titleMap[current()]||"Workspace";
      top.innerHTML=`<div class="orbit-top-left"><button class="orbit-menu-button" data-open-launcher title="Applications">☷</button><div class="orbit-breadcrumb"><span>OrbitBiz</span><b>›</b><strong>${esc(p)}</strong></div></div><div class="orbit-top-actions"><button data-global-search title="Search">⌕</button><button title="Activities">◷</button><button title="Messages">◌</button><button class="orbit-avatar" title="Account">O</button></div>`;
      top.querySelectorAll("[data-open-launcher]").forEach(b=>b.onclick=launcher);
      top.querySelector("[data-global-search]")?.addEventListener("click",()=>document.dispatchEvent(new CustomEvent("orbit:global-search")));
    }
    appGridHome();
  }
  let timer;const schedule=()=>{clearTimeout(timer);timer=setTimeout(modernize,50)};
  new MutationObserver(schedule).observe(appRoot()||document.body,{subtree:true,childList:true});
  document.addEventListener("orbit:workspace-ready",schedule);window.addEventListener("load",schedule);schedule();
})();
