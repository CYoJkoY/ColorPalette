/**
 * Production integration boundary for WeChat monetization.
 * Secrets, order creation and payment verification belong on a trusted backend.
 */

function watchRewardedAd(adUnitId, onReward, onError) {
  if (!adUnitId) {
    if (onError) onError(new Error('Missing rewarded ad unit id'));
    return null;
  }
  const ad = wx.createRewardedVideoAd({ adUnitId });
  ad.onClose((result) => {
    if (result && result.isEnded) onReward();
    else if (onError) onError(new Error('Ad was not completed'));
  });
  ad.onError((error) => onError && onError(error));
  ad.show().catch(() => ad.load().then(() => ad.show()).catch(onError));
  return ad;
}

function createSubscriptionOrder(planId, callback) {
  // Replace with wx.cloud.callFunction or wx.request to your trusted backend.
  // The backend creates the order and returns payment parameters only after validation.
  if (callback) callback(new Error(`Subscription backend is not configured: ${planId}`));
}

module.exports = { watchRewardedAd, createSubscriptionOrder };