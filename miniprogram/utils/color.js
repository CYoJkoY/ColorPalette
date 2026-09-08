function clamp(n, min = 0, max = 255) { return Math.min(max, Math.max(min, n)); }
function hexToRgb(hex) {
  let h = String(hex || '').trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
}
function rgbToHex(r,g,b) { return '#' + [r,g,b].map(v => clamp(Math.round(v)).toString(16).padStart(2,'0')).join('').toUpperCase(); }
function rgbToHsl(r,g,b) {
  r/=255; g/=255; b/=255; const max=Math.max(r,g,b), min=Math.min(r,g,b); let h=0,s=0; const l=(max+min)/2;
  if(max!==min){ const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min); switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;} h*=60; }
  return {h:Math.round(h),s:Math.round(s*100),l:Math.round(l*100)};
}
function hslToRgb(h,s,l){ h=((h%360)+360)%360; s/=100;l/=100; const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2; let r=0,g=0,b=0;
  if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}
  return {r:Math.round((r+m)*255),g:Math.round((g+m)*255),b:Math.round((b+m)*255)};
}
function paletteFromHex(hex){ const rgb=hexToRgb(hex); if(!rgb)return null; const hsl=rgbToHsl(rgb.r,rgb.g,rgb.b); const schemes={
  complementary:[hsl.h,hsl.h+180], analogous:[hsl.h-30,hsl.h,hsl.h+30], triadic:[hsl.h,hsl.h+120,hsl.h+240], split:[hsl.h,hsl.h+150,hsl.h+210]
 }; const out={}; Object.keys(schemes).forEach(k=>out[k]=schemes[k].map(h=>rgbToHex(...Object.values(hslToRgb(h,hsl.s,hsl.l))))); return out; }
module.exports={hexToRgb,rgbToHex,rgbToHsl,hslToRgb,paletteFromHex};
