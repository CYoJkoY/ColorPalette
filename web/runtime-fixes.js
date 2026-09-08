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
      try {
        document.execCommand('copy');
        if (typeof window.toast === 'function') window.toast(window.ColorPalettePreferences?.t('已复制') || '已复制');
      } finally {
        area.remove();
      }
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

    if (typeof window.savePalette === 'function' && !window.savePalette.__uniqueIds) {
      const original = window.savePalette;
      const wrapped = function(p) {
        const input = { ...(p || {}) };
        if (!input.id) {
          input.id = `palette-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        }
        return original(input);
      };
      wrapped.__uniqueIds = true;
      window.savePalette = wrapped;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
