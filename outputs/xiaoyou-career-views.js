/* Career workflow views. Official sources: job-card-CCQTLojS.js JobCard / SkillTags;
 * upagent-CFN5tJOA.js SuggestSlide @279670, ShortlistAnchorCard @315983, Nh @362130.
 * Video reference: 20–28s search, 29–41s tailoring, 42–47s batch preparation.
 * ATS layout is a flowchart-driven addition, not a reproduced video screen.
 * All records are fictional. This module has no network calls or workflow timers.
 * render(container, options) -> {update(patch), destroy()}; global update/destroy
 * target the latest controller. Same-type updates preserve form nodes and selection.
 * State: phase, progress (0..100), scanned, total, activeId, selectedIds, done;
 * search: visibleIds; match: matches[id]={score,summary,dimensions:[{label,score,evidence,gap}]};
 * deliver: rows[id]={resumeStatus,greetingStatus,submitStatus,greeting}, activeLine,
 * revisedLines (number[]), keywords (string[]); apply: fieldValues, filledFields,
 * missingFields, activeField, confirmed. Status values: idle / working / ready;
 * submitStatus also accepts submitted. onAction(action,payload) is documented below.
 */
(() => {
  'use strict';
  let activeController = null;
  const element = (tag, text = '', className = '') => {
    const el = document.createElement(tag); el.className = className; el.textContent = text; return el;
  };
  const append = (parent, ...children) => { parent.append(...children.filter(Boolean)); return parent; };
  const text = (el, value) => { const next = String(value ?? ''); if (el.textContent !== next) el.textContent = next; };
  const strings = value => Array.isArray(value) ? value.map(String) : [];
  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const scoreValue = value => Math.max(0, Math.min(100, finite(value)));
  const tag = (value, kind = '') => element('span', value, `career-tag ${kind}`);
  const toText = value => Array.isArray(value) ? value.join('；') : String(value || '待补充');
  const sourceNames = job => [...new Set(strings(job.sources).map(source => /boss/i.test(source) ? 'BOSS直聘' : /站内/.test(source) ? '站内资源' : /官网/.test(source) ? '企业官网' : /网页|搜索/.test(source) ? '网页搜索' : source))];
  const jobKeywords = job => job.keywords?.length ? strings(job.keywords) : ({'产品':['需求分析','用户调研','产品流程','团队协作'],'数据分析':['SQL','数据分析','Excel'],'用户研究':['用户访谈','研究方法','需求分析'],'交互设计':['交互原型','设计评审','可用性测试'],'前端开发':['JavaScript','组件开发','接口联调'],'市场运营':['用户运营','渠道反馈','内容活动'],'人力资源':['招聘沟通','流程安排','招聘数据'],'财务':['经营分析','预算记录','财务报表']})[job.direction] || [job.direction,'团队协作'];
  const button = (label, action, primary = false) => {
    const el = element('button', label, `career-button${primary ? ' is-primary' : ''}`);
    el.type = 'button'; el.addEventListener('click', action); return el;
  };
  const heading = (title, subtitle) => append(element('div', '', 'career-heading'), element('h3', title), subtitle && element('p', subtitle));
  function details(label, content) {
    const el = element('details', '', 'career-details');
    append(el, append(element('summary'), element('span', label), element('span', '⌄', 'career-chevron')), content); return el;
  }
  function motionScope(owner) {
    const animations=new Map(), activeNodes=new WeakMap(), frames=new Set(), numbers=new Set(), reveals=new WeakSet();let stopped=false;
    const reduced=()=>stopped||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||typeof owner.animate!=='function';
    const animate=(node,keyframes,options={},finish)=>{
      if(stopped)return null;
      const preceding=activeNodes.get(node);if(preceding){preceding.settle(false);preceding.animation.cancel();}
      if(reduced()){finish?.();return null;}
      const animation=node.animate(keyframes,{duration:520,easing:'cubic-bezier(.22,1,.36,1)',...options});let live=true;
      const record={animation,settle(commit){if(!live)return;live=false;animations.delete(animation);if(activeNodes.get(node)===record)activeNodes.delete(node);if(commit)finish?.();}};
      animations.set(animation,record);activeNodes.set(node,record);animation.finished?.catch(()=>{});
      animation.onfinish=()=>{if(!stopped)record.settle(true);};animation.oncancel=()=>{if(!stopped)record.settle(true);};return animation;
    };
    const number=(ref,target,paint,duration=940)=>{
      if(stopped)return;target=finite(target);if(ref.target===target)return;ref.target=target;const revision=ref.revision=(ref.revision||0)+1;
      if(ref.frame!=null){cancelAnimationFrame(ref.frame);frames.delete(ref.frame);ref.frame=null;}
      if(reduced()){ref.value=target;paint(target);return;}
      const from=ref.value||0,start=performance.now();numbers.add(ref);paint(from);
      const tick=now=>{if(stopped||ref.revision!==revision)return;if(ref.frame!=null)frames.delete(ref.frame);
        const p=Math.min(1,Math.max(0,(now-start)/duration)), eased=1-Math.pow(1-p,3);ref.value=from+(target-from)*eased;paint(ref.value);
        if(p<1){ref.frame=requestAnimationFrame(tick);frames.add(ref.frame);}else{ref.frame=null;numbers.delete(ref);}
      };ref.frame=requestAnimationFrame(tick);frames.add(ref.frame);
    };
    function reveal(node,delay=0){const newly=node.hidden||!reveals.has(node);node.hidden=false;if(newly){reveals.add(node);animate(node,[{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:560,delay,fill:'backwards'});}return newly;}
    function swap(outgoing,incoming){
      if(outgoing===incoming){incoming.hidden=false;return;}
      incoming.classList.remove('is-leaving');incoming.hidden=false;incoming.inert=false;incoming.removeAttribute('aria-hidden');
      if(outgoing&&!outgoing.hidden){outgoing.inert=true;outgoing.setAttribute('aria-hidden','true');outgoing.classList.add('is-leaving');animate(outgoing,[{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(-32px)'}],{duration:380},()=>{if(outgoing.classList.contains('is-leaving')){outgoing.hidden=true;outgoing.classList.remove('is-leaving');}});}
      animate(incoming,[{opacity:0,transform:'translateX(36px)'},{opacity:1,transform:'translateX(0)'}],{duration:580,delay:140,fill:'backwards'});
    }
    const resetNumber=ref=>{ref.revision=(ref.revision||0)+1;if(ref.frame!=null){cancelAnimationFrame(ref.frame);frames.delete(ref.frame);}ref.frame=null;ref.target=undefined;ref.value=0;numbers.delete(ref);};
    const cancel=()=>{if(stopped)return;stopped=true;[...animations.values()].forEach(record=>{record.settle(true);record.animation.cancel();});animations.clear();frames.forEach(cancelAnimationFrame);frames.clear();numbers.clear();};
    return{animate,number,resetNumber,reveal,swap,reduced,cancel};
  }
  function ring(half = false, motion) {
    const root=element('div','','career-score'+(half?' is-half':'')),label=element('strong','—'),caption=element('small',half?'匹配度':'契合度'),counter={value:0};
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',half?'0 0 100 64':'0 0 100 100');svg.setAttribute('aria-hidden','true');let arc;
    ['career-score-track','career-score-arc'].forEach(className=>{const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',half?'M 10 52 A 40 40 0 0 1 90 52':'M 50 8 A 42 42 0 1 1 49.99 8');path.setAttribute('class',className);path.setAttribute('pathLength','100');svg.append(path);if(className==='career-score-arc')arc=path;});
    append(root,svg,append(element('div','','career-score-center'),label,caption));
    return{root,update(value){const valid=value!==undefined&&value!==null;root.setAttribute('aria-label',valid?`示例匹配分 ${Math.round(scoreValue(value))}`:'等待匹配评估');
      if(!valid){motion.resetNumber(counter);text(label,'—');arc.style.strokeDashoffset='100';return;}
      motion.number(counter,scoreValue(value),n=>{text(label,Math.round(n));arc.style.strokeDashoffset=String(100-n);},900);
    }};
  }
  function status() {
    const root = element('span', '', 'career-status'), marker = element('span', '', 'career-status-marker'), label = element('span');
    append(root, marker, label);
    return {root, update(value = 'idle', readyLabel = '已准备') {
      const normalized = ['ready', 'submitted', 'done'].includes(value) ? 'ready' : value === 'working' || value === 'running' ? 'working' : 'idle';
      root.dataset.state = normalized; text(marker, normalized === 'ready' ? '✓' : normalized === 'working' ? '' : '·');
      text(label, normalized === 'ready' ? readyLabel : normalized === 'working' ? '准备中' : '待准备');
    }};
  }
  function render(container, options = {}) {
    if (!container || typeof container.replaceChildren !== 'function') throw new TypeError('CareerViews requires a DOM container');
    let state = {...options}, destroyed = false, view = null, currentType = '', selection = new Set(options.selectedIds || (options.jobs || []).map(job => job.id));
    const root = element('section', '', 'career-views'), header = element('header', '', 'career-view-header'), motion=motionScope(root);
    const brand=element('span','','career-up-mark'),brandCopy=element('b','UP'),completeMark=element('span','✓','career-complete-mark');
    const logoTemplate=document.getElementById('thinking-art')?.content?.querySelector('svg');
    if(logoTemplate){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 600 288');svg.setAttribute('aria-hidden','true');logoTemplate.querySelectorAll('path').forEach(path=>{const copy=path.cloneNode();copy.setAttribute('fill','currentColor');svg.append(copy);});brandCopy.replaceChildren(svg);}append(brand,brandCopy,completeMark);
    const stage=element('div','','career-stage'),stageLabel=element('span','准备开始');stage.setAttribute('role','status');stage.setAttribute('aria-live','polite');append(stage,stageLabel);append(header,brand,stage);
    const body = element('div', '', 'career-view-body'); append(root, header, body); container.replaceChildren(root);
    const emit = (action, payload = {}) => { if (!destroyed && typeof state.onAction === 'function') state.onAction(action, payload); };
    const jobs = () => Array.isArray(state.jobs) ? state.jobs : [];
    const selected = () => jobs().filter(job => selection.has(job.id)).map(job => job.id);
    const select = (id, checked) => {
      if (checked) selection.add(id); else selection.delete(id);
      view?.refreshSelection?.(); emit('select', {ids: selected()});
    };
    const selectAll = () => {
      const shown = jobs().filter(job => !state.visibleIds || state.visibleIds.includes(job.id));
      const every = shown.length && shown.every(job => selection.has(job.id));
      shown.forEach(job => every ? selection.delete(job.id) : selection.add(job.id));
      view?.refreshSelection?.(); emit('select', {ids: selected()});
    };
    const selectControl = job => {
      const label = element('label', '', 'career-check');
      const input = element('input'); input.type = 'checkbox'; input.checked = selection.has(job.id);
      input.setAttribute('aria-label', `选择${job.company} · ${job.title}`);
      input.addEventListener('change', () => select(job.id, input.checked)); label.append(input); return {label, input};
    };
    function createJobCard(job, detailed) {
      const card = element('article', '', 'career-job-card'); card.dataset.jobId = job.id;card.hidden=true;
      const check = selectControl(job), score = detailed ? ring(true,motion) : null, top = element('div', '', 'career-job-top');
      const names = element('div', '', 'career-job-names');
      const logo=element('span',job.company.slice(0,2),'career-company-mark');logo.dataset.tone=String(Math.max(0,jobs().findIndex(item=>item.id===job.id))%6);
      const jobTitle = element('h3', job.title), company = element('p', `${job.company} · ${sourceNames(job).join(' / ')||'来源待核实'}`),recommend=detailed?tag('最匹配','is-recommended'):null;
      append(names,company,append(element('div','','career-job-title-line'),jobTitle,recommend));append(top,logo,names,score?.root);card.append(top);card.append(check.label);
      const meta = element('div', '', 'career-job-meta');
      append(meta,tag(job.type||'校招','is-accent'),tag(job.city||'城市待核实'),tag(job.salary||'薪资待核实'),job.year&&tag(`${job.year}届可投`));names.append(meta);
      const skills=element('div','','career-skill-row');skills.append(element('span',detailed?'技能匹配':'岗位关键词'));jobKeywords(job).slice(0,5).forEach(value=>skills.append(tag(value,'is-skill')));names.append(skills);
      const summary = element('span'),reasonTitle=element('strong',detailed?'值得投：':'职责摘要：'),reason=append(element('p','','career-job-reason'),reasonTitle,summary);card.append(reason);
      const evidence = detailed ? element('div', '', 'career-evidence') : null;
      const dims = new Map();
      const jd = append(element('div', '', 'career-jd-detail'), heading('岗位职责'), element('p', toText(job.duties)), heading('任职要求'), element('p', toText(job.requirements)));
      if(detailed)jd.prepend(evidence);
      const disclosure = details(detailed ? '匹配依据与职位详情' : '查看职位详情', jd); card.append(disclosure);
      const actions = element('div', '', 'career-card-actions');
      if (detailed) append(actions, button('定制简历与招呼语', () => emit('deliver', {ids: [job.id]})), button('填写网申', () => emit('apply', {jobId: job.id})));
      jd.append(actions);
      function update() {
        const match = detailed ? state.matches?.[job.id] : null,shown=Array.isArray(state.visibleIds)&&state.visibleIds.includes(job.id);
        if(shown){motion.reveal(card);score?.update(match?.score);}else card.hidden=true;
        text(summary, detailed ? (match?.summary || job.gap || '待读取完整职位要求。').replace(/^(值得进一步了解：|需谨慎核对：)/,'').replace(/（示例规则评分）$/,'') : toText(job.duties));
        if(detailed)text(reasonTitle,match?.eligible===false?'待核实：':'值得投：');
        const firstId=state.visibleIds?.[0];if(recommend)recommend.hidden=job.id!==firstId;card.dataset.recommended=String(detailed&&job.id===firstId);
        actions.hidden=!detailed||!state.done;
        card.dataset.active = String(state.activeId === job.id);
        card.dataset.selected = String(selection.has(job.id)); check.input.checked = selection.has(job.id);
        const dimensions = detailed ? match?.dimensions || [] : [];
        dimensions.forEach((item, index) => {
          const key = item.label || String(index); let ref = dims.get(key);
          if (!ref) {
            const row = element('div', '', 'career-evidence-row'), head = element('div', '', 'career-evidence-heading');
            const label = element('strong'), scoreText = element('span'), meter = element('div', '', 'career-dimension-bar'), fill = element('span');
            const proof = element('p'), gap = element('p', '', 'career-gap'); append(head, label, scoreText); append(meter, fill); append(row, head, meter, proof, gap); evidence.append(row);
            ref = {row,label,scoreText,fill,proof,gap}; dims.set(key, ref);
          }
          text(ref.label, item.label); text(ref.scoreText, item.score == null ? '待核实' : `${Math.round(scoreValue(item.score))} / 100`);
          ref.fill.style.width = `${scoreValue(item.score)}%`; text(ref.proof, toText(item.evidence)); text(ref.gap, item.gap ? `待核实 · ${toText(item.gap)}` : ''); ref.gap.hidden = !item.gap;
          ref.row.hidden = false;
        });
        dims.forEach((ref, key) => { if (!dimensions.some((item,index) => (item.label || String(index)) === key)) ref.row.hidden = true; });
      }
      return {card, check, update};
    }
    function createProfileJourney() {
      const scene=element('section','','career-profile-scene'), resume=element('div','','career-profile-resume'), result=element('div','','career-profile-results'), directions=element('div','','career-directions');
      const sourcePaper=document.getElementById('resume-paper'),paper=sourcePaper?sourcePaper.cloneNode(true):element('article','','career-snapshot-document');
      paper.removeAttribute('id');paper.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));paper.className='career-snapshot-document';
      paper.querySelectorAll('[data-resume-point],[data-resume-header],[data-section]').forEach(n=>{n.removeAttribute('data-resume-point');n.removeAttribute('data-resume-header');n.removeAttribute('data-section');});
      if(!sourcePaper)append(paper,element('h1',state.profile?.name||'林同学'),element('p','产品经理 · 应届毕业生'),element('h2','教育经历'),element('p',`${state.profile?.school||'某大学'} · 本科 · 2027届`),element('h2','项目经历'),element('h3','校园二手交易平台'),...((state.profile?.projects||['参与用户调研、需求分析与原型设计。']).map(copy=>element('p',copy))),element('h2','专业技能'),element('p','需求分析、用户访谈、交互原型、SQL、Excel。'));
      const snapshotFrame=append(element('div','','career-snapshot-frame'),paper);
      append(resume,snapshotFrame,element('span','简历原文','career-resume-caption'));
      const profileMeta=element('span'),profileHeading=append(element('div','','career-profile-label'),element('strong','✦  用户画像'),profileMeta);result.append(profileHeading);
      const cards=['教育背景','实习经历','项目与技能','综合评估'].map(title=>{
        const card=element('section','','career-profile-fact-card'), titleEl=element('h4',title),mark=element('span','✓','career-fact-check'), facts=element('dl');titleEl.append(mark);append(card,titleEl,facts);card.hidden=true;result.append(card);return{card,titleEl,mark,facts,refs:[]};
      });
      directions.append(heading('值得主攻的 3 个方向','按背景契合度排序'));
      const directionCards=Array.from({length:3},(_,index)=>{
        const card=element('article','','career-direction'), order=element('span',String(index+1).padStart(2,'0'),'career-direction-order'), copy=element('div'), title=element('h4'), reason=element('p'), score=ring(false,motion);
        const titleLine=append(element('div','','career-direction-title'),title,index===0?tag('推荐主攻','is-recommended'):null);
        append(copy,titleLine,reason);append(card,order,copy,score.root);card.hidden=true;directions.append(card);return{card,title,reason,score};
      });
      const next=element('p','接下来，按这些方向寻找值得投的机会 →','career-next-scene');directions.append(next);
      append(scene,resume,result,directions);
      directions.hidden=true;let previousMode='profile';
      function fitSnapshot(){
        if(destroyed||root.dataset.stopped==='true'||!snapshotFrame.isConnected||resume.hidden)return;
        const width=snapshotFrame.clientWidth,height=snapshotFrame.clientHeight;
        if(width>0&&height>0)snapshotFrame.style.setProperty('--snapshot-scale',String(Math.min(1,width/595,height/842)));
      }
      const snapshotObserver=typeof ResizeObserver==='function'?new ResizeObserver(fitSnapshot):null;snapshotObserver?.observe(snapshotFrame);
      function setFacts(ref, values) {
        while(ref.refs.length<values.length){const group=element('div'),label=element('dt'),value=element('dd');group.style.setProperty('--fact-index',String(ref.refs.length));append(group,label,value);ref.facts.append(group);ref.refs.push({group,label,value});}
        ref.refs.forEach((row,index)=>{row.group.hidden=!values[index];if(values[index]){text(row.label,values[index][0]);text(row.value,values[index][1]);const isProject=values[index][0]==='项目经历';row.value.classList.toggle('career-profile-project',isProject);if(isProject)row.value.title=values[index][1];}});
      }
      return {root:scene,destroy(){snapshotObserver?.disconnect();},update(){
        const p=state.profile||{}, stage=Math.max(0,Math.min(4,finite(state.profileStage,4))), isDirections=state.phase==='directions';
        const mode=isDirections?'directions':'profile',before=result.getBoundingClientRect();scene.dataset.mode=mode;directions.hidden=!isDirections;
        if(previousMode!==mode){
          if(isDirections){
            const oldResume=resume.getBoundingClientRect();resume.style.width=`${oldResume.width}px`;resume.classList.add('is-leaving');
            motion.animate(resume,[{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(-110px)'}],{duration:500},()=>{resume.hidden=true;resume.classList.remove('is-leaving');resume.style.width='';});
          }else{resume.hidden=false;resume.classList.remove('is-leaving');resume.style.width='';}
          const after=result.getBoundingClientRect();motion.animate(result,[{transform:`translate(${before.left-after.left}px,${before.top-after.top}px)`},{transform:'translate(0,0)'}],{duration:680});
          if(isDirections)motion.animate(directions.firstChild,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,delay:320,fill:'backwards'});previousMode=mode;
        }
        text(profileMeta,`${p.name||'林同学'} · ${String(p.year||2027).slice(-2)}届应届 · 意向${p.direction||'产品'}`);
        const projectText=(p.projects||[]).map(item=>typeof item==='string'?item:item.title||item.name||item.description||'校园产品项目').join('；')||'校园二手交易平台';
        const values=[
          [['教育背景',`${p.education||'本科'} · ${p.school||'某大学'}`],['专业方向','信息管理与信息系统'],['求职意向',`${p.year||2027}届 · ${p.city||'上海'} · 校招与应届岗位`]],
          [['已有经历',p.internship||'简历暂未提供实习经历'],['经历重点',p.internship?'核对个人贡献与具体交付物':'校园项目 · 产品实践'],['筛选策略','优先关注接受应届生的岗位']],
          [['项目经历',projectText],['硬技能',Array.isArray(p.skills)?p.skills.join(' · '):p.skills||'需求分析 · SQL · Excel'],['软实力','用户访谈 · 原型沟通 · 团队协作'],['待补信息',p.gap||'个人贡献与项目结果的验证依据']],
          [['✦',p.summary||'校园产品实践与初级产品岗位相关'],['主攻方向','产品经理 · 产品运营 · 用户研究'],['补强建议','补充关键决策、具体交付物与结果依据']]
        ];
        cards.forEach((ref,index)=>{setFacts(ref,values[index]);const show=isDirections||index<stage;if(show){if(motion.reveal(ref.card)){ref.refs.forEach((row,i)=>motion.animate(row.group,[{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:440,delay:120+i*115,fill:'backwards'}));}}else ref.card.hidden=true;ref.card.dataset.active=String(!isDirections&&index===stage-1);ref.mark.hidden=index===3;});
        const suggested=state.directions||[{title:'初级产品经理',reason:'需求调研、流程设计与产品项目相衔接',score:92},{title:'产品运营',reason:'用户反馈整理与功能推广经历相关',score:89},{title:'用户研究',reason:'可延伸用户访谈与问题归纳经验',score:86}];
        directionCards.forEach((ref,index)=>{const item=suggested[index],show=isDirections&&item&&index<finite(state.directionCount,3);if(item){text(ref.title,item.title||item.name);text(ref.reason,item.reason||item.description);}if(show){motion.reveal(ref.card);ref.score.update(item.score);}else ref.card.hidden=true;});
        next.hidden=!isDirections||finite(state.directionCount,3)<3;if(!next.hidden)motion.reveal(next,480);fitSnapshot();
      }};
    }
    function createResults(detailed) {
      const wrap=element('div','','career-scenes'),journey=detailed?null:createProfileJourney(),results=element('section','','career-search-scene');body.append(wrap);if(journey)wrap.append(journey.root);wrap.append(results);results.hidden=true;let currentScene=null,lastVisible='';
      const resultHead=element('div','','career-results-head');results.append(resultHead);
      const top=element('div','','career-search-top'),chips=element('div','','career-filter-chips'),count=element('div','','career-found-count'),countNumber=element('strong','0'),found={value:0};
      const countBefore=element('span',detailed?'已评估 ':'已汇总 '),countAfter=element('span',' 个职位');append(count,countBefore,countNumber,countAfter);append(top,chips,count);resultHead.append(top);
      const progressCopy=element('p','','career-screen-progress');progressCopy.setAttribute('role','status');progressCopy.setAttribute('aria-live','polite');resultHead.append(progressCopy);
      const sources=element('div','','career-source-progress'),sourceRefs=['BOSS直聘','站内资源','网页搜索','企业官网'].map(name=>{
        const item=element('div','','career-source-item'),label=element('span',name),value=element('strong','0'),statusLabel=element('small','待汇总');append(item,label,value,statusLabel);sources.append(item);return{name,item,value,statusLabel};
      });sources.hidden=detailed;resultHead.append(sources);
      const visibleJobs=()=>{const byId=new Map(jobs().map(job=>[job.id,job]));return [...new Set(state.visibleIds||[])].map(id=>byId.get(id)).filter(Boolean);};
      const selectedVisible=()=>visibleJobs().filter(job=>selection.has(job.id)).map(job=>job.id);
      const selectButton = button('全选', selectAll), nextButton = button(detailed ? '为所选职位准备投递' : '按细化要求精筛', () => {
        if(!state.done)return;const ids=selectedVisible();if(ids.length)emit(detailed?'deliver':'match',{ids});
      }, true);
      const criteriaBody=element('div','','career-refine-body'),criteriaGrid=element('div','','career-refine-grid'),criteriaStatus=element('span','','career-refine-status');
      const criteriaPanel=details('细化筛选要求',criteriaBody);criteriaPanel.classList.add('career-refine');criteriaPanel.querySelector('summary').insertBefore(criteriaStatus,criteriaPanel.querySelector('.career-chevron'));resultHead.append(criteriaPanel);
      const definitions=[
        ['city','城市',['上海','杭州','北京','深圳','不限']],['direction','方向',['产品','数据分析','用户研究','不限']],
        ['jobType','招聘类型',['不限','校招','实习']],['minSalaryK','月薪下限',[0,10,12,15]],
        ['minScore','最低匹配',[80,85,90]],['industry','行业',['不限','互联网','软件服务','智能制造']]
      ],draft={},criterionRefs=new Map();let criteriaDirty=false,criteriaInitialized=false;
      const criterionLabel=(key,value)=>key==='minSalaryK'?(value===0?'不限':`${value}K`):key==='minScore'?`${value}分`:String(value);
      function paintCriteria(){
        criterionRefs.forEach((refs,key)=>refs.forEach(ref=>{const active=draft[key]===ref.value;ref.button.setAttribute('aria-pressed',String(active));}));
        criteriaPanel.dataset.dirty=String(criteriaDirty);text(criteriaStatus,criteriaDirty?'有未应用修改':`匹配 ≥ ${draft.minScore??80}分`);
      }
      function criterionChoice(key,value){
        const choice=button(criterionLabel(key,value),()=>{draft[key]=value;criteriaDirty=true;paintCriteria();});choice.className='career-refine-chip';choice.setAttribute('aria-pressed','false');return{value,button:choice};
      }
      definitions.forEach(([key,label,values])=>{
        const field=element('fieldset','','career-refine-field'),choices=element('div','','career-refine-choices'),refs=[];field.append(element('legend',label));
        values.forEach(value=>{const ref=criterionChoice(key,value);choices.append(ref.button);refs.push(ref);});
        criterionRefs.set(key,refs);field.append(choices);criteriaGrid.append(field);
      });
      const applyCriteria=button('应用要求并重新精筛',()=>{
        if(applyCriteria.disabled)return;criteriaDirty=false;paintCriteria();criteriaPanel.open=false;emit('refine',{criteria:{...draft}});
      },true);
      append(criteriaBody,criteriaGrid,append(element('div','','career-refine-actions'),element('span','按所选条件核对，仅保留达标职位'),applyCriteria));
      const viewport=element('div','','career-results-viewport'),list = element('div', '', 'career-job-list'), empty = element('p', '正在读取职位来源…', 'career-empty');append(viewport,list,empty);results.append(viewport);
      const refs = new Map(), footer = element('footer', '', 'career-view-footer');
      const selectedCount = element('span');append(footer,selectedCount,selectButton,nextButton);results.append(footer);
      let userReading=false;
      const pauseScroll=()=>{if(userReading)return;userReading=true;viewport.scrollTo?.({top:viewport.scrollTop,behavior:'instant'});};
      viewport.addEventListener('wheel',pauseScroll,{passive:true});viewport.addEventListener('touchstart',pauseScroll,{passive:true});viewport.addEventListener('pointerdown',pauseScroll);viewport.addEventListener('focusin',pauseScroll);
      viewport.addEventListener('keydown',event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))pauseScroll();});
      viewport.tabIndex=0;viewport.setAttribute('aria-label',detailed?'达标职位列表':'粗筛职位列表');
      function followLatest(visible) {
        if(userReading||state.stopped||root.dataset.stopped==='true'||!visible.length||!viewport.clientHeight||typeof viewport.scrollTo!=='function')return;
        if(state.done){list.style.paddingBottom='0px';viewport.scrollTo({top:0,behavior:'instant'});return;}
        const style=window.getComputedStyle(viewport),topInset=parseFloat(style.paddingTop)||0,bottomInset=parseFloat(style.paddingBottom)||0;
        const contentTop=node=>{let top=0,current=node;while(current&&current!==viewport){top+=current.offsetTop;current=current.offsetParent;}return current===viewport?top:node.getBoundingClientRect().top-viewport.getBoundingClientRect().top+viewport.scrollTop;};
        const cards=visible.map(job=>refs.get(job.id)?.card).filter(Boolean),last=cards.at(-1),lastBottom=contentTop(last)+last.offsetHeight;
        let anchor=cards.length-1;
        // Keep at most the last two complete cards, aligned to an untransformed card edge.
        if(anchor>0&&lastBottom-contentTop(cards[anchor-1])<=viewport.clientHeight-topInset-bottomInset)anchor--;
        const target=Math.max(0,contentTop(cards[anchor])-topInset);
        // Real trailing space prevents the browser clamping scrollTop into a card title.
        list.style.paddingBottom=`${Math.max(0,Math.ceil(target+viewport.clientHeight-lastBottom-bottomInset))}px`;
        viewport.scrollTo({top:target,behavior:state.done||motion.reduced()?'instant':'smooth'});
      }
      function refreshSelection() {
        const ids = selectedVisible(); text(selectedCount, `已选择 ${ids.length} 个职位`); nextButton.disabled = !state.done||ids.length === 0;
        refs.forEach(ref => ref.update());
        const shown = jobs().filter(job => (state.visibleIds||[]).includes(job.id));selectButton.disabled=shown.length===0;
        text(selectButton, shown.length && shown.every(job => selection.has(job.id)) ? '取消全选' : '全选');
      }
      return {refreshSelection,destroy(){journey?.destroy();}, update() {
        const p = state.profile || {},profiling=!detailed&&['profile','directions'].includes(state.phase),nextScene=profiling?journey.root:results;
        if(currentScene!==nextScene){motion.swap(currentScene,nextScene);if(!currentScene){const inactive=profiling?results:journey?.root;if(inactive)inactive.hidden=true;}currentScene=nextScene;userReading=false;}if(profiling)journey.update();
        if(!criteriaDirty||!criteriaInitialized){definitions.forEach(([key,,values])=>{
          const fallback=key==='city'?'上海':key==='direction'?'产品':key==='minScore'?80:key==='minSalaryK'?0:'不限';
          const value=key==='minScore'||key==='minSalaryK'?finite(p[key],fallback):p[key]??fallback;draft[key]=value;
          const refs=criterionRefs.get(key),choices=refs[0].button.parentElement;
          for(let index=refs.length-1;index>=0;index--){const ref=refs[index];if(!values.includes(ref.value)&&ref.value!==value){ref.button.remove();refs.splice(index,1);}}
          if(!refs.some(ref=>ref.value===value)){const ref=criterionChoice(key,value);ref.button.dataset.current='true';choices.append(ref.button);refs.push(ref);}
        });criteriaInitialized=true;paintCriteria();}
        const values = detailed ? [p.city&&p.city!=='不限'?p.city:'城市不限',p.direction&&p.direction!=='不限'?p.direction:'方向不限',p.jobType&&p.jobType!=='不限'?p.jobType:'招聘类型不限'] : [p.city&&p.city!=='不限'?`优先${p.city}`:'城市不限',p.direction&&p.direction!=='不限'?`${p.direction}及相关方向`:'不限方向','全网粗筛'];
        const signature = values.join('|');if(chips.dataset.signature!==signature){chips.replaceChildren(...values.map((value,index)=>{const chip=tag(value);chip.style.setProperty('--chip-index',String(index));return chip;}));chips.dataset.signature=signature;}
        jobs().forEach(job => { if (!refs.has(job.id)) { const ref = createJobCard(job,detailed); refs.set(job.id,ref); list.append(ref.card); } });
        const visible = visibleJobs(),total=finite(state.total,jobs().length),scanned=Math.min(total,Math.max(0,finite(state.scanned))),minimum=finite(p.minScore,80);
        visible.forEach((job,index)=>{const card=refs.get(job.id)?.card,current=list.children[index];if(card&&card!==current)list.insertBefore(card,current||null);});
        refs.forEach((ref,id) => { if (!jobs().some(job => job.id === id)) ref.card.hidden = true; else ref.update(); });
        motion.number(found,detailed?scanned:visible.length,n=>text(countNumber,Math.round(n)),650);count.hidden=false;empty.hidden=profiling||visible.length>0;footer.hidden=!state.done||!visible.length;
        text(countBefore,detailed?'已评估 ':state.done?'可筛池 ':'已汇总 ');text(countAfter,` / ${total} 个`);
        text(progressCopy,detailed?`粗筛 ${total} 个 → 已评估 ${scanned} 个 → 达标 ${visible.length} 个 · 仅展示匹配 ≥ ${minimum}分且满足细化条件的职位` : state.done?`已合并去重 · 共 ${total} 个职位进入可筛池`:'按来源逐步汇总岗位，完成后合并去重');
        sourceRefs.forEach(ref=>{const available=jobs().filter(job=>sourceNames(job).includes(ref.name)).length,collected=visible.filter(job=>sourceNames(job).includes(ref.name)).length;text(ref.value,`${collected} / ${available}`);text(ref.statusLabel,state.done?'已汇总':collected?'汇总中':'待汇总');ref.item.dataset.complete=String(state.done);ref.item.dataset.active=String(collected>0);});
        criteriaPanel.hidden=!detailed||profiling;applyCriteria.disabled=Boolean(state.stopped);
        text(empty,state.done?detailed?'暂时没有达标职位，请展开「细化筛选要求」调整条件后重新精筛。':'暂无已汇总职位，请调整求职方向后重新粗筛。':detailed?'正在逐岗评估，达标职位将依次出现…':'正在按来源汇总职位…');refreshSelection();
        const visibleKey=`${visible.map(job=>job.id).join('|')}:${Boolean(state.done)}`;if(visibleKey!==lastVisible&&!profiling){lastVisible=visibleKey;followLatest(visible);}
      }};
    }
    function createDeliver() {
      const batch = element('section', '', 'career-batch');
      const batchCount=element('div','','career-batch-count'),batchNumber=element('strong','0'),batchTotal=element('span'),batchCounter={value:0};
      append(batchCount,element('span','已完成 '),batchNumber,batchTotal);append(batch,append(element('div','','career-batch-heading'),element('h3','批量定制进度'),batchCount));
      const tableWrap = element('div', '', 'career-table-wrap'), table = element('table', '', 'career-table');
      const head = append(element('thead'), append(element('tr'), ...['职位', '定制简历 PDF', '简历', '招呼语', '投递状态'].map(label => element('th', label))));
      const tbody = element('tbody'); append(table, head, tbody); tableWrap.append(table); batch.append(tableWrap);
      const refs = new Map(); body.append(batch);
      const greeting = element('section', '', 'career-greeting'), greetingLabel = element('label', '当前职位招呼语');
      const greetingJob=element('p','','career-helper');greeting.append(greetingJob);
      const greetingInput = element('textarea'); greetingInput.rows = 4; greetingInput.setAttribute('aria-label', '编辑当前职位招呼语');
      const greetingHelp = element('p', '可在投递前修改。内容仅使用已确认的示例经历。', 'career-helper'); append(greeting, greetingLabel, greetingInput, greetingHelp); body.append(greeting);
      const greetingActions=element('div','','career-card-actions');greetingActions.append(button('返回批量准备',()=>emit('back-to-batch')));greeting.append(greetingActions);
      let greetingJobId = '', greetingDirty = false;
      greetingInput.addEventListener('input', () => { greetingDirty = true; emit('greeting-change', {jobId: greetingJobId, text: greetingInput.value}); });
      const footer = element('footer', '', 'career-view-footer'), count = element('span');
      const actions = element('div', '', 'career-footer-actions');
      const prepare = button('准备所选材料', () => emit('prepare', {ids: selected()}));
      const submit = button('一键投递', () => emit('submit', {ids: selected()}), true);
      const follow = button('查看我的职位', () => emit('progress'));
      append(actions, prepare, submit, follow); append(footer, count, actions); body.append(footer);
      const getRow = id => ({...state.applications?.[id], ...state.rows?.[id]});
      const isReady = (row,kind) => {
        const ready=Object.hasOwn(row,`${kind}Status`)?row[`${kind}Status`]==='ready':row[`${kind}Ready`]===true;
        return ready && (kind!=='greeting'||!Object.hasOwn(row,'greeting')||Boolean(String(row.greeting||'').trim()));
      };
      function refreshSelection() {
        const ids = selected(), ready = ids.filter(id => isReady(getRow(id),'resume') && isReady(getRow(id),'greeting'));
        const allReady=jobs().filter(job=>isReady(getRow(job.id),'resume')&&isReady(getRow(job.id),'greeting')).length;
        motion.number(batchCounter,allReady,n=>text(batchNumber,Math.round(n)),480);text(batchTotal,` / ${jobs().length}`);
        count.hidden=!state.done;prepare.disabled = ids.length === 0;
        const sending=ids.some(id=>getRow(id).submitStatus==='working'),allSent=ids.length>0&&ids.every(id=>getRow(id).submitStatus==='submitted'||getRow(id).status==='applied');
        submit.hidden=!ids.length||ready.length!==ids.length||(!state.done&&!sending&&!allSent);prepare.hidden=true;follow.hidden=!allSent;
        submit.disabled = !ids.length || ready.length !== ids.length || ids.every(id => getRow(id).submitStatus === 'submitted' || getRow(id).status === 'applied');
        submit.disabled=submit.disabled||sending;submit.dataset.state=allSent?'done':sending?'working':'ready';
        const remaining=ids.filter(id=>getRow(id).submitStatus!=='submitted'&&getRow(id).status!=='applied').length;
        const sent=ids.length-remaining;text(count,sent?remaining?`已选 ${ids.length} 个 · 其中 ${sent} 个已投递，本次投递 ${remaining} 个`:`已选 ${ids.length} 个 · 均已投递`:`已选择 ${ids.length} 个职位`);
        text(submit,allSent?`✓ 已模拟投递 ${ids.length} 份`:sending?'投递中…':`一键投递 ${remaining} 份`);
        refs.forEach((ref,id) => {ref.check.input.checked = selection.has(id); ref.row.dataset.selected = String(selection.has(id));});
      }
      return {refreshSelection, update() {
        const job = jobs().find(j => j.id === state.activeId) || jobs().find(j => selection.has(j.id)) || jobs()[0];
        greeting.hidden = !job||state.phase!=='greeting';batch.hidden=state.phase==='greeting';footer.hidden=state.phase==='greeting';
        if (job) {
          text(greetingJob,`${job.company} · ${job.title}`);
          const row = getRow(job.id);
          if (greetingJobId !== job.id) { greetingJobId = job.id; greetingDirty = false; }
          if (!greetingDirty) greetingInput.value = String(row.greeting ?? '');
        }
        jobs().forEach(job => {
          let ref = refs.get(job.id);
          if (!ref) {
            const row = element('tr'); row.dataset.jobId = job.id;row.style.setProperty('--row-index',String(refs.size));
            const mark=element('span',job.company.slice(0,2),'career-company-mark');mark.dataset.tone=String(refs.size%6);
            const check = selectControl(job), identity = append(element('td'), append(element('div', '', 'career-batch-job'), check.label,mark,append(element('div'), element('strong',job.company), element('span',` · ${job.title}`))));
            const resume = status(), greet = status(), submitted = status();
            const fileButton=button('',()=>emit('tailor',{jobId:job.id}));fileButton.className='career-pdf';fileButton.setAttribute('aria-label',`查看${job.company}定制简历`);
            const fileCell=append(element('td'),append(fileButton,element('b','PDF'),element('span',`${state.profile?.name||'林同学'}-${job.title.replace(/\s*[·/].*$/,'')}-${job.company}.pdf`)));
            const resumeCell = append(element('td'), resume.root);
            const greetingButton=button('',()=>emit('greeting',{jobId:job.id}));greetingButton.className='career-greeting-trigger';greetingButton.setAttribute('aria-label',`查看或编辑${job.company}招呼语`);greetingButton.append(greet.root);
            const greetingCell = append(element('td'),greetingButton);
            append(row,identity,fileCell,resumeCell,greetingCell,append(element('td'),submitted.root)); tbody.append(row);motion.animate(row,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,delay:refs.size*65,fill:'backwards'});ref={row,check,resume,greet,submitted,fileButton,greetingButton}; refs.set(job.id,ref);
          }
          const row = getRow(job.id); ref.row.dataset.active = String(job.id === state.activeId);
          ref.resume.update(row.resumeStatus || (row.resumeReady ? 'ready' : 'idle'), '简历已定制'); ref.greet.update(row.greetingStatus || (row.greetingReady ? 'ready' : 'idle'),'招呼语已生成');
          ref.fileButton.disabled=!state.done||!isReady(row,'resume');ref.greetingButton.disabled=!state.done;
          const sent = row.submitStatus || (row.status === 'applied' ? 'submitted' : 'idle'); ref.submitted.update(sent,'已模拟投递');
          if (sent === 'idle') text(ref.submitted.root.lastChild,'待确认');
          if (sent === 'working') text(ref.submitted.root.lastChild,'模拟投递中');
        });
        refs.forEach((ref,id) => ref.row.hidden = !jobs().some(job => job.id === id)); refreshSelection();
      }};
    }
    function createApply() {
      const jobHeader = element('section', '', 'career-apply-job'), name = element('h3'), company = element('p');
      append(jobHeader, tag('网申填写'), name, company); body.append(jobHeader);
      body.append(element('p', '根据简历填写已有信息；缺失项由你补充，核对后由你在网申页面提交。', 'career-helper'));
      const form = element('form', '', 'career-apply-form'); form.noValidate = true; body.append(form);
      const configs = [
        {group:'基本信息',items:[{id:'name',label:'姓名',source:'简历 · 基本信息',required:true},{id:'email',label:'邮箱',type:'email',source:'简历 · 联系方式',required:true},{id:'phone',label:'手机号',type:'tel',source:'简历中未提供',required:true},{id:'city',label:'意向城市',source:'求职画像',required:true}]},
        {group:'教育经历',items:[{id:'school',label:'学校',source:'简历 · 教育经历',required:true},{id:'education',label:'学历',source:'简历 · 教育经历',required:true},{id:'year',label:'毕业年份',source:'简历 · 教育经历',required:true},{id:'major',label:'专业',source:'简历 · 教育经历',required:false}]},
        {group:'补充信息',items:[{id:'availability',label:'可到岗时间',source:'需要你确认',required:true},{id:'experience',label:'项目经历',source:'简历 · 项目经历',multiline:true,required:true}]}
      ];
      const refs = new Map(), dirty = new Set();
      configs.forEach(config => {
        const group = element('fieldset', '', 'career-form-group'); group.append(element('legend',config.group));
        const grid = element('div', '', 'career-form-grid');
        config.items.forEach(item => {
          const label = element('label','',`career-form-field${item.multiline ? ' is-wide' : ''}`), caption = element('span',`${item.label}${item.required ? ' *' : ''}`);
          const input = element(item.multiline ? 'textarea' : 'input'); if (!item.multiline) input.type = item.type || 'text'; else input.rows = 3;
          input.name=item.id; input.required=Boolean(item.required); input.autocomplete='off'; input.placeholder='待填写';
          const source = element('small',item.source), error = element('small','','career-field-error');
          const errorId = `career-ats-${item.id}-error`; error.id=errorId; input.setAttribute('aria-describedby',errorId);
          append(label,caption,input,source,error); grid.append(label); refs.set(item.id,{...item,label,input,source,error});
          input.addEventListener('input',() => { dirty.add(item.id);text(source,'由你补充');if(submitted){submitted=false;text(feedback,'信息已更新，请重新核对。');}confirm.checked=false;validateField(item.id,true);refreshConfirm();emit('field-change',{field:item.id,value:input.value}); });
        }); group.append(grid); form.append(group);
      });
      const attachment = element('div','','career-attachment'); append(attachment,element('span','▤'),append(element('div'),element('strong','林同学_定制简历.pdf'),element('small','示例附件 · 等待核对'))); form.append(attachment);
      const confirmLabel = element('label','','career-review-check'), confirm = element('input'); confirm.type='checkbox';
      append(confirmLabel,confirm,element('span','我已核对信息与简历，确认填写完整')); form.append(confirmLabel);
      const feedback = element('p','','career-form-feedback'); feedback.setAttribute('role','status'); form.append(feedback);
      const footer = element('footer','','career-view-footer'), completion=element('span'), submit=button('确认填写完成',() => {},true);
      submit.type='submit'; append(footer,completion,submit); form.append(footer);
      let submitted = false;
      function valid(ref) {
        const value=ref.input.value.trim(); if(ref.required&&!value)return false;if(!value)return true;
        if(ref.type==='email')return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if(ref.id==='phone')return /^(?:\+?86)?1[3-9]\d{9}$/.test(value.replace(/[\s-]/g,''));
        if(ref.id==='year')return /^\d{4}$/.test(value)&&Number(value)>=2000&&Number(value)<=2100;
        return true;
      }
      function validateField(id,showRequired) {
        const ref=refs.get(id); const invalid=!valid(ref) && (showRequired || ref.input.value.trim().length>0);
        const formatMessage=ref.id==='phone'?'请填写有效的 11 位手机号':ref.id==='year'?'请填写有效的四位毕业年份':'请填写有效的邮箱地址';
        ref.input.setAttribute('aria-invalid',String(invalid)); text(ref.error,invalid ? ref.input.value.trim() ? formatMessage : `请补充${ref.label.firstChild.textContent.replace(' *','')}` : '');
        ref.label.dataset.missing=String(!valid(ref)); return !invalid;
      }
      function refreshConfirm() {
        const required=[...refs.values()].filter(ref=>ref.required), complete=required.filter(valid).length;
        text(completion,`${complete} / ${required.length} 项必填信息已完成`); submit.disabled=!confirm.checked||complete!==required.length||submitted;
        text(submit,submitted ? '已确认填写完成' : '确认填写完成');
      }
      confirm.addEventListener('change',() => {refreshConfirm(); emit('review-change',{confirmed:confirm.checked});});
      form.addEventListener('submit',event => {
        event.preventDefault(); if(submitted)return;
        refs.forEach((_,id)=>validateField(id,true)); const missing=[...refs.values()].filter(ref=>!valid(ref));
        if(missing.length||!confirm.checked){text(feedback,missing.length?'请先补齐标记的信息。':'请先核对并勾选确认。');missing[0]?.input.focus();return;}
        const values=Object.fromEntries([...refs].map(([id,ref])=>[id,ref.input.value.trim()]));
        submitted=true; refreshConfirm(); text(feedback,'已核对，等待你在网申页面提交。');
        emit('confirm-apply',{jobId:state.activeId||jobs()[0]?.id,fields:values});
      });
      return {update(patch={}) {
        const job=jobs().find(item=>item.id===state.activeId)||jobs()[0]; text(name,job?.title||'当前网申职位');text(company,job?.company||'职位信息待确认');
        const p=state.profile||{}, defaults={name:p.name||'林同学',email:p.email||'lin@example.com',city:p.city||'上海',school:p.school||'某大学',education:p.education||'本科',year:String(p.year||2027),experience:'校园服务小程序：参与用户调研、产品流程设计及上线反馈整理。'};
        const values={...defaults,...state.fieldValues}, filled=new Set(state.filledFields||[]), missing=new Set(state.missingFields||[]);
        refs.forEach((ref,id)=>{
          if(!dirty.has(id) && (!state.filledFields||filled.has(id)) && values[id]!=null)ref.input.value=String(values[id]);
          ref.label.dataset.active=String(state.activeField===id); ref.label.dataset.filled=String(filled.has(id)||Boolean(ref.input.value));
          if(dirty.has(id))text(ref.source,'由你补充');else if(missing.has(id))text(ref.source,'待你补充');
          validateField(id,Boolean(state.done&&missing.has(id)));
        });
        if(Object.hasOwn(patch,'confirmed'))confirm.checked=Boolean(patch.confirmed);
        refreshConfirm();
      }};
    }
    function createInterview() {
      const panel = element('section','','career-interview'); append(panel,heading('面试准备','根据目标职位与已确认的简历经历准备。'));
      const list = element('ol'); ['梳理岗位要求与项目证据','准备项目经历中的个人贡献与关键决策','整理需要向面试官确认的问题'].forEach(copy=>list.append(element('li',copy)));panel.append(list);
      panel.append(button('返回我的职位',()=>emit('progress')));body.append(panel);return{update(){}};
    }
    function update(patch={}) {
      if(destroyed)return;
      const previous=state;state={...state,...patch};
      ['matches','rows','applications'].forEach(key=>{if(patch[key]&&typeof patch[key]==='object'){state[key]={...previous[key]};Object.entries(patch[key]).forEach(([id,value])=>{state[key][id]=value==null?value:{...previous[key]?.[id],...value};});}});
      if(patch.fieldValues)state.fieldValues={...previous.fieldValues,...patch.fieldValues};
      if(Object.hasOwn(patch,'selectedIds'))selection=new Set(patch.selectedIds||[]);
      const type=['search','match','deliver','apply','interview'].includes(state.type)?state.type:'search';
      if(currentType!==type){view?.destroy?.();body.replaceChildren();currentType=type;view=type==='search'?createResults(false):type==='match'?createResults(true):type==='deliver'?createDeliver():type==='apply'?createApply():createInterview();}
      root.dataset.type=type;root.dataset.phase=state.phase||'idle';root.dataset.done=String(Boolean(state.done));
      root.dataset.results=String(type==='match'||type==='search'&&!['profile','directions'].includes(state.phase));
      root.dataset.profile=String(type==='search'&&['profile','directions'].includes(state.phase));
      let label=state.phaseLabel||'正在准备…',completed=Boolean(state.done);
      if(type==='search'&&state.phase==='profile'){const step=finite(state.profileStage);label=['正在分析简历内容…','正在读取教育背景…','正在读取实习经历…','正在读取项目与技能…','背景分析完成，已生成用户画像'][Math.min(4,step)];completed=step>=4;}
      else if(type==='search'&&state.phase==='directions'){label=finite(state.directionCount)>=3?'已推导出 3 个主攻方向':'正在整理值得主攻的方向…';completed=finite(state.directionCount)>=3;}
      else if(type==='search'||type==='match'){label=state.done?type==='search'?`粗筛完成，已汇总 ${finite(state.total,jobs().length)} 个职位`:`精筛完成，${(state.visibleIds||[]).length} 个职位达标`:type==='search'?'正在全网粗筛，按来源汇总职位…':'正在按细化要求，逐岗评估匹配度…';}
      else if(type==='deliver'&&state.phase!=='greeting'){const count=jobs().length;label=state.phase==='submit'?state.done?state.phaseLabel||'投递完成':'正在投递，请稍候…':state.done?`已为 ${count} 个岗位备好简历与招呼语`:`正在为 ${count} 个岗位批量定制简历与招呼语…`;}
      else if(type==='deliver'&&state.phase==='greeting'){label='核对你的专属招呼语';completed=false;}
      if(state.stopped||/^已停止/.test(state.phaseLabel||'')){label=state.phaseLabel||'已停止，保留当前结果';completed=false;motion.cancel();root.dataset.stopped='true';}
      text(stageLabel,label);header.dataset.complete=String(completed);root.setAttribute('aria-label',label);
      view.update(patch);
    }
    const controller={update,destroy(){if(destroyed)return;destroyed=true;motion.cancel();view?.destroy?.();root.remove();view=null;if(activeController===controller)activeController=null;}};
    activeController=controller;update(options);return controller;
  }
  window.XiaoyouCareerViews={render,update(patch){activeController?.update(patch);},destroy(){activeController?.destroy();}};
})();
