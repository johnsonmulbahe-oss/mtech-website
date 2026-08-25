// M-TECH approved-user passwordless email sign-in
(function(){
 'use strict';
 const REDIRECT='https://johnsonmulbahe-oss.github.io/mtech-website/app/management.html';
 function el(id){return document.getElementById(id)}
 function status(text,error=false){const m=el('loginMsg');if(!m)return;m.className=error?'error':'muted';m.textContent=text}
 async function sendEmailLink(){
   const email=String(el('loginEmail')?.value||'').trim().toLowerCase();
   if(!email){status('Enter your approved email address first.',true);return}
   const b=el('emailLinkBtn');if(b)b.disabled=true;
   status('Sending secure sign-in link…');
   try{
     const {error}=await SB.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:REDIRECT}});
     if(error){
       // Avoid exposing whether an email exists when possible; show useful provider/rate errors only.
       const msg=String(error.message||'').toLowerCase();
       if(msg.includes('rate')||msg.includes('email')||msg.includes('redirect')) status(error.message,true);
       else status('If this email is an approved M-TECH account, a secure sign-in link will be sent.');
       return;
     }
     status('Check your email for the M-TECH secure sign-in link. The link is one-time use.');
   }catch(e){status('Connection interrupted. Please check internet access and try again.',true)}
   finally{if(b)b.disabled=false}
 }
 function install(){
   const card=document.querySelector('#loginView .login-card');if(!card||el('emailLinkBtn'))return;
   const actions=card.querySelector('.actions');if(!actions)return;
   const divider=document.createElement('div');divider.id='emailLoginDivider';divider.style.cssText='display:flex;align-items:center;gap:10px;margin:14px 0;color:#8fa0c3;font-size:12px;font-weight:800;letter-spacing:.05em';divider.innerHTML='<span style="height:1px;background:#33415f;flex:1"></span><span>OR</span><span style="height:1px;background:#33415f;flex:1"></span>';
   const btn=document.createElement('button');btn.id='emailLinkBtn';btn.type='button';btn.className='btn alt';btn.style.width='100%';btn.textContent='Email Me a Secure Sign-In Link';btn.addEventListener('click',sendEmailLink);
   const note=document.createElement('p');note.id='emailLoginNote';note.className='muted';note.style.cssText='font-size:12px;line-height:1.45;margin-top:8px';note.textContent='For existing approved M-TECH users only. This option does not create a new account.';
   actions.insertAdjacentElement('afterend',divider);divider.insertAdjacentElement('afterend',btn);btn.insertAdjacentElement('afterend',note);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();