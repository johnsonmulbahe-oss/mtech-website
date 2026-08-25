(function(){
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function renderLearning(){
 if(typeof SB==='undefined')return;
 const box=document.getElementById('hubLearning'); if(!box)return;
 const {data:paths,error}=await SB.from('hub_learning_paths').select('*').eq('active',true).order('sort_order',{ascending:true});
 if(error){box.innerHTML='<p class="muted">Learning Center could not load.</p>';return;}
 if(!paths?.length){box.innerHTML='<p class="muted">No learning paths yet.</p>';return;}
 box.innerHTML=paths.map(p=>`<div class="notice" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><div><b>${esc(p.title)}</b><br><span class="muted">${esc(p.category||'Learning')} · ${esc(p.level||'All Levels')}</span><br><span class="muted">${esc(p.description||'')}</span></div><button class="btn alt small" data-open-course="${p.id}">Open Course / View Notes</button></div></div>`).join('');
 box.querySelectorAll('[data-open-course]').forEach(b=>b.onclick=()=>openCourse(b.dataset.openCourse));
}
async function openCourse(id){
 const [{data:path},{data:mods,error}]=await Promise.all([
  SB.from('hub_learning_paths').select('*').eq('id',id).maybeSingle(),
  SB.from('hub_learning_modules').select('*').eq('path_id',id).order('sort_order',{ascending:true})
 ]);
 if(error)return alert(error.message);
 const body=`<div class="notice"><b>${esc(path?.title||'Course')}</b><br><span class="muted">${esc(path?.description||'')}</span></div>
 <div style="margin-top:14px">${mods?.length?mods.map((m,i)=>`<details class="notice" ${i===0?'open':''} style="margin-bottom:10px"><summary style="cursor:pointer;font-weight:800">Lesson ${i+1}: ${esc(m.title)}</summary><div style="padding-top:10px;line-height:1.65;white-space:pre-wrap">${esc(m.content||'No notes yet.')}</div><div class="actions" style="margin-top:10px"><button class="btn alt small" onclick="navigator.clipboard&&navigator.clipboard.writeText(${JSON.stringify(m.content||'')})">Copy Notes</button><button class="btn alt small" onclick="window.print()">Print</button></div></details>`).join(''):'<p class="muted">No lessons have been added to this course yet.</p>'}</div>`;
 if(typeof modal==='function')modal('Skills & Learning Center — '+(path?.title||'Course'),body); else alert((path?.title||'Course')+'\n\n'+(mods||[]).map(m=>m.title+'\n'+m.content).join('\n\n'));
}
window.mtechOpenCourse=openCourse;
const observer=new MutationObserver(()=>{const box=document.getElementById('hubLearning');if(box&&!box.dataset.learningReady){box.dataset.learningReady='1';renderLearning();}});
observer.observe(document.documentElement,{childList:true,subtree:true});
setInterval(()=>{const hub=document.getElementById('hub'),box=document.getElementById('hubLearning');if(hub?.classList.contains('active')&&box&&!box.querySelector('[data-open-course]'))renderLearning();},1500);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',renderLearning);else setTimeout(renderLearning,300);
})();