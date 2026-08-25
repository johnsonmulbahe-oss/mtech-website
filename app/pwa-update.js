(function(){
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
         if(worker.state==='installed'&&navigator.serviceWorker.controller){
           worker.postMessage('SKIP_WAITING');
         }
       });
     });
     setInterval(()=>reg.update().catch(()=>{}),15*60*1000);
     document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{})});
     window.addEventListener('focus',()=>reg.update().catch(()=>{}));
   }catch(e){console.warn('M-TECH update service unavailable',e)}
 }
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
   if(reloading)return;reloading=true;location.reload();
 });
 window.addEventListener('load',register);
})();