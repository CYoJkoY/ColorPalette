// Named colors are organized by source collection and perceptual family.
// HEX values for historical / cultural colors are digital reference values, not claims of one physically exact pigment.

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
  ['粉紅','#FFB3A7'],['妃色','#ED5736'],['品紅','#F00056'],['桃紅','#F47983'],['海棠紅','#DB5A6B'],['石榴紅','#F20C00'],['櫻桃色','#C93756'],['銀紅','#F05654'],['大紅','#FF2121'],['絳紫','#8C4356'],
  ['緋紅','#C83C23'],['胭脂','#9D2933'],['朱紅','#FF4C00'],['丹','#FF4E20'],['彤','#F35336'],['茜色','#CB3A56'],['火紅','#FF2D51'],['赫赤','#C91F37'],['嫣紅','#EF7A82'],['洋紅','#FF0097'],
  ['棗紅','#C32136'],['檀','#B36D61'],['殷紅','#BE002F'],['酡紅','#DC3023'],['酡顏','#F9906F'],['鵝黃','#FFF143'],['鴨黃','#FAFF72'],['櫻草色','#EAFF56'],['杏黃','#FFA631'],['杏紅','#FF8C31'],
  ['橘黃','#FF8936'],['橙黃','#FFA400'],['橘紅','#FF7500'],['姜黃','#FFC773'],['緗色','#F0C239'],['橙色','#FA8C35'],['茶色','#B35C44'],['駝色','#A88462'],['昏黃','#C89B40'],['栗色','#60281E'],
  ['棕色','#B25D25'],['棕綠','#827100'],['棕黑','#7C4B00'],['棕紅','#9B4400'],['棕黃','#AE7000'],['赭色','#955539'],['琥珀','#CA6924'],['褐色','#6E511E'],['枯黃','#D3B17D'],['黃櫨','#E29C45'],
  ['秋色','#896C39'],['秋香色','#D9B611'],['嫩綠','#BDDD22'],['柳黃','#C9DD22'],['柳綠','#AFDD22'],['竹青','#789262'],['蔥黃','#A3D900'],['蔥綠','#9ED900'],['蔥青','#0EB83A'],['青蔥','#0AA344'],
  ['油綠','#00BC12'],['綠沉','#0C8918'],['碧色','#1BD1A5'],['碧綠','#2ADD9C'],['青碧','#48C0A3'],['翡翠色','#3DE1AD'],['草綠','#40DE5A'],['青色','#00E09E'],['青翠','#00E079'],['青白','#C0EBD7'],
  ['鴨卵青','#E0EEE8'],['蟹殼青','#BBCDC5'],['鴉青','#424C50'],['綠色','#00E500'],['豆綠','#9ED048'],['豆青','#96CE54'],['石青','#7BCFA6'],['玉色','#7BCFA6'],['縹','#7FECAD'],['艾綠','#A4E2C6'],
  ['松柏綠','#21A675'],['松花綠','#057748'],['松花色','#BCE672'],['藍','#44CEF6'],['靛青','#177CB0'],['靛藍','#065279'],['碧藍','#3EEDE7'],['蔚藍','#70F3FF'],['寶藍','#4B5CC4'],['藍灰色','#A1AFC9'],
  ['藏青','#2E4E7E'],['藏藍','#3B2E7E'],['黛','#4A4266'],['黛綠','#426666'],['黛藍','#425066'],['黛紫','#574266'],['紫色','#8D4BBB'],['紫醬','#815463'],['醬紫','#815476'],['紫檀','#4C221B'],
  ['紺青','#003371'],['紫棠','#56004F'],['青蓮','#801DAE'],['群青','#4C8DAE'],['雪青','#B0A4E3'],['丁香色','#CCA4E3'],['藕色','#EDD1D8'],['藕荷色','#E4C6D0'],['蒼色','#75878A'],['蒼黃','#519A73'],
  ['蒼青','#A29B7C'],['蒼黑','#7397AB'],['蒼白','#D1D9E0'],['水色','#88ADA6'],['水紅','#F3D3E7'],['水綠','#D4F2E7'],['水藍','#D2F0F4'],['淡青','#D3E0F3'],['湖藍','#30DFF3'],['湖綠','#25F8CB'],
  ['精白','#FFFFFF'],['象牙白','#FFFBF0'],['雪白','#F0FCFF'],['月白','#D6ECF0'],['縞','#F2ECDE'],['素','#E0F0E9'],['荼白','#F3F9F1'],['霜色','#E9F1F6'],['花白','#C2CCD0'],['魚肚白','#FCEFE8'],
  ['瑩白','#E3F9FD'],['灰色','#808080'],['牙色','#EEDEB0'],['鉛白','#F0F0F4'],['玄色','#622A1D'],['玄青','#3D3B4F'],['烏色','#725E82'],['烏黑','#392F41'],['漆黑','#161823'],['墨色','#50616D'],
  ['墨灰','#758A99'],['黑色','#000000'],['緇色','#493131'],['煤黑','#312520'],['黧','#5D513C'],['黎','#75664D'],['黝','#6B6882'],['黝黑','#665757'],['黯','#41555D'],['赤金','#F2BE45'],
  ['金色','#EACD76'],['銀白','#E9E7EF'],['銅綠','#549688'],['烏金','#A78E44'],['老銀','#BACAC6']
].map(([name, hex]) => ({ name, hex, collection:'中国传统色', source:'cht-colors' }));

