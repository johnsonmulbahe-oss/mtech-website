(function(){
  const core=document.createElement('script');
  core.src='script-core.js?v=20260822';
  core.onload=function(){
    const extra=document.createElement('script');
    extra.src='new-services.js?v=20260822';
    document.body.appendChild(extra);
  };
  document.body.appendChild(core);
})();
