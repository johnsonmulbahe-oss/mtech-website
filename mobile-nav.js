(function(){
  const header=document.querySelector('.premium-full-header');
  if(!header) return;
  const row=header.querySelector('.header-brand-row');
  const nav=header.querySelector('.full-visible-nav');
  if(!row||!nav) return;

  let btn=header.querySelector('.mobile-menu-toggle');
  if(!btn){
    btn=document.createElement('button');
    btn.type='button';
    btn.className='mobile-menu-toggle';
    btn.setAttribute('aria-label','Open menu');
    btn.setAttribute('aria-expanded','false');
    btn.innerHTML='<span></span><span></span><span></span>';
    row.appendChild(btn);
  }

  function closeMenu(){
    document.body.classList.remove('nav-open');
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label','Open menu');
  }
  function toggleMenu(){
    const open=document.body.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded',String(open));
    btn.setAttribute('aria-label',open?'Close menu':'Open menu');
  }

  btn.addEventListener('click',toggleMenu);
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape') closeMenu();});
  document.addEventListener('click',e=>{
    if(!document.body.classList.contains('nav-open')) return;
    if(header.contains(e.target)) return;
    closeMenu();
  });
  window.addEventListener('resize',()=>{if(window.innerWidth>760) closeMenu();},{passive:true});
})();