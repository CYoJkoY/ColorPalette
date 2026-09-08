const { watchRewardedAd, createSubscriptionOrder } = require('../../services/monetization');

const REWARDED_AD_UNIT_ID = ''; // Configure in production; never hard-code secrets here.

Page({
  data: { isPro: false, remaining: '未开启' },

  onShow() {
    const app = getApp();
    const until = app.globalData.proUntil || 0;
    this.setData({ isPro: until > Date.now(), remaining: until > Date.now() ? this.format(until - Date.now()) : '未开启' });
  },

  format(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h} 小时 ${m} 分`;
  },

  watchAd() {
    if (!REWARDED_AD_UNIT_ID) {
      wx.showModal({ title: '尚未配置广告位', content: '请在微信公众平台创建激励广告位，并将广告位 ID 配置到生产环境。当前不会虚假发放权益。', showCancel: false });
      return;
    }
    const app = getApp();
    watchRewardedAd(REWARDED_AD_UNIT_ID, () => {
      app.grantProHours(24);
      this.onShow();
      wx.showToast({ title: 'Pro +24 小时', icon: 'none' });
    }, () => wx.showToast({ title: '广告未完成', icon: 'none' }));
  },

  buyPlan(planId, days) {
    createSubscriptionOrder(planId, (error) => {
      wx.showModal({ title: '支付尚未配置', content: error.message, showCancel: false });
    });
    // After a trusted backend verifies wx.requestPayment and the order, call:
    // getApp().grantSubscription(days, verifiedOrderId)
  },

  buyMonthly() { this.buyPlan('monthly', 30); },
  buyYearly() { this.buyPlan('yearly', 365); }
});
