(function(){
 // Load cross-device resilient login patch without delaying the main page.
 if(!document.querySelector('script[data-mtech-login-resilience]')){
   const s=document.createElement('script');s.src='login-resilience.js?v=18';s.defer=true;s.dataset.mtechLoginResilience='1';document.head.appendChild(s);
 }
 // Brand + motion layer. Safe to load on every management session.
 if(!document.querySelector('link[data-mtech-brand-ios26]')){
   const l=document.createElement('link');l.rel='stylesheet';l.href='brand-ios26.css?v=20';l.dataset.mtechBrandIos26='1';document.head.appendChild(l);
 }
 // iPhone/compact-screen navigation anti-jam layer.
 if(!document.querySelector('link[data-mtech-mobile-fix]')){
   const l=document.createElement('link');l.rel='stylesheet';l.href='mobile-nav-fix.css?v=21';l.dataset.mtechMobileFix='1';document.head.appendChild(l);
 }
 // CEO-only permanent delete controls for management records.
 if(!document.querySelector('script[data-mtech-ceo-delete]')){
   const s=document.createElement('script');s.src='ceo-delete-controls.js?v=24';s.defer=true;s.dataset.mtechCeoDelete='1';document.head.appendChild(s);
 }
 // Editable public website shortcut.
 if(!document.querySelector('script[data-mtech-website-link]')){
   const s=document.createElement('script');s.src='website-link.js?v=26';s.defer=true;s.dataset.mtechWebsiteLink='1';document.head.appendChild(s);
 }
 // CEO pending-user approval notifier.
 if(!document.querySelector('script[data-mtech-access-notify]')){
   const s=document.createElement('script');s.src='user-access-notify.js?v=27';s.defer=true;s.dataset.mtechAccessNotify='1';document.head.appendChild(s);
 }
 document.documentElement.classList.add('mtech-ios26-root');
 document.body?.classList.add('mtech-ios26');
 function installGuideAndTapUX(){
   document.body?.classList.add('mtech-ios26');
   const nav=document.getElementById('nav');
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
   if(actions&&!document.getElementById('mtechAccessTop')){
     const a=document.createElement('a');a.id='mtechAccessTop';a.className='btn alt small';a.href='user-access-admin.html';a.textContent='User Access';actions.insertBefore(a,actions.firstChild);
   }
   if(actions&&!document.getElementById('mtechAITop')){
     const a=document.createElement('a');a.id='mtechAITop';a.className='btn alt small';a.href='ai-workspace.html';a.textContent='Independent AI';actions.insertBefore(a,actions.firstChild);
   }
   if(actions&&!document.getElementById('mtechGuideTop')){
     const a=document.createElement('a');a.id='mtechGuideTop';a.className='btn alt small mtech-guide-chip';a.href='user-guide.html';a.textContent='Guide';actions.insertBefore(a,actions.firstChild);
   }
   document.addEventListener('pointerdown',e=>{
     const el=e.target.closest('.btn,.navbtn,.settings-tab,.svc,button');if(!el)return;
     const r=el.getBoundingClientRect();el.style.setProperty('--x',((e.clientX-r.left)/Math.max(r.width,1)*100)+'%');el.style.setProperty('--y',((e.clientY-r.top)/Math.max(r.height,1)*100)+'%');el.classList.add('mtech-pressed');
   },{passive:true});
   ['pointerup','pointercancel','pointerleave'].forEach(type=>document.addEventListener(type,e=>e.target.closest?.('.mtech-pressed')?.classList.remove('mtech-pressed'),{passive:true}));
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installGuideAndTapUX,{once:true});else installGuideAndTapUX();
 if(!('serviceWorker' in navigator)) return;
 let reloading=false;
 async function register(){
   try{
     const reg=await navigator.serviceWorker.register('../sw.js',{updateViaCache:'none'});
     const applyWaiting=()=>{if(reg.waiting)reg.waiting.postMessage('SKIP_WAITING')};
     applyWaiting();
     reg.addEventListener('updatefound',()=>{
       const worker=reg.installing;
       if(!worker)return;
       worker.addEventListener('statechange',()=>{
         if(worker.state==='installed'&&navigator.serviceWorker.controller){worker.postMessage('SKIP_WAITING')}
       });
     });
     setInterval(()=>reg.update().catch(()=>{}),15*60*1000);
     document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{})});
     window.addEventListener('focus',()=>reg.update().catch(()=>{}));
   }catch(e){console.warn('M-TECH update service unavailable',e)}
 }
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});
 window.addEventListener('load',register);
})();