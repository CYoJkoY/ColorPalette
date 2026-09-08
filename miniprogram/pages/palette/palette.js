const color = require('../../utils/color');
const advanced = require('../../utils/advanced-palette');
const { toggleFavorite, getFavorites } = require('../../utils/storage');
const { buildShareText } = require('../../utils/share');

const presets = {
  aurora: ['#172554', '#2563EB', '#22D3EE', '#A7F3D0', '#F8FAFC'],
  forest: ['#14281D', '#355834', '#6E8B74', '#C9D8B6', '#F1F7ED'],
  sunset: ['#3B1F2B', '#7C2D43', '#F97350', '#FDBA74', '#FFF1E6'],
  mono: ['#111111', '#3F3F46', '#71717A', '#D4D4D8', '#FAFAFA']
};

Page({
  data: { name: 'Palette', colors: [], base: '#7C3AED', schemes: [], scale: [], favorite: false },

  onLoad(options) {
    const id = options.id || 'aurora';
    const colors = presets[id] || presets.aurora;
    const name = decodeURIComponent(options.name || id);
    this.setData({
      name, colors, base: colors[1],
      favorite: getFavorites().some((x) => x.id === id),
      schemes: this.makeSchemes(colors[1]),
      scale: advanced.makeScale(colors[1])
    });
  },

  makeSchemes(hex) {
    const p = color.paletteFromHex(hex) || {};
    return Object.keys(p).map((key) => ({
      name: { complementary: '互补色', analogous: '类似色', triadic: '三角色', split: '分裂互补' }[key] || key,
      colors: p[key]
    }));
  },

  setBase(e) {
    const base = e.detail.value.trim();
    if (!color.hexToRgb(base)) return;
    this.setData({ base: base.toUpperCase(), schemes: this.makeSchemes(base), scale: advanced.makeScale(base) });
  },

  copy(e) { wx.setClipboardData({ data: e.currentTarget.dataset.hex }); },

  favorite() {
    const item = { id: this.data.name, name: this.data.name, colors: this.data.colors };
    toggleFavorite(item);
    this.setData({ favorite: !this.data.favorite });
    wx.showToast({ title: this.data.favorite ? '已收藏' : '已取消', icon: 'none' });
  },

  share() {
    wx.setClipboardData({ data: buildShareText(this.data.colors, this.data.name) });
    wx.showToast({ title: '色卡信息已复制', icon: 'none' });
  },

  goPro() { wx.switchTab({ url: '/pages/pro/pro' }); }
});
