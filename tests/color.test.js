const assert=require('assert');
// Reuse the framework-free color module without requiring a WeChat runtime.
const c=require('../miniprogram/utils/color');
assert.deepStrictEqual(c.hexToRgb('#fff'),{r:255,g:255,b:255});
assert.strictEqual(c.rgbToHex(255,0,16),'#FF0010');
assert.deepStrictEqual(c.rgbToHsl(255,0,0),{h:0,s:100,l:50});
const p=c.paletteFromHex('#7C3AED');
assert.ok(p && p.complementary.length===2 && p.analogous.length===3);
console.log('ColorPalette tests passed.');
