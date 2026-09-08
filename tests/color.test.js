const assert = require('assert');
const color = require('../miniprogram/utils/color');
const oklab = require('../miniprogram/utils/oklab');
const advanced = require('../miniprogram/utils/advanced-palette');

assert.deepStrictEqual(color.hexToRgb('#fff'), { r: 255, g: 255, b: 255 });
assert.strictEqual(color.rgbToHex(255, 0, 16), '#FF0010');
assert.deepStrictEqual(color.rgbToHsl(255, 0, 0), { h: 0, s: 100, l: 50 });

const p = color.paletteFromHex('#7C3AED');
assert.ok(p && p.complementary.length === 2 && p.analogous.length === 3);

const white = oklab.rgbToOklab(255, 255, 255);
assert(Math.abs(white.L - 1) < 0.002);
const roundTrip = oklab.oklabToRgb(white.L, white.a, white.b);
assert(Math.max(Math.abs(roundTrip.r - 255), Math.abs(roundTrip.g - 255), Math.abs(roundTrip.b - 255)) <= 1);

const scale = advanced.makeScale('#7C3AED');
assert.strictEqual(scale.length, 9);
assert(scale.every((hex) => /^#[0-9A-F]{6}$/.test(hex)));

const unique = advanced.uniquePalette(['#FF0000', '#FF0000', '#00FF00']);
assert.strictEqual(unique.length, 2);

console.log('ColorPalette tests passed.');
