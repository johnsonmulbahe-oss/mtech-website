(function(){
 // Load cross-device resilient login patch without delaying the main page.
 if(!document.querySelector('script[data-mtech-login-resilience]')){
   const s=document.createElement('script');s.src='login-resilience.js?v=18';s.defer=true;s.dataset.mtechLoginResilience='1';document.head.appendChild(s);
 }
 // Brand + motion layer. Safe to load on every management session.
 if(!document.querySelector('link[data-mtech-brand-ios26]')){
   const l=document.createElement('link');l.rel='stylesheet';l.href='brand-ios26.css?v=20';l.dataset.mtechBrandIos26='1';document.head.appendChild(l);
 }
 document.documentElement.classList.add('mtech-ios26-root');
 document.body?.classList.add('mtech-ios26');
 function installGuideAndTapUX(){
   document.body?.classList.add('mtech-ios26');
   const nav=document.getElementById('nav');
   if(nav&&!document.getElementById('mtechUserGuideLink')){
     const a=document.createElement('a');a.id='mtechUserGuideLink';a.className='navbtn mtech-guide-chip';a.href='user-guide.html';a.textContent='User Guide / Help Center';nav.appendChild(a);
   }
   const actions=document.querySelector('.topbar .actions');
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