/* Source-backed local Select / color Popover. Source anchors in work/format-interaction-source.md. */
(() => {
  'use strict';
  const palette = ['#475569','#57534e','#dc2626','#ea580c','#d97706','#ca8a04','#65a30d','#16a34a','#059669','#0d9488','#0891b2','#0284c7','#2563eb','#4f46e5','#7c3aed','#9333ea','#c026d3','#db2777','#e11d48'];
  const records = new Map(); let active = null, compact = null, counter = 0, configuration = {};
  const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
  const svg = name => {
    // Exact regular Phosphor paths: source weights IQ/e7/Z8t/Ug.
    const node = document.createElementNS('http://www.w3.org/2000/svg','svg'); node.setAttribute('viewBox','0 0 256 256'); node.setAttribute('fill','currentColor'); node.setAttribute('aria-hidden','true');
    const path = document.createElementNS(node.namespaceURI,'path'); path.setAttribute('d', {
      caret:'M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z',
      check:'M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z',
      plus:'M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z',
      back:'M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z'
    }[name]); node.append(path); return node;
  };
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function closeActive(restoreFocus = true, immediate = false) {
    const item = active; if (!item) return;
    active = null; item.anchor.setAttribute('aria-expanded','false'); item.layer.dataset.state = 'closed'; item.layer.inert = true;
    if (restoreFocus && item.anchor.isConnected) item.anchor.focus({preventScroll:true});
    if (immediate || reduced()) item.layer.remove(); else setTimeout(() => item.layer.remove(),150);
  }
  function closeCompact(restoreFocus=true, immediate=false) {
    if(!compact)return;const item=compact;compact=null;
    if(active&&item.layer.contains(active.anchor))closeActive(false,true);
    item.anchor.setAttribute('aria-expanded','false');item.layer.dataset.state='closed';item.layer.inert=true;
    records.forEach((record,select)=>{if(item.layer.contains(select)){record.observer?.disconnect();records.delete(select);}});
    if(restoreFocus&&item.anchor.isConnected)item.anchor.focus({preventScroll:true});
    if(immediate||reduced())item.layer.remove();else setTimeout(()=>item.layer.remove(),150);
  }
  function close(restoreFocus=true, immediate=false){if(active)closeActive(restoreFocus,immediate);else closeCompact(restoreFocus,immediate);}
  function closeAll(restoreFocus=true, immediate=false){if(compact){closeActive(false,immediate);closeCompact(restoreFocus,immediate);}else closeActive(restoreFocus,immediate);}
  function place(item) {
    if (!item.anchor.isConnected) { close(false,true); return; }
    const rect = item.anchor.getBoundingClientRect(), width = item.layer.offsetWidth || item.width;
    const height = item.layer.offsetHeight || item.height, offset = item.type === 'select' ? 4 : 6;
    const below = window.innerHeight - rect.bottom - offset - 8, above = rect.top - offset - 8;
    let side = item.type === 'color' ? 'top' : 'bottom';
    if (side === 'top' && height > above && below > above) side = 'bottom';
    if (side === 'bottom' && height > below && above > below) side = 'top';
    const available = Math.max(32,side === 'bottom' ? below : above);
    item.layer.style.maxHeight = `${available}px`;
    if (item.viewport) item.viewport.style.maxHeight = `${available - 2}px`;
    const usedHeight = Math.min(height,available);
    const left = item.type === 'select' ? rect.left : rect.right - width;
    item.layer.style.left = `${Math.max(8,Math.min(left,window.innerWidth-width-8))}px`;
    item.layer.style.top = `${Math.max(8,side === 'bottom' ? rect.bottom+offset : rect.top-offset-usedHeight)}px`;
    item.layer.dataset.side = side;
  }
  function mount(item) {
    closeActive(false,true);
    if(compact&&!compact.layer.contains(item.anchor))closeCompact(false,true);
    document.dispatchEvent(new CustomEvent('xiaoyou:popoveropen',{detail:{name:item.type === 'color' ? 'color' : 'format'}}));
    active = item; item.layer.dataset.state = 'open'; item.anchor.setAttribute('aria-expanded','true');
    document.body.append(item.layer); place(item);
  }
  function syncRecord(record) {
    record.label.textContent = record.select.selectedOptions[0]?.textContent || '';
    record.button.disabled = record.select.disabled;
  }
  function enhanceSelect(select) {
    if (!select || records.has(select)) return records.get(select)?.button;
    const button = el('button','xy-format-trigger'), label = el('span'); button.type = 'button';
    const identity = `${select.id} ${select.getAttribute('aria-label') || ''}`;
    button.dataset.formatKind = /font-size|字号/.test(identity) ? 'size' : /font|字体/.test(identity) ? 'font' : /margin|边距/.test(identity) ? 'margin' : 'line';
    button.setAttribute('role','combobox'); button.setAttribute('aria-haspopup','listbox'); button.setAttribute('aria-expanded','false'); button.setAttribute('aria-label',select.getAttribute('aria-label') || select.name || '排版选项');
    button.append(label,svg('caret')); select.classList.add('xy-format-source'); select.setAttribute('aria-hidden','true'); select.tabIndex = -1; select.after(button);
    const record = {select,button,label}; records.set(select,record); syncRecord(record);
    select.addEventListener('change',() => syncRecord(record));
    record.observer=new MutationObserver(() => syncRecord(record));record.observer.observe(select,{attributes:true,attributeFilter:['disabled'],childList:true,subtree:true,characterData:true});
    button.onclick = () => { if (active?.anchor === button) close(); else openSelect(record); };
    button.onkeydown = event => { if (['ArrowDown','ArrowUp','Enter',' '].includes(event.key)) { event.preventDefault(); openSelect(record,event.key); } };
    return button;
  }
  function openSelect(record) {
    if (record.select.disabled) return;
    syncRecord(record);
    const layer = el('div','xy-format-layer xy-format-select'), viewport = el('div','xy-format-viewport');
    layer.id = `xy-format-list-${++counter}`; layer.setAttribute('role','listbox'); layer.setAttribute('aria-label',record.button.getAttribute('aria-label')); record.button.setAttribute('aria-controls',layer.id); layer.append(viewport);
    const options = [], select = record.select;
    [...select.options].forEach(option => {
      const button = el('button','xy-format-option',option.textContent); button.type = 'button'; button.tabIndex = -1; button.disabled = option.disabled;
      button.setAttribute('role','option'); button.setAttribute('aria-selected',String(option.value === select.value)); button.dataset.value = option.value;
      if (option.value === select.value) button.append(svg('check'));
      button.onpointermove = event => { if (event.pointerType !== 'touch' && !button.disabled) button.focus({preventScroll:true}); };
      button.onfocus = () => { options.forEach(item => delete item.dataset.highlighted); button.dataset.highlighted = 'true'; };
      button.onclick = () => { if(button.disabled)return; const changed = select.value !== option.value; select.value = option.value; syncRecord(record); if(changed)select.dispatchEvent(new Event('change',{bubbles:true})); close(); };
      options.push(button); viewport.append(button);
    });
    const item = {type:'select',anchor:record.button,layer,viewport,width:128,height:options.length*32+10};
    mount(item);
    const enabled = options.filter(option => !option.disabled);
    const focusOption = option => { option?.focus({preventScroll:true}); option?.scrollIntoView?.({block:'nearest'}); };
    focusOption(enabled.find(option => option.dataset.value === select.value) || enabled[0]);
    let query = '', queryTimer;
    layer.onkeydown = event => {
      const index = enabled.indexOf(document.activeElement);
      if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
        event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length-1 : Math.max(0,Math.min(enabled.length-1,index+(event.key === 'ArrowDown'?1:-1))); focusOption(enabled[next]);
      } else if(event.key === 'Tab') { event.preventDefault(); }
      else if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); document.activeElement?.click(); }
      else if(event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        query += event.key.toLocaleLowerCase(); clearTimeout(queryTimer); queryTimer=setTimeout(()=>query='',1000);
        const ordered=enabled.slice(index+1).concat(enabled.slice(0,index+1)); focusOption(ordered.find(option=>option.textContent.toLocaleLowerCase().startsWith(query)));
      }
    };
  }
  const clamp = (value,min,max) => Math.max(min,Math.min(value,max));
  function rgbToHsv(hex) {
    const value = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#465df1';
    const [r,g,b]=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255), max=Math.max(r,g,b), min=Math.min(r,g,b), delta=max-min;
    let hue=delta === 0 ? 0 : max===r ? ((g-b)/delta)%6 : max===g ? (b-r)/delta+2 : (r-g)/delta+4;
    return {h:(hue*60+360)%360,s:max===0?0:delta/max*100,v:max*100};
  }
  function hsvToHex({h,s,v}) {
    const sat=s/100,value=v/100,c=value*sat,x=c*(1-Math.abs((h/60)%2-1)),m=value-c;
    const rgb=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
    return '#'+rgb.map(channel=>Math.round((channel+m)*255).toString(16).padStart(2,'0')).join('');
  }
  function getColor() { const paper=document.getElementById('resume-paper');return paper?.style.getPropertyValue('--resume-primary').trim() || (paper&&getComputedStyle(paper).getPropertyValue('--resume-primary').trim()) || '#465df1'; }
  function applyColor(color,anchor) {
    document.getElementById('resume-paper')?.style.setProperty('--resume-primary',color); anchor.style.backgroundColor=color;
    configuration.onColorChange?.(color); document.dispatchEvent(new CustomEvent('xiaoyou:formatchange',{detail:{property:'primary',value:color}}));
  }
  function openColor(anchor = document.getElementById('resume-color')) {
    if (!anchor || anchor.disabled) return;
    if (active?.type === 'color' && active.anchor === anchor) { close(); return; }
    const layer=el('div','xy-format-layer xy-format-color'); layer.setAttribute('role','dialog'); layer.setAttribute('aria-label','主题颜色');
    const item={type:'color',anchor,layer,width:228,height:150};
    function render(custom = false) {
      item.width=custom?206:228;layer.style.width=`${item.width}px`;
      layer.replaceChildren();
      const header=el('div','xy-format-color-header');
      if(custom){const back=el('button');back.type='button';back.setAttribute('aria-label','返回主题颜色');back.append(svg('back'));back.onclick=()=>{render(false);layer.querySelector('button')?.focus({preventScroll:true});};header.append(back);}
      header.append(el('h4','',custom?'自定义颜色':'主题颜色'));if(custom)header.append(el('span','xy-format-header-spacer'));layer.append(header);
      if(!custom) {
        const grid=el('div','xy-format-palette');
        palette.forEach(color=>{const button=el('button','xy-format-swatch');button.type='button';button.style.backgroundColor=color;button.setAttribute('aria-label',color.toUpperCase());button.setAttribute('aria-pressed',String(color.toLowerCase()===getColor().toLowerCase()));button.onclick=()=>{applyColor(color,anchor);grid.querySelectorAll('[aria-pressed]').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));};grid.append(button);});
        const customButton=el('button','xy-format-swatch xy-format-custom');customButton.type='button';customButton.setAttribute('aria-label','自定义颜色');customButton.append(svg('plus'));customButton.onclick=()=>{render(true);layer.querySelector('[role=slider]')?.focus({preventScroll:true});};grid.append(customButton);layer.append(grid);item.height=130;
      } else {
        const picker=el('div','xy-format-picker'), saturation=el('div','xy-format-saturation'), hue=el('div','xy-format-hue');
        const codeLine=el('div','xy-format-color-code'),code=el('code');codeLine.append(code);
        let hsv=rgbToHsv(getColor());
        const controls=[];
        const refresh=()=>{const color=hsvToHex(hsv);saturation.style.backgroundColor=hsvToHex({h:hsv.h,s:100,v:100});controls[0].pointer.style.left=`${hsv.s}%`;controls[0].pointer.style.top=`${100-hsv.v}%`;controls[0].pointer.style.background=color;controls[0].surface.setAttribute('aria-valuetext',`Saturation ${Math.round(hsv.s)}%, Brightness ${Math.round(hsv.v)}%`);controls[1].pointer.style.left=`${hsv.h/3.6}%`;controls[1].pointer.style.background=hsvToHex({h:hsv.h,s:100,v:100});controls[1].surface.setAttribute('aria-valuenow',String(Math.round(hsv.h)));code.textContent=color.toUpperCase();};
        [saturation,hue].forEach((container,index)=>{
          const surface=el('div','xy-format-color-interactive'),pointer=el('div','xy-format-color-pointer');surface.tabIndex=0;surface.setAttribute('role','slider');surface.setAttribute('aria-label',index?'Hue':'Color');if(index){surface.setAttribute('aria-valuemin','0');surface.setAttribute('aria-valuemax','360');}surface.append(pointer);container.append(surface);controls.push({surface,pointer});
          const commit=()=>{refresh();applyColor(hsvToHex(hsv),anchor);};
          const move=event=>{const rect=surface.getBoundingClientRect();const x=clamp((event.clientX-rect.left)/(rect.width||1),0,1),y=clamp((event.clientY-rect.top)/(rect.height||1),0,1);if(index)hsv.h=x*360;else{hsv.s=x*100;hsv.v=(1-y)*100;}commit();};
          let dragging=false;surface.onpointerdown=event=>{if(event.button!==0)return;event.preventDefault();dragging=true;surface.focus({preventScroll:true});surface.setPointerCapture?.(event.pointerId);move(event);};surface.onpointermove=event=>{if(dragging)move(event);};surface.onpointerup=()=>dragging=false;surface.onpointercancel=()=>dragging=false;
          surface.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const x=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0,y=event.key==='ArrowUp'?1:event.key==='ArrowDown'?-1:0;if(index)hsv.h=clamp(hsv.h+x*3.6,0,360);else{hsv.s=clamp(hsv.s+x,0,100);hsv.v=clamp(hsv.v+y,0,100);}commit();};
        });
        picker.append(saturation,hue);layer.append(picker,codeLine);refresh();item.height=208;
      }
      if(active===item)place(item);
    }
    render();mount(item);layer.querySelector('button')?.focus({preventScroll:true});
  }
  function init(options = {}) {
    configuration={...configuration,...options};
    ['resume-font','resume-font-size','resume-line-height','resume-margin'].forEach(id=>enhanceSelect(document.getElementById(id)));
    initTooltips();
  }
  function openCompact(anchor=document.getElementById('resume-more-format')) {
    if(!anchor||anchor.disabled)return;
    if(compact?.anchor===anchor){closeAll();return;}
    closeAll(false,true);document.dispatchEvent(new CustomEvent('xiaoyou:popoveropen',{detail:{name:'format'}}));
    const layer=el('div','xy-format-layer xy-format-compact');layer.setAttribute('role','dialog');layer.setAttribute('aria-label','字号、行高、边距');layer.dataset.state='open';
    compact={type:'compact',anchor,layer,width:208,height:114};anchor.setAttribute('aria-expanded','true');
    ['resume-font-size','resume-line-height','resume-margin'].forEach(id=>{
      const original=document.getElementById(id);if(!original)return;
      const row=el('div','xy-format-compact-row'),copy=original.cloneNode(true);copy.removeAttribute('id');copy.value=original.value;
      row.append(el('span','',original.getAttribute('aria-label')),copy);layer.append(row);
      copy.addEventListener('change',()=>{original.value=copy.value;original.dispatchEvent(new Event('change',{bubbles:true}));});enhanceSelect(copy);
    });
    document.body.append(layer);place(compact);layer.querySelector('.xy-format-trigger')?.focus({preventScroll:true});
  }
  // hRo/dRo uses a TooltipProvider delay300, skipDelayDuration300, side=top/offset6.
  // Limit enhancement to existing workspace button titles; aria labels remain untouched.
  let tooltipsInitialized=false, tooltip=null, tooltipTimer=null, lastTooltipClose=-Infinity, pointerFocus=false, inTransit=false;
  function hideTooltip(immediate=false) {
    clearTimeout(tooltipTimer);tooltipTimer=null;
    if(!tooltip)return;const old=tooltip;tooltip=null;inTransit=false;lastTooltipClose=Date.now();old.layer.dataset.state='closed';
    if(immediate||reduced())old.layer.remove();else setTimeout(()=>old.layer.remove(),150);
  }
  function showTooltip(anchor) {
    if(!anchor?.isConnected || !anchor.dataset.xyTooltip || active||compact)return;
    hideTooltip(true);const layer=el('div','xy-format-tooltip',anchor.dataset.xyTooltip);layer.setAttribute('role','tooltip');layer.dataset.state='open';document.body.append(layer);
    const rect=anchor.getBoundingClientRect(),width=layer.offsetWidth||Math.max(48,layer.textContent.length*12+24),height=layer.offsetHeight||28;
    const side=rect.top>=height+14?'top':'bottom';layer.dataset.side=side;
    layer.style.top=`${side==='top'?rect.top-height-6:rect.bottom+6}px`;layer.style.left=`${Math.max(8,Math.min(rect.left+(rect.width-width)/2,window.innerWidth-width-8))}px`;
    tooltip={anchor,layer};
  }
  function initTooltips() {
    if(tooltipsInitialized)return;tooltipsInitialized=true;
    const root=document.getElementById('preview');if(!root)return;
    const captureTitles=()=>root.querySelectorAll('button[title]').forEach(button=>{const text=button.getAttribute('title');button.dataset.xyTooltip=text;button.removeAttribute('title');if(tooltip?.anchor===button){if(text)tooltip.layer.textContent=text;else hideTooltip();}});
    captureTitles();new MutationObserver(captureTitles).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['title']});
    root.addEventListener('pointerover',event=>{if(event.pointerType==='touch')return;const button=event.target.closest('button[data-xy-tooltip]');if(!button||button===event.relatedTarget?.closest?.('button'))return;clearTimeout(tooltipTimer);tooltipTimer=setTimeout(()=>showTooltip(button),tooltip||Date.now()-lastTooltipClose<300?0:300);});
    root.addEventListener('pointerout',event=>{const button=event.target.closest('button[data-xy-tooltip]');if(!button||button.contains(event.relatedTarget))return;clearTimeout(tooltipTimer);if(tooltip?.anchor===button)inTransit=true;});
    document.addEventListener('pointermove',event=>{if(!tooltip||!inTransit)return;const a=tooltip.anchor.getBoundingClientRect(),b=tooltip.layer.getBoundingClientRect();const inside=event.clientX>=Math.min(a.left,b.left)-5&&event.clientX<=Math.max(a.right,b.right)+5&&event.clientY>=Math.min(a.top,b.top)-5&&event.clientY<=Math.max(a.bottom,b.bottom)+5;if(!inside)hideTooltip();});
    document.addEventListener('pointerdown',()=>{pointerFocus=true;hideTooltip();},true);
    document.addEventListener('pointerup',()=>{pointerFocus=false;},true);
    root.addEventListener('focusin',event=>{const button=event.target.closest('button[data-xy-tooltip]');if(button&&!pointerFocus)showTooltip(button);});
    root.addEventListener('focusout',()=>hideTooltip());
    document.addEventListener('keydown',event=>{if(tooltip&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();hideTooltip();}},true);
    document.addEventListener('xiaoyou:popoveropen',()=>hideTooltip());
    window.addEventListener('scroll',()=>hideTooltip(),true);
  }
  document.addEventListener('pointerdown',event=>{
    const insideChild=active?.layer.contains(event.target);
    if(active&&!insideChild&&!active.anchor.contains(event.target))closeActive(false);
    if(compact&&!insideChild&&!compact.layer.contains(event.target)&&!compact.anchor.contains(event.target))closeCompact(false);
  },true);
  document.addEventListener('keydown',event=>{if((active||compact)&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();}},true);
  document.addEventListener('xiaoyou:popoveropen',event=>{if(!['format','color'].includes(event.detail?.name))closeAll(false);});
  window.addEventListener('resize',()=>{hideTooltip();if(compact)place(compact);if(active)place(active);});
  window.addEventListener('scroll',event=>{if(compact&&!compact.layer.contains(event.target))place(compact);if(active&&!active.layer.contains(event.target))place(active);},true);
  new MutationObserver(()=>{if(document.getElementById('preview')?.hidden){closeAll(false);hideTooltip();}}).observe(document.getElementById('preview')||document.body,{attributes:true,attributeFilter:['hidden']});
  window.XiaoyouFormat={init,enhanceSelect,openColor,openCompact,close:closeAll,isOpen:()=>!!(active||compact),sync:()=>records.forEach(syncRecord),initTooltips,palette:[...palette]};
})();
