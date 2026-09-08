(() => {
  'use strict';
  const appShell = () => document.body;
  const locale = () => window.ColorPaletteI18n?.data || window.ColorPaletteLocales?.['zh-CN'] || { ui:{}, keys:{} };
  const ui = (key, fallback = key) => String(locale().ui?.[key] ?? fallback);
  const nav = () => locale().keys?.nav || {};

  function renderShell() {
    const body = appShell();
    if (!body) return;
    const n = nav();
    const english = window.ColorPaletteI18n?.locale === 'en-US';
    const shell = body.querySelector('.topbar');
    const main = body.querySelector('#app');
    const mobile = body.querySelector('.mobile-nav');
    const footer = body.querySelector('.footer');
    if (!shell || !main || !mobile || !footer) return;

    shell.outerHTML = `
      <header class="topbar">
        <a class="brand" href="#/home" aria-label="${ui('ColorPalette 首页', 'ColorPalette Home')}"><span class="brand-mark"></span><span>ColorPalette</span></a>
        <nav class="nav" aria-label="${ui('主导航', 'Main navigation')}">
          <a data-route="home" href="#/home">${n.discover || ui('发现')}</a>
          <a data-route="extractor" href="#/extractor">${n.extractor || ui('取色')}</a>
          <a data-route="create" href="#/create">${n.create || ui('创作')}</a>
          <a data-route="library" href="#/library">${n.library || ui('颜色百科')}</a>
          <a data-route="favorites" href="#/favorites">${n.favorites || ui('收藏')}</a>
          <a data-route="workspace" href="#/workspace">${n.workspace || ui('工作区')}</a>
        </nav>
        <div class="preferences" aria-label="${ui('界面偏好设置', 'Interface preferences')}">
          <button class="preference-switch" id="language-switch" type="button" role="switch" aria-checked="${english}" title="${ui('切换中文 / English', 'Switch Chinese / English')}" data-state="${english ? 'en' : 'zh'}">
            <span class="preference-thumb" aria-hidden="true"></span><span class="preference-option">中</span><span class="preference-option">EN</span>
          </button>
          <button class="preference-switch theme-switch" id="theme-switch" type="button" role="switch" aria-checked="false" title="${ui('切换日间 / 夜间模式', 'Switch light / dark mode')}" data-state="light">
            <span class="preference-thumb" aria-hidden="true"></span><span class="preference-option" aria-label="${ui('日间模式', 'Light mode')}">☀</span><span class="preference-option" aria-label="${ui('夜间模式', 'Dark mode')}">☾</span>
          </button>
        </div>
      </header>`;

    mobile.outerHTML = `
      <nav class="mobile-nav" aria-label="${ui('移动端导航', 'Mobile navigation')}">
        <a data-route="home" href="#/home"><span>⌂</span>${n.discover || ui('发现')}</a>
        <a data-route="extractor" href="#/extractor"><span>⌁</span>${n.extractor || ui('取色')}</a>
        <a data-route="create" href="#/create"><span>＋</span>${n.create || ui('创作')}</a>
        <a data-route="favorites" href="#/favorites"><span>♡</span>${n.favorites || ui('收藏')}</a>
        <a data-route="workspace" href="#/workspace"><span>▦</span>${n.workspace || ui('工作区')}</a>
      </nav>`;
    footer.textContent = `ColorPalette · ${ui('浏览器本地优先', 'Local-first in your browser')} · ${ui('图片不会上传到服务器', 'Images are never uploaded to a server')}`;
  }

  function install() {
    renderShell();
    window.addEventListener('colorpalette:localechange', () => {
      renderShell();
      window.route?.();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
