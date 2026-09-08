Page({
  data:{
    featured:[
      {id:'aurora',name:'Aurora',colors:['#172554','#2563EB','#22D3EE','#A7F3D0','#F8FAFC']},
      {id:'forest',name:'Forest',colors:['#14281D','#355834','#6E8B74','#C9D8B6','#F1F7ED']},
      {id:'sunset',name:'Sunset',colors:['#3B1F2B','#7C2D43','#F97350','#FDBA74','#FFF1E6']},
      {id:'mono',name:'Monochrome',colors:['#111111','#3F3F46','#71717A','#D4D4D8','#FAFAFA']}
    ]
  },
  openPalette(e){ wx.navigateTo({url:'/pages/palette/palette?id='+e.currentTarget.dataset.id+'&name='+encodeURIComponent(e.currentTarget.dataset.name)}); },
  openExtractor(){ wx.switchTab({url:'/pages/extractor/extractor'}); }
});
