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