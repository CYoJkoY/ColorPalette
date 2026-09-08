/**
 * Non-intrusive monetization boundary.
 *
 * Product rule: ads are opt-in only. Never show an ad automatically,
 * never interrupt an active workflow, and never use an ad click as a
 * substitute for a normal app action.
 */

function watchRewardedAd(adUnitId, onReward, onError) {
  if (!adUnitId) {
    if (onError) onError(new Error('Missing rewarded ad unit id'));
    return null;
  }

  let settled = false;
  const reward = () => {
    if (settled) return;
    settled = true;
    if (onReward) onReward();
  };
  const fail = (error) => {
    if (settled) return;
    settled = true;
    if (onError) onError(error || new Error('Rewarded ad failed'));
  };

  const ad = wx.createRewardedVideoAd({ adUnitId });
  ad.onClose((result) => {
    if (result && result.isEnded) reward();
    else fail(new Error('Ad was not completed'));
  });
  ad.onError(fail);

  ad.show().catch(() => {
    ad.load()
      .then(() => ad.show())
      .catch(fail);
  });

  return ad;
}

function createSubscriptionOrder(planId, callback) {
  // Replace with wx.cloud.callFunction or wx.request to a trusted backend.
  // Payment UI is only opened after the backend creates and validates an order.
  if (callback) callback(new Error(`Subscription backend is not configured: ${planId}`));
}

module.exports = { watchRewardedAd, createSubscriptionOrder };
