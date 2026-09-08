const color = require('../../utils/color');
const { getFavorites, saveFavorites } = require('../../utils/storage');
const { categoryNames, familyNames, searchColors } = require('../../utils/color-library');
const { getWorkspace, addPalette, upsertColor } = require('../../utils/palette-workspace');
const { buildExport } = require('../../utils/palette-export');

const MODES = [
  { id:'analogous', name:'类似色' }, { id:'complementary', name:'互补色' }, { id:'split', name:'分裂互补' },
  { id:'triadic', name:'三角色' }, { id:'tetradic', name:'四角色' }, { id:'doubleComplementary', name:'双互补' },
  { id:'monochromatic', name:'单色阶' }, { id:'tints', name:'浅色阶' }, { id:'shades', name:'深色阶' },
  { id:'tones', name:'柔和色阶' }, { id:'pastel', name:'粉彩' }, { id:'vivid', name:'鲜艳' },
  { id:'warm', name:'暖色' }, { id:'cool', name:'冷色' }, { id:'grayscale', name:'灰阶' }
];
function parsePalette(value) { try { const parsed = JSON.parse(decodeURIComponent(value)); if (!parsed || !Array.isArray(parsed.colors)) return null; return { id:parsed.id || '', name:parsed.name || '我的色卡', colors:parsed.colors.slice(0, 8) }; } catch (_) { return null; } }

