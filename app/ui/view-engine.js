/* OrbitBiz — reusable list/search/filter/pagination engine */
(()=>{
'use strict';
const state=new WeakMap();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function mount(table){
 if(!table||state.has(table))return;
 const wrap=table.closest('.wb-table-wrap')||table.parentElement;
 if(!wrap)return;
 const rows=[...table.querySelectorAll('tbody tr')].filter(r=>!r.classList.contains('orbit-group-row'));
 if(!rows.length)return;
 const headers=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim()).filter(Boolean);
 const s={rows,query:'',page:1,size:10,group:'',sort:-1,asc:true}; state.set(table,s);
 const bar=document.createElement('div');bar.className='orbit-view-toolbar';
 bar.innerHTML=`<div class="orbit-view-search"><span>⌕</span><input type="search" placeholder="Search records…" aria-label="Search records"></div><div class="orbit-view-controls"><select aria-label="Group records"><option value="">No grouping</option>${headers.map((h,i)=>`<option value="${i}">${esc(h)}</option>`).join('')}</select><select aria-label="Rows per page"><option>10</option><option>25</option><option>50</option></select><button type="button" data-bulk disabled>Bulk action</button></div>`;
 wrap.parentElement.insertBefore(bar,wrap);
 const foot=document.createElement('div');foot.className='orbit-view-footer';foot.innerHTML='<span class="orbit-view-count"></span><div class="orbit-view-pages"></div>';wrap.parentElement.insertBefore(foot,wrap.nextSibling);
 const search=bar.querySelector('input'),group=bar.querySelector('select'),size=bar.querySelectorAll('select')[1];
 function render(){
  const q=s.query.toLowerCase(); let visible=s.rows.filter(r=>!q||r.innerText.toLowerCase().includes(q));
  if(s.sort>=0){visible.sort((a,b)=>{const A=a.cells[s.sort]?.innerText.trim()||'',B=b.cells[s.sort]?.innerText.trim()||'';return (A.localeCompare(B,undefined,{numeric:true,sensitivity:'base'}))*(s.asc?1:-1)})}
  const total=visible.length,pages=Math.max(1,Math.ceil(total/s.size));s.page=Math.min(s.page,pages);
  const start=(s.page-1)*s.size;const slice=visible.slice(start,start+s.size);
  s.rows.forEach(r=>r.style.display='none');slice.forEach(r=>r.style.display='');
  const count=foot.querySelector('.orbit-view-count');count.textContent=`${total?start+1:0}–${Math.min(start+s.size,total)} of ${total}`;
  const pg=foot.querySelector('.orbit-view-pages');pg.innerHTML='';
  for(let i=1;i<=pages;i++){if(pages>7&&i>2&&i<pages-1&&Math.abs(i-s.page)>1)continue;const b=document.createElement('button');b.textContent=i;b.className=i===s.page?'active':'';b.onclick=()=>{s.page=i;render()};pg.appendChild(b)}
  const bulk=bar.querySelector('[data-bulk]');bulk.disabled=!slice.some(r=>r.querySelector('input[type=checkbox]:checked'));
 }
 search.oninput=()=>{s.query=search.value;s.page=1;render()};group.onchange=()=>{s.group=group.value;renderGrouping(table,s,group.value);render()};size.onchange=()=>{s.size=Number(size.value);s.page=1;render()};
 table.querySelectorAll('thead th').forEach((th,i)=>{th.style.cursor='pointer';th.title='Sort';th.onclick=e=>{if(e.target.closest('input,button'))return;s.sort=i;s.asc=s.sort===i?!s.asc:true;s.page=1;render()}});
 table.addEventListener('change',()=>{bar.querySelector('[data-bulk]').disabled=!table.querySelector('tbody input[type=checkbox]:checked')});
 render();
}
function renderGrouping(table,s,index){table.querySelectorAll('.orbit-group-row').forEach(x=>x.remove());if(index==='')return;const groups=new Map();s.rows.forEach(r=>{const key=r.cells[Number(index)]?.innerText.trim()||'Unspecified';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r)});for(const [key,rows] of groups){const tr=document.createElement('tr');tr.className='orbit-group-row';tr.innerHTML=`<td colspan="${table.tHead?.rows[0]?.cells.length||1}"><strong>${esc(key)}</strong><span>${rows.length}</span></td>`;rows[0].parentElement.insertBefore(tr,rows[0]);}}
function scan(){document.querySelectorAll('.wb-table:not([data-orbit-view])').forEach(t=>{t.dataset.orbitView='1';mount(t)})}
new MutationObserver(()=>requestAnimationFrame(scan)).observe(document.body,{subtree:true,childList:true});scan();
window.OrbitViewEngine={refresh:scan};
})();
