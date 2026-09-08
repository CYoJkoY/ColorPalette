// Named-color data is intentionally separated into cultural / historical collections.
// Hex values are digital reference values, not claims of a single physically exact pigment color.

const basicCategories = {
  红: [['朱砂','#EF4444'],['赤红','#DC2626'],['绯红','#E11D48'],['酒红','#9F1239'],['珊瑚','#F87171'],['砖红','#B91C1C']],
  橙: [['橘橙','#F97316'],['杏橙','#FB923C'],['琥珀','#F59E0B'],['南瓜','#EA580C'],['焦糖','#C2410C'],['铜棕','#9A3412']],
  黄: [['柠檬','#FDE047'],['明黄','#FACC15'],['芥末','#CA8A04'],['金黄','#EAB308'],['奶油','#FEF3C7'],['沙黄','#D4A72C']],
  绿: [['草绿','#84CC16'],['翡翠','#10B981'],['森林','#166534'],['苔藓','#4D7C0F'],['薄荷','#6EE7B7'],['鼠尾草','#84A98C']],
  青: [['青碧','#14B8A6'],['湖蓝','#06B6D4'],['天青','#22D3EE'],['青瓷','#99F6E4'],['松石','#0D9488'],['海沫','#A7F3D0']],
  蓝: [['天蓝','#38BDF8'],['蔚蓝','#2563EB'],['钴蓝','#1D4ED8'],['海军蓝','#172554'],['钢蓝','#475569'],['冰蓝','#E0F2FE']],
  紫: [['薰衣草','#A78BFA'],['紫罗兰','#8B5CF6'],['皇家紫','#6D28D9'],['葡萄','#581C87'],['梅紫','#86198F'],['紫灰','#7E7490']],
  粉: [['樱粉','#F9A8D4'],['玫瑰','#FB7185'],['桃粉','#FDA4AF'],['莓果','#BE185D'],['裸粉','#F5D0C5'],['粉紫','#E9D5FF']],
  棕: [['沙棕','#A16207'],['赭石','#92400E'],['咖啡','#78350F'],['栗棕','#7C2D12'],['焦褐','#57534E'],['米杏','#F5E6D3']],
  中性: [['墨黑','#111111'],['炭灰','#27272A'],['石墨','#52525B'],['银灰','#A1A1AA'],['象牙白','#FFFBEB'],['纯白','#FFFFFF']]
};

const china = [
  ['妃色','#ED5736'],['桃红','#F47983'],['海棠红','#DB5A6B'],['石榴红','#F20C00'],['樱桃色','#C93756'],['银红','#F05654'],['胭脂','#9D2933'],['朱红','#FF4C00'],['丹色','#E45C4C'],['绛紫','#8C4356'],
  ['赭石','#955539'],['檀色','#B36D61'],['杏子灰','#C4B4A2'],['藕荷色','#E4C6D0'],['胭脂水','#EBC4C2'],['鹅黄','#FFF143'],['鸭黄','#FAE600'],['缃色','#F0C239'],['藤黄','#FFB61E'],['秋香色','#D9B611'],
  ['柳黄','#C9DD22'],['竹青','#789262'],['豆青','#96CEB4'],['艾绿','#A4E2C6'],['松柏绿','#21A675'],['孔雀绿','#229453'],['碧绿','#2ADD9C'],['翡翠绿','#00BC57'],['石绿','#57C3C2'],['青矾色','#00BCB3'],
  ['青黛','#5CB3CC'],['靛青','#177CB0'],['靛蓝','#065279'],['天蓝','#1677B3'],['群青','#1772B0'],['宝蓝','#4B5CC4'],['黛蓝','#425066'],['绀青','#003371'],['品蓝','#2E317C'],['紫苑色','#A6559D'],
  ['藕色','#D1B2D3'],['紫棠','#56004F'],['青莲','#8B2671'],['暮山紫','#A434B4'],['藤紫','#B5A4E3'],['雪青','#B0A4E3'],['苍紫','#6E3A8A'],['栗色','#60281E'],['茶色','#B35C44'],['驼色','#A88462'],
  ['玄色','#622A1D'],['黧色','#5D3B2E'],['缁色','#493131'],['缟色','#F2ECDE'],['月白','#D6ECF0'],['霜色','#E9F1F6'],['荼白','#F3F0E8'],['铅白','#F0F0F4'],['银白','#E9E7EF'],['皎月白','#F8F9F4']
].map(([name, hex]) => ({ name, hex, category:'中国传统色', collection:'中国传统色' }));

