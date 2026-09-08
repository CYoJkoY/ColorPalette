(() => {
  const STORE = 'colorpalette-preferences-v1';
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (_) { return {}; }
  })();

  let language = saved.language === 'en' ? 'en' : 'zh';
  let theme = saved.theme === 'dark' ? 'dark' : 'light';

  const translations = {
    '发现':'Discover','取色':'Extract','创作':'Create','颜色百科':'Color Library','收藏':'Favorites','工作区':'Workspace',
    '首页':'Home','颜色工作台':'Color Workspace','从图片取色':'Extract from Image','开始创作':'Start Creating','浏览颜色百科':'Browse Color Library',
    '精选色卡':'Featured Palettes','三步完成一张色卡':'Create a Palette in Three Steps','找色':'Find Colors','生成':'Generate','收藏':'Save',
    '搜索名称、英文名或 HEX':'Search name, English name, or HEX','点击色块查看详情':'Click a color to view details','颜色百科':'Color Library',
    '色彩体系':'Color System','色相分类':'Color Family','全部':'All','类似色':'Analogous','互补色':'Complementary','分裂互补':'Split Complementary',
    '三角色':'Triadic','四角色':'Tetradic','双互补':'Double Complementary','单色阶':'Monochromatic','浅色阶':'Tints','深色阶':'Shades',
    '柔和色阶':'Tones','粉彩':'Pastel','鲜艳':'Vivid','暖色':'Warm','冷色':'Cool','灰阶':'Grayscale','颜色':'Colors','个颜色':'colors',
    '配色模式':'Palette Modes','命名颜色':'Named Colors','颜色体系':'Color Systems','浏览器本地优先':'Local-first in your browser',
    '图片不会上传到服务器':'Images are never uploaded to a server','COLOR TOOLKIT':'COLOR TOOLKIT','COLOR LIBRARY':'COLOR LIBRARY','DISCOVER':'DISCOVER',
    '我的色卡':'My Palette','我的收藏':'My Favorites','最近使用':'Recently Used','工作区':'Workspace','打开工作区':'Open Workspace',
    '新建色卡':'New Palette','保存色卡':'Save Palette','导出':'Export','删除':'Delete','复制':'Copy','应用':'Use','使用':'Use','清空':'Clear',
    '取消':'Cancel','确认':'Confirm','名称':'Name','来源':'Source','自定义':'Custom','添加颜色':'Add Color','移除':'Remove',
    '上传图片':'Upload Image','选择图片':'Choose Image','从图片中提取颜色':'Extract colors from an image','打开创作':'Open Studio',
    '重新取色':'Pick Again','暂无收藏':'No favorites yet','暂无色卡':'No saved palettes yet','暂无最近颜色':'No recent colors yet',
    '颜色关系':'Color Relationships','相近颜色':'Nearby Colors','色阶':'Lightness Scale','对比度':'Contrast','颜色信息':'Color Information',
    '复制 HEX':'Copy HEX','收藏颜色':'Favorite Color','取消收藏':'Unfavorite','RGB':'RGB','HSL':'HSL','OKLab':'OKLab','OKLCH':'OKLCH',
    '明度':'Lightness','饱和度':'Saturation','色相':'Hue','对比度等级':'Contrast Grade','可读性':'Readability',
    '导出 JSON':'Export JSON','导出 CSS':'Export CSS','重置':'Reset','随机':'Random','刷新':'Refresh','添加到色卡':'Add to Palette',
    '浏览颜色百科':'Browse Color Library','进入颜色百科':'Open Color Library','返回':'Back','下一步':'Next','上一步':'Previous',
    '日间模式':'Light mode','夜间模式':'Dark mode','中':'Chinese','EN':'English','中 / 日传统色 · CSS · 颜料':'Traditional colors · CSS · pigments',
    '按色彩体系、色相和名称快速定位颜色；点色块查看完整参数、相近颜色与色阶。':'Find colors by system, hue, or name; open a swatch for full parameters, nearby colors, and scales.',
    '来自整理后的多套色彩体系':'Curated from multiple color systems','类似、互补、三角色、粉彩、冷暖等':'Analogous, complementary, triadic, pastel, warm/cool, and more',
    '选择类似、互补、三角色、粉彩、冷暖等配色方式。':'Choose analogous, complementary, triadic, pastel, warm/cool, and other schemes.',
    '搜索名称、HEX，或者按色彩体系与色相浏览。':'Search by name or HEX, or browse by color system and hue.',
    '把最终颜色组合保存到自己的色卡库。':'Save the final combination to your personal palette library.',
    '原生浏览器运行，图片和收藏数据留在本机。':'Runs natively in the browser; images and saved data stay on this device.'
  };

  function save() {
    localStorage.setItem(STORE, JSON.stringify({ language, theme }));
  }

  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const button = document.querySelector('#theme-switch');
    if (button) {
      button.setAttribute('aria-checked', String(theme === 'dark'));
      button.title = language === 'zh' ? (theme === 'dark' ? '切换到日间模式' : '切换到夜间模式') : (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#111214' : '#F7F7F4';
  }

  function translateText(text) {
    if (language === 'zh') return text;
    let out = text;
    Object.entries(translations)
      .sort((a, b) => b[0].length - a[0].length)
      .forEach(([zh, en]) => { out = out.split(zh).join(en); });
    out = out.replace(/^(\d+) 个颜色$/, '$1 colors');
    out = out.replace(/^(\d+) 个命名颜色$/, '$1 named colors');
    out = out.replace(/^(\d+) 个颜色 ·/, '$1 colors ·');
    return out;
  }

  function translate(root = document.body) {
    if (language === 'zh') {
      root.querySelectorAll('[data-i18n-original]').forEach(node => {
        node.nodeValue = node.getAttribute('data-i18n-original');
        node.removeAttribute('data-i18n-original');
      });
    } else {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        if (!node.nodeValue.trim() || node.parentElement?.closest('script,style')) return;
        if (!node.hasAttribute('data-i18n-original')) node.setAttribute('data-i18n-original', node.nodeValue);
        node.nodeValue = translateText(node.getAttribute('data-i18n-original'));
      });
    }
    root.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el => {
      const original = el.dataset.i18nPlaceholder || el.placeholder;
      if (!el.dataset.i18nPlaceholder) el.dataset.i18nPlaceholder = original;
      el.placeholder = translateText(original);
    });
    root.querySelectorAll('[title]').forEach(el => {
      const original = el.dataset.i18nTitle || el.title;
      if (!el.dataset.i18nTitle) el.dataset.i18nTitle = original;
      el.title = translateText(original);
    });
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    const langButton = document.querySelector('#language-switch');
    if (langButton) {
      langButton.setAttribute('aria-checked', String(language === 'en'));
      langButton.title = language === 'zh' ? '切换中文 / English' : 'Switch Chinese / English';
    }
  }

  function addControls() {
    const languageButton = document.querySelector('#language-switch');
    const themeButton = document.querySelector('#theme-switch');
    if (!languageButton || !themeButton) return;
    languageButton.addEventListener('click', () => {
      language = language === 'zh' ? 'en' : 'zh';
      save();
      translate();
      applyTheme();
    });
    themeButton.addEventListener('click', () => {
      theme = theme === 'light' ? 'dark' : 'light';
      save();
      applyTheme();
    });
    applyTheme();
    translate();
  }

  function boot() {
    addControls();
    const observer = new MutationObserver(mutations => {
      if (language !== 'en') return;
      mutations.forEach(m => m.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) translate(node);
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.ColorPalettePreferences = { get language() { return language; }, get theme() { return theme; }, translate, applyTheme };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
