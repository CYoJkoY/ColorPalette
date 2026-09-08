(() => {
  const COMPLETE_EN = {
    '相邻色相，适合形成统一、平静的配色。':'Adjacent hues create a unified, calm palette.',
    '色相环对置，适合形成强烈分离。':'Opposite hues create strong separation and contrast.',
    '基础色搭配互补色两侧的两个强调色。':'The base color is paired with the two hues beside its complement.',
    '三等分色相，保持均衡的色彩对比。':'Three evenly spaced hues create balanced color contrast.',
    '两组互补色构成的四角色关系。':'Two complementary pairs form a four-color relationship.',
    '两个邻近色分别与其对立色组合。':'Two neighboring colors are combined with their opposites.',
    '围绕基础色向暖色方向偏移。':'Shifts around the base color toward warmer hues.',
    '围绕基础色向冷色方向偏移。':'Shifts around the base color toward cooler hues.',
    '保持色相，只改变明度。':'Keeps the hue while changing lightness.',
    '降低饱和度并提高明度。':'Reduces saturation and increases lightness.',
    '降低明度形成深色版本。':'Reduces lightness to create darker variants.',
    '降低饱和度，适合克制型界面。':'Reduces saturation for restrained interface palettes.',
    '类似色':'Analogous','互补色':'Complementary','分裂互补':'Split Complementary','三角色':'Triadic','四角色':'Tetradic','双互补':'Double Complementary',
    '暖色范围':'Warm Range','冷色范围':'Cool Range','单色阶':'Monochromatic','浅色阶':'Tints','深色阶':'Shades','柔和色阶':'Tones',
    '粉彩':'Pastel','鲜艳':'Vivid','暖色':'Warm','冷色':'Cool','灰阶':'Grayscale',
    '找到颜色，也做出自己的颜色。':'Find colors, then make your own.',
    '从图片取色、颜色百科、配色生成开始，再把结果整理成自己的色卡。原生浏览器运行，图片和收藏数据留在本机。':'Extract colors from images, explore the color library, generate palettes, and save your own palette sets. Runs natively in the browser; images and saved data stay on this device.',
    '从图片取色':'Extract from Image','开始创作':'Start Creating','颜色百科':'Color Library','精选色卡':'Featured Palettes','三步完成一张色卡':'Create a Palette in Three Steps',
    '颜色百科':'Color Library','命名颜色':'Named Colors','来自整理后的多套色彩体系':'Curated from multiple color systems','配色模式':'Palette Modes',
    '类似、互补、三角色、粉彩、冷暖等':'Analogous, complementary, triadic, pastel, warm/cool, and more','找色':'Find Colors','生成':'Generate','收藏':'Save',
    '搜索名称、HEX，或者按色彩体系与色相浏览。':'Search by name or HEX, or browse by color system and hue.',
    '选择类似、互补、三角色、粉彩、冷暖等配色方式。':'Choose analogous, complementary, triadic, pastel, warm/cool, and other schemes.',
    '把最终颜色组合保存到自己的色卡库。':'Save the final color combination to your personal palette library.',
    '色彩体系':'Color System','全部':'All','色相分类':'Color Family','搜索名称、英文名或 HEX':'Search name, English name, or HEX','点击色块查看详情':'Click a color to view details',
    '没有找到匹配颜色。':'No matching colors found.','颜色关系':'Color Relationships','相近颜色':'Nearby Colors','色阶':'Lightness Scale','对比度':'Contrast','颜色信息':'Color Information',
    '自定义颜色':'Custom Color','自定义':'Custom','未知':'Unknown','用户输入':'User input','用于创作':'Use in Studio','已收藏':'Favorited','收藏颜色':'Favorite Color','取消收藏':'Unfavorite',
    '复制 HEX':'Copy HEX','颜色参数':'Color Parameters','复制':'Copy','使用':'Use','感知明度阶':'Perceptual Lightness Scale','对比度检查':'Contrast Check','白色背景':'White background','黑色背景':'Black background',
    '使用 OKLab Lightness 构建比传统 HSL 更连贯的明度渐变，适合 UI 层级、背景和状态。':'OKLab Lightness creates a more coherent lightness progression than traditional HSL, useful for UI hierarchy, backgrounds, and states.',
    '对比度遵循 WCAG 相对亮度公式。':'Contrast follows the WCAG relative luminance formula.','OKLab 距离':'OKLab distance','每组关系都可以完整带入 Palette Studio。':'Every relationship can be sent directly into Palette Studio.',
    'Palette relationships':'Palette Relationships','从一个颜色开始，生成关系色，手动编辑并保存为自己的色卡。':'Start from one color, generate related colors, edit them, and save your own palette.',
    '色卡名称':'Palette Name','配色关系':'Color Relationship','加入当前颜色':'Add Current Color','当前色卡':'Current Palette','生成：':'Generated: ','删除':'Delete','保存色卡':'Save Palette',
    '导出 CSS':'Export CSS','导出 JSON':'Export JSON','Hue':'Hue','Saturation':'Saturation','Lightness':'Lightness',
    '从图片取色':'Extract from Image','图片只在浏览器内处理。自动提取代表色，也可以直接点击图片获取像素 HEX。':'Images are processed only in the browser. Extract representative colors automatically or click the image to sample a pixel HEX value.',
    '选择图片':'Choose Image','清除':'Clear','选择一张图片开始。':'Choose an image to begin.','支持 JPG、PNG、WebP 等浏览器可读取格式。':'Supports JPG, PNG, WebP, and other formats readable by the browser.',
    '提取结果':'Extraction Results','尚未提取颜色。':'No colors extracted yet.','保存为色卡':'Save as Palette','打开 Palette Studio':'Open Palette Studio','重新取色':'Pick Again',
    '主色':'Primary','强调色':'Accent','辅助色':'Support','图片色卡':'Image Palette','图片色卡已保存':'Image palette saved','至少需要 2 个颜色':'At least 2 colors are required',
    '收藏':'Favorites','保存的颜色与色卡都留在浏览器本地。':'Saved colors and palettes stay locally in the browser.','收藏内容':'Favorites','清空':'Clear','编辑':'Edit','移除':'Remove',
    '还没有收藏。去颜色百科或 Palette Studio 保存一些颜色。':'No favorites yet. Save some colors from the Color Library or Palette Studio.','确定清空全部收藏？':'Clear all favorites?',
    '工作区':'Workspace','集中查看本机保存的色卡、最近使用的颜色，并继续编辑。':'View saved palettes and recently used colors on this device, then continue editing.',
    '我的色卡':'My Palettes','新建色卡':'New Palette','最近颜色':'Recent Colors','工作区还是空的。':'The workspace is empty.','暂无最近颜色。':'No recent colors yet.',
    'Pro 能力预留':'Pro capabilities placeholder','当前 GitHub Pages 版本优先保持免费、本地优先和无账号使用。这里保留未来扩展入口，不伪造支付或会员系统。':'The current GitHub Pages version prioritizes free, local-first, account-free use. This page reserves an extension point without pretending to provide a payment or membership system.',
    '更高级的色彩空间':'Advanced Color Spaces','更完整的导出':'Richer Export','工作区同步':'Workspace Sync',
    '继续扩展 OKLab / OKLCH、DeltaE、可访问性检查和感知均匀的配色算法。':'Further expand OKLab / OKLCH, DeltaE, accessibility checks, and perceptually uniform palette algorithms.',
    '可扩展 CSS、SCSS、JSON、Design Tokens、Tailwind 等开发工作流导出。':'Extend exports for CSS, SCSS, JSON, Design Tokens, Tailwind, and other development workflows.',
    '未来可以增加可选云同步；当前版本不上传你的图片或本地色卡。':'Optional cloud synchronization may be added later; the current version does not upload your images or local palettes.',
    '颜色数据加载失败：':'Failed to load color data: ','重新加载':'Reload','已复制':'Copied','复制失败':'Copy failed','颜色已收藏':'Color added to favorites','已取消收藏':'Removed from favorites',
    '浏览器本地优先':'Local-first in your browser','图片不会上传到服务器':'Images are never uploaded to a server','日间模式':'Light mode','夜间模式':'Dark mode',
    '切换到日间模式':'Switch to light mode','切换到夜间模式':'Switch to dark mode','切换中文 / English':'Switch Chinese / English','颜色工具箱':'Color Toolkit',
    '红':'Red','橙':'Orange','黄':'Yellow','绿':'Green','青':'Cyan','蓝':'Blue','紫':'Purple','粉':'Pink','棕':'Brown','中性':'Neutral',
    '基础颜色':'Basic Colors','CSS 命名颜色':'CSS Named Colors','中国传统色':'Traditional Chinese Colors','日本传统色':'Traditional Japanese Colors','艺术与颜料':'Art & Pigments'
  };

  const EN_EXACT_ZH = {
    'Home':'首页','Main navigation':'主导航','Mobile navigation':'移动端导航','Interface preferences':'界面偏好设置',
    'Color Toolkit':'颜色工具箱','Color Library':'颜色百科','Favorites':'收藏','Workspace':'工作区','Extract':'取色','Create':'创作','Discover':'发现',
    'Palette Studio':'配色工作室','Palette Relationships':'配色关系','Hue':'色相','Saturation':'饱和度','Lightness':'明度','Primary':'主色','Accent':'强调色','Support':'辅助色',
    'No matching colors found.':'没有找到匹配颜色。','No colors extracted yet.':'尚未提取颜色。','No recent colors yet.':'暂无最近颜色。','Nothing here yet':'暂无内容',
    'Save Palette':'保存色卡','New Palette':'新建色卡','Add Current Color':'加入当前颜色','Current Palette':'当前色卡','Generated: ':'生成：','Export CSS':'导出 CSS','Export JSON':'导出 JSON',
    'Extraction Results':'提取结果','Choose Image':'选择图片','Clear':'清除','Choose an image to begin.':'选择一张图片开始。','Reload':'重新加载','Copied':'已复制','Copy':'复制','Delete':'删除',
    'Edit':'编辑','Remove':'移除','Use':'使用','Favorite Color':'收藏颜色','Unfavorite':'取消收藏','Favorited':'已收藏','Back':'返回','Next':'下一步','Previous':'上一步',
    'Light mode':'日间模式','Dark mode':'夜间模式','Switch to light mode':'切换到日间模式','Switch to dark mode':'切换到夜间模式'
  };

  const locale = window.ColorPaletteLocales?.['en-US'];
  if (locale) {
    locale.ui = { ...COMPLETE_EN, ...(locale.ui || {}) };
  }
  window.ColorPaletteCompleteLocale = { en: COMPLETE_EN, reverseZh: EN_EXACT_ZH };
})();
