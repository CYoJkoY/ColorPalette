(() => {
  const FALLBACK = 'zh-CN';
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
  const SOURCE_NAMES = {
    'zh-CN': {
      'cht-colors': '中国传统色参考',
      'Japanese traditional color references': '日本传统色参考',
      'meodai/color-names': '公开命名颜色库',
      'meodai/colornames-oklab': 'OKLab 均匀色命名库'
    },
    'en-US': {
      'cht-colors': 'Traditional Chinese color references',
      'Japanese traditional color references': 'Japanese traditional color references',
      'meodai/color-names': 'Open named color library',
      'meodai/colornames-oklab': 'OKLab balanced color library'
    }
  };

  function localeCode() {
    const language = window.ColorPalettePreferences?.language;
    return language === 'en' || language === 'en-US' ? 'en-US' : 'zh-CN';
  }

  function locale() {
    const locales = window.ColorPaletteLocales || {};
    return locales[localeCode()] || locales[FALLBACK] || { ui: {}, relations: {}, modes: {}, relationDescriptions: {} };
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
    return String(getPath(locale(), `relationDescriptions.${key}`) ?? EXTRA_RELATION_DESCRIPTIONS[localeCode()]?.[key] ?? key);
  }

  function mode(key) {
    return value(`modes.${key}`);
  }

  function sourceName(raw) {
    const source = String(raw || '').trim();
    if (!source) return '';
    const explicit = SOURCE_NAMES[localeCode()]?.[source];
    if (explicit) return explicit;
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
