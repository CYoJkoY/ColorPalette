const color = require('../../utils/color');
const oklab = require('../../utils/oklab');
const advanced = require('../../utils/advanced-palette');
const { getByHex, searchColors } = require('../../utils/color-library');
const { toggleFavorite } = require('../../utils/storage');
const { upsertColor } = require('../../utils/palette-workspace');

const RELATIONS = [
  ['analogous', 'Analogous', 'Adjacent hues with a calm, cohesive feel.'], ['complementary', 'Complementary', 'Opposite hues for strong visual separation.'],
  ['split', 'Split complementary', 'One base hue with two near-opposite accents.'], ['triadic', 'Triadic', 'Three evenly spaced hues for balanced contrast.'],
  ['tetradic', 'Tetradic', 'Four hues arranged as two complementary pairs.'], ['doubleComplementary', 'Double complementary', 'Two neighboring hues paired with their opposites.'],
  ['warm', 'Warm range', 'A warm shift around the source hue.'], ['cool', 'Cool range', 'A cool shift around the source hue.'],
  ['monochromatic', 'Monochromatic', 'One hue across several lightness levels.'], ['tints', 'Tints', 'Lighter, softer versions of the source hue.'],
  ['shades', 'Shades', 'Darker versions of the source hue.'], ['tones', 'Tones', 'Lower-saturation versions for restrained interfaces.']
];
function normalize(value) { const rgb = color.hexToRgb(value); return rgb ? color.rgbToHex(rgb.r, rgb.g, rgb.b) : null; }
function swatches(hexes) { return hexes.map((hex, index) => ({ hex, primary:index === 0 })); }

Page({
  data: { item:null, rgb:null, hsl:null, labText:'', labCss:'', lchText:'', lchCss:'', related:[], palette:[], relations:[], contrast:[], favorite:false },
  onLoad(options) {
    const value = normalize(decodeURIComponent(options.hex || ''));
    if (!value) return wx.showToast({ title:'Invalid color', icon:'none', complete:() => wx.navigateBack() });
    this.loadColor(value);
  },
  loadColor(value) {
    const rgb = color.hexToRgb(value);
    const item = getByHex(value) || { id:`custom-${value}`, name:'Custom color', hex:value, collection:'Custom', family:'Unknown', source:'User input' };
    const hsl = color.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const lab = oklab.rgbToOklab(rgb.r, rgb.g, rgb.b);
    const lch = oklab.rgbToOklch(rgb.r, rgb.g, rgb.b);
    const related = searchColors('', { family:item.family }).filter(x => x.hex !== value).sort((a, b) => {
      const ar = color.hexToRgb(a.hex), br = color.hexToRgb(b.hex);
      return oklab.oklabDistance(lab, oklab.rgbToOklab(ar.r, ar.g, ar.b)) - oklab.oklabDistance(lab, oklab.rgbToOklab(br.r, br.g, br.b));
    }).slice(0, 6);
    const all = color.paletteFromHex(value);
    const relations = RELATIONS.map(([id, name, description]) => ({ id, name, description, colors:swatches((all && all[id]) || []) })).filter(x => x.colors.length > 0);
    const contrast = [{ label:'On white', background:'#FFFFFF', ratio:color.contrastRatio(value, '#FFFFFF') }, { label:'On black', background:'#000000', ratio:color.contrastRatio(value, '#000000') }].map(x => ({ ...x, ratio:x.ratio.toFixed(2), grade:color.contrastGrade(Number(x.ratio)) }));
    this.setData({ item, rgb, hsl, labText:`${lab.L.toFixed(4)} · ${lab.a.toFixed(4)} · ${lab.b.toFixed(4)}`, labCss:`oklab(${lab.L.toFixed(4)} ${lab.a.toFixed(4)} ${lab.b.toFixed(4)})`, lchText:`${lch.L.toFixed(4)} · ${lch.C.toFixed(4)} · ${lch.H.toFixed(2)}°`, lchCss:`oklch(${(lch.L * 100).toFixed(2)}% ${lch.C.toFixed(4)} ${lch.H.toFixed(2)})`, related, palette:advanced.makeScale(value), relations, contrast, favorite:require('../../utils/storage').getFavorites().some(x => x.id === item.id) });
    upsertColor(value, item.name);
  },
  copy(e) { wx.setClipboardData({ data:e.currentTarget.dataset.value, success:() => wx.showToast({ title:'Copied', icon:'none' }) }); },
  copyFormat(e) {
    const type = e.currentTarget.dataset.type;
    const value = type === 'rgb' ? `rgb(${this.data.rgb.r}, ${this.data.rgb.g}, ${this.data.rgb.b})` : type === 'hsl' ? `hsl(${Math.round(this.data.hsl.h)} ${Math.round(this.data.hsl.s)}% ${Math.round(this.data.hsl.l)}%)` : type === 'oklab' ? this.data.labCss : this.data.lchCss;
    wx.setClipboardData({ data:value, success:() => wx.showToast({ title:'Copied', icon:'none' }) });
  },
  openRelated(e) { wx.redirectTo({ url:`/pages/color-detail/color-detail?hex=${encodeURIComponent(e.currentTarget.dataset.hex)}` }); },
  useRelation(e) {
    const colors = (this.data.relations.find(x => x.id === e.currentTarget.dataset.id) || {}).colors || [];
    const values = colors.map(x => x.hex);
    if (!values.length) return;
    wx.navigateTo({ url:`/pages/create/create?colors=${encodeURIComponent(JSON.stringify(values))}` });
  },
  useInStudio() { wx.navigateTo({ url:`/pages/create/create?hex=${encodeURIComponent(this.data.item.hex)}` }); },
  makePalette() { this.useInStudio(); },
  favorite() {
    toggleFavorite({ id:this.data.item.id, name:this.data.item.name, colors:[this.data.item.hex], createdAt:Date.now(), source:'color-library' });
    this.setData({ favorite:!this.data.favorite });
    wx.showToast({ title:this.data.favorite ? 'Color saved' : 'Color removed', icon:'none' });
  }
});
