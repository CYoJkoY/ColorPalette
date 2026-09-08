const color = require('../../utils/color');
const oklab = require('../../utils/oklab');
const advanced = require('../../utils/advanced-palette');
const { getByHex, searchColors } = require('../../utils/color-library');
const { toggleFavorite, getFavorites } = require('../../utils/storage');

function normalize(value) {
  const rgb = color.hexToRgb(value);
  return rgb ? color.rgbToHex(rgb.r, rgb.g, rgb.b) : null;
}

Page({
  data: { item:null, rgb:null, hsl:null, oklab:null, oklch:null, related:[], palette:[], favorite:false },

  onLoad(options) {
    const value = normalize(decodeURIComponent(options.hex || ''));
    if (!value) return wx.showToast({ title:'颜色无效', icon:'none', complete:() => wx.navigateBack() });
    this.loadColor(value);
  },

  loadColor(value) {
    const rgb = color.hexToRgb(value);
    const item = getByHex(value) || { id:`custom-${value}`, name:'自定义颜色', hex:value, collection:'自定义', family:'未知', source:'用户输入' };
    const hsl = color.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const lab = oklab.rgbToOklab(rgb.r, rgb.g, rgb.b);
    const lch = oklab.rgbToOklch(rgb.r, rgb.g, rgb.b);
    const related = searchColors('', { family:item.family }).filter(x => x.hex !== value).sort((a, b) => {
      const ar = color.hexToRgb(a.hex), br = color.hexToRgb(b.hex);
      return oklab.oklabDistance(lab, oklab.rgbToOklab(ar.r, ar.g, ar.b)) - oklab.oklabDistance(lab, oklab.rgbToOklab(br.r, br.g, br.b));
    }).slice(0, 6);
    const favorites = getFavorites();
    this.setData({ item, rgb, hsl, oklab:lab, oklch:lch, related, palette:advanced.makeScale(value), favorite:favorites.some(x => x.id === item.id) });
  },

  copy(e) { wx.setClipboardData({ data:e.currentTarget.dataset.value, success:() => wx.showToast({ title:'已复制', icon:'none' }) }); },

  copyFormat(e) {
    const type = e.currentTarget.dataset.type;
    const value = type === 'rgb' ? `rgb(${this.data.rgb.r}, ${this.data.rgb.g}, ${this.data.rgb.b})` : type === 'hsl' ? `hsl(${Math.round(this.data.hsl.h)} ${Math.round(this.data.hsl.s)}% ${Math.round(this.data.hsl.l)}%)` : `oklch(${(this.data.oklch.L * 100).toFixed(2)}% ${this.data.oklch.C.toFixed(4)} ${this.data.oklch.H.toFixed(2)})`;
    wx.setClipboardData({ data:value, success:() => wx.showToast({ title:'已复制', icon:'none' }) });
  },

  openRelated(e) { wx.redirectTo({ url:`/pages/color-detail/color-detail?hex=${encodeURIComponent(e.currentTarget.dataset.hex)}` }); },
  useInStudio() { wx.navigateTo({ url:`/pages/create/create?hex=${encodeURIComponent(this.data.item.hex)}` }); },

  favorite() {
    toggleFavorite({ id:this.data.item.id, name:this.data.item.name, colors:[this.data.item.hex], createdAt:Date.now(), source:'color-library' });
    this.setData({ favorite:!this.data.favorite });
    wx.showToast({ title:this.data.favorite ? '已收藏颜色' : '已取消收藏', icon:'none' });
  },

  makePalette() { wx.navigateTo({ url:`/pages/create/create?hex=${encodeURIComponent(this.data.item.hex)}` }); }
});
