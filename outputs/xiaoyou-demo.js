(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const exampleTask = '帮我优化一份产品经理校招简历，重点突出校园项目经历。';
  const stages = ['正在阅读项目经历', '正在分析需求表达', '正在分析个人贡献', '正在分析结果与整理建议'];
  const originalResumePoints = [
    '参与需求调研和功能设计，确定了小程序的主要功能模块。',
    '负责校园二手交易平台的产品工作，参与调研、设计、开发和推广。',
    '项目上线后获得同学们的一致好评，累计服务大量用户。'
  ];
  let resumePoints = [...originalResumePoints], resumeCompact = false;
  let taskType = 'analysis', revisionPlan = [], editQueue = [], activeEdit = null, editTimer = null, editToken = 0, editPlanKey = '';
  let scenarioRun = null, resumeJourney = null, targetJob = null, requestedEvidenceIssue = 0;
  let advanceAfterEdit = false;
  let updatedPoints = new Set();
  let state = 'idle', mode = 'new', step = 0, round = 0, sequence = 0, timer = null, thoughtTimer = null, toastTimer = null;
  let runStartedAt = 0;
  const thoughtCollapseTimers = new Set();
  const analysisTimers = new Set();
  let analysis = null, analysisToken = 0, reviewFocus = null;
  const analysisStages = [
    {
      preparing: '正在结合岗位目标通读教育背景、项目经历与专业技能，确定需要重点分析的内容。',
      reading: '校园项目能体现需求判断、协作分工与结果验证。现在定位项目经历，逐条核对原文。',
      checking: '正在核对经历的结构，区分需求、个人职责和项目结果。',
      concluded: '已定位项目背景。接下来逐条核对需求依据、个人贡献和结果验证。',
      label: '项目结构'
    },
    {
      reading: '正在阅读需求描述，定位调研和功能设计的表述。',
      checking: '正在核对是否交代用户痛点、需求优先级和方案取舍。',
      concluded: '需求部分只写了参与调研，缺少用户痛点、优先级与方案取舍的依据。',
      label: '需求表达'
    },
    {
      reading: '正在阅读职责描述，梳理调研、设计、开发和推广的分工。',
      checking: '正在核对独立负责的工作、具体交付物与团队协作的边界。',
      concluded: '个人职责和团队分工混在一起，需要写清独立负责的工作、交付物与协作方式。',
      label: '个人贡献'
    },
    {
      reading: '正在阅读项目结果，定位用户评价和服务规模的表述。',
      checking: '正在核对结果是否有数据或反馈依据，并回看整段经历的表达结构。',
      concluded: '结果缺少可追溯的验证记录；整段经历也需要减少泛化表达、突出重点。已整理出四个问题。',
      label: '结果与表达'
    }
  ];
  let queue = [], adopted = [], currentRun = null, thinking = null, thought = null, tool = null, autoFollow = true;
  const icon = name => {
    const i = document.createElement('i');
    i.dataset.icon = name; i.setAttribute('aria-hidden', 'true');
    i.style.setProperty('--icon', `url("${window.UPCV_ICONS[name]}")`); return i;
  };
  document.querySelectorAll('[data-icon]').forEach(i => {
    i.style.setProperty('--icon', `url("${window.UPCV_ICONS[i.dataset.icon]}")`); i.setAttribute('aria-hidden', 'true');
  });
  function element(tag, text = '', className = '') {
    const el = document.createElement(tag); el.textContent = text; el.className = className; return el;
  }
  function artwork(name) {
    const svg = $('art-' + name).content.firstElementChild.cloneNode(true);
    svg.setAttribute('aria-hidden', 'true'); return svg;
  }
  function toast(text) {
    clearTimeout(toastTimer); $('toast').textContent = text; $('toast').hidden = false;
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3500);
  }
  function menu(open) { $('demo-menu').hidden = !open; $('demo-settings').setAttribute('aria-expanded', String(open)); }
  function follow(force = false) {
    if (force || autoFollow) requestAnimationFrame(() => { $('scroll-area').scrollTop = $('scroll-area').scrollHeight; });
  }
  $('scroll-area').addEventListener('scroll', () => {
    const el = $('scroll-area'); autoFollow = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  });
  function compactComposer() { return window.innerWidth <= 760 && $('app').classList.contains('has-preview'); }
  function resizeInput() {
    // The mobile workspace reserves its height for the resume. Long drafts
    // remain scrollable inside one line instead of growing the chat panel.
    if (compactComposer()) { $('input').style.height = '44px'; return; }
    $('input').style.height = 'auto'; $('input').style.height = Math.min(Math.max($('input').scrollHeight, 80.75), 256) + 'px';
  }
  function finishComposerAction() { if (compactComposer()) $('input').blur(); else $('input').focus(); }
  function setInput(text) {
    // Restored drafts may contain several queued messages; preserve them in full.
    $('input').maxLength = Math.max(1000, text.length); $('input').value = text; resizeInput();
  }
  function render() {
    const running = state === 'running', steering = running && mode === 'new';
    const hasText = !!$('input').value.trim(), showStop = running && (!steering || !hasText);
    $('welcome').hidden = state !== 'idle'; $('scroll-area').hidden = state === 'idle';
    $('stop').hidden = !showStop; $('send').hidden = showStop;
    $('send').disabled = !hasText;
    $('send').setAttribute('aria-label', '发送'); $('send').title = '发送';
    $('input').disabled = running && mode === 'old';
    $('input').placeholder = running || state === 'idle' ? '告诉 UP AI 你的需求...' : '继续告诉 UP AI 你的需求...';
    $('advance').disabled = !running;
    $('mode-new').setAttribute('aria-pressed', String(mode === 'new')); $('mode-old').setAttribute('aria-pressed', String(mode === 'old'));
    document.querySelectorAll('.composer-shortcuts button,.send-actions [data-unavailable]').forEach(b => { b.disabled = running; });
    $('app').dataset.state = state; $('app').dataset.step = String(step); $('app').dataset.round = String(round);
    $('app').dataset.mode = mode;
    $('app').dataset.taskType = taskType;
    document.querySelectorAll('.revision-picker').forEach(form => form.dispatchEvent(new Event('agentstatechange')));
  }
  function renderQueue() {
    $('queued').replaceChildren(); $('queued').hidden = queue.length === 0;
    for (const q of queue) {
      const row = element('div', '', 'queue-item'); row.dataset.guideId = q.id;
      const copy = element('div', q.source?.label || q.text, 'queue-text'); copy.title = q.text;
      const actions = element('div', '', 'queue-actions');
      const steer = element('button', '', 'queue-action queue-steer'); steer.type = 'button';
      steer.title = '立即引导当前任务'; steer.setAttribute('aria-label', `立即引导：${q.source?.label || q.text}`);
      steer.disabled = !canSteer(q);
      if (steer.disabled) steer.title = '这是另一个场景，将在当前任务结束后开始';
      steer.append(artwork('steer')); steer.onclick = () => steerMessage(q.id);
      const cancel = element('button', '', 'queue-action queue-delete'); cancel.type = 'button';
      cancel.title = '删除待发送消息'; cancel.setAttribute('aria-label', `删除待发送消息：${q.source?.label || q.text}`); cancel.append(artwork('trash'));
      cancel.onclick = () => {
        queue = queue.filter(item => item.id !== q.id);
        q.source?.setStatus('draft');
        renderQueue(); render(); $('input').focus();
      };
      actions.append(steer, cancel); row.append(copy, actions); $('queued').append(row);
    }
  }
  function showError(text) { $('error').textContent = text; $('error').hidden = !text; }
  function addUser(text) {
    const row = element('div', '', 'message user'), bubble = element('div', '', 'user-bubble');
    bubble.append(element('div', text, 'user-text')); row.append(bubble); $('messages').append(row);
  }
  function queueMessage(text, source = null) {
    queue.push({ id: ++sequence, text, source }); source?.setStatus('queued'); renderQueue(); render();
  }
  function canSteer(item) {
    if (!item.source) return true;
    const requested = item.source.scenario || 'resume';
    return requested === (scenarioRun?.key || 'resume');
  }
  function scenarioSource(key, context = {}) {
    if (key !== 'resume' && !window.XiaoyouScenarios?.keys.includes(key)) return null;
    const careerStore = window.XiaoyouCareerStore;
    const explicitIds = context.jobIds || context.ids || (context.job?.id ? [context.job.id] : []);
    if (careerStore && Array.isArray(explicitIds) && explicitIds.some(id => !careerStore.getJob(id))) {
      toast('职位资料已失效，请从发现职位重新选择。'); return null;
    }
    const description = key === 'resume' ? { title: '改简历工作流', prompt: context.job ? `针对${context.job.company || ''}的${context.job.title || '目标职位'}分析并优化简历。` : exampleTask } : window.XiaoyouScenarios?.describe(key);
    if (!description) return null;
    return { scenario: key, intent: key === 'resume' ? 'analysis' : 'scenario', label: description.title, text: description.prompt, context, setStatus() {} };
  }
  function sourceFromText(text) {
    if (!window.XiaoyouScenarios) return null;
    const key = /批量.*(?:筛选|评估)|插件.*筛选/.test(text) ? 'screen' : /填写.*网申|自动.*网申|网申.*(?:填写|填表)/.test(text) ? 'apply' : /找(?:工作|职位)|搜.*(?:职位|校招)|推荐.*(?:职位|工作)/.test(text) ? 'jobs' : null;
    return key ? scenarioSource(key, { instruction: text }) : null;
  }
  function launchScenario(key, context = {}) {
    const source = scenarioSource(key, context); if (!source) return;
    if (state === 'running') queueMessage(source.text, source); else begin(source.text, source);
  }
  function addGuide(id, text) {
    const message = element('div', '', 'steering-message message user applied');
    message.dataset.guideId = id;
    const receipt = element('div', '已引导', 'receipt');
    const body = element('div', '', 'guide-body');
    const bubble = element('div', '', 'user-bubble'); bubble.append(element('div', text, 'user-text'));
    body.append(bubble, receipt); message.append(body);
    $('messages').insertBefore(message, thinking);
    follow(true);
  }
  function flags() {
    const all = adopted.map(g => g.text).join(' ');
    const style = revisionPlan.find(choice => choice.issue === 3);
    return { data: /数据分析|SQL|漏斗/.test(all), short: style && style.selection < 3 ? style.selection === 0 : /一页|精简|简洁/.test(all), natural: style && style.selection < 3 ? style.selection === 1 : /套话|自然|口语/.test(all) };
  }
  function generatedPoints() {
    const f = flags();
    const points = f.natural ? [
      '访谈同学，整理校园二手交易中信息难找、沟通成本高的问题。',
      f.data ? '用 SQL 整理浏览、咨询和交易数据，分析转化漏斗，找出用户流失的环节。' : '把需求整理成交易流程和页面原型，与团队一起确认实现方案。',
      '根据同学们的反馈改进原型，记录每次调整的原因。'
    ] : [
      '围绕校园二手交易场景开展用户访谈，归纳需求与使用痛点，明确产品优先级。',
      f.data ? '建立浏览—咨询—交易转化漏斗，使用 SQL 分析关键环节，形成产品迭代建议。' : '设计核心交易流程与交互原型，协同团队推进需求评审和方案验证。',
      '结合用户反馈迭代产品方案，沉淀需求文档与验证记录。'
    ];
    const alternatives = [
      [
        '从校园二手交易访谈中归纳信息难找、沟通成本高等痛点，据此确定产品的核心使用场景。',
        '结合需求出现频次与用户影响排列优先级，先完善信息发布与检索流程，记录暂缓需求及判断依据。',
        '对比信息流与分类检索方案的使用成本，选择适合校园交易的流程，并通过原型反馈验证方案取舍。'
      ],
      [
        '用 SQL 梳理浏览、咨询与交易的转化口径，结合实际记录验证方案调整，不使用缺少依据的增长结论。',
        '收集访谈与原型使用反馈，按具体问题整理验证记录，说明哪些体验得到改善、哪些仍需迭代。',
        '按发现问题、提出调整和验证结果整理迭代记录，以可追溯的反馈说明项目成果。'
      ],
      [
        '独立整理需求并设计交易流程原型，与开发协作确认实现边界，明确个人交付与团队分工。',
        '输出需求文档、核心页面原型与验收清单，说明各项交付如何支持方案评审和开发落地。',
        '与设计、开发对齐需求和验收标准，记录方案分歧与取舍，推动核心交易流程落地。'
      ]
    ];
    const naturalAlternatives = [
      [
        '访谈同学后，发现二手交易中信息难找、沟通费时，先围绕这些问题确定产品要解决的场景。',
        '按需求出现的次数和影响范围排优先级，先做好发布和搜索，记录哪些需求暂缓、为什么暂缓。',
        '比较信息流和分类搜索的使用成本，选择适合校园交易的流程，再用原型反馈检查这个选择。'
      ],
      [
        '用 SQL 整理浏览、咨询和交易数据，统一转化口径，再根据实际记录判断调整是否有效。',
        '收集同学的访谈和试用反馈，记录哪些问题解决了、哪些还需要继续改。',
        '把每次发现的问题、做出的调整和后续反馈记下来，用这些记录说明项目的改进。'
      ],
      [
        '独立整理需求、画出交易流程原型，再和开发确认能做什么，写清自己负责和共同完成的部分。',
        '整理需求文档、页面原型和验收清单，让团队知道要做什么、怎么做、做到什么程度。',
        '和设计、开发一起确认需求与验收标准，记录分歧和最终选择，推动交易流程落地。'
      ]
    ];
    revisionPlan.forEach(choice => {
      const point = [0, 2, 1][choice.issue];
      if (point !== undefined && choice.selection < 3) points[point] = (f.natural ? naturalAlternatives : alternatives)[choice.issue][choice.selection];
    });
    if (revisionPlan.some(choice => choice.issue === 3 && choice.selection === 2)) {
      points[0] = '背景与任务：围绕校园二手交易中的需求问题，' + points[0];
      points[1] = '行动：' + points[1]; points[2] = '结果与验证：' + points[2];
    }
    return points;
  }
  function isPreparingAnalysis() {
    return state === 'running' && taskType === 'analysis' && analysis?.phase === 'preparing';
  }
  function updatePreview() {
    if (scenarioRun) {
      $('resume-paper').querySelectorAll('[data-ai-pending],[data-ai-pulse]').forEach(node => { delete node.dataset.aiPending; delete node.dataset.aiPulse; });
      const status = state === 'stopped' ? `${scenarioRun.title}已停止` : state === 'done' ? `${scenarioRun.title}已完成` : scenarioRun.status(step);
      $('resume-status').textContent = status;
      const label = thinking?.querySelector('.original-thinking-label');
      if (label) { label.textContent = status; thinking.setAttribute('aria-label', status); }
      Object.assign($('preview').dataset, { state, step: String(step), round: String(round), taskType, analysisPhase: 'idle', editPhase: 'idle' });
      scenarioRun.update(step, state);
      return;
    }
    let list = $('resume-text').querySelector('ul');
    if (!list) {
      list = element('ul', '', 'resume-project-points');
      for (let i = 0; i < 3; i++) {
        const line = element('li'); line.dataset.resumePoint = String(i); list.append(line);
      }
      $('resume-text').replaceChildren(list);
    }
    const preparing = isPreparingAnalysis();
    const active = state === 'running' && activeEdit ? activeEdit.index : -1;
    const editing = state === 'running' && taskType === 'edit';
    const editingPoint = editing && step > 0 ? (active >= 0 ? active : resumeCompact ? 0 : Math.min(step - 1, 2)) : -1;
    const reading = taskType === 'analysis' && state === 'running' && !preparing && step > 0 ? (resumeCompact ? 0 : Math.min(step - 1, 2)) : -1;
    const previousReading = list.querySelector('.is-reading')?.dataset.resumePoint;
    [...list.children].forEach((line, index) => {
      const text = activeEdit?.index === index ? activeEdit.text : resumePoints[index];
      if (line.textContent !== text || line.childElementCount) line.textContent = text;
      line.hidden = resumeCompact && index > 0;
      line.classList.toggle('is-current', index === active);
      line.classList.toggle('is-reading', index === reading);
      if (index === reading || index === editingPoint) line.setAttribute('aria-current', 'step'); else line.removeAttribute('aria-current');
      if(index === reading || index === editingPoint) line.dataset.aiPending='true';else delete line.dataset.aiPending;
      line.classList.toggle('was-updated', updatedPoints.has(index));
      line.classList.toggle('is-selecting', active === index && activeEdit.phase === 'selecting');
      line.classList.toggle('is-writing', active === index && ['deleting', 'writing'].includes(activeEdit.phase));
      line.style.minHeight = active === index && activeEdit.height ? `${activeEdit.height}px` : '';
    });
    const projectSection = $('preview').querySelector('.resume-project');
    const projectHeading = projectSection?.querySelector('.resume-item-head');
    if(projectSection) { if(editing && step === 0) projectSection.dataset.aiPending='true';else delete projectSection.dataset.aiPending; }
    if(projectHeading) { if(state === 'running' && taskType === 'analysis' && step === 0 && !preparing) projectHeading.dataset.aiPending='true';else delete projectHeading.dataset.aiPending; }
    $('resume-text').querySelectorAll('[data-ai-pulse]').forEach(node => delete node.dataset.aiPulse);
    delete $('resume-text').dataset.aiPulse;
    const reviewTarget = reviewResumeTarget();
    if (reviewTarget) reviewTarget.dataset.aiPulse = 'true';
    if (reviewTarget) $('preview').dataset.reviewIssue = String(reviewFocus.issue); else delete $('preview').dataset.reviewIssue;
    const editStatus = activeEdit ? `${activeEdit.phase === 'selecting' ? '正在选中' : activeEdit.phase === 'deleting' ? '正在删除原文 · ' : '正在写入 · '}${activeEdit.compact ? '精简项目经历' : `第 ${activeEdit.index + 1} 段`}` : step === 0 ? '正在定位项目经历' : '当前段落已核对，准备下一步';
    const analysisStatus = preparing ? '正在分析简历结构与岗位匹配' : analysis ? `${analysis.phase === 'reading' ? '正在阅读' : analysis.phase === 'checking' ? '正在核对' : '已完成核对 · '}${analysisStages[step].label}` : stages[step];
    const status = state === 'idle' ? '简历预览' : state === 'done' ? (taskType === 'analysis' ? '分析完成，等待选择修改建议' : updatedPoints.size ? '本轮修改已完成' : '内容符合要求，无需重复修改') : state === 'stopped' ? (taskType === 'analysis' ? '分析已停止，简历未改动' : '已停止，保留当前修改') : taskType === 'analysis' ? analysisStatus : editStatus;
    $('resume-status').textContent = status;
    const thinkingLabel = thinking?.querySelector('.original-thinking-label');
    if (thinkingLabel && state === 'running') { thinkingLabel.textContent = status; thinking.setAttribute('aria-label', status); }
    const location = taskType === 'analysis' ? (reading >= 0 ? `正在阅读第 ${reading + 1} 条` : state === 'done' ? '分析完成' : '阅读项目背景') : activeEdit ? (activeEdit.compact ? '精简表达' : `第 ${activeEdit.index + 1} 段`) : state === 'done' ? '已完成' : '待修改';
    $('resume-location').textContent = state === 'idle' ? '产品经理 · 校招' : preparing ? '通读简历 · 确定分析重点' : `项目经历 · ${state === 'stopped' ? '已停止' : location}`;
    $('preview').dataset.state = state; $('preview').dataset.step = String(step); $('preview').dataset.round = String(round);
    $('preview').dataset.taskType = taskType; $('preview').dataset.editPhase = activeEdit?.phase || 'idle';
    $('preview').dataset.analysisPhase = analysis?.phase || 'idle';
    $('resume-guidance').hidden = adopted.length === 0;
    $('resume-guidance').textContent = adopted.length ? '已纳入补充要求 · ' + adopted[adopted.length - 1].text : '';
    $('resume-guidance').title = adopted.map(g => g.text).join('\n');
    $('preview-notice').textContent = round ? `第 ${round} 轮${taskType === 'analysis' ? '分析' : '修订'}${resumeCompact ? ' · 一页精简版' : ''} · 示例简历` : '示例简历，不包含你的个人资料。';
    updateResumeJourney();
    if (reading >= 0 && previousReading !== String(reading)) revealResumeTarget();
  }
  function reviewResumeTarget() {
    if (state === 'running' || !reviewFocus?.owner.isConnected) return null;
    if (reviewFocus.issue === 3) return $('resume-text');
    const point = resumeCompact ? 0 : [0, 2, 1][reviewFocus.issue];
    return $('resume-text').querySelector(`[data-resume-point="${point}"]`);
  }
  function focusRevisionIssue(owner, issue) {
    // Active execution owns the reading/editing highlight, even when old cards are browsed.
    if (state === 'running' || scenarioRun || !owner.isConnected || (owner.dataset.resumeRound && Number(owner.dataset.resumeRound) !== round)) return;
    reviewFocus = { owner, issue }; updatePreview(); revealResumeTarget();
  }
  function revealResumeTarget() {
    if (scenarioRun) return;
    const currentRound = round, currentStep = step, currentReview = reviewFocus;
    requestAnimationFrame(() => {
      if ($('preview').hidden || currentRound !== round || currentStep !== step || currentReview !== reviewFocus || isPreparingAnalysis()) return;
      const scroller = $('preview').querySelector('.preview-scroll');
      let target = state === 'running' ? taskType === 'edit' ? $('resume-text').querySelector('[data-ai-pending="true"]') || $('preview').querySelector('.resume-project') : $('resume-text').querySelector('.is-reading') || $('preview').querySelector('.resume-project .resume-item-head') : reviewResumeTarget();
      if (!scroller.clientHeight || !target) return;
      const viewport = scroller.getBoundingClientRect();
      const toolbarHeight = $('preview').querySelector('.resume-toolbar')?.getBoundingClientRect().height || 0;
      // Locate the section before editing; each write then follows only its own paragraph.
      if (state === 'running' && taskType === 'edit' && step === 0 && target.getBoundingClientRect().height > viewport.height - toolbarHeight - 40) {
        target = target.querySelector('h2');
      }
      const rect = target.getBoundingClientRect();
      let top = scroller.scrollTop;
      if (rect.height > viewport.height - toolbarHeight - 40 || rect.top < viewport.top + toolbarHeight + 16) top += rect.top - viewport.top - toolbarHeight - 16;
      else if (rect.bottom > viewport.bottom - 24) top += rect.bottom - viewport.bottom + 24;
      if (top !== scroller.scrollTop) scroller.scrollTo({top:Math.max(0,top),behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    });
  }
  function cancelAnalysis() {
    analysisTimers.forEach(clearTimeout); analysisTimers.clear(); analysisToken++; analysis = null;
  }
  function syncAnalysisNote() {
    if (!analysis || !thought) return;
    if (!analysis.note) {
      analysis.note = element('p', '', 'analysis-note'); analysis.note.dataset.step = String(analysis.step);
      thought.copy.append(analysis.note);
    }
    analysis.note.dataset.phase = analysis.phase;
    analysis.note.textContent = analysisStages[analysis.step][analysis.phase];
  }
  function setAnalysisPhase(phase) {
    if (!analysis || state !== 'running' || taskType !== 'analysis') return;
    const wasPreparing = isPreparingAnalysis();
    analysis.phase = phase; showThought(); syncAnalysisNote(); updatePreview(); follow();
    if (wasPreparing && phase === 'reading') revealResumeTarget();
  }
  function startAnalysis() {
    cancelAnalysis();
    const current = { round, step, phase: step === 0 ? 'preparing' : 'reading', note: null, token: analysisToken };
    analysis = current; syncAnalysisNote();
    // Establish the analysis focus before locating a section; later steps read and check each point.
    const phases = step === 0 ? [[3600, 'reading'], [5400, 'checking'], [7200, 'concluded']] : [[2400, 'checking'], [6500, 'concluded']];
    for (const [delay, phase] of phases) {
      const id = setTimeout(() => {
        analysisTimers.delete(id);
        if (analysis !== current || analysisToken !== current.token || round !== current.round || step !== current.step) return;
        setAnalysisPhase(phase);
      }, delay);
      analysisTimers.add(id);
    }
  }
  function classifyTask(text, source) {
    if (source?.intent) return source.intent;
    if (/按.*(?:建议|选择)|直接(?:修改|改写|重写|润色|精简)|修改(?:简历|经历|第)|帮我改|改一下/.test(text)) return 'edit';
    if (/诊断|分析|检查|核对|问题|建议/.test(text)) return 'analysis';
    return /修改|改写|重写|精简|润色/.test(text) || (round > 0 && /继续|优化|完善|自然|套话/.test(text)) ? 'edit' : 'analysis';
  }
  function createResumeJourney(source) {
    targetJob = source?.context?.job || source?.targetJob || window.XiaoyouCareerStore?.getJob('pine-pm') || null;
    requestedEvidenceIssue = Number.isInteger(source?.context?.evidenceIssue) ? Math.max(0, Math.min(3, source.context.evidenceIssue)) : 0;
    resumeJourney = source?.journey?.element.isConnected ? source.journey : window.XiaoyouScenarios?.createJourney({
      title: '改简历工作流',
      steps: [
        { title: '理解目标与简历', tools: ['读取简历', '读取职位要求'], description: '先通读简历，明确目标岗位与当前经历。' },
        { title: '定位问题与证据缺口', tools: ['分析简历', '评估职位匹配'], description: '逐条核对需求判断、个人贡献、结果依据和表达重点。' },
        { title: '选择修改方向', tools: ['修改建议卡', '补充信息'], description: '四个问题分别选择方向，也可以输入自己的要求。确认后才修改正文。' },
        { title: '逐条改写与复核', tools: ['编辑简历', '预览简历'], description: '右侧逐条改写，核对采纳的方向与仍需补充的事实。' }
      ]
    }) || null;
    if (resumeJourney) {
      resumeJourney.element.dataset.resumeJourney = String(round);
      $('messages').insertBefore(resumeJourney.element, thinking);
    }
    window.XiaoyouTargetJob?.open(targetJob);
  }
  function updateResumeJourney() {
    if (!resumeJourney) return;
    const index = taskType === 'edit' ? 3 : state === 'done' ? 2 : step === 0 ? 0 : 1;
    resumeJourney.update(index, state === 'done' && taskType === 'analysis' ? 'waiting' : state);
    const journey = resumeJourney;
    const inspect = kind => () => inspectResumeArtifact(journey, kind);
    if (taskType === 'analysis') {
      const observed = state === 'done' ? 3 : Math.max(0, Math.min(3, step - 1 + (analysis?.phase === 'concluded' ? 1 : 0)));
      if (state !== 'stopped') journey.checkedPoints = observed;
      const checked = state === 'stopped' ? journey.checkedPoints || 0 : observed;
      journey.setStageResult?.(0, step > 0 || state === 'done' ? {
        summary: targetJob ? `目标：${targetJob.company} · ${targetJob.title}` : '已明确产品经理校招方向，重点核对校园项目。',
        actionLabel: state === 'done' ? '查看岗位与原文依据' : '', onInspect: inspect('evidence')
      } : { summary: '' });
      journey.setStageResult?.(1, { summary: state === 'done' ? '已核对3段原文，整理出4个问题，正文尚未改动。' : checked ? `已核对${checked} / 3段项目原文，${state === 'stopped' ? '分析已停止，保留当前记录。' : '正在整理证据缺口。'}` : '',
        actionLabel: state === 'done' ? '查看问题与建议' : '', onInspect: inspect('suggestions') });
    }
    if (taskType === 'edit') journey.setStageResult?.(3, {
      summary: state === 'done' ? updatedPoints.size ? `已更新${updatedPoints.size}段正文，保留待补事实供复核。` : '已核对正文，本轮无需重复修改。' : updatedPoints.size ? `已更新${updatedPoints.size}段正文，继续处理剩余内容。` : '',
      actionLabel: state === 'done' ? '查看修改清单' : '', onInspect: inspect('changes')
    });
  }
  function inspectResumeArtifact(journey, kind) {
    if (state === 'running' || scenarioRun || journey !== resumeJourney) { toast('请完成当前任务后，在对应的简历结果中查看。'); return; }
    const result = kind === 'changes' ? journey.resultElement : journey.reviewElement;
    if (!result?.isConnected) return;
    const target = kind === 'evidence' ? result.querySelector('.resume-evidence') : kind === 'suggestions' ? result.querySelector('.suggestion-carousel') : result;
    if (target?.tagName === 'DETAILS') target.open = true;
    target?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
    if (kind === 'suggestions') { result.dispatchEvent(new Event('focusresume')); preview(true); }
  }
  function resumeEvidence(onReview) {
    const details = element('details', '', 'resume-evidence');
    details.append(element('summary', '岗位要求与简历证据'));
    details.append(element('p', targetJob ? `目标：${targetJob.company || ''} · ${targetJob.title || '产品经理'}` : '目标：产品经理校招 · 示例岗位', 'resume-evidence-context'));
    if (targetJob?.duties) details.append(element('p', `工作职责：${targetJob.duties}`, 'resume-evidence-context'));
    if (targetJob?.requirements) details.append(element('p', `岗位要求：${targetJob.requirements}`, 'resume-evidence-context'));
    if (targetJob?.gap) details.append(element('p', `当前差距：${targetJob.gap}`, 'resume-evidence-context'));
    const table = element('table'), head = element('thead'), heading = element('tr');
    ['岗位关注点', '简历中的依据', '需要补充'].forEach(text => heading.append(element('th', text))); head.append(heading);
    const body = element('tbody');
    const rows = [
      { issue: 0, values: ['需求分析', resumePoints[0], '用户痛点、需求优先级与方案取舍依据'] },
      { issue: 2, values: ['个人交付与协作', resumePoints[1], '独立负责的范围、交付物与协作边界'] },
      { issue: 1, values: ['效果验证', resumePoints[2], '可追溯的用户反馈或指标记录'] }
    ];
    rows.forEach(({ issue, values }) => {
      const row = element('tr'); row.dataset.evidenceIssue = String(issue);
      values.forEach(text => row.append(element('td', text)));
      const inspect = element('button', '查看问题并定位原文', 'resume-evidence-action'); inspect.type = 'button';
      inspect.setAttribute('aria-label', `查看${values[0]}问题并定位原文`);
      inspect.onclick = () => onReview?.(issue);
      row.lastElementChild.append(inspect); body.append(row);
    });
    table.append(head, body); details.append(table);
    details.append(element('p', '保留完整原文与判断依据；缺少的数据由你补充，不生成未经确认的数值。', 'resume-evidence-context'));
    return details;
  }
  function editResult() {
    const result = element('section', '', 'resume-edit-result');
    const resultRound = round;
    result.dataset.resumeRound = String(resultRound);
    if (resumeJourney) resumeJourney.resultElement = result;
    result.append(element('p', updatedPoints.size ? '已按所选建议更新简历。' : '已核对简历，内容已符合本轮要求。', 'resume-edit-summary'));
    if (updatedPoints.size) {
      const list = element('ul');
      ['需求表达', '个人贡献', '结果依据'].forEach((label, index) => {
        if (!updatedPoints.has(index)) return;
        const issue = [0, 2, 1][index], choice = revisionPlan.find(entry => entry.issue === issue);
        const item = element('li'); item.dataset.editedPoint = String(index);
        item.append(element('strong', label));
        item.append(element('p', choice ? `本次方向：${choice.instruction}` : ['明确需求判断和方案依据。', '写清个人职责与协作边界。', '保留可追溯的结果与验证依据。'][index], 'resume-change-purpose'));
        item.append(element('span', resumePoints[index]));
        const locate = element('button', `定位第${index + 1}段`, 'resume-evidence-action'); locate.type = 'button';
        locate.onclick = () => {
          if (state === 'running' || scenarioRun || resultRound !== round) { toast('请在本轮简历结果中查看对应正文。'); return; }
          focusRevisionIssue(result, issue); preview(true);
        };
        item.append(locate); list.append(item);
      });
      result.append(list);
    }
    const remaining = element('details'); remaining.append(element('summary', '仍需补充的事实'), element('p', '请补充真实访谈记录、独立交付物以及可验证的结果。当前示例不代替事实核实；补充内容后可以继续引导修改。'));
    result.append(remaining); return result;
  }
  function editNote(index, text, status) {
    showThought();
    const note = element('p', text, 'resume-edit-note');
    note.dataset.index = String(index); note.dataset.status = status;
    thought.copy.append(note); return note;
  }
  function cancelEdits(reason = '修改已停止，已保留当前内容。') {
    clearTimeout(editTimer); editTimer = null; editToken++;
    if (activeEdit) {
      activeEdit.note.textContent = reason; activeEdit.note.dataset.status = 'stopped';
    }
    activeEdit = null; editQueue = []; editPlanKey = '';
  }
  function completeEdit() {
    const edit = activeEdit; if (!edit) return;
    clearTimeout(editTimer); editTimer = null;
    resumePoints[edit.index] = edit.target;
    if (edit.compact) resumeCompact = true;
    if (edit.expand) resumeCompact = false;
    updatedPoints.add(edit.index);
    edit.note.textContent = edit.compact ? '已精简右侧项目经历。' : `已修改右侧第 ${edit.index + 1} 段。`;
    edit.note.dataset.status = 'done';
    activeEdit = null; updatePreview(); startNextEdit();
    if (!activeEdit && !editQueue.length && advanceAfterEdit && state === 'running') { advanceAfterEdit = false; advance(); }
  }
  function startNextEdit() {
    if (activeEdit || !editQueue.length || state !== 'running' || taskType !== 'edit') return;
    const spec = editQueue.shift();
    if (resumePoints[spec.index] === spec.target && (!spec.compact || resumeCompact)) {
      editNote(spec.index, `第 ${spec.index + 1} 段已符合所选要求，无需修改。`, 'unchanged');
      startNextEdit(); return;
    }
    const edit = { ...spec, text: resumePoints[spec.index], phase: 'selecting', token: ++editToken,
      height: $('resume-text').querySelector(`[data-resume-point="${spec.index}"]`).getBoundingClientRect().height,
      note: editNote(spec.index, spec.compact ? '正在精简右侧项目经历…' : `正在改写右侧第 ${spec.index + 1} 段…`, 'editing') };
    activeEdit = edit; updatePreview(); revealResumeTarget();
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { completeEdit(); return; }
    const tick = () => {
      if (state !== 'running' || activeEdit !== edit || edit.token !== editToken) return;
      if (edit.phase === 'selecting') edit.phase = 'deleting';
      if (edit.phase === 'deleting') {
        edit.text = Array.from(edit.text).slice(0, -2).join('');
        if (!edit.text) edit.phase = 'writing';
      } else {
        edit.text = Array.from(edit.target).slice(0, Array.from(edit.text).length + 2).join('');
      }
      resumePoints[edit.index] = edit.text;
      updatePreview(); revealResumeTarget();
      if (edit.phase === 'writing' && edit.text === edit.target) { completeEdit(); return; }
      editTimer = setTimeout(tick, edit.phase === 'deleting' ? 26 : 55);
    };
    editTimer = setTimeout(tick, 480);
  }
  function reconcileEdits() {
    if (taskType !== 'edit' || state !== 'running' || step === 0) { updatePreview(); return; }
    const target = generatedPoints();
    const compact = (resumeCompact && !(step >= 3 && !flags().short)) || (step >= 3 && flags().short);
    const specs = compact
      ? [{ index: 0, target: target.slice(0, 2).join(''), compact: true }]
      : target.slice(0, Math.min(step, 3)).map((text, index) => ({ index, target: text, compact: false, expand: resumeCompact && index === 0 }));
    const key = JSON.stringify(specs);
    if (key === editPlanKey) { updatePreview(); return; }
    cancelEdits('已收到补充要求，正在调整当前改写。'); editPlanKey = key;
    editQueue = specs.filter(spec => resumePoints[spec.index] !== spec.target || (spec.compact && !resumeCompact));
    if (!editQueue.length) {
      const last = specs[specs.length - 1];
      editNote(last.index, `第 ${last.index + 1} 段已符合所选要求，无需修改。`, 'unchanged');
    }
    startNextEdit(); updatePreview();
    if (!activeEdit && !editQueue.length && advanceAfterEdit) { advanceAfterEdit = false; advance(); }
  }
  function flushEdits() {
    // The demo's manual next-step control fast-forwards only the current write.
    while (activeEdit) completeEdit();
    editPlanKey = '';
  }
  function steerMessage(id) {
    if (state !== 'running') return;
    const q = queue.find(item => item.id === id); if (!q) return;
    if (!canSteer(q)) { toast('该场景已排队，将在当前任务结束后开始。'); return; }
    queue = queue.filter(item => item.id !== id);
    q.source?.setStatus('steered');
    if (q.source?.plan) revisionPlan = q.source.plan;
    adopted.push({ id: q.id, text: q.text }); addGuide(q.id, q.text);
    scenarioRun?.guide(q.text, q.source?.context);
    renderQueue(); reconcileEdits(); render();
    if (thought) thought.copy.append(element('p', '已收到补充要求，将继续按新要求完成当前任务。'));
    finishComposerAction();
  }
  function schedule() {
    clearTimeout(timer); const scheduledRound = round;
    const scheduledTimer = setTimeout(() => {
      if (timer !== scheduledTimer || round !== scheduledRound || state !== 'running') return;
      if (activeEdit) advanceAfterEdit = true; else advance();
    }, scenarioRun ? scenarioRun.duration?.(step) || 3600 : 9000);
    timer = scheduledTimer;
  }
  function updateThinking() {
    if (thinking) thinking.remove();
    thinking = element('div', '', 'original-thinking');
    thinking.setAttribute('role', 'status'); thinking.setAttribute('aria-label', '正在思考');
    thinking.dataset.testid = 'agent-thinking-indicator';
    const image = $('thinking-art').content.firstElementChild.cloneNode(true);
    if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) image.querySelectorAll('animateTransform').forEach(node=>node.remove());
    const gradient = image.querySelector('linearGradient'); gradient.id = `demo-thinking-${round}`;
    image.querySelectorAll('path').forEach(path => path.setAttribute('fill', `url(#${gradient.id})`));
    const label = element('span', '正在思考', 'up-thinking-label original-thinking-label');
    const dots = element('span', '', 'thinking-dots'); dots.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 3; i++) { const dot = element('span', '', 'up-thinking-dot'); dot.style.animationDelay = `${i * .15}s`; dots.append(dot); }
    thinking.append(image, label, dots); $('messages').append(thinking);
  }
  function responseRow() {
    const row = element('div', '', 'assistant-turn'); row.dataset.run = String(round);
    const content = element('div', '', 'assistant-content'); row.append(content);
    $('messages').insertBefore(row, thinking); return content;
  }
  function showThought() {
    if (state !== 'running' || thought || scenarioRun) return;
    if (!currentRun) currentRun = responseRow();
    const wrapper = element('div', '', 'thought');
    const button = element('button', '', 'thought-toggle'); button.type = 'button';
    const label = element('span', 'Thinking'), pulse = element('span','','thought-live-dot'); pulse.setAttribute('aria-hidden','true'); button.append(label, pulse, artwork('caret-down'));
    const panel = element('div', '', 'thought-panel'); panel.id = `thought-${round}`;
    const copy = element('div', '', 'thought-copy');
    copy.append(element('p', taskType === 'analysis' ? '先理解你的要求并通读简历，确定分析重点，再逐条核对并整理修改建议。' : '按你选择的建议改写右侧简历，逐段核对并更新。'));
    panel.append(copy); button.setAttribute('aria-controls', panel.id);
    const followThought = () => { if (!panel.hidden) requestAnimationFrame(() => { copy.scrollTop = copy.scrollHeight; }); };
    const toggle = open => { panel.hidden = !open; button.setAttribute('aria-expanded', String(open)); followThought(); };
    const record = { wrapper, label, copy, toggle, pulse, manual:false };
    toggle(true); button.onclick = () => { record.manual = true; toggle(panel.hidden); };
    wrapper.append(button, panel); currentRun.prepend(wrapper);
    thought = record;
    syncAnalysisNote();
    new MutationObserver(followThought).observe(copy,{childList:true,subtree:true,characterData:true});
    follow();
  }
  function finishThought() {
    if(!thought)return;
    const finished = thought;
    finished.label.textContent = `Thought for ${Math.max(0,Math.floor((Date.now()-runStartedAt)/1000))}s`;
    finished.pulse.hidden = true;
    if(finished.collapseTimer) { clearTimeout(finished.collapseTimer); thoughtCollapseTimers.delete(finished.collapseTimer); }
    finished.collapseTimer = setTimeout(()=>{thoughtCollapseTimers.delete(finished.collapseTimer);if(!finished.manual)finished.toggle(false);},500);
    thoughtCollapseTimers.add(finished.collapseTimer);
  }
  function ensureTool() {
    // Keep subsequent output below the guidance that triggered it, within the same run.
    const last = thinking ? thinking.previousElementSibling : $('messages').lastElementChild;
    if (!currentRun || last !== currentRun.parentElement) currentRun = responseRow();
    if (tool) {
      const previous = tool.wrapper.parentElement;
      currentRun.append(tool.wrapper);
      if (!previous.children.length) previous.parentElement.remove();
      return;
    }
    const wrapper = element('div', '', 'tool-record');
    const badge = element('button', '', 'tool-call'); badge.type = 'button'; badge.dataset.testid = 'tool-log-line';
    badge.setAttribute('aria-expanded', 'false');
    const detail = element('div', '根据虚构的校园项目生成简历建议。本地模拟执行，未读取或修改原站简历。', 'tool-detail'); detail.hidden = true;
    detail.id = `demo-tool-detail-${round}`; badge.setAttribute('aria-controls', detail.id);
    const status = element('span', '小柚建议执行中');
    badge.append(artwork('spinner'), status, artwork('caret-down')); badge.classList.add('is-running');
    badge.onclick = () => { detail.hidden = !detail.hidden; badge.setAttribute('aria-expanded', String(!detail.hidden)); };
    wrapper.append(badge, detail); currentRun.append(wrapper);
    tool = { wrapper, badge, status };
  }
  function revisionIssues() {
    return [
      {
        title: '需求判断不够清晰', priority: '紧急', tone: 'urgent',
        background: '参与需求调研和功能设计，确定了小程序的主要功能模块。',
        versions: [
          ['突出用户痛点', '写清访谈发现的痛点，以及功能如何回应需求。'],
          ['突出优先级判断', '说明先做什么、暂缓什么，以及判断依据。'],
          ['突出方案取舍', '对比备选方案，说明选择理由和验证方式。']
        ]
      },
      {
        title: '项目结果缺少验证依据', priority: '重要', tone: 'important',
        background: '项目上线后获得同学们的一致好评，累计服务大量用户。',
        versions: [
          ['用转化漏斗说明效果', '用 SQL 梳理浏览到交易的转化，写清口径和变化。'],
          ['用用户反馈验证', '用访谈或试用反馈，说明哪些问题得到改善。'],
          ['用迭代闭环说明成果', '按问题、调整、验证组织内容，保留真实依据。']
        ]
      },
      {
        title: '个人贡献与团队分工不明确', priority: '重要', tone: 'important',
        background: '负责校园二手交易平台的产品工作，参与调研、设计、开发和推广。',
        versions: [
          ['明确独立负责的部分', '区分独立完成与协作参与，突出你的判断和交付。'],
          ['突出关键交付物', '用需求文档、原型和验收记录说明个人贡献。'],
          ['突出跨团队推进', '写清如何对齐需求、解决分歧并推动落地。']
        ]
      },
      {
        title: '经历表达冗长、重点不突出', priority: '建议', tone: 'suggested',
        background: resumePoints.filter((_, index) => !resumeCompact || index === 0).join(''),
        versions: [
          ['精简到一页', '合并重复职责，用两到三句保留关键行动和结果。'],
          ['自然直接表达', '减少套话，用具体动词说清做了什么。'],
          ['按 STAR 梳理', '按背景、任务、行动、结果组织，突出行动和结果。']
        ]
      }
    ];
  }
  function replyCards() {
    const issues = revisionIssues(), replyRound = round, ownerJourney = resumeJourney, ownerJob = targetJob, pages = [], numbers = ['一', '二', '三', '四'];
    let index = requestedEvidenceIssue, delivery = 'draft';
    const result = element('form', '', 'suggestions revision-picker'); result.dataset.result = 'true';
    result.dataset.resumeRound = String(replyRound);
    if (ownerJourney) ownerJourney.reviewElement = result;
    result.setAttribute('aria-label', '校园项目的四个修改问题');
    const heading = element('div', '', 'suggestions-heading');
    heading.append(element('span', '修改建议'), element('span', '校园项目 · 4 个问题', 'suggestions-context'));
    const carousel = element('div', '', 'suggestion-carousel'); carousel.tabIndex = 0;
    carousel.setAttribute('role', 'region'); carousel.setAttribute('aria-label', '四个问题，选择后在最后一页统一发送');
    const slide = element('div', '', 'suggestion-slide'), card = element('article', '', 'suggestion-card');
    const meta = element('div', '', 'suggestion-badges'), badge = element('span', '', 'suggestion-priority'), counter = element('span', '', 'suggestion-counter');
    counter.setAttribute('aria-live', 'polite'); meta.append(badge, counter);
    const title = element('div', '', 'suggestion-title'); title.id = `revision-title-${replyRound}`; card.setAttribute('aria-labelledby', title.id);
    const blocks = element('div', '', 'suggestion-blocks');
    issues.forEach((issue, issueIndex) => {
      const panel = element('div', '', 'revision-issue'); panel.dataset.issue = String(issueIndex);
      const page = { selection: null, panel, radios: [], rows: [] }; pages.push(page);
      const background = element('div', '', 'suggestion-background');
      background.append(element('div', '原文', 'suggestion-label'), element('div', issue.background, 'suggestion-copy'));
      const advice = element('div', '', 'suggestion-advice');
      const adviceLabel = element('div', '选择修改方向', 'suggestion-label');
      const choices = element('div', '', 'revision-options'); choices.setAttribute('role', 'radiogroup'); choices.setAttribute('aria-label', `${issue.title}的修改建议`);
      [...issue.versions, ['自定义', '写下你的修改要求。']].forEach(([optionTitle, text], optionIndex) => {
        const row = element('label', '', 'revision-option'), copy = element('span', '', 'revision-option-copy');
        const radio = document.createElement('input'); radio.type = 'radio'; radio.name = `revision-${replyRound}-${issueIndex}`; radio.value = String(optionIndex);
        radio.setAttribute('aria-label', `${numbers[optionIndex]}：${optionTitle}`);
        radio.onchange = () => {
          if (delivery !== 'draft') return;
          page.selection = optionIndex; page.error.hidden = true; refresh(); focusRevisionIssue(result, index);
          if (optionIndex === 3) page.custom.focus({ preventScroll: true });
        };
        const optionHeading = element('span', '', 'revision-option-title');
        optionHeading.append(element('span', optionTitle));
        const optionDescription = element('span', text, 'revision-option-text');
        optionDescription.id = `revision-description-${replyRound}-${issueIndex}-${optionIndex}`;
        radio.setAttribute('aria-describedby', optionDescription.id);
        copy.append(optionHeading, optionDescription);
        if (optionIndex === 3) {
          row.classList.add('revision-custom-option');
          const editor = element('span', '', 'revision-custom-editor'); editor.hidden = true;
          const custom = document.createElement('textarea'); custom.className = 'revision-custom-input'; custom.rows = 2; custom.maxLength = 1000;
          custom.id = `revision-custom-${replyRound}-${issueIndex}`; custom.setAttribute('aria-label', `${issue.title}的自定义提示词`);
          custom.placeholder = '写下你的修改要求…';
          custom.oninput = () => { if (delivery === 'draft') { page.selection = 3; page.error.hidden = true; refresh(); } };
          custom.onkeydown = event => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.isComposing && event.keyCode !== 229) { event.preventDefault(); nextOrSend(); }
          };
          const count = element('span', '0 / 1000', 'revision-character-count'); count.id = `${custom.id}-count`;
          custom.setAttribute('aria-describedby', `${count.id} revision-error-${replyRound}-${issueIndex}`);
          editor.append(custom, count); copy.append(editor); Object.assign(page, {custom, count, editor});
        }
        const selectedMark = artwork('check-circle'); selectedMark.classList.add('revision-selected-mark');
        row.append(radio, element('span', numbers[optionIndex], 'revision-option-number'), copy, selectedMark);
        choices.append(row); page.rows.push(row); page.radios.push(radio);
      });
      const error = element('div', '', 'revision-error'); error.id = `revision-error-${replyRound}-${issueIndex}`; error.hidden = true; error.setAttribute('role', 'alert');
      page.error = error;
      advice.append(adviceLabel, choices, error); panel.append(background, advice); blocks.append(panel);
    });
    const footer = element('div', '', 'suggestion-footer revision-footer');
    const prev = element('button', '上一个', 'revision-prev'), primary = element('button', '', 'revision-primary'); prev.type = primary.type = 'button';
    const primaryText = element('span'), sendIcon = icon('arrow-up'); primary.append(primaryText, sendIcon);
    const progress = element('span', '', 'revision-progress'); progress.hidden = true;
    footer.append(prev, progress, primary); card.append(meta, title, blocks, footer); slide.append(card); carousel.append(slide);
    function refresh() {
      const locked = delivery !== 'draft', last = index === issues.length - 1;
      const deliveryLabel = { queued: '待发送', sent: '已发送', steered: '已引导' }[delivery];
      pages.forEach(page => {
        page.radios.forEach((radio, optionIndex) => {
          radio.checked = page.selection === optionIndex; radio.disabled = locked;
          page.rows[optionIndex].classList.toggle('selected', page.selection === optionIndex);
        });
        page.editor.hidden = page.selection !== 3; page.custom.disabled = locked;
        page.count.textContent = `${page.custom.value.length} / 1000`;
        page.custom.setAttribute('aria-invalid', String(page.selection === 3 && !page.error.hidden));
        page.panel.dataset.selection = page.selection === null ? '' : String(page.selection);
        page.panel.dataset.delivery = delivery; page.panel.dataset.submitted = String(delivery === 'sent' || delivery === 'steered');
      });
      prev.disabled = index === 0;
      primary.classList.toggle('revision-send', last); primary.classList.toggle('revision-next', !last);
      primaryText.textContent = last ? deliveryLabel || '发送' : '下一个'; sendIcon.hidden = !last;
      primary.setAttribute('aria-label', primaryText.textContent);
      primary.disabled = last && (locked || (state === 'running' && mode === 'old'));
      primary.title = !last ? '保存选择并查看下一个问题' : delivery === 'queued' ? '可在输入框上方立即引导或删除' : deliveryLabel || '发送四个问题的修改要求';
      const pageNumber = `${index + 1} / ${issues.length}`;
      counter.textContent = progress.textContent = pageNumber;
      counter.setAttribute('aria-label', `第 ${index + 1} 页，共 ${issues.length} 页`);
      progress.setAttribute('aria-label', counter.getAttribute('aria-label'));
      const selectedCount = pages.filter(page => page.selection !== null && (page.selection !== 3 || page.custom.value.trim())).length;
      ownerJourney?.setStageResult?.(2, {
        summary: delivery === 'draft' ? `已选择 ${selectedCount} / 4 项修改方向，确认后才更新正文。` : delivery === 'queued' ? '4项修改要求已排队，等待当前任务完成。' : '4项修改要求已确认，按所选方向更新正文。',
        actionLabel: '查看建议', onInspect: () => inspectResumeArtifact(ownerJourney, 'suggestions')
      });
    }
    function show(value) {
      const scroller = $('scroll-area'), scrollTop = scroller.scrollTop;
      index = Math.max(0, Math.min(value, issues.length - 1)); const issue = issues[index];
      title.textContent = issue.title; badge.textContent = issue.priority; badge.className = `suggestion-priority ${issue.tone}`;
      carousel.dataset.index = String(index);
      pages.forEach((page, i) => {
        page.panel.hidden = i !== index; page.panel.inert = i !== index;
        page.panel.setAttribute('aria-hidden', String(i !== index));
      }); refresh();
      focusRevisionIssue(result, index);
      scroller.scrollTop = scrollTop;
    }
    function validate(pageIndex) {
      const page = pages[pageIndex], customText = page.custom.value.trim();
      const message = page.selection === null ? '请选择一项修改建议。' : page.selection !== 3 ? '' : !customText ? '请输入自定义修改要求。' : customText.length > 1000 ? '请将提示词控制在 1000 字以内。' : '';
      page.error.textContent = message; page.error.hidden = !message;
      if (message) {
        show(pageIndex);
        page.error.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
        (page.selection === 3 ? page.custom : page.radios[0]).focus({ preventScroll: true });
      }
      return !message;
    }
    function nextOrSend() {
      if (index < issues.length - 1) {
        if (delivery !== 'draft' || validate(index)) { show(index + 1); carousel.focus({ preventScroll: true }); }
        return;
      }
      if (delivery !== 'draft' || (state === 'running' && mode === 'old')) return;
      for (let i = 0; i < pages.length; i++) if (!validate(i)) return;
      const instructions = pages.map((page, i) => {
        const issue = issues[i];
        const choice = page.selection === 3 ? '四 · 自定义' : `${numbers[page.selection]} · ${issue.versions[page.selection][0]}`;
        const instruction = page.selection === 3 ? page.custom.value.trim() : issue.versions[page.selection][1];
        return `问题${numbers[i]}：${issue.title}\n当前表达：${issue.background}\n${choice}：${instruction}`;
      });
      const text = '请根据以下选择，一并修改校园二手交易项目经历：\n\n' + instructions.join('\n\n');
      const source = {
        label: '校园项目 · 4 项修改建议',
        intent: 'edit',
        journey: ownerJourney, targetJob: ownerJob,
        plan: pages.map((page, issue) => ({ issue, selection: page.selection, instruction: page.selection === 3 ? page.custom.value.trim() : issues[issue].versions[page.selection][1] })),
        setStatus(value) { delivery = value; refresh(); }
      };
      if (state === 'running') queueMessage(text, source);
      else { source.setStatus('sent'); begin(text, source); }
    }
    prev.onclick = () => show(index - 1); primary.onclick = nextOrSend;
    result.onsubmit = event => { event.preventDefault(); nextOrSend(); };
    result.addEventListener('agentstatechange', refresh);
    result.addEventListener('focusresume', () => focusRevisionIssue(result, index));
    result.addEventListener('focusin', () => focusRevisionIssue(result, index));
    result.addEventListener('click', () => focusRevisionIssue(result, index));
    carousel.onkeydown = event => {
      if (event.target !== carousel) return;
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault(); show(event.key === 'Home' ? 0 : event.key === 'End' ? issues.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1));
      }
    };
    show(index);
    result.append(heading, resumeEvidence(issue => {
      if (state === 'running' || scenarioRun || replyRound !== round) { toast('请在当前简历分析结果中查看对应问题。'); return; }
      show(issue); preview(true); carousel.focus({ preventScroll: true });
    }), carousel);
    return result;
  }
  function finish() {
    if (scenarioRun) {
      state = 'done'; updatePreview();
      const result = scenarioRun.result();
      const content = responseRow(); content.append(result);
      thinking?.remove(); thinking = null;
      if (queue.length) { const next = queue.shift(); next.source?.setStatus('sent'); renderQueue(); begin(next.text, next.source); return; }
      render(); follow(true); return;
    }
    cancelAnalysis(); flushEdits(); ensureTool(); finishThought(); state = 'done'; updatePreview();
    tool.badge.classList.remove('is-running'); tool.badge.firstElementChild.replaceWith(artwork('check-circle'));
    tool.status.textContent = taskType === 'analysis' ? '简历分析完成' : updatedPoints.size ? '简历修改完成' : '简历核对完成';
    const result = taskType === 'analysis' ? replyCards() : editResult();
    tool.wrapper.append(result); thinking?.remove(); thinking = null;
    document.dispatchEvent(new CustomEvent('xiaoyou:resume-complete', { detail: { points: [...resumePoints], job: targetJob, taskType, result, round } }));
    result.dispatchEvent(new Event('focusresume'));
    if (queue.length) {
      const next = queue.shift(); next.source?.setStatus('sent'); renderQueue(); begin(next.text, next.source); return;
    }
    render();
    if (autoFollow) requestAnimationFrame(() => { $('scroll-area').scrollTop += result.getBoundingClientRect().top - $('scroll-area').getBoundingClientRect().top - 16; });
  }
  function advance() {
    if (state !== 'running') return;
    if (scenarioRun) {
      clearTimeout(timer); step++;
      if (step >= scenarioRun.steps.length) finish(); else { updatePreview(); render(); schedule(); follow(); }
      return;
    }
    advanceAfterEdit = false;
    clearTimeout(timer); clearTimeout(thoughtTimer); showThought(); flushEdits();
    if (taskType === 'analysis') { setAnalysisPhase('concluded'); cancelAnalysis(); }
    step++;
    if (step === stages.length) finish();
    else {
      if (taskType === 'analysis') startAnalysis(); else reconcileEdits();
      if (step === 3) ensureTool();
      updatePreview(); render(); schedule(); follow();
    }
  }
  function begin(text, source = null) {
    clearTimeout(timer); clearTimeout(thoughtTimer); advanceAfterEdit = false; cancelEdits(); cancelAnalysis(); reviewFocus = null;
    source ||= sourceFromText(text);
    scenarioRun = null; window.XiaoyouScenarios?.clearPreview();
    taskType = classifyTask(text, source); revisionPlan = source?.plan || [];
    updatedPoints = new Set(); round++; step = 0; state = 'running'; runStartedAt=Date.now(); addUser(text);
    if (/数据分析|一页|套话|SQL|精简|自然/.test(text)) adopted.push({ id: ++sequence, text });
    currentRun = null; thought = null; tool = null;
    $('session-title').textContent = text;
    updateThinking();
    if (taskType === 'scenario' && window.XiaoyouScenarios?.keys.includes(source?.scenario)) {
      resumeJourney = null; targetJob = null;
      scenarioRun = window.XiaoyouScenarios.createRun({ key: source.scenario, round, points: [...resumePoints], context: source.context || {} });
      $('messages').insertBefore(scenarioRun.journey, thinking);
    } else {
      createResumeJourney(source);
      if (taskType === 'analysis') startAnalysis();
    }
    preview(true); updatePreview(); render(); schedule(); follow(true);
    renderQueue();
    const currentAnalysisToken = analysisToken;
    thoughtTimer = setTimeout(() => { if (analysisToken === currentAnalysisToken) showThought(); }, 900);
  }
  function submit(event) {
    event?.preventDefault(); if (state === 'running' && mode === 'old') return;
    const text = $('input').value.trim(); if (!text) return;
    if (text.length > $('input').maxLength) return showError(`请将补充要求控制在 ${$('input').maxLength} 字以内。`);
    showError(''); if (state === 'running') queueMessage(text, sourceFromText(text)); else begin(text);
    setInput(''); render(); finishComposerAction();
  }
  function stop() {
    if (state !== 'running') return;
    const restoredCards = queue.some(q => q.source);
    if (analysis?.note && analysis.phase !== 'concluded') { analysis.note.textContent += '（已停止）'; analysis.note.dataset.phase = 'stopped'; }
    cancelAnalysis();
    clearTimeout(timer); clearTimeout(thoughtTimer); advanceAfterEdit = false; cancelEdits(); state = 'stopped'; thinking?.remove(); thinking = null;
    updatePreview();
    finishThought();
    if (tool) { tool.badge.classList.remove('is-running'); tool.badge.firstElementChild.replaceWith(icon('x')); tool.status.textContent = '小柚建议已停止'; }
    if (queue.length) {
      const drafts = queue.filter(q => !q.source).map(q => q.text);
      queue.filter(q => q.source?.scenario).forEach(q => {
        const card = element('div', '', 'scenario-pending-request');
        card.append(element('p', `待继续：${q.source.label}`));
        const resume = element('button', '继续此任务', 'shortcut'); resume.type = 'button';
        resume.onclick = () => { if (!card.isConnected) return; card.remove(); if (state === 'running') queueMessage(q.text, q.source); else begin(q.text, q.source); };
        card.append(resume); $('messages').append(card);
      });
      queue.forEach(q => q.source?.setStatus('draft'));
      setInput([...drafts, $('input').value].filter(Boolean).join('\n'));
    }
    queue = []; renderQueue();
    $('messages').append(element('div', restoredCards ? '已停止。待发送的建议已恢复编辑，输入内容已保留。' : '已停止。输入内容已保留，可修改后继续。', 'message assistant'));
    render(); follow(true); $('input').focus();
  }
  function reset() {
    cancelAnalysis(); reviewFocus = null;
    advanceAfterEdit = false; cancelEdits(); taskType = 'analysis'; revisionPlan = []; updatedPoints = new Set();
    thoughtCollapseTimers.forEach(clearTimeout); thoughtCollapseTimers.clear();
    clearTimeout(timer); clearTimeout(thoughtTimer); state = 'idle'; step = 0; round = 0; sequence = 0; queue = []; adopted = []; currentRun = null; thinking = null; thought = null; tool = null; autoFollow = true;
    scenarioRun = null; resumeJourney = null; targetJob = null; window.XiaoyouScenarios?.clearPreview();
    $('messages').replaceChildren(); setInput(''); $('session-title').textContent = ''; showError(''); renderQueue();
    resumePoints = [...originalResumePoints]; resumeCompact = false; updatePreview();
    preview(false); resizeInput(); render();
  }
  function preview(open) { $('preview').hidden = !open; $('app').classList.toggle('has-preview', open); if(!open)$('app').classList.remove('workspace-expanded'); resizeInput(); if (open) revealResumeTarget(); }
  function fill(text) {
    if ($('input').disabled) { toast('原流程中需要先停止任务，才能补充要求'); return; }
    setInput(text); render(); menu(false); $('input').focus();
  }
  $('form').onsubmit = submit;
  $('input').addEventListener('input', () => { resizeInput(); render(); showError(''); });
  window.addEventListener('resize', resizeInput);
  $('input').addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== 229) { event.preventDefault(); submit(); } });
  $('stop').onclick = stop; $('advance').onclick = advance;
  $('demo-settings').onclick = () => menu($('demo-menu').hidden); $('close-demo').onclick = () => menu(false);
  $('start-demo').onclick = () => { reset(); menu(false); begin(exampleTask); };
  $('show-card-demo').onclick = () => { reset(); menu(false); begin(exampleTask); for (let i = 0; i < stages.length; i++) advance(); };
  $('close-preview').onclick = () => preview(false);
  ['new', 'old'].forEach(value => { $('mode-' + value).onclick = () => {
    if (mode === value) return; mode = value; reset(); toast(value === 'old' ? '已切换原流程对照，开始任务后需停止才能补充' : '已切换不中断引导，开始任务后可持续补充');
  }; });
  document.querySelectorAll('[data-toggle-sidebar]').forEach(button => { button.onclick = () => {
    const expanded = $('app').classList.toggle('expanded'); $('top-expand').hidden = expanded;
  }; });
  document.querySelectorAll('[data-new]').forEach(button => { button.onclick = reset; });
  document.querySelectorAll('[data-home]').forEach(button => { button.onclick = () => { preview(false); if (window.innerWidth <= 740) { $('app').classList.remove('expanded'); $('top-expand').hidden = false; } }; });
  document.querySelectorAll('[data-panel]').forEach(button => { button.onclick = () => preview(true); });
  document.querySelectorAll('[data-unavailable]').forEach(button => { button.onclick = () => toast(`${button.dataset.unavailable}仅保留原站入口样式，本 demo 验证对话引导功能。`); });
  document.querySelectorAll('[data-prompt]').forEach(button => { button.onclick = () => begin(button.dataset.prompt); });
  document.querySelectorAll('[data-scenario]').forEach(button => { button.onclick = () => launchScenario(button.dataset.scenario); });
  document.querySelectorAll('[data-example]').forEach(button => { button.onclick = () => fill(button.dataset.example); });
  $('theme').onclick = () => { const dark = document.documentElement.classList.toggle('dark'); $('wordmark').src = `upcv-assets/up-job-wordmark-${dark ? 'dark' : 'light'}.svg`; };
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { menu(false); preview(false); } });
  document.addEventListener('click', event => { if (!$('demo-menu').hidden && !$('demo-menu').contains(event.target) && !$('demo-settings').contains(event.target)) menu(false); });
  document.addEventListener('resumedocumentchange',event=>{if(state!=='running' && Array.isArray(event.detail?.points) && event.detail.points.length===3)resumePoints=event.detail.points.map(String);});
  document.addEventListener('xiaoyou:notice',event=>{if(typeof event.detail?.text==='string')toast(event.detail.text);});
  document.addEventListener('xiaoyou:campus-product', event => { if (scenarioRun?.key === 'jobs' && scenarioRun.journey === event.detail?.journey && state === 'running') follow(); });
  document.addEventListener('xiaoyou:flow-product', event => { if (scenarioRun && scenarioRun.journey === event.detail?.journey && state === 'running') follow(); });
  document.addEventListener('xiaoyou:resume-product', event => { if (!scenarioRun && resumeJourney?.element === event.detail?.journey && state === 'running') follow(); });
  document.addEventListener('xiaoyou:scenario-request', event => { launchScenario(event.detail?.key, event.detail?.context || {}); });
  document.addEventListener('xiaoyou:preview', event => { if (typeof event.detail?.open === 'boolean') preview(event.detail.open); });
  window.addEventListener('beforeunload', () => { clearTimeout(timer); clearTimeout(thoughtTimer); clearTimeout(toastTimer); thoughtCollapseTimers.forEach(clearTimeout); thoughtCollapseTimers.clear(); cancelAnalysis(); cancelEdits(); });
  updatePreview(); render();
})();
