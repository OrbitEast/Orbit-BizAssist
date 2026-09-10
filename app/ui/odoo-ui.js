/* OrbitBiz unified workspace controls: list, kanban, search, filters, grouping, favourites and bulk actions. */
(()=>{
  "use strict";
  const state={route:"",view:"list",query:"",group:null,filter:"all"};
  const titles={dashboard:"Dashboard",invoices:"Sales",clients:"Contacts",crm:"CRM",quotations:"Quotations",proforma:"Proforma",receipts:"Receipts",items:"Products",stock:"Inventory",warehouses:"Warehouses",purchases:"Purchase",["purchase-orders"]:"Purchase Orders",["vendor-payments"]:"Vendor Payments",expenses:"Expenses",["payment-accounts"]:"Accounts",reports:"Reporting",gst:"GST",["accounting-reports"]:"Accounting",reconciliation:"Reconciliation",settings:"Settings"};
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
  const root=()=>document.querySelector(".workspace-content")||document.querySelector(".workspace-main")||document.getElementById("app");
  const route=()=>document.querySelector(".workspace-nav-item.active")?.dataset.page||"dashboard";
  const tables=()=>[...root()?.querySelectorAll("table")||[]].filter(t=>!t.closest(".orbit-view-overlay"));
  const storageKey=r=>`orbitbiz.view.${r}`;
  function save(){try{localStorage.setItem(storageKey(state.route),JSON.stringify({view:state.view,filter:state.filter,group:state.group}))}catch{}}
  function restore(r){try{return JSON.parse(localStorage.getItem(storageKey(r))||"null")}catch{return null}}
  function openAction(r){
    const selectors=r==="invoices"?'[data-action="new-invoice"],[data-action="create-invoice"]':'[data-action="quick-add"]';
    const el=document.querySelector(selectors); if(el){el.click();return}
    document.dispatchEvent(new CustomEvent("orbit:quick-add",{detail:{page:r}}));
  }
  function addToolbar(r){
    const host=root(); if(!host)return;
    let bar=host.querySelector(":scope > .orbit-odoo-toolbar");
    if(!bar){
      bar=document.createElement("div");bar.className="orbit-odoo-toolbar";bar.dataset.route=r;host.prepend(bar);
    }
    const favKey=`${r}:${state.query}:${state.filter}:${state.group||""}`;
    const favs=JSON.parse(localStorage.getItem("orbitbiz.favourites")||"[]");
    bar.innerHTML=`<div class="orbit-control-title"><span>${esc(titles[r]||r)}</span><button class="orbit-fav ${favs.includes(favKey)?"active":""}" data-fav title="Save current search">★</button></div><button class="primary" data-new>New</button><div class="orbit-search-wrap"><span>⌕</span><input class="orbit-odoo-search" data-search value="${esc(state.query)}" placeholder="Search ${esc(titles[r]||r)}…" autocomplete="off"></div><div class="orbit-control-menu"><button data-menu="filter">Filters <span>⌄</span></button><div class="orbit-dropdown" data-drop="filter"><button data-filter="all">All records</button><button data-filter="active">Active</button><button data-filter="recent">Recently updated</button><button data-filter="empty">No value</button></div></div><div class="orbit-control-menu"><button data-menu="group">Group By <span>⌄</span></button><div class="orbit-dropdown" data-drop="group"><button data-group="none">No grouping</button>${groupOptions(r)}</div></div><div class="orbit-control-menu"><button data-menu="fav">Favorites <span>⌄</span></button><div class="orbit-dropdown" data-drop="fav"><button data-save-fav>Save current search</button>${favs.filter(x=>x.startsWith(r+":")).slice(0,8).map(x=>`<button data-load-fav="${esc(x)}">★ ${esc(x.split(":").slice(1,2)[0]||"Saved search")}</button>`).join("")}</div></div><div class="orbit-viewset"><button data-view="list" class="${state.view==="list"?"active":""}" title="List">☷</button><button data-view="kanban" class="${state.view==="kanban"?"active":""}" title="Kanban">▦</button></div>`;
    wire(bar,r);
  }
  function groupOptions(r){
    const t=tables()[0],heads=[...(t?.tHead?.rows?.[0]?.cells||[])].map((c,i)=>({i,text:c.textContent.trim()})).filter(x=>x.text&&x.i<7);
    if(!heads.length)return `<button data-group="first">First column</button>`;
    return heads.map(h=>`<button data-group="${h.i}">${esc(h.text)}</button>`).join("");
  }
  function wire(bar,r){
    bar.querySelector("[data-new]")?.addEventListener("click",()=>openAction(r));
    bar.querySelector("[data-search]")?.addEventListener("input",e=>{state.query=e.target.value;apply();});
    bar.querySelectorAll("[data-menu]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();const d=bar.querySelector(`[data-drop="${b.dataset.menu}"]`);bar.querySelectorAll(".orbit-dropdown.open").forEach(x=>x!==d&&x.classList.remove("open"));d?.classList.toggle("open");}));
    bar.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{state.filter=b.dataset.filter;bar.querySelectorAll(".orbit-dropdown").forEach(x=>x.classList.remove("open"));apply();save();}));
    bar.querySelectorAll("[data-group]").forEach(b=>b.addEventListener("click",()=>{state.group=b.dataset.group==="none"?null:b.dataset.group;bar.querySelectorAll(".orbit-dropdown").forEach(x=>x.classList.remove("open"));apply();save();}));
    bar.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{state.view=b.dataset.view;bar.querySelectorAll("[data-view]").forEach(x=>x.classList.toggle("active",x===b));renderView();save();}));
    const fav=bar.querySelector("[data-fav]");fav?.addEventListener("click",()=>toggleFavourite(r));
    bar.querySelector("[data-save-fav]")?.addEventListener("click",()=>saveFavourite(r));
    bar.querySelectorAll("[data-load-fav]").forEach(b=>b.addEventListener("click",()=>loadFavourite(b.dataset.loadFav)));
  }
  function toggleFavourite(r){const key=`${r}:${state.query}:${state.filter}:${state.group||""}`;let a=JSON.parse(localStorage.getItem("orbitbiz.favourites")||"[]");a=a.includes(key)?a.filter(x=>x!==key):[...a,key];localStorage.setItem("orbitbiz.favourites",JSON.stringify(a));addToolbar(r);}
  function saveFavourite(r){toggleFavourite(r);}
  function loadFavourite(key){const p=key.split(":");state.route=p.shift();state.query=p.shift()||"";state.filter=p.shift()||"all";state.group=p.join(":")||null;addToolbar(state.route);apply();}
  function rows(){return tables().flatMap(t=>[...(t.tBodies?.[0]?.rows||[])].map(tr=>({tr,table:t})))}
  function apply(){
    rows().forEach(({tr})=>{const txt=tr.textContent.toLowerCase();let ok=!state.query||txt.includes(state.query.toLowerCase());if(state.filter==="active")ok=ok&&!/inactive|archived|cancelled/i.test(txt);if(state.filter==="recent")ok=ok&&!!tr.dataset.updated; if(state.filter==="empty")ok=ok&&!![...tr.cells].some(c=>!c.textContent.trim());tr.hidden=!ok;});
    renderGroups();
    syncSelection();
  }
  function renderGroups(){
    document.querySelectorAll(".orbit-group-row").forEach(x=>x.remove());
    if(state.view!=="list"||state.group==null)return;
    tables().forEach(t=>{
      const body=t.tBodies?.[0];if(!body)return;const all=[...body.rows].filter(r=>!r.classList.contains("orbit-group-row")&&!r.hidden);if(!all.length)return;
      const idx=state.group==="first"?0:Number(state.group);const map=new Map();all.forEach(r=>{const key=(r.cells[idx]?.textContent||"Other").trim()||"Other";if(!map.has(key))map.set(key,[]);map.get(key).push(r)});
      body.innerHTML="";map.forEach((list,key)=>{const g=document.createElement("tr");g.className="orbit-group-row";g.innerHTML=`<td colspan="${Math.max(1,t.tHead?.rows?.[0]?.cells.length||1)}"><strong>${esc(key)}</strong><span>${list.length} record${list.length===1?"":"s"}</span></td>`;body.appendChild(g);list.forEach(r=>body.appendChild(r));});
    });
  }
  function renderView(){tables().forEach(t=>t.classList.toggle("orbit-kanban-mode",state.view==="kanban"));if(state.view==="list")renderGroups();else document.querySelectorAll(".orbit-group-row").forEach(x=>x.remove());}
  function selection(){
    tables().forEach(t=>{
      if(t.dataset.orbitSelect)return;t.dataset.orbitSelect="1";const h=t.tHead?.rows?.[0];if(!h)return;
      const th=document.createElement("th");th.innerHTML='<input type="checkbox" class="orbit-row-check orbit-all-check" aria-label="Select all">';h.prepend(th);
      [...t.tBodies?.[0]?.rows||[]].forEach(r=>{const td=document.createElement("td");td.innerHTML='<input type="checkbox" class="orbit-row-check" aria-label="Select row">';r.prepend(td);});
      t.addEventListener("change",e=>{if(!e.target.classList.contains("orbit-row-check"))return;if(e.target.classList.contains("orbit-all-check"))t.querySelectorAll("tbody .orbit-row-check").forEach(x=>x.checked=e.target.checked);syncSelection();});
    });
  }
  function syncSelection(){const host=root();if(!host)return;let bar=host.querySelector(".orbit-selection-bar");if(!bar){bar=document.createElement("div");bar.className="orbit-selection-bar";bar.innerHTML='<strong data-selected-count>0 selected</strong><button data-bulk="archive">Archive</button><button data-bulk="export">Export</button><button data-bulk="clear">Clear</button>';host.prepend(bar);bar.querySelector('[data-bulk="clear"]').onclick=()=>{host.querySelectorAll(".orbit-row-check").forEach(x=>x.checked=false);syncSelection()};bar.querySelector('[data-bulk="export"]').onclick=exportSelected;bar.querySelector('[data-bulk="archive"]').onclick=()=>document.dispatchEvent(new CustomEvent("orbit:selection-archive"));}const n=host.querySelectorAll("tbody .orbit-row-check:checked").length;bar.classList.toggle("show",n>0);bar.querySelector("[data-selected-count]").textContent=`${n} selected`;}
  function exportSelected(){const out=[];tables().forEach(t=>{const heads=[...t.tHead.rows[0].cells].map(c=>c.textContent.trim());[...t.tBodies[0].rows].filter(r=>r.querySelector(".orbit-row-check:checked")).forEach(r=>out.push(heads.map((_,i)=>JSON.stringify(r.cells[i]?.textContent.trim()||"")).join(",")));});const csv=(["Selected records",...out]).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`orbitbiz-${state.route}-export.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}
  function enhance(){const r=route(),host=root();if(!host||!r)return;if(state.route!==r){state.route=r;const saved=restore(r);state.view=saved?.view||"list";state.filter=saved?.filter||"all";state.group=saved?.group??null;state.query="";host.querySelector(":scope > .orbit-odoo-toolbar")?.remove();host.querySelector(".orbit-selection-bar")?.remove();}addToolbar(r);selection();apply();renderView();}
  let timer=0;const schedule=()=>{clearTimeout(timer);timer=setTimeout(enhance,120)};
  new MutationObserver(schedule).observe(document.getElementById("app")||document.body,{subtree:true,childList:true});
  document.addEventListener("orbit:workspace-ready",schedule);document.addEventListener("click",e=>{if(!e.target.closest(".orbit-control-menu"))document.querySelectorAll(".orbit-dropdown.open").forEach(x=>x.classList.remove("open"));});window.addEventListener("load",schedule);schedule();
})();
