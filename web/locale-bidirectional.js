(() => {
  const reverse = {
    ...window.ColorPaletteCompleteLocale?.reverseZh,
    'Discover':'发现','Extract':'取色','Create':'创作','Color Library':'颜色百科','Favorites':'收藏','Workspace':'工作区',
    'Palette Studio':'配色工作室','Color Relationships':'颜色关系','Nearby Colors':'相近颜色','Lightness Scale':'明度阶','Contrast':'对比度','Color Information':'颜色信息',
    'Custom Color':'自定义颜色','Custom':'自定义','Unknown':'未知','User input':'用户输入','Use in Studio':'用于创作','Favorite Color':'收藏颜色','Unfavorite':'取消收藏',
    'Color Parameters':'颜色参数','Perceptual Lightness Scale':'感知明度阶','Contrast Check':'对比度检查','White background':'白色背景','Black background':'黑色背景','OKLab distance':'OKLab 距离',
    'Color Relationship':'配色关系','Palette Name':'色卡名称','Add Current Color':'加入当前颜色','Current Palette':'当前色卡','Generated: ':'生成：','Export CSS':'导出 CSS','Export JSON':'导出 JSON',
    'Extraction Results':'提取结果','Choose Image':'选择图片','Clear':'清除','Reload':'重新加载','Copied':'已复制','Copy':'复制','Delete':'删除','Edit':'编辑','Remove':'移除','Use':'使用',
    'Save Palette':'保存色卡','New Palette':'新建色卡','Add Color':'添加颜色','No saved palettes yet':'暂无色卡','No favorites yet':'暂无收藏','No recent colors yet.':'暂无最近颜色。','Nothing here yet':'暂无内容',
    'Image Palette':'图片色卡','Pick Again':'重新取色','Open Studio':'打开创作','Open Color Library':'进入颜色百科','Add to Palette':'添加到色卡','Back':'返回','Next':'下一步','Previous':'上一步',
    'Home':'首页','Main navigation':'主导航','Mobile navigation':'移动端导航','Interface preferences':'界面偏好设置','Light mode':'日间模式','Dark mode':'夜间模式',
    'Switch to light mode':'切换到日间模式','Switch to dark mode':'切换到夜间模式','Switch Chinese / English':'切换中文 / English',
    'Color Toolkit':'颜色工具箱','Primary':'主色','Accent':'强调色','Support':'辅助色','Recent Colors':'最近颜色','My Palettes':'我的色卡','Favorites':'收藏',
    'Analogous':'类似色','Complementary':'互补色','Split Complementary':'分裂互补','Triadic':'三角色','Tetradic':'四角色','Double Complementary':'双互补',
    'Warm Range':'暖色范围','Cool Range':'冷色范围','Monochromatic':'单色阶','Tints':'浅色阶','Shades':'深色阶','Tones':'柔和色阶','Pastel':'粉彩','Vivid':'鲜艳','Warm':'暖色','Cool':'冷色','Grayscale':'灰阶',
    'Hue':'色相','Saturation':'饱和度','Lightness':'明度'
  };

  const replaceExact = value => reverse[value] ?? value;

  function replaceNode(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (!node.nodeValue.trim() || node.parentElement?.closest('script,style')) return;
      let value = node.__cpOriginal || node.nodeValue;
      if (window.ColorPalettePreferences?.language === 'zh') {
        if (/^Generated:\s/.test(value)) {
          const mode = value.slice(value.indexOf(':') + 1).trim();
          value = `生成：${replaceExact(mode)}`;
        } else {
          value = replaceExact(value);
        }
      }
      node.nodeValue = value;
    });
    root.querySelectorAll('input[placeholder],textarea[placeholder],[title],[aria-label]').forEach(el => {
      ['placeholder','title','aria-label'].forEach(attr => {
        if (!el.hasAttribute(attr)) return;
        const originalKey = `cp${attr[0].toUpperCase()}${attr.slice(1)}`;
        const original = el.dataset[originalKey] || el.getAttribute(attr) || '';
        if (!el.dataset[originalKey]) el.dataset[originalKey] = original;
        if (window.ColorPalettePreferences?.language === 'zh') el.setAttribute(attr, replaceExact(original));
      });
    });
  }

  function install() {
    const prefs = window.ColorPalettePreferences;
    if (!prefs || typeof prefs.translate !== 'function' || prefs.translate.__bidirectional) return !!prefs;
    const original = prefs.translate.bind(prefs);
    const translated = function(root = document.body) {
      original(root);
      if (prefs.language === 'zh') replaceNode(root);
    };
    translated.__bidirectional = true;
    prefs.translate = translated;
    translated(document.body);

    window.addEventListener('colorpalette:localechange', () => {
      requestAnimationFrame(() => translated(document.body));
      requestAnimationFrame(() => translated(document.body));
    });

    const observer = new MutationObserver(mutations => {
      if (prefs.language !== 'zh') return;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) translated(node);
          else if (node.nodeType === Node.TEXT_NODE) replaceNode(node.parentElement);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return true;
  }

  if (!install()) {
    const ready = () => { if (!install()) requestAnimationFrame(ready); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
    else requestAnimationFrame(ready);
  }
})();
