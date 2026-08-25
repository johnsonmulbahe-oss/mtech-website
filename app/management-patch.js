// M-TECH action-completeness patch
(function(){
  const originalAction = window.action;
  const PATCH_SB = supabase.createClient('https://vsirepejlaytbqhhikev.supabase.co','sb_publishable_vQULGJJZNtuT_MZCSqomiQ_URYS4BQp',{auth:{persistSession:true,autoRefreshToken:true}});
  const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  async function manualJobModal(){
    const {data:customers,error}=await PATCH_SB.from('customers').select('id,full_name,phone').order('full_name');
    if(error)return alert(error.message);
    const opts=['<option value="">No customer selected</option>'].concat((customers||[]).map(c=>`<option value="${c.id}">${safe(c.full_name)} · ${safe(c.phone)}</option>`)).join('');
    const body=`<div id="manualJobForm">
      <div class="field"><label>Customer</label><select id="manualJobCustomer">${opts}</select></div>
      <div class="field"><label>Status</label><select id="manualJobStatus"><option>open</option><option>scheduled</option><option>in_progress</option></select></div>
      <div class="field"><label>Priority</label><select id="manualJobPriority"><option>low</option><option selected>normal</option><option>high</option><option>urgent</option></select></div>
      <div class="field"><label>Service Method</label><select id="manualJobMethod"><option>On-Site</option><option>Remote</option><option>Customer Visit</option><option>Device Drop-off</option><option>Not Specified</option></select></div>
      <div class="field"><label>Diagnosis / Job Description</label><textarea id="manualJobDiagnosis" placeholder="Describe the work or problem..."></textarea></div>
      <div class="field"><label>Scheduled Date & Time</label><input id="manualJobScheduled" type="datetime-local"></div>
      <button class="btn" id="saveManualJobBtn" type="button">Create Manual Job</button>
    </div>`;
    if(typeof window.modal==='function') window.modal('New Manual Job',body);
    else document.getElementById('modalRoot').innerHTML=`<div class="modal-back"><div class="modal"><h2>New Manual Job</h2>${body}</div></div>`;
    setTimeout(()=>{const b=document.getElementById('saveManualJobBtn'); if(b)b.onclick=saveManualJob;},0);
  }

  async function saveManualJob(){
    const btn=document.getElementById('saveManualJobBtn');
    if(btn){btn.disabled=true;btn.textContent='Creating Job…';}
    try{
      const n=await PATCH_SB.rpc('next_mtech_job_no');
      if(n.error) throw n.error;
      const customer=document.getElementById('manualJobCustomer').value||null;
      const scheduled=document.getElementById('manualJobScheduled').value;
      const row={job_no:n.data,customer_id:customer,status:document.getElementById('manualJobStatus').value,priority:document.getElementById('manualJobPriority').value,service_method:document.getElementById('manualJobMethod').value,diagnosis:document.getElementById('manualJobDiagnosis').value||null,scheduled_at:scheduled?new Date(scheduled).toISOString():null};
      const {error}=await PATCH_SB.from('jobs').insert(row);
      if(error) throw error;
      if(typeof window.closeModal==='function')window.closeModal();
      if(typeof window.loadAll==='function')await window.loadAll(true);
      alert('Manual job '+n.data+' created successfully.');
    }catch(e){alert(e.message||String(e));if(btn){btn.disabled=false;btn.textContent='Create Manual Job';}}
  }

  window.action=async function(a,id){
    if(a==='new-job') return manualJobModal();
    if(typeof originalAction==='function'){
      const known=['view-request','quote-request','job-request','edit-job','invoice-job','pay-invoice','new-customer','new-org','new-staff','staff-doc','new-appointment','new-reminder','new-expense','new-asset','new-service','edit-service','new-setting','mark-read'];
      if(known.includes(a)) return originalAction(a,id);
    }
    alert('This action is not yet recognized: '+a+'. Please report it so M-TECH can correct it.');
  };
})();

