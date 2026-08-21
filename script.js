const header=document.querySelector('.site-header');const navToggle=document.querySelector('.nav-toggle');const navLinks=document.querySelectorAll('.main-nav a');const body=document.body;if(header)window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>20),{passive:true});if(navToggle){navToggle.addEventListener('click',()=>{const open=body.classList.toggle('nav-open');navToggle.setAttribute('aria-expanded',String(open));navToggle.setAttribute('aria-label',open?'Close menu':'Open menu')});}navLinks.forEach(a=>a.addEventListener('click',()=>{body.classList.remove('nav-open');if(navToggle)navToggle.setAttribute('aria-expanded','false')}));const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})},{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));document.getElementById('year').textContent=new Date().getFullYear();const form=document.getElementById('request-form');form.addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('name').value.trim();const phone=document.getElementById('phone').value.trim();const service=document.getElementById('service').value;const contactMethod=document.getElementById('contact-method').value;const message=document.getElementById('message').value.trim();const packageLine=(typeof selectedPackage!=='undefined'&&selectedPackage)?`\nRequested package: ${selectedPackage}`:'';const text=`Hello M-TECH, my name is ${name}.

My contact: ${phone}
Preferred contact: ${contactMethod}
Service needed: ${service}${packageLine}

Details: ${message}

Please let me know the next step.`;window.open(`https://wa.me/231773330241?text=${encodeURIComponent(text)}`,'_blank','noopener')});const lightbox=document.querySelector('.lightbox');const lightboxImg=lightbox.querySelector('img');document.querySelectorAll('.gallery-card:not([data-project])').forEach(card=>card.addEventListener('click',()=>{lightboxImg.src=card.dataset.full;lightbox.hidden=false;document.body.style.overflow='hidden'}));function closeLb(){lightbox.hidden=true;lightboxImg.src='';document.body.style.overflow=''}lightbox.querySelector('.lightbox-close').addEventListener('click',closeLb);lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLb()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lightbox.hidden)closeLb()});
// Luxury welcome gate: skippable immediately and automatically transitions into the site.
const welcomeGate=document.getElementById('welcome');
const enterSite=document.getElementById('enter-site');
let welcomeTimer;
function enterMtech(){
  if(!welcomeGate||welcomeGate.classList.contains('is-leaving')) return;
  welcomeGate.classList.add('is-leaving');
  document.body.classList.remove('intro-active');
  clearTimeout(welcomeTimer);
  setTimeout(()=>{welcomeGate.hidden=true;},580);
}
if(welcomeGate&&enterSite){
  enterSite.addEventListener('click',enterMtech);
  welcomeTimer=setTimeout(enterMtech,2800);
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key==='Escape')&&!welcomeGate.hidden) enterMtech();});
}


// Filterable luxury portfolio and case-study modal
const portfolioCards=[...document.querySelectorAll('.portfolio-card[data-project]')];
const portfolioFilters=[...document.querySelectorAll('.portfolio-filter')];
const portfolioViewAll=document.getElementById('portfolio-view-all');
const portfolioModal=document.getElementById('portfolio-modal');
let portfolioExpanded=false;
let activePortfolioFilter='all';
function renderPortfolio(){
  portfolioCards.forEach(card=>{
    const matches=activePortfolioFilter==='all'||card.dataset.category===activePortfolioFilter;
    const allowed=activePortfolioFilter!=='all'||portfolioExpanded||card.dataset.featured==='true';
    card.hidden=!(matches&&allowed);
  });
  if(portfolioViewAll){
    if(activePortfolioFilter==='all'){
      portfolioViewAll.hidden=false;
      portfolioViewAll.innerHTML=portfolioExpanded?'Show Featured Work <span>↑</span>':'View Full Portfolio <span>↓</span>';
    }else{portfolioViewAll.hidden=true;}
  }
}
portfolioFilters.forEach(btn=>btn.addEventListener('click',()=>{
  activePortfolioFilter=btn.dataset.filter;
  portfolioFilters.forEach(b=>b.classList.toggle('is-active',b===btn));
  renderPortfolio();
}));
if(portfolioViewAll) portfolioViewAll.addEventListener('click',()=>{portfolioExpanded=!portfolioExpanded;renderPortfolio();});
renderPortfolio();
if(portfolioModal){
  const mImg=document.getElementById('portfolio-modal-image');
  const mTitle=document.getElementById('portfolio-modal-title');
  const mType=document.getElementById('portfolio-modal-type');
  const mDate=document.getElementById('portfolio-modal-date');
  const mLocation=document.getElementById('portfolio-modal-location');
  const mProblem=document.getElementById('portfolio-modal-problem');
  const mSolution=document.getElementById('portfolio-modal-solution');
  const mResult=document.getElementById('portfolio-modal-result');
  const mCta=document.getElementById('portfolio-modal-cta');
  function openPortfolio(card){
    mImg.src=card.dataset.full||'';mImg.alt=card.dataset.title||'M-TECH project';
    mTitle.textContent=card.dataset.title||'';mType.textContent=card.dataset.type||'';
    mDate.textContent=card.dataset.date||'';mLocation.textContent=card.dataset.location||'';
    mProblem.textContent=card.dataset.problem||'';mSolution.textContent=card.dataset.solution||'';mResult.textContent=card.dataset.result||'';
    const msg=`Hello M-TECH, I saw your portfolio project “${card.dataset.title||'M-TECH project'}” and I need a similar service.`;
    mCta.href=`https://wa.me/231773330241?text=${encodeURIComponent(msg)}`;
    portfolioModal.hidden=false;document.body.style.overflow='hidden';
  }
  function closePortfolio(){portfolioModal.hidden=true;mImg.src='';document.body.style.overflow='';}
  portfolioCards.forEach(card=>card.addEventListener('click',()=>openPortfolio(card)));
  portfolioModal.querySelector('.portfolio-modal__close').addEventListener('click',closePortfolio);
  portfolioModal.addEventListener('click',e=>{if(e.target===portfolioModal)closePortfolio();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!portfolioModal.hidden)closePortfolio();});
}


