const KEY = 'colorPaletteWorkspace';
const HISTORY_KEY = 'colorPaletteHistory';
const MAX_HISTORY = 30;

function getWorkspace() {
  return wx.getStorageSync(KEY) || { colors: [], palettes: [] };
}

function saveWorkspace(workspace) {
  wx.setStorageSync(KEY, workspace);
  return workspace;
}

function upsertColor(hex, name = '') {
  const workspace = getWorkspace();
  const colors = workspace.colors.filter(item => item.hex !== hex);
  colors.unshift({ hex, name, updatedAt: Date.now() });
  workspace.colors = colors.slice(0, 100);
  saveWorkspace(workspace);
  addHistory({ type: 'color', hex, name });
  return workspace.colors;
}

function addPalette(palette) {
  const workspace = getWorkspace();
  const item = { id: palette.id || `palette-${Date.now()}`, name: palette.name || 'Untitled palette', colors: palette.colors || [], source: palette.source || 'custom', createdAt: palette.createdAt || Date.now(), updatedAt: Date.now() };
  workspace.palettes = [item, ...workspace.palettes.filter(x => x.id !== item.id)];
  saveWorkspace(workspace);
  addHistory({ type: 'palette', id: item.id, name: item.name, colors: item.colors });
  return item;
}

function removePalette(id) {
  const workspace = getWorkspace();
  workspace.palettes = workspace.palettes.filter(item => item.id !== id);
  return saveWorkspace(workspace);
}

function addHistory(item) {
  const history = wx.getStorageSync(HISTORY_KEY) || [];
  const key = item.type === 'color' ? `color:${item.hex}` : `palette:${item.id || item.name}`;
  const next = [{ ...item, key, at: Date.now() }, ...history.filter(x => x.key !== key)].slice(0, MAX_HISTORY);
  wx.setStorageSync(HISTORY_KEY, next);
  return next;
}

function getHistory() { return wx.getStorageSync(HISTORY_KEY) || []; }
function clearHistory() { wx.removeStorageSync(HISTORY_KEY); }

module.exports = { getWorkspace, saveWorkspace, upsertColor, addPalette, removePalette, getHistory, addHistory, clearHistory };
