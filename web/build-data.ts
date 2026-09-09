const fs = require('fs');
const path = require('path');
const https = require('https');
const library = require('../core/color-library');
const modern = require('../core/modern-colors');
const out = path.join(__dirname, 'data');

const BASIC_EN = {
  '朱砂':'Cinnabar', '赤红':'Scarlet', '绯红':'Crimson', '酒红':'Burgundy', '珊瑚':'Coral', '砖红':'Brick Red',
  '橘橙':'Tangerine', '杏橙':'Apricot Orange', '琥珀':'Amber', '南瓜':'Pumpkin', '焦糖':'Caramel', '铜棕':'Copper Brown',
  '柠檬':'Lemon', '明黄':'Bright Yellow', '芥末':'Mustard', '金黄':'Golden Yellow', '奶油':'Cream', '沙黄':'Sand Yellow',
  '草绿':'Grass Green', '翡翠':'Emerald', '森林':'Forest Green', '苔藓':'Moss Green', '薄荷':'Mint', '鼠尾草':'Sage',
  '青碧':'Teal Green', '湖蓝':'Lake Blue', '天青':'Sky Cyan', '青瓷':'Celadon', '松石':'Turquoise', '海沫':'Seafoam',
  '天蓝':'Sky Blue', '蔚蓝':'Azure', '钴蓝':'Cobalt Blue', '海军蓝':'Navy Blue', '钢蓝':'Steel Blue', '冰蓝':'Ice Blue',
  '薰衣草':'Lavender', '紫罗兰':'Violet', '皇家紫':'Royal Purple', '葡萄':'Grape', '梅紫':'Plum Purple', '紫灰':'Mauve Gray',
  '樱粉':'Cherry Pink', '玫瑰':'Rose', '桃粉':'Peach Pink', '莓果':'Berry', '裸粉':'Nude Pink', '粉紫':'Pink Lilac',
  '沙棕':'Sand Brown', '赭石':'Ochre', '咖啡':'Coffee', '栗棕':'Chestnut Brown', '焦褐':'Dark Taupe', '米杏':'Almond Beige',
  '墨黑':'Ink Black', '炭灰':'Charcoal Gray', '石墨':'Graphite', '银灰':'Silver Gray', '象牙白':'Ivory', '纯白':'Pure White'
};

const SOURCES = {
  named: 'https://raw.githubusercontent.com/meodai/color-names/main/src/colornames.csv',
  oklab: 'https://raw.githubusercontent.com/meodai/colornames-oklab/main/colornames-oklab.json',
  chinaExtended: 'https://raw.githubusercontent.com/nevertoday/zhongguo-traditional-colors/main/docs/chinese-color-master-list.md',
  japanExtended: 'https://raw.githubusercontent.com/xiaohk/nippon-colors/master/nippon_colors.json'
};

const FAMILY_NAMES = ['红', '橙', '黄', '绿', '青', '蓝', '紫', '粉', '棕', '中性'];

const BASIC_EXTRA = {
  红: [['正红','#E60012'],['丹红','#D9381E'],['玫红','#D81E5B'],['樱桃红','#DE3163']],
  橙: [['橙红','#FF681F'],['蜜橙','#FF9F1C'],['杏色','#F4B183'],['琥珀橙','#FFBF00']],
  黄: [['柑橘黄','#FFC857'],['稻草黄','#E4C86B'],['香槟黄','#FAD6A5'],['玉米黄','#F2B134']],
  绿: [['橄榄绿','#808000'],['黄绿','#9ACD32'],['苔绿','#6B8E23'],['橄榄青','#708238']],
  青: [['蓝绿','#009688'],['青绿','#2E8B57'],['水青','#5CE1E6'],['薄荷青','#98FF98']],
  蓝: [['宝蓝','#4169E1'],['宝石蓝','#0067A5'],['深海蓝','#013A63'],['雾蓝','#8CA6DB']],
  紫: [['深紫','#5B2C83'],['葡萄紫','#6F2DA8'],['紫红','#C71585'],['薰衣草灰','#BDB5D5']],
  粉: [['玫瑰粉','#FF66A3'],['樱花粉','#F7C6D9'],['蜜桃粉','#FFDAB9'],['珊瑚粉','#F88379']],
  棕: [['胡桃棕','#7B4A12'],['摩卡','#8B5E3C'],['卡其','#C3B091'],['焦糖棕','#A0522D']],
  中性: [['灰白','#F2F2F0'],['雾灰','#D9D9D4'],['铁灰','#4B4B4B'],['深炭','#2F2F2F']]
};

