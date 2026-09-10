/* Orbit Biz — global operations interaction patch */
(()=>{
'use strict';
const p=()=>document.querySelector('.workspace-nav-item.active')?.dataset?.page||'';
document.addEventListener('click',e=>{
  const nav=e.target.closest('.workspace-nav-item[data-page]');
  if(nav&&!nav.dataset.globalPage){window.__orbitGlobalPage='';}
  const quick=e.target.closest('[data-action="quick-add"]');
  if(!quick)return;
  const page=p();
  const map={purchases:'purchase', 'vendor-payments':'vendor-payment', receipts:'receipt', quotations:'quotation', proforma:'proforma', 'purchase-orders':'purchase-order'};
  if(map[page]&&window.OrbitGlobal){e.preventDefault();e.stopImmediatePropagation();document.querySelector(`[data-global-add="${map[page]}"]`)?.click();}
},true);
})();
