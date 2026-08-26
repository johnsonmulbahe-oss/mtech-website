// M-TECH public website and core module shortcuts; public website URL is read from editable company_profile settings.
(function(){
 const FALLBACK='https://johnsonmulbahe-oss.github.io/mtech-website/';
 async function getUrl(){
   try{
     if(globalThis.SB){
       const {data}=await SB.from('app_settings').select('value_json').eq('key','company_profile').maybeSingle();
       const u=data?.value_json?.website_url;
       if(u && /^https?:\/\//i.test(u)) return u;
     }
   }catch(_){ }
   return FALLBACK;
 }
 function addNav(nav,id,label,href){if(nav&&!document.getElementById(id)){const a=document.createElement('a');a.id=id;a.className='navbtn';a.href=href;a.textContent=label;nav.appendChild(a)}}
 function addTop(actions,id,label,href){if(actions&&!document.getElementById(id)){const a=document.createElement('a');a.id=id;a.className='btn alt small';a.href=href;a.textContent=label;actions.appendChild(a)}}
 async function install(){
   const url=await getUrl();
   const nav=document.getElementById('nav');
   if(nav&&!document.getElementById('mtechWebsiteNav')){const a=document.createElement('a');a.id='mtechWebsiteNav';a.className='navbtn';a.href=url;a.target='_blank';a.rel='noopener';a.textContent='M-TECH Website';nav.appendChild(a)}
   addNav(nav,'mtechMarketplaceNav','Technology Marketplace','marketplace.html');
   addNav(nav,'mtechSponsorsNavLite','Sponsors & Partners','sponsors-partners.html');
   const actions=document.querySelector('.topbar .actions');
   if(actions&&!document.getElementById('mtechWebsiteTop')){const a=document.createElement('a');a.id='mtechWebsiteTop';a.className='btn alt small';a.href=url;a.target='_blank';a.rel='noopener';a.textContent='Website';actions.appendChild(a)}
   addTop(actions,'mtechMarketplaceTopLite','Marketplace','marketplace.html');
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();