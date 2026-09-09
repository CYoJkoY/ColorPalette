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
  oklab: 'https://raw.githubusercontent.com/meodai/colornames-oklab/main/colornames-oklab.json'
};

const FAMILY_NAMES = ['红', '橙', '黄', '绿', '青', '蓝', '紫', '粉', '棕', '中性'];

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
  // Very low-chroma colors and extreme near-white / near-black values read as neutral.
  if (s < 12 || l >= 97 || l <= 3) return '中性';

  // Brown is best separated from orange by both chroma and lightness.
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
  const [namedText, oklabText] = await Promise.all([
    fetchText(SOURCES.named),
    fetchText(SOURCES.oklab)
  ]);

  const externalNamed = parseNamedColors(namedText);
  const externalOklab = parseOklabColors(oklabText);
  const colors = dedupe([...library.colors, ...modern, ...externalNamed, ...externalOklab]).map((item, index) => ({
    ...item,
    id: item.id || `${item.collection}-${item.name}-${index}`,
    family: normalizeFamily(item),
    nameEn: item.nameEn || englishName(item, index)
  }));

  const categoryNames = [...library.categoryNames, '现代设计色', '开放命名色', 'OKLab 均匀色'].filter((item, index, list) => list.indexOf(item) === index);

  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'colors.json'), JSON.stringify({
    colors,
    categoryNames,
    familyNames: FAMILY_NAMES
  }));

  console.log(`Imported ${externalNamed.length} open named colors and ${externalOklab.length} OKLab colors.`);
  console.log(`Generated ${colors.length} named colors.`);
}

main().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
