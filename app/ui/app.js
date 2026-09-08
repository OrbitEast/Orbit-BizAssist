(() => {
  "use strict";
  const root = document.querySelector("#app");
  if (!root) return;

  const nav = [
    ["Feed", "feed", "⌁"], ["Dashboard", "dashboard", "▦"], ["Sales CRM", "crm", "♙"],
    ["Clients & Vendors", "clients", "♧"], ["Book Keeping", "books", "▤"], ["Accounting", "accounting", "₹"]
  ];
  const accounting = [["Invoices","invoices"],["Proforma Invoice","proforma"],["Quotations","quotations"],["Credit Note","credit"],["Accounting Reports","reports"]];
  const more = [["Purchases","purchases"],["Expenses","expenses"],["Inventory","inventory"],["Payment Receipts","receipts"]];

  const icon = name => {
    const p = {
      dashboard:'<rect x="4" y="4" width="6" height="7" rx="1"/><rect x="14" y="4" width="6" height="4" rx="1"/><rect x="14" y="12" width="6" height="8" rx="1"/><rect x="4" y="15" width="6" height="5" rx="1"/>',
      crm:'<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M16 14a5 5 0 0 1 5 5"/>',
      clients:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0M14 20a4.5 4.5 0 0 1 7 0"/>',
      books:'<path d="M5 4h13v16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M8 8h7M8 12h7M8 16h4"/>',
      accounting:'<path d="M5 20V9M12 20V4M19 20v-7M3 20h18"/>',
      invoice:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 15h4"/>',
      purchase:'<path d="M4 5h2l2 11h9l2-8H7"/><circle cx="10" cy="20" r="1"/><circle cx="17" cy="20" r="1"/>',
      inventory:'<path d="m12 3 8 4-8 4-8-4 8-4Z"/><path d="M4 11v8l8 4 8-4v-8M12 11v12"/>',
      reports:'<path d="M4 19V5M4 19h16"/><path d="M8 16v-5M12 16V7M16 16v-3M20 16V4"/>',
      search:'<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>',
      bell:'<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
      settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a8 8 0 0 0-2-1.2L14.2 3h-4.1l-.4 2.7a8 8 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5.2 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 2 1.2l.4 2.7h4.1l.4-2.7a8 8 0 0 0 2-1.2l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z"/>',
      plus:'<path d="M12 5v14M5 12h14"/>', chevron:'<path d="m7 9 5 5 5-5"/>', arrow:'<path d="M5 12h13M13 6l6 6-6 6"/>',
      filter:'<path d="M4 6h16M7 12h10M10 18h4"/>', more:'<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${p[name] || p.dashboard}</svg>`;
  };
  const navItem = (label,key,glyph,active=false) => `<button class="ref-nav-item ${active?'active':''}" data-nav="${key}"><span class="ref-nav-icon">${glyph || icon(key)}</span><span>${label}</span>${["crm","clients","books","accounting"].includes(key)?`<span class="ref-nav-chevron">${icon('chevron')}</span>`:''}</button>`;

  function sidebar(){return `<aside class="ref-sidebar">
    <div class="ref-brand"><button class="ref-menu">☰</button><span class="orbit-mini-logo">O</span><strong>Orbit</strong><small>BizAssist</small></div>
    <div class="ref-workspace"><span class="ref-workspace-logo">O</span><span><b>Your business</b><small>Books & CRM</small></span><span class="ref-workspace-caret">${icon('chevron')}</span></div>
    <nav class="ref-nav">${nav.map(([l,k,g])=>navItem(l,k,g,k==='dashboard')).join('')}
      <div class="ref-nav-section">Accounting</div>${accounting.map(([l,k])=>navItem(l,k,icon('invoice'))).join('')}
      <button class="ref-more-link">See more <span>⌄</span></button><div class="ref-nav-section lower">Manage</div>${more.map(([l,k])=>navItem(l,k,icon(k==='inventory'?'inventory':'purchase'))).join('')}
    </nav><div class="ref-sidebar-bottom">${navItem('Settings','settings',icon('settings'))}<div class="ref-user"><span class="ref-avatar">N</span><span><b>Nayanjyoti Ghosh</b><small>Owner</small></span><span>${icon('more')}</span></div></div>
  </aside>`;}
  function topbar(){return `<header class="ref-topbar"><div class="ref-top-search"><span>${icon('search')}</span><input placeholder="Search invoices, clients, products…" aria-label="Search"/><kbd>⌘ K</kbd></div><div class="ref-top-actions"><button class="ref-help">Help</button><button class="ref-icon-btn">${icon('bell')}<i></i></button><span class="ref-separator"></span><button class="ref-profile"><span class="ref-avatar small">N</span><span>Nayanjyoti</span>${icon('chevron')}</button></div></header>`;}
  function stat(label,value,tone,note,symbol){return `<div class="ref-stat"><div class="ref-stat-label"><span>${label}</span><span class="ref-stat-icon ${tone}">${symbol}</span></div><strong>${value}</strong><small>${note}</small></div>`;}
  function dashboard(){return `<section class="ref-content">
    <div class="ref-breadcrumb">Dashboard <span>/</span> Overview</div>
    <div class="ref-page-head"><div><h1>Dashboard</h1><p>Track your business at a glance.</p></div><button class="ref-primary">${icon('plus')} Create new <span>${icon('chevron')}</span></button></div>
    <div class="ref-filterbar"><button>FY 2026–27 ${icon('chevron')}</button><button>${icon('filter')} Filters <b>0</b></button><span></span><button class="ref-view-toggle">Overview</button><button class="ref-more-button">${icon('more')}</button></div>
    <div class="ref-summary"><div class="ref-summary-title"><b>Summary &amp; Graph</b><button>Hide summary</button></div><div class="ref-stats">${stat('Total Sales','₹0','blue','No sales yet','₹')}${stat('Receivables','₹0','purple','Nothing outstanding','↗')}${stat('Expenses','₹0','orange','No expenses recorded','−')}${stat('Stock Value','₹0','green','No inventory yet','□')}</div></div>
    <div class="ref-grid"><div class="ref-panel ref-chart-panel"><div class="ref-panel-head"><div><b>Sales overview</b><small>Revenue movement across the selected period</small></div><button>Monthly ${icon('chevron')}</button></div><div class="ref-chart"><div class="ref-gridline g1"></div><div class="ref-gridline g2"></div><div class="ref-gridline g3"></div><div class="ref-gridline g4"></div><div class="ref-chart-empty"><span class="ref-empty-orbit">◎</span><b>No sales data yet</b><small>Create your first invoice and your business trend will appear here.</small></div><div class="ref-axis"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div></div></div>
      <div class="ref-panel ref-activity"><div class="ref-panel-head"><div><b>Recent activity</b><small>Latest business events</small></div><button>View all ${icon('arrow')}</button></div><div class="ref-empty-list"><div class="ref-empty-icon">${icon('invoice')}</div><b>No activity yet</b><small>Invoices, payments and updates will appear here.</small></div></div></div>
    <div class="ref-panel ref-start"><div><b>Get started with Orbit</b><small>Complete your business setup to unlock your workspace.</small></div><div class="ref-start-actions"><button>Add business details</button><button>Add your first customer</button><button>Create an invoice ${icon('arrow')}</button></div></div>
  </section>`;}
  function render(){root.innerHTML=`<div class="ref-app">${sidebar()}<div class="ref-main">${topbar()}<main>${dashboard()}</main></div></div>`;root.querySelectorAll('[data-nav]').forEach(btn=>btn.addEventListener('click',()=>{root.querySelectorAll('.ref-nav-item').forEach(x=>x.classList.remove('active'));btn.classList.add('active');}));}
  render();
})();
