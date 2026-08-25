// M-TECH dynamic customer service catalog — resilient cached edition
(function(){
 // Apply the same M-TECH brand/motion layer to the public customer request experience.
 try{if(!document.querySelector('link[data-mtech-brand-ios26]')){const l=document.createElement('link');l.rel='stylesheet';l.href='brand-ios26.css?v=20';l.dataset.mtechBrandIos26='1';document.head.appendChild(l)}document.body?.classList.add('mtech-ios26')}catch(_){ }
 const ENDPOINT='https://vsirepejlaytbqhhikev.supabase.co/functions/v1/mtech-submit?catalog=1';
 const CACHE_KEY='mtech-service-catalog-v2';
 let packageMap={};
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const baseFallback=(typeof cats!=='undefined'&&cats)?JSON.parse(JSON.stringify(cats)):{};
 Object.assign(baseFallback,{
  'Graphic Design ':['Logo Design','Flyer / Poster Design','Business Card Design','Social Media Graphic','Banner / Billboard Design','Certificate Design','Letterhead / Company Document Design','QR Code Poster Design','Photo Editing / Retouching','Other Graphic Design','Other / Not Sure'],
  'IT Support & Consultation':['Remote IT Support','On-Site IT Support','Technology Consultation','Business IT Setup','Urgent IT Support','General Troubleshooting','IT Assessment / Recommendation','Training & User Support','Other / Not Sure']
 });
 function ensurePackageField(){
  if(document.getElementById('packageWrap'))return;
  const problem=document.getElementById('problem')?.closest('.field');if(!problem)return;
  const div=document.createElement('div');div.className='field';div.id='packageWrap';div.style.display='none';
  div.innerHTML='<label>Package / Price Option <span class="muted">(optional)</span></label><select id="packageChoice" name="package_choice"><option value="">No package selected / Please advise me</option></select><div id="packageHint" class="hint"></div>';
  problem.insertAdjacentElement('afterend',div);
 }
 function redraw(){
  const services=document.getElementById('services'),problem=document.getElementById('problem'),catField=document.getElementById('categoryField');if(!services||!problem)return;
  services.innerHTML='';
  Object.keys(cats).forEach(function(n){const b=document.createElement('button');b.type='button';b.className='svc'+(n===selected?' on':'');b.innerHTML='<b>'+esc(n.trim())+'</b>';b.onclick=function(){selected=n;if(catField)catField.value=n.trim();redraw()};services.appendChild(b)});
  let opts=(cats[selected]||baseFallback[selected]||[]).slice();if(!opts.length)opts=['Other / Not Sure'];if(!opts.some(x=>String(x).toLowerCase()==='other / not sure'))opts.push('Other / Not Sure');problem.innerHTML=opts.map(x=>'<option>'+esc(x)+'</option>').join('');
  ensurePackageField();const wrap=document.getElementById('packageWrap'),sel=document.getElementById('packageChoice'),hint=document.getElementById('packageHint'),pkgs=packageMap[selected]||[];
  if(pkgs.length){wrap.style.display='grid';sel.innerHTML='<option value="">No package selected / Please advise me</option>'+pkgs.map(p=>'<option value="'+esc(p.name)+'">'+esc(p.name)+(p.price_usd!=null?' — USD '+Number(p.price_usd).toLocaleString():'')+(p.price_lrd!=null?' — LRD '+Number(p.price_lrd).toLocaleString():'')+'</option>').join('');sel.onchange=function(){const p=pkgs.find(x=>x.name===this.value);hint.textContent=p?(p.description||''):'M-TECH can recommend the best option after reviewing your request.'}}else{wrap.style.display='none';sel.innerHTML='<option value="">No package selected</option>';hint.textContent=''}
 }
 function applyCatalog(list){
  if(!Array.isArray(list)||!list.length)return false;const previous=(typeof cats!=='undefined'&&cats)?cats:{};const next={},pm={};
  list.forEach(p=>{const fetched=(p.subservices||[]).map(s=>s.name).filter(Boolean);next[p.name]=fetched.length?fetched:(previous[p.name]||baseFallback[p.name]||['Other / Not Sure']);pm[p.name]=p.packages||[]});
  cats=next;packageMap=pm;if(!cats[selected])selected=Object.keys(cats)[0]||selected;draw=redraw;redraw();return true;
 }
 try{const cached=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');if(cached?.catalog)applyCatalog(cached.catalog)}catch(_){ }
 async function load(){try{const r=await fetch(ENDPOINT,{cache:'no-store'}),j=await r.json();if(!r.ok||!j.catalog?.length)return;if(applyCatalog(j.catalog))try{localStorage.setItem(CACHE_KEY,JSON.stringify({catalog:j.catalog,saved_at:Date.now()}))}catch(_){}}catch(e){console.warn('M-TECH catalog fallback active',e)}}
 load();
})();