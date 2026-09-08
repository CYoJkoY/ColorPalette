(() => {
  function safeCopy(text) {
    const value = String(text ?? '');
    const fallback = () => {
      const area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); } finally { area.remove(); }
      if (typeof window.toast === 'function') window.toast(window.ColorPalettePreferences?.t('已复制') || '已复制');
    };
    if (!navigator.clipboard?.writeText) {
      fallback();
      return;
    }
    navigator.clipboard.writeText(value).then(() => {
      if (typeof window.toast === 'function') window.toast(window.ColorPalettePreferences?.t('已复制') || '已复制');
    }).catch(fallback);
  }

  function install() {
    window.copy = safeCopy;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
