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
    if (typeof window.savePalette === 'function' && !window.savePalette.__safeId) {
      const original = window.savePalette;
      const wrapped = function(p) {
        const item = original(p);
        if (item && /^palette-\d+$/.test(item.id)) {
          item.id = `${item.id}-${Math.random().toString(36).slice(2, 8)}`;
          if (window.state?.palettes) {
            const index = window.state.palettes.findIndex(x => x.id === item.id.replace(/-[a-z0-9]{6}$/, ''));
            if (index >= 0) window.state.palettes[index] = item;
          }
          try { localStorage.setItem('colorpalette-web-v2', JSON.stringify(window.state)); } catch (_) {}
        }
        return item;
      };
      wrapped.__safeId = true;
      window.savePalette = wrapped;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
