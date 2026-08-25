// M-TECH production completion layer
(function(){
 const $id=id=>document.getElementById(id);
 const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const fmt=(n,c='')=>`${c} ${Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`.trim();
 function toast(t){alert(t)}

 // PWA installability
 if('serviceWorker' in navigator) navigator.serviceWorker.register('../sw.js').catch(()=>{});

 // 20-minute inactivity logout for private portal.
 let idleTimer;
 function resetIdle(){clearTimeout(idleTimer);if(window.session)idleTimer=setTimeout(async()=>{try{await window.SB.auth.signOut()}catch{} alert('For security, M-TECH signed you out after 20 minutes of inactivity.');},20*60*1000)}
 ['click','touchstart','keydown','mousemove','scroll'].forEach(ev=>document.addEventListener(ev,resetIdle,{passive:true}));
 setInterval(resetIdle,60000);

 function addLoginTools(){
   const actions=document.querySelector('#loginView .actions'); if(!actions||document.getElementById('forgotBtn'))return;
   const b=document.createElement('button');b.id='forgotBtn';b.className='btn alt';b.textContent='Forgot Password';
   b.onclick=async()=>{const email=$id('loginEmail').value.trim();if(!email)return toast('Enter your email first.');const {error}=await window.SB.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});toast(error?error.message:'Password reset email requested. Check your inbox.');};
   actions.appendChild(b);
 }

 function addProductionPanels(){
   const nav=$id('nav');if(!nav||document.querySelector('[data-panel="reports"]'))return;
   const reportsBtn=document.createElement('button');reportsBtn.className='navbtn';reportsBtn.dataset.panel='reports';reportsBtn.textContent='Reports & Backup';nav.appendChild(reportsBtn);
   const usersBtn=document.createElement('button');usersBtn.className='navbtn';usersBtn.dataset.panel='users';usersBtn.textContent='User Access Control';nav.appendChild(usersBtn);
   reportsBtn.onclick=()=>{window.openPanel('reports','Reports & Backup');renderReports()};
   usersBtn.onclick=()=>{window.openPanel('users','User Access Control');renderUsers()};
   const content=document.querySelector('.content');
   content.insertAdjacentHTML('beforeend',`<section id="reports" class="panel"><div class="section-title"><h2>Reports & Backup</h2><div class="actions"><button class="btn small" id="exportAllBtn">Download Full Backup</button><button class="btn alt small" id="printReportBtn">Print Summary</button></div></div><div id="reportCards" class="cards"></div><div class="grid2" style="margin-top:14px"><div class="card"><h3>Receivables</h3><div id="receivableReport"></div></div><div class="card"><h3>Income & Expenses</h3><div id="incomeReport"></div></div></div><div class="card" style="margin-top:14px"><h3>Export Individual Records</h3><div class="actions" id="exportButtons"></div></div></section>`);
   content.insertAdjacentHTML('beforeend',`<section id="users" class="panel"><div class="section-title"><h2>User Access Control</h2><button class="btn small" id="newUserBtn">Create User Account</button></div><div class="notice">CEO/Admin controls who can enter the private management system. Disable accounts immediately when access is no longer required.</div><div id="usersTable" class="table-wrap"></div></section>`);
   $id('exportAllBtn').onclick=exportFullBackup;$id('printReportBtn').onclick=()=>window.print();$id('newUserBtn').onclick=newUser;
 }

 function csv(rows){if(!rows?.length)return '';const keys=[...new Set(rows.flatMap(r=>Object.keys(r||{})))];const cell=v=>'"'+String(typeof v==='object'?JSON.stringify(v):v??'').replace(/"/g,'""')+'"';return [keys.map(cell).join(','),...rows.map(r=>keys.map(k=>cell(r[k])).join(','))].join('\n')}
 function dl(name,text,type='text/plain'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
 function exportTable(k){dl(`M-TECH-${k}-${new Date().toISOString().slice(0,10)}.csv`,csv(window.state?.[k]||[]),'text/csv')}
 function exportFullBackup(){const keys=['requests','jobs','quotes','invoices','customers','orgs','staff','appointments','reminders','expenses','assets','services','settings','notifications','audit'];const data={business:'Mulbah Technology Solutions Liberia Ltd.',exported_at:new Date().toISOString()};keys.forEach(k=>data[k]=window.state?.[k]||[]);dl(`M-TECH-FULL-BACKUP-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(data,null,2),'application/json')}
 function renderReports(){
   const s=window.state||{}, inv=s.invoices||[], exp=s.expenses||[], req=s.requests||[], jobs=s.jobs||[];
   const usdInv=inv.filter(x=>x.currency==='USD'),lrdInv=inv.filter(x=>x.currency==='LRD');
   const usdPaid=usdInv.reduce((a,x)=>a+Number(x.paid||0),0),lrdPaid=lrdInv.reduce((a,x)=>a+Number(x.paid||0),0),usdBal=usdInv.reduce((a,x)=>a+Number(x.balance||0),0),lrdBal=lrdInv.reduce((a,x)=>a+Number(x.balance||0),0);
   const usdExp=exp.filter(x=>x.currency==='USD').reduce((a,x)=>a+Number(x.amount||0),0),lrdExp=exp.filter(x=>x.currency==='LRD').reduce((a,x)=>a+Number(x.amount||0),0);
   $id('reportCards').innerHTML=[['Total Requests',req.length],['Open Jobs',jobs.filter(x=>!['completed','closed','cancelled'].includes(x.status)).length],['USD Collected',fmt(usdPaid,'USD')],['LRD Collected',fmt(lrdPaid,'LRD')],['USD Expenses',fmt(usdExp,'USD')],['LRD Expenses',fmt(lrdExp,'LRD')],['USD Net',fmt(usdPaid-usdExp,'USD')],['LRD Net',fmt(lrdPaid-lrdExp,'LRD')]].map(x=>`<div class="card metric"><span class="muted">${x[0]}</span><b>${x[1]}</b></div>`).join('');
   $id('receivableReport').innerHTML=`<p><b>USD Outstanding:</b> ${fmt(usdBal,'USD')}</p><p><b>LRD Outstanding:</b> ${fmt(lrdBal,'LRD')}</p><p><b>Unpaid/Part-paid invoices:</b> ${inv.filter(x=>Number(x.balance)>0).length}</p>`;
   $id('incomeReport').innerHTML=`<p><b>USD collected:</b> ${fmt(usdPaid,'USD')} &nbsp; <b>Expenses:</b> ${fmt(usdExp,'USD')}</p><p><b>LRD collected:</b> ${fmt(lrdPaid,'LRD')} &nbsp; <b>Expenses:</b> ${fmt(lrdExp,'LRD')}</p>`;
   const keys=['requests','jobs','quotes','invoices','customers','orgs','staff','appointments','expenses','assets','audit'];$id('exportButtons').innerHTML=keys.map(k=>`<button class="btn alt small" data-export="${k}">Export ${k}</button>`).join('');document.querySelectorAll('[data-export]').forEach(b=>b.onclick=()=>exportTable(b.dataset.export));
 }

 async function renderUsers(){const {data,error}=await window.SB.from('profiles').select('*').order('created_at');if(error){$id('usersTable').innerHTML='<p class="error">'+safe(error.message)+'</p>';return}const rows=(data||[]).map(p=>`<tr><td><b>${safe(p.full_name||'')}</b><br><span class="muted">${safe(p.email||'')}</span></td><td>${safe(p.role)}</td><td>${p.active?'Active':'Disabled'}</td><td><div class="actions">${p.role!=='ceo'?`<button class="btn alt small" onclick="mtechToggleUser('${p.id}',${!p.active})">${p.active?'Disable':'Enable'}</button><button class="btn alt small" onclick="mtechRole('${p.id}','${safe(p.role)}')">Role</button>`:''}<button class="btn alt small" onclick="mtechResetUser('${p.id}')">Reset Password</button></div></td></tr>`);$id('usersTable').innerHTML=window.table(['User','Role','Status','Actions'],rows)}
 async function adminCall(body){const {data,error}=await window.SB.functions.invoke('mtech-admin-user',{body});if(error)throw error;if(data?.error)throw new Error(data.error);return data}
 function newUser(){window.modal('Create Management User',window.formHtml('newUserForm',[['full_name','Full Name','text',''],['email','Email','email',''],['role','Role','select','manager|staff|technician|cashier|support|admin'],['password','Temporary Password','text','']]),`<button class="btn" onclick="mtechSaveUser()">Create User</button>`)}
 window.mtechSaveUser=async()=>{try{const f=window.formData('newUserForm');await adminCall({action:'create',...f});window.closeModal();await renderUsers();toast('User account created and email confirmed.')}catch(e){toast(e.message)}};
 window.mtechToggleUser=async(id,active)=>{try{await adminCall({action:'set_active',user_id:id,active});await renderUsers()}catch(e){toast(e.message)}};
 window.mtechResetUser=async id=>{const password=prompt('Enter a new password (minimum 8 characters):');if(!password)return;try{await adminCall({action:'reset_password',user_id:id,password});toast('Password updated.')}catch(e){toast(e.message)}};
 window.mtechRole=async(id,current)=>{const role=prompt('Role: admin, manager, staff, technician, cashier, support',current);if(!role)return;try{await adminCall({action:'set_role',user_id:id,role});await renderUsers()}catch(e){toast(e.message)}};

 async function customerHistory(id){const c=(window.state?.customers||[]).find(x=>x.id===id);if(!c)return;const [rq,jb,qt,iv]=await Promise.all([window.SB.from('service_requests').select('*').eq('customer_id',id).order('created_at',{ascending:false}),window.SB.from('jobs').select('*').eq('customer_id',id).order('created_at',{ascending:false}),window.SB.from('quotations').select('*').eq('customer_id',id).order('created_at',{ascending:false}),window.SB.from('invoices').select('*').eq('customer_id',id).order('created_at',{ascending:false})]);const block=(title,arr,key)=>`<div class="card"><h3>${title}</h3>${(arr||[]).map(x=>`<div class="notice"><b>${safe(x[key]||'')}</b><br><span class="muted">${safe(x.status||'')}</span></div>`).join('')||'<p class="muted">None</p>'}</div>`;window.modal('Customer History · '+safe(c.full_name),`<div class="grid2">${block('Requests',rq.data,'request_no')}${block('Jobs',jb.data,'job_no')}${block('Quotations',qt.data,'quotation_no')}${block('Invoices',iv.data,'invoice_no')}</div>`)}
 window.mtechCustomerHistory=customerHistory;
 const originalRenderCustomers=window.renderCustomers;
 if(typeof originalRenderCustomers==='function') window.renderCustomers=function(){originalRenderCustomers();document.querySelectorAll('#customersTable tbody tr').forEach((tr,i)=>{const c=(window.state?.customers||[])[i];if(!c)return;const td=document.createElement('td');td.innerHTML=`<button class="btn alt small" onclick="mtechCustomerHistory('${c.id}')">History</button>`;tr.appendChild(td)});const h=document.querySelector('#customersTable thead tr');if(h&&!h.querySelector('.history-head')){const th=document.createElement('th');th.className='history-head';th.textContent='Actions';h.appendChild(th)}};

 // Hide one-time CEO setup after a working CEO profile exists.
 const setup=$id('setupBtn');if(setup)setup.style.display='none';
 addLoginTools();addProductionPanels();resetIdle();
})();