const fs = require('fs');
const path = require('path');
const library = require('../miniprogram/utils/color-library');
const out = path.join(__dirname, 'data');

function englishName(item) {
  const name = String(item.name || '').trim();
  const latin = name.split(/\s+/).filter(part => /[A-Za-z]/.test(part)).join(' ');
  return latin || `Named Color ${item.hex}`;
}

const colors = library.colors.map(item => ({ ...item, nameEn: englishName(item) }));
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'colors.json'), JSON.stringify({
  colors,
  categoryNames: library.categoryNames,
  familyNames: library.familyNames
}, null, 0));
console.log(`Generated ${colors.length} named colors.`);
