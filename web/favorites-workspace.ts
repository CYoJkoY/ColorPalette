(() => {
  'use strict';

  const app = document.querySelector('#app');
  const STORE = 'colorpalette-web-v2';
  const DATA = () => window.ColorPaletteI18n?.data || {};
  const EN = () => window.ColorPaletteI18n?.locale === 'en-US';
  const T = (key: string) => String(DATA().ui?.[key] ?? key);
  const esc = (value: unknown) => String(value ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));

  type Palette = { id: string; name?: string; colors?: string[]; source?: string; createdAt?: number; updatedAt?: number };
  type Favorite = { id: string; name?: string; hex?: string; colors?: string[]; source?: string; createdAt?: number };
  type State = { palettes: Palette[]; favorites: Favorite[]; recent: Array<{ hex?: string; name?: string; at?: number; type?: string; id?: string; colors?: string[] }> };

  const readState = (): State => {
    try {
      const value = JSON.parse(localStorage.getItem(STORE) || 'null') as Partial<State> | null;
      return { palettes: value?.palettes || [], favorites: value?.favorites || [], recent: value?.recent || [] };
    } catch (_) {
      return { palettes: [], favorites: [], recent: [] };
    }
  };

  const saveState = (state: State) => localStorage.setItem(STORE, JSON.stringify(state));
  const renderSwatches = (values: string[] = []) => `<div class="mini-palette">${values.slice(0, 8).map(value => `<div style="background:${esc(value)}">${esc(value)}</div>`).join('')}</div>`;
  const colorName = (item: Favorite) => EN() && item.name ? item.name : (item.name || T('color.custom'));
  const routePath = () => (location.hash.replace(/^#/, '').split('?')[0] || '/home');
  const isOwnedRoute = () => routePath() === '/favorites' || routePath() === '/workspace';

  function renderFavorites() {
    if (!app) return;
    const state = readState();
    const items = state.favorites.filter(item => item && Array.isArray(item.colors) && item.colors.length);
    app.innerHTML = `<section class="hero compact"><div class="eyebrow">${T('favorites.eyebrow')}</div><div class="title">${T('favorites.title')}</div><div class="subtitle">${T('favorites.subtitle')}</div></section>${items.length ? `<div class="section-head"><div><h2>${T('favorites.content')}</h2></div><button class="button" id="clear-favorites" type="button">${T('common.clear')}</button></div><div class="grid">${items.map(item => `<article class="card favorite-card" data-favorite-id="${esc(item.id)}"><button class="favorite-open" type="button" data-open-color="${esc(item.colors?.[0] || '')}" style="all:unset;display:block;width:100%;cursor:pointer"><div class="palette">${(item.colors || []).slice(0,8).map(value => `<div style="background:${esc(value)}"></div>`).join('')}</div><strong>${esc(colorName(item))}</strong><span class="muted">${esc(item.colors?.join(' · ') || '')}</span></button><div class="library-actions"><button type="button" data-remove-favorite="${esc(item.id)}">${T('common.remove')}</button></div></article>`).join('')}</div>` : `<section class="panel pad"><h2 class="section-title">${T('favorites.empty')}</h2><div class="muted tip">${T('favorites.subtitle')}</div></section>`}`;

    document.querySelector('#clear-favorites')?.addEventListener('click', () => {
      const next = readState();
      next.favorites = [];
      saveState(next);
      renderFavorites();
    });
    document.querySelectorAll<HTMLElement>('[data-remove-favorite]').forEach(button => button.addEventListener('click', () => {
      const next = readState();
      next.favorites = next.favorites.filter(item => item.id !== button.dataset.removeFavorite);
      saveState(next);
      renderFavorites();
    }));
    document.querySelectorAll<HTMLElement>('[data-open-color]').forEach(button => button.addEventListener('click', () => {
      const hex = button.dataset.openColor;
      if (hex) location.hash = `#/detail?hex=${encodeURIComponent(hex)}`;
    }));
  }

  function renderWorkspace() {
    if (!app) return;
    const state = readState();
    const palettes = state.palettes.filter(item => item && Array.isArray(item.colors) && item.colors.length);
    const recent = state.recent.filter(item => item?.hex).slice(0, 12);

    app.innerHTML = `<section class="hero compact"><div class="eyebrow">${T('workspace.eyebrow')}</div><div class="title">${T('workspace.title')}</div><div class="subtitle">${T('workspace.subtitle')}</div></section><div class="section-head"><div><h2>${T('palette.title')}</h2></div><a class="button primary" href="#/create">${T('palette.new')}</a></div>${palettes.length ? `<div class="grid">${palettes.map(item => `<article class="card favorite-card"><button type="button" data-edit-palette="${esc(item.id)}" style="all:unset;display:block;width:100%;cursor:pointer"><div class="palette">${(item.colors || []).slice(0,8).map(value => `<div style="background:${esc(value)}"></div>`).join('')}</div><strong>${esc(item.name || T('palette.defaultName'))}</strong><span class="muted">${(item.colors || []).length} ${T('workspace.colors')}</span></button><div class="library-actions"><button type="button" data-edit-palette="${esc(item.id)}">${T('common.edit')}</button><button type="button" data-remove-palette="${esc(item.id)}">${T('common.delete')}</button></div></article>`).join('')}</div>` : `<section class="panel pad"><h2 class="section-title">${T('workspace.empty')}</h2><div class="muted tip">${T('create.subtitle')}</div><div class="toolbar"><a class="button primary" href="#/create">${T('palette.new')}</a></div></section>`}<div class="section-head"><div><h2>${T('workspace.recent')}</h2></div><button class="button" type="button" id="copy-recent-values">${T('workspace.copyValues')}</button></div>${recent.length ? `<div class="grid">${recent.map(item => `<article class="card color-card" data-recent-color="${esc(item.hex || '')}"><div class="swatch" style="background:${esc(item.hex || '#888')}"></div><div class="color-meta"><strong>${esc(item.name || item.hex || T('color.custom'))}</strong><span>${esc(item.hex || '')}</span></div></article>`).join('')}</div>` : `<section class="panel pad"><div class="muted">${T('workspace.emptyRecent')}</div></section>`}`;

    document.querySelectorAll<HTMLElement>('[data-edit-palette]').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.editPalette;
      if (id) location.hash = `#/create?id=${encodeURIComponent(id)}`;
    }));
    document.querySelectorAll<HTMLElement>('[data-remove-palette]').forEach(button => button.addEventListener('click', () => {
      const next = readState();
      next.palettes = next.palettes.filter(item => item.id !== button.dataset.removePalette);
      saveState(next);
      renderWorkspace();
    }));
    document.querySelectorAll<HTMLElement>('[data-recent-color]').forEach(button => button.addEventListener('click', () => {
      const hex = button.dataset.recentColor;
      if (hex) location.hash = `#/detail?hex=${encodeURIComponent(hex)}`;
    }));
    document.querySelector('#copy-recent-values')?.addEventListener('click', async () => {
      const values = recent.map(item => item.hex).filter(Boolean).join('\n');
      if (!values) return;
      try {
        await navigator.clipboard.writeText(values);
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = T('status.copied');
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1800);
      } catch (_) {}
    });
  }

  function renderCurrentRoute() {
    const path = routePath();
    if (path === '/favorites') renderFavorites();
    else if (path === '/workspace') renderWorkspace();
  }

  window.ColorPaletteOwnedViews = { renderFavorites, renderWorkspace };
  window.addEventListener('hashchange', event => {
    const target = event.target as Window;
    const path = (target.location?.hash || location.hash).replace(/^#/, '').split('?')[0] || '/home';
    if (path === '/favorites' || path === '/workspace') {
      event.stopImmediatePropagation();
      renderCurrentRoute();
    }
  }, true);
  window.addEventListener('colorpalette:localechange', () => { if (isOwnedRoute()) renderCurrentRoute(); });
  renderCurrentRoute();
})();
