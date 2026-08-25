(function(){
const MAP={
'Computer Fundamentals':'computer-fundamentals',
'Excel & Data Skills':'excel-data-skills',
'Networking & Starlink':'networking-starlink',
'Website Development':'website-development',
'Database & ERP':'database-erp',
'Cybersecurity Foundations':'cybersecurity-foundations',
'AI & Problem Solving':'ai-problem-solving',
'Entrepreneurship & Innovation':'entrepreneurship-innovation'
};
function enhance(){const box=document.getElementById('hubLearning');if(!box)return;box.querySelectorAll('.notice').forEach(card=>{if(card.dataset.fullHandbookReady)return;const title=Object.keys(MAP).find(t=>card.textContent.includes(t));if(!title)return;const slug=MAP[title];const row=card.querySelector('div[style*="display:flex"]')||card;let actions=row.querySelector('.actions');if(!actions){actions=document.createElement('div');actions.className='actions';row.appendChild(actions)}const old=card.querySelector('[data-open-course]');if(old){old.textContent='Quick 10-Page Summary';old.classList.add('alt')}const a=document.createElement('a');a.className='btn small';a.href='./course-handbook.html?course='+encodeURIComponent(slug);a.target='_blank';a.rel='noopener';a.textContent='Open Full 60+ Page Handbook';actions.insertBefore(a,actions.firstChild);const note=Array.from(card.querySelectorAll('small')).find(x=>x.textContent.includes('10-page'));if(note)note.textContent='Full M-TECH handbook available · Quick 10-page summary also included';card.dataset.fullHandbookReady='1'})}
const obs=new MutationObserver(enhance);obs.observe(document.documentElement,{childList:true,subtree:true});setInterval(enhance,1200);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance);else enhance();
})();