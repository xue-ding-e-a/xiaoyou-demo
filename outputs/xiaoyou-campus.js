/* Campus recommendation in the normal Agent/resume split workspace.
 * Official entry and presentation references: work/campus-recommendation-source-audit.md.
 * The four progressive products below are fictional demo choreography, not a
 * claim about the official Agent's backend tool order. No network or A4 clones. */
(() => {
  'use strict';
  const store = window.XiaoyouCareerStore, scenarios = window.XiaoyouScenarios;
  if (!store || !scenarios || !window.XiaoyouCampusViews) return;
  const $ = id => document.getElementById(id);
  const node = (tag, text = '', cls = '') => { const n = document.createElement(tag); n.textContent = text; n.className = cls; return n; };
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, {detail}));
  const notice = text => emit('xiaoyou:notice', {text});
  const description = {title: '找适合我的职位', prompt: '基于我的简历，帮我推荐适合我的校招和职位'};
  const steps = [
    {title: '读取简历与求职意向', description: '结合当前简历，逐项整理教育、经历与技能。', tools: ['读取简历']},
    {title: '梳理可关注的方向', description: '根据已有经历说明推荐方向，保留待核对的信息。', tools: []},
    {title: '推荐校招和职位', description: '检索站内校招项目与职位，保留来源及推荐依据。', tools: ['推荐校招', '推荐职位']},
    {title: '整理校招投递建议', description: '从已有示例记录生成校招项目建议与相关职位清单。', tools: ['筛选值得投的校招']}
  ];
  let active = null;
  function criteria(text = '') {
    const patch = {}, value = String(text);
    const city = value.match(/(?:只看|改为|城市.*?)(上海|北京|杭州|深圳|广州|成都|南京|不限)/)?.[1];
    if (city) patch.city = city;
    if (/数据分析/.test(value)) patch.direction = '数据分析';
    else if (/用户研究/.test(value)) patch.direction = '用户研究';
    else if (/产品/.test(value)) patch.direction = '产品';
    if (/方向不限/.test(value)) patch.direction = '不限';
    if (/只看校招/.test(value)) patch.jobType = '校招';
    if (/只看实习/.test(value)) patch.jobType = '实习';
    if (/招聘类型不限/.test(value)) patch.jobType = '不限';
    return patch;
  }
  function resumeProfile(points, patch = {}) {
    const p = store.updateProfile({...criteria(patch.instruction), ...(patch.criteria || {}), ...(points.length ? {projects: points.map(String)} : {})}).profile;
    const text = selector => document.querySelector(selector)?.textContent.trim() || '';
    return {...p, major: text('[data-section=education] .resume-item-head p'),
      skills: text('[data-section=skills] .resume-section-copy'),
      experience: p.internship || '简历暂未提供实习经历',
      experienceNote: text('[data-section=practice] h3'),
      missingInfo: '个人贡献、项目结果与验证依据；具体到岗时间'};
  }
  function recommend(profile) {
    const education = {'不限': 0, '大专': 1, '专科': 1, '本科': 2, '硕士': 3, '博士': 4};
    const related = profile.direction === '数据分析' ? ['数据分析', '产品'] : profile.direction === '用户研究' ? ['用户研究', '产品'] : ['产品', '用户研究', .../SQL|Excel/i.test(profile.skills || '') ? ['数据分析'] : []];
    const priority = job => Number(job.city === profile.city) * 2 + Number(job.direction === profile.direction);
    return store.getJobs().filter(job => job.sources.some(source => source.includes('站内')) && job.type !== '社招'
      && (profile.direction === '不限' || related.includes(job.direction))
      && (!job.year || job.year === profile.year)
      && (education[profile.education] ?? -1) >= (education[job.education] ?? Infinity)
      && (!profile.jobType || profile.jobType === '不限' || profile.jobType === job.type))
      .sort((a, b) => priority(b) - priority(a))
      .map(job => ({...job, recommendationReason: `${job.city === profile.city ? '位于意向城市' : '可作为其他城市的备选'}；${job.direction === profile.direction ? '岗位方向与当前意向相关' : `可进一步了解${job.direction}方向`}。${job.gap}`}));
  }
  function programsFor(jobs) {
    const groups = new Map(), applications = store.snapshot().applications;
    jobs.filter(job => job.type === '校招').forEach(job => {
      const id = `campus:${job.company}:${job.year || 'unknown'}`;
      if (!groups.has(id)) groups.set(id, {id, company: job.company, programName: `${job.year || '应届生'}届校园招聘`, batchYear: job.year || null,
        batchType: '秋季校招', endDate: job.deadline, targetDegrees: [job.education], reason: job.recommendationReason,
        risk: job.year ? '' : '公告未明确毕业年份，请核实参加资格。', jobIds: []});
      groups.get(id).jobIds.push(job.id);
    });
    return [...groups.values()].map(program => {
      const added = program.jobIds.every(id => applications[id] && applications[id].status !== 'archived');
      return {...program, jobCount: program.jobIds.length, added,
        addedLabel: program.jobIds.every(id => applications[id]?.status === 'pending') ? '已加入待投' : '已在我的职位'};
    });
  }
  function createRun({points = [], context = {}} = {}) {
    active?.destroy();
    let profile = resumeProfile(points, context), jobs = recommend(profile), programs = programsFor(jobs);
    let destroyed = false, state = 'running', current = -1, signature = '', generation = 0;
    let profileStage = 0, directionCount = 0, scanned = 0, visibleIds = [], autoOpened = false;
    const timers = new Set(), tracker = scenarios.createJourney({title: 'AI 校招推荐', steps});
    tracker.element.classList.add('campus-run');
    $('app').classList.add('campus-split');
    const controller = window.XiaoyouCampusViews.mount({host: tracker.element, profile, jobs, programs: [], onAction});
    const run = {key: 'jobs', layout: 'split', title: description.title, steps, journey: tracker.element,
      status: index => steps[Math.min(index, steps.length - 1)].title,
      duration: index => [6200, 3200, 1700 + Math.ceil(jobs.length / 3) * 420, 1400][index],
      update, guide, result, destroy() {
        if (destroyed) return; destroyed = true; cancel(); controller.freeze();
        if (active === run) { active = null; $('app').classList.remove('campus-split'); }
      }
    };
    active = run;
    function alive() { return !destroyed && active === run; }
    function cancel() { generation++; timers.forEach(clearTimeout); timers.clear(); }
    function later(delay, fn) {
      const token = generation, timer = setTimeout(() => { timers.delete(timer); if (alive() && generation === token && state !== 'stopped') fn(); }, delay);
      timers.add(timer);
    }
    function directions() {
      const titles = profile.direction === '数据分析' ? ['数据分析', '产品分析', '业务分析'] : profile.direction === '用户研究' ? ['用户研究', '产品经理', '产品运营'] : ['产品经理', '产品运营', '用户研究'];
      return titles.map((title, index) => ({title, reason: index === 0 ? `结合${profile.direction}意向与现有项目经历，优先了解岗位职责。` : '现有需求调研、用户反馈和校园协作经历可作为进一步了解的依据。'}));
    }
    function patch(extra = {}) {
      if (!alive()) return;
      const visible = new Set(visibleIds);
      controller.update({profile, jobs, directions: directions(), profileStage, directionCount, visibleIds, scanned, total: jobs.length,
        programs: programs.filter(program => program.jobIds.some(id => visible.has(id))), ...extra});
      if (state === 'running') emit('xiaoyou:campus-product', {journey: tracker.element});
    }
    function phase(index, done = false) {
      // Advancing completes preceding products; stopping never fills absent ones.
      if (index > 0 || done) profileStage = 4;
      if (index > 1 || done) directionCount = 3;
      if (index > 2 || done) { scanned = jobs.length; visibleIds = jobs.map(job => job.id); }
      const name = done ? 'results' : ['profile', 'directions', 'search', 'results'][index];
      patch({phase: name, done, stopped: false});
      if (done) {
        if (!autoOpened) { autoOpened = true; later(500, () => { if (!$('preview').hidden) patch({openResults: true}); }); }
      } else if (index === 0) {
        for (let value = profileStage + 1; value <= 4; value++) later(700 + (value - profileStage - 1) * 1150, () => { profileStage = value; patch(); });
      } else if (index === 1) {
        for (let value = directionCount + 1; value <= 3; value++) later(500 + (value - directionCount - 1) * 650, () => { directionCount = value; patch(); });
      } else if (index === 2) {
        for (let offset = scanned; offset < jobs.length; offset += 3) later(700 + Math.floor((offset - scanned) / 3) * 420, () => {
          scanned = Math.min(jobs.length, offset + 3); visibleIds = jobs.slice(0, scanned).map(job => job.id); patch();
        });
      }
    }
    function update(index, nextState) {
      if (!alive() || signature === `${index}:${nextState}`) return;
      signature = `${index}:${nextState}`; cancel(); current = Math.min(index, steps.length - 1); state = nextState;
      tracker.update(current, state);
      if (state === 'stopped') { patch({stopped: true, done: false}); return; }
      phase(current, state === 'done');
    }
    function guide(text, contextPatch = {}) {
      if (!alive() || state === 'stopped') return;
      cancel(); profile = resumeProfile(points, {instruction: text, criteria: contextPatch.criteria});
      jobs = recommend(profile); programs = programsFor(jobs); scanned = 0; visibleIds = [];
      phase(Math.max(0, current), state === 'done');
    }
    function request(key, nextContext) { window.XiaoyouJobPages?.close(); emit('xiaoyou:scenario-request', {key, context: nextContext}); }
    function onAction(action, payload = {}) {
      if (!alive() || state !== 'done') return;
      const job = jobs.find(job => job.id === payload.jobId);
      if (action === 'tailor' && job) request('resume', {job: store.getJob(job.id)});
      else if (action === 'screen') {
        const ids = (payload.ids || []).filter(id => jobs.some(job => job.id === id));
        if (ids.length) request('screen', {jobIds: ids});
      } else if (action === 'add-pending' && job) {
        const old = store.snapshot().applications[job.id];
        if (!old || old.status === 'archived') store.upsertApplication(job.id, {status: 'pending'});
        notice('已加入本地待投清单');
      } else if (action === 'program-detail' || action === 'program-pending') {
        const program = programs.find(program => program.id === payload.programId); if (!program) return;
        if (action === 'program-detail') window.XiaoyouJobPages?.open('discovery', {jobId: program.jobIds[0]});
        else {
          const apps = store.snapshot().applications;
          program.jobIds.forEach(id => { if (!apps[id] || apps[id].status === 'archived') store.upsertApplication(id, {status: 'pending'}); });
          programs = programsFor(jobs); patch();
          notice('该项目的示例职位已加入本地待投清单');
        }
      }
    }
    function result() {
      const box = node('section', '', 'scenario-result campus-result');
      box.append(node('p', `已根据当前简历整理 ${programs.length} 个校招项目和 ${jobs.length} 个相关职位。画像与推荐方向保留在上方，可展开回看。`));
      const button = (text, fn, primary = false) => { const b = node('button', text, `scenario-button${primary ? ' is-primary' : ''}`); b.type = 'button'; b.onclick = () => { if (alive() && state === 'done') fn(); }; return b; };
      box.append(button('查看校招投递建议', () => { $('preview').hidden = false; $('app').classList.add('has-preview'); patch({openResults: true}); window.dispatchEvent(new Event('resize')); }, true),
        button('进一步精筛这些职位', () => onAction('screen', {ids: jobs.map(job => job.id)})),
        button('打开发现职位', () => window.XiaoyouJobPages?.open('discovery')));
      return box;
    }
    return run;
  }
  window.XiaoyouCampus = {createRun, describe: () => ({...description})};
})();