const japan = [
  ['桜色 Sakura','#FEDFE1'],['薄桜 Usu-zakura','#FDEFF2'],['桃色 Momo','#F09199'],['珊瑚色 Sango','#F5B1AA'],['紅梅色 Kōbai','#F2A0A1'],['梅鼠 Ume-nezumi','#97645A'],['茜色 Akane','#B7282E'],['朱色 Shu','#EB6101'],['猩々緋 Shōjōhi','#E83015'],['紅緋 Beniaka','#E83929'],
  ['山吹色 Yamabuki','#F8B500'],['鬱金色 Ukon','#FABF14'],['黄蘗 Kihada','#F3E778'],['檸檬色 Remon','#EBE960'],['鶸色 Hiwairo','#D7CF3A'],['若草色 Wakakusa','#C3D825'],['萌黄色 Moegi','#98D98E'],['若葉色 Wakaba','#B9D08B'],['抹茶色 Matcha','#C5C56A'],['鶯色 Uguisu','#918D40'],
  ['若竹色 Wakatake','#68BE8D'],['常磐色 Tokiwa','#007B43'],['深緑 Fukamidori','#00552E'],['松葉色 Matsuba','#42602D'],['千歳緑 Chitosemidori','#316745'],['青磁色 Seijii','#73C6B6'],['浅葱色 Asagi','#00A3AF'],['水浅葱 Mizu-asagi','#80ABA9'],['新橋色 Shinbashi','#59B9C6'],['鉄色 Tetsu','#005243'],
  ['縹 Hanada','#2792C3'],['藍色 Ai','#165E83'],['紺 Kon','#223A70'],['瑠璃色 Ruri','#1E50A2'],['群青色 Gunjo','#4C6CB3'],['藤色 Fuji','#B18FC7'],['紫苑色 Shion','#867BA9'],['菖蒲色 Ayame','#674196'],['葡萄色 Budō','#522F60'],['江戸紫 Edo-murasaki','#745399'],
  ['小豆色 Azuki','#96514D'],['蘇芳色 Suō','#9E3D3F'],['海老茶 Ebicha','#773C30'],['鳶色 Tobiiro','#95483F'],['栗色 Kuri','#762F07'],['胡桃色 Kurumi','#A58F86'],['黄土色 Ōdo','#C39143'],['利休茶 Rikyu-cha','#826B58'],['銀鼠 Ginnezumi','#97867C'],['煤竹色 Susutake','#6F514C']
].map(([name, hex]) => ({ name, hex, category:'日本传统色', collection:'日本传统色' }));

const art = [
  ['群青 Ultramarine','#120A8F'],['普鲁士蓝 Prussian Blue','#003153'],['钴蓝 Cobalt Blue','#0047AB'],['天青 Cerulean','#2A52BE'],['酞菁蓝 Phthalo Blue','#0F4C5C'],['靛蓝 Indigo','#4B0082'],['埃及蓝 Egyptian Blue','#1034A6'],['玛雅蓝 Maya Blue','#73C2FB'],['YInMn Blue','#2E5AAC'],['国际克莱因蓝 IKB','#002FA7'],
  ['朱砂 Vermilion','#E34234'],['镉红 Cadmium Red','#E30022'],['茜素深红 Alizarin Crimson','#E32636'],['胭脂红 Carmine','#960018'],['玫瑰茜红 Rose Madder','#E40046'],['赭红 Venetian Red','#C80815'],['铅丹 Minium','#FF3300'],['铁红 English Red','#A63A3A'],
  ['镉黄 Cadmium Yellow','#FFF600'],['铬黄 Chrome Yellow','#FFA700'],['那不勒斯黄 Naples Yellow','#FADA5E'],['印度黄 Indian Yellow','#E3A857'],['金黄 Orpiment','#E49B0F'],['土黄 Yellow Ochre','#CC7722'],
  ['铬绿 Chrome Green','#4FA83D'],['维里迪安 Viridian','#40826D'],['翠绿 Emerald Green','#50C878'],['孔雀石绿 Malachite','#0BDA51'],['巴黎绿 Paris Green','#50C878'],['谢勒绿 Scheele’s Green','#478800'],
  ['凡戴克棕 Van Dyke Brown','#664228'],['焦茶 Sepia','#704214'],['生赭 Raw Umber','#826644'],['熟赭 Burnt Umber','#8A3324'],['生褐土 Raw Sienna','#C68A5A'],['熟褐土 Burnt Sienna','#E97451'],['马尔斯黑 Mars Black','#0A0A0A'],['象牙黑 Ivory Black','#1B1B1B'],['钛白 Titanium White','#F8F8F0'],['锌白 Zinc White','#F7F7F5'],
  ['佩恩灰 Payne’s Gray','#536878'],['炭黑 Carbon Black','#101010'],['骨黑 Bone Black','#2B2B2B'],['泰尔紫 Tyrian Purple','#630330'],['汉紫 Han Purple','#5218FA'],['罗丹明洋红 Rhodamine','#E4007C'],['钴紫 Cobalt Violet','#912CEE'],['锰紫 Manganese Violet','#7B4A8C'],['合成靛 Synthesized Indigo','#4B0082'],['朱砂橙 Vermilion Orange','#F0442E'],
  ['贝克米勒粉 Baker-Miller Pink','#FF91AF'],['米勒粉 Millennial Pink','#F3CFC6'],['凡·高黄 Van Gogh Yellow','#F6C445'],['莫奈蓝 Monet Blue','#6C91BF'],['毕加索蓝 Picasso Blue','#3D5A80'],['马蒂斯蓝 Matisse Blue','#1F5A7A'],['罗斯科红 Rothko Red','#A33A2B'],['蒙德里安红 Mondrian Red','#D00000'],['蒙德里安黄 Mondrian Yellow','#FFD500'],['蒙德里安蓝 Mondrian Blue','#0047AB'],
  ['万塔黑 Vantablack','#050505'],['YInMn 绿 YInMn Green','#5B8C5A'],['YInMn 橙 YInMn Orange','#D96B27']
].map(([name, hex]) => ({ name, hex, category:'艺术与颜料', collection:'艺术与颜料' }));

const categories = { ...basicCategories };
const basicColors = Object.keys(basicCategories).reduce((all, category) => all.concat(basicCategories[category].map(([name, hex]) => ({ name, hex, category, collection:'基础色' }))), []);
const collections = {
  '基础色': basicColors,
  '中国传统色': china,
  '日本传统色': japan,
  '艺术与颜料': art
};

const categoryNames = Object.keys(collections);
const colors = Object.values(collections).flat();

function searchColors(query = '') {
  const q = String(query).trim().toLowerCase();
  if (!q) return colors;
  return colors.filter(item => `${item.name} ${item.hex} ${item.collection}`.toLowerCase().includes(q));
}

module.exports = { categories, collections, categoryNames, colors, searchColors };
