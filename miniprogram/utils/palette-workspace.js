const KEY = 'colorPaletteWorkspace';
const HISTORY_KEY = 'colorPaletteHistory';
const MAX_HISTORY = 40;
const MAX_COLORS = 120;
const MAX_PALETTES = 60;

function normalizeHex(hex) {
  return String(hex || '').trim().toUpperCase();
}

function normalizePalette(palette = {}) {
  const colors = (palette.colors || []).map(normalizeHex).filter(Boolean).slice(0, 8);
  return {
    id: palette.id || `palette-${Date.now()}`,
    name: String(palette.name || 'Untitled palette').trim() || 'Untitled palette',
    colors,
    source: palette.source || 'custom',
    tags: Array.isArray(palette.tags) ? palette.tags.slice(0, 8) : [],
    note: String(palette.note || '').slice(0, 500),
    createdAt: palette.createdAt || Date.now(),
    updatedAt: Date.now()
  };
}

function getWorkspace() {
  const current = wx.getStorageSync(KEY);
  if (current && Array.isArray(current.colors) && Array.isArray(current.palettes)) return current;

  const legacy = wx.getStorageSync('favoritePalettes') || [];
  const workspace = {
    colors: [],
    palettes: legacy.map(item => normalizePalette(item)).slice(0, MAX_PALETTES)
  };
  wx.setStorageSync(KEY, workspace);
  return workspace;
}

function saveWorkspace(workspace) {
  const next = {
    colors: Array.isArray(workspace.colors) ? workspace.colors.slice(0, MAX_COLORS) : [],
    palettes: Array.isArray(workspace.palettes) ? workspace.palettes.slice(0, MAX_PALETTES) : []
  };
  wx.setStorageSync(KEY, next);
  return next;
}

function upsertColor(hex, name = '') {
  const normalized = normalizeHex(hex);
  if (!normalized) return getWorkspace().colors;
  const workspace = getWorkspace();
  const colors = workspace.colors.filter(item => normalizeHex(item.hex) !== normalized);
  colors.unshift({ hex: normalized, name: String(name || ''), updatedAt: Date.now() });
  workspace.colors = colors.slice(0, MAX_COLORS);
  saveWorkspace(workspace);
  addHistory({ type: 'color', hex: normalized, name });
  return workspace.colors;
}

function savePalette(palette) {
  const workspace = getWorkspace();
  const existing = workspace.palettes.find(item => item.id === palette.id);
  const item = normalizePalette({
    ...existing,
    ...palette,
    id: palette.id || existing?.id,
    createdAt: existing?.createdAt || palette.createdAt
  });
  workspace.palettes = [item, ...workspace.palettes.filter(x => x.id !== item.id)];
  saveWorkspace(workspace);
  item.colors.forEach(hex => upsertColor(hex));
  addHistory({ type: 'palette', id: item.id, name: item.name, colors: item.colors });
  return item;
}

function addPalette(palette) { return savePalette(palette); }

function removePalette(id) {
  const workspace = getWorkspace();
  workspace.palettes = workspace.palettes.filter(item => item.id !== id);
  return saveWorkspace(workspace);
}

function duplicatePalette(id) {
  const workspace = getWorkspace();
  const source = workspace.palettes.find(item => item.id === id);
  if (!source) return null;
  return savePalette({ ...source, id: `palette-${Date.now()}`, name: `${source.name} Copy` });
}

function addHistory(item) {
  const history = wx.getStorageSync(HISTORY_KEY) || [];
  const key = item.type === 'color' ? `color:${normalizeHex(item.hex)}` : `palette:${item.id || item.name}`;
  const next = [{ ...item, key, at: Date.now() }, ...history.filter(x => x.key !== key)].slice(0, MAX_HISTORY);
  wx.setStorageSync(HISTORY_KEY, next);
  return next;
}

function getHistory() { return wx.getStorageSync(HISTORY_KEY) || []; }
function clearHistory() { wx.removeStorageSync(HISTORY_KEY); }

module.exports = { getWorkspace, saveWorkspace, normalizePalette, upsertColor, savePalette, addPalette, removePalette, duplicatePalette, getHistory, addHistory, clearHistory };