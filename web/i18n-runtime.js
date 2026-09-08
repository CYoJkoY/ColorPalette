(() => {
  'use strict';

  const CJK = /[\u3400-\u9fff]/;

  const EN_TO_ZH_FIXED = {
    'COLOR TOOLKIT':'颜色工具箱','COLOR TOOLKIT':'颜色工具箱','DISCOVER':'发现','CREATE':'创作','EXTRACT':'取色',
    'PREVIEW':'预览','PALETTE':'色卡','GENERATED':'生成建议','BASE COLOR':'基础色','Primary':'主色',
    'Manual Palette':'手动色卡','Current palette':'当前色卡','Base color':'基础色','Generated':'生成建议','Suggestions':'建议区',
    'Suggestions · not added automatically':'建议区 · 不会自动写入当前色卡','Editing does not rebuild the palette':'编辑不会重建色卡',
    'Enter values directly':'直接输入数值','Arrange your colors to refine the palette':'拖动顺序可继续整理','Click to add':'点击加入',
    'Add current color':'加入当前颜色','A palette can contain up to 8 colors':'色卡最多保存 8 个颜色',
    'This color is already in the palette':'这个颜色已经在当前色卡中','This scheme did not generate any usable colors.':'这个关系没有生成可用颜色。',
    'No colors have been added yet. Edit the base color, then add it to the palette.':'还没有加入色卡。先编辑基础色，再点击“加入当前颜色”。',
    'Add at least 2 colors to save':'至少加入 2 个颜色后才能保存',
    'Changing the scheme only updates the suggestions; the current palette stays unchanged.':'切换关系只更新右侧“生成建议”，当前色卡保持不变。',
    'Edit the base color and parameters independently. Related colors are suggestions only and never overwrite your current palette.':'编辑基础色与参数，独立管理当前色卡。关系色只是建议，不会在你修改颜色时覆盖已有色卡。',
    'At least 2 colors are required':'至少需要 2 个颜色','Palette saved':'色卡已保存','Move up':'上移','Move down':'下移','Delete':'删除',
    'Color 01':'颜色 01','Color 02':'颜色 02','Color 03':'颜色 03','Color 04':'颜色 04','Color 05':'颜色 05','Color 06':'颜色 06','Color 07':'颜色 07','Color 08':'颜色 08',
    'Click to add':'点击加入','Suggestions':'建议区','colors':'个颜色'
  };

  const FALLBACK_EN = {
    'COLOR TOOLKIT':'Color Toolkit','DISCOVER':'Discover','CREATE':'Create','EXTRACT':'Extract','PREVIEW':'Preview','PALETTE':'Palette','GENERATED':'Generated','BASE COLOR':'Base Color',
    '当前色卡':'Current palette','手动色卡':'Manual palette','当前基础色':'Base color','生成建议':'Generated','建议区':'Suggestions','建议区 · 不会自动写入当前色卡':'Suggestions · not added automatically',
    '编辑不会重建色卡':'Editing does not rebuild the palette','直接输入数值':'Enter values directly','拖动顺序可继续整理':'Arrange your colors to refine the palette','点击加入':'Click to add','加入当前颜色':'Add current color',
    '色卡最多保存 8 个颜色':'A palette can contain up to 8 colors','这个颜色已经在当前色卡中':'This color is already in the palette','这个关系没有生成可用颜色。':'This scheme did not generate any usable colors.',
    '还没有加入色卡。先编辑基础色，再点击“加入当前颜色”。':'No colors have been added yet. Edit the base color, then add it to the palette.',
    '至少加入 2 个颜色后才能保存':'Add at least 2 colors to save','切换关系只更新右侧“生成建议”，当前色卡保持不变。':'Changing the scheme only updates the suggestions; the current palette stays unchanged.',
    '编辑基础色与参数，独立管理当前色卡。关系色只是建议，不会在你修改颜色时覆盖已有色卡。':'Edit the base color and parameters independently. Related colors are suggestions only and never overwrite your current palette.',
    '至少需要 2 个颜色':'At least 2 colors are required','色卡已保存':'Palette saved','上移':'Move up','下移':'Move down','删除':'Delete'
  };

  function language() { return window.ColorPalettePreferences?.language === 'en' ? 'en' : 'zh'; }
  function locale(code) {
    const locales = window.ColorPaletteLocales || {};
    return locales[code === 'en' ? 'en-US' : 'zh-CN'] || { ui: {}, relations: {}, modes: {} };
  }
  function buildMaps() {
    const en = locale('en').ui || {};
    const zh = locale('zh').ui || {};
    const enMap = new Map();
    const zhMap = new Map(Object.entries(EN_TO_ZH_FIXED));
    for (const [source, translated] of Object.entries(en)) {
      if (!source || !translated || source === translated) continue;
      enMap.set(source, translated);
      if (!zhMap.has(translated)) zhMap.set(translated, source);
    }
    for (const [source, translated] of Object.entries(FALLBACK_EN)) {
      if (!source || !translated || source === translated) continue;
      enMap.set(source, translated);
    }
    return { enMap, zhMap };
  }
  let maps = buildMaps();
  function refreshMaps() { maps = buildMaps(); }
  function replaceKnown(source, map) {
    let result = source;
    for (const [from, to] of [...map.entries()].sort((a, b) => b[0].length - a[0].length)) {
      if (result.includes(from)) result = result.split(from).join(to);
    }
    return result;
  }
  function toEnglish(source) {
    const colors = window.colorMeta?.colors || [];
    const direct = colors.find(item => item && item.name === source);
    let result = direct ? `Named Color ${direct.hex}` : source;
    result = replaceKnown(result, maps.enMap);
    if (!CJK.test(result)) return result;
    return result.replace(/[\u3400-\u9fff]+/g, match => {
      const color = colors.find(item => item && item.name === match);
      return color ? `Named Color ${color.hex}` : '';
    }).replace(/\s{2,}/g, ' ').trim();
  }
  function toChinese(source) {
    return replaceKnown(source, maps.zhMap);
  }
  function translateText(text) {
    const source = String(text ?? '');
    if (!source.trim()) return source;
    refreshMaps();
    return language() === 'en' ? toEnglish(source) : toChinese(source);
  }
  function translate(root = document.body) {
    if (!root) return;
    refreshMaps();
    const english = language() === 'en';
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement?.closest('script,style,noscript,template')) continue;
      const source = node.__cpOriginalText ?? node.__cpLocaleOriginal ?? node.nodeValue;
      if (node.__cpOriginalText == null) node.__cpOriginalText = source;
      if (node.__cpLocaleOriginal == null) node.__cpLocaleOriginal = source;
      const next = english ? toEnglish(source) : toChinese(source);
      if (node.nodeValue !== next) node.nodeValue = next;
    }
    root.querySelectorAll?.('input[placeholder],textarea[placeholder],[title],[aria-label]').forEach(element => {
      ['placeholder','title','aria-label'].forEach(attr => {
        if (!element.hasAttribute(attr)) return;
        const key = `cpOriginal${attr[0].toUpperCase()}${attr.slice(1)}`;
        const source = element.dataset[key] ?? element.getAttribute(attr) ?? '';
        element.dataset[key] = source;
        element.setAttribute(attr, english ? toEnglish(source) : toChinese(source));
      });
    });
    document.documentElement.lang = english ? 'en' : 'zh-CN';
    document.title = english ? 'ColorPalette — Color Workspace' : 'ColorPalette — 颜色工作台';
  }
  function rerender() {
    refreshMaps();
    try { window.route?.(); } catch (_) {}
    requestAnimationFrame(() => translate(document.body));
  }
  function install() {
    const observer = new MutationObserver(mutations => {
      if (mutations.some(m => m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length))) requestAnimationFrame(() => translate(document.body));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('colorpalette:localechange', rerender);
    window.addEventListener('hashchange', () => requestAnimationFrame(() => translate(document.body)));
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => translate(document.body), { once: true });
    else translate(document.body);
  }
  window.ColorPaletteI18nRuntime = { translate, translateText, rerender, refreshMaps };
  install();
})();
