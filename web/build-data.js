const fs = require('fs');
const path = require('path');
const library = require('../core/color-library');
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
    '艺术与颜料': 'Art and Pigment Color'
  };
  return `${collectionLabels[item.collection] || 'Named Color'} ${String(index + 1).padStart(3, '0')}`;
}

const colors = library.colors.map((item, index) => ({ ...item, nameEn: englishName(item, index) }));
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'colors.json'), JSON.stringify({
  colors,
  categoryNames: library.categoryNames,
  familyNames: library.familyNames
}, null, 0));
console.log(`Generated ${colors.length} named colors.`);
