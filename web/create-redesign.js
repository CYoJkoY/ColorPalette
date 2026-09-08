(() => {
  'use strict';

  const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0));
  const hexToRgbLocal = (hex) => {
    let h = String(hex || '').trim().replace(/^#/, '');
    if (h.length === 3) h = h.split('').map(x => x + x).join('');
    if (!/^[0-9a-f]{6}$/i.test(h)) return null;
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  };
  const rgbToHexLocal = (r, g, b) => '#' + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase();
  const rgbToHsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) {
      if (max === r) h = 60 * (((g - b) / d) % 6);
      else if (max === g) h = 60 * ((b - r) / d + 2);
      else h = 60 * ((r - g) / d + 4);
    }
    if (h < 0) h += 360;
    return { h: Math.round(h), s: Math.round((max ? d / max : 0) * 100), v: Math.round(max * 100) };
  };
  const hsvToRgb = (h, s, v) => {
    h = ((Number(h) % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; v = clamp(v, 0, 100) / 100;
    const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
  };
  const escLocal = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const getParams = () => new URLSearchParams(location.hash.split('?')[1] || '');
  const readInitialPalette = (params, editing) => {
    if (editing) return editing.colors.slice(0, 8);
    const encoded = params.get('colors');
    if (!encoded) return null;
    try { return JSON.parse(decodeURIComponent(encoded)).filter(Boolean).slice(0, 8); } catch { return null; }
  };

  function renderCreateV2() {
    const params = getParams();
    const baseParam = params.get('hex') || '#7C3AED';
    const editingId = params.get('id') || '';
    const editing = window.__colorPaletteState?.palettes?.find?.(x => x.id === editingId) || null;
    let base = hexToRgbLocal(baseParam) ? rgbToHexLocal(...Object.values(hexToRgbLocal(baseParam))) : '#7C3AED';
    let palette = readInitialPalette(params, editing) || [];
    if (editing) base = palette[0] || base;
    if (!palette.length && !params.get('colors') && !editing) palette = [base];

    let mode = 'analogous';
    let name = editing?.name || '我的色卡';
    let syncing = false;

    const relationLabels = {
      analogous: '类似色', complementary: '互补色', split: '分裂互补', triadic: '三角色', tetradic: '四角色',
      doubleComplementary: '双互补', monochromatic: '单色阶', tints: '浅色阶', shades: '深色阶', tones: '柔和色阶',
      pastel: '粉彩', vivid: '鲜艳', warm: '暖色', cool: '冷色', grayscale: '灰阶'
    };

    const generatedFor = () => window.paletteFromHex?.(base)?.[mode] || [];
    const setBase = (hex, options = {}) => {
      if (!hexToRgbLocal(hex)) return false;
      base = rgbToHexLocal(...Object.values(hexToRgbLocal(hex)));
      if (options.replaceFirst && palette.length) palette[0] = base;
      return true;
    };
    const updateFromHSV = () => {
      const h = clamp(document.querySelector('#cp-h')?.value, 0, 360);
      const s = clamp(document.querySelector('#cp-s')?.value, 0, 100);
      const v = clamp(document.querySelector('#cp-v')?.value, 0, 100);
      const rgb = hsvToRgb(h, s, v);
      base = rgbToHexLocal(rgb.r, rgb.g, rgb.b);
    };
    const draw = () => {
      const rgb = hexToRgbLocal(base), hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      const generated = generatedFor();
      const relation = relationLabels[mode] || mode;
      const app = document.querySelector('#app');
      app.innerHTML = `
        <section class="hero compact create-v2-hero">
          <div class="eyebrow">CREATE</div>
          <div class="title">Palette Studio</div>
          <div class="subtitle">编辑基础色与参数，独立管理当前色卡。关系色只是建议，不会在你修改颜色时覆盖已有色卡。</div>
        </section>
        <section class="create-v2-layout">
          <aside class="card create-v2-controls">
            <div class="create-v2-block">
              <div class="create-v2-label">色卡名称</div>
              <input id="cp-name" class="input" value="${escLocal(name)}" autocomplete="off">
            </div>
            <div class="create-v2-block">
              <div class="create-v2-label-row"><span>基础色</span><span class="create-v2-live">编辑不会重建色卡</span></div>
              <div class="cp-hex-row"><input id="cp-hex" class="input cp-hex-input" value="${base}"><button id="cp-copy" class="button">复制</button></div>
            </div>
            <div class="create-v2-param-card">
              <div class="create-v2-param-head"><strong>HSV / HSB</strong><span>直接输入数值</span></div>
              <div class="create-v2-fields">
                <label>H <input id="cp-h" type="number" min="0" max="360" step="1" value="${hsv.h}"><small>°</small></label>
                <label>S <input id="cp-s" type="number" min="0" max="100" step="1" value="${hsv.s}"><small>%</small></label>
                <label>V <input id="cp-v" type="number" min="0" max="100" step="1" value="${hsv.v}"><small>%</small></label>
              </div>
            </div>
            <div class="create-v2-param-card create-v2-secondary-params">
              <div class="create-v2-param-head"><strong>RGB</strong><span>0–255</span></div>
              <div class="create-v2-fields">
                <label>R <input id="cp-r" type="number" min="0" max="255" step="1" value="${rgb.r}"></label>
                <label>G <input id="cp-g" type="number" min="0" max="255" step="1" value="${rgb.g}"></label>
                <label>B <input id="cp-b" type="number" min="0" max="255" step="1" value="${rgb.b}"></label>
              </div>
            </div>
            <div class="create-v2-block">
              <div class="create-v2-label">配色关系</div>
              <select id="cp-mode" class="input">${Object.entries(relationLabels).map(([id,label]) => `<option value="${id}" ${id===mode?'selected':''}>${label}</option>`).join('')}</select>
              <div class="create-v2-help">切换关系只更新右侧“生成建议”，当前色卡保持不变。</div>
            </div>
            <div class="create-v2-actions">
              <button id="cp-add" class="button">加入当前颜色</button>
              <button id="cp-save" class="button primary">保存色卡</button>
            </div>
            <div class="create-v2-actions create-v2-export">
              <button id="cp-css" class="button">导出 CSS</button>
              <button id="cp-json" class="button">导出 JSON</button>
            </div>
          </aside>

          <main class="card create-v2-workspace">
            <div class="create-v2-workspace-head">
              <div><div class="eyebrow">PREVIEW</div><h2>当前色卡</h2></div>
              <div class="create-v2-count"><strong>${palette.length}</strong><span>/ 8 colors</span></div>
            </div>
            <div class="create-v2-main-preview">
              <div class="create-v2-primary-swatch" style="background:${base}"><span>${base}</span></div>
              <div class="create-v2-preview-copy"><span>BASE COLOR</span><strong>当前基础色</strong><small>参数修改会实时更新这里；已加入色卡的颜色不会被关系生成器覆盖。</small></div>
            </div>
            <div class="create-v2-section-head"><div><span>PALETTE</span><strong>手动色卡</strong></div><small>${palette.length < 2 ? '至少加入 2 个颜色后才能保存' : '拖动顺序可继续整理'}</small></div>
            <div class="create-v2-palette-grid">${palette.map((x,i) => `<article class="create-v2-palette-item ${x===base?'is-base':''}"><div class="create-v2-swatch" style="background:${x}"></div><div class="create-v2-palette-info"><strong>${x}</strong><span>${i===0 ? 'Primary' : 'Color '+String(i+1).padStart(2,'0')}</span></div><div class="create-v2-palette-actions"><button data-up="${i}" title="上移">↑</button><button data-down="${i}" title="下移">↓</button><button data-remove="${i}" title="删除">×</button></div></article>`).join('') || '<div class="empty wide">还没有加入色卡。先编辑基础色，再点击“加入当前颜色”。</div>'}</div>
            <div class="create-v2-section-head generated-head"><div><span>GENERATED</span><strong>${relation}</strong></div><small>建议区 · 不会自动写入当前色卡</small></div>
            <div class="create-v2-generated">${generated.map((x,i) => `<button class="create-v2-generated-item" data-add="${x}" style="--generated:${x}"><span>${String(i+1).padStart(2,'0')}</span><strong>${x}</strong><small>点击加入</small></button>`).join('') || '<div class="empty wide">这个关系没有生成可用颜色。</div>'}</div>
          </main>
        </section>`;

      const rerender = () => { syncing = false; draw(); };
      const nameInput = document.querySelector('#cp-name');
      nameInput.oninput = e => { name = e.target.value; };
      document.querySelector('#cp-copy').onclick = () => window.copy?.(base);
      document.querySelector('#cp-mode').onchange = e => { mode = e.target.value; draw(); };
      document.querySelector('#cp-hex').onchange = e => { if (setBase(e.target.value)) rerender(); else { e.target.value = base; window.toast?.('HEX 格式无效'); } };
      ['cp-h','cp-s','cp-v'].forEach(id => document.querySelector('#'+id).onchange = () => { updateFromHSV(); rerender(); });
      ['cp-r','cp-g','cp-b'].forEach(id => document.querySelector('#'+id).onchange = () => {
        const r = clamp(document.querySelector('#cp-r').value, 0, 255), g = clamp(document.querySelector('#cp-g').value, 0, 255), b = clamp(document.querySelector('#cp-b').value, 0, 255);
        base = rgbToHexLocal(r, g, b); rerender();
      });
      document.querySelector('#cp-add').onclick = () => {
        if (palette.length >= 8) return window.toast?.('色卡最多保存 8 个颜色');
        if (!palette.includes(base)) { palette.push(base); draw(); }
        else window.toast?.('这个颜色已经在当前色卡中');
      };
      document.querySelector('#cp-save').onclick = () => {
        if (palette.length < 2) return window.toast?.('至少需要 2 个颜色');
        const item = window.savePalette?.({ id: editing?.id, name, colors: palette, source: editing?.source || 'custom', createdAt: editing?.createdAt });
        if (item) { window.__colorPaletteState.favorites = [item, ...window.__colorPaletteState.favorites.filter(x => x.id !== item.id)]; localStorage.setItem('colorpalette-web-v2', JSON.stringify(window.__colorPaletteState)); window.toast?.('色卡已保存'); }
      };
      document.querySelector('#cp-css').onclick = () => window.download?.(`${name || 'palette'}.css`, `:root{\n${palette.map((x,i)=>`  --color-${i+1}: ${x};`).join('\n')}\n}`, 'text/css');
      document.querySelector('#cp-json').onclick = () => window.download?.(`${name || 'palette'}.json`, JSON.stringify({name, colors: palette}, null, 2), 'application/json');
      document.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { if (palette.length >= 8) return window.toast?.('色卡最多保存 8 个颜色'); if (!palette.includes(b.dataset.add)) { palette.push(b.dataset.add); draw(); } });
      document.querySelectorAll('[data-remove]').forEach(b => b.onclick = () => { const i=Number(b.dataset.remove); if (palette.length<=1) return window.toast?.('色卡至少保留 1 个颜色'); palette.splice(i,1); if (palette[0]) base=palette[0]; draw(); });
      document.querySelectorAll('[data-up]').forEach(b => b.onclick = () => { const i=Number(b.dataset.up); if(i>0){[palette[i-1],palette[i]]=[palette[i],palette[i-1]];draw();} });
      document.querySelectorAll('[data-down]').forEach(b => b.onclick = () => { const i=Number(b.dataset.down); if(i<palette.length-1){[palette[i+1],palette[i]]=[palette[i],palette[i+1]];draw();} });
    };

    // Existing app state is local, but renderCreateV2 needs access to the same object.
    window.__colorPaletteState = window.__colorPaletteState || { palettes: [], favorites: [], recent: [] };
    try { window.__colorPaletteState = JSON.parse(localStorage.getItem('colorpalette-web-v2')) || window.__colorPaletteState; } catch {}
    draw();
  }

  window.renderCreate = renderCreateV2;
  window.addEventListener('DOMContentLoaded', () => {
    if ((location.hash || '#/home').startsWith('#/create')) renderCreateV2();
  });
  window.addEventListener('hashchange', () => {
    if ((location.hash || '').startsWith('#/create')) renderCreateV2();
  });
})();
