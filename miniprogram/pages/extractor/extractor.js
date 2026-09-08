const color = require('../../utils/color');
const { savePalette, upsertColor } = require('../../utils/palette-workspace');

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(n => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function luminance(r, g, b) {
  const values = [r, g, b].map(v => v / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}

function saturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function classify(rgb, all) {
  const l = luminance(rgb.r, rgb.g, rgb.b);
  const s = saturation(rgb.r, rgb.g, rgb.b);
  const sorted = all.slice().sort((a, b) => b.count - a.count);
  if (l < 0.08) return 'dark';
  if (l > 0.9 && s < 0.16) return 'light';
  if (s > 0.45 && sorted.indexOf(rgb) < 5) return 'accent';
  return 'secondary';
}

Page({
  data: { image: '', colors: [], roles: [], picked: '', loading: false, imageWidth: 0, imageHeight: 0, paletteSaved: false },

  chooseImage() {
    wx.chooseMedia({ count: 1, mediaType: ['image'], sourceType: ['album', 'camera'], success: r => this.extract(r.tempFiles[0].tempFilePath) });
  },

  extract(path) {
    this.setData({ image: path, loading: true, colors: [], roles: [], picked: '', paletteSaved: false });
    wx.getImageInfo({
      src: path,
      success: info => {
        this.setData({ imageWidth: info.width, imageHeight: info.height });
        const canvas = wx.createOffscreenCanvas({ type: '2d', width: 96, height: 96 });
        const ctx = canvas.getContext('2d');
        ctx.drawImage(path, 0, 0, 96, 96);
        const pixels = ctx.getImageData(0, 0, 96, 96).data;
        const map = {};
        let total = 0;
        for (let y = 0; y < 96; y += 3) {
          for (let x = 0; x < 96; x += 3) {
            const i = (y * 96 + x) * 4;
            if (pixels[i + 3] < 180) continue;
            const r = Math.min(255, Math.round(pixels[i] / 16) * 16);
            const g = Math.min(255, Math.round(pixels[i + 1] / 16) * 16);
            const b = Math.min(255, Math.round(pixels[i + 2] / 16) * 16);
            const key = [r, g, b].join(',');
            map[key] = (map[key] || 0) + 1;
            total += 1;
          }
        }
        const ranked = Object.entries(map).map(([key, count]) => {
          const [r, g, b] = key.split(',').map(Number);
          return { hex: rgbToHex(r, g, b), r, g, b, count };
        }).sort((a, b) => b.count - a.count);
        const candidates = [];
        ranked.forEach(item => {
          if (candidates.length >= 8) return;
          const farEnough = candidates.every(x => {
            const dr = x.r - item.r, dg = x.g - item.g, db = x.b - item.b;
            return Math.sqrt(dr * dr + dg * dg + db * db) >= 42;
          });
          if (farEnough) candidates.push(item);
        });
        const top = candidates.length >= 5 ? candidates.slice(0, 5) : ranked.slice(0, 5);
        const roles = top.map((item, index) => ({ ...item, role: index === 0 ? 'dominant' : classify(item, top), percent: total ? Math.round(item.count / total * 100) : 0 }));
        roles.forEach(item => upsertColor(item.hex));
        this.setData({ colors: top.map(x => x.hex), roles, loading: false });
      },
      fail: () => this.setData({ loading: false })
    });
  },

  savePalette() {
    if (this.data.colors.length < 2) return;
    const item = savePalette({ name: 'Image palette', colors: this.data.colors, source: 'image' });
    this.setData({ paletteSaved: true });
    wx.showToast({ title: `${item.name} 已保存`, icon: 'none' });
  },

  openStudio() {
    if (!this.data.colors.length) return;
    wx.navigateTo({ url: `/pages/create/create?colors=${encodeURIComponent(JSON.stringify(this.data.colors))}&name=${encodeURIComponent('Image palette')}` });
  },

  pickFromImage(e) {
    if (!this.data.image || !this.data.imageWidth || !this.data.imageHeight) return;
    wx.createSelectorQuery().select('#sourceImage').boundingClientRect(rect => {
      if (!rect) return;
      const x = Math.max(0, Math.min(rect.width - 1, e.detail.x - rect.left));
      const y = Math.max(0, Math.min(rect.height - 1, e.detail.y - rect.top));
      const px = wx.createOffscreenCanvas({ type: '2d', width: 120, height: 120 });
      const ctx = px.getContext('2d');
      ctx.drawImage(this.data.image, 0, 0, 120, 120);
      const sx = Math.max(0, Math.min(119, Math.floor(x / rect.width * 120)));
      const sy = Math.max(0, Math.min(119, Math.floor(y / rect.height * 120)));
      const pixel = ctx.getImageData(sx, sy, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      upsertColor(hex);
      this.setData({ picked: hex });
      wx.setClipboardData({ data: hex, success: () => wx.showToast({ title: `${hex} 已复制`, icon: 'none' }) });
    }).exec();
  },

  copy(e) {
    const hex = e.currentTarget.dataset.hex;
    upsertColor(hex);
    wx.setClipboardData({ data: hex, success: () => wx.showToast({ title: 'HEX 已复制', icon: 'none' }) });
  }
});