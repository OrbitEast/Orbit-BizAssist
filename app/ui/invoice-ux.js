(()=>{
  const S=window.supabase;
  let mounted=false;
  const money=n=>`₹${Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const today=()=>new Date().toISOString().slice(0,10);
  const client=()=>window.OrbitBiz?.auth?.getClient?.()||(S?.createClient?.('https://tquanlpmtvizjbdounnj.supabase.co','sb_publishable_sjDaL7MyAXoYoM1KIbYLbg_EGfo6Omq'));
  const bid=()=>localStorage.getItem('orbitbiz.activeBusinessId');
  const toast=m=>window.toast?window.toast(m):document.querySelector('.wb-toast')?.textContent=m;
  const open=async()=>{
    if(document.querySelector('.invoice-modal'))return;
    const db=client(), businessId=bid(); if(!db||!businessId)return;
    const [{data:customers},{data:items},{data:business}]=await Promise.all([
      db.from('customers').select('id,name,company_name,phone,email,gstin').eq('business_id',businessId).order('name'),
      db.from('items').select('id,name,sku,unit,selling_price,tax_rate').eq('business_id',businessId).order('name'),
      db.from('businesses').select('name,email,phone,address').eq('id',businessId).maybeSingle()
    ]);
    let lines=[{item_id:'',name:'',sku:'',unit:'pcs',quantity:1,unit_price:0,tax_rate:0}];
    const modal=document.createElement('div');modal.className='invoice-modal';
    modal.innerHTML=`<div class="invoice-dialog" role="dialog" aria-modal="true" aria-label="Create invoice">
      <div class="invoice-head"><div><span class="invoice-eyebrow">SALES</span><h2>Create invoice</h2></div><button class="invoice-close" data-close aria-label="Close">×</button></div>
      <div class="invoice-layout"><section class="invoice-form">
        <div class="invoice-section"><div class="invoice-section-title">Invoice details</div><div class="invoice-fields three">
          <label>Invoice number<input id="inv-no" value="INV-${Date.now().toString().slice(-6)}"></label>
          <label>Issue date<input id="inv-date" type="date" value="${today()}"></label>
          <label>Due date<input id="inv-due" type="date" value="${today()}"></label>
        </div></div>
        <div class="invoice-section"><div class="invoice-section-title">Customer</div><div class="customer-pick"><select id="inv-customer"><option value="">Select customer</option>${(customers||[]).map(c=>`<option value="${esc(c.id)}">${esc(c.name)}${c.company_name?' · '+esc(c.company_name):''}</option>`).join('')}</select><button type="button" id="inv-add-customer">+ Add customer</button></div><div id="customer-meta" class="invoice-meta">Choose a customer to see contact details.</div></div>
        <div class="invoice-section"><div class="invoice-section-title">Items</div><div id="invoice-lines"></div><button type="button" class="invoice-add-line" id="inv-add-line">+ Add item</button></div>
        <div class="invoice-section"><div class="invoice-section-title">Discount & payment</div><div class="invoice-fields two"><label>Discount<input id="inv-discount" type="number" min="0" step="0.01" value="0"></label><label>Amount paid<input id="inv-paid" type="number" min="0" step="0.01" value="0"></label></div></div>
        <div class="invoice-actions"><button type="button" class="invoice-secondary" data-close>Cancel</button><button type="button" class="invoice-primary" id="inv-save">Create invoice</button></div>
      </section><aside class="invoice-preview-wrap"><div class="preview-label">LIVE PREVIEW</div><div id="invoice-preview" class="invoice-paper"></div></aside></div>
    </div>`;
    document.body.appendChild(modal);
    const linesEl=modal.querySelector('#invoice-lines'); const preview=modal.querySelector('#invoice-preview');
    const lineData=()=>lines;
    const renderLines=()=>{linesEl.innerHTML=lines.map((l,i)=>`<div class="invoice-line" data-line="${i}"><div class="line-main"><select class="line-item"><option value="">Select item</option>${(items||[]).map(x=>`<option value="${esc(x.id)}" ${x.id===l.item_id?'selected':''}>${esc(x.name)}${x.sku?' · '+esc(x.sku):''}</option>`).join('')}</select><button class="line-remove" data-remove="${i}" ${lines.length===1?'disabled':''}>Remove</button></div><div class="line-fields"><label>Qty<input class="line-qty" type="number" min="0.01" step="0.01" value="${l.quantity}"></label><label>Price<input class="line-price" type="number" min="0" step="0.01" value="${l.unit_price}"></label><label>Tax %<input class="line-tax" type="number" min="0" step="0.01" value="${l.tax_rate}"></label><span class="line-total">${money(l.quantity*l.unit_price*(1+l.tax_rate/100))}</span></div></div>`).join('');
      linesEl.querySelectorAll('.line-item').forEach((el,i)=>el.onchange=()=>{const x=(items||[]).find(a=>a.id===el.value);lines[i]={...lines[i],item_id:el.value,name:x?.name||'',sku:x?.sku||'',unit:x?.unit||'pcs',unit_price:Number(x?.selling_price||0),tax_rate:Number(x?.tax_rate||0)};renderLines();renderPreview()});
      linesEl.querySelectorAll('.line-qty').forEach((el,i)=>el.oninput=()=>{lines[i].quantity=Math.max(.01,Number(el.value)||0);renderPreview()});
      linesEl.querySelectorAll('.line-price').forEach((el,i)=>el.oninput=()=>{lines[i].unit_price=Math.max(0,Number(el.value)||0);renderPreview()});
      linesEl.querySelectorAll('.line-tax').forEach((el,i)=>el.oninput=()=>{lines[i].tax_rate=Math.max(0,Number(el.value)||0);renderPreview()});
      linesEl.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{lines.splice(Number(b.dataset.remove),1);renderLines();renderPreview()});
    };
    const totals=()=>{let subtotal=0,tax=0;lines.forEach(l=>{const base=l.quantity*l.unit_price;subtotal+=base;tax+=base*l.tax_rate/100});const discount=Math.min(subtotal,Math.max(0,Number(modal.querySelector('#inv-discount').value)||0));const total=Math.max(0,subtotal+tax-discount);const paid=Math.min(total,Math.max(0,Number(modal.querySelector('#inv-paid').value)||0));return{subtotal,tax,discount,total,paid,due:Math.max(0,total-paid),status:paid>=total&&total>0?'Paid':paid>0?'Partially paid':'Unpaid'}};
    const renderPreview=()=>{const t=totals(),c=(customers||[]).find(x=>x.id===modal.querySelector('#inv-customer').value);preview.innerHTML=`<div class="paper-top"><div><div class="paper-brand">${esc(business?.name||'Your business')}</div><div class="paper-muted">${esc(business?.address||'Business address')}${business?.phone?' · '+esc(business.phone):''}</div></div><div class="paper-status ${t.status.toLowerCase().replace(' ','-')}">${t.status}</div></div><div class="paper-meta"><div><small>BILL TO</small><strong>${esc(c?.name||'Customer')}</strong><span>${esc(c?.company_name||c?.phone||'')}</span>${c?.gstin?`<span>GSTIN ${esc(c.gstin)}</span>`:''}</div><div><small>INVOICE</small><strong>${esc(modal.querySelector('#inv-no').value)}</strong><span>Issued ${esc(modal.querySelector('#inv-date').value)}</span><span>Due ${esc(modal.querySelector('#inv-due').value)}</span></div></div><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${lines.map(l=>`<tr><td>${esc(l.name||'Item')}</td><td>${l.quantity}</td><td>${money(l.unit_price)}</td><td>${money(l.quantity*l.unit_price*(1+l.tax_rate/100))}</td></tr>`).join('')}</tbody></table><div class="paper-totals"><div><span>Subtotal</span><b>${money(t.subtotal)}</b></div><div><span>Tax</span><b>${money(t.tax)}</b></div><div><span>Discount</span><b>− ${money(t.discount)}</b></div><div class="grand"><span>Total</span><b>${money(t.total)}</b></div><div><span>Paid</span><b>${money(t.paid)}</b></div><div class="outstanding"><span>Outstanding</span><b>${money(t.due)}</b></div></div>`};
    modal.querySelector('#inv-customer').onchange=()=>{const c=(customers||[]).find(x=>x.id===modal.querySelector('#inv-customer').value);modal.querySelector('#customer-meta').textContent=c?[c.company_name,c.phone,c.email,c.gstin].filter(Boolean).join(' · '):'Choose a customer to see contact details.';renderPreview()};
    ['#inv-no','#inv-date','#inv-due','#inv-discount','#inv-paid'].forEach(s=>modal.querySelector(s).oninput=renderPreview);
    modal.querySelector('#inv-add-line').onclick=()=>{lines.push({item_id:'',name:'',sku:'',unit:'pcs',quantity:1,unit_price:0,tax_rate:0});renderLines();renderPreview()};
    modal.querySelector('#inv-add-customer').onclick=()=>{modal.remove();window.OrbitBiz?.customerUX?.open?.();};
    modal.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>modal.remove());modal.addEventListener('click',e=>{if(e.target===modal)modal.remove()});
    modal.querySelector('#inv-save').onclick=async()=>{const customerId=modal.querySelector('#inv-customer').value;if(!customerId){toast('Select a customer first');return}if(lines.some(l=>!l.item_id||l.quantity<=0)){toast('Select an item and valid quantity');return}const t=totals(),btn=modal.querySelector('#inv-save');btn.disabled=true;btn.textContent='Creating…';const payload={business_id:businessId,customer_id:customerId,invoice_number:modal.querySelector('#inv-no').value.trim(),issue_date:modal.querySelector('#inv-date').value,due_date:modal.querySelector('#inv-due').value,discount:t.discount,subtotal:t.subtotal,tax_total:t.tax,total:t.total,amount_paid:t.paid,status:t.status.toLowerCase().replace('partially paid','partial')};const {data:inv,error}=await db.from('invoices').insert(payload).select('id').single();if(error){toast(error.message);btn.disabled=false;btn.textContent='Create invoice';return}const rows=lines.map(l=>{const base=l.quantity*l.unit_price;return{invoice_id:inv.id,item_id:l.item_id,description:l.name,quantity:l.quantity,unit_price:l.unit_price,tax_rate:l.tax_rate,tax_amount:base*l.tax_rate/100,line_total:base*(1+l.tax_rate/100)}});const {error:ie}=await db.from('invoice_items').insert(rows);if(ie){await db.from('invoices').delete().eq('id',inv.id);toast(ie.message);btn.disabled=false;btn.textContent='Create invoice';return}modal.remove();toast(`Invoice ${payload.invoice_number} created`);document.dispatchEvent(new CustomEvent('orbitbiz:invoice-added'));};
    renderLines();renderPreview();modal.querySelector('#inv-customer').focus();
  };
  const intercept=e=>{const b=e.target.closest?.('[data-action="new-invoice"],button[data-action="create-invoice"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();open()};
  document.addEventListener('click',intercept,true);
  const watch=()=>{if(mounted)return;if(!/invoice/i.test(document.body.innerText||''))return;if(document.querySelector('[data-action="new-invoice"]'))mounted=true};
  new MutationObserver(watch).observe(document.body,{childList:true,subtree:true});watch();
  window.OrbitBiz=window.OrbitBiz||{};window.OrbitBiz.invoiceUX={open};
})();