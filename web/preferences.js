(() => {
  const STORE = 'colorpalette-preferences-v4';
  const saved = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORE)) || JSON.parse(localStorage.getItem('colorpalette-preferences-v3')) || JSON.parse(localStorage.getItem('colorpalette-preferences-v2')) || {};
    } catch (_) {
      return {};
    }
  })();

  const browserLanguage = String(navigator.language || '').toLowerCase();
  let language = saved.language === 'en' || saved.language === 'zh'
    ? saved.language
    : (browserLanguage.startsWith('zh') ? 'zh' : 'en');
  let theme = saved.theme === 'dark' || saved.theme === 'light' ? saved.theme : 'light';
  let suppressNextClick = false;

  const localeCode = () => language === 'en' ? 'en-US' : 'zh-CN';
  const locale = () => window.ColorPaletteLocales?.[localeCode()] || window.ColorPaletteLocales?.['zh-CN'] || { ui: {} };
  const save = () => localStorage.setItem(STORE, JSON.stringify({ language, theme }));

  const EXTRA_EN = {
    '首页': 'Home', '主导航': 'Main navigation', '移动端导航': 'Mobile navigation', '界面偏好设置': 'Interface preferences',
    '找到颜色，也做出自己的颜色。': 'Find colors, then make your own.',
    '从图片取色、颜色百科、配色生成开始，再把结果整理成自己的色卡。原生浏览器运行，图片和收藏数据留在本机。': 'Extract colors from images, explore the color library, generate palettes, and save your own palette sets. Runs natively in the browser; images and saved data stay on this device.',
    '颜色百科': 'Color Library', '个命名颜色': ' named colors', '个颜色': ' colors',
    '中 / 日传统色': 'Traditional Chinese / Japanese colors', '颜料': 'Pigments', '来自整理后的多套色彩体系': 'Curated from multiple color systems',
    '精选色卡': 'Featured Palettes', '浏览颜色百科': 'Browse Color Library', '三步完成一张色卡': 'Create a Palette in Three Steps',
    '搜索名称、HEX，或者按色彩体系与色相浏览。': 'Search by name or HEX, or browse by color system and hue.',
    '选择类似、互补、三角色、粉彩、冷暖等配色方式。': 'Choose analogous, complementary, triadic, pastel, warm/cool, and other schemes.',
    '把最终颜色组合保存到自己的色卡库。': 'Save the final color combination to your personal palette library.',
    '主色': 'Primary', '强调色': 'Accent', '辅助色': 'Support', '样本': 'samples', 'samples': 'samples',
    '图片色卡': 'Image Palette', '图片只在浏览器内处理。自动提取代表色，也可以直接点击图片获取像素 HEX。': 'Images are processed only in the browser. Extract representative colors automatically or click the image to sample a pixel HEX value.',
    '选择一张图片开始。': 'Choose an image to begin.', '支持 JPG、PNG、WebP 等浏览器可读取格式。': 'Supports JPG, PNG, WebP, and other formats readable by the browser.',
    '尚未提取颜色。': 'No colors extracted yet.', '颜色数据加载失败：': 'Failed to load color data: ', '重新加载': 'Reload',
    '至少需要 2 个颜色': 'At least 2 colors are required', '色卡已保存': 'Palette saved', '颜色已收藏': 'Color added to favorites', '已取消收藏': 'Removed from favorites',
    '确定清空全部收藏？': 'Clear all favorites?', '还没有收藏。去颜色百科或 Palette Studio 保存一些颜色。': 'No favorites yet. Save some colors from the Color Library or Palette Studio.',
    '工作区还是空的。': 'The workspace is empty.', '暂无最近颜色。': 'No recent colors yet.', '暂无内容': 'Nothing here yet.',
    '自定义颜色': 'Custom Color', '未知': 'Unknown', '用户输入': 'User input', '自定义': 'Custom',
    '参数': 'Parameters', '用于创作': 'Use in Studio', '颜色参数': 'Color Parameters', '感知明度阶': 'Perceptual Lightness Scale',
    '使用 OKLab Lightness 构建比传统 HSL 更连贯的明度渐变，适合 UI 层级、背景和状态。': 'OKLab Lightness creates a more coherent lightness progression than traditional HSL, useful for UI hierarchy, backgrounds, and states.',
    '每组关系都可以完整带入 Palette Studio。': 'Every relationship can be sent directly into Palette Studio.', '每个颜色': 'each color',
    '白色背景': 'White background', '黑色背景': 'Black background', '对比度遵循 WCAG 相对亮度公式。': 'Contrast follows the WCAG relative luminance formula.',
    '附近颜色': 'Nearby Colors', 'OKLab 距离': 'OKLab distance', '颜色关系': 'Color Relationships', '相近颜色': 'Nearby Colors',
    '色阶': 'Lightness Scale', '对比度': 'Contrast', '颜色信息': 'Color Information', '对比度等级': 'Contrast Grade', '可读性': 'Readability',
    'Palette Studio': 'Palette Studio', '从一个颜色开始，生成关系色，手动编辑并保存为自己的色卡。': 'Start from one color, generate related colors, edit them, and save your own palette.',
    '色卡名称': 'Palette name', '当前色卡': 'Current palette', '加入当前颜色': 'Add current color', '生成：': 'Generated: ', '颜色组': 'color group',
    '工作区': 'Workspace', '集中查看本机保存的色卡、最近使用的颜色，并继续编辑。': 'View saved palettes and recently used colors on this device, then continue editing.',
    '我的色卡': 'My Palettes', '编辑': 'Edit', '复制色值': 'Copy values', '删除': 'Delete', '最近颜色': 'Recent colors',
    '收藏内容': 'Favorites', '保存的颜色与色卡都留在浏览器本地。': 'Saved colors and palettes stay locally in the browser.', '清空': 'Clear', '移除': 'Remove',
    '专业版': 'Pro', 'Pro 能力预留': 'Pro capabilities placeholder', '当前 GitHub Pages 版本优先保持免费、本地优先和无账号使用。这里保留未来扩展入口，不伪造支付或会员系统。': 'The current GitHub Pages version prioritizes free, local-first, account-free use. This page reserves an extension point without pretending to provide a payment or membership system.',
    '更高级的色彩空间': 'Advanced color spaces', '更完整的导出': 'More complete exports', '工作区同步': 'Workspace sync',
    '继续扩展 OKLab / OKLCH、DeltaE、可访问性检查和感知均匀的配色算法。': 'Expand OKLab / OKLCH, DeltaE, accessibility checks, and perceptually uniform palette algorithms.',
    '可扩展 CSS、SCSS、JSON、Design Tokens、Tailwind 等开发工作流导出。': 'Extend exports for CSS, SCSS, JSON, Design Tokens, Tailwind, and other development workflows.',
    '未来可以增加可选云同步；当前版本不上传你的图片或本地色卡。': 'Optional cloud synchronization may be added later; the current version does not upload your images or local palettes.',
    '浏览器本地优先': 'Local-first in your browser', '图片不会上传到服务器': 'Images are never uploaded to a server',
    '日间模式': 'Light mode', '夜间模式': 'Dark mode', '切换到日间模式': 'Switch to light mode', '切换到夜间模式': 'Switch to dark mode',
    '切换中文 / English': 'Switch Chinese / English', '选择图片': 'Choose Image', '清除': 'Clear', '保存为色卡': 'Save as Palette',
    '打开 Palette Studio': 'Open Palette Studio', '打开创作': 'Open Studio', '重新取色': 'Pick Again', '导出 JSON': 'Export JSON', '导出 CSS': 'Export CSS',
    '添加到色卡': 'Add to Palette', '进入颜色百科': 'Open Color Library', '返回': 'Back', '下一步': 'Next', '上一步': 'Previous',
    '复制': 'Copy', '应用': 'Use', '使用': 'Use', '取消': 'Cancel', '确认': 'Confirm', '名称': 'Name', '来源': 'Source',
    '当前 GitHub Pages 版本': 'Current GitHub Pages version', '免费': 'Free', '无账号': 'No account', '图片取色': 'Image Extraction', '颜色工具箱': 'Color Toolkit'
  };

  function translateText(text) {
    if (language === 'zh') return String(text);
    let out = String(text);
    const dictionary = { ...window.ColorPaletteLocales?.['en-US']?.ui, ...EXTRA_EN };
    Object.entries(dictionary)
      .sort((a, b) => String(b[0]).length - String(a[0]).length)
      .forEach(([zh, en]) => { out = out.split(zh).join(en); });
    return out
      .replace(/^(\d+) 个命名颜色$/, '$1 named colors')
      .replace(/^(\d+) 个颜色$/, '$1 colors')
      .replace(/^(\d+) 个命名颜色 · /, '$1 named colors · ')
      .replace(/^(\d+) 个颜色 · /, '$1 colors · ')
      .replace(/^(\d+) samples$/, '$1 samples')
      .replace(/^(\d+) 个颜色$/, '$1 colors');
  }

  function translateAttribute(el, attribute) {
    const originalKey = `cp${attribute[0].toUpperCase()}${attribute.slice(1)}`;
    if (!el.dataset[originalKey]) el.dataset[originalKey] = el.getAttribute(attribute) || '';
    const original = el.dataset[originalKey];
    if (original) el.setAttribute(attribute, language === 'en' ? translateText(original) : original);
  }

  function updateMeta() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#111214' : '#F7F7F4';
    document.title = language === 'zh' ? 'ColorPalette — 颜色工作台' : 'ColorPalette — Color Workspace';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = language === 'zh'
      ? 'ColorPalette：图片取色、颜色百科、配色生成、色卡收藏与工作区。'
      : 'ColorPalette: image color extraction, color library, palette generation, favorites and workspace.';
  }

  function setPreferenceState(button, state) {
    if (!button) return;
    button.dataset.state = state;
    button.setAttribute('aria-checked', String(state === 'en' || state === 'dark'));
    button.classList.toggle('is-active', state === 'en' || state === 'dark');
  }

  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const button = document.querySelector('#theme-switch');
    if (button) {
      const label = language === 'zh'
        ? (theme === 'dark' ? '切换到日间模式' : '切换到夜间模式')
        : (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      button.setAttribute('aria-label', label);
      button.title = label;
      setPreferenceState(button, theme);
    }
    updateMeta();
  }

  function translate(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (!node.nodeValue.trim() || node.parentElement?.closest('script,style')) return;
      if (!node.__cpOriginal) node.__cpOriginal = node.nodeValue;
      node.nodeValue = language === 'en' ? translateText(node.__cpOriginal) : node.__cpOriginal;
    });
    root.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el => translateAttribute(el, 'placeholder'));
    root.querySelectorAll('[title]').forEach(el => translateAttribute(el, 'title'));
    root.querySelectorAll('[aria-label]').forEach(el => translateAttribute(el, 'aria-label'));

    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    const languageButton = document.querySelector('#language-switch');
    if (languageButton) {
      const label = language === 'zh' ? '切换中文 / English' : 'Switch Chinese / English';
      languageButton.setAttribute('aria-label', label);
      languageButton.title = label;
      setPreferenceState(languageButton, language);
    }
    updateMeta();
  }

  function notifyLocaleChange() {
    window.dispatchEvent(new CustomEvent('colorpalette:localechange', { detail: { language, locale: localeCode() } }));
  }

  function setLanguage(next) {
    language = next === 'en' ? 'en' : 'zh';
    save();
    translate();
    applyTheme();
    notifyLocaleChange();
  }

  function setTheme(next) {
    theme = next === 'dark' ? 'dark' : 'light';
    save();
    applyTheme();
  }

  function installSwipe(button, toggle) {
    let startX = null;
    let startY = null;
    button.addEventListener('pointerdown', event => {
      startX = event.clientX;
      startY = event.clientY;
      button.setPointerCapture?.(event.pointerId);
    });
    button.addEventListener('pointerup', event => {
      if (startX == null) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      startX = startY = null;
      if (Math.abs(dx) >= 18 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        suppressNextClick = true;
        toggle(dx > 0 ? 'right' : 'left');
        window.setTimeout(() => { suppressNextClick = false; }, 350);
      }
    });
    button.addEventListener('pointercancel', () => { startX = startY = null; });
  }

  function boot() {
    const languageButton = document.querySelector('#language-switch');
    const themeButton = document.querySelector('#theme-switch');
    if (!languageButton || !themeButton) return;

    languageButton.addEventListener('click', () => {
      if (suppressNextClick) { suppressNextClick = false; return; }
      setLanguage(language === 'zh' ? 'en' : 'zh');
    });
    themeButton.addEventListener('click', () => {
      if (suppressNextClick) { suppressNextClick = false; return; }
      setTheme(theme === 'light' ? 'dark' : 'light');
    });

    installSwipe(languageButton, direction => setLanguage(direction === 'right' ? 'en' : 'zh'));
    installSwipe(themeButton, direction => setTheme(direction === 'right' ? 'dark' : 'light'));

    applyTheme();
    translate();

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && language === 'en') translate(node);
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.ColorPalettePreferences = {
      get language() { return language; },
      get locale() { return localeCode(); },
      get theme() { return theme; },
      t: translateText,
      tKey: (key, fallback) => window.ColorPaletteI18n?.t(key, fallback) ?? fallback,
      lookup: text => locale().ui?.[text] ?? EXTRA_EN[text] ?? text,
      setLanguage,
      setTheme,
      translate,
      applyTheme
    };
    notifyLocaleChange();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
