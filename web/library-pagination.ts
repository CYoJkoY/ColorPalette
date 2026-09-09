(() => {
  'use strict';

  const app = document.querySelector('#app');
  if (!app) return;

  const PAGE_SIZE = 48;
  const MAX_VISIBLE_PAGES = 9;
  let colors = null;
  let currentPage = 1;
  let syncQueued = false;
  let renderToken = 0;
  let loading = null;
  let filterSignature = '';

  const EN = () => window.ColorPaletteI18n?.locale === 'en-US';
  const DATA = () => window.ColorPaletteI18n?.data || {};
  const T = key => String(DATA().ui?.[key] ?? key);
  const meta = () => window.colorMeta || {};
  const allCategory = () => meta().categoryAllKey || 'all';
  const allFamily = () => meta().familyAllKey || 'all';
  const familyOf = value => DATA().meta?.families?.[value] || value || T('color.unknown');
  const categoryOf = value => DATA().meta?.categories?.[value] || value || T('color.collection');
  const escapeHtml = value => String(value ?? '').replace(/[&<>\"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[char]));
  const nameOf = item => EN() && item.nameEn ? item.nameEn : (item.name || T('color.custom'));

  function loadColors() {
    if (colors) return Promise.resolve(colors);
    if (loading) return loading;
    loading = fetch('data/colors.json', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error(`Failed to load color data: ${response.status}`);
        return response.json();
      })
      .then(data => {
        colors = Array.isArray(data.colors) ? data.colors : [];
        window.colorMeta = data;
        return colors;
      })
      .catch(error => {
        loading = null;
        throw error;
      });
    return loading;
  }

  function getFilterState() {
    const collectionButton = document.querySelector('#collections .chip.active');
    const familyButton = document.querySelector('#families .chip.active');
    return {
      collection: collectionButton?.dataset.value || allCategory(),
      family: familyButton?.dataset.value || allFamily(),
      query: String(document.querySelector('#library-search')?.value || '').trim().toLowerCase()
    };
  }

  function isAll(value, allValue) {
    const normalized = String(value ?? '').trim().toLowerCase();
    return value === allValue || normalized === 'all' || normalized === '全部';
  }

  function getFiltered(state) {
    return (colors || []).filter(color => {
      const collectionMatch = isAll(state.collection, allCategory()) || color.collection === state.collection;
      const familyMatch = isAll(state.family, allFamily()) || color.family === state.family;
      const searchMatch = `${color.name || ''} ${color.nameEn || ''} ${color.hex || ''} ${color.collection || ''} ${color.family || ''}`
        .toLowerCase()
        .includes(state.query);
      return collectionMatch && familyMatch && searchMatch;
    });
  }

  function card(item) {
    return `<article class="card color-card" data-open="${escapeHtml(item.hex)}"><div class="swatch" style="background:${item.hex}"></div><div class="color-meta"><strong>${escapeHtml(nameOf(item))}</strong><span>${escapeHtml(item.hex)} · ${escapeHtml(familyOf(item.family))}</span><span>${escapeHtml(categoryOf(item.collection))}</span></div></article>`;
  }

  function pageItems(totalPages, page) {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items = [];
    const appendRange = (start, end) => {
      for (let value = start; value <= end; value += 1) items.push(value);
    };

    if (page <= 5) {
      appendRange(1, 7);
      items.push('ellipsis');
      items.push(totalPages);
      return items;
    }

    if (page >= totalPages - 4) {
      items.push(1);
      items.push('ellipsis');
      appendRange(totalPages - 6, totalPages);
      return items;
    }

    items.push(1);
    items.push('ellipsis');
    appendRange(page - 2, page + 2);
    items.push('ellipsis');
    items.push(totalPages);
    return items;
  }

  function renderControls(totalPages) {
    const pagination = document.querySelector('#library-pagination');
    if (!pagination) return;
    const locale = EN();
    pagination.innerHTML = `
      <button class="button" type="button" data-page="prev" ${currentPage <= 1 ? 'disabled' : ''}>${locale ? 'Previous' : '上一页'}</button>
      <div class="library-page-list" role="list" aria-label="${locale ? 'Page selection' : '页码选择'}">
        ${pageItems(totalPages, currentPage).map(item => item === 'ellipsis'
          ? '<span class="library-page-ellipsis" aria-hidden="true">…</span>'
          : `<button type="button" class="library-page-button${item === currentPage ? ' active' : ''}" data-page-number="${item}" aria-label="${locale ? `Page ${item}` : `第 ${item} 页`}"${item === currentPage ? ' aria-current="page"' : ''}>${item}</button>`).join('')}
      </div>
      <div class="library-page-jump">
        <label for="library-page-input">${locale ? 'Go to' : '跳转到'}</label>
        <input id="library-page-input" class="library-page-input" type="number" inputmode="numeric" min="1" max="${totalPages}" value="${currentPage}" aria-label="${locale ? 'Target page' : '目标页码'}">
        <button class="button library-page-jump-button" type="button" data-page-jump>${locale ? 'Go' : '跳转'}</button>
      </div>
      <span class="library-page-summary">${currentPage} / ${totalPages}</span>
      <button class="button" type="button" data-page="next" ${currentPage >= totalPages ? 'disabled' : ''}>${locale ? 'Next' : '下一页'}</button>`;

    const goTo = target => {
      const filtered = getFiltered(getFilterState());
      setPage(target, filtered);
      const grid = document.querySelector('#library-grid');
      if (grid) window.scrollTo({ top: Math.max(0, grid.getBoundingClientRect().top + window.scrollY - 96), behavior: 'smooth' });
    };

    pagination.querySelector('[data-page="prev"]')?.addEventListener('click', () => goTo(currentPage - 1));
    pagination.querySelector('[data-page="next"]')?.addEventListener('click', () => goTo(currentPage + 1));
    pagination.querySelectorAll('[data-page-number]').forEach(button => {
      button.addEventListener('click', () => goTo(Number(button.dataset.pageNumber)));
    });

    const input = pagination.querySelector('#library-page-input');
    const submit = () => {
      const target = Math.max(1, Math.min(totalPages, Number(input?.value) || currentPage));
      goTo(target);
    };
    input?.addEventListener('keydown', event => {
      if (event.key === 'Enter') submit();
    });
    pagination.querySelector('[data-page-jump]')?.addEventListener('click', submit);
  }

  function setPage(targetPage, filtered) {
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    currentPage = Math.max(1, Math.min(totalPages, Number(targetPage) || 1));
    const start = (currentPage - 1) * PAGE_SIZE;
    const grid = document.querySelector('#library-grid');
    const count = document.querySelector('#library-count');
    if (count) count.textContent = T('library.count').replace('{count}', String(filtered.length));
    if (grid) grid.innerHTML = filtered.slice(start, start + PAGE_SIZE).map(card).join('') || `<div class="empty wide">${T('library.empty')}</div>`;
    renderControls(totalPages);
  }

  function sync() {
    if (!location.hash.startsWith('#/library')) return;
    const pagination = document.querySelector('#library-pagination');
    const grid = document.querySelector('#library-grid');
    const search = document.querySelector('#library-search');
    if (!pagination || !grid || !search) return;

    const state = getFilterState();
    const signature = JSON.stringify(state);
    if (filterSignature === signature && pagination.querySelector('.library-page-list')) return;
    filterSignature = signature;

    const token = ++renderToken;
    loadColors()
      .then(() => {
        if (token !== renderToken || !location.hash.startsWith('#/library')) return;
        currentPage = 1;
        setPage(1, getFiltered(state));
      })
      .catch(() => {});
  }

  const queueSync = () => {
    if (syncQueued) return;
    syncQueued = true;
    requestAnimationFrame(() => {
      syncQueued = false;
      sync();
    });
  };

  const observer = new MutationObserver(() => queueSync());
  observer.observe(app, { childList: true, subtree: true });

  document.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('#collections .chip, #families .chip')) {
      filterSignature = '';
      currentPage = 1;
      queueSync();
    }
  });

  document.addEventListener('input', event => {
    if (event.target instanceof HTMLInputElement && event.target.id === 'library-search') {
      filterSignature = '';
      currentPage = 1;
      queueSync();
    }
  });

  window.addEventListener('hashchange', () => {
    filterSignature = '';
    currentPage = 1;
    queueSync();
  });
  window.addEventListener('colorpalette:localechange', () => {
    filterSignature = '';
    queueSync();
  });
  window.addEventListener('localechange', () => {
    filterSignature = '';
    queueSync();
  });

  queueSync();
})();
