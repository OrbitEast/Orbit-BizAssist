/* Orbit East / Orbit Biz brand runtime
 * Keeps the selected master logo and favicon consistent across static and dynamically-rendered UI.
 */
(function(){
  'use strict';

  const LOGO = 'assets/orbit-east-logo.png';
  const FAVICON = 'assets/orbiteast favicon.jpeg';

  function setHeadBranding(){
    const icon = document.querySelector('link[rel="icon"]') || document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/jpeg';
    icon.href = FAVICON;
    if(!icon.parentNode) document.head.appendChild(icon);

    const apple = document.querySelector('link[rel="apple-touch-icon"]') || document.createElement('link');
    apple.rel = 'apple-touch-icon';
    apple.href = LOGO;
    if(!apple.parentNode) document.head.appendChild(apple);
  }

  function img(className, alt){
    const el = document.createElement('img');
    el.className = className;
    el.src = LOGO;
    el.alt = alt || 'Orbit East';
    el.decoding = 'async';
    return el;
  }

  function replaceBrand(root){
    if(!root || root.nodeType !== 1) return;

    root.querySelectorAll('.ob-brand').forEach(el => {
      if(el.dataset.brandApplied === '1') return;
      el.dataset.brandApplied = '1';
      el.replaceChildren(img('ob-brand-mark','Orbit East'));
    });

    root.querySelectorAll('.ob-side-logo').forEach(el => {
      if(el.dataset.brandApplied === '1') return;
      el.dataset.brandApplied = '1';
      el.replaceChildren(img('ob-side-mark','Orbit East'));
    });

    root.querySelectorAll('.ob-auth-brand').forEach(el => {
      if(el.dataset.brandApplied === '1') return;
      el.dataset.brandApplied = '1';
      el.replaceChildren(img('ob-auth-logo','Orbit East'));
    });

    root.querySelectorAll('.ob-onboarding-brand').forEach(el => {
      if(el.dataset.brandApplied === '1') return;
      el.dataset.brandApplied = '1';
      el.replaceChildren(img('ob-onboarding-logo','Orbit East'));
    });

    root.querySelectorAll('.workspace-brand').forEach(el => {
      if(el.dataset.brandApplied === '1') return;
      el.dataset.brandApplied = '1';
      const logoBox = el.querySelector('.workspace-logo');
      if(logoBox){
        logoBox.replaceChildren(img('ob-workspace-logo','Orbit Biz'));
      }
    });

    // Some pages render the workspace logo without the surrounding brand wrapper.
    root.querySelectorAll('.workspace-logo').forEach(el => {
      if(el.dataset.brandApplied === '1') return;
      el.dataset.brandApplied = '1';
      el.replaceChildren(img('ob-workspace-logo','Orbit Biz'));
    });
  }

  function run(){
    setHeadBranding();
    replaceBrand(document.body);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run, {once:true});
  }else{
    run();
  }

  const observer = new MutationObserver(mutations => {
    for(const mutation of mutations){
      for(const node of mutation.addedNodes){
        if(node.nodeType === 1) replaceBrand(node);
      }
    }
  });

  observer.observe(document.documentElement, {childList:true, subtree:true});
})();
