/* OrbitBiz workspace — navigation, metadata and icon primitives. */
(() => {
  "use strict";
  const core = window.OrbitBiz = window.OrbitBiz || {};
  const workspace = core.workspace = core.workspace || {};

  workspace.icons = {
    dashboard:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    customers:'<circle cx="9" cy="7" r="4"/><path d="M2 21a7 7 0 0 1 14 0M17 8h5M19.5 5.5v5"/>',
    crm:'<circle cx="8" cy="8" r="4"/><path d="M2 21a6 6 0 0 1 12 0M16 11h6M19 8v6"/>',
    invoices:'<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 12h6M9 16h4"/>',
    quotations:'<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    purchases:'<path d="M3 4h2l2 11h11l3-8H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
    inventory:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5M3 17l9 5 9-5"/>',
    reports:'<path d="M4 19V5M4 19h16"/><path d="m7 15 4-5 3 3 5-7"/>',
    finance:'<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M7 15h4"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19 15.2a1.8 1.8 0 0 0 .3 2l.1.1-1.7 1.7-.1-.1a1.8 1.8 0 0 0-2-.3 1.8 1.8 0 0 0-1.1 1.6v.2h-2.4v-.2a1.8 1.8 0 0 0-1.1-1.6 1.8 1.8 0 0 0-2 .3l-.1.1-1.7-1.7.1-.1a1.8 1.8 0 0 0 .3-2 1.8 1.8 0 0 0-1.6-1H6v-2.4h.1a1.8 1.8 0 0 0 1.6-1 1.8 1.8 0 0 0-.3-2l-.1-.1L9 6.7l.1.1a1.8 1.8 0 0 0 2 .3 1.8 1.8 0 0 0 1.1-1.6v-.2h2.4v.2a1.8 1.8 0 0 0 1.1 1.6 1.8 1.8 0 0 0 2-.3l.1-.1 1.7 1.7-.1.1a1.8 1.8 0 0 0-.3 2 1.8 1.8 0 0 0 1.6 1h.1v2.4h-.1a1.8 1.8 0 0 0-1.6 1Z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', search:'<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>', arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>', spark:'<path d="m12 3 1.5 6.5L20 11l-6.5 1.5L12 19l-1.5-6.5L4 11l6.5-1.5L12 3Z"/>'
  };

  workspace.nav = [
    ["Overview", [["dashboard","Dashboard"]]],
    ["Sell", [["crm","CRM"],["customers","Customers"],["quotations","Quotations"],["invoices","Invoices"]]],
    ["Buy & stock", [["purchases","Purchases"],["inventory","Inventory"]]],
    ["Money", [["finance","Finance"],["reports","Reports"]]],
    ["Workspace", [["settings","Settings"]]]
  ];

  workspace.meta = {
    dashboard:["Dashboard","A clear view of what is happening across your business."],
    crm:["CRM","Keep relationships, follow-ups and opportunities organised."],
    customers:["Customers","Your customer directory and relationship records."],
    quotations:["Quotations","Prepare, track and convert customer quotes."],
    invoices:["Invoices","Create and follow your sales invoices."],
    purchases:["Purchases","Keep supplier purchases in one connected flow."],
    inventory:["Inventory","Products, stock levels and movement in one place."],
    finance:["Finance","Payments, balances and business money at a glance."],
    reports:["Reports","Turn business activity into useful numbers."],
    settings:["Settings","Business preferences and workspace controls."]
  };

  workspace.esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
  workspace.icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${workspace.icons[name] || workspace.icons.dashboard}</svg>`;
  workspace.money = value => `₹${Number(value || 0).toLocaleString("en-IN", {minimumFractionDigits:0, maximumFractionDigits:2})}`;
})();
