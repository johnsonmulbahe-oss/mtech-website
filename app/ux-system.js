// M-TECH system-wide UX/navigation + owner settings layer
(function(){
  const $=id=>document.getElementById(id);
  let panelStack=['dashboard'];
  let suppressPush=false;

  function activePanel(){return document.querySelector('.panel.active')?.id||'dashboard'}
  function titleFor(id){return document.querySelector(`.navbtn[data-panel="${id}"]`)?.textContent?.trim()||id}

  function ensureBackButton(){
    const bar=document.querySelector('.topbar'); if(!bar||$('mtechBackBtn'))return;
    const b=document.createElement('button');
    b.id='mtechBackBtn'; b.className='btn alt small mtech-back'; b.type='button'; b.innerHTML='‹ <span>Back</span>';
    b.onclick=goBack;
    bar.insertBefore(b,bar.firstChild);
    updateBack();
  }
  function updateBack(){const b=$('mtechBackBtn');if(b)b.style.visibility=(panelStack.length>1||document.querySelector('.modal-back'))?'visible':'hidden'}
  function goBack(){
    if(document.querySelector('.modal-back')){window.closeModal?.();updateBack();return}
    if(panelStack.length>1){panelStack.pop();const prev=panelStack[panelStack.length-1];suppressPush=true;window.openPanel(prev,titleFor(prev));suppressPush=false;history.replaceState({panel:prev},'',`#${prev}`);updateBack();return}
    window.openPanel?.('dashboard','Dashboard');
  }

  const originalOpen=window.openPanel;
  if(typeof originalOpen==='function'){
    window.openPanel=function(id,title){
      const current=activePanel();
      if(!suppressPush&&id!==current){
        if(panelStack[panelStack.length-1]!==id) panelStack.push(id);
        history.pushState({panel:id},'',`#${id}`);
      }
      originalOpen(id,title);updateBack();
      window.scrollTo({top:0,behavior:'smooth'});
    }
  }
  window.addEventListener('popstate',e=>{
    if(document.querySelector('.modal-back')){window.closeModal?.();updateBack();return}
    const id=e.state?.panel||location.hash.replace('#','')||'dashboard';
    if(document.getElementById(id)){suppressPush=true;originalOpen?.(id,titleFor(id));suppressPush=false;if(panelStack[panelStack.length-1]!==id)panelStack.push(id);updateBack()}
  });

  const originalModal=window.modal;
  if(typeof originalModal==='function')window.modal=function(...args){originalModal(...args);history.pushState({modal:true},'','#modal');updateBack()};
  const originalClose=window.closeModal;
  if(typeof originalClose==='function')window.closeModal=function(){originalClose();updateBack()};

  function settingObject(key){return (window.state?.settings||[]).find(s=>s.key===key)?.value_json||{}}
  async function saveSetting(key,value){
    const {error}=await window.SB.from('app_settings').upsert({key,value_json:value,updated_at:new Date().toISOString()},{onConflict:'key'});
    if(error)throw error; await window.loadAll(true);
  }

  function addOwnerControl(){
    const settings=document.getElementById('settings'); if(!settings||$('ownerControlCenter'))return;
    settings.insertAdjacentHTML('afterbegin',`<div id="ownerControlCenter" class="owner-control card">
      <div class="section-title"><div><div class="brand-motto">CEO CONTROL CENTER</div><h2>Editable Business & System Settings</h2><p class="muted">Change company identity, business defaults, documents and customer portal behavior without editing code.</p></div><button class="btn danger small" id="freshStartBtn">Fresh Start</button></div>
      <div class="settings-tabs">
        <button class="settings-tab active" data-stab="company">Company</button><button class="settings-tab" data-stab="business">Business Defaults</button><button class="settings-tab" data-stab="documents">Documents</button><button class="settings-tab" data-stab="portal">Customer Portal</button><button class="settings-tab" data-stab="system">System</button>
      </div><div id="settingsEditor"></div></div>`);
    document.querySelectorAll('.settings-tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.settings-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderSettingsEditor(b.dataset.stab)});
    $('freshStartBtn').onclick=freshStart;
    renderSettingsEditor('company');
  }

  function input(name,label,value,type='text'){return `<div class="field"><label>${label}</label><input name="${name}" type="${type}" value="${String(value??'').replace(/"/g,'&quot;')}"></div>`}
  function check(name,label,value){return `<label class="toggle-row"><span>${label}</span><input name="${name}" type="checkbox" ${value?'checked':''}><i></i></label>`}
  function editorForm(key,fields){$('settingsEditor').innerHTML=`<form id="ownerSettingsForm" class="settings-form">${fields}<button class="btn" type="submit">Save Changes</button><span id="settingSaveMsg" class="muted"></span></form>`;$('ownerSettingsForm').onsubmit=async e=>{e.preventDefault();const base=settingObject(key),f=new FormData(e.currentTarget),out={...base};e.currentTarget.querySelectorAll('[name]').forEach(el=>{if(el.type==='checkbox')out[el.name]=el.checked;else if(el.type==='number')out[el.name]=el.value===''?null:Number(el.value);else out[el.name]=el.value});$('settingSaveMsg').textContent='Saving…';try{await saveSetting(key,out);$('settingSaveMsg').textContent='Saved successfully.'}catch(err){$('settingSaveMsg').textContent=err.message}}}

  function renderSettingsEditor(tab){
    if(tab==='company'){const v=settingObject('company_profile');return editorForm('company_profile',`<div class="grid2">${input('company_name','Company Name',v.company_name)}${input('short_name','Short Name',v.short_name)}${input('motto','Motto',v.motto)}${input('slogan','Slogan',v.slogan)}${input('main_phone','Main Phone',v.main_phone)}${input('secondary_phone','Secondary Phone',v.secondary_phone)}${input('whatsapp','WhatsApp',v.whatsapp)}${input('business_email','Business Email',v.business_email,'email')}${input('ceo_name','CEO Name',v.ceo_name)}${input('ceo_email','CEO Email',v.ceo_email,'email')}</div>`)}
    if(tab==='business'){const v=settingObject('business_defaults');return editorForm('business_defaults',`<div class="grid2">${input('default_currency','Default Currency',v.default_currency)}${input('quotation_valid_days','Quotation Valid Days',v.quotation_valid_days,'number')}${input('invoice_due_days','Default Invoice Due Days',v.invoice_due_days,'number')}${input('warranty_days','Default Warranty Days',v.warranty_days,'number')}${input('inactivity_minutes','Auto Logout Minutes',v.inactivity_minutes,'number')}</div>`)}
    if(tab==='documents'){const v=settingObject('document_settings');return editorForm('document_settings',`<div class="grid2">${input('quote_prefix','Quotation Prefix',v.quote_prefix)}${input('invoice_prefix','Invoice Prefix',v.invoice_prefix)}${input('receipt_prefix','Receipt Prefix',v.receipt_prefix)}${input('job_prefix','Job Prefix',v.job_prefix)}</div>${check('show_logo','Show Logo on Documents',v.show_logo)}${check('show_motto','Show Motto',v.show_motto)}${check('show_slogan','Show Slogan',v.show_slogan)}`)}
    if(tab==='portal'){const v=settingObject('customer_portal');return editorForm('customer_portal',`${check('photos_enabled','Allow Customer Photos',v.photos_enabled)}${check('voice_enabled','Allow Voice Description',v.voice_enabled)}${check('video_enabled','Allow Video Evidence',v.video_enabled)}<div class="grid2">${input('max_photos','Maximum Photos',v.max_photos,'number')}${input('max_video_mb','Maximum Video Size (MB)',v.max_video_mb,'number')}</div><div class="field"><label>Thank You Message</label><textarea name="thank_you_message">${v.thank_you_message||''}</textarea></div>`)}
    const v=settingObject('business_defaults');return editorForm('business_defaults',`${input('inactivity_minutes','Automatic Logout Minutes',v.inactivity_minutes,'number')}<div class="notice">Automatic web-app updates are enabled. Installed Android/iPhone home-screen apps use the same live system and do not need to be downloaded again after normal updates.</div><div class="notice">Fresh Start never deletes your CEO login, application code, logo, or database structure.</div>`)
  }

  async function freshStart(){
    if((window.profile?.role||'').toLowerCase()!=='ceo'&&(window.profile?.role||'').toLowerCase()!=='admin')return alert('CEO/Admin only.');
    const first=confirm('Fresh Start will permanently remove operational business records such as requests, jobs, quotations, invoices, payments, customers, staff records, expenses and assets. Your CEO login and the application itself will remain. Continue?');if(!first)return;
    const phrase=prompt('Type exactly: FRESH START M-TECH');if(phrase!=='FRESH START M-TECH')return alert('Fresh Start cancelled. Confirmation phrase did not match.');
    const resetSettings=confirm('Also reset editable application settings? Press Cancel to keep your current M-TECH settings.');
    const final=confirm('FINAL CONFIRMATION: This cannot be undone from the app. Proceed with Fresh Start?');if(!final)return;
    const {data,error}=await window.SB.rpc('mtech_fresh_start',{p_confirmation:phrase,p_reset_settings:resetSettings});if(error)return alert(error.message);alert('Fresh Start completed. The system is ready for new business records.');await window.loadAll(true);renderSettingsEditor('company');
  }

  const originalRenderSettings=window.renderSettings;
  if(typeof originalRenderSettings==='function')window.renderSettings=function(){originalRenderSettings();addOwnerControl()};

  // Floating back control on small screens.
  function addFloatingBack(){if($('floatingBack'))return;const b=document.createElement('button');b.id='floatingBack';b.className='floating-back';b.innerHTML='‹';b.setAttribute('aria-label','Back');b.onclick=goBack;document.body.appendChild(b)}
  ensureBackButton();addFloatingBack();addOwnerControl();history.replaceState({panel:activePanel()},'',`#${activePanel()}`);
})();