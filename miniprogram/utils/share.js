const { rgbToHex } = require('./color');

function rgbToColor(rgb) {
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function buildShareText(colors, title = 'ColorPalette 色卡') {
  const list = (colors || []).slice(0, 12).map((c) => typeof c === 'string' ? c.toUpperCase() : rgbToColor(c));
  return `${title}\n${list.join(' · ')}\n来自 ColorPalette`;
}

module.exports = { buildShareText };