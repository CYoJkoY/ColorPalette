(() => {
  'use strict';

  const NAMES = {
    朱砂: 'Vermilion', 赤红: 'Crimson', 绯红: 'Crimson Rose', 酒红: 'Burgundy',
    珊瑚: 'Coral', 砖红: 'Brick Red', 橘橙: 'Tangerine', 杏橙: 'Apricot',
    琥珀: 'Amber', 南瓜: 'Pumpkin', 焦糖: 'Caramel', 铜棕: 'Copper Brown'
  };

  const FAMILIES = {
    红: 'Red', 橙: 'Orange', 黄: 'Yellow', 绿: 'Green', 青: 'Cyan', 蓝: 'Blue',
    紫: 'Purple', 粉: 'Pink', 棕: 'Brown', 中性: 'Neutral'
  };

  const en = () => window.ColorPalettePreferences?.language === 'en';
  const esc = value => String(value ?? '').replace(/[&<>\"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  function colorName(color) {
    return en() ? (NAMES[color.name] || color.name) : color.name;
  }

  function familyName(family) {
    return en() ? (FAMILIES[family] || family || 'Color') : (family || '颜色');
  }

  function renderDiscover() {
    if (!window.loadColors || !window.app) return;
    window.loadColors().then(() => {
      const english = en();
      const count = window.colors?.length || 0;
      const featured = (window.colors || []).slice(0, 8);
      const copy = english ? {
        eyebrow: 'COLOR TOOLKIT',
        title: 'Find color.\nBuild something of your own.',
        description: 'Explore named colors, generate palettes, and turn a good starting point into a finished color system. Everything stays in your browser.',
        extract: 'Extract from Image',
        create: 'Start Creating',
        library: 'Color Library',
        libraryMeta: `${count} named colors · Traditional Chinese / Japanese colors · CSS · pigments`,
        starter: 'PALETTE STARTER',
        starterText: 'Begin with one color and shape the rest.',
        colors: 'Named Colors',
        systems: 'Color Systems',
        systemText: 'Curated collections for practical exploration.',
        modes: 'Palette Modes',
        modeText: 'Analogous, complementary, triadic and more.',
        featuredEyebrow: 'EXPLORE',
        featured: 'Featured Colors',
        browse: 'Browse Library',
        stepsEyebrow: 'WORKFLOW',
        steps: 'From idea to palette',
        step1: 'Find', step1d: 'Search by name or HEX, or browse by system and hue.',
        step2: 'Generate', step2d: 'Compare color relationships and build a balanced palette.',
        step3: 'Save', step3d: 'Keep the final colors in your personal palette library.'
      } : {
        eyebrow: 'COLOR TOOLKIT',
        title: '找到颜色。\n做出自己的颜色。',
        description: '探索命名颜色、生成配色，再把一个好起点整理成完整的色彩系统。所有操作都在浏览器内完成。',
        extract: '从图片取色',
        create: '开始创作',
        library: '颜色百科',
        libraryMeta: `${count} 个命名颜色 · 中 / 日传统色 · CSS · 颜料`,
        starter: '配色起点',
        starterText: '从一个颜色开始，继续塑造你的配色。',
        colors: '命名颜色',
        systems: '色彩体系',
        systemText: '整理后的色彩集合，方便快速探索。',
        modes: '配色模式',
        modeText: '类似、互补、三角色、粉彩、冷暖等。',
        featuredEyebrow: '探索',
        featured: '精选颜色',
        browse: '浏览颜色百科',
        stepsEyebrow: '工作流',
        steps: '从灵感到色卡',
        step1: '找色', step1d: '搜索名称或 HEX，也可以按色彩体系与色相浏览。',
        step2: '生成', step2d: '比较颜色关系，构建平衡的配色方案。',
        step3: '收藏', step3d: '把最终颜色保存到自己的色卡库。'
      };

      const cards = featured.map((color, index) => `
        <article class="discover-color-card" data-open="${esc(color.hex)}" style="--card-color:${esc(color.hex)}">
          <div class="discover-color-swatch"></div>
          <div class="discover-color-body">
            <div class="discover-color-index">0${index + 1}</div>
            <div class="discover-color-name">${esc(colorName(color))}</div>
            <div class="discover-color-meta"><span>${esc(color.hex)}</span><span>${esc(familyName(color.family))}</span></div>
          </div>
        </article>
      `).join('');

      window.app.innerHTML = `
        <section class="discover-hero-v2">
          <div class="discover-hero-copy">
            <div class="discover-eyebrow">${copy.eyebrow}</div>
            <h1>${esc(copy.title).replace(/\\n/g, '<br>')}</h1>
            <p>${esc(copy.description)}</p>
            <div class="discover-hero-actions">
              <a class="button primary" href="#/extractor">${copy.extract}</a>
              <a class="button secondary" href="#/create">${copy.create}</a>
            </div>
          </div>
          <div class="discover-visual" aria-hidden="true">
            <div class="discover-visual-label">${copy.starter}</div>
            <div class="discover-palette-preview">
              <span style="--preview:#7C3AED"></span>
              <span style="--preview:#06B6D4"></span>
              <span style="--preview:#F59E0B"></span>
              <span style="--preview:#EF4444"></span>
            </div>
            <div class="discover-visual-core"><small>#7C3AED</small><strong>COLOR</strong></div>
            <div class="discover-visual-caption">${copy.starterText}</div>
          </div>
        </section>

        <section class="discover-stat-grid">
          <a class="discover-stat-card discover-stat-feature" href="#/library">
            <span>${copy.library}</span>
            <strong>${count}</strong>
            <small>${copy.libraryMeta}</small>
            <b>↗</b>
          </a>
          <div class="discover-stat-card">
            <span>${copy.colors}</span>
            <strong>${count}</strong>
            <small>${copy.systemText}</small>
          </div>
          <div class="discover-stat-card">
            <span>${copy.modes}</span>
            <strong>15</strong>
            <small>${copy.modeText}</small>
          </div>
        </section>

        <section class="discover-section-v2">
          <div class="discover-section-heading">
            <div><div class="discover-eyebrow">${copy.featuredEyebrow}</div><h2>${copy.featured}</h2></div>
            <a class="button" href="#/library">${copy.browse}</a>
          </div>
          <div class="discover-featured-grid">${cards}</div>
        </section>

        <section class="discover-steps-v2">
          <div class="discover-section-heading compact">
            <div><div class="discover-eyebrow">${copy.stepsEyebrow}</div><h2>${copy.steps}</h2></div>
          </div>
          <div class="discover-workflow-grid">
            <article><span>01</span><div><strong>${copy.step1}</strong><p>${copy.step1d}</p></div></article>
            <article><span>02</span><div><strong>${copy.step2}</strong><p>${copy.step2d}</p></div></article>
            <article><span>03</span><div><strong>${copy.step3}</strong><p>${copy.step3d}</p></div></article>
          </div>
        </section>
      `;
    }).catch(() => {});
  }

  window.renderHome = renderDiscover;
  window.addEventListener('colorpalette:localechange', () => {
    if (location.hash === '#/home' || location.hash === '' || location.hash === '#') renderDiscover();
  });
})();
