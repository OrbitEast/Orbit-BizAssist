/* Orbit Biz — polished customer creation workflow */
(()=>{
  "use strict";

  const getDb=()=>{
    const C=window.OrbitBiz?.config||{};
    const client=window.OrbitBiz?.auth?.getClient?.()||window.supabase?.createClient?.(C.supabaseUrl,C.supabaseKey);
    if(!client) throw new Error("Supabase client unavailable");
    return client;
  };

  const esc=s=>String(s??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));

  function notify(message,type="success"){
    let toast=document.querySelector(".customer-ux-toast");
    if(!toast){
      toast=document.createElement("div");
      toast.className="customer-ux-toast";
      document.body.appendChild(toast);
    }
    toast.className=`customer-ux-toast ${type} show`;
    toast.innerHTML=`<span class="customer-ux-toast-icon">${type==="success"?"✓":"!"}</span><span>${esc(message)}</span>`;
    clearTimeout(toast._timer);
    toast._timer=setTimeout(()=>toast.classList.remove("show"),3000);
  }

  function closeModal(){
    const modal=document.querySelector(".customer-ux-modal");
    if(!modal)return;
    modal.classList.remove("is-open");
    setTimeout(()=>modal.remove(),150);
  }

  function field(label,name,type="text",placeholder="",attrs=""){
    return `<div class="customer-ux-field"><label for="customer-${name}">${label}</label><input id="customer-${name}" name="${name}" type="${type}" placeholder="${placeholder}" ${attrs}></div>`;
  }

  function openCustomer(){
    document.querySelectorAll(".customer-ux-modal").forEach(x=>x.remove());

    const modal=document.createElement("div");
    modal.className="customer-ux-modal is-open";
    modal.innerHTML=`
      <div class="customer-ux-backdrop" data-customer-close></div>
      <section class="customer-ux-card" role="dialog" aria-modal="true" aria-labelledby="customer-ux-title">
        <header class="customer-ux-head">
          <div class="customer-ux-title-wrap">
            <div class="customer-ux-avatar">+</div>
            <div>
              <h2 id="customer-ux-title">Add customer</h2>
              <p>Create a customer profile for your sales workflow.</p>
            </div>
          </div>
          <button class="customer-ux-close" type="button" aria-label="Close" data-customer-close>×</button>
        </header>

        <form id="customer-ux-form" class="customer-ux-form" novalidate>
          <div class="customer-ux-scroll">
            <div class="customer-ux-section">
              <div class="customer-ux-section-title">Contact details</div>
              <div class="customer-ux-grid">
                ${field("Customer name *","name","text","e.g. Rahul Traders","required autocomplete=name")}
                ${field("Company","company_name","text","Business or company name","autocomplete=organization")}
                ${field("Phone","phone","tel","+91 98765 43210","autocomplete=tel")}
                ${field("Email","email","email","name@company.com","autocomplete=email")}
              </div>
            </div>

            <div class="customer-ux-section">
              <div class="customer-ux-section-title">Business details <span>Optional</span></div>
              <div class="customer-ux-grid">
                ${field("GSTIN","gstin","text","22AAAAA0000A1Z5","maxlength=15 autocapitalize=characters")}
                ${field("Opening balance","opening_balance","number","0.00","step=0.01 min=0 inputmode=decimal value=0")}
                ${field("Credit limit","credit_limit","number","0.00","step=0.01 min=0 inputmode=decimal")}
                <div class="customer-ux-field customer-ux-notes">
                  <label for="customer-notes">Notes</label>
                  <textarea id="customer-notes" name="notes" rows="3" placeholder="Anything useful for your team…"></textarea>
                </div>
              </div>
            </div>
          </div>

          <footer class="customer-ux-footer">
            <span class="customer-ux-secure">Customer data stays in your Orbit Biz workspace.</span>
            <div class="customer-ux-actions">
              <button type="button" class="wb-btn" data-customer-close>Cancel</button>
              <button type="submit" class="wb-btn primary" id="customer-ux-save">Add customer</button>
            </div>
          </footer>
        </form>
      </section>`;

    document.body.appendChild(modal);
    document.body.classList.add("customer-ux-lock");

    const form=modal.querySelector("#customer-ux-form");
    const save=modal.querySelector("#customer-ux-save");
    const first=modal.querySelector("#customer-name");

    modal.querySelectorAll("[data-customer-close]").forEach(btn=>btn.addEventListener("click",closeModal));
    modal.addEventListener("click",e=>{if(e.target===modal.querySelector(".customer-ux-backdrop"))closeModal()});
    modal.addEventListener("animationend",()=>first?.focus(),{once:true});

    form.addEventListener("submit",async e=>{
      e.preventDefault();
      if(save.disabled)return;
      const data=new FormData(form);
      const name=String(data.get("name")||"").trim();
      if(!name){
        first?.focus();
        first?.setCustomValidity("Customer name is required");
        first?.reportValidity();
        return;
      }
      first?.setCustomValidity("");

      save.disabled=true;
      save.innerHTML='<span class="customer-ux-spinner"></span> Adding…';
      form.querySelectorAll("input,textarea").forEach(el=>el.disabled=true);

      try{
        const businessId=localStorage.getItem("orbitbiz.activeBusinessId")||"";
        if(!businessId)throw new Error("Business workspace is not ready. Please sign in again.");
        const payload={
          business_id:businessId,
          name,
          company_name:String(data.get("company_name")||"").trim()||null,
          phone:String(data.get("phone")||"").trim()||null,
          email:String(data.get("email")||"").trim()||null,
          gstin:String(data.get("gstin")||"").trim().toUpperCase()||null,
          opening_balance:Number(data.get("opening_balance")||0),
          credit_limit:Number(data.get("credit_limit")||0)||null,
          notes:String(data.get("notes")||"").trim()||null
        };
        const result=await getDb().from("customers").insert(payload);
        if(result.error)throw result.error;

        closeModal();
        notify(`${name} has been added to your customers.`);
        window.dispatchEvent(new CustomEvent("orbitbiz:customer-added",{detail:{customer:payload}}));

        const content=document.getElementById("workspace-content");
        if(content){
          const active=document.querySelector(".workspace-nav-item.active")?.dataset?.page;
          if(active==="clients"||active==="crm")window.setTimeout(()=>window.location.reload(),350);
        }
      }catch(error){
        form.querySelectorAll("input,textarea").forEach(el=>el.disabled=false);
        save.disabled=false;
        save.textContent="Add customer";
        notify(error?.message||"Could not add customer. Please try again.","error");
      }
    });

    modal.querySelectorAll("input,textarea").forEach(el=>{
      el.addEventListener("input",()=>el.setCustomValidity(""));
    });

    setTimeout(()=>first?.focus(),80);
  }

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&document.querySelector(".customer-ux-modal"))closeModal();
  });

  document.addEventListener("click",e=>{
    const target=e.target.closest?.("[data-action]");
    if(!target)return;
    const action=target.dataset.action;
    const breadcrumb=document.querySelector(".workspace-breadcrumb")?.textContent||"";
    const customerPage=/Customers|CRM/i.test(breadcrumb);
    if(action==="new-customer"||(action==="quick-add"&&customerPage)){
      e.preventDefault();
      e.stopImmediatePropagation();
      openCustomer();
    }
  },true);

  window.OrbitBiz=window.OrbitBiz||{};
  window.OrbitBiz.customerUX={open:openCustomer};
})();
