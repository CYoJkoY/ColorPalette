(() => {
  'use strict';

  const app = document.querySelector('#app');
  if (!app) return;

  const isExtractorRoute = () => location.hash.replace(/^#/, '').split('?')[0] === '/extractor';
  const t = (key, fallback) => String(window.ColorPaletteI18n?.data?.ui?.[key] ?? fallback);
  const hex = (r, g, b) => `#${[r, g, b].map(value => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  const escapeHtml = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));

  let objectUrl = '';

  const loadState = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem('colorpalette-web-v2') || '{}');
      return { palettes: Array.isArray(parsed.palettes) ? parsed.palettes : [] };
    } catch {
      return { palettes: [] };
    }
  };

  const savePalette = colors => {
    const state = loadState();
    const now = Date.now();
    const palette = {
      id: `palette-${now}`,
      name: t('extractor.paletteName', 'Extracted Palette'),
      colors: colors.slice(0, 8),
      source: 'image-extractor',
      createdAt: now,
      updatedAt: now
    };
    state.palettes = [palette, ...state.palettes].slice(0, 100);
    const raw = JSON.parse(localStorage.getItem('colorpalette-web-v2') || '{}');
    raw.palettes = state.palettes;
    localStorage.setItem('colorpalette-web-v2', JSON.stringify(raw));
  };

  const render = () => {
    if (!isExtractorRoute()) return;

    app.innerHTML = `<section class="hero compact">
      <div class="eyebrow">${t('extractor.eyebrow', 'IMAGE EXTRACTOR')}</div>
      <div class="title">${t('extractor.title', 'Extract colors from an image')}</div>
      <div class="subtitle">${t('extractor.subtitle', 'Choose an image and automatically extract its dominant colors.')}</div>
      <section class="extract-grid">
        <div class="panel pad">
          <input id="file" type="file" accept="image/*" hidden>
          <div class="toolbar">
            <button id="choose" class="button primary" type="button">${t('extractor.choose', 'Choose image')}</button>
            <button id="clear" class="button" type="button">${t('common.clear', 'Clear')}</button>
          </div>
          <div id="imagebox" class="image-box"><div class="image-placeholder">${t('extractor.placeholder', 'Choose an image to begin')}</div></div>
        </div>
        <div class="panel pad">
          <div class="section-head" style="margin-top:0"><h2 class="section-title">${t('extractor.results', 'Extracted colors')}</h2></div>
          <div id="extract-results" class="empty">${t('extractor.noResults', 'No colors extracted yet')}</div>
          <div class="toolbar">
            <button id="saveExtract" class="button primary" type="button" disabled>${t('extractor.savePalette', 'Save palette')}</button>
            <button id="openExtract" class="button" type="button" disabled>${t('extractor.openStudio', 'Open in studio')}</button>
          </div>
        </div>
      </section>
    </section>`;

    const file = document.querySelector('#file');
    const imagebox = document.querySelector('#imagebox');
    const results = document.querySelector('#extract-results');
    const choose = document.querySelector('#choose');
    const clear = document.querySelector('#clear');
    const save = document.querySelector('#saveExtract');
    const open = document.querySelector('#openExtract');
    if (!file || !imagebox || !results || !choose || !clear || !save || !open) return;

    let extracted = [];

    const clearImageUrl = () => {
      if (!objectUrl) return;
      URL.revokeObjectURL(objectUrl);
      objectUrl = '';
    };

    const renderResults = () => {
      if (!extracted.length) {
        results.className = 'empty';
        results.textContent = t('extractor.noResults', 'No colors extracted yet');
        save.disabled = true;
        open.disabled = true;
        return;
      }
      results.className = 'grid';
      results.innerHTML = extracted.map((item, index) => `<article class="card" data-copy-color="${item.hex}" style="cursor:pointer">
        <div class="swatch" style="background:${item.hex};height:92px"></div>
        <div class="color-meta"><strong>${escapeHtml(item.hex)}</strong><span>#${index + 1}</span></div>
      </article>`).join('');
      save.disabled = extracted.length < 2;
      open.disabled = extracted.length === 0;
    };

    const process = selected => {
      if (!selected.type.startsWith('image/')) return;
      extracted = [];
      renderResults();
      clearImageUrl();
      objectUrl = URL.createObjectURL(selected);
      const url = objectUrl;
      const image = new Image();
      image.onload = () => {
        if (url !== objectUrl) return;
        imagebox.innerHTML = '';
        imagebox.appendChild(image);
        const size = 96;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;
        context.drawImage(image, 0, 0, size, size);
        const pixels = context.getImageData(0, 0, size, size).data;
        const buckets = new Map();
        for (let y = 0; y < size; y += 3) {
          for (let x = 0; x < size; x += 3) {
            const offset = (y * size + x) * 4;
            if (pixels[offset + 3] < 180) continue;
            const color = hex(
              Math.min(255, Math.round(pixels[offset] / 16) * 16),
              Math.min(255, Math.round(pixels[offset + 1] / 16) * 16),
              Math.min(255, Math.round(pixels[offset + 2] / 16) * 16)
            );
            buckets.set(color, (buckets.get(color) || 0) + 1);
          }
        }
        extracted = [...buckets.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([color, count]) => ({ hex: color, count }));
        renderResults();
      };
      image.onerror = () => {
        extracted = [];
        renderResults();
      };
      image.src = url;
    };

    choose.onclick = () => file.click();
    clear.onclick = () => {
      clearImageUrl();
      file.value = '';
      extracted = [];
      imagebox.innerHTML = `<div class="image-placeholder">${t('extractor.choosePlaceholder', 'Choose another image')}</div>`;
      renderResults();
    };
    file.onchange = () => {
      const selected = file.files?.[0];
      if (selected) process(selected);
    };
    results.onclick = event => {
      const target = event.target.closest('[data-copy-color]');
      if (!target) return;
      const value = target.dataset.copyColor;
      if (!value) return;
      void navigator.clipboard?.writeText(value);
    };
    save.onclick = () => {
      const colors = extracted.map(item => item.hex);
      if (colors.length < 2) return;
      savePalette(colors);
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = t('status.paletteSaved', 'Palette saved');
      document.body.appendChild(toast);
      window.setTimeout(() => toast.remove(), 1800);
    };
    open.onclick = () => {
      const colors = encodeURIComponent(JSON.stringify(extracted.map(item => item.hex)));
      location.hash = `#/create?colors=${colors}`;
    };
    renderResults();
  };

  window.addEventListener('hashchange', render);
  window.addEventListener('colorpalette:localechange', () => {
    if (isExtractorRoute()) render();
  });
  render();
})();
