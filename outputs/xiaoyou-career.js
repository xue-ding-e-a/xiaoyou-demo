/* Video-led orchestration inside the existing Agent shell. All records are fictional.
 * Reference: work/video-review/VIDEO-UI-AUDIT.md and public UPCV component caches.
 * The original four entry themes are preserved; delivery is a continuation, not a fifth card. */
(() => {
  'use strict';
  const store = window.XiaoyouCareerStore, scenarios = window.XiaoyouScenarios;
  if (!store || !scenarios || !window.XiaoyouCareerViews) return;
  const $ = id => document.getElementById(id);
  const el = (tag, text = '', cls = '') => { const n = document.createElement(tag); n.textContent = text; n.className = cls; return n; };
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
  const notice = text => emit('xiaoyou:notice', { text });
  const btn = (text, fn, primary = false) => { const b = el('button', text, `scenario-button${primary ? ' is-primary' : ''}`); b.type = 'button'; b.onclick = fn; return b; };
  const validIds = ids => [...new Set((Array.isArray(ids) ? ids : []).filter(id => store.getJob(id)))];
  const stage = (title, description) => ({ title, description, tools: [] });
  const definitions = {
    jobs: window.XiaoyouCampus.describe(),
    screen: { title: '批量筛选职位', prompt: '从全网粗筛结果中，按细化要求和简历经历精筛，只保留匹配达标的职位。', steps: [stage('读取粗筛池与细化要求', '沿用已搜索的职位，核对城市、方向、招聘类型与薪资要求。'), stage('逐岗精筛与匹配评估', '对照简历证据评分，低于匹配门槛或不符合要求的职位不列出。'), stage('整理达标职位', '按匹配度排序，仅为达标职位继续准备简历与招呼语。')] },
    deliver: { title: '批量定制与投递', prompt: '为已选职位逐一准备定制简历和招呼语，准备完成后由我确认投递。', steps: [stage('逐岗准备简历', '将已确认的经历对齐各职位关注点。'), stage('准备专属招呼语', '结合岗位与经历生成独立招呼语。'), stage('核对投递材料', '两项材料齐备后，显示一键模拟投递。')] },
    apply: { title: '填写网申', prompt: '将我的简历信息自动补全到这个职位的网申表，缺失项留给我核对。', steps: [stage('识别网申字段', '核对基本信息、教育经历和补充信息。'), stage('逐项自动补全', '填写已有简历事实，保留字段来源。'), stage('标记待补信息', '核对缺失项，等待你手动提交。')] },
    interview: { title: '针对职位模拟面试', prompt: '基于这个职位和我的简历，准备一轮模拟面试。', steps: [stage('梳理岗位关注点', '围绕岗位职责定位相关经历。'), stage('准备面试问题', '准备个人贡献、判断过程和结果验证问题。'), stage('开始练习', '逐题回答后查看可执行的改进建议。')] }
  };
  let active = null;
  function request(key, context = {}) { window.XiaoyouJobPages?.close(); emit('xiaoyou:scenario-request', { key, context }); }
  function syncProfile(points) { if (Array.isArray(points) && points.length) store.updateProfile({ projects: points.map(String) }); }
  function criteriaFromText(text = '') {
    const value = String(text), result = {};
    const city = value.match(/(?:只看|改为|城市.*?)(上海|北京|杭州|深圳|广州|成都|南京|不限)/)?.[1];
    if (city) result.city = city;
    if (/数据分析/.test(value)) result.direction = '数据分析';
    else if (/用户研究/.test(value)) result.direction = '用户研究';
    else if (/产品/.test(value)) result.direction = '产品';
    if (/方向不限/.test(value)) result.direction = '不限';
    if (/只看校招/.test(value)) result.jobType = '校招';
    if (/只看实习/.test(value)) result.jobType = '实习';
    if (/招聘类型不限/.test(value)) result.jobType = '不限';
    const threshold = value.match(/(?:匹配度|匹配分|最低匹配)[^\d]{0,5}(\d{2,3})/)?.[1];
    const salary = value.match(/(?:月薪|薪资)[^\d]{0,6}(\d{1,2})\s*[kK]/)?.[1];
    if (threshold) result.minScore = Math.min(100, Math.max(0, Number(threshold)));
    if (salary) result.minSalaryK = Number(salary);
    if (/(?:月薪|薪资)不限/.test(value)) result.minSalaryK = 0;
    const industry = value.match(/(?:行业|只看)[：:\s]*(互联网|软件服务|智能制造|不限)/)?.[1];
    if (industry) result.industry = industry;
    return result;
  }
  function evaluate(job, p) {
    const sameCity = p.city === '不限' || !p.city || p.city.split(/[、,，\s]+/).includes(job.city);
    const sameDirection = p.direction === '不限' || !p.direction || job.direction.includes(p.direction) || job.title.includes(p.direction);
    const education = { '不限': 0, '专科': 1, '大专': 1, '本科': 2, '硕士': 3, '博士': 4 };
    const qualified = job.type !== '社招' && (!job.year || job.year === p.year) && (education[p.education] ?? -1) >= (education[job.education] ?? Infinity);
    const typeAllowed = !p.jobType || p.jobType === '不限' || job.type === p.jobType;
    const salaryAllowed = !p.minSalaryK || job.minSalaryK != null && job.minSalaryK >= p.minSalaryK;
    const industryAllowed = !p.industry || p.industry === '不限' || job.industry === p.industry;
    const projectText = (p.projects || []).join(' '), jobText = `${job.duties} ${job.requirements}`;
    const shared = ['需求', '用户', '原型', '流程', '访谈', '推广', '数据', '测试', '反馈', '产品'].filter(word => projectText.includes(word) && jobText.includes(word));
    const dimensions = [
      { label: '岗位条件', score: qualified ? job.year ? 92 : 65 : 20, evidence: `${p.education} · ${p.year}届；岗位要求${job.education}${job.year ? `、${job.year}届` : '，年份待核实'}`, gap: qualified ? job.year ? '' : '毕业年份待确认' : '学历、全职经验或毕业年份不满足岗位要求' },
      { label: '意向匹配', score: sameCity && sameDirection ? 94 : 45, evidence: `期望${p.city} · ${p.direction}；岗位${job.city} · ${job.direction}`, gap: sameCity && sameDirection ? '' : '城市或方向与当前意向不同' },
      { label: '项目经历', score: Math.min(sameDirection ? 92 : 74, 70 + shared.length * 4), evidence: projectText.slice(0, 100), gap: job.gap },
      { label: '实习与技能', score: p.internship ? 82 : 62, evidence: p.internship || '简历未提供实习经历；已有需求分析、原型、SQL 与 Excel 技能', gap: '技能熟练度和量化结果需要进一步核实' }
    ];
    const score = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / 4);
    const eligible = sameCity && sameDirection && qualified && typeAllowed && salaryAllowed && industryAllowed && score >= (p.minScore ?? 80);
    return { score, dimensions, eligible, summary: `${eligible ? '值得进一步了解：' : '需谨慎核对：'}${job.gap}（示例规则评分）` };
  }
  function createRun({ key, points = [], context = {} }) {
    if (key === 'jobs') { active?.destroy(); active = window.XiaoyouCampus.createRun({points, context}); return active; }
    const def = definitions[key], snapshot = store.snapshot();
    syncProfile(points);
    let profile = store.updateProfile({ ...criteriaFromText(context.instruction), ...(context.criteria || {}) }).profile;
    let ids = validIds(context.jobIds || context.ids || (context.job ? [context.job.id] : []));
    if (!ids.length) ids = validIds(key === 'screen' ? snapshot.searchCompleted ? snapshot.candidateIds : store.getJobs().map(j => j.id) : snapshot.selectedIds.length ? snapshot.selectedIds : ['pine-pm']);
    if (key === 'screen' && !snapshot.searchCompleted) store.setCandidates(store.getJobs().map(job => job.id));
    if (key === 'apply' || key === 'interview') ids = ids.slice(0, 1);
    let jobs = ids.map(id => store.getJob(id)), matches = {}, selectedIds = [];
    let state = 'running', current = -1, destroyed = false, lastSignature = '', submitted = false, selectionTouched = false, sending = false, generation = 0, openedResult = false;
    const timers = new Set(), rows = {}, fields = {};
    let interviewSession = null;
    const tracker = scenarios.createJourney({ title: `${def.title}工作流`, steps: def.steps });
    tracker.element.classList.add('flow-run'); tracker.element.dataset.flow = key;
    const workspace = window.XiaoyouFlowWorkspace.mount({key, title: ({screen:'精筛职位', deliver:'投递材料', apply:'网申信息', interview:'模拟面试'})[key] || def.title});
    const panel = workspace.panel;
    const candidates = () => jobs.filter(job => matches[job.id]?.eligible).sort((a, b) => matches[b.id].score - matches[a.id].score);
    function calculate() { matches = key === 'screen' ? Object.fromEntries(jobs.map(job => [job.id, evaluate(job, profile)])) : {}; }
    calculate();
    const initial = {type: key === 'screen' ? 'match' : key, jobs, profile, matches: {}, applications: snapshot.applications, selectedIds, visibleIds: [], filledFields: [], phase: key === 'deliver' ? 'prepare' : 'idle'};
    const controller = window.XiaoyouCareerViews.render(panel, {...initial, onAction});
    const products = window.XiaoyouFlowProducts.mount({host: tracker.element, key, ...initial});
    let viewState = {...initial};
    const anchor = btn(({screen:'查看精筛职位', deliver:'核对简历与招呼语', apply:'打开网申信息', interview:'开始面试练习'})[key], () => { if (alive()) workspace.open(); });
    anchor.classList.add('flow-result-anchor'); tracker.element.append(anchor);
    const run = { key, layout: 'split', title: def.title, steps: def.steps, journey: tracker.element,
      status: index => def.steps[Math.min(index, def.steps.length - 1)].title,
      duration: index => key === 'screen' ? [2200, 1800 + jobs.length * 150, 1500][index] : key === 'deliver' ? [800 + jobs.length * 640, 1400, 900][index] : key === 'interview' ? [1500, 1600, 1000][index] : 3600,
      update, result, guide, destroy() {
        if (destroyed) return; destroyed = true; cancel(); interviewSession?.destroy(); controller.destroy(); products.freeze(); workspace.destroy(); anchor.disabled = true;
      }
    }; active = run;
    function alive() { return !destroyed && active === run && panel.isConnected; }
    function cancel() { generation++; timers.forEach(clearTimeout); timers.clear(); }
    function later(delay, fn) { const token = generation, timer = setTimeout(() => { timers.delete(timer); if (alive() && generation === token && state !== 'stopped') fn(); }, delay); timers.add(timer); }
    function patch(value) {
      if (!alive()) return;
      const prior = viewState; viewState = {...viewState, ...value};
      ['matches','rows','fieldValues'].forEach(name => { if (value[name]) viewState[name] = name === 'matches' && !Object.keys(value.matches).length && Array.isArray(value.visibleIds) && !value.visibleIds.length ? {} : {...prior[name], ...value[name]}; });
      controller.update(value); products.update({...viewState, stopped: state === 'stopped'});
      if (state === 'running') emit('xiaoyou:flow-product', {journey: tracker.element});
    }
    function animateScreen() {
      const evaluated = new Set();
      jobs.forEach((job, index) => later(650 + index * 150, () => {
        evaluated.add(job.id);
        const shown = candidates().filter(item => evaluated.has(item.id)).map(item => item.id);
        patch({ visibleIds: shown, activeId: matches[job.id].eligible ? job.id : '', scanned: index + 1, matches: { [job.id]: matches[job.id] } });
      }));
    }
    function material(job, kind) {
      const old = store.snapshot().applications[job.id];
      const facts = (profile.projects || []).join(' ');
      const greeting = `您好，我是${profile.name}，关注贵司的${job.title}岗位。我的项目涉及${facts.slice(0, 96)}，希望进一步了解${job.company}团队的岗位要求。`;
      rows[job.id] ||= { resumeStatus: 'idle', greetingStatus: 'idle', submitStatus: old?.status && old.status !== 'pending' && old.status !== 'archived' ? 'submitted' : 'idle' };
      rows[job.id][kind === 'resume' ? 'resumeStatus' : 'greetingStatus'] = 'ready';
      if (kind === 'greeting') rows[job.id].greeting = old?.greeting || greeting;
      store.upsertApplication(job.id, kind === 'resume' ? { resumeReady: true, resumeName: `${profile.name}_${job.company}_${job.title}.pdf` } : { greetingReady: true, greeting: rows[job.id].greeting });
    }
    function completeMaterials(kind) { jobs.forEach(job => material(job, kind)); patch({ rows: { ...rows } }); }
    function persistMatches() { jobs.forEach(job => store.setMatch(job.id, matches[job.id])); store.setShortlist(candidates().map(job => job.id)); }
    function showPhase(index, done) {
      const progress = done ? 100 : Math.round(index / def.steps.length * 100);
      patch({ phaseLabel: done ? key === 'apply' ? '已填入已有信息，请核对待补字段' : key === 'deliver' ? '材料已准备完成，等待确认投递' : key === 'interview' ? '岗位问题已准备，可开始练习' : '精筛完成，仅展示达标职位' : def.steps[index].title, progress, done });
      if (key === 'screen') {
        if (index === 0 && !done) patch({ phase: 'match', visibleIds: [], matches: {}, scanned: 0, total: jobs.length });
        else if (index === 1 && !done) { patch({ phase: 'match' }); animateScreen(); }
        else { persistMatches(); const shown = candidates().map(j => j.id); selectedIds = selectionTouched ? selectedIds.filter(id => shown.includes(id)) : shown; store.setSelected(selectedIds); patch({ phase: 'match', matches, visibleIds: shown, selectedIds, scanned: jobs.length, total: jobs.length }); }
      } else if (key === 'deliver') {
        if (!selectionTouched) selectedIds = [...ids];
        patch({ phase: 'prepare', selectedIds, visibleIds: ids });
        if (index > 0 || done) completeMaterials('resume');
        if (index > 1 || done) completeMaterials('greeting');
        if (index === 0 && !done) jobs.forEach((job, i) => {
          later(i * 640, () => { const old = store.snapshot().applications[job.id]; rows[job.id] ||= { resumeStatus: 'idle', greetingStatus: 'idle', submitStatus: old?.status && !['pending','archived'].includes(old.status) ? 'submitted' : 'idle' }; rows[job.id].resumeStatus = 'working'; patch({ activeId: job.id, rows: { ...rows } }); });
          later(i * 640 + 220, () => { rows[job.id].greetingStatus = 'working'; patch({ rows: { ...rows } }); });
          later(i * 640 + 420, () => { material(job, 'resume'); patch({ rows: { ...rows } }); });
          later(i * 640 + 600, () => { material(job, 'greeting'); patch({ rows: { ...rows } }); });
        });
      } else if (key === 'apply') {
        const defaults = { name: profile.name, email: 'lin@example.com', city: profile.city, school: profile.school, education: profile.education, year: String(profile.year), major: '信息管理与信息系统', experience: points.join('\n') || (profile.projects || []).join('\n') };
        const userFields = viewState.userFields || [], names = Object.keys(defaults);
        names.forEach(name => { if (!userFields.includes(name)) fields[name] = defaults[name]; });
        const filled = automatic => [...new Set([...automatic, ...userFields.filter(name => String(fields[name] || '').trim())])];
        patch({ phase: 'fill', activeId: ids[0], fieldValues: {...fields}, missingFields: ['phone', 'availability'].filter(name => !String(fields[name] || '').trim()) });
        if (index === 0 && !done) patch({ filledFields: filled([]) });
        else if (index === 1 && !done) names.forEach((name, i) => later(i * 280, () => patch({ filledFields: filled(names.slice(0, i + 1)), activeField: name })));
        else patch({ filledFields: filled(names), activeField: '' });
      } else if (key === 'interview' && done) showInterview();
    }
    function update(index, nextState) {
      if (!alive()) return;
      const signature = `${index}:${nextState}`; if (signature === lastSignature) return; lastSignature = signature;
      cancel(); current = Math.min(index, def.steps.length - 1); state = nextState; tracker.update(current, state);
      panel.dataset.state = state; panel.dataset.step = String(current);
      if (state === 'stopped') { patch({ phaseLabel: '已停止，保留当前结果', stopped: true, done: false }); panel.querySelectorAll('button,input,textarea').forEach(control => { control.disabled = true; }); return; }
      showPhase(current, state === 'done');
      if (state === 'done' && !openedResult) {
        openedResult = true; const revision = workspace.revision(); later(500, () => workspace.open({automatic: true, revision}));
      }
    }
    function guide(text, contextPatch = {}) {
      if (!alive() || state === 'stopped') return;
      profile = store.updateProfile({ ...criteriaFromText(text), ...(contextPatch.criteria || {}) }).profile; calculate();
      if (key === 'screen') { cancel(); selectedIds = []; selectionTouched = false; patch({ jobs, profile, selectedIds, visibleIds: [], matches }); showPhase(current, state === 'done'); }
      else notice('已保留补充要求；请在材料或表单中核对后继续。');
    }
    function onAction(action, payload = {}) {
      if (!alive() || state === 'stopped') return;
      if (state !== 'done' && !['refine','field-change','review-change','select'].includes(action)) return;
      const chosen = validIds(payload.ids || selectedIds);
      if (action === 'select') { selectionTouched = true; selectedIds = validIds(payload.ids); store.setSelected(selectedIds); }
      else if (action === 'match') { if (!chosen.length) return notice('请先选择要精筛的职位。'); request('screen', { jobIds: chosen }); }
      else if (action === 'refine' && key === 'screen') {
        if (state === 'running') guide('', { criteria: payload.criteria });
        else request('screen', { jobIds: ids, criteria: { ...profile, ...payload.criteria } });
      }
      else if (action === 'deliver' || action === 'prepare') { if (!chosen.length) return notice('请先选择要准备的职位。'); store.setSelected(chosen); request('deliver', { jobIds: chosen }); }
      else if (action === 'tailor') request('resume', { job: store.getJob(payload.jobId) });
      else if (action === 'apply') request('apply', { jobIds: [payload.jobId] });
      else if (action === 'greeting') patch({ phase: 'greeting', activeId: payload.jobId });
      else if (action === 'back-to-batch') patch({ phase: submitted ? 'submit' : 'prepare' });
      else if (action === 'greeting-change') { if (rows[payload.jobId]) { rows[payload.jobId].greeting = String(payload.text || ''); rows[payload.jobId].greetingStatus = payload.text?.trim() ? 'ready' : 'idle'; store.upsertApplication(payload.jobId, { greeting: rows[payload.jobId].greeting, greetingReady: Boolean(payload.text?.trim()) }); patch({ rows: { ...rows } }); } }
      else if (action === 'submit') submit(chosen);
      else if (action === 'progress') window.XiaoyouJobPages.open('progress', { view: 'board' });
      else if (action === 'field-change') {
        fields[payload.field] = payload.value;
        const filled = new Set(viewState.filledFields || []);
        if (String(payload.value).trim()) filled.add(payload.field); else filled.delete(payload.field);
        const userFields = [...new Set([...(viewState.userFields || []), payload.field])];
        patch({fieldValues: {...fields}, filledFields: [...filled], missingFields: ['phone', 'availability'].filter(name => !String(fields[name] || '').trim()), userFields});
      }
      else if (action === 'confirm-apply') { store.upsertApplication(ids[0], { nextAction: '网申信息已核对，等待手动提交' }); notice('网申信息已核对；记录已加入我的职位，等待手动提交。'); }
    }
    function submit(chosen) {
      if (state !== 'done' || sending || !chosen.length) return notice('请等待全部材料准备完成。');
      const applications = store.snapshot().applications;
      chosen = chosen.filter(id => rows[id]?.submitStatus !== 'submitted' && (!applications[id]?.status || ['pending','archived'].includes(applications[id].status)));
      if (!chosen.length) return notice('这些职位已经完成本次模拟投递。');
      if (chosen.some(id => !applications[id]?.resumeReady || !applications[id]?.greetingReady)) return notice('请先准备好所选职位的简历与招呼语。');
      submitted = true; sending = true; patch({ phase: 'submit', done: false, phaseLabel: '正在模拟投递…' });
      chosen.forEach((id, i) => {
        rows[id].submitStatus = 'working';
        later(280 + i * 340, () => { rows[id].submitStatus = 'submitted'; store.upsertApplication(id, { status: 'applied', nextAction: '等待招聘方回复（示例）' }); patch({ rows: { ...rows }, progress: Math.round((i + 1) / chosen.length * 100) }); });
      });
      patch({ rows: { ...rows } });
      later(650 + chosen.length * 340, () => { sending = false; patch({ done: true, phaseLabel: `已完成 ${chosen.length} 份模拟投递` }); window.XiaoyouJobPages.open('progress', { view: 'board' }); });
    }
    function showInterview() {
      controller.destroy(); panel.replaceChildren();
      interviewSession?.destroy();
      interviewSession = window.XiaoyouInterview?.mount(panel, {
        job: jobs[0],
        prepared: true,
        onBack: () => window.XiaoyouJobPages.open('progress', { view: 'board' })
      });
    }
    function result() {
      const box = el('section', '', 'career-flow-result'); box.append(el('strong', `${def.title} · ${key === 'apply' ? '等待核对' : '本轮已完成'}`));
      box.append(el('p', key === 'screen' ? `从 ${jobs.length} 个粗筛职位中保留 ${candidates().length} 个达标职位；只展示满足条件且匹配度不低于 ${profile.minScore ?? 80} 分的结果。原始粗筛池保留，可调整要求重新精筛。` : key === 'deliver' ? '简历和招呼语已逐岗准备。上方保留逐岗准备过程，打开右侧材料核对后，可一键模拟投递。' : key === 'apply' ? '已有信息已补全，手机号和到岗时间需补充。核对后由你在网申页面提交。' : '已围绕当前岗位准备问题，可以开始逐题练习。'));
      const safe = fn => () => { if (alive() && state === 'done') fn(); else notice('请在当前工作流结果中继续操作。'); };
      box.append(btn('打开' + ({screen:'精筛职位', deliver:'投递材料', apply:'网申信息', interview:'模拟面试'})[key], safe(() => workspace.open()), true));
      if (key === 'screen' && candidates().length) { box.append(btn('针对职位改简历', safe(() => request('resume', { job: store.getJob(selectedIds[0] || candidates()[0]?.id) }))), btn('批量定制简历与招呼语', safe(() => onAction('deliver', { ids: selectedIds })), true)); }
      box.append(btn('打开我的职位', safe(() => window.XiaoyouJobPages.open('progress')))); return box;
    }
    return run;
  }
  const legacy = { createRun: scenarios.createRun, describe: scenarios.describe, clearPreview: scenarios.clearPreview };
  scenarios.keys = [...new Set([...scenarios.keys, ...Object.keys(definitions)])];
  scenarios.describe = key => definitions[key] ? { title: definitions[key].title, prompt: definitions[key].prompt } : legacy.describe(key);
  scenarios.createRun = options => definitions[options.key] ? createRun(options) : legacy.createRun(options);
  scenarios.clearPreview = () => { active?.destroy(); active = null; window.XiaoyouTargetJob?.close(); legacy.clearPreview(); };
  document.addEventListener('xiaoyou:career-action', event => {
    const { action, jobIds = [] } = event.detail || {}, ids = validIds(jobIds);
    if (action === 'tailor') request('resume', { job: store.getJob(ids[0] || 'pine-pm') });
    else if (action === 'followup') { window.XiaoyouJobPages.open('progress', { view: 'board' }); notice('在看板中更新示例状态，进入已约面后可开始模拟面试。'); }
    else request(({ search: 'jobs', match: 'screen', deliver: 'deliver', apply: 'apply', interview: 'interview' })[action], { jobIds: ids });
  });
  document.querySelectorAll('[data-unavailable]').forEach(button => {
    const type = button.dataset.unavailable;
    if (['发现职位', '我的职位', '待投清单'].includes(type)) button.onclick = () => window.XiaoyouJobPages.open(type === '发现职位' ? 'discovery' : 'progress');
    else if (type === '模拟面试') button.onclick = () => request('interview', { jobIds: store.snapshot().selectedIds });
    else if (type === '关于我' || type === '求职偏好') button.onclick = () => { $('input').value = `只看${store.snapshot().profile.city}的${store.snapshot().profile.direction}职位`; $('input').dispatchEvent(new Event('input')); $('input').focus(); };
  });
  document.querySelectorAll('[data-home],[data-new],[data-panel]').forEach(button => button.addEventListener('click', () => window.XiaoyouJobPages.close()));
  document.addEventListener('xiaoyou:career-page', event => {
    const label = event.detail?.open ? event.detail.page === 'discovery' ? '发现职位' : '我的职位' : 'Agent';
    document.querySelectorAll('.nav-list .nav-entry').forEach(button => { const selected = button.getAttribute('aria-label') === label; button.classList.toggle('selected', selected); if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); });
  });
  document.addEventListener('resumedocumentchange', event => syncProfile(event.detail?.points));
  document.addEventListener('xiaoyou:resume-complete', event => {
    syncProfile(event.detail?.points);
    const job = event.detail?.job; if (!job?.id || !store.getJob(job.id) || event.detail?.taskType !== 'edit') return;
    store.upsertApplication(job.id, { resumeReady: true, resumeName: `林同学_${job.company}_${job.title}.pdf` });
    const result = event.detail.result;
    const completedRound = event.detail.round;
    result?.append(btn('继续准备招呼语与投递', () => {
      if (!result.isConnected || $('app').dataset.state !== 'done' || Number($('app').dataset.round) !== completedRound || $('app').dataset.taskType !== 'edit') return notice('请在当前简历修改结果中继续。');
      request('deliver', { jobIds: [job.id] });
    }, true));
  });
})();
