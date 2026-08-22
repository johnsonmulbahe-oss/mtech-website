(function(){
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='new-services.css?v=20260822cspfix';
  document.head.appendChild(css);

  const core=document.createElement('script');
  core.src='script-core.js?v=20260822cspfix';
  core.onload=function(){
    const extra=document.createElement('script');
    extra.src='new-services.js?v=20260822cspfix';
    document.body.appendChild(extra);
  };
  document.body.appendChild(core);
})();
