// M-TECH resilient cross-device login helper
(function(){
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const $=id=>document.getElementById(id);
  function status(text,isError=false){const el=$('loginMsg');if(!el)return;el.className=isError?'error':'muted';el.textContent=text}
  function withTimeout(promise,ms,label){return Promise.race([promise,new Promise((_,rej)=>setTimeout(()=>rej(new Error(label||'Request timed out')),ms))])}
  async function getProfile(userId){
    let lastErr=null;
    for(let attempt=1;attempt<=3;attempt++){
      try{
        status(attempt===1?'Checking your access…':`Connection is slow. Retrying access check (${attempt}/3)…`);
        const result=await withTimeout(SB.from('profiles').select('*').eq('id',userId).maybeSingle(),8000,'Access check timed out');
        if(result.error)throw result.error;
        return result.data;
      }catch(e){lastErr=e;if(attempt<3)await sleep(900*attempt)}
    }
    throw lastErr||new Error('Unable to verify access');
  }
  async function openSession(s){
    if(!s?.user)return false;
    try{
      const p=await getProfile(s.user.id);
      if(!p||!p.active){status('This account is not authorized for M-TECH management.',true);try{await SB.auth.signOut()}catch(_e){}return false}
      window.session=s;window.profile=p;
      const loginView=$('loginView'),appView=$('appView');
      if(loginView)loginView.classList.add('hidden');if(appView)appView.classList.remove('hidden');
      const userLine=$('userLine');if(userLine)userLine.textContent=`${p.full_name||s.user.email} · ${String(p.role||'user').toUpperCase()}`;
      status('Opening dashboard…');
      SB.from('profiles').update({last_login_at:new Date().toISOString()}).eq('id',s.user.id).then(()=>{}).catch(()=>{});
      try{await withTimeout(window.loadAll?window.loadAll():Promise.resolve(),12000,'Dashboard loading is taking longer than expected')}catch(e){console.warn('M-TECH dashboard warmup',e)}
      status('');return true;
    }catch(e){
      console.warn('M-TECH login access check failed',e);
      status(navigator.onLine?'Unable to complete sign-in right now. Please tap Sign In again.':'You appear to be offline. Connect to the internet and tap Sign In again.',true);
      return false;
    }
  }
  async function resilientLogin(){
    const btn=$('loginBtn');if(btn){btn.disabled=true;btn.textContent='Signing In…'}
    try{
      if(!navigator.onLine)throw new Error('No internet connection');
      status('Signing in securely…');
      const email=$('loginEmail')?.value.trim()||'',password=$('loginPassword')?.value||'';
      const res=await withTimeout(SB.auth.signInWithPassword({email,password}),10000,'Sign-in request timed out');
      if(res.error)throw res.error;
      status('Sign-in accepted. Checking access…');
      await openSession(res.data.session);
    }catch(e){
      const m=String(e?.message||e||'Sign in failed');
      status(m.includes('timed out')?'The connection is taking too long. Please try again.':m,true);
    }finally{if(btn){btn.disabled=false;btn.textContent='Sign In'}}
  }
  function install(){
    const btn=$('loginBtn');if(btn)btn.onclick=resilientLogin;
    window.mtechResilientLogin=resilientLogin;
    window.mtechOpenSession=openSession;
    // If a saved session exists but the original startup stalled, recover it here.
    setTimeout(async()=>{
      if(!$('appView')?.classList.contains('hidden'))return;
      try{const {data}=await withTimeout(SB.auth.getSession(),5000,'Session check timed out');if(data?.session)await openSession(data.session)}catch(_e){}
    },700);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
