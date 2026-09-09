(() => {
  'use strict';

  const STATE_KEY = 'colorpalette-web-v2';
  const CONFIG_KEY = 'colorpalette-cloud-sync-v1';
  const META_KEY = 'colorpalette-cloud-sync-meta-v1';
  const FILE_NAME = 'colorpalette-sync.json';
  const API_BASE = 'https://api.github.com';
  const API_VERSION = '2026-03-10';
  const INTERVALS = [
    { value: 'off', ms: 0 },
    { value: '5m', ms: 5 * 60 * 1000 },
    { value: '15m', ms: 15 * 60 * 1000 },
    { value: '30m', ms: 30 * 60 * 1000 },
    { value: '1h', ms: 60 * 60 * 1000 },
    { value: '6h', ms: 6 * 60 * 60 * 1000 },
    { value: '24h', ms: 24 * 60 * 60 * 1000 }
  ];

  const T = key => String(window.ColorPaletteI18n?.data?.ui?.[key] ?? key);
  const readJson = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    } catch (_) {
      return fallback;
    }
  };
  const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const readState = () => {
    const value = readJson(STATE_KEY, {});
    return {
      palettes: Array.isArray(value.palettes) ? value.palettes : [],
      favorites: Array.isArray(value.favorites) ? value.favorites : [],
      recent: Array.isArray(value.recent) ? value.recent : []
    };
  };
  const readConfig = () => {
    const value = readJson(CONFIG_KEY, {});
    return {
      token: typeof value.token === 'string' ? value.token : '',
      gistId: typeof value.gistId === 'string' ? value.gistId : '',
      interval: INTERVALS.some(item => item.value === value.interval) ? value.interval : 'off'
    };
  };
  const writeConfig = config => writeJson(CONFIG_KEY, config);
  const readMeta = () => {
    const value = readJson(META_KEY, {});
    return {
      localUpdatedAt: Number(value.localUpdatedAt) || 0,
      lastSyncedAt: Number(value.lastSyncedAt) || 0
    };
  };
  const writeMeta = meta => writeJson(META_KEY, meta);

  let syncing = false;
  let timer = null;
  let lastAutomaticAttempt = 0;

  function markLocalChanged() {
    if (syncing) return;
    const meta = readMeta();
    meta.localUpdatedAt = Date.now();
    writeMeta(meta);
  }

  function installStateTracking() {
    if (Storage.prototype.__colorPaletteCloudSyncPatched) return;
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      originalSetItem.call(this, key, value);
      if (this === localStorage && key === STATE_KEY) markLocalChanged();
    };
    Storage.prototype.__colorPaletteCloudSyncPatched = true;
  }

  function headers(token, json = false) {
    const result = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': API_VERSION
    };
    if (json) result['Content-Type'] = 'application/json';
    return result;
  }

  async function request(url, options = {}) {
    const response = await fetch(url, options);
    let data = null;
    try { data = await response.json(); } catch (_) {}
    if (!response.ok) {
      const message = data?.message || `${response.status} ${response.statusText}`;
      throw new Error(message);
    }
    return data;
  }

  async function verifyToken(token) {
    if (!token) throw new Error(T('cloud.errorTokenRequired'));
    await request(`${API_BASE}/gists?per_page=1`, { headers: headers(token) });
    return true;
  }

  async function getGist(token, gistId) {
    return request(`${API_BASE}/gists/${encodeURIComponent(gistId)}`, { headers: headers(token) });
  }

  async function createGist(token, content) {
    const data = await request(`${API_BASE}/gists`, {
      method: 'POST',
      headers: headers(token, true),
      body: JSON.stringify({
        description: 'ColorPalette cloud sync',
        public: false,
        files: { [FILE_NAME]: { content } }
      })
    });
    return data;
  }

  async function updateGist(token, gistId, content) {
    return request(`${API_BASE}/gists/${encodeURIComponent(gistId)}`, {
      method: 'PATCH',
      headers: headers(token, true),
      body: JSON.stringify({ files: { [FILE_NAME]: { content } } })
    });
  }

  function makeSnapshot() {
    const meta = readMeta();
    return {
      schema: 1,
      app: 'ColorPalette',
      updatedAt: meta.localUpdatedAt || Date.now(),
      state: readState()
    };
  }

  function parseRemote(gist) {
    const file = gist?.files?.[FILE_NAME];
    if (!file) return null;
    if (file.truncated) throw new Error(T('cloud.errorFileTooLarge'));
    let snapshot;
    try { snapshot = JSON.parse(file.content || ''); } catch (_) { throw new Error(T('cloud.errorInvalidFile')); }
    if (snapshot?.schema !== 1 || !snapshot?.state) throw new Error(T('cloud.errorInvalidFile'));
    return {
      updatedAt: Number(snapshot.updatedAt) || 0,
      state: {
        palettes: Array.isArray(snapshot.state.palettes) ? snapshot.state.palettes : [],
        favorites: Array.isArray(snapshot.state.favorites) ? snapshot.state.favorites : [],
        recent: Array.isArray(snapshot.state.recent) ? snapshot.state.recent : []
      }
    };
  }

  function saveRemoteState(remote) {
    syncing = true;
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(remote.state));
    } finally {
      syncing = false;
    }
    const meta = readMeta();
    meta.localUpdatedAt = remote.updatedAt || Date.now();
    meta.lastSyncedAt = Date.now();
    writeMeta(meta);
    window.dispatchEvent(new CustomEvent('colorpalette:cloudstatechange'));
  }

  function localIsEmpty() {
    const state = readState();
    return state.palettes.length === 0 && state.favorites.length === 0 && state.recent.length === 0;
  }

  async function syncNow(mode = 'auto') {
    const config = readConfig();
    if (!config.token) throw new Error(T('cloud.notConfigured'));
    syncing = true;
    try {
      let gist = null;
      if (config.gistId) {
        try {
          gist = await getGist(config.token, config.gistId);
        } catch (error) {
          if (!/404|Not Found/i.test(error.message)) throw error;
          config.gistId = '';
          writeConfig(config);
        }
      }

      const localSnapshot = makeSnapshot();
      const localContent = JSON.stringify(localSnapshot, null, 2);

      if (mode === 'restore') {
        if (!gist) throw new Error(T('cloud.errorGistRequired'));
        const remote = parseRemote(gist);
        if (!remote) throw new Error(T('cloud.errorNoFile'));
        saveRemoteState(remote);
        return { direction: 'pull', updatedAt: remote.updatedAt };
      }

      if (mode === 'upload') {
        const next = gist
          ? await updateGist(config.token, gist.id, localContent)
          : await createGist(config.token, localContent);
        config.gistId = next.id;
        writeConfig(config);
        const meta = readMeta();
        meta.localUpdatedAt = localSnapshot.updatedAt;
        meta.lastSyncedAt = Date.now();
        writeMeta(meta);
        return { direction: 'push', updatedAt: localSnapshot.updatedAt };
      }

      if (!gist) {
        const created = await createGist(config.token, localContent);
        config.gistId = created.id;
        writeConfig(config);
        const meta = readMeta();
        meta.localUpdatedAt = localSnapshot.updatedAt;
        meta.lastSyncedAt = Date.now();
        writeMeta(meta);
        return { direction: 'push', updatedAt: localSnapshot.updatedAt };
      }

      const remote = parseRemote(gist);
      if (!remote) {
        const updated = await updateGist(config.token, gist.id, localContent);
        config.gistId = updated.id;
        writeConfig(config);
        const meta = readMeta();
        meta.lastSyncedAt = Date.now();
        writeMeta(meta);
        return { direction: 'push', updatedAt: localSnapshot.updatedAt };
      }

      const localMeta = readMeta();
      if (!localMeta.lastSyncedAt && remote.updatedAt && localIsEmpty()) {
        saveRemoteState(remote);
        return { direction: 'pull', updatedAt: remote.updatedAt };
      }

      if (localSnapshot.updatedAt > remote.updatedAt) {
        const updated = await updateGist(config.token, gist.id, localContent);
        const meta = readMeta();
        meta.localUpdatedAt = localSnapshot.updatedAt;
        meta.lastSyncedAt = Date.now();
        writeMeta(meta);
        return { direction: 'push', updatedAt: localSnapshot.updatedAt, gist: updated.id };
      }

      if (remote.updatedAt > localSnapshot.updatedAt) {
        saveRemoteState(remote);
        return { direction: 'pull', updatedAt: remote.updatedAt };
      }

      const meta = readMeta();
      meta.lastSyncedAt = Date.now();
      writeMeta(meta);
      return { direction: 'none', updatedAt: localSnapshot.updatedAt };
    } finally {
      syncing = false;
    }
  }

  function intervalMs(value) {
    return INTERVALS.find(item => item.value === value)?.ms || 0;
  }

  function restartTimer() {
    if (timer) window.clearInterval(timer);
    timer = null;
    const config = readConfig();
    const ms = intervalMs(config.interval);
    if (!config.token || !ms) return;
    timer = window.setInterval(async () => {
      if (syncing || document.hidden) return;
      const now = Date.now();
      if (now - lastAutomaticAttempt < Math.min(ms, 60 * 1000)) return;
      lastAutomaticAttempt = now;
      try {
        await syncNow('auto');
        updateSyncButton();
      } catch (_) {
        updateSyncButton(T('cloud.statusError'));
      }
    }, Math.min(ms, 60 * 1000));
  }

  function lastSyncText() {
    const value = readMeta().lastSyncedAt;
    if (!value) return T('cloud.neverSynced');
    const date = new Date(value);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  function updateSyncButton(status = '') {
    const button = document.querySelector('#cloud-sync-button');
    if (!button) return;
    const config = readConfig();
    const configured = Boolean(config.token);
    button.dataset.configured = String(configured);
    button.title = status || (configured ? `${T('cloud.title')} · ${lastSyncText()}` : T('cloud.configure'));
    button.setAttribute('aria-label', button.title);
  }

  function intervalOptions(current) {
    return INTERVALS.map(item => `<option value="${item.value}" ${item.value === current ? 'selected' : ''}>${T(`cloud.interval.${item.value}`)}</option>`).join('');
  }

  function modalHtml() {
    const config = readConfig();
    const configured = Boolean(config.token);
    const gistText = config.gistId ? config.gistId : T('cloud.gistAuto');
    return `<div class="cloud-sync-modal" role="dialog" aria-modal="true" aria-labelledby="cloud-sync-title"><div class="cloud-sync-card"><div class="cloud-sync-head"><div><div class="eyebrow">${T('cloud.eyebrow')}</div><h2 id="cloud-sync-title">${T('cloud.title')}</h2></div><button class="button cloud-sync-close" type="button" data-cloud-close aria-label="${T('cloud.close')}">×</button></div><p class="cloud-sync-subtitle">${T('cloud.subtitle')}</p><div class="cloud-sync-fields"><label><span>${T('cloud.token')}</span><input id="cloud-token" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…" value="${escapeHtml(config.token)}"></label><label><span>${T('cloud.gistId')}</span><input id="cloud-gist-id" type="text" autocomplete="off" spellcheck="false" placeholder="${T('cloud.gistAuto')}" value="${escapeHtml(config.gistId)}"></label><label><span>${T('cloud.interval')}</span><select id="cloud-interval">${intervalOptions(config.interval)}</select></label></div><div class="cloud-sync-status"><strong>${configured ? T('cloud.statusConfigured') : T('cloud.statusNotConfigured')}</strong><span>${T('cloud.lastSync')}: ${lastSyncText()}</span><code>${escapeHtml(gistText)}</code></div><p class="cloud-sync-note">${T('cloud.securityNote')}</p><div class="cloud-sync-actions"><button class="button" type="button" data-cloud-test>${T('cloud.test')}</button><button class="button secondary" type="button" data-cloud-save>${T('cloud.save')}</button><button class="button" type="button" data-cloud-upload ${configured ? '' : 'disabled'}>${T('cloud.upload')}</button><button class="button" type="button" data-cloud-restore ${config.gistId ? '' : 'disabled'}>${T('cloud.restore')}</button><button class="button primary" type="button" data-cloud-sync ${configured ? '' : 'disabled'}>${T('cloud.syncNow')}</button></div></div></div>`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>\"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[c]));
  }

  function openModal() {
    document.querySelector('.cloud-sync-modal')?.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml());
    const modal = document.querySelector('.cloud-sync-modal');
    if (!modal) return;
    const close = () => modal.remove();
    modal.querySelector('[data-cloud-close]')?.addEventListener('click', close);
    modal.addEventListener('click', event => { if (event.target === modal) close(); });

    const readForm = () => ({
      token: String(modal.querySelector('#cloud-token')?.value || '').trim(),
      gistId: String(modal.querySelector('#cloud-gist-id')?.value || '').trim(),
      interval: String(modal.querySelector('#cloud-interval')?.value || 'off')
    });
    const saveForm = config => {
      writeConfig(config);
      restartTimer();
      updateSyncButton();
    };
    const setBusy = busy => modal.querySelectorAll('button, input, select').forEach(element => { element.disabled = busy; });
    const setStatus = text => {
      const target = modal.querySelector('.cloud-sync-status span');
      if (target) target.textContent = text;
    };

    modal.querySelector('[data-cloud-save]')?.addEventListener('click', () => {
      const config = readForm();
      if (!config.token) { setStatus(T('cloud.errorTokenRequired')); return; }
      saveForm(config);
      setStatus(T('cloud.saved'));
    });

    modal.querySelector('[data-cloud-test]')?.addEventListener('click', async () => {
      const config = readForm();
      if (!config.token) { setStatus(T('cloud.errorTokenRequired')); return; }
      setBusy(true);
      try {
        await verifyToken(config.token);
        saveForm(config);
        setStatus(T('cloud.testSuccess'));
      } catch (error) {
        setStatus(`${T('cloud.testFailed')}: ${error.message}`);
      } finally {
        setBusy(false);
      }
    });

    const run = mode => async () => {
      const config = readForm();
      if (!config.token) { setStatus(T('cloud.errorTokenRequired')); return; }
      saveForm(config);
      setBusy(true);
      try {
        const result = await syncNow(mode);
        const key = result.direction === 'push' ? 'cloud.uploadSuccess' : result.direction === 'pull' ? 'cloud.restoreSuccess' : 'cloud.syncSuccess';
        setStatus(T(key));
        updateSyncButton();
      } catch (error) {
        setStatus(`${T('cloud.statusError')}: ${error.message}`);
        updateSyncButton(T('cloud.statusError'));
      } finally {
        setBusy(false);
      }
    };

    modal.querySelector('[data-cloud-upload]')?.addEventListener('click', run('upload'));
    modal.querySelector('[data-cloud-restore]')?.addEventListener('click', run('restore'));
    modal.querySelector('[data-cloud-sync]')?.addEventListener('click', run('auto'));
    modal.querySelector('#cloud-token')?.focus();
  }

  function installButton() {
    const preferences = document.querySelector('.preferences');
    if (!preferences || document.querySelector('#cloud-sync-button')) return;
    const button = document.createElement('button');
    button.className = 'preference-switch cloud-sync-switch';
    button.id = 'cloud-sync-button';
    button.type = 'button';
    button.innerHTML = '<span class="cloud-sync-glyph" aria-hidden="true">☁</span><span class="preference-option">⇅</span>';
    button.addEventListener('click', openModal);
    preferences.appendChild(button);
    updateSyncButton();
  }

  function boot() {
    installStateTracking();
    installButton();
    restartTimer();
    window.addEventListener('localechange', updateSyncButton);
    window.addEventListener('colorpalette:localechange', updateSyncButton);
    window.addEventListener('visibilitychange', async () => {
      if (document.hidden || syncing) return;
      const config = readConfig();
      const ms = intervalMs(config.interval);
      if (!config.token || !ms) return;
      const last = readMeta().lastSyncedAt;
      if (!last || Date.now() - last >= ms) {
        try { await syncNow('auto'); updateSyncButton(); } catch (_) { updateSyncButton(T('cloud.statusError')); }
      }
    });
    window.addEventListener('colorpalette:cloudstatechange', updateSyncButton);
    const observer = new MutationObserver(() => installButton());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.ColorPaletteCloudSync = {
    syncNow,
    openSettings: openModal,
    getConfig: readConfig,
    setConfig: config => { writeConfig({ token: config.token || '', gistId: config.gistId || '', interval: config.interval || 'off' }); restartTimer(); updateSyncButton(); },
    verifyToken,
    INTERVALS: INTERVALS.map(item => item.value)
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
