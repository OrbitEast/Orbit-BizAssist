/* OrbitBiz Odoo-style interaction layer */
(()=>{
  "use strict";
  const state={route:"",view:"list"};
  const titleMap={dashboard:"Dashboard",invoices:"Sales",clients:"Contacts",crm:"CRM",quotations:"Quotations",proforma:"Proforma",receipts:"Receipts",items:"Products",stock:"Inventory",warehouses:"Warehouses",purchases:"Purchase",["purchase-orders"]:"Purchase Orders",["vendor-payments"]:"Vendor Payments",expenses:"Expenses",["payment-accounts"]:"Accounts",reports:"Reporting",gst:"GST",["accounting-reports"]:"Accounting",reconciliation:"Reconciliation",settings:"Settings"};
  const $=(s,r=document)=>r.querySelector(s);
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
  function route(){return document.querySelector(".workspace-nav-item.active")?.dataset.page||document.querySelector(".workspace-nav-item[data-page].active")?.getAttribute("data-page")||"dashboard"}
  function contentRoot(){return document.querySelector(".workspace-content")||document.querySelector(".workspace-main")||document.querySelector("#app")}
  function addToolbar(root,r){
    if(!root||root.querySelector(":scope > .orbit-odoo-toolbar"))return;
    const label=titleMap[r]||r;
    const bar=document.createElement("div");bar.className="orbit-odoo-toolbar";bar.dataset.route=r;
    bar.innerHTML=`<span class="orbit-odoo-breadcrumb">${esc(label)}</span><button class="primary" data-odoo-new>New</button><input class="orbit-odoo-search" data-odoo-search placeholder="Search ${esc(label)}…" autocomplete="off"><div class="orbit-odoo-filter"><button data-odoo-filter>☷ Filters</button><div class="orbit-odoo-menu" data-filter-menu><button data-filter="all">All</button><button data-filter="active">Active</button><button data-filter="recent">Recently updated</button></div></div><button data-odoo-group>Group By</button><div class="orbit-odoo-viewset"><button class="active" data-view="list" title="List view">☷</button><button data-view="kanban" title="Kanban view">▦</button></div>`;
    root.prepend(bar);wireToolbar(bar,r);selection(root);
  }
  function wireToolbar(bar,r){
    bar.querySelector("[data-odoo-new]")?.addEventListener("click",()=>{const a=document.querySelector('[data-action="quick-add"]')||document.querySelector('[data-action="new-invoice"]')||document.querySelector('[data-action="create-invoice"]');if(a)a.click();else document.dispatchEvent(new CustomEvent("orbit:quick-add",{detail:{page:r}}))});
    const search=bar.querySelector("[data-odoo-search]");search?.addEventListener("input",()=>filterRows(search.value));
    bar.querySelector("[data-odoo-filter]")?.addEventListener("click",()=>bar.querySelector("[data-filter-menu]")?.classList.toggle("open"));
    bar.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{bar.querySelector("[data-filter-menu]")?.classList.remove("open");filterRows(b.dataset.filter==="all"?"":b.dataset.filter)}));
    bar.querySelector("[data-odoo-group]")?.addEventListener("click",()=>document.dispatchEvent(new CustomEvent("orbit:group-by",{detail:{page:r}})));
    bar.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view,bar)));
  }
  function filterRows(q){const needle=String(q||"").toLowerCase().trim();document.querySelectorAll(".workspace-main table tbody tr,.workspace-content table tbody tr").forEach(tr=>{tr.style.display=!needle||tr.textContent.toLowerCase().includes(needle)?"":"none"})}
  function setView(v,bar){state.view=v;bar.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===v));document.querySelectorAll(".workspace-main table,.workspace-content table").forEach(t=>t.classList.toggle("orbit-kanban-mode",v==="kanban"));}
  function selection(root){
    root.querySelectorAll("table").forEach(table=>{
      if(table.dataset.orbitSelection)return;table.dataset.orbitSelection="1";
      const head=table.tHead?.rows?.[0];if(!head)return;
      const h=document.createElement("th");h.innerHTML='<input class="orbit-row-check orbit-all-check" type="checkbox" aria-label="Select all">';head.prepend(h);
      table.tBodies?.[0]?.querySelectorAll("tr").forEach(tr=>{const td=document.createElement("td");td.innerHTML='<input class="orbit-row-check" type="checkbox" aria-label="Select row">';tr.prepend(td)});
      table.addEventListener("change",e=>{if(!e.target.classList.contains("orbit-row-check"))return;if(e.target.classList.contains("orbit-all-check"))table.querySelectorAll("tbody .orbit-row-check").forEach(c=>c.checked=e.target.checked);syncSelection(root)});
    });
    if(!root.querySelector(".orbit-selection-bar")){const s=document.createElement("div");s.className="orbit-selection-bar";s.innerHTML='<strong data-selected-count>0 selected</strong><button data-selection-action="archive">Archive</button><button data-selection-action="export">Export</button><button data-selection-action="clear">Clear</button>';root.prepend(s);s.querySelector('[data-selection-action="clear"]').onclick=()=>{root.querySelectorAll(".orbit-row-check").forEach(c=>c.checked=false);syncSelection(root)};s.querySelector('[data-selection-action="export"]').onclick=()=>document.dispatchEvent(new CustomEvent("orbit:selection-export"));s.querySelector('[data-selection-action="archive"]').onclick=()=>document.dispatchEvent(new CustomEvent("orbit:selection-archive"))}
    syncSelection(root);
  }
  function syncSelection(root){const n=root.querySelectorAll("tbody .orbit-row-check:checked").length;const bar=root.querySelector(".orbit-selection-bar");if(!bar)return;bar.classList.toggle("show",n>0);const c=bar.querySelector("[data-selected-count]");if(c)c.textContent=`${n} selected`}
  function enhance(){
    const r=route();const root=contentRoot();if(!root||!r)return;
    if(state.route!==r){state.route=r;state.view="list";root.querySelector(".orbit-odoo-toolbar")?.remove();root.querySelector(".orbit-selection-bar")?.remove();}
    addToolbar(root,r);
  }
  let timer=0;const schedule=()=>{clearTimeout(timer);timer=setTimeout(enhance,80)};
  new MutationObserver(schedule).observe(document.getElementById("app")||document.body,{subtree:true,childList:true});
  document.addEventListener("orbit:workspace-ready",schedule);
  document.addEventListener("click",e=>{if(!e.target.closest(".orbit-odoo-filter"))document.querySelectorAll(".orbit-odoo-menu.open").forEach(x=>x.classList.remove("open"))});
  window.addEventListener("load",schedule);schedule();
})();
