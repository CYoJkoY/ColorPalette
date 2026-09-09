(() => {
  'use strict';

  document.addEventListener('click', event => {
    const button = event.target.closest('#families .chip');
    if (!button) return;

    const container = button.closest('#families');
    if (!container) return;

    requestAnimationFrame(() => {
      container.querySelectorAll('.chip').forEach(chip => chip.classList.toggle('active', chip === button));
    });
  });
})();
