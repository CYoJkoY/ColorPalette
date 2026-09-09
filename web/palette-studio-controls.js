(() => {
  'use strict';

  const STATE = { active: null };
  const APP_SELECTOR = '#app';
  const uiText = (key, fallback) => String(window.ColorPaletteI18n?.data?.ui?.[key] ?? fallback ?? key);
  const isCreateRoute = () => location.hash.replace(/^#/, '').split('?')[0] === '/create';
  const clamp = (value, min, max) => Math.max(Number(min), Math.min(Number(max), Number.isFinite(value) ? value : Number(min)));

  const stop = () => {
    if (!STATE.active) return;
    clearTimeout(STATE.active.timeout);
    clearInterval(STATE.active.interval);
    STATE.active = null;
  };

  const rgbToHex = (r, g, b) => '#' + [r, g, b]
    .map(value => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0'))
    .join('').toUpperCase();

  const hexToRgb = value => {
    let raw = String(value || '').trim().replace(/^#/, '');
    if (raw.length === 3) raw = raw.split('').map(char => char + char).join('');
    if (!/^[0-9a-f]{6}$/i.test(raw)) return null;
    return {
      r: parseInt(raw.slice(0, 2), 16),
      g: parseInt(raw.slice(2, 4), 16),
      b: parseInt(raw.slice(4, 6), 16)
    };
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (delta) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      if (max === r) h = (g - b) / delta + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToRgb = (h, s, l) => {
    h = ((h % 360) + 360) % 360;
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  const findInput = target => target ? document.querySelector(`#${CSS.escape(target)}`) : null;

  const suppressCreateRedraw = callback => {
    const app = document.querySelector(APP_SELECTOR);
    if (!app) return callback();
    const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if (!descriptor?.set || !descriptor?.get) return callback();
    Object.defineProperty(app, 'innerHTML', {
      configurable: true,
      enumerable: false,
      get() { return descriptor.get.call(app); },
      set() {}
    });
    try {
      return callback();
    } finally {
      delete app.innerHTML;
    }
  };

  const refreshFields = source => {
    const h = findInput('h');
    const s = findInput('s');
    const l = findInput('l');
    const r = findInput('r');
    const g = findInput('g');
    const b = findInput('b');
    const hex = findInput('hex');
    const picker = findInput('colorPicker');
    if (!h || !s || !l || !r || !g || !b) return;

    let color;
    if (source === 'hsl') {
      color = hslToRgb(Number(h.value), Number(s.value), Number(l.value));
    } else {
      color = {
        r: clamp(Number(r.value), 0, 255),
        g: clamp(Number(g.value), 0, 255),
        b: clamp(Number(b.value), 0, 255)
      };
    }

    const nextHex = rgbToHex(color.r, color.g, color.b);
    const nextHsl = rgbToHsl(color.r, color.g, color.b);
    if (source === 'hsl') {
      r.value = String(color.r);
      g.value = String(color.g);
      b.value = String(color.b);
    } else {
      h.value = String(nextHsl.h);
      s.value = String(nextHsl.s);
      l.value = String(nextHsl.l);
    }
    if (hex) hex.value = nextHex;
    if (picker) picker.value = nextHex;

    const generated = document.querySelectorAll('.create-v2-generated-item');
    if (generated.length) {
      const mode = document.querySelector('#mode')?.value || 'analogous';
      const angles = {
        analogous: [-30, 0, 30],
        complementary: [0, 180],
        split: [0, 150, 210],
        triadic: [0, 120, 240],
        tetradic: [0, 90, 180, 270],
        doubleComplementary: [0, 30, 180, 210],
        warm: [-30, -15, 0, 15, 30],
        cool: [120, 150, 180, 210, 240]
      };
      const baseHsl = nextHsl;
      let values;
      if (angles[mode]) {
        values = angles[mode].map(offset => rgbToHex(...Object.values(hslToRgb(baseHsl.h + offset, baseHsl.s, baseHsl.l))));
      } else if (mode === 'monochromatic') {
        values = [72, 62, 52, 42, 32].map(lightness => rgbToHex(...Object.values(hslToRgb(baseHsl.h, baseHsl.s, lightness))));
      } else if (mode === 'tints') {
        values = [94, 86, 78, 70, 62].map(lightness => rgbToHex(...Object.values(hslToRgb(baseHsl.h, Math.max(8, baseHsl.s - 8), lightness))));
      } else if (mode === 'shades') {
        values = [48, 40, 32, 24, 16].map(lightness => rgbToHex(...Object.values(hslToRgb(baseHsl.h, baseHsl.s, lightness))));
      } else if (mode === 'tones') {
        values = [62, 55, 48, 41, 34].map(lightness => rgbToHex(...Object.values(hslToRgb(baseHsl.h, Math.max(5, baseHsl.s - 28), lightness))));
      } else if (mode === 'pastel') {
        values = [35, 25, 15, 5, 55].map(offset => rgbToHex(...Object.values(hslToRgb(baseHsl.h + offset, Math.min(65, Math.max(28, baseHsl.s - 12)), 76))));
      } else if (mode === 'vivid') {
        values = [0, 60, 120, 180, 240].map(offset => rgbToHex(...Object.values(hslToRgb(baseHsl.h + offset, Math.max(78, baseHsl.s), 52))));
      } else {
        values = [12, 28, 44, 60, 76].map(lightness => rgbToHex(...Object.values(hslToRgb(baseHsl.h, 0, lightness))));
      }
      generated.forEach((item, index) => {
        const value = values[index] || nextHex;
        item.dataset.add = value;
        item.style.setProperty('--generated', value);
        const strong = item.querySelector('strong');
        if (strong) strong.textContent = value;
      });
    }
  };

  const commit = (input, source) => {
    if (!input) return false;
    suppressCreateRedraw(() => {
      if (typeof input.onchange === 'function') input.onchange(new Event('change'));
    });
    refreshFields(source);
    return true;
  };

  const change = (target, amount) => {
    const input = findInput(target);
    if (!input || !amount) return false;
    input.value = String(clamp((Number(input.value) || 0) + amount, Number(input.min), Number(input.max)));
    return commit(input, ['h', 's', 'l'].includes(target) ? 'hsl' : 'rgb');
  };

  const syncColorPicker = picker => {
    if (!picker || picker.dataset.liveColorReady === '1') return;
    picker.dataset.liveColorReady = '1';
    picker.style.touchAction = 'none';
    picker.oninput = () => {
      if (!isCreateRoute()) return;
      const color = hexToRgb(picker.value);
      if (!color) return;
      const hsl = rgbToHsl(color.r, color.g, color.b);
      const h = findInput('h');
      const s = findInput('s');
      const l = findInput('l');
      const r = findInput('r');
      const g = findInput('g');
      const b = findInput('b');
      const hex = findInput('hex');
      if (!h || !s || !l || !r || !g || !b || !hex) return;
      h.value = String(hsl.h);
      s.value = String(hsl.s);
      l.value = String(hsl.l);
      r.value = String(color.r);
      g.value = String(color.g);
      b.value = String(color.b);
      hex.value = picker.value.toUpperCase();
      refreshFields('rgb');
    };
    picker.addEventListener('change', () => {
      if (!isCreateRoute()) return;
      const hexInput = findInput('hex');
      if (hexInput) hexInput.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };

  const start = (event, button) => {
    if (!isCreateRoute()) return;
    event.preventDefault();
    event.stopPropagation();
    stop();
    const target = button?.dataset.stepTarget;
    const amount = Number(button?.dataset.step || 0);
    if (!target || !amount) return;
    change(target, amount);
    const state = { target, amount, timeout: 0, interval: 0, delay: 150 };
    state.timeout = setTimeout(() => {
      const repeat = () => {
        if (!isCreateRoute()) return stop();
        if (!change(state.target, state.amount)) return stop();
        state.delay = Math.max(28, state.delay - 8);
        clearInterval(state.interval);
        state.interval = setInterval(repeat, state.delay);
      };
      state.interval = setInterval(repeat, state.delay);
    }, 320);
    STATE.active = state;
  };

  const bindLabels = () => {
    document.querySelectorAll('.cp-number-step[data-step-target]').forEach(button => {
      button.setAttribute('aria-label', button.dataset.step === '1'
        ? uiText('create.increment', 'Increase value')
        : uiText('create.decrement', 'Decrease value'));
      button.style.touchAction = 'none';
      button.style.userSelect = 'none';
    });
    if (isCreateRoute()) syncColorPicker(document.querySelector('#colorPicker'));
  };

  document.addEventListener('pointerdown', event => {
    const button = event.target.closest('.cp-number-step[data-step-target]');
    if (!button) return;
    start(event, button);
  }, true);

  document.addEventListener('pointerup', event => {
    if (event.target.closest('.cp-number-step[data-step-target]')) {
      event.preventDefault();
      event.stopPropagation();
    }
    stop();
  }, true);

  document.addEventListener('pointercancel', stop, true);
  document.addEventListener('click', event => {
    const button = event.target.closest('.cp-number-step[data-step-target]');
    if (!button || !isCreateRoute()) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('hashchange', () => { stop(); bindLabels(); });
  window.addEventListener('colorpalette:localechange', () => { stop(); bindLabels(); });

  const observer = new MutationObserver(bindLabels);
  observer.observe(document.querySelector(APP_SELECTOR) || document.body, { childList: true, subtree: true });
  bindLabels();
})();
