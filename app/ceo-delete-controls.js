// M-TECH CEO-only permanent delete controls
(function(){
 const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const specs={
  requestsTable:{stateKey:'requests',table:'service_requests',label:r=>r.request_no||'customer request'},
  jobsTable:{stateKey:'jobs',table:'jobs',label:r=>r.job_no||'job'},
  quotesTable:{stateKey:'quotes',table:'quotations',label:r=>r.quotation_no||'quotation'},
  invoicesTable:{stateKey:'invoices',table:'invoices',label:r=>r.invoice_no||'invoice'},
  customersTable:{stateKey:'customers',table:'customers',label:r=>r.full_name||'customer'},
  orgsTable:{stateKey:'orgs',table:'organizations',label:r=>r.name||'organization'},
  staffTable:{stateKey:'staff',table:'staff',label:r=>r.full_name||r.staff_no||'staff record'},
  appointmentsTable:{stateKey:'appointments',table:'appointments',label:r=>r.title||'appointment'},
  remindersTable:{stateKey:'reminders',table:'reminders',label:r=>r.title||'reminder'},
  expensesTable:{stateKey:'expenses',table:'expenses',label:r=>r.description||r.category||'expense'},
  assetsTable:{stateKey:'assets',table:'assets',label:r=>r.name||r.asset_no||'asset'},
  servicesTable:{stateKey:'services',table:'service_categories',label:r=>r.name||'service category'},
  settingsTable:{stateKey:'settings',table:'app_settings',label:r=>r.key||'setting'},
  notificationsTable:{stateKey:'notifications',table:'notifications',label:r=>r.title||'notification'}
 };
 let isCEO=false;
 async function resolveCEO(){
  try{
   const {data:s}=await SB.auth.getSession();const uid=s?.session?.user?.id;if(!uid)return false;
   const {data:p}=await SB.from('profiles').select('role,active').eq('id',uid).maybeSingle();
   isCEO=!!(p?.active&&String(p.role||'').toLowerCase()==='ceo');
  }catch(_){isCEO=false}
  return isCEO;
 }
 function inject(containerId){
  if(!isCEO)return;const spec=specs[containerId],box=document.getElementById(containerId);if(!spec||!box)return;
  const rows=Array.from(box.querySelectorAll('tbody tr'));const data=(state&&state[spec.stateKey])||[];
  rows.forEach((tr,i)=>{
   const rec=data[i];if(!rec?.id||tr.querySelector('.ceo-delete-btn'))return;
   let cell=tr.lastElementChild;
   if(!cell)return;
   let holder=cell.querySelector('.actions,.qr-actions');
   if(!holder){holder=document.createElement('div');holder.className='actions';while(cell.firstChild)holder.appendChild(cell.firstChild);cell.appendChild(holder)}
   const b=document.createElement('button');b.type='button';b.className='btn danger small ceo-delete-btn';b.textContent='Delete';b.dataset.table=spec.table;b.dataset.id=rec.id;b.dataset.label=spec.label(rec);holder.appendChild(b);
  });
 }
 function injectAll(){Object.keys(specs).forEach(inject)}
 async function permanentDelete(table,id,label){
  if(!isCEO)return alert('Permanent deletion is restricted to the CEO account.');
  const first=confirm('CEO DELETE: Permanently delete “'+label+'”?\n\nThis action cannot be undone from the application.');if(!first)return;
  const phrase=prompt('Type DELETE to confirm permanent deletion.');if(phrase!=='DELETE')return alert('Deletion cancelled.');
  const {error}=await SB.from(table).delete().eq('id',id);
  if(error){alert('Delete blocked: '+error.message+'\n\nThis record may have linked business/accounting records that must be handled first.');return}
  alert('Record deleted successfully.');
  if(typeof loadAll==='function')await loadAll(true);
 }
 document.addEventListener('click',e=>{const b=e.target.closest('.ceo-delete-btn');if(!b)return;e.preventDefault();e.stopPropagation();permanentDelete(b.dataset.table,b.dataset.id,b.dataset.label||'record')});
 function wrap(name){const old=window[name]||globalThis[name];if(typeof old!=='function')return;const wrapped=function(...args){const out=old.apply(this,args);queueMicrotask(injectAll);return out};try{window[name]=wrapped}catch(_){}}
 async function start(){await resolveCEO();injectAll();const observer=new MutationObserver(()=>injectAll());document.querySelectorAll('.table-wrap').forEach(x=>observer.observe(x,{childList:true,subtree:true}));}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();