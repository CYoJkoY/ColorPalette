const fs = require('fs');
const path = require('path');
const library = require('../miniprogram/utils/color-library');
const out = path.join(__dirname, 'data');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'colors.json'), JSON.stringify({ colors: library.colors, categoryNames: library.categoryNames, familyNames: library.familyNames }, null, 0));
console.log(`Generated ${library.colors.length} named colors.`);
