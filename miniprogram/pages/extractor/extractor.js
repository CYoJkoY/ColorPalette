Page({
  data:{image:'',colors:[],loading:false},
  chooseImage(){wx.chooseMedia({count:1,mediaType:['image'],sourceType:['album','camera'],success:r=>{this.extract(r.tempFiles[0].tempFilePath)}})},
  extract(path){this.setData({image:path,loading:true,colors:[]});wx.getImageInfo({src:path,success:info=>{const c=wx.createOffscreenCanvas({type:'2d',width:60,height:60});const ctx=c.getContext('2d');ctx.drawImage(path,0,0,60,60);const img=ctx.getImageData(0,0,60,60).data;const map={};for(let y=0;y<60;y+=4)for(let x=0;x<60;x+=4){const i=(y*60+x)*4;if(img[i+3]<180)continue;const r=Math.round(img[i]/32)*32,g=Math.round(img[i+1]/32)*32,b=Math.round(img[i+2]/32)*32;const key=[Math.min(r,255),Math.min(g,255),Math.min(b,255)].join(',');map[key]=(map[key]||0)+1;}const colors=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k])=>'#'+k.split(',').map(n=>Number(n).toString(16).padStart(2,'0')).join('').toUpperCase());this.setData({colors,loading:false});},fail:()=>this.setData({loading:false})})},
  copy(e){wx.setClipboardData({data:e.currentTarget.dataset.hex})},
  adGate(){wx.showModal({title:'Pro 临时权益',content:'广告兑换是完全自愿的。只有你主动点击“观看广告兑换”后才会打开激励广告；不点击不会影响图片取色、浏览、复制或收藏等正常功能。',confirmText:'去 Pro 页面',success:r=>{if(r.confirm)wx.navigateTo({url:'/pages/pro/pro'})}})
  }
})
