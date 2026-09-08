const { categoryNames, familyNames, searchColors } = require('../../utils/color-library');
const color = require('../../utils/color');

Page({
  data: {
    collections: ['全部', ...categoryNames],
    collectionIndex: 0,
    families: familyNames,
    familyIndex: 0,
    query: '',
    results: [],
    total: 0
  },

  onLoad() { this.refresh(); },

  refresh() {
    const collection = this.data.collections[this.data.collectionIndex] === '全部' ? '' : this.data.collections[this.data.collectionIndex];
    const family = this.data.families[this.data.familyIndex];
    const results = searchColors(this.data.query, { collection, family });
    this.setData({ results: results.slice(0, 120), total: results.length });
  },

  onCollectionChange(e) { this.setData({ collectionIndex:Number(e.detail.value) }, () => this.refresh()); },
  onFamilyChange(e) { this.setData({ familyIndex:Number(e.detail.value) }, () => this.refresh()); },
  inputSearch(e) { this.setData({ query:e.detail.value }, () => this.refresh()); },

  useColor(e) {
    const hex = e.currentTarget.dataset.hex;
    wx.setStorageSync('colorpalette-library-selection', hex);
    wx.navigateTo({ url:`/pages/create/create?hex=${encodeURIComponent(hex)}` });
  },

  copy(e) {
    wx.setClipboardData({ data:e.currentTarget.dataset.hex, success:() => wx.showToast({ title:'HEX 已复制', icon:'none' }) });
  },

  pickForPalette(e) {
    const hex = e.currentTarget.dataset.hex;
    const rgb = color.hexToRgb(hex);
    if (!rgb) return;
    wx.setStorageSync('colorpalette-library-selection', hex);
    wx.navigateBack({ delta:1 });
  }
});