Page({
  data: { hex:'#7C3AED', h:262, s:80, l:52, modes:MODES, modeIndex:0, colors:[], saved:false, paletteId:'', paletteName:'我的色卡', editing:false, collections:['全部', ...categoryNames], collectionIndex:0, families:familyNames, familyIndex:0, library:[], libraryTotal:0, query:'' },
  onLoad(options = {}) {
    const palette = options.palette ? parsePalette(options.palette) : null;
    if (palette) { const first = color.hexToRgb(palette.colors[0]); const hsl = first ? color.rgbToHsl(first.r, first.g, first.b) : { h:262, s:80, l:52 }; this.setData({ paletteId:palette.id, paletteName:palette.name, editing:true, colors:palette.colors, hex:palette.colors[0] || '#7C3AED', ...hsl, saved:true }, () => this.refreshLibrary()); return; }
    const incoming = color.hexToRgb(options.hex || '');
    if (incoming) { const hsl = color.rgbToHsl(incoming.r, incoming.g, incoming.b); this.setData({ hex:color.rgbToHex(incoming.r, incoming.g, incoming.b), ...hsl }, () => { this.refresh(); this.refreshLibrary(); }); return; }
    if (options.colors) { try { const colors = JSON.parse(decodeURIComponent(options.colors)).filter(Boolean).slice(0, 8); if (colors.length) this.setData({ colors, hex:colors[0], editing:true }, () => this.refreshLibrary()); } catch (_) { this.refresh(); this.refreshLibrary(); } return; }
    this.refresh(); this.refreshLibrary();
  },
  refresh() { if (this.data.editing) return; this.setData({ colors:color.generatePalette(this.data.hex, this.data.modes[this.data.modeIndex].id, 5) }); },
  refreshLibrary() { const collection = this.data.collections[this.data.collectionIndex] === '全部' ? '' : this.data.collections[this.data.collectionIndex]; const family = this.data.families[this.data.familyIndex]; const results = searchColors(this.data.query, { collection, family }); this.setData({ library:results.slice(0, 12), libraryTotal:results.length }); },
  inputSearch(e) { this.setData({ query:e.detail.value }, () => this.refreshLibrary()); },
  onCollectionTap(e) { this.setData({ collectionIndex:Number(e.currentTarget.dataset.index) }, () => this.refreshLibrary()); },
  onFamilyTap(e) { this.setData({ familyIndex:Number(e.currentTarget.dataset.index) }, () => this.refreshLibrary()); },
  openLibrary() { wx.navigateTo({ url:'/pages/library/library' }); },
  openWorkspace() { wx.navigateTo({ url:'/pages/workspace/workspace' }); },
  inputHex(e) { const value = String(e.detail.value || '').trim(); const rgb = color.hexToRgb(value); if (!rgb) return; const hsl = color.rgbToHsl(rgb.r, rgb.g, rgb.b); this.setData({ hex:color.rgbToHex(rgb.r, rgb.g, rgb.b), h:hsl.h, s:hsl.s, l:hsl.l, editing:false }, () => this.refresh()); },
  onModeChange(e) { this.setData({ modeIndex:Number(e.detail.value), editing:false }, () => this.refresh()); },
  onSliderChange(e) { const key = e.currentTarget.dataset.key; const next = { h:this.data.h, s:this.data.s, l:this.data.l }; next[key] = Number(e.detail.value); const rgb = color.hslToRgb(next.h, next.s, next.l); this.setData({ ...next, hex:color.rgbToHex(rgb.r, rgb.g, rgb.b), editing:false }, () => this.refresh()); },
  selectLibraryColor(e) { const hex = e.currentTarget.dataset.hex; const rgb = color.hexToRgb(hex); const hsl = color.rgbToHsl(rgb.r, rgb.g, rgb.b); this.setData({ hex, h:hsl.h, s:hsl.s, l:hsl.l, editing:false }, () => this.refresh()); },
  addLibraryColor(e) { const colors = this.data.colors.slice(); if (colors.length >= 8) return wx.showToast({ title:'最多 8 个颜色', icon:'none' }); const hex = e.currentTarget.dataset.hex.toUpperCase(); colors.push(hex); upsertColor(hex); this.setData({ colors, editing:true }); },
  addColor() { const colors = this.data.colors.slice(); if (colors.length >= 8) return wx.showToast({ title:'最多 8 个颜色', icon:'none' }); colors.push(this.data.hex); upsertColor(this.data.hex); this.setData({ colors, editing:true }); },
  removeColor(e) { const index = Number(e.currentTarget.dataset.index); const colors = this.data.colors.slice(); colors.splice(index, 1); if (colors.length < 1) return wx.showToast({ title:'至少保留 1 个颜色', icon:'none' }); this.setData({ colors, editing:true }); },
  moveColor(e) { const index = Number(e.currentTarget.dataset.index); const target = index + Number(e.currentTarget.dataset.direction); if (target < 0 || target >= this.data.colors.length) return; const colors = this.data.colors.slice(); [colors[index], colors[target]] = [colors[target], colors[index]]; this.setData({ colors, editing:true }); },
  renamePalette(e) { this.setData({ paletteName:String(e.detail.value || '').trim() || '我的色卡', editing:true }); },
  copy(e) { wx.setClipboardData({ data:e.currentTarget.dataset.hex, success:() => wx.showToast({ title:'HEX 已复制', icon:'none' }) }); },
  save() {
    if (this.data.colors.length < 2) return wx.showToast({ title:'至少需要 2 个颜色', icon:'none' });
    const now = Date.now(); const existing = getWorkspace().palettes.find(x => x.id === this.data.paletteId);
    const item = addPalette({ id:this.data.paletteId || `palette-${now}`, name:this.data.paletteName || '我的色卡', colors:this.data.colors, source:existing && existing.source || 'custom', createdAt:existing && existing.createdAt || now });
    const favorites = getFavorites(); const index = favorites.findIndex(x => x.id === item.id); const favorite = { id:item.id, name:item.name, colors:item.colors, createdAt:item.createdAt, source:item.source };
    if (index >= 0) favorites[index] = favorite; else favorites.unshift(favorite); saveFavorites(favorites);
    this.setData({ paletteId:item.id, paletteName:item.name, saved:true, editing:true }); wx.showToast({ title:'色卡已保存', icon:'none' });
  },
  exportPalette() { if (!this.data.colors.length) return; const formats = buildExport(this.data.colors, this.data.paletteName); const text = `CSS\n${formats.css}\n\nSCSS\n${formats.scss}\n\nJSON\n${formats.json}\n\nDesign Tokens\n${formats.tokens}\n\nTailwind\n${formats.tailwind}`; wx.setClipboardData({ data:text, success:() => wx.showToast({ title:'已复制全部导出格式', icon:'none' }) }); }
});
