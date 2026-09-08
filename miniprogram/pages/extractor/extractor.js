Page({
  data: { image: '', colors: [], picked: '', loading: false, imageWidth: 0, imageHeight: 0 },

  chooseImage() {
    wx.chooseMedia({ count: 1, mediaType: ['image'], sourceType: ['album', 'camera'], success: r => this.extract(r.tempFiles[0].tempFilePath) });
  },

  extract(path) {
    this.setData({ image: path, loading: true, colors: [], picked: '' });
    wx.getImageInfo({
      src: path,
      success: info => {
        this.setData({ imageWidth: info.width, imageHeight: info.height });
        const canvas = wx.createOffscreenCanvas({ type: '2d', width: 80, height: 80 });
        const ctx = canvas.getContext('2d');
        ctx.drawImage(path, 0, 0, 80, 80);
        const pixels = ctx.getImageData(0, 0, 80, 80).data;
        const map = {};
        for (let y = 0; y < 80; y += 3) {
          for (let x = 0; x < 80; x += 3) {
            const i = (y * 80 + x) * 4;
            if (pixels[i + 3] < 180) continue;
            const r = Math.min(255, Math.round(pixels[i] / 16) * 16);
            const g = Math.min(255, Math.round(pixels[i + 1] / 16) * 16);
            const b = Math.min(255, Math.round(pixels[i + 2] / 16) * 16);
            const key = [r, g, b].join(',');
            map[key] = (map[key] || 0) + 1;
          }
        }
        const colors = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 12)
          .map(([key]) => '#' + key.split(',').map(n => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase());
        this.setData({ colors, loading: false });
      },
      fail: () => this.setData({ loading: false })
    });
  },

  pickFromImage(e) {
    if (!this.data.image || !this.data.imageWidth || !this.data.imageHeight) return;
    wx.createSelectorQuery().select('#sourceImage').boundingClientRect(rect => {
      if (!rect) return;
      const x = Math.max(0, Math.min(rect.width, e.detail.x - rect.left));
      const y = Math.max(0, Math.min(rect.height, e.detail.y - rect.top));
      const px = wx.createOffscreenCanvas({ type: '2d', width: 120, height: 120 });
      const ctx = px.getContext('2d');
      ctx.drawImage(this.data.image, 0, 0, 120, 120);
      const sx = Math.max(0, Math.min(119, Math.floor(x / rect.width * 120)));
      const sy = Math.max(0, Math.min(119, Math.floor(y / rect.height * 120)));
      const pixel = ctx.getImageData(sx, sy, 1, 1).data;
      const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase();
      this.setData({ picked: hex });
      wx.setClipboardData({ data: hex, success: () => wx.showToast({ title: `${hex} 已复制`, icon: 'none' }) });
    }).exec();
  },

  copy(e) {
    wx.setClipboardData({ data: e.currentTarget.dataset.hex, success: () => wx.showToast({ title: '已复制', icon: 'none' }) });
  }
});
