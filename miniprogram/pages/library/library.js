const { categoryNames, familyNames, searchColors } = require('../../utils/color-library');

Page({
  data: { collections:['全部', ...categoryNames], collectionIndex:0, families:familyNames, familyIndex:0, query:'', results:[], total:0 },
  onLoad() { this.refresh(); },
  refresh() {
    const collection = this.data.collections[this.data.collectionIndex] === '全部' ? '' : this.data.collections[this.data.collectionIndex];
    const family = this.data.families[this.data.familyIndex];
    const results = searchColors(this.data.query, { collection, family });
    this.setData({ results:results.slice(0, 120), total:results.length });
  },
  onCollectionTap(e) { this.setData({ collectionIndex:Number(e.currentTarget.dataset.index) }, () => this.refresh()); },
  onFamilyTap(e) { this.setData({ familyIndex:Number(e.currentTarget.dataset.index) }, () => this.refresh()); },
  inputSearch(e) { this.setData({ query:e.detail.value }, () => this.refresh()); },
  openDetail(e) { wx.navigateTo({ url:`/pages/color-detail/color-detail?hex=${encodeURIComponent(e.currentTarget.dataset.hex)}` }); },
  useColor(e) { wx.navigateTo({ url:`/pages/create/create?hex=${encodeURIComponent(e.currentTarget.dataset.hex)}` }); },
  copy(e) { wx.setClipboardData({ data:e.currentTarget.dataset.hex, success:() => wx.showToast({ title:'HEX 已复制', icon:'none' }) }); }
});
