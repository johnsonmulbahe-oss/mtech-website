(function(){
 // Load cross-device resilient login patch without delaying the main page.
 if(!document.querySelector('script[data-mtech-login-resilience]')){
   const s=document.createElement('script');s.src='login-resilience.js?v=18';s.defer=true;s.dataset.mtechLoginResilience='1';document.head.appendChild(s);
 }
 // Passwordless email sign-in for existing approved users only.
 if(!document.querySelector('script[data-mtech-email-login]')){
   const s=document.createElement('script');s.src='email-login.js?v=28';s.defer=true;s.dataset.mtechEmailLogin='1';document.head.appendChild(s);
 }
 // Secure password recovery for approved CEO/staff accounts.
 if(!document.querySelector('script[data-mtech-password-recovery]')){
   const s=document.createElement('script');s.src='password-recovery.js?v=32';s.defer=true;s.dataset.mtechPasswordRecovery='1';document.head.appendChild(s);
 }
 // Serious CEO-facing integrity monitoring for runtime/network/auth/database/PWA/sync issues.
 if(!document.querySelector('script[data-mtech-system-integrity]')){
   const s=document.createElement('script');s.src='system-integrity-monitor.js?v=35';s.defer=true;s.dataset.mtechSystemIntegrity='1';document.head.appendChild(s);
 }
 // Brand + motion layer.
 if(!document.querySelector('link[data-mtech-brand-ios26]')){
   const l=document.createElement('link');l.rel='stylesheet';l.href='brand-ios26.css?v=20';l.dataset.mtechBrandIos26='1';document.head.appendChild(l);
 }
 if(!document.querySelector('link[data-mtech-mobile-fix]')){
   const l=document.createElement('link');l.rel='stylesheet';l.href='mobile-nav-fix.css?v=21';l.dataset.mtechMobileFix='1';document.head.appendChild(l);
 }
 if(!document.querySelector('link[data-mtech-safe-area]')){
   const l=document.createElement('link');l.rel='stylesheet';l.href='mobile-safe-area.css?v=31';l.dataset.mtechSafeArea='1';document.head.appendChild(l);
 }
 if(!document.querySelector('script[data-mtech-ai-float-controls]')){
   const s=document.createElement('script');s.src='ai-floating-controls.js?v=31';s.defer=true;s.dataset.mtechAiFloatControls='1';document.head.appendChild(s);
 }
 if(!document.querySelector('script[data-mtech-ceo-delete]')){
   const s=document.createElement('script');s.src='ceo-delete-controls.js?v=24';s.defer=true;s.dataset.mtechCeoDelete='1';document.head.appendChild(s);
 }
 if(!document.querySelector('script[data-mtech-website-link]')){
   const s=document.createElement('script');s.src='website-link.js?v=26';s.defer=true;s.dataset.mtechWebsiteLink='1';document.head.appendChild(s);
 }
 if(!document.querySelector('script[data-mtech-access-notify]')){
   const s=document.createElement('script');s.src='user-access-notify.js?v=27';s.defer=true;s.dataset.mtechAccessNotify='1';document.head.appendChild(s);
 }
 document.documentElement.classList.add('mtech-ios26-root');
 document.body?.classList.add('mtech-ios26');
 function installCeoRecovery(){
   let isCeo=false;try{isCeo=typeof profile!=='undefined'&&profile&&String(profile.role||'').toLowerCase()==='ceo'&&profile.active!==false}catch(_){ }
   if(!isCeo)return;
   const nav=document.getElementById('nav');
   if(nav&&!document.getElementById('mtechPasswordRecoveryAdminLink')){const a=document.createElement('a');a.id='mtechPasswordRecoveryAdminLink';a.className='navbtn';a.href='password-recovery-admin.html';a.textContent='Password Recovery Center';nav.appendChild(a)}
   if(nav&&!document.getElementById('mtechSystemAlertsLink')){const a=document.createElement('a');a.id='mtechSystemAlertsLink';a.className='navbtn';a.href='system-alert-center.html';a.textContent='CEO System Alerts';nav.appendChild(a)}
   const actions=document.querySelector('.topbar .actions');
   if(actions&&!document.getElementById('mtechPasswordRecoveryTop')){const a=document.createElement('a');a.id='mtechPasswordRecoveryTop';a.className='btn alt small';a.href='password-recovery-admin.html';a.textContent='Password Recovery';actions.insertBefore(a,actions.firstChild)}
 }
 function installGuideAndTapUX(){
   document.body?.classList.add('mtech-ios26');
   const nav=document.getElementById('nav');
   if(nav&&!document.getElementById('mtechEducationCenterLink')){
     const a=document.createElement('a');a.id='mtechEducationCenterLink';a.className='navbtn';a.href='education-center.html';a.textContent='Education & Technology Center';nav.appendChild(a);
   }
   if(nav&&!document.getElementById('mtechQrPermissionLink')){
     const a=document.createElement('a');a.id='mtechQrPermissionLink';a.className='navbtn';a.href='qr-permission-center.html';a.textContent='QR Permission & Outreach Center';nav.appendChild(a);
   }
   if(nav&&!document.getElementById('mtechUserAccessLink')){
     const a=document.createElement('a');a.id='mtechUserAccessLink';a.className='navbtn';a.href='user-access-admin.html';a.textContent='User Access & QR Invites';nav.appendChild(a);
   }
   if(nav&&!document.getElementById('mtechIndependentAILink')){
     const a=document.createElement('a');a.id='mtechIndependentAILink';a.className='navbtn';a.href='ai-workspace.html';a.textContent='Independent AI Workspace';nav.appendChild(a);
   }
   if(nav&&!document.getElementById('mtechUserGuideLink')){
     const a=document.createElement('a');a.id='mtechUserGuideLink';a.className='navbtn mtech-guide-chip';a.href='user-guide.html';a.textContent='User Guide / Help Center';nav.appendChild(a);
   }
   const actions=document.querySelector('.topbar .actions');
   if(actions&&!document.getElementById('mtechEducationTop')){
     const a=document.createElement('a');a.id='mtechEducationTop';a.className='btn alt small';a.href='education-center.html';a.textContent='Education';actions.insertBefore(a,actions.firstChild);
   }
   if(actions&&!document.getElementById('mtechOutreachTop')){
     const a=document.createElement('a');a.id='mtechOutreachTop';a.className='btn alt small';a.href='qr-permission-center.html';a.textContent='QR Outreach';actions.insertBefore(a,actions.firstChild);
   }
   if(actions&&!document.getElementById('mtechAccessTop')){
     const a=document.createElement('a');a.id='mtechAccessTop';a.className='btn alt small';a.href='user-access-admin.html';a.textContent='User Access';actions.insertBefore(a,actions.firstChild);
   }
   if(actions&&!document.getElementById('mtechAITop')){
     const a=document.createElement('a');a.id='mtechAITop';a.className='btn alt small';a.href='ai-workspace.html';a.textContent='Independent AI';actions.insertBefore(a,actions.firstChild);
   }
   if(actions&&!document.getElementById('mtechGuideTop')){
     const a=document.createElement('a');a.id='mtechGuideTop';a.className='btn alt small mtech-guide-chip';a.href='user-guide.html';a.textContent='Guide';actions.insertBefore(a,actions.firstChild);
   }
   installCeoRecovery();
   document.addEventListener('pointerdown',e=>{
     const el=e.target.closest('.btn,.navbtn,.settings-tab,.svc,button');if(!el)return;
     const r=el.getBoundingClientRect();el.style.setProperty('--x',((e.clientX-r.left)/Math.max(r.width,1)*100)+'%');el.style.setProperty('--y',((e.clientY-r.top)/Math.max(r.height,1)*100)+'%');el.classList.add('mtech-pressed');
   },{passive:true});
   ['pointerup','pointercancel','pointerleave'].forEach(type=>document.addEventListener(type,e=>e.target.closest?.('.mtech-pressed')?.classList.remove('mtech-pressed'),{passive:true}));
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installGuideAndTapUX,{once:true});else installGuideAndTapUX();
 const recoveryTimer=setInterval(()=>{installCeoRecovery();if(document.getElementById('mtechPasswordRecoveryAdminLink'))clearInterval(recoveryTimer)},1000);setTimeout(()=>clearInterval(recoveryTimer),30000);
 if(!('serviceWorker' in navigator)) return;
 let reloading=false;
 async function register(){
   try{
     const reg=await navigator.serviceWorker.register('../sw.js',{updateViaCache:'none'});
     const applyWaiting=()=>{if(reg.waiting)reg.waiting.postMessage('SKIP_WAITING')};applyWaiting();
     reg.addEventListener('updatefound',()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller){worker.postMessage('SKIP_WAITING')}})});
     setInterval(()=>reg.update().catch(()=>{}),15*60*1000);
     document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{})});
     window.addEventListener('focus',()=>reg.update().catch(()=>{}));
   }catch(e){console.warn('M-TECH update service unavailable',e)}
 }
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});
 window.addEventListener('load',register);
})();