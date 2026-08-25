// M-TECH dynamic customer service catalog
(function(){
 const ENDPOINT='https://vsirepejlaytbqhhikev.supabase.co/functions/v1/mtech-submit?catalog=1';
 let packageMap={};
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 function ensurePackageField(){
  if(document.getElementById('packageWrap'))return;
  const problem=document.getElementById('problem')?.closest('.field');
  if(!problem)return;
  const div=document.createElement('div');div.className='field';div.id='packageWrap';div.style.display='none';
  div.innerHTML='<label>Package / Price Option <span class="muted">(optional)</span></label><select id="packageChoice" name="package_choice"><option value="">No package selected / Please advise me</option></select><div id="packageHint" class="hint"></div>';
  problem.insertAdjacentElement('afterend',div);
 }
 function redraw(){
  const services=document.getElementById('services'),problem=document.getElementById('problem'),catField=document.getElementById('categoryField');if(!services||!problem)return;
  services.innerHTML='';
  Object.keys(cats).forEach(function(n){const b=document.createElement('button');b.type='button';b.className='svc'+(n===selected?' on':'');b.innerHTML='<b>'+esc(n)+'</b>';b.onclick=function(){selected=n;if(catField)catField.value=n;redraw()};services.appendChild(b)});
  const opts=(cats[selected]||[]).slice();if(!opts.some(x=>String(x).toLowerCase()==='other / not sure'))opts.push('Other / Not Sure');problem.innerHTML=opts.map(x=>'<option>'+esc(x)+'</option>').join('');
  ensurePackageField();const wrap=document.getElementById('packageWrap'),sel=document.getElementById('packageChoice'),hint=document.getElementById('packageHint'),pkgs=packageMap[selected]||[];
  if(pkgs.length){wrap.style.display='grid';sel.innerHTML='<option value="">No package selected / Please advise me</option>'+pkgs.map(p=>'<option value="'+esc(p.name)+'">'+esc(p.name)+(p.price_usd!=null?' — USD '+Number(p.price_usd).toLocaleString():'')+(p.price_lrd!=null?' — LRD '+Number(p.price_lrd).toLocaleString():'')+'</option>').join('');sel.onchange=function(){const p=pkgs.find(x=>x.name===this.value);hint.textContent=p?(p.description||''):'M-TECH can recommend the best option after reviewing your request.'}}else{wrap.style.display='none';sel.innerHTML='<option value="">No package selected</option>';hint.textContent=''}
 }
 async function load(){try{const r=await fetch(ENDPOINT,{cache:'no-store'}),j=await r.json();if(!r.ok||!j.catalog?.length)return;const next={},pm={};j.catalog.forEach(p=>{next[p.name]=(p.subservices||[]).map(s=>s.name);pm[p.name]=p.packages||[]});cats=next;packageMap=pm;if(!cats[selected])selected=Object.keys(cats)[0]||selected;draw=redraw;redraw()}catch(e){console.warn('M-TECH catalog fallback active',e)}}
 load();
})();