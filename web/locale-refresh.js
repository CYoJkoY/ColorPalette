(() => {
  const EXTRA_UI = {
    '没有找到匹配颜色。':'No matching colors found.',
    '尚未提取颜色。':'No colors extracted yet.',
    '点击色块查看详情':'Click a color to view details',
    '图片不会上传到服务器':'Images are never uploaded to a server',
    '图片只在浏览器内处理。自动提取代表色，也可以直接点击图片获取像素 HEX。':'Images are processed only in the browser. Extract representative colors automatically or click the image to sample a pixel HEX value.',
    '选择一张图片开始。支持 JPG、PNG、WebP 等浏览器可读取格式。':'Choose an image to begin. JPG, PNG, WebP, and other browser-readable formats are supported.',
    '支持 JPG、PNG、WebP 等浏览器可读取格式。':'Supports JPG, PNG, WebP, and other formats readable by the browser.',
    '颜色数据加载失败：':'Failed to load color data: ',
    '还没有收藏。去颜色百科或 Palette Studio 保存一些颜色。':'No favorites yet. Save some colors from the Color Library or Palette Studio.',
    '工作区还是空的。':'The workspace is empty.',
    '集中查看本机保存的色卡、最近使用的颜色，并继续编辑。':'View saved palettes and recently used colors on this device, then continue editing.',
    '保存的颜色与色卡都留在浏览器本地。':'Saved colors and palettes stay locally in the browser.',
    '未来可以增加可选云同步；当前版本不上传你的图片或本地色卡。':'Optional cloud synchronization may be added later; the current version does not upload your images or local palettes.',
    '专业版':'Pro','升级':'Upgrade','更高级的色彩空间':'Advanced color spaces','更完整的导出':'More complete exports','工作区同步':'Workspace sync',
    '主色':'Primary','强调色':'Accent','辅助色':'Support','图片色卡':'Image Palette','用户输入':'User input','未知':'Unknown','参数':'Parameters','用于创作':'Use in Studio',
    '颜色参数':'Color Parameters','感知明度阶':'Perceptual Lightness Scale','附近颜色':'Nearby Colors','OKLab 距离':'OKLab distance',
    '白色背景':'White background','黑色背景':'Black background','对比度遵循 WCAG 相对亮度公式。':'Contrast follows the WCAG relative luminance formula.',
    '确定清空全部收藏？':'Clear all favorites?','至少需要 2 个颜色':'At least 2 colors are required','色卡已保存':'Palette saved','图片色卡已保存':'Image palette saved','颜色已收藏':'Color added to favorites','已取消收藏':'Removed from favorites',
    '重新加载':'Reload','清除':'Clear','保存为色卡':'Save as Palette','打开 Palette Studio':'Open Palette Studio','重新取色':'Pick Again','打开创作':'Open Studio',
    '复制色值':'Copy values','当前色卡':'Current palette','加入当前颜色':'Add current color','生成：':'Generated: ','收藏内容':'Favorites','最近颜色':'Recent colors',
    '返回':'Back','下一步':'Next','上一步':'Previous','添加到色卡':'Add to Palette','进入颜色百科':'Open Color Library',
    '切换中文 / English':'Switch Chinese / English','切换到日间模式':'Switch to light mode','切换到夜间模式':'Switch to dark mode',
    '自定义颜色':'Custom Color','找到颜色，也做出自己的颜色。':'Find colors, then make your own.','颜色工具箱':'Color Toolkit',
    '红':'Red','橙':'Orange','黄':'Yellow','绿':'Green','青':'Cyan','蓝':'Blue','紫':'Purple','粉':'Pink','棕':'Brown','中性':'Neutral',
    '全部':'All','基础颜色':'Basic Colors','CSS 命名颜色':'CSS Named Colors','中国传统色':'Traditional Chinese Colors','日本传统色':'Traditional Japanese Colors','艺术与颜料':'Art & Pigments'
  };

  function installSupplementalLocale() {
    const en = window.ColorPaletteLocales?.['en-US'];
    if (en) en.ui = { ...EXTRA_UI, ...en.ui };
  }

  function translateNow() {
    installSupplementalLocale();
    if (typeof window.ColorPalettePreferences?.translate === 'function') {
      window.ColorPalettePreferences.translate(document.body);
    }
  }

  function refreshRoute() {
    if (typeof window.route === 'function') window.route();
    requestAnimationFrame(() => {
      translateNow();
      requestAnimationFrame(translateNow);
    });
  }

  window.addEventListener('colorpalette:localechange', refreshRoute);
  window.addEventListener('hashchange', () => {
    requestAnimationFrame(translateNow);
    requestAnimationFrame(() => requestAnimationFrame(translateNow));
  });

  const observer = new MutationObserver(() => {
    if (window.ColorPalettePreferences?.language === 'en') {
      requestAnimationFrame(translateNow);
    }
  });
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
})();
