(function(){
  const REDIRECT='https://johnsonmulbahe-oss.github.io/mtech-website/app/reset-password.html';
  function install(){
    const login=document.getElementById('loginView');
    const email=document.getElementById('loginEmail');
    const msg=document.getElementById('loginMsg');
    if(!login||!email||typeof SB==='undefined'||document.getElementById('mtechForgotPassword'))return;
    const actions=login.querySelector('.actions');
    if(!actions)return;
    const b=document.createElement('button');
    b.id='mtechForgotPassword';b.type='button';b.className='btn alt';b.textContent='Forgot Password?';
    actions.appendChild(b);
    const note=document.createElement('p');note.className='muted';note.style.fontSize='12px';note.textContent='Approved CEO and staff can recover access by secure email link.';actions.insertAdjacentElement('afterend',note);
    b.addEventListener('click',async()=>{
      const value=email.value.trim().toLowerCase();
      if(!value||!value.includes('@')){if(msg){msg.className='error';msg.textContent='Enter your approved email address first.'}return}
      b.disabled=true;b.textContent='Sending recovery link…';
      try{
        const {error}=await SB.auth.resetPasswordForEmail(value,{redirectTo:REDIRECT});
        if(error)throw error;
        if(msg){msg.className='muted';msg.textContent='If this email belongs to an M-TECH account, a secure password recovery link has been sent. Check Inbox and Spam/Junk.'}
      }catch(e){
        if(msg){msg.className='error';msg.textContent='Password recovery could not be sent right now. '+(e?.message||'Please try again.')}
      }finally{b.disabled=false;b.textContent='Forgot Password?'}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,250));else setTimeout(install,250);
  new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();
