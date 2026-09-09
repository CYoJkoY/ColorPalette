(() => {
  const FALLBACK = 'zh-CN';

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
    return value(`relationDescriptions.${key}`);
  }

  function mode(key) {
    return value(`modes.${key}`);
  }

  window.ColorPaletteI18n = {
    get locale() { return localeCode(); },
    get data() { return locale(); },
    t: value,
    relation,
    relationDescription,
    mode
  };
})();
