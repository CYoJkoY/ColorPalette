(() => {
  const FALLBACK = 'zh-CN';

  function localeCode() {
    return window.ColorPalettePreferences?.language === 'en-US'
      ? 'en-US'
      : (window.ColorPalettePreferences?.language || FALLBACK);
  }

  function locale() {
    const locales = window.ColorPaletteLocales || {};
    return locales[localeCode()] || locales[FALLBACK] || { ui: {}, relations: {}, modes: {} };
  }

  function getPath(source, path) {
    return String(path).split('.').reduce((value, key) => value == null ? undefined : value[key], source);
  }

  function t(key, fallback = key) {
    const value = getPath(locale(), key);
    return value == null ? fallback : String(value);
  }

  function relation(key, fallback = key) {
    return locale().relations?.[key] ?? fallback;
  }

  function mode(key, fallback = key) {
    return locale().modes?.[key] ?? fallback;
  }

  function ui(text) {
    const dictionary = locale().ui || {};
    return dictionary[text] ?? text;
  }

  window.ColorPaletteI18n = {
    get locale() { return localeCode(); },
    get data() { return locale(); },
    t,
    ui,
    relation,
    mode
  };
})();
