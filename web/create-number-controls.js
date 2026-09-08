(() => {
  'use strict';

  const STEP_CONFIG = {
    'cp-h': { min: 0, max: 360, step: 1, label: 'H' },
    'cp-s': { min: 0, max: 100, step: 1, label: 'S' },
    'cp-v': { min: 0, max: 100, step: 1, label: 'V' },
    'cp-r': { min: 0, max: 255, step: 1, label: 'R' },
    'cp-g': { min: 0, max: 255, step: 1, label: 'G' },
    'cp-b': { min: 0, max: 255, step: 1, label: 'B' }
  };

  function isEnglish(){ return window.ColorPalettePreferences?.language === 'en'; }

  function wrapInput(input) {
    if (!input || input.dataset.cpStepperReady === 'true') return;
    const config = STEP_CONFIG[input.id];
    if (!config) return;

    const wrapper = document.createElement('span');
    wrapper.className = 'cp-number-control';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const buttons = document.createElement('span');
    buttons.className = 'cp-number-stepper';
    const prefix = isEnglish() ? config.label === 'H' || config.label === 'S' || config.label === 'V' ? 'value' : 'channel' : config.label === 'H' || config.label === 'S' || config.label === 'V' ? '数值' : '通道';
    const increase = isEnglish() ? `Increase ${prefix} ${config.label}` : `增加${prefix}${config.label}`;
    const decrease = isEnglish() ? `Decrease ${prefix} ${config.label}` : `减少${prefix}${config.label}`;
    buttons.innerHTML = `
      <button type="button" class="cp-number-step cp-number-step-up" aria-label="${increase}" title="${increase}">
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 9.5 8 5.5l4 4"/></svg>
      </button>
      <button type="button" class="cp-number-step cp-number-step-down" aria-label="${decrease}" title="${decrease}">
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m4 6.5 4 4 4-4"/></svg>
      </button>`;
    wrapper.appendChild(buttons);

    const unit = input.parentElement.querySelector(':scope > small');
    if (unit) unit.classList.add('cp-number-unit');

    const update = direction => {
      const current = Number(input.value);
      const value = Number.isFinite(current) ? current : config.min;
      const next = Math.max(config.min, Math.min(config.max, value + direction * config.step));
      input.value = String(next);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };

    buttons.querySelector('.cp-number-step-up').addEventListener('click', () => update(1));
    buttons.querySelector('.cp-number-step-down').addEventListener('click', () => update(-1));
    input.dataset.cpStepperReady = 'true';
  }

  function scan(root = document) {
    Object.keys(STEP_CONFIG).forEach(id => wrapInput(root.querySelector?.(`#${id}`)));
  }

  const observer = new MutationObserver(() => scan());
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('colorpalette:localechange', () => {
    document.querySelectorAll('.cp-number-step').forEach(button => {
      const input = button.closest('.cp-number-control')?.querySelector('input');
      const config = input ? STEP_CONFIG[input.id] : null;
      if (!config) return;
      const prefix = isEnglish() ? config.label === 'H' || config.label === 'S' || config.label === 'V' ? 'value' : 'channel' : config.label === 'H' || config.label === 'S' || config.label === 'V' ? '数值' : '通道';
      const direction = button.classList.contains('cp-number-step-up') ? (isEnglish() ? 'Increase' : '增加') : (isEnglish() ? 'Decrease' : '减少');
      const label = isEnglish() ? `${direction} ${prefix} ${config.label}` : `${direction}${prefix}${config.label}`;
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    });
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scan(), { once: true });
  else scan();
})();
