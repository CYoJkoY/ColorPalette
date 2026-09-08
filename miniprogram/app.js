App({
  globalData: {
    version: '0.2.0',
    proUntil: 0,
    subscription: null,
  },

  onLaunch() {
    const proUntil = Number(wx.getStorageSync('proUntil') || 0);
    this.globalData.proUntil = proUntil;
  },

  isPro() {
    return this.globalData.proUntil > Date.now();
  },

  grantProHours(hours) {
    const safeHours = Math.max(0, Number(hours) || 0);
    const base = Math.max(Date.now(), this.globalData.proUntil);
    const until = base + safeHours * 60 * 60 * 1000;
    this.globalData.proUntil = until;
    wx.setStorageSync('proUntil', until);
    return until;
  },

  grantSubscription(days, orderId = '') {
    const base = Math.max(Date.now(), this.globalData.proUntil);
    const until = base + Math.max(0, Number(days) || 0) * 86400000;
    this.globalData.proUntil = until;
    this.globalData.subscription = { orderId, until };
    wx.setStorageSync('proUntil', until);
    wx.setStorageSync('subscription', this.globalData.subscription);
    return until;
  },

  getEntitlement() {
    return {
      isPro: this.isPro(),
      proUntil: this.globalData.proUntil,
      subscription: this.globalData.subscription,
    };
  },
});
