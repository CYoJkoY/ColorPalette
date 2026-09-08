function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

function srgbToLinear(v) {
  v /= 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linearToSrgb(v) {
  v = clamp(v, 0, 1);
  return (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255;
}

function rgbToOklab(r, g, b) {
  const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b);
  const l = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
  const m = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
  const s = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;
  const l3 = Math.cbrt(l), m3 = Math.cbrt(m), s3 = Math.cbrt(s);
  return {
    L: 0.2104542553 * l3 + 0.793617785 * m3 - 0.0040720468 * s3,
    a: 1.9779984951 * l3 - 2.428592205 * m3 + 0.4505937099 * s3,
    b: 0.0259040371 * l3 + 0.7827717662 * m3 - 0.808675766 * s3
  };
}

function oklabToRgb(L, a, b) {
  const l3 = L + 0.3963377774 * a + 0.2158037573 * b;
  const m3 = L - 0.1055613458 * a - 0.0638541728 * b;
  const s3 = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l3 * l3 * l3, m = m3 * m3 * m3, s = s3 * s3 * s3;
  const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const B = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return { r: Math.round(linearToSrgb(R)), g: Math.round(linearToSrgb(G)), b: Math.round(linearToSrgb(B)) };
}

function oklabDistance(c1, c2) {
  return Math.sqrt(Math.pow(c1.L - c2.L, 2) + Math.pow(c1.a - c2.a, 2) + Math.pow(c1.b - c2.b, 2));
}

function adjustLightness(rgb, delta) {
  const c = rgbToOklab(rgb.r, rgb.g, rgb.b);
  return oklabToRgb(clamp(c.L + delta, 0, 1), c.a, c.b);
}

module.exports = { rgbToOklab, oklabToRgb, oklabDistance, adjustLightness };