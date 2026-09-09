(() => {
  const FALLBACK = 'zh-CN';
  const EXTRA_RELATIONS = {
    'zh-CN': { pastel: '粉彩', vivid: '鲜艳', grayscale: '灰阶' },
    'en-US': { pastel: 'Pastel', vivid: 'Vivid', grayscale: 'Grayscale' }
  };
  const EXTRA_RELATION_DESCRIPTIONS = {
    'zh-CN': {
      pastel: '提高明度并降低饱和度，形成柔和、轻盈的粉彩配色。',
      vivid: '提高饱和度，形成鲜明、有冲击力的配色。',
      grayscale: '去除色相与饱和度，只保留不同明度的灰阶。'
    },
    'en-US': {
      pastel: 'Raises lightness and lowers saturation for soft, airy pastel palettes.',
      vivid: 'Raises saturation for vivid, high-impact color combinations.',
      grayscale: 'Removes hue and saturation, leaving only different levels of gray.'
    }
  };
  const EXTRA_CLOUD_UI = {
    'zh-CN': {
      'cloud.eyebrow':'云同步','cloud.title':'GitHub Gist 云同步','cloud.subtitle':'使用你自己的 GitHub Fine-grained Token 将收藏、工作区与最近颜色同步到私有 Gist。Token 只在当前浏览器内保存。','cloud.token':'GitHub Token','cloud.gistId':'Gist ID','cloud.gistAuto':'留空则首次上传时自动创建私有 Gist','cloud.interval':'自动同步间隔','cloud.interval.off':'关闭','cloud.interval.5m':'每 5 分钟','cloud.interval.15m':'每 15 分钟','cloud.interval.30m':'每 30 分钟','cloud.interval.1h':'每 1 小时','cloud.interval.6h':'每 6 小时','cloud.interval.24h':'每天','cloud.statusConfigured':'已配置','cloud.statusNotConfigured':'未配置','cloud.lastSync':'上次同步','cloud.neverSynced':'从未同步','cloud.test':'测试连接','cloud.save':'保存配置','cloud.upload':'上传本地','cloud.restore':'从云端恢复','cloud.syncNow':'立即同步','cloud.close':'关闭','cloud.saved':'配置已保存。','cloud.testSuccess':'Token 验证成功。','cloud.testFailed':'连接失败','cloud.uploadSuccess':'本地数据已上传到 Gist。','cloud.restoreSuccess':'云端数据已恢复到本机。','cloud.syncSuccess':'同步完成。','cloud.statusError':'同步失败','cloud.notConfigured':'尚未配置云同步。','cloud.errorTokenRequired':'请输入 GitHub Token。','cloud.errorGistRequired':'请先配置 Gist ID。','cloud.errorNoFile':'Gist 中没有 ColorPalette 同步文件。','cloud.errorInvalidFile':'Gist 同步文件格式无效。','cloud.errorFileTooLarge':'Gist 同步文件过大。','cloud.securityNote':'建议使用仅授予 Gists 权限的 Fine-grained Personal Access Token，并创建私有 Gist。自动同步只会在此网页打开时运行；浏览器关闭后不会继续执行。','cloud.configure':'配置 GitHub Gist 云同步'
    },
    'en-US': {
      'cloud.eyebrow':'Cloud Sync','cloud.title':'GitHub Gist Cloud Sync','cloud.subtitle':'Use your own GitHub fine-grained token to sync favorites, workspace palettes, and recent colors to a private Gist. The token is stored only in this browser.','cloud.token':'GitHub Token','cloud.gistId':'Gist ID','cloud.gistAuto':'Leave empty to create a private Gist on the first upload','cloud.interval':'Auto-sync interval','cloud.interval.off':'Off','cloud.interval.5m':'Every 5 minutes','cloud.interval.15m':'Every 15 minutes','cloud.interval.30m':'Every 30 minutes','cloud.interval.1h':'Every hour','cloud.interval.6h':'Every 6 hours','cloud.interval.24h':'Daily','cloud.statusConfigured':'Configured','cloud.statusNotConfigured':'Not configured','cloud.lastSync':'Last sync','cloud.neverSynced':'Never synced','cloud.test':'Test connection','cloud.save':'Save settings','cloud.upload':'Upload local','cloud.restore':'Restore from cloud','cloud.syncNow':'Sync now','cloud.close':'Close','cloud.saved':'Settings saved.','cloud.testSuccess':'Token verified successfully.','cloud.testFailed':'Connection failed','cloud.uploadSuccess':'Local data uploaded to the Gist.','cloud.restoreSuccess':'Cloud data restored to this device.','cloud.syncSuccess':'Sync completed.','cloud.statusError':'Sync failed','cloud.notConfigured':'Cloud sync is not configured.','cloud.errorTokenRequired':'Enter a GitHub token.','cloud.errorGistRequired':'Configure a Gist ID first.','cloud.errorNoFile':'The Gist does not contain a ColorPalette sync file.','cloud.errorInvalidFile':'The Gist sync file is invalid.','cloud.errorFileTooLarge':'The Gist sync file is too large.','cloud.securityNote':'Use a fine-grained Personal Access Token with only Gists permission, and create a private Gist. Automatic sync runs only while this webpage is open; it cannot continue after the browser closes.','cloud.configure':'Configure GitHub Gist cloud sync'
    }
  };

  function localeCode() {
    const language = window.ColorPalettePreferences?.language;
    return language === 'en' || language === 'en-US' ? 'en-US' : 'zh-CN';
  }

  function locale() {
    const locales = window.ColorPaletteLocales || {};
    const code = localeCode();
    const base = locales[code] || locales[FALLBACK] || { ui: {}, relations: {}, modes: {}, relationDescriptions: {}, sourceNames: {} };
    return {
      ...base,
      ui: { ...base.ui, ...EXTRA_CLOUD_UI[code] },
      relations: { ...base.relations, ...EXTRA_RELATIONS[code] },
      relationDescriptions: { ...base.relationDescriptions, ...EXTRA_RELATION_DESCRIPTIONS[code] }
    };
  }

  function getPath(source, path) {
    return String(path).split('.').reduce((value, key) => value == null ? undefined : value[key], source);
  }

  function value(path) {
    const result = getPath(locale(), path);
    if (result == null) {
      console.warn(`[ColorPalette i18n] Missing locale key: ${path}`);
      return String(path);
    }
    return String(result);
  }

  function relation(key) {
    return value(`relations.${key}`);
  }

  function relationDescription(key) {
    return value(`relationDescriptions.${key}`);
  }

  function mode(key) {
    return value(`modes.${key}`);
  }

  function sourceName(raw) {
    const source = String(raw || '').trim();
    if (!source) return '';
    const explicit = locale().sourceNames?.[source];
    if (explicit) return String(explicit);
    if (localeCode() === 'en-US') return source;
    if (/japanese/i.test(source)) return '日本传统色参考';
    if (/meodai\/color-names/i.test(source)) return '公开命名颜色库';
    if (/meodai\/colornames-oklab/i.test(source)) return 'OKLab 均匀色命名库';
    if (/cht-colors/i.test(source)) return '中国传统色参考';
    if (/pigment|art/i.test(source)) return '艺术与颜料参考';
    if (/modern|design/i.test(source)) return '现代设计色参考';
    return '颜色参考数据';
  }

  function localizeDetailSource() {
    const target = document.querySelector('.color-hero .muted');
    if (!target) return;
    const raw = target.dataset.sourceRaw || target.textContent.trim();
    if (!raw) return;
    target.dataset.sourceRaw = raw;
    const next = sourceName(raw);
    if (next && target.textContent !== next) target.textContent = next;
  }

  window.ColorPaletteI18n = {
    get locale() { return localeCode(); },
    get data() { return locale(); },
    t: value,
    relation,
    relationDescription,
    mode,
    sourceName
  };

  const observer = new MutationObserver(localizeDetailSource);
  const startObserver = () => {
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    localizeDetailSource();
  };
  if (document.body) startObserver(); else document.addEventListener('DOMContentLoaded', startObserver, { once: true });
  window.addEventListener('localechange', localizeDetailSource);
})();
