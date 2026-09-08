/* =========================================================
   ORBIT BIZASSIST — INVOICE EXPERIENCE
   Presentation layer over the existing POS/invoice engine.
   No billing calculations or persistence are changed.
   ========================================================= */
(() => {
  "use strict";
  const decorate = () => {
    const root=document.querySelector("#pos-view");
    if(!root||root.dataset.invoiceDecorated==="1")return;
    const toolbar=root.querySelector(".pos-toolbar");
    if(!toolbar)return;
    const eyebrow=toolbar.querySelector(".eyebrow");
    const title=toolbar.querySelector("h2");
    if(eyebrow)eyebrow.textContent="Invoice workspace";
    if(title)title.textContent="Create invoice";
    const heading=toolbar.firstElementChild;
    if(heading&&!heading.querySelector(".invoice-subtitle")){const p=document.createElement("p");p.className="invoice-subtitle";p.textContent="Build, review and collect a professional invoice in one place.";heading.appendChild(p);}
    const search=root.querySelector("#pos-search");
    if(search)search.placeholder="Search products, services, SKU or barcode…";
    root.dataset.invoiceDecorated="1";
  };
  const observer=new MutationObserver(decorate);
  const start=()=>{const root=document.querySelector("#app");if(root)observer.observe(root,{childList:true,subtree:true});decorate();};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();