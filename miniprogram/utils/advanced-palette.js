const { hexToRgb, rgbToHex } = require('./color');
const { rgbToOklab, oklabToRgb } = require('./oklab');

function makeScale(hex, steps = 9) {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const c = rgbToOklab(rgb.r, rgb.g, rgb.b);
  const result = [];
  for (let i = 0; i < steps; i += 1) {
    const L = 0.08 + (0.90 * i) / (steps - 1);
    result.push(rgbToHex(...Object.values(oklabToRgb(L, c.a, c.b))));
  }
  return result;
}

function uniquePalette(colors, threshold = 0.035) {
  const accepted = [];
  colors.forEach((hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const lab = rgbToOklab(rgb.r, rgb.g, rgb.b);
    if (!accepted.some((item) => {
      const d = Math.sqrt((lab.L - item.L) ** 2 + (lab.a - item.a) ** 2 + (lab.b - item.b) ** 2);
      return d < threshold;
    })) accepted.push({ ...lab, hex });
  });
  return accepted.map((x) => x.hex);
}

module.exports = { makeScale, uniquePalette };