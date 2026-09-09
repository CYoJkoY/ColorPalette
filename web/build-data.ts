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
    nameEn: item.nameEn || englishName(item, index)
  }));

  const categoryNames = [...library.categoryNames, '现代设计色', '开放命名色', 'OKLab 均匀色'].filter((item, index, list) => list.indexOf(item) === index);

  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'colors.json'), JSON.stringify({
    colors,
    categoryNames,
    familyNames: library.familyNames
  }));

  console.log(`Imported ${externalNamed.length} open named colors and ${externalOklab.length} OKLab colors.`);
  console.log(`Generated ${colors.length} named colors.`);
}

main().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
