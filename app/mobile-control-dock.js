(function(){
  function makeFloatingBackFriendly(){
    const b=document.getElementById('floatingBack');
    if(!b||b.dataset.mtechDocked==='1')return;
    b.dataset.mtechDocked='1';
    let dragging=false,startX=0,startY=0,startLeft=0,startTop=0,moved=false;
    const place=(x,y)=>{
      const w=b.offsetWidth||48,h=b.offsetHeight||48;
      const maxX=Math.max(6,innerWidth-w-6),maxY=Math.max(6,innerHeight-h-90);
      b.style.left=Math.min(maxX,Math.max(6,x))+'px';
      b.style.top=Math.min(maxY,Math.max(6,y))+'px';
      b.style.right='auto';b.style.bottom='auto';
      localStorage.setItem('mtech-floating-back-pos',JSON.stringify({left:b.style.left,top:b.style.top}));
    };
    try{const p=JSON.parse(localStorage.getItem('mtech-floating-back-pos')||'null');if(p?.left&&p?.top){b.style.left=p.left;b.style.top=p.top;b.style.right='auto';b.style.bottom='auto'}}catch(_){ }
    b.addEventListener('pointerdown',e=>{dragging=true;moved=false;startX=e.clientX;startY=e.clientY;const r=b.getBoundingClientRect();startLeft=r.left;startTop=r.top;b.setPointerCapture?.(e.pointerId)});
    b.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)+Math.abs(dy)>6)moved=true;if(moved){e.preventDefault();place(startLeft+dx,startTop+dy)}});
    const end=e=>{if(!dragging)return;dragging=false;b.releasePointerCapture?.(e.pointerId)};
    b.addEventListener('pointerup',end);b.addEventListener('pointercancel',end);
    b.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false}},true);
    b.addEventListener('dblclick',e=>{e.preventDefault();b.classList.toggle('mtech-collapsed');localStorage.setItem('mtech-floating-back-collapsed',b.classList.contains('mtech-collapsed')?'1':'0')});
    if(localStorage.getItem('mtech-floating-back-collapsed')==='1')b.classList.add('mtech-collapsed');
    b.title='Drag to move. Double-tap to collapse/expand.';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(makeFloatingBackFriendly,250));else setTimeout(makeFloatingBackFriendly,250);
  new MutationObserver(makeFloatingBackFriendly).observe(document.documentElement,{childList:true,subtree:true});
})();
