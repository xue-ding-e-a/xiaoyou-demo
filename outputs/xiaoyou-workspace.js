/* Local equivalents of the audited original workspace controls; no original API calls. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id), app = $('app'), preview = $('preview'), paper = $('resume-paper');
  const paperScroll=preview.querySelector('.preview-scroll'), paperStage=preview.querySelector('.resume-paper-stage');
  let scale = window.innerWidth < 1024 ? .5 : 1, manual = false, explicitZoom = false;
  function resizePaper() {
    const paperWidth = 210 * 96 / 25.4;
    const mobile = window.innerWidth <= 760;
    const availableWidth = paperScroll.clientWidth || Math.max(0, window.innerWidth - 18);
    let gutters=16;
    if(!mobile){
      const stageStyle=window.getComputedStyle(paperStage);
      const stagePadding=parseFloat(stageStyle.paddingLeft)+parseFloat(stageStyle.paddingRight);
      gutters=Number.isFinite(stagePadding)?stagePadding:64;
    }
    // Preserve A4 proportions and typography. The default view fits narrow
    // desktop/tablet panes too; an explicit desktop zoom can still scroll.
    // Mobile keeps its existing whole-page fit and 8px side gutters.
    let renderedScale = mobile||!explicitZoom ? Math.min(scale, Math.max(1, availableWidth - gutters) / paperWidth) : scale;
    if (!mobile && !explicitZoom && app.classList.contains('video-stage') && $('resume-tabpanel').classList.contains('has-target-job')) {
      const editing = $('resume-tabpanel').dataset.focusEdit === 'true';
      const pageHeight = Math.max(paper.offsetHeight || 0, 297 * 96 / 25.4);
      const fitWidth = Math.max(1, availableWidth - gutters) / paperWidth;
      renderedScale = editing ? Math.min(1, fitWidth) : Math.min(1, fitWidth, Math.max(260, paperScroll.clientHeight - 16) / pageHeight);
    }
    paper.style.setProperty('--resume-scale',String(renderedScale));
    const frame = $('resume-paper-frame');
    frame.style.width = `${paperWidth * renderedScale}px`;
    frame.style.height = `${Math.max(paper.offsetHeight || 0, 297 * 96 / 25.4) * renderedScale}px`;
    frame.style.minHeight = frame.style.height;
    $('resume-zoom').title = `缩放视图 (${({1:'默认尺寸',.85:'中等尺寸',.7:'最小尺寸'})[scale]||'默认尺寸'})`;
  }
  function settingsChanged() {
    paper.style.setProperty('--resume-font', `'${$('resume-font').value}'`);
    paper.style.setProperty('--resume-font-size', `${$('resume-font-size').value}px`);
    paper.style.setProperty('--resume-line-height', $('resume-line-height').value);
    paper.style.setProperty('--resume-margin', `${$('resume-margin').value}px`);
    window.XiaoyouFormat?.sync();
    requestAnimationFrame(resizePaper);
  }
  ['resume-font','resume-font-size','resume-line-height','resume-margin'].forEach(id => $(id).addEventListener('change',settingsChanged));
  $('workspace-close-all').onclick = () => $('close-preview').click();
  $('resume-tab').onkeydown = event => { if (event.key === 'Delete') $('close-preview').click(); };
  function setExpanded(expanded) {
    app.classList.toggle('workspace-expanded', expanded);
    $('workspace-fullscreen').title = expanded ? '还原' : '全屏';
    $('workspace-fullscreen').setAttribute('aria-label',expanded ? '还原窗口' : '全屏窗口');
    const icon = $('workspace-fullscreen').querySelector('i');
    icon.style.setProperty('--icon', `url("${window.UPCV_ICONS[expanded ? 'arrows-in' : 'arrows-out']}")`);
    requestAnimationFrame(resizePaper);
  }
  $('workspace-fullscreen').onclick = () => setExpanded(!app.classList.contains('workspace-expanded'));
  $('resume-zoom').onclick = () => { explicitZoom=true; scale = scale === 1 ? .85 : scale === .85 ? .7 : 1; resizePaper(); };
  $('resume-order').onclick = () => {window.XiaoyouOrder.open($('resume-order'));};
  $('resume-template').onclick = () => {window.XiaoyouPanels.openTemplate();};
  $('resume-more-format').onclick = () => window.XiaoyouFormat.openCompact($('resume-more-format'));
  $('resume-color').onclick = () => {window.XiaoyouFormat.openColor($('resume-color'));};
  $('resume-export').onclick = () => {window.XiaoyouPanels.openExport($('resume-export'));};
  $('resume-one-page').onclick = () => {
    if (preview.dataset.state === 'running') return;
    return window.XiaoyouSmartFit.run();
  };
  $('resume-ai-layout').onclick = () => {
    if (preview.dataset.state === 'running') return;
    document.dispatchEvent(new CustomEvent('xiaoyou:notice',{detail:{text:'官网此按钮会向 Agent 发起排版建议；Demo 尚未接入这项流程。'}}));
  };
  function setManual(value) {
    manual=value; $('resume-manual-edit').setAttribute('aria-pressed',String(value));
    document.querySelectorAll('[data-resume-point]').forEach(line=>{
      line.contentEditable=String(value); line.setAttribute('role',value?'textbox':'listitem');
      if(value) line.setAttribute('aria-label','编辑项目经历');else line.removeAttribute('aria-label');
    });
  }
  $('resume-manual-edit').onclick=()=>{if(preview.dataset.state!=='running')setManual(!manual);};
  $('resume-text').addEventListener('input',()=>{
    if (!manual) return;
    const points=[...document.querySelectorAll('[data-resume-point]')].map(line=>line.textContent);
    document.dispatchEvent(new CustomEvent('resumedocumentchange',{detail:{points}}));requestAnimationFrame(resizePaper);
  });
  function syncState() {
    const running=preview.dataset.state==='running';
    const titles={'resume-one-page':'自动缩放内容以适应一页纸','resume-ai-layout':'根据简历内容定制配色、字体与排版','resume-manual-edit':'在编辑器中打开'};
    ['resume-one-page','resume-ai-layout','resume-manual-edit'].forEach(id=>{$(id).disabled=running;$(id).title=running?'请等待当前回复结束':titles[id];});
    if(running && manual)setManual(false);
    if(preview.hidden){setExpanded(false);}
    requestAnimationFrame(resizePaper);
  }
  new MutationObserver(syncState).observe(preview,{attributes:true,attributeFilter:['hidden','data-state']});
  if(window.ResizeObserver){const paperObserver=new ResizeObserver(resizePaper);paperObserver.observe(paper);paperObserver.observe(paperScroll);}
  document.fonts?.ready.then(resizePaper);
  const divider=$('workspace-divider'), mainArea=document.querySelector('.demo-main');
  let preferredLeftRatio=null;
  // Original Gk observes the main area and recalculates its 380px chat minimum
  // and 70% upper bound. Keep a user's split as a ratio, not stale pixel width,
  // so window resizing and the animated sidebar cannot push the preview out.
  function applyWorkspaceWidth(main) {
    if(window.innerWidth<=760){app.style.removeProperty('--workspace-width');return;}
    if(preferredLeftRatio===null||main.width<=0)return;
    const usableWidth=Math.max(0,main.width-16);
    const minLeft=Math.min(380,usableWidth);
    const maxLeft=Math.min(usableWidth,Math.max(minLeft,main.width*.7));
    const left=Math.min(maxLeft,Math.max(minLeft,preferredLeftRatio*main.width));
    app.style.setProperty('--workspace-width',`${usableWidth-left}px`);
    divider.setAttribute('aria-valuemin',String(Math.round(minLeft/main.width*100)));
    divider.setAttribute('aria-valuemax',String(Math.round(maxLeft/main.width*100)));
    divider.setAttribute('aria-valuenow',String(Math.round(left/main.width*100)));
  }
  function syncWorkspaceWidth(){applyWorkspaceWidth(mainArea.getBoundingClientRect());}
  function setWidth(clientX) {
    const main=mainArea.getBoundingClientRect();
    if(main.width<=0||window.innerWidth<=760)return;
    const minLeft=Math.min(380,Math.max(0,main.width-16));
    const maxLeft=Math.max(minLeft,main.width*.7);
    preferredLeftRatio=Math.min(maxLeft,Math.max(minLeft,clientX-main.left))/main.width;
    applyWorkspaceWidth(main);
  }
  divider.onpointerdown=event=>{divider.setPointerCapture?.(event.pointerId);app.classList.add('workspace-dragging');};
  divider.onpointermove=event=>{if(app.classList.contains('workspace-dragging'))setWidth(event.clientX);};
  const endDrag=()=>app.classList.remove('workspace-dragging');divider.onpointerup=endDrag;divider.onpointercancel=endDrag;
  divider.onkeydown=event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const main=mainArea.getBoundingClientRect();const current=divider.getBoundingClientRect().left;setWidth(event.key==='Home'?main.left+380:event.key==='End'?main.left+main.width*.7:current+(event.key==='ArrowRight'?24:-24));}};
  if(window.ResizeObserver)new ResizeObserver(()=>{syncWorkspaceWidth();resizePaper();}).observe(mainArea);
  document.addEventListener('resumeorderchange',()=>requestAnimationFrame(resizePaper));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(app.classList.contains('workspace-expanded')){event.stopImmediatePropagation();$('workspace-fullscreen').click();}}},true);
  window.addEventListener('resize',()=>{explicitZoom=false;scale=window.innerWidth<1024?.5:1;syncWorkspaceWidth();requestAnimationFrame(resizePaper);});
  settingsChanged();syncState();window.XiaoyouFormat.init();
})();
