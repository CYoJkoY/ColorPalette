(() => {
  'use strict';

  const isCreateRoute = () => location.hash.replace(/^#/, '').split('?')[0] === '/create';

  function cleanup() {
    if (!isCreateRoute()) return;

    document.querySelector('.create-v2-live')?.remove();
    document.querySelectorAll('#hRange, #sRange, #lRange').forEach(node => node.remove());
  }

  const observer = new MutationObserver(() => cleanup());
  observer.observe(document.querySelector('#app') || document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', cleanup);
  window.addEventListener('colorpalette:localechange', cleanup);
  cleanup();
})();
