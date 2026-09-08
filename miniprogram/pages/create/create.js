const color = require('../../utils/color');
const { toggleFavorite } = require('../../utils/storage');
const { categoryNames, familyNames, searchColors } = require('../../utils/color-library');

const MODES = [
  { id:'analogous', name:'类似色' }, { id:'complementary', name:'互补色' }, { id:'split', name:'分裂互补' },
  { id:'triadic', name:'三角色' }, { id:'tetradic', name:'四角色' }, { id:'doubleComplementary', name:'双互补' },
  { id:'monochromatic', name:'单色阶' }, { id:'tints', name:'浅色阶' }, { id:'shades', name:'深色阶' },
  { id:'tones', name:'柔和色阶' }, { id:'pastel', name:'粉彩' }, { id:'vivid', name:'鲜艳' },
  { id:'warm', name:'暖色' }, { id:'cool', name:'冷色' }, { id:'grayscale', name:'灰阶' }
];

Page({
  data: {
    hex:'#7C3AED', h:262, s:80, l:52, modes:MODES, modeIndex:0, colors:[], saved:false,
    collections:['全部', ...categoryNames], collectionIndex:0, families:familyNames, familyIndex:0,
    library:[], libraryTotal:0, query:''
  },

  onLoad(options = {}) {
    const incoming = color.hexToRgb(options.hex || '');
    if (incoming) {
      const hsl = color.rgbToHsl(incoming.r, incoming.g, incoming.b);
      this.setData({ hex:color.rgbToHex(incoming.r, incoming.g, incoming.b), ...hsl }, () => { this.refresh(); this.refreshLibrary(); });
      return;
    }
    this.refresh();
    this.refreshLibrary();
  },

  refresh() {
    this.setData({ colors:color.generatePalette(this.data.hex, this.data.modes[this.data.modeIndex].id, 5) });
  },

  refreshLibrary() {
    const collection = this.data.collections[this.data.collectionIndex] === '全部' ? '' : this.data.collections[this.data.collectionIndex];
    const family = this.data.families[this.data.familyIndex];
    const results = searchColors(this.data.query, { collection, family });
    this.setData({ library:results.slice(0, 12), libraryTotal:results.length });
  },

  inputSearch(e) { this.setData({ query:e.detail.value }, () => this.refreshLibrary()); },
  onCollectionTap(e) { this.setData({ collectionIndex:Number(e.currentTarget.dataset.index) }, () => this.refreshLibrary()); },
  onFamilyTap(e) { this.setData({ familyIndex:Number(e.currentTarget.dataset.index) }, () => this.refreshLibrary()); },
  openLibrary() { wx.navigateTo({ url:'/pages/library/library' }); },

  inputHex(e) {
    const value = String(e.detail.value || '').trim();
    const rgb = color.hexToRgb(value);
    if (!rgb) return;
    const hsl = color.rgbToHsl(rgb.r, rgb.g, rgb.b);
    this.setData({ hex:color.rgbToHex(rgb.r, rgb.g, rgb.b), h:hsl.h, s:hsl.s, l:hsl.l }, () => this.refresh());
  },
  onModeChange(e) { this.setData({ modeIndex:Number(e.detail.value) }, () => this.refresh()); },

  onSliderChange(e) {
    const key = e.currentTarget.dataset.key;
    const next = { h:this.data.h, s:this.data.s, l:this.data.l };
    next[key] = Number(e.detail.value);
    const rgb = color.hslToRgb(next.h, next.s, next.l);
    this.setData({ ...next, hex:color.rgbToHex(rgb.r, rgb.g, rgb.b) }, () => this.refresh());
  },

  selectLibraryColor(e) {
    const hex = e.currentTarget.dataset.hex;
    const rgb = color.hexToRgb(hex);
    const hsl = color.rgbToHsl(rgb.r, rgb.g, rgb.b);
    this.setData({ hex, h:hsl.h, s:hsl.s, l:hsl.l }, () => this.refresh());
  },
  addLibraryColor(e) {
    const colors = this.data.colors.slice();
    if (colors.length >= 8) return wx.showToast({ title:'最多 8 个颜色', icon:'none' });
    colors.push(e.currentTarget.dataset.hex);
    this.setData({ colors });
  },
  copy(e) { wx.setClipboardData({ data:e.currentTarget.dataset.hex, success:() => wx.showToast({ title:'HEX 已复制', icon:'none' }) }); },

  save() {
    if (this.data.colors.length < 2) return wx.showToast({ title:'至少需要 2 个颜色', icon:'none' });
    toggleFavorite({ id:`custom-${Date.now()}`, name:'我的色卡', colors:this.data.colors, createdAt:Date.now() });
    this.setData({ saved:true });
    wx.showToast({ title:'已收藏色卡', icon:'none' });
  },

  addColor() {
    const colors = this.data.colors.slice();
    if (colors.length >= 8) return wx.showToast({ title:'最多 8 个颜色', icon:'none' });
    colors.push(this.data.hex);
    this.setData({ colors });
  }
});