const ART_EXTRA = [
  ['那不勒斯黄','Naples Yellow','#FADA5E'],['印度黄','Indian Yellow','#E3A857'],['钴黄','Cobalt Yellow','#F8D64E'],['铅锡黄','Lead-Tin Yellow','#F4D36A'],['铬黄','Chrome Yellow','#FFA700'],
  ['汉莎黄','Hansa Yellow','#F5E600'],['铀黄','Aureolin','#FDEE00'],['黄赭','Yellow Ochre','#CC7722'],['生赭','Raw Sienna','#C68A5A'],['熟赭','Burnt Sienna','#E97451'],
  ['生褐土','Raw Umber','#826644'],['熟褐土','Burnt Umber','#8A3324'],['绿土','Green Earth','#A7B17B'],['特勒维尔绿','Terre Verte','#78866B'],['氧化铬绿','Chromium Oxide Green','#6B8E23'],
  ['钴绿','Cobalt Green','#3F9B72'],['翠绿','Emerald Green','#50C878'],['铜绿','Verdigris','#43B3AE'],['酞菁绿','Phthalo Green','#123524'],['群青绿','Ultramarine Green','#6D8B74'],
  ['叠蓝','Azurite','#2E4A62'],['土耳其蓝','Turquoise Pigment','#30D5C8'],['青金石蓝','Lapis Lazuli','#26619C'],['天青石蓝','Cerulean Blue','#2A52BE'],['钴天蓝','Cobalt Cerulean','#007BA7'],
  ['斯马尔特蓝','Smalt','#003399'],['维维安石','Vivianite','#577C8A'],['汉蓝','Han Blue','#446CCF'],['汉紫','Han Purple','#5228F2'],['二噁嗪紫','Dioxazine Violet','#5C2D91'],
  ['火山紫','Mars Violet','#5A4A42'],['泰尔紫','Tyrian Purple','#630330'],['胭脂红','Carmine','#960018'],['胭脂虫红','Cochineal','#A61B29'],['茜素深红','Alizarin Crimson','#E32636'],
  ['茜草湖红','Madder Lake','#E30022'],['朱砂红','Vermilion','#E34234'],['铅丹','Red Lead','#FF3300'],['雄黄','Realgar','#D84B20'],['锌白','Zinc White','#F7F7F5'],
  ['铅白','Lead White','#F0F0E8'],['钛白','Titanium White','#F8F8F0'],['锌钡白','Lithopone','#F9F8F2'],['石膏白','Gypsum','#EFEDE0'],['粉笔白','Chalk','#F0F0E6'],
  ['藤黑','Vine Black','#1B1B1B'],['灯黑','Lamp Black','#1A1A1A'],['象牙黑','Ivory Black','#1B1B1B'],['沥青黑','Bitumen','#1C1513'],['铁锈红','Iron Oxide Red','#8B2E1F']
];

function stripCjk(value) {
  return String(value || '')
    .replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function englishName(item, index) {
  const sourceName = String(item.name || '').trim();
  const explicit = BASIC_EN[sourceName];
  if (explicit) return explicit;

  const latin = stripCjk(sourceName);
  if (latin) return latin;

  const collectionLabels = {
    '基础色': 'Basic Color',
    'CSS 标准色': 'CSS Color',
    '中国传统色': 'Traditional Chinese Color',
    '日本传统色': 'Traditional Japanese Color',
    '艺术与颜料': 'Art and Pigment Color',
    '现代设计色': 'Modern Design Color',
    '开放命名色': 'Open Named Color',
    'OKLab 均匀色': 'OKLab Balanced Color'
  };
  return `${collectionLabels[item.collection] || 'Named Color'} ${String(index + 1).padStart(5, '0')}`;
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { 'User-Agent': 'ColorPalette-build/1.0' } }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        return resolve(fetchText(new URL(response.headers.location, url).toString()));
      }
      if (response.statusCode !== 200) {
        response.resume();
        return reject(new Error(`Failed to fetch ${url}: HTTP ${response.statusCode}`));
      }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    request.setTimeout(60000, () => request.destroy(new Error(`Timed out fetching ${url}`)));
    request.on('error', reject);
  });
}

function parseCsvRow(line) {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === ',' && !quoted) {
      cells.push(cell);
      cell = '';
    } else {
      cell += ch;
    }
  }
  cells.push(cell);
  return cells;
}

