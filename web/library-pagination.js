(() => {
  'use strict';

  const PAGE_SIZE = 48;
  let colors = [];
  let loaded = false;
  let state = { collection: '', family: '', page: 1, query: '' };
  let renderToken = 0;

  const data = () => window.ColorPaletteI18n?.data || {};
  const isEnglish = () => window.ColorPaletteI18n?.locale === 'en-US';
  const text = key => String(data().ui?.[key] ?? key);
  const esc = value => String(value ?? '').replace(/[&<>\"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[ch]));
  const category = value => data().meta?.categories?.[value] || value || text('color.collection');
  const family = value => data().meta?.families?.[value] || value || text('color.unknown');
  const name = item => isEnglish() && item.nameEn ? item.nameEn : (item.name || text('color.custom'));
  const card = item => `<article class="card color-card" data-open="${esc(item.hex)}"><div class="swatch" style="background:${item.hex}"></div><div class="color-meta"><strong>${esc(name(item))}</strong><span>${item.hex} · ${esc(family(item.family))}</span><span>${esc(category(item.collection))}</span></div></article>`;

  async function load() {
    if (loaded) return;
    const response = await fetch('data/colors.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load color data: ${response.status}`);
    const payload = await response.json();
    colors = payload.colors || [];
    loaded = true;
  }

  function filtered() {
    const allCategory = data().meta?.categoryAllKey || 'all';
    const allFamily = data().meta?.familyAllKey || 'all';
    const query = state.query.trim().toLowerCase();
    return colors.filter(color => {
      const matchesCollection = !state.collection || state.collection === allCategory || color.collection === state.collection;
      const matchesFamily = !state.family || state.family === allFamily || color.family === state.family;
      const haystack = `${color.name || ''} ${color.nameEn || ''} ${color.hex} ${color.collection || ''} ${color.family || ''}`.toLowerCase();
      return matchesCollection && matchesFamily && (!query || haystack.includes(query));
    });
  }

  function pageButtons(totalPages) {
    if (totalPages <= 13) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const current = state.page;
    const result = [1];
    const start = Math.max(2, current - 2);
    const end = Math.min(totalPages - 1, current + 2);
    if (start > 2) result.push('…');
    for (let page = start; page <= end; page += 1) result.push(page);
    if (end < totalPages - 1) result.push('…');
    result.push(totalPages);
    return result;
  }

  function renderPagination(total) {
    const root = document.querySelector('#library-pagination');
    if (!root) return;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);
    const previousLabel = isEnglish() ? 'Previous page' : '上一页';
    const nextLabel = isEnglish() ? 'Next page' : '下一页';
    root.innerHTML = `<div class="library-pagination-inner"><button class="library-page-arrow" type="button" data-page-step="-1" aria-label="${previousLabel}" ${state.page <= 1 ? 'disabled' : ''}>‹</button><div class="library-page-numbers">${pageButtons(totalPages).map(page => page === '…' ? '<span class="library-page-ellipsis" aria-hidden="true">…</span>' : `<button class="library-page" type="button" data-page-number="${page}" aria-current="${page === state.page ? 'page' : 'false'}">${page}</button>`).join('')}</div><button class="library-page-arrow" type="button" data-page-step="1" aria-label="${nextLabel}" ${state.page >= totalPages ? 'disabled' : ''}>›</button></div><div class="library-page-meta">${isEnglish() ? `Page ${state.page} of ${totalPages}` : `第 ${state.page} / ${totalPages} 页`}</div>`;

    root.querySelectorAll('[data-page-step]').forEach(button => {
      button.addEventListener('click', () => {
        if (button.disabled) return;
        state.page = Math.max(1, Math.min(totalPages, state.page + Number(button.dataset.pageStep)));
        draw();
      });
    });
    root.querySelectorAll('[data-page-number]').forEach(button => {
      button.addEventListener('click', () => {
        state.page = Number(button.dataset.pageNumber);
        draw();
      });
    });
  }

  function draw() {
    const grid = document.querySelector('#library-grid');
    const count = document.querySelector('#library-count');
    if (!grid || !count) return;
    const list = filtered();
    const start = (state.page - 1) * PAGE_SIZE;
    count.textContent = text('library.count').replace('{count}', String(list.length));
    grid.innerHTML = list.slice(start, start + PAGE_SIZE).map(card).join('') || `<div class="empty wide">${text('library.empty')}</div>`;
    renderPagination(list.length);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function renderShell() {
    const meta = window.colorMeta || {};
    const collections = [meta.categoryAllKey || 'all', ...(meta.categoryNames || [])];
    const families = meta.familyNames || [meta.familyAllKey || 'all'];
    const collectionButtons = collections.map((value, index) => `<button class="chip ${index === 0 ? 'active' : ''}" data-library-collection="${esc(value)}">${esc(category(value))}</button>`).join('');
    const familyButtons = families.map((value, index) => `<button class="chip ${index === 0 ? 'active' : ''}" data-library-family="${esc(value)}">${esc(family(value))}</button>`).join('');
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = `<section class="hero compact"><div class="eyebrow">${text('library.eyebrow')}</div><div class="title">${text('library.title')}</div><div class="subtitle">${text('library.subtitle')}</div></section><div class="panel filters"><div class="filter-label">${text('library.system')}</div><div class="chips" id="collections">${collectionButtons}</div><div class="filter-label second">${text('library.family')}</div><div class="chips" id="families">${familyButtons}</div><div class="search-wrap"><input id="library-search" class="search-input" placeholder="${text('library.searchPlaceholder')}" value="${esc(state.query)}"></div></div><div class="section-head"><div><h2 id="library-count"></h2></div><span class="muted">${text('library.detail')}</span></div><div id="library-grid" class="library-grid"></div><nav id="library-pagination" class="library-pagination" aria-label="Pagination"></nav>`;

    const search = document.querySelector('#library-search');
    search.addEventListener('input', event => { state.query = event.target.value; state.page = 1; draw(); });
    document.querySelectorAll('[data-library-collection]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-library-collection]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      state.collection = button.dataset.libraryCollection === (meta.categoryAllKey || 'all') ? '' : button.dataset.libraryCollection;
      state.page = 1;
      draw();
    }));
    document.querySelectorAll('[data-library-family]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-library-family]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      state.family = button.dataset.libraryFamily === (meta.familyAllKey || 'all') ? '' : button.dataset.libraryFamily;
      state.page = 1;
      draw();
    }));
  }

  async function activate() {
    if (!location.hash.replace(/^#/, '').startsWith('/library')) return;
    const token = ++renderToken;
    try {
      await load();
      if (token !== renderToken) return;
      renderShell();
      draw();
    } catch (error) {
      const app = document.querySelector('#app');
      if (app) app.innerHTML = `<div class="empty">${esc(text('errors.dataLoad'))}<button class="button" onclick="location.reload()">${esc(text('errors.reload'))}</button></div>`;
    }
  }

  window.addEventListener('hashchange', () => requestAnimationFrame(activate));
  window.addEventListener('colorpalette:localechange', () => requestAnimationFrame(activate));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', activate, { once: true });
  else activate();
})();
