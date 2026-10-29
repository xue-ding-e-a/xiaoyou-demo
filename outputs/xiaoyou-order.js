/* Source-derived module order popover, adapting metadata.layout to local section nodes. */
(() => {
  'use strict';
  const paper = document.getElementById('resume-paper');
  if (!paper) return;
  const secondarySections = new Set(['languages','skills','interests','certifications','awards','publications']);
  const gripPath = 'M108,60A16,16,0,1,1,92,44,16,16,0,0,1,108,60Zm56,16a16,16,0,1,0-16-16A16,16,0,0,0,164,76ZM92,112a16,16,0,1,0,16,16A16,16,0,0,0,92,112Zm72,0a16,16,0,1,0,16,16A16,16,0,0,0,164,112ZM92,180a16,16,0,1,0,16,16A16,16,0,0,0,92,180Zm72,0a16,16,0,1,0,16,16A16,16,0,0,0,164,180Z';
  let panel = null, owner = null, drag = null, closingTimer = null, layout = [[],[]], sections = new Map(), generation = 0;
  const node = (tag, className, text) => { const n = document.createElement(tag); n.className = className; if (text !== undefined) n.textContent = text; return n; };
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const announcement = node('div','order-announcement'); announcement.setAttribute('role','status'); announcement.setAttribute('aria-live','polite');
  const announce = text => { announcement.textContent = text; };
  function card(id) {
    const box = node('div','order-card'), inner = node('div','order-card-inner');
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 256 256'); svg.setAttribute('aria-hidden','true');
    const path = document.createElementNS('http://www.w3.org/2000/svg','path'); path.setAttribute('d',gripPath); svg.append(path);
    inner.append(svg,node('p','',sections.get(id)?.querySelector('h2')?.textContent || id)); box.append(inner); return box;
  }
  function readLayout() {
    sections = new Map(); layout = [[],[]];
    paper.querySelectorAll('.resume-section[data-section]').forEach(section => {
      const id = section.dataset.section;
      if (!id || sections.has(id)) return;
      const content = section.textContent.replace(section.querySelector('h2')?.textContent || '', '').trim();
      if (!content && !id.startsWith('custom.')) return;
      const column = section.dataset.orderColumn === '1' || (section.dataset.orderColumn === undefined && secondarySections.has(id)) ? 1 : 0;
      sections.set(id, section); layout[column].push(id);
    });
  }
  function slot(id) { return panel ? [...panel.querySelectorAll('.order-sortable')].find(item => item.dataset.orderId === id) : null; }
  function render() {
    if (!panel) return;
    panel.querySelectorAll('.order-dropzone').forEach((zone,column) => {
      zone.replaceChildren();
      layout[column].forEach(id => {
        const item = node('div','order-sortable'); item.dataset.orderId = id;
        item.setAttribute('role','button'); item.tabIndex = 0;
        item.setAttribute('aria-roledescription','可排序模块'); item.setAttribute('aria-grabbed','false');
        item.setAttribute('aria-label',sections.get(id)?.querySelector('h2')?.textContent || id);
        item.append(card(id));
        item.addEventListener('pointerdown',event => {
          if (event.button !== 0 || event.isPrimary === false || drag) return;
          event.preventDefault(); start(id,'pointer',event);
        });
        item.addEventListener('keydown',event => {
          if ((event.key === ' ' || event.key === 'Enter') && !drag) { event.preventDefault(); event.stopPropagation(); start(id,'keyboard'); }
        });
        zone.append(item);
      });
    });
  }
  function position() {
    if (!panel || panel.dataset.state !== 'open' || !owner) return;
    const rect = owner.getBoundingClientRect(), gap = 6;
    const width = Math.min(384, Math.max(0,window.innerWidth-16));
    const height = panel.getBoundingClientRect().height || 224;
    const below = window.innerHeight - rect.bottom - gap;
    const topSide = below < height && rect.top - gap > below;
    panel.dataset.side = topSide ? 'top' : 'bottom';
    panel.style.left = `${Math.max(8,Math.min(rect.left,window.innerWidth-width-8))}px`;
    panel.style.top = `${Math.max(8,topSide ? rect.top-height-gap : rect.bottom+gap)}px`;
  }
  function clearTransforms() {
    panel?.querySelectorAll('.order-sortable').forEach(item => { item.style.transform = ''; item.removeAttribute('data-dragging'); item.setAttribute('aria-grabbed','false'); });
  }
  function cancelDrag() {
    if (!drag) return;
    const id = drag.id; drag.overlay.remove(); drag = null; clearTransforms(); slot(id)?.focus(); announce('已取消拖拽。');
  }
  function close(options = {}) {
    if (!panel) return;
    const restoreFocus = options.restoreFocus !== false;
    cancelDrag(); owner?.setAttribute('aria-expanded','false');
    const closing = panel, closedOwner = owner; panel = null; owner = null;
    closing.dataset.state = 'closed'; closing.setAttribute('aria-hidden','true');
    if (restoreFocus && closedOwner?.isConnected) closedOwner.focus();
    const remove = () => { closing.remove(); closingTimer = null; };
    if (reduced()) remove(); else {
      closingTimer = setTimeout(remove,150);
      closing.addEventListener('animationend',event => { if (event.target === closing) { clearTimeout(closingTimer); remove(); } }, { once:true });
    }
  }
  function open(anchor = document.getElementById('resume-order')) {
    if (!anchor || anchor.disabled) return;
    if (panel && owner === anchor) { close(); return; }
    close({restoreFocus:false});
    clearTimeout(closingTimer); closingTimer = null;
    document.querySelectorAll('.xiaoyou-order[data-state=closed]').forEach(item => item.remove());
    document.dispatchEvent(new CustomEvent('xiaoyou:popoveropen',{detail:{name:'order'}}));
    readLayout(); owner = anchor; generation++;
    panel = node('div','xiaoyou-order'); panel.id = 'xiaoyou-order-popover'; panel.dataset.state = 'open'; panel.dataset.side = 'bottom'; panel.tabIndex = -1;
    panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','模块顺序');
    owner.setAttribute('aria-expanded','true'); owner.setAttribute('aria-controls',panel.id); owner.setAttribute('aria-haspopup','dialog');
    const inner = node('div','order-inner'), heading = node('div','order-heading'), columns = node('div','order-columns');
    heading.append(node('h4','','模块顺序'),node('p','','拖拽模块来调整显示顺序'));
    ['主界面','侧边栏'].forEach((title,column) => {
      const wrap = node('div','order-column'), background = node('div','order-column-bg'), content = node('div','order-column-content'), zone = node('div','order-dropzone');
      zone.dataset.orderColumn = String(column); zone.setAttribute('aria-label',title); content.append(node('p','order-column-title',title),zone); wrap.append(background,content); columns.append(wrap);
    });
    inner.append(heading,columns); panel.append(inner); document.body.append(panel);
    if (!announcement.isConnected) document.body.append(announcement);
    render(); position(); (panel.querySelector('.order-sortable') || panel).focus();
  }
  function start(id, mode, event) {
    const item = slot(id); if (!item || !panel) return;
    const rect = item.getBoundingClientRect(), fromColumn = layout.findIndex(ids => ids.includes(id)), fromIndex = layout[fromColumn].indexOf(id);
    const overlay = node('div','order-drag-overlay'); overlay.setAttribute('aria-hidden','true'); overlay.append(card(id));
    overlay.style.width = `${rect.width}px`; overlay.style.height = `${rect.height}px`; overlay.style.left = `${rect.left}px`; overlay.style.top = `${rect.top}px`;
    document.body.append(overlay);
    drag = { id, mode, overlay, rect, fromColumn, fromIndex, over:{column:fromColumn,index:fromIndex}, pointerId:event?.pointerId,
      offsetX:event ? event.clientX-rect.left : 0, offsetY:event ? event.clientY-rect.top : 0, left:rect.left, top:rect.top, generation };
    item.dataset.dragging = 'true'; item.setAttribute('aria-grabbed','true'); item.focus();
    announce(`已拾起${item.getAttribute('aria-label')}。使用方向键移动，空格或回车放下，Esc取消。`);
  }
  function setOver(over) {
    if (!drag || !over) return;
    drag.over = over;
    panel.querySelectorAll('.order-sortable').forEach(item => { item.style.transform = ''; });
    if (over.column === drag.fromColumn) {
      const height = drag.rect.height + 4;
      layout[over.column].forEach((id,index) => {
        if (id === drag.id) return;
        const shifted = drag.fromIndex < over.index && index > drag.fromIndex && index <= over.index ? -height : drag.fromIndex > over.index && index >= over.index && index < drag.fromIndex ? height : 0;
        if (shifted) slot(id).style.transform = `translate3d(0,${shifted}px,0)`;
      });
    }
  }
  function pointerMove(event) {
    if (!drag || drag.mode !== 'pointer' || (drag.pointerId !== undefined && event.pointerId !== drag.pointerId)) return;
    event.preventDefault(); drag.left = event.clientX-drag.offsetX; drag.top = event.clientY-drag.offsetY;
    drag.overlay.style.left = `${drag.left}px`; drag.overlay.style.top = `${drag.top}px`;
    const x = drag.left + drag.rect.width/2, y = drag.top + drag.rect.height/2;
    let nearest = null, distance = Infinity;
    panel.querySelectorAll('.order-dropzone,.order-sortable').forEach(target => {
      const rect = target.getBoundingClientRect(); if (!rect.width || !rect.height) return;
      const next = Math.hypot(x-(rect.left+rect.width/2), y-(rect.top+rect.height/2));
      if (next >= distance) return;
      const id = target.dataset.orderId, column = id ? layout.findIndex(ids => ids.includes(id)) : Number(target.dataset.orderColumn);
      nearest = {column,index:id ? layout[column].indexOf(id) : 0}; distance = next;
    });
    if (nearest) setOver(nearest);
  }
  function drop() {
    if (!drag) return;
    const finished = drag; drag = null;
    const {id,fromColumn,fromIndex,over,overlay} = finished;
    clearTransforms();
    if (over && (over.column !== fromColumn || over.index !== fromIndex)) {
      // CFo removes the original index before inserting at the target index.
      layout[fromColumn].splice(fromIndex,1); layout[over.column].splice(over.index,0,id);
      layout.forEach((ids,column) => ids.forEach(key => { const section = sections.get(key); section.dataset.orderColumn = String(column); paper.append(section); }));
      render();
      document.dispatchEvent(new CustomEvent('resumeorderchange',{detail:{columns:layout.map(ids=>[...ids]),order:layout.flat()}}));
    }
    const target = slot(id); target?.focus();
    const rect = target?.getBoundingClientRect();
    const cleanup = () => { overlay.remove(); if (target?.isConnected) target.style.opacity = ''; };
    if (rect && overlay.animate && !reduced()) {
      if (target) target.style.opacity = '0';
      const animation = overlay.animate([{transform:'translate3d(0,0,0)'},{transform:`translate3d(${rect.left-finished.left}px,${rect.top-finished.top}px,0)`}],{duration:250,easing:'ease',fill:'forwards'});
      animation.onfinish = cleanup; animation.oncancel = cleanup;
    } else cleanup();
    announce(`已放下${target?.getAttribute('aria-label') || id}。`); position();
  }
  window.addEventListener('pointermove',pointerMove,{passive:false});
  window.addEventListener('pointerup',event => { if (drag?.mode === 'pointer' && (drag.pointerId === undefined || event.pointerId === drag.pointerId)) drop(); });
  window.addEventListener('pointercancel',() => cancelDrag());
  window.addEventListener('keydown',event => {
    if (!panel) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); if (drag) cancelDrag(); else close(); return; }
    if (drag?.mode !== 'keyboard') return;
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); event.stopImmediatePropagation(); drop(); return; }
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    let {column,index} = drag.over;
    if (event.key === 'ArrowLeft') column = 0;
    if (event.key === 'ArrowRight') column = 1;
    if (event.key === 'ArrowUp') index--;
    if (event.key === 'ArrowDown') index++;
    index = Math.min(Math.max(0,index),Math.max(0,layout[column].length-1));
    setOver({column,index});
    const target = slot(layout[column][index]) || panel.querySelector(`[data-order-column="${column}"]`), rect = target?.getBoundingClientRect();
    if (rect) { drag.left=rect.left; drag.top=rect.top; drag.overlay.style.left=`${rect.left}px`; drag.overlay.style.top=`${rect.top}px`; }
  },true);
  document.addEventListener('pointerdown',event => { if (panel && !panel.contains(event.target) && !owner?.contains(event.target)) close({restoreFocus:false}); },true);
  document.addEventListener('click',event => { if (panel && !panel.contains(event.target) && !owner?.contains(event.target)) close({restoreFocus:false}); });
  document.addEventListener('xiaoyou:popoveropen',event => { if (event.detail?.name !== 'order') close({restoreFocus:false}); });
  document.addEventListener('focusin',event => { if (panel && !drag && !panel.contains(event.target) && !owner?.contains(event.target)) close({restoreFocus:false}); });
  window.addEventListener('resize',position); document.addEventListener('scroll',position,true);
  const preview = document.getElementById('preview');
  if (preview) new MutationObserver(() => { if (preview.hidden) close({restoreFocus:false}); }).observe(preview,{attributes:true,attributeFilter:['hidden']});
  window.XiaoyouOrder = Object.freeze({open,close,isOpen:()=>!!panel,getLayout:()=>layout.map(ids=>[...ids])});
})();
