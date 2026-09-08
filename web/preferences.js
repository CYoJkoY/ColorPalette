(() => {
  const STORE='colorpalette-preferences-v2';
  const saved=(()=>{try{return JSON.parse(localStorage.getItem(STORE))||{}}catch(_){return{}}})();
  const browserLanguage=String(navigator.language||'').toLowerCase();
  let language=saved.language==='en'||saved.language==='zh'?saved.language:(browserLanguage.startsWith('zh')?'zh':'en');
  let theme=saved.theme==='dark'||saved.theme==='light'?saved.theme:'light';
  const localeCode=()=>language==='en'?'en-US':'zh-CN';
  const locale=()=>window.ColorPaletteLocales?.[localeCode()]||window.ColorPaletteLocales?.['zh-CN']||{ui:{}};
  const save=()=>localStorage.setItem(STORE,JSON.stringify({language,theme}));
  const lookup=text=>locale().ui?.[text]??text;
  function translateText(text){
    if(language==='zh')return text;
    let out=String(text);
    Object.entries(window.ColorPaletteLocales?.['en-US']?.ui||{}).sort((a,b)=>b[0].length-a[0].length).forEach(([zh,en])=>{out=out.split(zh).join(en)});
    return out.replace(/^(\d+) 个命名颜色$/,'$1 named colors').replace(/^(\d+) 个颜色$/,'$1 colors').replace(/^(\d+) 个命名颜色 · /,'$1 named colors · ').replace(/^(\d+) 个颜色 · /,'$1 colors · ');
  }
  function updateMeta(){
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.content=theme==='dark'?'#111214':'#F7F7F4';
    document.title=language==='zh'?'ColorPalette — 颜色工作台':'ColorPalette — Color Workspace';
    const d=document.querySelector('meta[name="description"]');
    if(d)d.content=language==='zh'?'ColorPalette：图片取色、颜色百科、配色生成、色卡收藏与工作区。':'ColorPalette: image color extraction, color library, palette generation, favorites and workspace.';
  }
  function applyTheme(){
    document.documentElement.dataset.theme=theme;
    document.documentElement.style.colorScheme=theme;
    const b=document.querySelector('#theme-switch');
    if(b){b.setAttribute('aria-checked',String(theme==='dark'));b.title=language==='zh'?(theme==='dark'?'切换到日间模式':'切换到夜间模式'):(theme==='dark'?'Switch to light mode':'Switch to dark mode');b.setAttribute('aria-label',b.title)}
    updateMeta();
  }
  function translate(root=document.body){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      if(!node.nodeValue.trim()||node.parentElement?.closest('script,style'))return;
      if(!node.__cpOriginal)node.__cpOriginal=node.nodeValue;
      node.nodeValue=language==='en'?translateText(node.__cpOriginal):node.__cpOriginal;
    });
    root.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{if(!el.dataset.cpPlaceholder)el.dataset.cpPlaceholder=el.placeholder;el.placeholder=language==='en'?translateText(el.dataset.cpPlaceholder):el.dataset.cpPlaceholder});
    root.querySelectorAll('[title]').forEach(el=>{if(!el.dataset.cpTitle)el.dataset.cpTitle=el.title;el.title=language==='en'?translateText(el.dataset.cpTitle):el.dataset.cpTitle});
    document.documentElement.lang=language==='zh'?'zh-CN':'en';
    const lb=document.querySelector('#language-switch');
    if(lb){const label=language==='zh'?'切换中文 / English':'Switch Chinese / English';lb.setAttribute('aria-checked',String(language==='en'));lb.setAttribute('aria-label',label);lb.title=label}
    updateMeta();
  }
  function notifyLocaleChange(){window.dispatchEvent(new CustomEvent('colorpalette:localechange',{detail:{language,locale:localeCode()}}));}
  function setLanguage(next){language=next==='en'?'en':'zh';save();translate();applyTheme();notifyLocaleChange();}
  function setTheme(next){theme=next==='dark'?'dark':'light';save();applyTheme();}
  function boot(){
    const lb=document.querySelector('#language-switch'),tb=document.querySelector('#theme-switch');if(!lb||!tb)return;
    lb.addEventListener('click',()=>setLanguage(language==='zh'?'en':'zh'));
    tb.addEventListener('click',()=>setTheme(theme==='light'?'dark':'light'));
    applyTheme();translate();
    const observer=new MutationObserver(ms=>{if(language!=='en')return;ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===Node.ELEMENT_NODE)translate(n)}))});
    observer.observe(document.body,{childList:true,subtree:true});
    window.ColorPalettePreferences={get language(){return language},get locale(){return localeCode()},get theme(){return theme},t:translateText,tKey:(key,fallback)=>window.ColorPaletteI18n?.t(key,fallback)??fallback,lookup,setLanguage,setTheme,translate,applyTheme};
    notifyLocaleChange();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
