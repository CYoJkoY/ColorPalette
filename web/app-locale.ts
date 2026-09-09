(()=>{
  'use strict';

  const app = document.querySelector('#app');
  const STORE = 'colorpalette-web-v2';
  const DATA = () => window.ColorPaletteI18n?.data || {};
  const EN = () => window.ColorPaletteI18n?.locale === 'en-US';
  const T = key => String(DATA().ui?.[key] ?? key);
  const REL = key => String(DATA().relations?.[key] ?? key);
  const REL_DESC = key => String(DATA().relationDescriptions?.[key] ?? key);
  const MODE = key => String(DATA().modes?.[key] ?? key);
  const ESC = s => String(s ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const RELATION_KEYS=['analogous','complementary','split','triadic','tetradic','doubleComplementary','warm','cool','monochromatic','tints','shades','tones','pastel','vivid','grayscale'];
  const MODE_KEYS=RELATION_KEYS;
  const loadState=()=>{try{return JSON.parse(localStorage.getItem(STORE))||{palettes:[],favorites:[],recent:[]}}catch(_){return{palettes:[],favorites:[],recent:[]}}};
  const state=loadState();
  let colors=[];
  const rgb=hex=>{let h=String(hex||'').trim().replace(/^#/,'');if(h.length===3)h=h.split('').map(x=>x+x).join('');return/^[0-9a-f]{6}$/i.test(h)?{r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)}:null};
  const hex=(r,g,b)=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('').toUpperCase();
  const hsl=(r,g,b)=>{r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0,l=(max+min)/2;if(max!==min){const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);if(max===r)h=(g-b)/d+(g<b?6:0);else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60}return{h:Math.round(h),s:Math.round(s*100),l:Math.round(l*100)}};
  const hslRgb=(h,s,l)=>{h=((h%360)+360)%360;s/=100;l/=100;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let r=0,g=0,b=0;if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}return{r:Math.round((r+m)*255),g:Math.round((g+m)*255),b:Math.round((b+m)*255)}};
  const fromHsl=(h,s,l)=>{const c=hslRgb(h,s,l);return hex(c.r,c.g,c.b)};
  const paletteFromHex=base=>{const c=rgb(base);if(!c)return null;const h=hsl(c.r,c.g,c.b),o={};const maps={analogous:[h.h-30,h.h,h.h+30],complementary:[h.h,h.h+180],split:[h.h,h.h+150,h.h+210],triadic:[h.h,h.h+120,h.h+240],tetradic:[h.h,h.h+90,h.h+180,h.h+270],doubleComplementary:[h.h,h.h+30,h.h+180,h.h+210],warm:[h.h-30,h.h-15,h.h,h.h+15,h.h+30],cool:[h.h+120,h.h+150,h.h+180,h.h+210,h.h+240]};Object.entries(maps).forEach(([k,a])=>o[k]=a.map(x=>fromHsl(x,h.s,h.l)));o.monochromatic=[72,62,52,42,32].map(l=>fromHsl(h.h,h.s,l));o.tints=[94,86,78,70,62].map(l=>fromHsl(h.h,Math.max(8,h.s-8),l));o.shades=[48,40,32,24,16].map(l=>fromHsl(h.h,h.s,l));o.tones=[62,55,48,41,34].map(l=>fromHsl(h.h,Math.max(5,h.s-28),l));o.pastel=[35,25,15,5,55].map(x=>fromHsl(h.h+x,Math.min(65,Math.max(28,h.s-12)),76));o.vivid=[0,60,120,180,240].map(x=>fromHsl(h.h+x,Math.max(78,h.s),52));o.grayscale=[12,28,44,60,76].map(l=>fromHsl(h.h,0,l));return o};
  const luminance=value=>{const c=rgb(value);if(!c)return 0;return[c.r,c.g,c.b].map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0)};
  const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  const grade=r=>r>=7?'AAA':r>=4.5?'AA':r>=3?'AA Large':'Decorative';
  const save=()=>localStorage.setItem(STORE,JSON.stringify(state));
  const toast=text=>{const e=document.createElement('div');e.className='toast';e.textContent=text;document.body.appendChild(e);setTimeout(()=>e.remove(),1800)};
  const copy=text=>navigator.clipboard?.writeText(text).then(()=>toast(T('status.copied'))).catch(()=>toast(T('status.copyFailed')));
  const download=(name,text,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type||'text/plain'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
  const swatches=arr=>`<div class="mini-palette">${arr.map(x=>`<div style="background:${x}">${ESC(x)}</div>`).join('')}</div>`;
  const nameOf=item=>EN()&&item.nameEn?item.nameEn:(item.name||T('color.custom'));
  const familyOf=value=>DATA().meta?.families?.[value]||value||T('color.unknown');
  const categoryOf=value=>DATA().meta?.categories?.[value]||value||T('color.collection');
  const card=item=>`<article class="card color-card" data-open="${ESC(item.hex)}"><div class="swatch" style="background:${item.hex}"></div><div class="color-meta"><strong>${ESC(nameOf(item))}</strong><span>${item.hex} · ${ESC(familyOf(item.family))}</span><span>${ESC(categoryOf(item.collection))}</span></div></article>`;
  const savePalette=p=>{const now=Date.now(),item={id:p.id||`palette-${now}`,name:p.name||T('palette.defaultName'),colors:(p.colors||[]).slice(0,8),source:p.source||'custom',createdAt:p.createdAt||now,updatedAt:now};state.palettes=[item,...state.palettes.filter(x=>x.id!==item.id)].slice(0,100);save();return item};
  const toggleFavorite=item=>{const i=state.favorites.findIndex(x=>x.id===item.id);if(i>=0)state.favorites.splice(i,1);else state.favorites.unshift(item);save();return i<0};
  async function loadColors(){if(colors.length)return;const r=await fetch('data/colors.json',{cache:'no-store'});const d=await r.json();colors=d.colors||[];window.colorMeta=d}
  function saveRecent(hexValue,name){state.recent=[{hex:hexValue,name,at:Date.now()},...state.recent.filter(x=>x.hex!==hexValue)].slice(0,30);save()}
  function navActive(route){document.querySelectorAll('[data-route]').forEach(a=>a.classList.toggle('active',a.dataset.route===route))}

  async function renderHome(){await loadColors();app.innerHTML=`<section class="hero"><div class="hero-main"><div class="eyebrow">${T('home.eyebrow')}</div><h1>${ESC(T('home.title'))}</h1><p>${ESC(T('home.intro'))}</p><div class="hero-actions"><a class="button primary" href="#/extractor">${T('home.extract')}</a><a class="button secondary" href="#/create">${T('home.create')}</a></div><button class="library-entry" onclick="location.hash='#/library'"><span><strong>${T('home.library')}</strong><small class="library-entry-sub">${colors.length} ${T('home.libraryMeta')}</small></span><b>›</b></button></div><div class="hero-side"><div class="panel metric"><span>${T('stats.namedColors')}</span><strong>${colors.length}</strong><span>${T('stats.namedColorsNote')}</span></div><div class="panel metric"><span>${T('stats.paletteModes')}</span><strong>15</strong><span>${T('stats.paletteModesNote')}</span></div></div></section><div class="section-head"><div><div class="eyebrow">${T('home.discover')}</div><h2>${T('home.featured')}</h2></div><a class="button" href="#/library">${T('home.browseLibrary')}</a></div><div class="grid">${colors.slice(0,12).map(card).join('')}</div><section class="panel" style="padding:22px;margin-top:18px"><h2 class="section-title">${T('home.stepsTitle')}</h2><div class="step"><div class="step-no">01</div><div><div class="step-title">${T('home.stepFind')}</div><div class="muted">${T('home.stepFindNote')}</div></div></div><div class="step"><div class="step-no">02</div><div><div class="step-title">${T('home.stepGenerate')}</div><div class="muted">${T('home.stepGenerateNote')}</div></div></div><div class="step"><div class="step-no">03</div><div><div class="step-title">${T('home.stepSave')}</div><div class="muted">${T('home.stepSaveNote')}</div></div></div></section>`}
  async function renderLibrary(){
    await loadColors();const meta=window.colorMeta||{};const allCategory=meta.categoryAllKey||'all';const allFamily=meta.familyAllKey||'all';
    const localizeAll=value=>categoryOf(value)===categoryOf(allCategory) || familyOf(value)===categoryOf(allCategory);
    const collections=[allCategory,...(meta.categoryNames||[]).filter(x=>x!==allCategory && !localizeAll(x))];
    const families=[allFamily,...(meta.familyNames||[]).filter(x=>x!==allFamily && String(x)!=='all' && !localizeAll(x))];
    let collection=allCategory,family=allFamily,page=1;const PAGE_SIZE=48;
    app.innerHTML=`<section class="hero compact"><div class="eyebrow">${T('library.eyebrow')}</div><div class="title">${T('library.title')}</div><div class="subtitle">${T('library.subtitle')}</div></section><div class="panel filters"><div class="filter-label">${T('library.system')}</div><div class="chips" id="collections">${collections.map((x,i)=>`<button class="chip ${i===0?'active':''}" data-value="${ESC(x)}">${ESC(categoryOf(x))}</button>`).join('')}</div><div class="filter-label second">${T('library.family')}</div><div class="chips" id="families">${families.map((x,i)=>`<button class="chip ${i===0?'active':''}" data-value="${ESC(x)}">${ESC(x===allFamily?categoryOf(allFamily):familyOf(x))}</button>`).join('')}</div><div class="search-wrap"><input id="library-search" class="search-input" placeholder="${T('library.searchPlaceholder')}"></div></div><div class="section-head"><div><h2 id="library-count"></h2></div><span class="muted">${T('library.detail')}</span></div><div id="library-grid" class="library-grid"></div><div id="library-pagination" class="library-pagination" aria-label="Pagination"></div>`;
    const getFiltered=()=>{const q=document.querySelector('#library-search').value.trim().toLowerCase();return colors.filter(c=>(collection===allCategory||c.collection===collection)&&(family===allFamily||c.family===family)&&`${c.name||''} ${c.nameEn||''} ${c.hex} ${c.collection||''} ${c.family||''}`.toLowerCase().includes(q))};
    const setFamily=next=>{family=next||allFamily;document.querySelectorAll('#families .chip').forEach(x=>x.classList.toggle('active',x.dataset.value===family));page=1;draw()};
    const setCollection=next=>{collection=next||allCategory;document.querySelectorAll('#collections .chip').forEach(x=>x.classList.toggle('active',x.dataset.value===collection));page=1;draw()};
    const renderPagination=total=>{const pagination=document.querySelector('#library-pagination');const pages=Math.max(1,Math.ceil(total/PAGE_SIZE));page=Math.min(page,pages);pagination.innerHTML=`<button class="button" type="button" data-page="prev" ${page<=1?'disabled':''}>${EN()?'Previous':'上一页'}</button><span>${page} / ${pages}</span><button class="button" type="button" data-page="next" ${page>=pages?'disabled':''}>${EN()?'Next':'下一页'}</button>`;pagination.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{page=Math.max(1,Math.min(pages,page+(b.dataset.page==='next'?1:-1)));draw()})};
    const draw=()=>{const list=getFiltered(),start=(page-1)*PAGE_SIZE;document.querySelector('#library-count').textContent=T('library.count').replace('{count}',String(list.length));document.querySelector('#library-grid').innerHTML=list.slice(start,start+PAGE_SIZE).map(card).join('')||`<div class="empty wide">${T('library.empty')}</div>`;renderPagination(list.length)};
    document.querySelector('#library-search').oninput=()=>{page=1;draw()};document.querySelectorAll('#collections .chip').forEach(b=>b.onclick=()=>setCollection(b.dataset.value));document.querySelectorAll('#families .chip').forEach(b=>b.onclick=()=>setFamily(b.dataset.value));draw();
  }
  function renderDetail(raw){const source=rgb(raw),value=source?hex(source.r,source.g,source.b):'#7C3AED';const item=colors.find(c=>c.hex.toUpperCase()===value)||{id:`custom-${value}`,name:T('color.custom'),hex:value,collection:'',family:'',source:T('color.userInput')};const c=rgb(value),hs=hsl(c.r,c.g,c.b),all=paletteFromHex(value);const related=colors.filter(x=>x.hex!==value&&(x.family===item.family||!item.family)).slice(0,6);const fav=state.favorites.some(x=>x.id===item.id);const relations=RELATION_KEYS.map(id=>({id,name:REL(id),description:REL_DESC(id),colors:all?.[id]||[]})).filter(x=>x.colors.length);saveRecent(value,item.name);app.innerHTML=`<section class="hero compact"><div class="eyebrow">${T('detail.eyebrow')}</div><div class="title">${ESC(nameOf(item))}</div><div class="subtitle">${ESC(categoryOf(item.collection))} · ${ESC(familyOf(item.family))}</div></section><section class="panel color-hero" style="padding:0;overflow:hidden"><div class="detail-color" style="background:${value}"><span class="contrast">${value}</span></div><div style="padding:20px"><div class="tag">${value}</div><div class="muted" style="margin-top:8px">${ESC(item.source||'')}</div><div class="actions"><a class="button primary" href="#/create?hex=${encodeURIComponent(value)}">${T('detail.useInStudio')}</a><button class="button" id="favorite">${fav?T('detail.favorited'):T('detail.favorite')}</button><button class="button" id="copyhex">${T('detail.copyHex')}</button></div></div></section><section class="panel pad"><h2 class="section-title">${T('detail.parameters')}</h2><div class="value-row"><span>RGB</span><code>${c.r}, ${c.g}, ${c.b}</code><button class="button" data-copy="rgb(${c.r}, ${c.g}, ${c.b})">${T('common.copy')}</button></div><...`}
  async function renderCreate(){app.innerHTML=`<section class="hero compact"><div class="eyebrow">${T('create.eyebrow')}</div><div class="title">${T('create.title')}</div><div class="subtitle">${T('create.subtitle')}</div></section><div class="editor"><section class="panel controls">...</section><section class="panel preview">...</section></div>`}
  async function renderExtractor(){app.innerHTML=`<section class="hero compact"><div class="eyebrow">${T('extractor.eyebrow')}</div><div class="title">${T('extractor.title')}</div><div class="subtitle">${T('extractor.subtitle')}</div></section>...`}
  function renderFavorites(){const items=state.favorites;app.innerHTML=`<section class="hero compact"><div class="eyebrow">${T('favorites.eyebrow')}</div><div class="title">${T('favorites.title')}</div><div class="subtitle">${T('favorites.subtitle')}</div></section><div class="grid">${items.map(item=>`<article class="card favorite-card" data-open="${ESC(item.hex)}"><div class="swatch" style="background:${item.hex}"></div><strong>${ESC(nameOf(item))}</strong><code>${item.hex}</code></article>`).join('')||`<div class="empty wide">${T('favorites.empty')}</div>`}</div>`}
  function renderWorkspace(){app.innerHTML=`<section class="hero compact"><div class="eyebrow">${T('workspace.eyebrow')}</div><div class="title">${T('workspace.title')}</div><div class="subtitle">${T('workspace.subtitle')}</div></section><div class="panel pad"><h2 class="section-title">${T('workspace.recent')}</h2>...`}
  async function route(){
    const raw=location.hash.replace(/^#/,'')||'/home';
    navActive(raw.split('?')[0].replace(/^\//,''));
    if(raw.startsWith('/library'))return renderLibrary();
    if(raw.startsWith('/home'))return renderHome();
    if(raw.startsWith('/detail'))return renderDetail(new URLSearchParams(raw.split('?')[1]||'').get('hex')||'');
    if(raw.startsWith('/create'))return renderCreate();
    if(raw.startsWith('/extractor'))return renderExtractor();
    if(raw.startsWith('/favorites'))return renderFavorites();
    if(raw.startsWith('/workspace'))return renderWorkspace();
    return renderHome();
  }
  window.route=route;
  document.addEventListener('click',e=>{const el=e.target.closest('[data-open]');if(el)location.hash=`#/detail?hex=${encodeURIComponent(el.dataset.open)}`});
  window.addEventListener('hashchange',route);route();
})();
