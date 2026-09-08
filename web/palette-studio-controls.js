(() => {
  'use strict';

  const t = (key, fallback) => String(window.ColorPaletteI18n?.data?.ui?.[key] ?? fallback ?? key);
  const isCreateRoute = () => location.hash.replace(/^#/, '').split('?')[0] === '/create';
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
  const rgbFromHex = value => {
    let raw = String(value || '').trim().replace(/^#/, '');
    if (raw.length === 3) raw = raw.split('').map(x => x + x).join('');
    if (!/^[0-9a-f]{6}$/i.test(raw)) return null;
    return { r: parseInt(raw.slice(0, 2), 16), g: parseInt(raw.slice(2, 4), 16), b: parseInt(raw.slice(4, 6), 16) };
  };
  const hexFromRgb = (r, g, b) => '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('').toUpperCase();
  const hslToRgb = (h, s, l) => {
    h = ((h % 360) + 360) % 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
  };

  let observerTimer = 0;
  let activePress = null;

  const stopPress = () => {
    if (!activePress) return;
    clearTimeout(activePress.timeout);
    clearInterval(activePress.interval);
    activePress = null;
  };

  const commitHsl = next => {
    const ranges = ['h', 's', 'l'].map(id => document.querySelector(`#${id}`));
    if (ranges.some(x => !x)) return false;
    const values = [next.h, next.s, next.l];
    ranges.forEach((range, index) => {
      const value = clamp(values[index], Number(range.min), Number(range.max));
      range.value = String(value);
    });
    const color = hslToRgb(Number(ranges[0].value), Number(ranges[1].value), Number(ranges[2].value));
    const hexInput = document.querySelector('#hex');
    if (hexInput) hexInput.value = hexFromRgb(color.r, color.g, color.b);
    ranges[0].dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  };

  const commitRgb = values => {
    const hexInput = document.querySelector('#hex');
    if (!hexInput) return false;
    hexInput.value = hexFromRgb(values.r, values.g, values.b);
    hexInput.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };

  const currentNumericField = key => document.querySelector(`.cp-number-field[data-parameter="${key}"]`);

  const adjustCurrent = (key, amount) => {
    const field = currentNumericField(key);
    const input = field?.querySelector('input[type="number"]');
    if (!input) return false;
    const min = Number(input.min), max = Number(input.max), current = Number(input.value) || 0;
    const next = clamp(current + amount, min, max);
    input.value = String(next);
    const hslKeys = { h: true, s: true, l: true };
    if (hslKeys[key]) {
      const nextHsl = {
        h: Number(document.querySelector('#h')?.value || 0),
        s: Number(document.querySelector('#s')?.value || 0),
        l: Number(document.querySelector('#l')?.value || 0)
      };
      nextHsl[key] = next;
      return commitHsl(nextHsl);
    }
    const currentHex = document.querySelector('#hex')?.value || '#7C3AED';
    const currentRgb = rgbFromHex(currentHex) || { r: 124, g: 58, b: 237 };
    currentRgb[key] = next;
    return commitRgb(currentRgb);
  };

  const startPress = (event, key, amount) => {
    event.preventDefault();
    stopPress();
    adjustCurrent(key, amount);
    const state = { key, amount, timeout: 0, interval: 0, rate: 125 };
    const repeat = () => {
      if (!isCreateRoute()) {
        stopPress();
        return;
      }
      if (!adjustCurrent(state.key, state.amount)) {
        stopPress();
        return;
      }
      state.rate = Math.max(32, state.rate - 7);
      clearInterval(state.interval);
      state.interval = setInterval(repeat, state.rate);
    };
    state.timeout = setTimeout(() => {
      state.interval = setInterval(repeat, state.rate);
    }, 330);
    activePress = state;
  };

  const makeStepper = (direction, key) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cp-number-step';
    button.dataset.direction = direction;
    button.setAttribute('aria-label', direction > 0 ? t('create.increment', 'Increase value') : t('create.decrement', 'Decrease value'));
    button.innerHTML = direction > 0 ? '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 7.5 6 4l3.5 3.5"/></svg>' : '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>';
    const start = event => startPress(event, key, direction);
    button.addEventListener('mousedown', start);
    button.addEventListener('touchstart', start, { passive: false });
    button.addEventListener('mouseup', stopPress);
    button.addEventListener('mouseleave', stopPress);
    button.addEventListener('touchend', stopPress);
    button.addEventListener('touchcancel', stopPress);
    button.addEventListener('click', event => event.preventDefault());
    return button;
  };

  const makeField = ({ key, label, unit, min, max, value, source }) => {
    const field = document.createElement('label');
    field.className = 'cp-number-field';
    field.dataset.parameter = key;
    field.innerHTML = `<span>${label}</span><span class="cp-number-control"><input type="number" inputmode="numeric" min="${min}" max="${max}" step="1" value="${value}"><small class="cp-number-unit">${unit}</small><span class="cp-number-stepper"></span></span>`;
    const input = field.querySelector('input');
    field.querySelector('.cp-number-stepper').append(makeStepper(1, key), makeStepper(-1, key));
    input.addEventListener('change', () => {
      const number = clamp(Number(input.value), min, max);
      input.value = String(number);
      if (key === 'h' || key === 's' || key === 'l') {
        const next = {
          h: Number(document.querySelector('#h')?.value || 0),
          s: Number(document.querySelector('#s')?.value || 0),
          l: Number(document.querySelector('#l')?.value || 0)
        };
        next[key] = number;
        commitHsl(next);
      } else {
        const currentHex = document.querySelector('#hex')?.value || '#7C3AED';
        const current = rgbFromHex(currentHex) || { r: 124, g: 58, b: 237 };
        current[key] = number;
        commitRgb(current);
      }
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        input.blur();
      }
    });
    input.addEventListener('wheel', event => event.preventDefault(), { passive: false });
    source.appendChild(field);
  };

  const enhance = () => {
    if (!isCreateRoute()) return;
    const controls = document.querySelector('.controls');
    if (!controls || controls.dataset.numericStudioReady === '1') return;
    const ranges = ['h', 's', 'l'].map(id => document.querySelector(`#${id}`));
    if (ranges.some(x => !x)) return;

    ranges.forEach(range => range.closest('.control')?.classList.add('cp-legacy-range-control'));
    const hexBlock = document.querySelector('#hex')?.closest('.control');
    const panel = document.createElement('section');
    panel.className = 'create-v2-param-card cp-live-parameter-panel';
    panel.innerHTML = `<div class="create-v2-param-head"><strong>${t('create.parameters', 'Color Parameters')}</strong><span>${t('create.numericHint', 'Type a value or hold the arrows')}</span></div><div class="create-v2-fields cp-hsl-fields"></div>`;
    const hslFields = panel.querySelector('.cp-hsl-fields');
    makeField({ key: 'h', label: t('create.hue', 'Hue'), unit: '°', min: 0, max: 360, value: Number(ranges[0].value), source: hslFields });
    makeField({ key: 's', label: t('create.saturation', 'Saturation'), unit: '%', min: 0, max: 100, value: Number(ranges[1].value), source: hslFields });
    makeField({ key: 'l', label: t('create.lightness', 'Lightness'), unit: '%', min: 0, max: 100, value: Number(ranges[2].value), source: hslFields });

    const rgb = rgbFromHex(document.querySelector('#hex')?.value || '#7C3AED') || { r: 124, g: 58, b: 237 };
    const rgbPanel = document.createElement('section');
    rgbPanel.className = 'create-v2-param-card cp-live-parameter-panel create-v2-secondary-params';
    rgbPanel.innerHTML = `<div class="create-v2-param-head"><strong>${t('create.rgb', 'RGB Parameters')}</strong><span>0–255</span></div><div class="create-v2-fields cp-rgb-fields"></div>`;
    const rgbFields = rgbPanel.querySelector('.cp-rgb-fields');
    makeField({ key: 'r', label: t('create.red', 'Red'), unit: '', min: 0, max: 255, value: rgb.r, source: rgbFields });
    makeField({ key: 'g', label: t('create.green', 'Green'), unit: '', min: 0, max: 255, value: rgb.g, source: rgbFields });
    makeField({ key: 'b', label: t('create.blue', 'Blue'), unit: '', min: 0, max: 255, value: rgb.b, source: rgbFields });

    if (hexBlock) hexBlock.insertAdjacentElement('afterend', panel);
    else controls.prepend(panel);
    panel.insertAdjacentElement('afterend', rgbPanel);
    controls.dataset.numericStudioReady = '1';
  };

  const scheduleEnhance = () => {
    clearTimeout(observerTimer);
    observerTimer = setTimeout(enhance, 0);
  };

  const observer = new MutationObserver(scheduleEnhance);
  observer.observe(document.querySelector('#app') || document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', scheduleEnhance);
  window.addEventListener('colorpalette:localechange', scheduleEnhance);
  document.addEventListener('mouseup', stopPress, true);
  document.addEventListener('touchend', stopPress, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopPress(); });

  scheduleEnhance();
})();
