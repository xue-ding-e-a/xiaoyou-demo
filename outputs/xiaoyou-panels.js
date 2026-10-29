/* Read before implementation: upagent hy/fy @549930-553560; index JMc @7737554.
 * Export: upagent @534500-537000, matched to the live 2026-10-27 menu DOM.
 * This file renders local example content only. Service-backed actions are explicit boundaries.
 */
(() => {
  'use strict';
  const $=id=>document.getElementById(id), el=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const icon=name=>{const n=el('i');n.dataset.icon=name;n.setAttribute('aria-hidden','true');n.style.setProperty('--icon',`url("${window.UPCV_ICONS[name]}")`);return n;};
  // Original fy button's 14px ArrowRight, as read from its live DOM.
  const rightArrow=()=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 256 256');svg.setAttribute('fill','currentColor');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d','M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z');svg.append(path);return svg;};
  let template=null,menu=null,menuAnchor=null,closeTemplateTimer=null,closeMenuTimer=null;
  function notice(text){document.dispatchEvent(new CustomEvent('xiaoyou:notice',{detail:{text}}));}
  function closeTemplate(focus=true){
    if(!template||template.dataset.state==='closed')return;
    template.dataset.state='closed';$('resume-template').setAttribute('aria-expanded','false');
    clearTimeout(closeTemplateTimer);const old=template;template=null;
    closeTemplateTimer=setTimeout(()=>old.remove(),reduced()?0:250);
    if(focus)$('resume-template').focus();
  }
  function openTemplate(){
    if(template){closeTemplate();return;}
    document.dispatchEvent(new CustomEvent('xiaoyou:popoveropen',{detail:{name:'template'}}));
    document.querySelectorAll('.source-template-overlay').forEach(n=>n.remove());clearTimeout(closeTemplateTimer);
    template=el('section','','source-template-overlay');template.dataset.state='open';template.setAttribute('aria-label','选择模板');
    const surface=el('div','','source-template-panel'),header=el('header','','source-template-header');
    const back=el('button','','source-template-back');back.type='button';back.append(icon('caret-right'),el('span','返回对话'));back.onclick=()=>closeTemplate();
    header.append(el('h2','选择模板'),back);surface.append(header);
    const bannerWrap=el('div','','source-template-banner-wrap'),banner=el('div','','source-template-banner up-beam-border');
    const intro=el('div','','source-template-intro'),text=el('div');text.append(el('h3','不想套模板？让 AI 为你设计'),el('p','读懂你的经历和求职方向，定制专属配色、字体与排版'));intro.append(icon('sparkle'),text);
    const design=el('button','AI 定制样式','source-template-design');design.type='button';design.append(rightArrow());design.disabled=$('preview').dataset.state==='running';if(design.disabled)design.firstChild.textContent='等待回复结束';
    design.onclick=()=>notice('AI 定制样式需要连接真实 Agent；当前演示未接入该服务。');banner.append(intro,design);bannerWrap.append(banner);surface.append(bannerWrap);
    const scroll=el('div','','source-template-scroll'),grid=el('div','','source-template-grid');
    const current=$('resume-paper').dataset.template;
    for(const [index,item] of (window.UPCV_TEMPLATES||[]).entries()){
      const card=el('button','','source-template-card');card.type='button';card.setAttribute('aria-label',item.label);card.setAttribute('aria-pressed',String(current===item.id));card.style.setProperty('--template-delay',`${index*.1}s`);
      const image=el('img');image.src=item.image;image.alt=item.label;image.loading='lazy';
      const caption=el('div','','source-template-caption');caption.append(el('p',item.label));card.append(image,caption);
      if(item.vip)card.append(el('span','VIP','source-template-vip'));
      card.onclick=()=>{
        if(!['rhyhorn','onyx'].includes(item.id)){notice('此模板的纸面渲染尚未接入 Demo，当前简历保持原样。');return;}
        $('resume-paper').dataset.template=item.id;
        grid.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===card)));
      };
      grid.append(card);
    }
    scroll.append(grid);surface.append(scroll);template.append(surface);document.querySelector('.demo-main').append(template);$('resume-template').setAttribute('aria-expanded','true');
  }
  function positionMenu(){if(!menu||!menuAnchor)return;const r=menuAnchor.getBoundingClientRect();const width=window.innerWidth>=768?320:288;const height=menu.scrollHeight||358,below=window.innerHeight-r.bottom-8,above=r.top-8;const side=height>below&&above>below?'top':'bottom';const available=Math.max(32,side==='top'?above:below);menu.dataset.side=side;menu.style.width=`${width}px`;menu.style.maxHeight=`${available}px`;menu.style.left=`${Math.max(8,Math.min(r.right-width,window.innerWidth-width-8))}px`;menu.style.top=`${side==='top'?Math.max(8,r.top-Math.min(height,available)):r.bottom}px`;}
  function closeExport(focus=true){if(!menu||menu.dataset.state==='closed')return;menu.dataset.state='closed';menuAnchor?.setAttribute('aria-expanded','false');const old=menu;menu=null;clearTimeout(closeMenuTimer);closeMenuTimer=setTimeout(()=>old.remove(),reduced()?0:150);if(focus)menuAnchor?.focus();}
  function openExport(anchor){
    if(menu){closeExport();return;}
    document.dispatchEvent(new CustomEvent('xiaoyou:popoveropen',{detail:{name:'export'}}));
    document.querySelectorAll('.source-export-menu').forEach(n=>n.remove());clearTimeout(closeMenuTimer);menuAnchor=anchor;
    menu=el('div','','source-export-menu');menu.dataset.state='open';menu.setAttribute('role','menu');menu.setAttribute('aria-label','导出');menu.tabIndex=-1;
    const inner=el('div','','source-export-items');
    const items=[['PDF','下载 PDF 格式的简历。用于打印、发送给招聘人员或上传至招聘网站。','file-pdf'],['图片','下载图片格式的简历。用于打印、发送给招聘人员或上传至招聘网站。','file-image'],['BOSS 附件简历','用 UP 求职插件把这份简历上传到 BOSS 直聘的附件简历，只上传不发送。','upload-simple']];
    items.forEach(([title,description,name])=>{const button=el('button','','source-export-card');button.type='button';button.setAttribute('role','menuitem');const copy=el('div');copy.append(el('h3',title),el('p',description));button.append(icon(name),copy);button.onclick=()=>{if(title==='PDF'){closeExport();window.print();}else notice(`${title}导出尚未接入本地 Demo。`);};inner.append(button);});
    menu.append(inner);document.body.append(menu);positionMenu();anchor.setAttribute('aria-expanded','true');menu.focus();
    menu.onkeydown=event=>{const buttons=[...inner.querySelectorAll('button')];if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();const i=buttons.indexOf(document.activeElement);buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();}};
  }
  document.addEventListener('xiaoyou:popoveropen',event=>{if(event.detail?.name!=='export')closeExport(false);});
  document.addEventListener('pointerdown',event=>{if(menu&&!menu.contains(event.target)&&!menuAnchor?.contains(event.target))closeExport(false);});
  document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(menu){event.preventDefault();event.stopImmediatePropagation();closeExport();}else if(template){event.preventDefault();event.stopImmediatePropagation();closeTemplate();}},true);
  window.addEventListener('resize',positionMenu);document.addEventListener('scroll',positionMenu,true);
  new MutationObserver(()=>{if($('preview').hidden){closeTemplate(false);closeExport(false);}if(template){const button=template.querySelector('.source-template-design');const running=$('preview').dataset.state==='running';button.disabled=running;button.firstChild.textContent=running?'等待回复结束':'AI 定制样式';}}).observe($('preview'),{attributes:true,attributeFilter:['hidden','data-state']});
  window.XiaoyouPanels={openTemplate,closeTemplate,openExport,closeExport};
})();
