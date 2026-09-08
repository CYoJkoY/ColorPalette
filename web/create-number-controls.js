(() => {
  'use strict';

  const STEP_CONFIG = {
    'cp-h': { min: 0, max: 360, step: 1 },
    'cp-s': { min: 0, max: 100, step: 1 },
    'cp-v': { min: 0, max: 100, step: 1 },
    'cp-r': { min: 0, max: 255, step: 1 },
    'cp-g': { min: 0, max: 255, step: 1 },
    'cp-b': { min: 0, max: 255, step: 1 }
  };

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
    buttons.innerHTML = `
      <button type="button" class="cp-number-step cp-number-step-up" aria-label="增加 ${input.id}">
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 9.5 8 5.5l4 4"/></svg>
      </button>
      <button type="button" class="cp-number-step cp-number-step-down" aria-label="减少 ${input.id}">
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scan(), { once: true });
  else scan();
})();
