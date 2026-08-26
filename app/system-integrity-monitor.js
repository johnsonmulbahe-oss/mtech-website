(function(){
  const STORE='mtech-system-integrity-alerts-v35';
  const MAX=80;
  let profileReady=false,isCeo=false,lastSig='';
  function now(){return new Date().toISOString()}
  function read(){try{return JSON.parse(localStorage.getItem(STORE)||'[]')}catch(_){return[]}}
  function write(a){try{localStorage.setItem(STORE,JSON.stringify(a.slice(0,MAX)))}catch(_){}}
  function record(severity,title,detail,source){
    const sig=[severity,title,detail].join('|').slice(0,500),arr=read();
    if(arr[0]&&arr[0].sig===sig&&Date.now()-new Date(arr[0].at).getTime()<10*60*1000)return;
    const item={id:(crypto.randomUUID?.()||String(Date.now())),at:now(),severity,title,detail:String(detail||'').slice(0,1200),source:source||'runtime',sig,resolved:false};
    arr.unshift(item);write(arr);updateBadge();
    if(isCeo){
      try{ if(Notification.permission==='granted') new Notification('M-TECH System Alert',{body:title+': '+item.detail.slice(0,160),tag:'mtech-system-integrity'}); }catch(_){ }
      try{ if(typeof SB!=='undefined'&&profile?.id) SB.from('notifications').insert({user_id:profile.id,title:'System Integrity Alert: '+title,body:item.detail,priority:severity==='critical'?'high':'normal',entity_type:'system_integrity'}).then(()=>{}).catch(()=>{}); }catch(_){ }
    }
  }
  function updateBadge(){
    if(!isCeo)return;
    const n=read().filter(x=>!x.resolved&&(x.severity==='critical'||x.severity==='warning')).length;
    let a=document.getElementById('mtechSystemIntegrityTop');
    const actions=document.querySelector('.topbar .actions');
    if(!actions)return;
    if(!a){a=document.createElement('a');a.id='mtechSystemIntegrityTop';a.href='system-alert-center.html';a.className='btn alt small';actions.insertBefore(a,actions.firstChild)}
    a.textContent=n?`System Alerts (${n})`:'System OK';
    a.style.borderColor=n?'#ff6b6b':'';a.style.color=n?'#ffd3d3':'';
  }
  function detectCeo(){
    try{profileReady=typeof profile!=='undefined'&&!!profile;if(profileReady){isCeo=String(profile.role||'').toLowerCase()==='ceo'&&profile.active!==false;updateBadge()}}catch(_){ }
  }
  async function health(){
    detectCeo(); if(!profileReady||!isCeo)return;
    if(!navigator.onLine){record('critical','Device Offline','This device is offline. Live M-TECH data cannot synchronize until internet service returns.','connectivity');return}
    try{const r=await fetch('management.html?health='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('Management page returned HTTP '+r.status)}catch(e){record('critical','Application Reachability Failure',e.message||String(e),'web')}
    try{if('serviceWorker' in navigator){const reg=await navigator.serviceWorker.getRegistration('../sw.js');if(!reg)record('warning','PWA Service Worker Missing','The M-TECH service worker is not registered on this device. Offline/update behavior may be impaired.','pwa')}}catch(e){record('warning','PWA Health Check Failed',e.message||String(e),'pwa')}
    try{if(typeof SB!=='undefined'){
      const s=await SB.auth.getSession();if(!s?.data?.session)record('warning','Authentication Session Missing','The CEO session is no longer active on this device. Sign in again if access was not intentionally ended.','auth');
      const q=await SB.from('app_settings').select('key').limit(1);if(q.error)throw q.error;
    }}catch(e){record('critical','Database / Authentication Service Failure',e.message||String(e),'backend')}
    try{const bad=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'';if(/queue|pending|offline/i.test(k)){const v=localStorage.getItem(k)||'';if(v&&v!=='[]'&&v!=='{}'&&v!=='0')bad.push(k)}}if(bad.length)record('warning','Pending Offline Work','Unsynchronized/offline items may still exist in: '+bad.slice(0,6).join(', '),'sync')}catch(_){ }
  }
  addEventListener('error',e=>record('warning','JavaScript Error',e.message||'Unknown browser error',e.filename||'runtime'));
  addEventListener('unhandledrejection',e=>record('warning','Unhandled Application Error',e.reason?.message||String(e.reason||'Unknown promise failure'),'runtime'));
  addEventListener('offline',()=>record('critical','Device Went Offline','Network connection was lost while M-TECH was open.','connectivity'));
  addEventListener('online',()=>{detectCeo();updateBadge()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(health,1500));else setTimeout(health,1500);
  setInterval(health,5*60*1000);
  setInterval(detectCeo,1000);setTimeout(()=>{},0);
})();