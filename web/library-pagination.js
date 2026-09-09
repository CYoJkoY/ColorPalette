(() => {
  'use strict';

  const PAGE_SIZE = 48;
  const app = document.querySelector('#app');

  if (!app) return;

  const render = () => {
    const pagination = document.querySelector('#library-pagination');
    if (!pagination || !location.hash.startsWith('#/library')) return;

    const summary = pagination.querySelector(':scope > span');
    const previous = pagination.querySelector('[data-page="prev"]');
    const next = pagination.querySelector('[data-page="next"]');
    if (!summary || !previous || !next) return;

    const match = summary.textContent?.match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) return;

    const currentPage = Number(match[1]);
    const totalPages = Number(match[2]);
    if (!Number.isInteger(currentPage) || !Number.isInteger(totalPages) || totalPages <= 1) return;

    const existing = pagination.querySelector('.library-page-list');
    if (existing?.dataset.current === String(currentPage) && existing.dataset.total === String(totalPages)) return;

    const pageList = document.createElement('div');
    pageList.className = 'library-page-list';
    pageList.dataset.current = String(currentPage);
    pageList.dataset.total = String(totalPages);
    pageList.setAttribute('role', 'list');
    pageList.setAttribute('aria-label', 'Page selection');

    const addPage = (page) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'library-page-button';
      button.textContent = String(page);
      button.dataset.pageNumber = String(page);
      button.setAttribute('aria-label', `Page ${page}`);
      button.setAttribute('role', 'listitem');
      if (page === currentPage) {
        button.classList.add('active');
        button.setAttribute('aria-current', 'page');
      }
      button.addEventListener('click', () => goToPage(page, currentPage));
      pageList.append(button);
    };

    const addEllipsis = () => {
      const span = document.createElement('span');
      span.className = 'library-page-ellipsis';
      span.textContent = '…';
      span.setAttribute('aria-hidden', 'true');
      pageList.append(span);
    };

    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page += 1) addPage(page);
    } else if (currentPage <= 4) {
      for (let page = 1; page <= 5; page += 1) addPage(page);
      addEllipsis();
      addPage(totalPages);
    } else if (currentPage >= totalPages - 3) {
      addPage(1);
      addEllipsis();
      for (let page = totalPages - 4; page <= totalPages; page += 1) addPage(page);
    } else {
      addPage(1);
      addEllipsis();
      for (let page = currentPage - 1; page <= currentPage + 1; page += 1) addPage(page);
      addEllipsis();
      addPage(totalPages);
    }

    pagination.querySelectorAll('.library-page-list').forEach((node) => node.remove());
    pagination.insertBefore(pageList, next);
  };

  const goToPage = (targetPage, currentPage) => {
    if (targetPage === currentPage) return;

    const direction = targetPage > currentPage ? 'next' : 'prev';
    const steps = Math.abs(targetPage - currentPage);
    const pagination = document.querySelector('#library-pagination');

    for (let index = 0; index < steps; index += 1) {
      pagination?.querySelector(`[data-page="${direction}"]`)?.click();
    }

    requestAnimationFrame(render);
  };

  const observer = new MutationObserver(() => render());
  observer.observe(app, { childList: true, subtree: true });
  window.addEventListener('hashchange', () => requestAnimationFrame(render));
  requestAnimationFrame(render);
})();
