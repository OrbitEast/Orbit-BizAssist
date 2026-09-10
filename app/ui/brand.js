/* Orbit East / Orbit Biz — unified brand runtime */
(function(){
  'use strict';
  const LOGO='assets/orbit-east-logo.png';
  const FAVICON='assets/orbiteast favicon.jpeg';
  function setHeadBranding(){
    const icon=document.querySelector('link[rel="icon"]')||document.createElement('link');
    icon.rel='icon';icon.type='image/jpeg';icon.href=FAVICON;if(!icon.parentNode)document.head.appendChild(icon);
    const apple=document.querySelector('link[rel="apple-touch-icon"]')||document.createElement('link');
    apple.rel='apple-touch-icon';apple.href=FAVICON;if(!apple.parentNode)document.head.appendChild(apple);
  }
  function img(className,alt){const el=document.createElement('img');el.className=className;el.src=LOGO;el.alt=alt||'Orbit East';el.decoding='async';return el}
  function replaceBrand(root){
    if(!root||root.nodeType!==1)return;
    root.querySelectorAll('.ob-brand,.ob-side-logo,.ob-auth-brand,.ob-onboarding-brand,.workspace-brand').forEach(el=>{
      if(el.dataset.brandApplied==='1')return;el.dataset.brandApplied='1';
      const box=el.querySelector('.workspace-logo');
      if(el.classList.contains('workspace-brand')&&box)box.replaceChildren(img('ob-workspace-logo','Orbit Biz'));
      else if(el.classList.contains('ob-brand'))el.replaceChildren(img('ob-brand-mark','Orbit East'));
      else if(el.classList.contains('ob-side-logo'))el.replaceChildren(img('ob-side-mark','Orbit East'));
      else if(el.classList.contains('ob-auth-brand'))el.replaceChildren(img('ob-auth-logo','Orbit East'));
      else if(el.classList.contains('ob-onboarding-brand'))el.replaceChildren(img('ob-onboarding-logo','Orbit East'));
    });
    root.querySelectorAll('.workspace-logo').forEach(el=>{if(el.dataset.brandApplied==='1')return;el.dataset.brandApplied='1';el.replaceChildren(img('ob-workspace-logo','Orbit Biz'))});
  }
  function run(){setHeadBranding();replaceBrand(document.body)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)replaceBrand(n)}))).observe(document.documentElement,{childList:true,subtree:true});
})();
