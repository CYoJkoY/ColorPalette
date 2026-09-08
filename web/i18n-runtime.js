(() => {
  'use strict';

  // Localization policy:
  // 1. Renderers own the language of the UI they create.
  // 2. This runtime is only a compatibility layer for legacy renderers.
  // 3. Never translate an already-translated DOM as the new source of truth.
  // 4. Prefer the canonical locale dictionaries over ad-hoc string tables.

  const CJK = /[\u3400-\u9fff]/;
  const LATIN_WORD = /[A-Za-z]{2,}/;
  const TECHNICAL_EN = /^(?:ColorPalette|HEX|RGB|HSV|HSB|HSL|OKLab|OKLCH|DeltaE|CSS|JSON|SCSS|Tailwind|WCAG|PNG|JPG|WebP|GitHub|Pages|Pro|Primary|EN)$/i;

  const FALLBACK_EN = {
    'COLOR TOOLKIT':'Color Toolkit','DISCOVER':'Discover','CREATE':'Create','EXTRACT':'Extract','PREVIEW':'Preview','PALETTE':'Palette','GENERATED':'Generated','BASE COLOR':'Base Color',
    'Primary':'Primary','Color 01':'Color 01','Color 02':'Color 02','Color 03':'Color 03','Color 04':'Color 04','Color 05':'Color 05','Color 06':'Color 06','Color 07':'Color 07','Color 08':'Color 08','colors':'colors',
    '当前色卡':'Current palette','手动色卡':'Manual palette','当前基础色':'Base color','生成建议':'Generated','建议区':'Suggestions','建议区 · 不会自动写入当前色卡':'Suggestions · not added automatically',
    '编辑不会重建色卡':'Editing does not rebuild the palette','直接输入数值':'Enter values directly','拖动顺序可继续整理':'Arrange your colors to refine the palette','点击加入':'Click to add','加入当前颜色':'Add current color',
    '色卡最多保存 8 个颜色':'A palette can contain up to 8 colors','这个颜色已经在当前色卡中':'This color is already in the palette','这个关系没有生成可用颜色。':'This scheme did not generate any usable colors。'.replace('。','.'),
    '还没有加入色卡。先编辑基础色，再点击“加入当前颜色”。':'No colors have been added yet. Edit the base color, then add it to the palette.',
    '至少加入 2 个颜色后才能保存':'Add at least 2 colors to save','切换关系只更新右侧“生成建议”，当前色卡保持不变。':'Changing the scheme only updates the suggestions; the current palette stays unchanged。'.replace('。','.'),
    '编辑基础色与参数，独立管理当前色卡。关系色只是建议，不会在你修改颜色时覆盖已有色卡。':'Edit the base color and parameters independently. Related colors are suggestions only and never overwrite your current palette.',
    '至少需要 2 个颜色':'At least 2 colors are required','色卡已保存':'Palette saved','输入':'Input','增加':'Increase','减少':'Decrease','上移':'Move up','下移':'Move down','删除':'Delete'
  };

  function language() {
    return window.ColorPalettePreferences?.language === 'en' ? 'en' : 'zh';
  }

  function locale(code) {
    const all = window.ColorPaletteLocales || {};
    return all[code === 'en' ? 'en-US' : 'zh-CN'] || { ui: {}, relations: {}, modes: {} };
  }

  function buildMaps() {
    const en = locale('en').ui || {};
    const zh = locale('zh').ui || {};
    const enMap = new Map();
    const zhMap = new Map();

    for (const [source, translated] of Object.entries(en)) {
      if (!source || !translated || source === translated) continue;
      enMap.set(source, translated);
      zhMap.set(translated, source);
    }
    for (const [source, translated] of Object.entries(FALLBACK_EN)) {
      if (!source || !translated || source === translated) continue;
      enMap.set(source, translated);
      zhMap.set(translated, source);
    }

    // The Chinese locale may define additional canonical text that is not
    // present in the English locale. Use the English dictionary as the source
    // for reverse lookup and keep explicit fixed fallbacks for redesign text.
    for (const [source, translated] of Object.entries(zh)) {
      if (!source || !translated || source === translated) continue;
      if (!enMap.has(source) && /[\u3400-\u9fff]/.test(source)) enMap.set(source, translated);
      if (!zhMap.has(translated) && /[A-Za-z]/.test(translated)) zhMap.set(translated, source);
    }

    return { enMap, zhMap };
  }

  let maps = buildMaps();

  function refreshMaps() {
    maps = buildMaps();
  }

  function replaceKnown(source, map) {
    let result = source;
    const entries = [...map.entries()].sort((a, b) => b[0].length - a[0].length);
    for (const [from, to] of entries) {
      if (result.includes(from)) result = result.split(from).join(to);
    }
    return result;
  }

  function translateColorName(source, english) {
    if (!english) return source;
    const colors = window.colorMeta?.colors || [];
    const color = colors.find(item => item && item.name === source);
    return color ? `Named Color ${color.hex}` : source;
  }

  function scrubEnglish(source) {
    // A legacy renderer may leave a previously unmapped Chinese fragment.
    // Never expose that fragment in the English UI. First map color data names;
    // then replace any isolated CJK residue with a neutral English label.
    const colorTranslated = translateColorName(source, true);
    if (!CJK.test(colorTranslated)) return colorTranslated;
    const mapped = replaceKnown(colorTranslated, maps.enMap);
    if (!CJK.test(mapped)) return mapped;

    const parts = mapped.split(/([\u3400-\u9fff]+)/g);
    const out = parts.map((part, index) => {
      if (!CJK.test(part)) return part;
      const compact = part.trim();
      if (!compact) return part;
      const known = translateColorName(compact, true);
      if (!CJK.test(known)) return known;
      return index === 0 && parts.length <= 3 ? 'Label' : '';
    }).join('');
    return out.replace(/\s{2,}/g, ' ').trim();
  }

  function scrubChinese(source) {
    const mapped = replaceKnown(source, maps.zhMap);
    return mapped;
  }

  function translateText(text) {
    const source = String(text ?? '');
    if (!source.trim()) return source;
    refreshMaps();
    return language() === 'en' ? scrubEnglish(source) : scrubChinese(source);
  }

  function translateAttributeValue(value) {
    return translateText(value);
  }

  function translate(root = document.body) {
    if (!root) return;
    refreshMaps();
    const english = language() === 'en';

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement?.closest('script,style,noscript,template')) continue;
      const source = node.dataset?.cpOriginalText || node.__cpOriginalText || node.__cpLocaleOriginal || node.nodeValue;
      if (node.__cpOriginalText == null) node.__cpOriginalText = source;
      if (!node.dataset) Object.defineProperty(node, 'dataset', { value: {} });
      node.dataset.cpOriginalText = source;
      const next = english ? scrubEnglish(source) : scrubChinese(source);
      if (node.nodeValue !== next) node.nodeValue = next;
    }

    root.querySelectorAll?.('input[placeholder],textarea[placeholder],[title],[aria-label]').forEach(element => {
      ['placeholder', 'title', 'aria-label'].forEach(attr => {
        if (!element.hasAttribute(attr)) return;
        const key = `cpOriginal${attr[0].toUpperCase()}${attr.slice(1)}`;
        const source = element.dataset[key] ?? element.getAttribute(attr) ?? '';
        element.dataset[key] = source;
        element.setAttribute(attr, translateAttributeValue(source));
      });
    });

    document.documentElement.lang = english ? 'en' : 'zh-CN';
    document.title = english ? 'ColorPalette — Color Workspace' : 'ColorPalette — 颜色工作台';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = english
      ? 'ColorPalette: image color extraction, color library, palette generation, favorites and workspace.'
      : 'ColorPalette：图片取色、颜色百科、配色生成、色卡收藏与工作区。';
  }

  function rerender() {
    refreshMaps();
    try { window.route?.(); } catch (_) {}
    requestAnimationFrame(() => translate(document.body));
  }

  function install() {
    const observer = new MutationObserver(mutations => {
      if (mutations.some(m => m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length))) {
        requestAnimationFrame(() => translate(document.body));
      }
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