// M-TECH performance boost: progressive/lazy module loading
(function(){
  if(typeof window.loadAll!=='function' || typeof window.openPanel!=='function') return;
  const originalLoadAll=window.loadAll;
  const originalOpenPanel=window.openPanel;
  const loadedAt=new Map();
  const TTL=45000;
  let backgroundStarted=false;

  function activePanel(){return document.querySelector('.panel.active')?.id||'dashboard'}
  function fresh(panel){const t=loadedAt.get(panel)||0;return Date.now()-t<TTL}
  function mark(panel){loadedAt.set(panel,Date.now())}
  function setTitle(text){const el=document.getElementById('pageTitle');if(el)el.textContent=text}

  async function loadPanel(panel,force=false,background=false){
    if(!force&&fresh(panel))return;
    const oldTitle=document.getElementById('pageTitle')?.textContent||'';
    if(!background)setTitle(oldTitle+' · Loading…');
    try{
      if(panel==='dashboard'){
        const [snap,requests,appointments]=await Promise.all([
          PATCH_SB.rpc('ceo_dashboard_snapshot'),
          PATCH_SB.from('service_requests').select('*,customers(full_name,phone,whatsapp,email,area)').order('created_at',{ascending:false}).limit(20),
          PATCH_SB.from('appointments').select('*').order('scheduled_at',{ascending:true}).limit(20)
        ]);
        state.metrics=snap.data||{}; state.requests=requests.data||[]; state.appointments=appointments.data||[];
        renderDashboard(); mark(panel);
      }else if(panel==='requests'){
        const {data,error}=await PATCH_SB.from('service_requests').select('*,customers(full_name,phone,whatsapp,email,area)').order('created_at',{ascending:false}).limit(60); if(error)throw error;
        state.requests=data||[]; renderRequests(); mark(panel);
      }else if(panel==='jobs'){
        const {data,error}=await PATCH_SB.from('jobs').select('*').order('created_at',{ascending:false}).limit(60);if(error)throw error;state.jobs=data||[];renderJobs();mark(panel);
      }else if(panel==='quotes'){
        const {data,error}=await PATCH_SB.from('quotations').select('*').order('created_at',{ascending:false}).limit(60);if(error)throw error;state.quotes=data||[];renderQuotes();mark(panel);
      }else if(panel==='invoices'){
        const {data,error}=await PATCH_SB.from('invoices').select('*').order('created_at',{ascending:false}).limit(60);if(error)throw error;state.invoices=data||[];renderInvoices();mark(panel);
      }else if(panel==='customers'){
        const [c,o]=await Promise.all([PATCH_SB.from('customers').select('*').order('created_at',{ascending:false}).limit(60),PATCH_SB.from('organizations').select('*').order('created_at',{ascending:false}).limit(60)]);if(c.error)throw c.error;if(o.error)throw o.error;state.customers=c.data||[];state.orgs=o.data||[];renderCustomers();mark(panel);
      }else if(panel==='staff'){
        const {data,error}=await PATCH_SB.from('staff').select('*').order('created_at',{ascending:false}).limit(60);if(error)throw error;state.staff=data||[];renderStaff();mark(panel);
      }else if(panel==='schedule'){
        const [a,r]=await Promise.all([PATCH_SB.from('appointments').select('*').order('scheduled_at',{ascending:true}).limit(60),PATCH_SB.from('reminders').select('*').order('due_at',{ascending:true}).limit(60)]);if(a.error)throw a.error;if(r.error)throw r.error;state.appointments=a.data||[];state.reminders=r.data||[];renderSchedule();mark(panel);
      }else if(panel==='finance'){
        const [e,a]=await Promise.all([PATCH_SB.from('expenses').select('*').order('expense_date',{ascending:false}).limit(60),PATCH_SB.from('assets').select('*').order('created_at',{ascending:false}).limit(60)]);if(e.error)throw e.error;if(a.error)throw a.error;state.expenses=e.data||[];state.assets=a.data||[];renderFinance();mark(panel);
      }else if(panel==='settings'){
        const [s,st]=await Promise.all([PATCH_SB.from('service_categories').select('*').order('sort_order',{ascending:true}).limit(100),PATCH_SB.from('app_settings').select('*').order('updated_at',{ascending:false}).limit(100)]);if(s.error)throw s.error;if(st.error)throw st.error;state.services=s.data||[];state.settings=st.data||[];renderSettings();mark(panel);
      }else if(panel==='notifications'){
        const [n,a]=await Promise.all([PATCH_SB.from('notifications').select('*').order('created_at',{ascending:false}).limit(60),PATCH_SB.from('audit_log').select('*').order('created_at',{ascending:false}).limit(60)]);if(n.error)throw n.error;if(a.error)throw a.error;state.notifications=n.data||[];state.audit=a.data||[];renderNotifications();mark(panel);
      }
    }catch(err){console.warn('M-TECH fast loader fallback',panel,err);if(panel===activePanel()&&!background){try{await originalLoadAll(true)}catch(_){}}
    }finally{
      if(!background&&document.getElementById('pageTitle')?.textContent.includes('Loading…'))setTitle(oldTitle);
    }
  }

  window.loadAll=async function(silent=false){return loadPanel(activePanel(),true,!!silent)};
  window.openPanel=function(id,title){originalOpenPanel(id,title);if(id&&id!=='hub')loadPanel(id,false,false)};

  function startBackgroundWarmup(){
    if(backgroundStarted)return;backgroundStarted=true;
    const queue=['requests','jobs','quotes','invoices','customers','staff','schedule','finance','settings','notifications'];
    let i=0;
    const next=()=>{
      if(document.hidden)return setTimeout(next,1500);
      if(i>=queue.length)return;
      const panel=queue[i++];
      if(!fresh(panel))loadPanel(panel,false,true).finally(()=>setTimeout(next,350)); else setTimeout(next,150);
    };
    setTimeout(next,1200);
  }

  const obs=new MutationObserver(()=>{const app=document.getElementById('appView');if(app&&!app.classList.contains('hidden'))startBackgroundWarmup()});
  obs.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class']});
  setTimeout(()=>{const app=document.getElementById('appView');if(app&&!app.classList.contains('hidden'))startBackgroundWarmup()},500);
})();