const japan = [
  ['桜色 Sakura','#FEDFE1'],['薄桜 Usu-zakura','#FDEFF2'],['桃色 Momo','#F09199'],['珊瑚色 Sango','#F5B1AA'],['紅梅色 Kōbai','#F2A0A1'],['梅鼠 Ume-nezumi','#97645A'],['茜色 Akane','#B7282E'],['朱色 Shu','#EB6101'],['猩々緋 Shōjōhi','#E83015'],['紅緋 Beniaka','#E83929'],
  ['山吹色 Yamabuki','#F8B500'],['鬱金色 Ukon','#FABF14'],['黄蘗 Kihada','#F3E778'],['檸檬色 Remon','#EBE960'],['鶸色 Hiwairo','#D7CF3A'],['若草色 Wakakusa','#C3D825'],['萌黄色 Moegi','#98D98E'],['若葉色 Wakaba','#B9D08B'],['抹茶色 Matcha','#C5C56A'],['鶯色 Uguisu','#918D40'],
  ['若竹色 Wakatake','#68BE8D'],['常磐色 Tokiwa','#007B43'],['深緑 Fukamidori','#00552E'],['松葉色 Matsuba','#42602D'],['千歳緑 Chitosemidori','#316745'],['青磁色 Seiji','#73C6B6'],['浅葱色 Asagi','#00A3AF'],['水浅葱 Mizu-asagi','#80ABA9'],['新橋色 Shinbashi','#59B9C6'],['鉄色 Tetsu','#005243'],
  ['縹 Hanada','#2792C3'],['藍色 Ai','#165E83'],['紺 Kon','#223A70'],['瑠璃色 Ruri','#1E50A2'],['群青色 Gunjo','#4C6CB3'],['藤色 Fuji','#B18FC7'],['紫苑色 Shion','#867BA9'],['菖蒲色 Ayame','#674196'],['葡萄色 Budō','#522F60'],['江戸紫 Edo-murasaki','#745399'],
  ['小豆色 Azuki','#96514D'],['蘇芳色 Suō','#9E3D3F'],['海老茶 Ebicha','#773C30'],['鳶色 Tobiiro','#95483F'],['栗色 Kuri','#762F07'],['胡桃色 Kurumi','#A58F86'],['黄土色 Ōdo','#C39143'],['利休茶 Rikyu-cha','#826B58'],['銀鼠 Ginnezumi','#97867C'],['煤竹色 Susutake','#6F514C'],
  ['紅 Kurenai','#B33A3A'],['撫子 Nadeshiko','#E8B8C5'],['藤 Fuji','#A899C7'],['白緑 Byakuroku','#B8D2C0'],['生成 KINARI','#E8DDCB'],['空色 Sora','#8EC5D6'],['納戸 Nando','#2F4F4F'],['煤色 Sumi','#1B1B1B'],['白磁 Hakuji','#F0EDE6'],['錆色 Sabi','#8B4C3C'],
  ['草色 Kusa','#7B9E7A'],['砂色 Suna','#E8D5B0'],['象牙色 Zouge','#F5F0E8'],['漆黒 Shikkoku','#1A1A1A'],['金色 Kin','#C9A84C'],['灰色 Hai','#A8A8A8'],['白 Shironezu','#FAFAFA'],['藍鼠 Ainezu','#5C6770'],['鉄紺 Tetsukon','#253342'],['深紫 Fukamurasaki','#3D294F']
].map(([name, hex]) => ({ name, hex, collection:'日本传统色', source:'Japanese traditional color references' }));