// Client testimonial intake: prepare a genuine testimonial for WhatsApp review.
const testimonialForm=document.getElementById('testimonial-form');
if(testimonialForm){
  testimonialForm.addEventListener('submit',e=>{
    e.preventDefault();
    const name=document.getElementById('testimonial-name').value.trim();
    const service=document.getElementById('testimonial-service').value;
    const rating=document.getElementById('testimonial-rating').value;
    const location=document.getElementById('testimonial-location').value.trim();
    const message=document.getElementById('testimonial-message').value.trim();
    const consent=document.getElementById('testimonial-consent').checked;
    if(!consent) return;
    const text=`Hello M-TECH, I would like to submit a client testimonial.

Name / Business: ${name}
Service received: ${service}
Rating: ${rating}
Location: ${location||'Not provided'}

Testimonial:
${message}

I give M-TECH permission to contact me about publishing this testimonial. Nothing should be published without final approval.`;
    window.open(`https://wa.me/231773330241?text=${encodeURIComponent(text)}`,'_blank','noopener');
  });
}


// Service package UX: preselect the relevant quotation type before scrolling to the request form.
document.querySelectorAll('.package-cta').forEach(link=>{
  link.addEventListener('click',()=>{
    const packageName=link.dataset.package;
    const serviceSelect=document.getElementById('service');
    if(serviceSelect&&packageName){
      const match=[...serviceSelect.options].find(opt=>opt.textContent.trim()===packageName);
      if(match) serviceSelect.value=match.value || match.textContent;
    }
    setTimeout(()=>{
      const nameField=document.getElementById('name');
      if(nameField) nameField.focus({preventScroll:true});
    },650);
  });
});


// Final premium UX: scroll progress, active navigation and back-to-top.
const scrollProgress=document.querySelector('#scroll-progress span');
const backToTop=document.getElementById('back-to-top');
const trackedNav=[...document.querySelectorAll('.main-nav a[href^="#"]:not(.nav-cta)')];
const trackedSections=trackedNav.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
function updatePremiumScrollUX(){
  const doc=document.documentElement;
  const max=Math.max(1,doc.scrollHeight-window.innerHeight);
  const pct=Math.min(100,Math.max(0,(window.scrollY/max)*100));
  if(scrollProgress) scrollProgress.style.width=`${pct}%`;
  if(backToTop) backToTop.classList.toggle('is-visible',window.scrollY>700);
  let current='';
  trackedSections.forEach(sec=>{if(sec.getBoundingClientRect().top<=150) current=sec.id;});
  trackedNav.forEach(a=>{
    const active=a.getAttribute('href')===`#${current}`;
    a.classList.toggle('is-active',active);
    if(active) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll',updatePremiumScrollUX,{passive:true});
window.addEventListener('resize',updatePremiumScrollUX,{passive:true});
updatePremiumScrollUX();

// Package requests carry context into the service enquiry message.
let selectedPackage='';
document.querySelectorAll('.package-cta').forEach(link=>link.addEventListener('click',()=>{selectedPackage=link.dataset.package||'';}));
if(form){
  form.addEventListener('reset',()=>{selectedPackage='';});
}


// v3.2 — Animate the full website while preserving accessibility and performance.
const motionTargets=[...document.querySelectorAll(`
  main section .section-heading,
  main section .overview-copy,
  main section .overview-cards > *,
  main section .identity-card,
  main section .values-grid > *,
  main section .objectives-card,
  main section .pillar-card,
  main section .capability-card,
  main section .service-image,
  main section .service-copy,
  main section .feature-grid > *,
  main section .service-list > *,
  main section .why-grid > *,
  main section .process-line > *,
  main section .portfolio-card,
  main section .gallery-card,
  main section .client-card,
  main section .client-trust-card,
  main section .testimonial-card,
  main section .trust-standard,
  main section .package-card,
  main section .quote-principles > *,
  main section .quotation-policy,
  main section .faq-item,
  main section .faq-side-card,
  main section .leader-card,
  main section .start-card,
  main section .contact-copy,
  main section .request-card
`)].filter((el,i,a)=>a.indexOf(el)===i);
motionTargets.forEach((el,i)=>{el.classList.add('ux-motion');el.style.setProperty('--motion-order',String(i%6));});
if('IntersectionObserver' in window){
  const motionObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('ux-visible');motionObserver.unobserve(entry.target);}});
  },{threshold:.08,rootMargin:'0px 0px -4% 0px'});
  motionTargets.forEach(el=>motionObserver.observe(el));
}else{motionTargets.forEach(el=>el.classList.add('ux-visible'));}

// Gentle pointer depth for the hero logo on pointer-capable devices.
const heroStage=document.querySelector('.logo-stage');
if(heroStage&&window.matchMedia('(pointer:fine)').matches&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  heroStage.addEventListener('pointermove',e=>{
    const r=heroStage.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    heroStage.style.transform=`perspective(900px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*7).toFixed(2)}deg) translateY(-2px)`;
  });
  heroStage.addEventListener('pointerleave',()=>{heroStage.style.transform='';});
}
