const { getWorkspace, getHistory, removePalette, duplicatePalette, clearHistory } = require('../../utils/palette-workspace');

Page({
  data: { tab: 'palettes', palettes: [], colors: [], history: [], query: '' },
  onShow() { this.refresh(); },
  refresh() {
    const workspace = getWorkspace();
    const query = this.data.query.trim().toLowerCase();
    const palettes = (workspace.palettes || []).filter(item => !query || item.name.toLowerCase().includes(query) || item.colors.some(hex => hex.toLowerCase().includes(query)));
    const colors = (workspace.colors || []).filter(item => !query || item.hex.toLowerCase().includes(query) || (item.name || '').toLowerCase().includes(query));
    this.setData({ palettes, colors, history: getHistory() });
  },
  inputSearch(e) { this.setData({ query: e.detail.value }, () => this.refresh()); },
  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }); },
  openPalette(e) { wx.navigateTo({ url: `/pages/create/create?palette=${encodeURIComponent(JSON.stringify(e.currentTarget.dataset.palette))}` }); },
  openColor(e) { wx.navigateTo({ url: `/pages/create/create?hex=${encodeURIComponent(e.currentTarget.dataset.hex)}` }); },
  duplicatePalette(e) {
    const item = duplicatePalette(e.currentTarget.dataset.id);
    if (item) { this.refresh(); wx.showToast({ title: '已复制色板', icon: 'none' }); }
  },
  deletePalette(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({ title: '删除色板？', content: '删除后可以重新创建，但不会影响原始颜色库。', success: r => { if (!r.confirm) return; removePalette(id); this.refresh(); } });
  },
  clearHistory() {
    wx.showModal({ title: '清除最近记录？', content: '只会清除 Workspace 的最近活动。', success: r => { if (!r.confirm) return; clearHistory(); this.refresh(); } });
  },
  copy(e) { wx.setClipboardData({ data: e.currentTarget.dataset.hex, success: () => wx.showToast({ title: '已复制', icon: 'none' }) }); }
});