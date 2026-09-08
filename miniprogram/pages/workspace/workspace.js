const { getWorkspace, getHistory, removePalette, clearHistory } = require('../../utils/palette-workspace');

Page({
  data: { tab: 'palettes', palettes: [], colors: [], history: [] },
  onShow() { this.refresh(); },
  refresh() {
    const workspace = getWorkspace();
    this.setData({ palettes: workspace.palettes || [], colors: workspace.colors || [], history: getHistory() });
  },
  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }); },
  openPalette(e) { wx.navigateTo({ url: `/pages/create/create?palette=${encodeURIComponent(JSON.stringify(e.currentTarget.dataset.palette))}` }); },
  openColor(e) { wx.navigateTo({ url: `/pages/create/create?hex=${encodeURIComponent(e.currentTarget.dataset.hex)}` }); },
  deletePalette(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({ title: 'Delete palette?', content: 'This cannot be undone.', success: r => { if (!r.confirm) return; removePalette(id); this.refresh(); } });
  },
  clearHistory() {
    wx.showModal({ title: 'Clear history?', content: 'Recent colors and palettes will be removed.', success: r => { if (!r.confirm) return; clearHistory(); this.refresh(); } });
  },
  copy(e) { wx.setClipboardData({ data: e.currentTarget.dataset.hex, success: () => wx.showToast({ title: 'Copied', icon: 'none' }) }); }
});
