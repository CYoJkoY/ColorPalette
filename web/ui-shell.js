(() => {
  'use strict';
  const language = () => window.ColorPalettePreferences?.language === 'en' ? 'en-US' : 'zh-CN';
  const locale = () => window.ColorPaletteLocales?.[language()] || {ui:{}};
  const ui = key => String(locale().ui?.[key] ?? key);
  function renderShell(){
    const shell=document.body.querySelector('.topbar'),main=document.body.querySelector('#app'),mobile=document.body.querySelector('.mobile-nav'),footer=document.body.querySelector('.footer'); if(!shell||!main||!mobile||!footer)return;
    const english=language()==='en-US';
    document.documentElement.lang=english?'en':'zh-CN';
    document.title=ui('shell.documentTitle');
    const description=document.head.querySelector('meta[name="description"]'); if(description)description.content=ui('shell.documentDescription');
    shell.outerHTML=`<header class="topbar"><a class="brand" href="#/home" aria-label="${ui('shell.homeLabel')}"><span class="brand-mark"></span><span>ColorPalette</span></a><nav class="nav" aria-label="${ui('shell.mainNav')}"><a data-route="home" href="#/home">${ui('nav.discover')}</a><a data-route="extractor" href="#/extractor">${ui('nav.extractor')}</a><a data-route="create" href="#/create">${ui('nav.create')}</a><a data-route="library" href="#/library">${ui('nav.library')}</a><a data-route="favorites" href="#/favorites">${ui('nav.favorites')}</a><a data-route="workspace" href="#/workspace">${ui('nav.workspace')}</a></nav><div class="preferences" aria-label="${ui('shell.preferences')}"><button class="preference-switch" id="language-switch" type="button" role="switch" aria-checked="${english}" title="${ui('shell.language')}" data-state="${english?'en':'zh'}"><span class="preference-thumb" aria-hidden="true"></span><span class="preference-option">中</span><span class="preference-option">EN</span></button><button class="preference-switch theme-switch" id="theme-switch" type="button" role="switch" aria-checked="false" title="${ui('shell.theme')}" data-state="light"><span class="preference-thumb" aria-hidden="true"></span><span class="preference-option" aria-label="${ui('shell.lightMode')}">☀</span><span class="preference-option" aria-label="${ui('shell.darkMode')}">☾</span></button></div></header>`;
    mobile.outerHTML=`<nav class="mobile-nav" aria-label="${ui('shell.mobileNav')}"><a data-route="home" href="#/home"><span>⌂</span>${ui('nav.discover')}</a><a data-route="extractor" href="#/extractor"><span>⌁</span>${ui('nav.extractor')}</a><a data-route="create" href="#/create"><span>＋</span>${ui('nav.create')}</a><a data-route="favorites" href="#/favorites"><span>♡</span>${ui('nav.favorites')}</a><a data-route="workspace" href="#/workspace"><span>▦</span>${ui('nav.workspace')}</a></nav>`;
    footer.textContent=`ColorPalette · ${ui('shell.localFirst')} · ${ui('shell.noUpload')}`;
  }
  function install(){renderShell();window.addEventListener('colorpalette:localechange',()=>{renderShell();window.route?.();});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