const art = [
  ['群青 Ultramarine','#120A8F'],['普鲁士蓝 Prussian Blue','#003153'],['钴蓝 Cobalt Blue','#0047AB'],['天青 Cerulean','#2A52BE'],['酞菁蓝 Phthalo Blue','#0F4C5C'],['靛蓝 Indigo','#4B0082'],['埃及蓝 Egyptian Blue','#1034A6'],['玛雅蓝 Maya Blue','#73C2FB'],['YInMn Blue','#2E5AAC'],['国际克莱因蓝 IKB','#002FA7'],
  ['朱砂 Vermilion','#E34234'],['镉红 Cadmium Red','#E30022'],['茜素深红 Alizarin Crimson','#E32636'],['胭脂红 Carmine','#960018'],['玫瑰茜红 Rose Madder','#E40046'],['赭红 Venetian Red','#C80815'],['铅丹 Minium','#FF3300'],['铁红 English Red','#A63A3A'],
  ['镉黄 Cadmium Yellow','#FFF600'],['铬黄 Chrome Yellow','#FFA700'],['那不勒斯黄 Naples Yellow','#FADA5E'],['印度黄 Indian Yellow','#E3A857'],['雌黄 Orpiment','#E49B0F'],['土黄 Yellow Ochre','#CC7722'],
  ['铬绿 Chrome Green','#4FA83D'],['维里迪安 Viridian','#40826D'],['翠绿 Emerald Green','#50C878'],['孔雀石绿 Malachite','#0BDA51'],['巴黎绿 Paris Green','#50C878'],['谢勒绿 Scheele’s Green','#478800'],
  ['凡戴克棕 Van Dyke Brown','#664228'],['焦茶 Sepia','#704214'],['生赭 Raw Umber','#826644'],['熟赭 Burnt Umber','#8A3324'],['生褐土 Raw Sienna','#C68A5A'],['熟褐土 Burnt Sienna','#E97451'],['马尔斯黑 Mars Black','#0A0A0A'],['象牙黑 Ivory Black','#1B1B1B'],['钛白 Titanium White','#F8F8F0'],['锌白 Zinc White','#F7F7F5'],
  ['佩恩灰 Payne’s Gray','#536878'],['炭黑 Carbon Black','#101010'],['骨黑 Bone Black','#2B2B2B'],['泰尔紫 Tyrian Purple','#630330'],['汉紫 Han Purple','#5218FA'],['罗丹明洋红 Rhodamine','#E4007C'],['钴紫 Cobalt Violet','#912CEE'],['锰紫 Manganese Violet','#7B4A8C'],['朱砂橙 Vermilion Orange','#F0442E'],
  ['贝克米勒粉 Baker-Miller Pink','#FF91AF'],['米勒粉 Millennial Pink','#F3CFC6'],['万塔黑 Vantablack','#050505'],['YInMn 绿 YInMn Green','#5B8C5A'],['YInMn 橙 YInMn Orange','#D96B27'],['铅白 Lead White','#F0F0E8'],['铬橙 Chrome Orange','#E87511'],['钴黄 Cobalt Yellow','#F8D64E'],['锰蓝 Manganese Blue','#2A7F9E'],['镉橙 Cadmium Orange','#ED872D']
].map(([name, hex]) => ({ name, hex, collection:'艺术与颜料', source:'historical / modern pigment references' }));

