(() => {
  'use strict';

  const STATE_KEY = 'colorpalette-web-v2';
  const PREFERENCES_KEY = 'colorpalette-preferences-v4';
  const CLOUD_CONFIG_KEY = 'colorpalette-cloud-sync-v1';
  const CLOUD_META_KEY = 'colorpalette-cloud-sync-meta-v1';
  const FILE_NAME = 'ColorPalette-config.json';
  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  const SCHEMA = 1;
  const ALLOWED_INTERVALS = new Set(['off', '5m', '15m', '30m', '1h', '6h', '24h']);
  const EXTRA = {
    'zh-CN': {
      title: '本地配置文件',
      description: '一键导出或导入 ColorPalette 的本地数据与界面配置。GitHub Token 不会写入配置文件。',
      export: '导出配置',
      import: '导入配置',
      exportSuccess: '配置文件已导出。',
      importSuccess: '配置已导入。',
      importConfirm: '导入配置将覆盖当前的收藏、工作区和界面设置，是否继续？',
      invalid: '配置文件格式无效或版本不受支持。',
      tooLarge: '配置文件过大，最大支持 2 MB。',
      readFailed: '无法读取配置文件。',
      cancelled: '已取消导入。'
    },
    'en-US': {
      title: 'Local Configuration',
      description: 'Export or import ColorPalette local data and interface settings. Your GitHub token is never included.',
      export: 'Export Config',
      import: 'Import Config',
      exportSuccess: 'Configuration exported.',
      importSuccess: 'Configuration imported.',
      importConfirm: 'Importing will replace your current favorites, workspace, and interface settings. Continue?',
      invalid: 'Invalid configuration file or unsupported schema version.',
      tooLarge: 'Configuration file is too large. The maximum size is 2 MB.',
      readFailed: 'Unable to read the configuration file.',
      cancelled: 'Import cancelled.'
    }
  };

  const localeCode = () => window.ColorPaletteI18n?.locale === 'en-US' ? 'en-US' : 'zh-CN';
  const text = key => EXTRA[localeCode()]?.[key] || key;
  const readJson = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    } catch (_) {
      return fallback;
    }
  };
  const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  function readState() {
    const value = readJson(STATE_KEY, {});
    return {
      palettes: Array.isArray(value.palettes) ? value.palettes : [],
      favorites: Array.isArray(value.favorites) ? value.favorites : [],
      recent: Array.isArray(value.recent) ? value.recent : []
    };
  }

  function readPreferences() {
    const value = readJson(PREFERENCES_KEY, {});
    return {
      language: value.language === 'en' ? 'en' : 'zh',
      theme: value.theme === 'dark' ? 'dark' : 'light'
    };
  }

  function readCloudConfig() {
    const value = readJson(CLOUD_CONFIG_KEY, {});
    return {
      gistId: typeof value.gistId === 'string' ? value.gistId : '',
      interval: ALLOWED_INTERVALS.has(value.interval) ? value.interval : 'off'
    };
  }

  function readCloudMeta() {
    const value = readJson(CLOUD_META_KEY, {});
    return {
      localUpdatedAt: Number(value.localUpdatedAt) || 0,
      lastSyncedAt: Number(value.lastSyncedAt) || 0
    };
  }

  function makePayload() {
    return {
      app: 'ColorPalette',
      schema: SCHEMA,
      exportedAt: new Date().toISOString(),
      containsGitHubToken: false,
      preferences: readPreferences(),
      cloudSync: readCloudConfig(),
      syncMeta: readCloudMeta(),
      state: readState()
    };
  }

  function downloadPayload(payload) {
    const content = JSON.stringify(payload, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').replace(/Z$/, '');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `colorpalette-config-${stamp}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function normalizeState(value) {
    if (!value || typeof value !== 'object') throw new Error(text('invalid'));
    if (!Array.isArray(value.palettes) || !Array.isArray(value.favorites) || !Array.isArray(value.recent)) {
      throw new Error(text('invalid'));
    }
    return {
      palettes: value.palettes,
      favorites: value.favorites,
      recent: value.recent
    };
  }

  function normalizePayload(value) {
    if (!value || typeof value !== 'object' || value.app !== 'ColorPalette' || value.schema !== SCHEMA) {
      throw new Error(text('invalid'));
    }
    const state = normalizeState(value.state);
    const preferences = value.preferences && typeof value.preferences === 'object' ? {
      language: value.preferences.language === 'en' ? 'en' : 'zh',
      theme: value.preferences.theme === 'dark' ? 'dark' : 'light'
    } : readPreferences();
    const cloudSync = value.cloudSync && typeof value.cloudSync === 'object' ? {
      gistId: typeof value.cloudSync.gistId === 'string' ? value.cloudSync.gistId : '',
      interval: ALLOWED_INTERVALS.has(value.cloudSync.interval) ? value.cloudSync.interval : 'off'
    } : readCloudConfig();
    const syncMeta = value.syncMeta && typeof value.syncMeta === 'object' ? {
      localUpdatedAt: Number(value.syncMeta.localUpdatedAt) || 0,
      lastSyncedAt: Number(value.syncMeta.lastSyncedAt) || 0
    } : { localUpdatedAt: 0, lastSyncedAt: 0 };
    return { state, preferences, cloudSync, syncMeta };
  }

  function importPayload(payload) {
    const normalized = normalizePayload(payload);
    if (!window.confirm(text('importConfirm'))) return false;

    writeJson(STATE_KEY, normalized.state);
    writeJson(PREFERENCES_KEY, normalized.preferences);

    const existingCloud = readJson(CLOUD_CONFIG_KEY, {});
    const nextCloud = {
      token: typeof existingCloud.token === 'string' ? existingCloud.token : '',
      gistId: normalized.cloudSync.gistId,
      interval: normalized.cloudSync.interval
    };
    writeJson(CLOUD_CONFIG_KEY, nextCloud);

    const fallbackUpdated = Date.now();
    writeJson(CLOUD_META_KEY, {
      localUpdatedAt: normalized.syncMeta.localUpdatedAt || fallbackUpdated,
      lastSyncedAt: normalized.syncMeta.lastSyncedAt || 0
    });

    const cloudSync = window.ColorPaletteCloudSync;
    if (cloudSync?.setConfig) {
      cloudSync.setConfig(nextCloud);
    }

    const preferences = window.ColorPalettePreferences;
    if (preferences) {
      preferences.setLanguage(normalized.preferences.language);
      preferences.setTheme(normalized.preferences.theme);
    }

    window.dispatchEvent(new CustomEvent('colorpalette:cloudstatechange'));
    window.dispatchEvent(new CustomEvent('colorpalette:configimport'));
    window.route?.();
    return true;
  }

  async function handleFile(file, setStatus) {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setStatus(text('tooLarge'));
      return;
    }
    try {
      const payload = JSON.parse(await file.text());
      const imported = importPayload(payload);
      setStatus(imported ? text('importSuccess') : text('cancelled'));
      if (imported) {
        window.setTimeout(() => document.querySelector('.cloud-sync-modal')?.remove(), 450);
      }
    } catch (error) {
      setStatus(error instanceof Error && error.message ? error.message : text('readFailed'));
    }
  }

  function installTransfer(modal) {
    if (!modal || modal.querySelector('.config-transfer')) return;
    const actions = modal.querySelector('.cloud-sync-actions');
    if (!actions) return;

    const section = document.createElement('section');
    section.className = 'config-transfer';
    section.innerHTML = `
      <div class="config-transfer-copy">
        <strong>${text('title')}</strong>
        <span>${text('description')}</span>
      </div>
      <div class="config-transfer-actions">
        <button class="button" type="button" data-config-export>${text('export')}</button>
        <button class="button" type="button" data-config-import>${text('import')}</button>
        <input class="config-transfer-input" type="file" accept="application/json,.json" hidden>
      </div>
      <div class="config-transfer-status" aria-live="polite"></div>`;
    actions.parentNode?.insertBefore(section, actions);

    const setStatus = value => {
      const target = section.querySelector('.config-transfer-status');
      if (target) target.textContent = value;
    };
    const input = section.querySelector('.config-transfer-input');
    section.querySelector('[data-config-export]')?.addEventListener('click', () => {
      downloadPayload(makePayload());
      setStatus(text('exportSuccess'));
    });
    section.querySelector('[data-config-import]')?.addEventListener('click', () => input?.click());
    input?.addEventListener('change', async () => {
      const file = input.files?.[0];
      input.value = '';
      await handleFile(file, setStatus);
    });
  }

  function refreshTransferText() {
    document.querySelectorAll('.config-transfer').forEach(section => {
      const strong = section.querySelector('.config-transfer-copy strong');
      const span = section.querySelector('.config-transfer-copy span');
      const exportButton = section.querySelector('[data-config-export]');
      const importButton = section.querySelector('[data-config-import]');
      if (strong) strong.textContent = text('title');
      if (span) span.textContent = text('description');
      if (exportButton) exportButton.textContent = text('export');
      if (importButton) importButton.textContent = text('import');
    });
  }

  function boot() {
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.cloud-sync-modal').forEach(installTransfer);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('colorpalette:localechange', refreshTransferText);
    document.querySelectorAll('.cloud-sync-modal').forEach(installTransfer);
  }

  window.ColorPaletteConfigTransfer = {
    export: () => downloadPayload(makePayload()),
    importFile: handleFile,
    createPayload: makePayload
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
