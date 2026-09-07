const routes=new Set(['dashboard','invoice','documents','khata','inventory','expenses','reports','staff','settings']);
const routeFromHash=()=>{const route=window.location.hash.replace(/^#/,'')||'dashboard';return routes.has(route)?route:'dashboard'};
const navigate=route=>{const next=routes.has(route)?route:'dashboard';if(window.location.hash!==`#${next}`)window.location.hash=next;else{state.page=next;render()}};
window.addEventListener('hashchange',()=>{state.page=routeFromHash();render()});
window.AppRouter={navigate,current:routeFromHash};