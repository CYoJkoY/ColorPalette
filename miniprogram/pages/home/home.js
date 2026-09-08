Page({
  data: {
    featured: [
      {id:'aurora',name:'Aurora',colors:['#172554','#2563EB','#22D3EE','#A7F3D0','#F8FAFC']},
      {id:'forest',name:'Forest',colors:['#14281D','#355834','#6E8B74','#C9D8B6','#F1F7ED']},
      {id:'sunset',name:'Sunset',colors:['#3B1F2B','#7C2D43','#F97350','#FDBA74','#FFF1E6']},
      {id:'mono',name:'Monochrome',colors:['#111111','#3F3F46','#71717A','#D4D4D8','#FAFAFA']},
      {id:'ocean',name:'Ocean',colors:['#082F49','#075985','#0284C7','#38BDF8','#E0F2FE']},
      {id:'lavender',name:'Lavender',colors:['#2E1065','#5B21B6','#8B5CF6','#C4B5FD','#F5F3FF']},
      {id:'citrus',name:'Citrus',colors:['#365314','#65A30D','#A3E635','#FACC15','#FFF7ED']},
      {id:'rose',name:'Rose',colors:['#4C0519','#9F1239','#E11D48','#FB7185','#FFF1F2']}
    ]
  },
  openPalette(e) { wx.navigateTo({ url:'/pages/palette/palette?id='+e.currentTarget.dataset.id+'&name='+encodeURIComponent(e.currentTarget.dataset.name) }); },
  openExtractor() { wx.switchTab({ url:'/pages/extractor/extractor' }); },
  openCreator() { wx.switchTab({ url:'/pages/create/create' }); },
  openLibrary() { wx.navigateTo({ url:'/pages/library/library' }); }
});