const cssPairs = `aliceblue:#F0F8FF,antiquewhite:#FAEBD7,aqua:#00FFFF,aquamarine:#7FFFD4,azure:#F0FFFF,beige:#F5F5DC,bisque:#FFE4C4,black:#000000,blanchedalmond:#FFEBCD,blue:#0000FF,blueviolet:#8A2BE2,brown:#A52A2A,burlywood:#DEB887,cadetblue:#5F9EA0,chartreuse:#7FFF00,chocolate:#D2691E,coral:#FF7F50,cornflowerblue:#6495ED,cornsilk:#FFF8DC,crimson:#DC143C,cyan:#00FFFF,darkblue:#00008B,darkcyan:#008B8B,darkgoldenrod:#B8860B,darkgray:#A9A9A9,darkgreen:#006400,darkgrey:#A9A9A9,darkkhaki:#BDB76B,darkmagenta:#8B008B,darkolivegreen:#556B2F,darkorange:#FF8C00,darkorchid:#9932CC,darkred:#8B0000,darksalmon:#E9967A,darkseagreen:#8FBC8F,darkslateblue:#483D8B,darkslategray:#2F4F4F,darkslategrey:#2F4F4F,darkturquoise:#00CED1,darkviolet:#9400D3,deeppink:#FF1493,deepskyblue:#00BFFF,dimgray:#696969,dimgrey:#696969,dodgerblue:#1E90FF,firebrick:#B22222,floralwhite:#FFFAF0,forestgreen:#228B22,fuchsia:#FF00FF,gainsboro:#DCDCDC,ghostwhite:#F8F8FF,gold:#FFD700,goldenrod:#DAA520,gray:#808080,green:#008000,greenyellow:#ADFF2F,grey:#808080,honeydew:#F0FFF0,hotpink:#FF69B4,indianred:#CD5C5C,indigo:#4B0082,ivory:#FFFFF0,khaki:#F0E68C,lavender:#E6E6FA,lavenderblush:#FFF0F5,lawngreen:#7CFC00,lemonchiffon:#FFFACD,lightblue:#ADD8E6,lightcoral:#F08080,lightcyan:#E0FFFF,lightgoldenrodyellow:#FAFAD2,lightgray:#D3D3D3,lightgreen:#90EE90,lightgrey:#D3D3D3,lightpink:#FFB6C1,lightsalmon:#FFA07A,lightseagreen:#20B2AA,lightskyblue:#87CEFA,lightslategray:#778899,lightslategrey:#778899,lightsteelblue:#B0C4DE,lightyellow:#FFFFE0,lime:#00FF00,limegreen:#32CD32,linen:#FAF0E6,magenta:#FF00FF,maroon:#800000,mediumaquamarine:#66CDAA,mediumblue:#0000CD,mediumorchid:#BA55D3,mediumpurple:#9370DB,mediumseagreen:#3CB371,mediumslateblue:#7B68EE,mediumspringgreen:#00FA9A,mediumturquoise:#48D1CC,mediumvioletred:#C71585,midnightblue:#191970,mintcream:#F5FFFA,mistyrose:#FFE4E1,moccasin:#FFE4B5,navajowhite:#FFDEAD,navy:#000080,oldlace:#FDF5E6,olive:#808000,olivedrab:#6B8E23,orange:#FFA500,orangered:#FF4500,orchid:#DA70D6,palegoldenrod:#EEE8AA,palegreen:#98FB98,paleturquoise:#AFEEEE,palevioletred:#DB7093,papayawhip:#FFEFD5,peachpuff:#FFDAB9,peru:#CD853F,pink:#FFC0CB,plum:#DDA0DD,powderblue:#B0E0E6,purple:#800080,rebeccapurple:#663399,red:#FF0000,rosybrown:#BC8F8F,royalblue:#4169E1,saddlebrown:#8B4513,salmon:#FA8072,sandybrown:#F4A460,seagreen:#2E8B57,seashell:#FFF5EE,sienna:#A0522D,silver:#C0C0C0,skyblue:#87CEEB,slateblue:#6A5ACD,slategray:#708090,slategrey:#708090,snow:#FFFAFA,springgreen:#00FF7F,steelblue:#4682B4,tan:#D2B48C,teal:#008080,thistle:#D8BFD8,tomato:#FF6347,turquoise:#40E0D0,violet:#EE82EE,wheat:#F5DEB3,white:#FFFFFF,whitesmoke:#F5F5F5,yellow:#FFFF00,yellowgreen:#9ACD32`;
const css = cssPairs.split(',').map(pair => { const [name, hex] = pair.split(':'); return { name, hex, collection:'CSS 标准色', source:'CSS named colors' }; });

