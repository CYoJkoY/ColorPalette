App({
  globalData: {
    version: '0.1.0',
    proUntil: 0,
  },

  onLaunch() {
    const proUntil = wx.getStorageSync('proUntil') || 0;
    this.globalData.proUntil = Number(proUntil);
  },

  isPro() {
    return this.globalData.proUntil > Date.now();
  },

  grantProHours(hours) {
    const base = Math.max(Date.now(), this.globalData.proUntil);
    const until = base + hours * 60 * 60 * 1000;
    this.globalData.proUntil = until;
    wx.setStorageSync('proUntil', until);
    return until;
  },
});
