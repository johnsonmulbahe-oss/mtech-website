(function(){
  const POS_KEY='mtech-ai-float-pos-v30';
  const COLLAPSE_KEY='mtech-ai-float-collapsed-v30';
  const style=document.createElement('style');
  style.textContent=`
    #mtAiFloat{touch-action:none!important;user-select:none;-webkit-user-select:none;transition:width .18s ease,height .18s ease,border-radius .18s ease,opacity .18s ease,transform .12s ease!important;z-index:96!important}
    #mtAiFloat.mtech-ai-mini{width:30px!important;height:30px!important;border-radius:999px!important;font-size:0!important;opacity:.72!important}
    #mtAiFloat.mtech-ai-mini:after{content:'✦';font-size:16px!important;line-height:30px;color:#fff}
    #mtConnection{z-index:95!important;min-width:18px!important;width:18px!important;height:18px!important;padding:0!important;border-radius:999px!important;overflow:hidden!important;gap:0!important;cursor:pointer!important;opacity:.72!important;transition:width .2s ease,padding .2s ease,opacity .2s ease!important}
    #mtConnection .mt-dot{width:8px!important;height:8px!important;margin:auto!important;flex:0 0 8px}
    #mtConnection span:last-child{display:none!important;white-space:nowrap!important}
    #mtConnection.mtech-conn-open{width:auto!important;height:auto!important;padding:8px 11px!important;gap:7px!important;opacity:1!important}
    #mtConnection.mtech-conn-open span:last-child{display:inline!important}
    @media(max-width:650px){#mtAiFloat{width:46px!important;height:46px!important;border-radius:16px!important}#mtAiFloat.mtech-ai-mini{width:28px!important;height:28px!important;border-radius:999px!important}#mtAiFloat.mtech-ai-mini:after{line-height:28px}}
  `;
  document.head.appendChild(style);

  function clamp(el,x,y){
    const r=el.getBoundingClientRect();
    const w=r.width||46,h=r.height||46;
    const safeBottom=Math.max(70,parseInt(getComputedStyle(document.documentElement).getPropertyValue('--mtech-safe-bottom'))||12);
    return {x:Math.max(6,Math.min(innerWidth-w-6,x)),y:Math.max(6,Math.min(innerHeight-h-safeBottom,y))};
  }
  function attachAI(){
    const b=document.getElementById('mtAiFloat');
    if(!b||b.dataset.mtechMovable==='1')return;
    b.dataset.mtechMovable='1';
    b.title='Drag to move. Double-tap to minimize/expand. Tap to open M-TECH AI.';
    if(localStorage.getItem(COLLAPSE_KEY)==='1')b.classList.add('mtech-ai-mini');
    try{
      const p=JSON.parse(localStorage.getItem(POS_KEY)||'null');
      if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)){
        const c=clamp(b,p.x,p.y);b.style.left=c.x+'px';b.style.top=c.y+'px';b.style.right='auto';b.style.bottom='auto';
      }
    }catch(_){ }
    let active=false,moved=false,sx=0,sy=0,sl=0,st=0;
    b.addEventListener('pointerdown',e=>{active=true;moved=false;sx=e.clientX;sy=e.clientY;const r=b.getBoundingClientRect();sl=r.left;st=r.top;b.setPointerCapture?.(e.pointerId)},true);
    b.addEventListener('pointermove',e=>{if(!active)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)+Math.abs(dy)>7)moved=true;if(!moved)return;e.preventDefault();const c=clamp(b,sl+dx,st+dy);b.style.left=c.x+'px';b.style.top=c.y+'px';b.style.right='auto';b.style.bottom='auto';localStorage.setItem(POS_KEY,JSON.stringify(c))},{passive:false,capture:true});
    const end=e=>{if(!active)return;active=false;b.releasePointerCapture?.(e.pointerId)};
    b.addEventListener('pointerup',end,true);b.addEventListener('pointercancel',end,true);
    b.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false}},true);
    b.addEventListener('dblclick',e=>{e.preventDefault();e.stopImmediatePropagation();b.classList.toggle('mtech-ai-mini');localStorage.setItem(COLLAPSE_KEY,b.classList.contains('mtech-ai-mini')?'1':'0')},true);
  }
  function attachConnection(){
    const c=document.getElementById('mtConnection');
    if(!c||c.dataset.mtechCompact==='1')return;
    c.dataset.mtechCompact='1';c.title='Tap to show connection status';
    let timer;
    c.addEventListener('click',()=>{c.classList.toggle('mtech-conn-open');clearTimeout(timer);if(c.classList.contains('mtech-conn-open'))timer=setTimeout(()=>c.classList.remove('mtech-conn-open'),3500)});
  }
  function init(){attachAI();attachConnection()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,500));else setTimeout(init,500);
  new MutationObserver(init).observe(document.documentElement,{childList:true,subtree:true});
  addEventListener('resize',()=>{const b=document.getElementById('mtAiFloat');if(!b||b.style.left==='')return;const r=b.getBoundingClientRect(),c=clamp(b,r.left,r.top);b.style.left=c.x+'px';b.style.top=c.y+'px';localStorage.setItem(POS_KEY,JSON.stringify(c))});
})();
