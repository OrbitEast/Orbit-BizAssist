/* OrbitBiz — Business OS / Odoo-style application launcher */
(()=>{
  "use strict";
  const core=window.OrbitBiz=window.OrbitBiz||{};
  const registry=[
    {id:"dashboard",name:"Dashboard",group:"Overview",icon:"▦",desc:"Business overview"},
    {id:"invoices",name:"Sales",group:"Sales",icon:"↗",desc:"Quotations, orders and invoices"},
    {id:"clients",name:"Contacts",group:"Sales",icon:"◎",desc:"Customers and contacts"},
    {id:"crm",name:"CRM",group:"Sales",icon:"⌁",desc:"Leads and opportunities"},
    {id:"quotations",name:"Quotations",group:"Sales",icon:"▤",desc:"Customer quotations"},
    {id:"proforma",name:"Proforma",group:"Sales",icon:"▧",desc:"Proforma invoices"},
    {id:"receipts",name:"Receipts",group:"Sales",icon:"▥",desc:"Customer receipts"},
    {id:"items",name:"Products",group:"Inventory",icon:"◇",desc:"Products and services"},
    {id:"stock",name:"Inventory",group:"Inventory",icon:"□",desc:"Stock operations"},
    {id:"warehouses",name:"Warehouses",group:"Inventory",icon:"⌂",desc:"Locations and stock"},
    {id:"purchases",name:"Purchase",group:"Purchases",icon:"↙",desc:"Supplier purchases"},
    {id:"purchase-orders",name:"Purchase Orders",group:"Purchases",icon:"▣",desc:"Orders to suppliers"},
    {id:"vendor-payments",name:"Vendor Payments",group:"Purchases",icon:"₹",desc:"Supplier payments"},
    {id:"expenses",name:"Expenses",group:"Finance",icon:"−",desc:"Business expenses"},
    {id:"payment-accounts",name:"Accounts",group:"Finance",icon:"▰",desc:"Cash and bank accounts"},
    {id:"reports",name:"Reporting",group:"Reporting",icon:"⌁",desc:"Business reports"},
    {id:"gst",name:"GST",group:"Reporting",icon:"%",desc:"Tax reporting"},
    {id:"accounting-reports",name:"Accounting",group:"Reporting",icon:"Σ",desc:"Financial statements"},
    {id:"reconciliation",name:"Reconciliation",group:"Finance",icon:"⇄",desc:"Match transactions"}
  ];
  const defaults=["dashboard","invoices","clients","crm","items","stock","purchases","expenses","reports"];
  const key=()=>`orbitbiz.os.apps.${core.activeBusinessId||localStorage.getItem("orbitbiz.activeBusinessId")||"default"}`;
  const read=()=>{try{const v=JSON.parse(localStorage.getItem(key())||"null");return Array.isArray(v)&&v.length?v:[...defaults]}catch{return [...defaults]}};
  const save=v=>localStorage.setItem(key(),JSON.stringify(v));
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
  let installed=read(),overlay=null,view="home";
  const get=id=>registry.find(x=>x.id===id);
  const initials=()=>{const e=core.auth?.currentUser?.email||"User";return e.slice(0,2).toUpperCase()};
  const appCard=a=>`<button class="orbit-os-app" data-os-open="${a.id}"><span class="orbit-os-app-icon">${a.icon}</span><span class="orbit-os-app-name">${esc(a.name)}</span><span class="orbit-os-app-desc">${esc(a.desc)}</span></button>`;
  function home(){
    const apps=registry.filter(a=>installed.includes(a.id));
    const groups=["Overview","Sales","Inventory","Purchases","Finance","Reporting"];
    return `<div class="orbit-os-screen orbit-odoo-launcher"><header class="orbit-os-top"><div class="orbit-os-brand"><button class="orbit-os-apps-button" data-os-apps>☷</button><span class="orbit-os-mark">O</span><div><strong>OrbitBiz</strong><small>Business OS</small></div></div><div class="orbit-os-top-actions"><button class="orbit-os-search" data-os-search><span>⌕</span><span>Search apps</span><kbd>Ctrl K</kbd></button><button class="orbit-os-help">?</button><button class="orbit-os-avatar" data-os-menu>${initials()}</button></div></header><main class="orbit-os-body"><div class="orbit-os-launch-head"><div><div class="orbit-os-breadcrumb">APPS</div><h1>Applications</h1><p>Choose an application to manage your business.</p></div><button class="orbit-os-manage" data-os-manage>Manage apps</button></div>${groups.map(g=>{const items=apps.filter(a=>a.group===g);return items.length?`<section class="orbit-os-group"><div class="orbit-os-group-title">${g}</div><div class="orbit-os-grid">${items.map(appCard).join("")}</div></section>`:""}).join("")}</main><footer class="orbit-os-footer"><span>Orbit East</span><span>•</span><span>One database across every app</span><button data-os-signout>Sign out</button></footer></div>`;
  }
  function manager(){return `<div class="orbit-os-screen orbit-odoo-launcher"><header class="orbit-os-top"><div class="orbit-os-brand"><button class="orbit-os-back" data-os-home>‹</button><span class="orbit-os-mark">O</span><div><strong>App settings</strong><small>Applications</small></div></div><div class="orbit-os-top-actions"><button class="orbit-os-avatar" data-os-menu>${initials()}</button></div></header><main class="orbit-os-manager"><div class="orbit-os-manager-head"><div><div class="orbit-os-breadcrumb">SETTINGS / APPLICATIONS</div><h1>Applications</h1><p>Install or hide business applications. Data remains connected across the workspace.</p></div><span class="orbit-os-count">${installed.length} / ${registry.length}</span></div><div class="orbit-os-manager-list">${registry.map(a=>`<div class="orbit-os-manager-row"><span class="orbit-os-app-icon small">${a.icon}</span><div><strong>${esc(a.name)}</strong><p>${esc(a.desc)}</p></div><button class="orbit-os-toggle ${installed.includes(a.id)?"on":""}" data-os-toggle="${a.id}" ${a.id==="dashboard"?"disabled":""}><i></i><span>${installed.includes(a.id)?"Installed":"Install"}</span></button></div>`).join("")}</div></main></div>`}
  function mount(){const root=document.getElementById("app");if(!root)return;if(!overlay){overlay=document.createElement("div");overlay.id="orbit-os";document.body.appendChild(overlay)}overlay.innerHTML=view==="manager"?manager():home();document.body.classList.add("orbit-os-active");root.classList.add("orbit-os-underlay");bind();}
  function bind(){
    overlay.querySelectorAll("[data-os-open]").forEach(b=>b.onclick=()=>openApp(b.dataset.osOpen));
    overlay.querySelector("[data-os-manage]")?.addEventListener("click",()=>{view="manager";mount()});
    overlay.querySelector("[data-os-home]")?.addEventListener("click",()=>{view="home";mount()});
    overlay.querySelector("[data-os-signout]")?.addEventListener("click",()=>core.auth?.signOut?.());
    overlay.querySelector("[data-os-search]")?.addEventListener("click",showSearch);
    overlay.querySelector("[data-os-menu]")?.addEventListener("click",showAccountMenu);
    overlay.querySelector("[data-os-apps]")?.addEventListener("click",()=>{view="home";mount()});
    overlay.querySelectorAll("[data-os-toggle]").forEach(b=>b.onclick=()=>{const id=b.dataset.osToggle;if(id==="dashboard")return;installed=installed.includes(id)?installed.filter(x=>x!==id):[...installed,id];if(!installed.includes("dashboard"))installed.unshift("dashboard");save(installed);mount()});
  }
  function showAccountMenu(){const email=core.auth?.currentUser?.email||"Signed in";document.querySelector(".orbit-os-account-menu")?.remove();const x=document.createElement("div");x.className="orbit-os-account-menu";x.innerHTML=`<div><strong>${esc(email)}</strong><small>OrbitBiz account</small></div><button data-os-account-signout>Sign out</button>`;document.body.appendChild(x);x.querySelector("button").onclick=()=>core.auth?.signOut?.();setTimeout(()=>document.addEventListener("click",()=>x.remove(),{once:true}),0)}
  function showSearch(){document.querySelector(".orbit-os-search-layer")?.remove();const x=document.createElement("div");x.className="orbit-os-search-layer";x.innerHTML=`<div class="orbit-os-search-backdrop" data-os-close></div><div class="orbit-os-search-box"><div class="orbit-os-search-input"><span>⌕</span><input autofocus placeholder="Search applications…" data-os-query><kbd>ESC</kbd></div><div class="orbit-os-results" data-os-results>${registry.filter(a=>installed.includes(a.id)).map(appCard).join("")}</div></div>`;document.body.appendChild(x);const input=x.querySelector("input"),results=x.querySelector("[data-os-results]");const run=()=>{const q=input.value.trim().toLowerCase();const hits=registry.filter(a=>installed.includes(a.id)&&(`${a.name} ${a.desc} ${a.group}`.toLowerCase().includes(q)));results.innerHTML=hits.length?hits.map(appCard).join(""):"<div class=\"orbit-os-no-results\">No applications found.</div>";results.querySelectorAll("[data-os-open]").forEach(b=>b.onclick=()=>{x.remove();openApp(b.dataset.osOpen)})};input.addEventListener("input",run);x.querySelector("[data-os-close]").onclick=()=>x.remove();input.addEventListener("keydown",e=>{if(e.key==="Escape")x.remove();if(e.key==="Enter"){const first=results.querySelector("[data-os-open]");if(first){x.remove();openApp(first.dataset.osOpen)}}});setTimeout(()=>input.focus(),20)}
  function openApp(id){if(!get(id))return;overlay?.remove();overlay=null;document.body.classList.remove("orbit-os-active");document.getElementById("app")?.classList.remove("orbit-os-underlay");const button=document.querySelector(`.workspace-nav-item[data-page="${CSS.escape(id)}"]`);if(button)button.click();else document.querySelector(`[data-global-nav="${CSS.escape(id)}"]`)?.click();setTimeout(()=>{document.dispatchEvent(new CustomEvent("orbit:workspace-ready",{detail:{app:id}}));injectLauncher()},80)}
  function injectLauncher(){const top=document.querySelector(".workspace-topbar");if(!top||top.querySelector("[data-os-launcher]"))return;const b=document.createElement("button");b.className="orbit-os-launcher-button";b.dataset.osLauncher="1";b.title="Applications";b.textContent="☷";b.onclick=launcher;top.querySelector(".workspace-actions")?.prepend(b)}
  function launcher(){view="home";mount()}
  core.os={registry,openApp,launcher,showSearch,installed:()=>installed};
  core.events?.on("auth:ready",()=>setTimeout(launcher,80));
  document.addEventListener("orbit:workspace-ready",()=>setTimeout(injectLauncher,50));
  document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();showSearch()}});
})();
