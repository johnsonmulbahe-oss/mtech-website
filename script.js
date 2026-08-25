(function(){
  const serviceCss=document.createElement('link');
  serviceCss.rel='stylesheet';
  serviceCss.href='new-services.css?v=20260825flyerviewer';
  document.head.appendChild(serviceCss);

  const mobileCss=document.createElement('link');
  mobileCss.rel='stylesheet';
  mobileCss.href='mobile-nav.css?v=20260825menu';
  document.head.appendChild(mobileCss);

  const core=document.createElement('script');
  core.src='script-core.js?v=20260825core';
  core.onload=function(){
    const menu=document.createElement('script');
    menu.src='mobile-nav.js?v=20260825menu';
    document.body.appendChild(menu);

    const extra=document.createElement('script');
    extra.src='new-services.js?v=20260825flyerviewer';
    document.body.appendChild(extra);
  };
  document.body.appendChild(core);
})();