const categories = { ...basicCategories };
const basicColors = Object.keys(basicCategories).reduce((all, category) => all.concat(basicCategories[category].map(([name, hex]) => ({ name, hex, category, collection:'基础色', source:'ColorPalette curated basics' }))), []);
const collections = { '基础色': basicColors, 'CSS 标准色': css, '中国传统色': china, '日本传统色': japan, '艺术与颜料': art };

function normalizeHex(hex) { return String(hex).toUpperCase(); }
function hueFamily(h) {
  if (h < 15 || h >= 345) return '红';
  if (h < 45) return '橙';
  if (h < 70) return '黄';
  if (h < 165) return '绿';
  if (h < 195) return '青';
  if (h < 255) return '蓝';
  if (h < 285) return '紫';
  return '粉';
}
function familyOf(hex) {
  const value = normalizeHex(hex).replace('#','');
  if (!/^[0-9A-F]{6}$/.test(value)) return '中性';
  const r = parseInt(value.slice(0,2),16) / 255, g = parseInt(value.slice(2,4),16) / 255, b = parseInt(value.slice(4,6),16) / 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min, l = (max + min) / 2;
  if (d < 0.06 || l < 0.08 || l > 0.95) return '中性';
  let h = 0;
  if (max === r) h = ((g-b)/d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b-r)/d + 2) * 60;
  else h = ((r-g)/d + 4) * 60;
  return hueFamily(h);
}

const seen = new Set();
const colors = Object.values(collections).flat().map((item, index) => ({ ...item, id:`${item.collection}-${item.name}-${index}`, hex:normalizeHex(item.hex), family:familyOf(item.hex) })).filter(item => {
  const key = `${item.collection}|${item.name}|${item.hex}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
const categoryNames = Object.keys(collections);
const familyNames = ['全部','红','橙','黄','绿','青','蓝','紫','粉','中性'];

function searchColors(query = '', options = {}) {
  const q = String(query || '').trim().toLowerCase();
  const collection = options.collection || '';
  const family = options.family || '全部';
  return colors.filter(item => {
    if (collection && item.collection !== collection) return false;
    if (family !== '全部' && item.family !== family) return false;
    if (!q) return true;
    return `${item.name} ${item.hex} ${item.collection} ${item.family} ${item.source || ''}`.toLowerCase().includes(q);
  });
}
function getByHex(hex) { const value = normalizeHex(hex); return colors.find(item => item.hex === value) || null; }
module.exports = { categories, collections, categoryNames, familyNames, colors, searchColors, getByHex, familyOf };