function parseNamedColors(csv) {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const rows = lines.slice(1).map(parseCsvRow);
  return rows.map(([name, hex]) => ({
    name: String(name || '').trim(),
    hex: String(hex || '').trim().toUpperCase(),
    collection: '开放命名色',
    source: 'meodai/color-names'
  })).filter(item => item.name && /^#[0-9A-F]{6}$/.test(item.hex));
}

function parseOklabColors(text) {
  const source = JSON.parse(text);
  return source.map(item => ({
    name: String(item.name || '').trim(),
    nameEn: String(item.name || '').trim(),
    hex: String(item.hex || '').trim().toUpperCase(),
    collection: 'OKLab 均匀色',
    source: 'meodai/colornames-oklab',
    gamut: item.tier || '',
    oklab: Array.isArray(item.oklab) ? item.oklab : undefined
  })).filter(item => item.name && /^#[0-9A-F]{6}$/.test(item.hex));
}

function parseChinaExtended(text) {
  const body = text.match(/```text\s*([\s\S]*?)```/i)?.[1] || text;
  return body.split(/\r?\n/).map(line => {
    const match = line.trim().match(/^(.+?)\s+(#[0-9A-Fa-f]{6})$/);
    if (!match) return null;
    return {
      name: match[1].trim(),
      hex: match[2].toUpperCase(),
      collection: '中国传统色',
      source: 'nevertoday/zhongguo-traditional-colors'
    };
  }).filter(Boolean);
}

function parseJapanExtended(text) {
  const source = JSON.parse(text);
  return source.map(item => ({
    name: String(item.kanji || '').trim(),
    nameEn: String(item.romanji || '').trim().toUpperCase(),
    hex: String(item.hex || '').trim().toUpperCase(),
    collection: '日本传统色',
    source: 'xiaohk/nippon-colors'
  })).filter(item => item.name && /^#[0-9A-F]{6}$/.test(item.hex));
}

function rgbFromHex(value) {
  const hex = String(value || '').replace(/^#/, '').trim();
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16)
  };
}

function hslFromHex(value) {
  const rgb = rgbFromHex(value);
  if (!rgb) return null;

  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) return { h: 0, s: 0, l: lightness * 100 };

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue;
  if (max === r) hue = 60 * (((g - b) / delta) % 6);
  else if (max === g) hue = 60 * ((b - r) / delta + 2);
  else hue = 60 * ((r - g) / delta + 4);
  if (hue < 0) hue += 360;

  return { h: hue, s: saturation * 100, l: lightness * 100 };
}

function familyFromHex(value) {
  const hsl = hslFromHex(value);
  if (!hsl) return '中性';

  const { h, s, l } = hsl;
  if (s < 12 || l >= 97 || l <= 3) return '中性';
  if (h >= 12 && h < 48 && s >= 24 && l < 56) return '棕';
  if (h >= 345 || h < 12) return '红';
  if (h >= 12 && h < 42) return '橙';
  if (h >= 42 && h < 72) return '黄';
  if (h >= 72 && h < 160) return '绿';
  if (h >= 160 && h < 195) return '青';
  if (h >= 195 && h < 255) return '蓝';
  if (h >= 255 && h < 305) return '紫';
  if (h >= 305 && h < 345) return l >= 62 ? '粉' : '紫';
  return '中性';
}

function normalizeFamily(item) {
  const explicit = String(item.family || '').trim();
  if (FAMILY_NAMES.includes(explicit)) return explicit;
  return familyFromHex(item.hex);
}

function basicExtraColors() {
  return Object.keys(BASIC_EXTRA).flatMap(category => BASIC_EXTRA[category].map(([name, hex]) => ({
    name,
    hex,
    category,
    collection: '基础色',
    source: 'ColorPalette curated basics'
  })));
}

function artExtraColors() {
  return ART_EXTRA.map(([name, nameEn, hex]) => ({
    name,
    nameEn,
    hex,
    collection: '艺术与颜料',
    source: 'ColorPalette pigment references'
  }));
}

function mergeCollectionByHex(base, additions) {
  const result = [...base];
  const seen = new Set(result.map(item => `${item.collection}|${String(item.hex || '').toUpperCase()}`));
  for (const item of additions) {
    const key = `${item.collection}|${String(item.hex || '').toUpperCase()}`;
    if (!item.hex || seen.has(key)) continue;
    result.push(item);
    seen.add(key);
  }
  return result;
}

function dedupe(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = `${item.collection}|${item.name}|${item.hex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  const [namedText, oklabText, chinaText, japanText] = await Promise.all([
    fetchText(SOURCES.named),
    fetchText(SOURCES.oklab),
    fetchText(SOURCES.chinaExtended),
    fetchText(SOURCES.japanExtended)
  ]);

  const externalNamed = parseNamedColors(namedText);
  const externalOklab = parseOklabColors(oklabText);
  const externalChina = parseChinaExtended(chinaText);
  const externalJapan = parseJapanExtended(japanText);
  const curatedBasics = basicExtraColors();
  const curatedArt = artExtraColors();

  let colors = dedupe([
    ...library.colors,
    ...curatedBasics,
    ...curatedArt,
    ...modern,
    ...externalNamed,
    ...externalOklab
  ]);

  colors = mergeCollectionByHex(colors, externalChina);
  colors = mergeCollectionByHex(colors, externalJapan);

  colors = colors.map((item, index) => ({
    ...item,
    id: item.id || `${item.collection}-${item.name}-${index}`,
    family: normalizeFamily(item),
    nameEn: item.nameEn || englishName(item, index)
  }));

  const categoryNames = [...library.categoryNames, '现代设计色', '开放命名色', 'OKLab 均匀色']
    .filter((item, index, list) => list.indexOf(item) === index);

  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'colors.json'), JSON.stringify({
    colors,
    categoryNames,
    familyNames: FAMILY_NAMES
  }));

  const counts = Object.fromEntries(categoryNames.map(name => [name, colors.filter(item => item.collection === name).length]));
  console.log(`Imported ${externalNamed.length} open named colors, ${externalOklab.length} OKLab colors, ${externalChina.length} Chinese colors and ${externalJapan.length} Japanese colors.`);
  console.log(`Generated ${colors.length} named colors.`);
  console.log('Category counts:', JSON.stringify(counts));
}

main().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
