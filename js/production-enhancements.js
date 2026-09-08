/* =========================================================
   ORBIT BIZASSIST — PRODUCTION ENHANCEMENTS
   Cross-module polish, navigation helpers and data safety
   ========================================================= */
(() => {
  "use strict";
  const safe=fn=>{try{return fn()}catch(e){console.error("Orbit production enhancement:",e);return null}};
  function currentRoute(){return window.location.hash.replace(/^#/,'').split('?')[0]||'dashboard';}
  function addCustomersNav(){const nav=document.querySelector('.sidebar-nav');if(!nav||nav.querySelector('[data-route="customers"]'))return;const divider=document.createElement('div');divider.className='nav-divider';nav.parentElement?.insertBefore(divider,nav.nextElementSibling);const manage=document.querySelector('.sidebar-nav:nth-of-type(2)');if(manage){manage.insertAdjacentHTML('afterbegin','<button class="nav-item" type="button" data-route="customers" title="Customers — CRM"><span class="nav-icon" aria-hidden="true">♙</span><span class="nav-copy"><strong>Customers</strong><small>CRM</small></span></button>');}}
  function customerRoute(){if(currentRoute()!=='customers')return;const app=document.querySelector('#app');if(!app||!window.AppCustomers)return;app.querySelector('.main-content')?.querySelector('.topbar')?.insertAdjacentHTML('afterend',window.AppCustomers.view());window.AppCustomers.render();}
  function exportData(){const s=window.AppState?.get?.();if(!s)return;const blob=new Blob([JSON.stringify({...s,user:null},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`orbit-bizassist-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);window.toast?.('Backup downloaded');}
  function installBackupAction(){if(document.querySelector('[data-production-action="backup"]'))return;const settings=document.querySelector('[data-route="settings"]');if(!settings)return;settings.insertAdjacentHTML('afterend','<button class="nav-item" type="button" data-production-action="backup" title="Download a local backup"><span class="nav-icon" aria-hidden="true">↓</span><span class="nav-copy"><strong>Backup data</strong><small>Export JSON</small></span></button>');}
  document.addEventListener('click',e=>{const r=e.target.closest('[data-route="customers"]');if(r){e.preventDefault();window.location.hash='customers';return;}const a=e.target.closest('[data-production-action="backup"]');if(a){e.preventDefault();exportData();}});
  const observer=new MutationObserver(()=>{safe(addCustomersNav);safe(installBackupAction);if(currentRoute()==='customers'&&!document.querySelector('.customers-page'))safe(customerRoute);});
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(()=>safe(customerRoute),0));
  setTimeout(()=>{safe(addCustomersNav);safe(installBackupAction);safe(customerRoute);},100);
  window.OrbitProduction=Object.freeze({exportData});
})();
