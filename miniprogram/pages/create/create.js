const { hexToRgb, rgbToHsl, rgbToHex, generatePalette } = require('../../utils/color');
const { toggleFavorite } = require('../../utils/storage');

const MODES = [
  { id: 'analogous', name: '类似色' },
  { id: 'complementary', name: '互补色' },
  { id: 'split', name: '分裂互补' },
  { id: 'triadic', name: '三角色' },
  { id: 'tetradic', name: '四角色' },
  { id: 'doubleComplementary', name: '双互补' },
  { id: 'monochromatic', name: '单色阶' },
  { id: 'tints', name: '浅色阶' },
  { id: 'shades', name: '深色阶' },
  { id: 'tones', name: '柔和色阶' },
  { id: 'pastel', name: '粉彩' },
  { id: 'vivid', name: '鲜艳' },
  { id: 'warm', name: '暖色' },
  { id: 'cool', name: '冷色' },
  { id: 'grayscale', name: '灰阶' }
];

Page({
  data: { hex: '#7C3AED', h: 262, s: 80, l: 52, modes: MODES, modeIndex: 0, colors: [], saved: false },

  onLoad() { this.refresh(); },

  refresh() {
    const colors = generatePalette(this.data.hex, this.data.modes[this.data.modeIndex].id, 5);
    this.setData({ colors });
  },

  inputHex(e) {
    const value = String(e.detail.value || '').trim();
    const rgb = hexToRgb(value);
    if (!rgb) return;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    this.setData({ hex: rgbToHex(rgb.r, rgb.g, rgb.b), h: hsl.h, s: hsl.s, l: hsl.l }, () => this.refresh());
  },

  onModeChange(e) { this.setData({ modeIndex: Number(e.detail.value) }, () => this.refresh()); },

  onSliderChange(e) {
    const key = e.currentTarget.dataset.key;
    const value = Number(e.detail.value);
    const next = { h: this.data.h, s: this.data.s, l: this.data.l };
    next[key] = value;
    const rgb = require('../../utils/color').hslToRgb(next.h, next.s, next.l);
    this.setData({ ...next, hex: rgbToHex(rgb.r, rgb.g, rgb.b) }, () => this.refresh());
  },

  copy(e) {
    wx.setClipboardData({ data: e.currentTarget.dataset.hex, success: () => wx.showToast({ title: '已复制', icon: 'none' }) });
  },

  save() {
    const palette = { id: `custom-${Date.now()}`, name: '我的色卡', colors: this.data.colors, createdAt: Date.now() };
    toggleFavorite(palette);
    this.setData({ saved: true });
    wx.showToast({ title: '已收藏色卡', icon: 'none' });
  },

  addColor() {
    const colors = this.data.colors.slice();
    if (colors.length >= 8) return wx.showToast({ title: '最多 8 个颜色', icon: 'none' });
    colors.push(this.data.hex);
    this.setData({ colors });
  }
});
