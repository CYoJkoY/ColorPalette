const KEY = 'favoritePalettes';
function getFavorites(){ return wx.getStorageSync(KEY) || []; }
function saveFavorites(items){ wx.setStorageSync(KEY, items); }
function toggleFavorite(item){ const items=getFavorites(); const i=items.findIndex(x=>x.id===item.id); if(i>=0)items.splice(i,1);else items.unshift(item); saveFavorites(items); return items; }
module.exports={getFavorites,saveFavorites,toggleFavorite};
