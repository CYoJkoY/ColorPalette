(() => {
  'use strict';

  const language = () => window.ColorPalettePreferences?.language === 'en' ? 'en-US' : 'zh-CN';
  const locale = () => window.ColorPaletteLocales?.[language()] || {ui:{}};
  const ui = key => String(locale().ui?.[key] ?? key);
  const navItems = [
    ['home', 'nav.discover'],
    ['extractor', 'nav.extractor'],
    ['create', 'nav.create'],
    ['library', 'nav.library'],
    ['favorites', 'nav.favorites'],
    ['workspace', 'nav.workspace']
  ];

  function updateMetadata() {
    const english = language() === 'en-US';
    document.documentElement.lang = english ? 'en' : 'zh-CN';
    document.title = ui('shell.documentTitle');
    const description = document.head.querySelector('meta[name="description"]');
    if (description) description.content = ui('shell.documentDescription');
  }

  function syncActiveNav() {
    const route = (location.hash.replace(/^#\/?/, '').split('?')[0] || 'home').replace(/^\/+|\/+$/g, '') || 'home';
    document.querySelectorAll('[data-route]').forEach(link => {
      link.classList.toggle('active', link.dataset.route === route);
      link.setAttribute('aria-current', link.dataset.route === route ? 'page' : 'false');
    });
  }

  function renderShell() {
    const shell = document.body.querySelector('.topbar');
    const main = document.body.querySelector('#app');
    const mobile = document.body.querySelector('.mobile-nav');
    const footer = document.body.querySelector('.footer');
    if (!shell || !main || !mobile || !footer) return;

    const english = language() === 'en-US';
    updateMetadata();

    shell.outerHTML = `<header class="topbar"><a class="brand" href="#/home" aria-label="${ui('shell.homeLabel')}"><span class="brand-mark"></span><span>ColorPalette</span></a><nav class="nav" aria-label="${ui('shell.mainNav')}">${navItems.map(([route, key]) => `<a data-route="${route}" href="#/${route}">${ui(key)}</a>`).join('')}</nav><div class="preferences" aria-label="${ui('shell.preferences')}"><button class="preference-switch" id="language-switch" type="button" role="switch" aria-checked="${english}" title="${ui('shell.language')}" data-state="${english ? 'en' : 'zh'}"><span class="preference-thumb" aria-hidden="true"></span><span class="preference-option">中</span><span class="preference-option">EN</span></button><button class="preference-switch theme-switch" id="theme-switch" type="button" role="switch" aria-checked="false" title="${ui('shell.theme')}" data-state="light"><span class="preference-thumb" aria-hidden="true"></span><span class="preference-option" aria-label="${ui('shell.lightMode')}">☀</span><span class="preference-option" aria-label="${ui('shell.darkMode')}">☾</span></button></div></header>`;

    mobile.outerHTML = `<nav class="mobile-nav" aria-label="${ui('shell.mobileNav')}">${[['home','⌂'],['extractor','⌁'],['create','＋'],['favorites','♡'],['workspace','▦']].map(([route, icon]) => `<a data-route="${route}" href="#/${route}"><span aria-hidden="true">${icon}</span>${ui(navItems.find(item => item[0] === route)?.[1] || 'nav.discover')}</a>`).join('')}</nav>`;
    footer.textContent = `ColorPalette · ${ui('shell.localFirst')} · ${ui('shell.noUpload')}`;
    syncActiveNav();
  }

  function refreshShell() {
    const shell = document.body.querySelector('.topbar');
    const mobile = document.body.querySelector('.mobile-nav');
    const footer = document.body.querySelector('.footer');
    if (!shell || !mobile || !footer) return;

    const english = language() === 'en-US';
    updateMetadata();

    shell.setAttribute('aria-label', ui('shell.preferences'));
    shell.querySelector('.brand')?.setAttribute('aria-label', ui('shell.homeLabel'));
    shell.querySelector('.nav')?.setAttribute('aria-label', ui('shell.mainNav'));
    navItems.forEach(([route, key]) => {
      const link = shell.querySelector(`.nav [data-route="${route}"]`);
      if (link) link.textContent = ui(key);
    });
    const preferences = shell.querySelector('.preferences');
    if (preferences) preferences.setAttribute('aria-label', ui('shell.preferences'));
    const languageButton = shell.querySelector('#language-switch');
    if (languageButton) {
      languageButton.title = ui('shell.language');
      languageButton.setAttribute('aria-label', ui('shell.language'));
      languageButton.dataset.state = english ? 'en' : 'zh';
      languageButton.setAttribute('aria-checked', String(english));
    }
    const themeButton = shell.querySelector('#theme-switch');
    if (themeButton) {
      const label = window.ColorPalettePreferences?.theme === 'dark' ? ui('shell.lightSwitch') : ui('shell.darkSwitch');
      themeButton.title = label;
      themeButton.setAttribute('aria-label', label);
      const options = themeButton.querySelectorAll('.preference-option');
      if (options[0]) options[0].setAttribute('aria-label', ui('shell.lightMode'));
      if (options[1]) options[1].setAttribute('aria-label', ui('shell.darkMode'));
    }
    mobile.setAttribute('aria-label', ui('shell.mobileNav'));
    navItems.filter(([route]) => ['home','extractor','create','favorites','workspace'].includes(route)).forEach(([route, key]) => {
      const link = mobile.querySelector(`[data-route="${route}"]`);
      if (link) {
        const icon = link.querySelector('span');
        link.textContent = '';
        if (icon) link.appendChild(icon);
        link.appendChild(document.createTextNode(ui(key)));
      }
    });
    footer.textContent = `ColorPalette · ${ui('shell.localFirst')} · ${ui('shell.noUpload')}`;
    syncActiveNav();
  }

  function install() {
    renderShell();
    window.addEventListener('hashchange', () => {
      syncActiveNav();
      window.route?.();
    });
    window.addEventListener('colorpalette:localechange', () => {
      refreshShell();
      window.route?.();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
