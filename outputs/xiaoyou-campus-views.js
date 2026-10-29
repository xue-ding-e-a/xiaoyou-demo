/* Campus chat products and workspace tabs, with fictional data only.
 * Source: job-card-CCQTLojS.js JobCard/SkillTags (10px card, 5px tags, 150ms);
 * upagent-CFN5tJOA.js CampusShortlistItem @471680, CampusShortlistPanel @474200,
 * ShortlistAnchorCard @315996 and WorkspaceWindowHeader
 * @555625 (tablist Arrow/Home/End/Delete). Preview toolbar @534354 remains intact.
 * The current official session is unavailable; cached source is the visual basis.
 * mount({host,profile,jobs,onAction}) -> {update,freeze,destroy}.
 * update: phase/profileStage/directionCount/directions/visibleIds/scanned/total/
 * done/stopped/profile/jobs/programs/openResults. Programs are local examples;
 * their detail callback is an explicit demo adaptation of the official new-page
 * recruitment route. No network, workflow timers or A4 clones.
 */
(() => {
  'use strict';
  let active = null;
  const node = (tag, value = '', className = '') => {
    const result = document.createElement(tag); result.className = className;
    result.textContent = value; return result;
  };
  const append = (parent, ...children) => { parent.append(...children.filter(Boolean)); return parent; };
  const setText = (target, value) => { const text = String(value ?? ''); if (target.textContent !== text) target.textContent = text; };
  const count = value => Math.max(0, Math.floor(Number(value) || 0));
  const valueText = value => Array.isArray(value) ? value.map(valueText).filter(Boolean).join('；') : value && typeof value === 'object' ? valueText(value.text || value.description || value.title || value.name || value.label) : String(value ?? '');
  const values = value => Array.isArray(value) ? value.map(valueText).filter(Boolean) : value ? [valueText(value)] : [];
  const createButton = (label, handler, className = 'campus-button') => {
    const button = node('button', label, className); button.type = 'button'; button.addEventListener('click', handler); return button;
  };
  const sourceLabels = job => {
    const labels = values(job.sources).filter(source => source.includes('站内')).map(source => source.includes('校招') ? '站内校招' : '站内职位');
    return [...new Set(labels)];
  };
  const tag = value => node('span', value, 'campus-tag');
  const capture = (element, names) => new Map(names.map(name => [name, element.getAttribute(name)]));
  const restore = (element, attributes) => attributes.forEach((value, name) => value === null ? element.removeAttribute(name) : element.setAttribute(name, value));

  function mount(options = {}) {
    if (!options.host?.append) throw new TypeError('CampusViews requires a chat product host');
    const resume = document.getElementById('resume-tabpanel'), resumeTab = document.getElementById('resume-tab'), preview = document.getElementById('preview');
    const tablist = resumeTab?.closest('[role=tablist]');
    if (!resume || !resumeTab || !tablist) throw new TypeError('CampusViews requires the existing resume workspace');
    active?.freeze();
    let state = {phase: 'profile', profileStage: 0, directionCount: 0, visibleIds: [], scanned: 0, done: false, stopped: false, ...options};
    let frozen = false, detailId = null, currentPane = 'resume';
    const savedTab = capture(resumeTab, ['aria-selected', 'aria-controls', 'tabindex']);
    const savedResume = capture(resume, ['hidden', 'aria-hidden', 'aria-labelledby']);
    const animations = new Set(), revealed = new WeakSet(), listeners = [];
    const chat = node('div', '', 'campus-chat-products'); options.host.append(chat);
    const motionHead = node('header', '', 'campus-motion-head'), brand = node('div', '', 'campus-motion-brand');
    const brandImage = node('img'); brandImage.src = 'upcv-assets/dark.svg'; brandImage.alt = ''; brandImage.setAttribute('aria-hidden', 'true');
    append(brand, brandImage, node('span', '✓', 'campus-motion-complete'));
    const headCopy = node('div', '', 'campus-motion-head-copy'), motionTitle = node('strong', '正在读懂你的经历'), motionSubtitle = node('small', '从简历事实出发，寻找下一步机会');
    append(headCopy, motionTitle, motionSubtitle); append(motionHead, brand, headCopy); chat.append(motionHead);
    const readingTrack = node('div', '', 'campus-reading-track'); readingTrack.setAttribute('aria-hidden', 'true');
    const readingSteps = ['教育', '经历', '技能', '方向'].map((label, index) => {
      const segment = node('div', '', 'campus-reading-segment'); segment.dataset.index = String(index + 1);
      append(segment, node('i'), node('span', label)); readingTrack.append(segment); return segment;
    }); chat.append(readingTrack);
    const workspace = node('section', '', 'campus-workspace');
    workspace.id = 'scenario-workspace'; workspace.dataset.scenario = 'jobs'; workspace.dataset.layout = 'split';
    workspace.setAttribute('role', 'tabpanel'); workspace.setAttribute('aria-labelledby', 'campus-results-tab'); workspace.hidden = true;
    resume.after(workspace);
    const paneHeader = append(node('header', '', 'campus-pane-header'), node('h2', '校招投递建议'), node('p', '本次筛选出的校招项目 · 加入后进待投清单', 'campus-list-summary'));
    const content = node('div', '', 'campus-results-scroll'), programList = node('div', '', 'campus-program-list');
    const relatedHeading = node('h3', '相关职位', 'campus-related-heading'), list = node('div', '', 'campus-job-list'), empty = node('p', '正在整理站内校招与职位…', 'campus-empty');
    const exampleNote = node('p', '本地校招项目与职位示例；画像和检索过程为演示，不连接官网 Agent 或招聘后台。', 'campus-example-note');
    append(content, programList, empty, relatedHeading, list, exampleNote); append(workspace, paneHeader, content);
    const tabs = new Map(), jobRefs = new Map(), programRefs = new Map();
    const jobs = () => Array.isArray(state.jobs) ? state.jobs : [];
    const visibleJobs = () => { const byId = new Map(jobs().map(job => [job.id, job])); return [...new Set(state.visibleIds || [])].map(id => byId.get(id)).filter(Boolean); };
    const visiblePrograms = () => { const ids = new Set(state.visibleIds || []); return (Array.isArray(state.programs) ? state.programs : []).filter(program => values(program.jobIds).length ? values(program.jobIds).some(id => ids.has(id)) : state.done || state.phase === 'results'); };
    const canAct = () => !frozen && Boolean(state.done) && !state.stopped;
    const emit = (action, payload) => { if (canAct()) state.onAction?.(action, payload); };
    const listen = (target, event, handler, options) => { target.addEventListener(event, handler, options); listeners.push(() => target.removeEventListener(event, handler, options)); };
    const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reduced = () => state.stopped || frozen || motionPreference?.matches;
    function stopAnimations() { animations.forEach(animation => animation.cancel()); animations.clear(); }
    if (motionPreference?.addEventListener) listen(motionPreference, 'change', event => { chat.dataset.motion = event.matches ? 'still' : 'live'; if (event.matches) stopAnimations(); });
    function animate(element, frames, options = {}) {
      if (reduced() || typeof element?.animate !== 'function') return null;
      const animation = element.animate(frames, {duration: 520, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards', ...options});
      animations.add(animation); animation.finished?.then(() => animations.delete(animation), () => animations.delete(animation)); return animation;
    }
    function reveal(element, show, delay = 0) {
      if (!show) return false;
      element.hidden = false;
      if (revealed.has(element)) return false;
      revealed.add(element);
      animate(element, [{opacity: 0, transform: 'translateY(18px) scale(.985)'}, {opacity: 1, transform: 'translateY(0) scale(1)'}], {duration: 540, delay});
      return true;
    }
    function group(label, className) {
      const root = node('details', '', `campus-product-group ${className}`), title = node('span', label), meta = node('small'), body = node('div', '', 'campus-product-body');
      root.open = true; root.hidden = true;
      append(root, append(node('summary'), title, meta, node('span', '⌄', 'campus-chevron')), body); chat.append(root);
      return {root, title, meta, body};
    }
    const profileGroup = group('用户画像', 'campus-profile-product');
    const facts = ['教育背景', '经历概览', '项目与技能', '求职方向'].map((title, index) => {
      const card = node('section', '', 'campus-profile-card'); card.dataset.profileIndex = String(index + 1); card.hidden = true;
      const mark = node('span', '✓', 'campus-fact-mark'), rowCount = node('small', `0${index + 1}`, 'campus-profile-order');
      const rows = node('dl'); append(card, append(node('h4'), node('span', title), mark, rowCount), rows); profileGroup.body.append(card);
      return {card, rows, mark, signature: ''};
    });
    const profileReady = node('div', '', 'campus-profile-ready'); profileReady.hidden = true;
    append(profileReady, node('span', '✦', 'campus-profile-ready-mark'), append(node('div'), node('strong', '画像已整理'), node('small', '推荐将沿用这些经历与求职意向'))); profileGroup.body.append(profileReady);
    const directionGroup = group('可继续了解的方向', 'campus-direction-product');
    const directions = Array.from({length: 3}, (_, index) => {
      const card = node('section', '', 'campus-direction-card'), title = node('h4'), reason = node('p'); card.hidden = true;
      const titleLine = append(node('div', '', 'campus-direction-title-row'), title, index === 0 ? node('small', '优先了解', 'campus-direction-priority') : null);
      const seal = node('div', '', 'campus-direction-seal'), circle = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      circle.setAttribute('viewBox', '0 0 44 44'); circle.setAttribute('aria-hidden', 'true');
      const track = document.createElementNS('http://www.w3.org/2000/svg', 'circle'), arc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      for (const part of [track, arc]) { part.setAttribute('cx', '22'); part.setAttribute('cy', '22'); part.setAttribute('r', '18'); part.setAttribute('pathLength', '100'); }
      track.setAttribute('class', 'campus-direction-ring-track'); arc.setAttribute('class', 'campus-direction-ring-arc'); append(circle, track, arc);
      append(seal, circle, node('span', '↗'), node('small', '已梳理')); seal.setAttribute('aria-label', '推荐方向已梳理');
      append(card, node('span', String(index + 1).padStart(2, '0'), 'campus-direction-number'), append(node('div', '', 'campus-direction-copy'), titleLine, reason), seal);
      directionGroup.body.append(card); return {card, title, reason, arc, seal};
    });
    const searchGroup = group('站内检索记录', 'campus-search-product'), progress = node('progress'), progressCopy = node('p', '', 'campus-search-status');
    progress.max = 100; progress.setAttribute('aria-label', '站内职位整理进度');
    const sourceStrip = node('div', '', 'campus-source-strip'), sourceRefs = ['站内校招', '站内职位'].map(label => {
      const item = node('div', '', 'campus-source-card'), value = node('strong', '0'), status = node('small', '待整理');
      const sourceGlyph = node('i', label === '站内校招' ? '▥' : '▤', 'campus-source-glyph'); sourceGlyph.setAttribute('aria-hidden', 'true');
      append(item, sourceGlyph, node('span', label), value, status); sourceStrip.append(item); return {label, item, value, status, received: 0};
    });
    const searchStage = node('div', '', 'campus-search-stage'), searchOrbit = node('div', '', 'campus-search-orbit'); searchOrbit.setAttribute('aria-hidden', 'true');
    append(searchOrbit, node('i'), node('i'), node('i'), node('span', '✦'));
    const searchCopy = append(node('div', '', 'campus-search-stage-copy'), node('strong', '连接方向与机会'), progressCopy);
    append(searchStage, searchOrbit, searchCopy); append(searchGroup.body, searchStage, progress, sourceStrip);
    const anchor = createButton('', () => showResults(), 'campus-shortlist-anchor'); anchor.hidden = true;
    const anchorTitle = node('strong'), anchorCopy = node('small'); append(anchor, node('span', '▤', 'campus-anchor-icon'), append(node('span', '', 'campus-anchor-copy'), anchorTitle, anchorCopy), node('span', '›', 'campus-anchor-arrow')); chat.append(anchor);
    const historyNote = node('p', '', 'campus-history-note'); historyNote.hidden = true; chat.append(historyNote);

    function allTabs() { return [resumeTab, ...[...tabs.values()].map(tab => tab.button)].filter(tab => tab.isConnected); }
    function activate(name, focus = false) {
      if (frozen) return;
      if (name !== 'resume' && !tabs.has(name)) return;
      currentPane = name;
      resume.hidden = name !== 'resume'; resume.setAttribute('aria-hidden', String(name !== 'resume'));
      resumeTab.setAttribute('aria-selected', String(name === 'resume')); resumeTab.tabIndex = name === 'resume' ? 0 : -1;
      tabs.forEach((tab, key) => { const selected = key === name; tab.pane.hidden = !selected; tab.button.setAttribute('aria-selected', String(selected)); tab.button.tabIndex = selected ? 0 : -1; });
      if (focus) (name === 'resume' ? resumeTab : tabs.get(name).button).focus();
      if (name === 'resume') window.dispatchEvent(new Event('resize'));
    }
    function closeTab(name) {
      if (frozen) return;
      const tab = tabs.get(name); if (!tab) return;
      const selected = currentPane === name; tabs.delete(name); tab.wrapper.remove(); tab.pane.hidden = true;
      if (name === 'detail') { tab.pane.remove(); detailId = null; }
      if (selected) activate(name === 'detail' && tabs.has('results') ? 'results' : 'resume', true);
    }
    function addTab(name, id, label, pane) {
      const existing = tabs.get(name); if (existing) return existing;
      const wrapper = node('div', '', 'workspace-tab campus-window-tab'); wrapper.dataset.windowTab = 'true';
      const button = createButton('', () => activate(name), 'campus-window-tab-button'); button.id = id;
      button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', pane.id); button.setAttribute('aria-selected', 'false'); button.tabIndex = -1;
      append(button, node('span', name === 'results' ? '▤' : '▧', 'campus-tab-icon'), node('span', label, 'campus-tab-title'));
      const close = createButton('×', () => closeTab(name), 'workspace-tab-close campus-window-tab-close'); close.tabIndex = -1; close.title = `关闭 ${label}`; close.setAttribute('aria-label', `关闭 ${label}`);
      append(wrapper, button, close); tablist.append(wrapper);
      const tab = {wrapper, button, close, pane}; tabs.set(name, tab); return tab;
    }
    function ensureResultsTab() { return addTab('results', 'campus-results-tab', `校招投递建议 · 筛出 ${visiblePrograms().length} 个项目`, workspace); }
    function showResults(automatic = false) {
      if (frozen || automatic && preview?.hidden) return;
      if (!automatic && preview?.hidden) document.querySelector('[data-panel="resume"]')?.click();
      if (preview?.hidden) return;
      ensureResultsTab(); activate('results');
    }
    function reasonFor(job) { return valueText(job.recommendationReason || job.shortReason || job.reason || job.gap) || `可结合${valueText(state.profile?.direction) || '求职'}方向进一步核对职责与要求。`; }
    function jobKeywords(job) { return values(job.keywords?.length ? job.keywords : [...values(job.requiredSkills), ...values(job.preferredSkills), ...values(job.domains)]).slice(0, 5); }
    function renderJob(job) {
      const card = createButton('', () => showDetail(job.id), 'campus-job-card'); card.dataset.jobId = job.id;
      const title = node('h3'), salary = node('span', '', 'campus-job-salary'), meta = node('p', '', 'campus-job-meta'), skills = node('div', '', 'campus-job-skills');
      const company = node('span'), sources = node('span', '', 'campus-job-sources'), reason = node('p', '', 'campus-job-reason');
      append(card, append(node('div', '', 'campus-job-title-row'), title, salary), meta, skills, append(node('div', '', 'campus-job-company'), node('span', '▧', 'campus-company-icon'), company, sources), reason);
      return {card, update(record) {
        setText(title, record.title); setText(salary, record.salary || '薪资待核实'); setText(meta, [record.city || '城市待核实', record.education || '学历待核实', record.major].filter(Boolean).join(' · '));
        const keywords = jobKeywords(record), signature = keywords.join('|'); if (skills.dataset.signature !== signature) { skills.replaceChildren(...keywords.map(tag)); skills.dataset.signature = signature; } skills.hidden = !keywords.length;
        setText(company, typeof record.company === 'object' ? record.company.name : record.company); setText(sources, sourceLabels(record).join(' / ') || '来源待核实'); setText(reason, reasonFor(record));
      }};
    }
    function renderProgram(program) {
      const card = node('article', '', 'campus-program-card'); card.dataset.programId = program.id;
      const main = createButton('', () => emit('program-detail', {programId: program.id}), 'campus-program-open');
      const title = node('h3'), company = node('p', '', 'campus-program-company'), tags = node('div', '', 'campus-program-tags');
      const reason = node('p'), risk = node('p', '', 'campus-program-risk');
      append(main, append(node('div', '', 'campus-program-title-row'), title, node('span', '↗', 'campus-program-external')), company, tags, append(node('div', '', 'campus-program-reason'), node('span', '推荐理由'), reason), risk);
      const pending = createButton('加入待投', () => emit('program-pending', {programId: program.id})); pending.dataset.programAction = 'pending';
      append(card, main, append(node('footer', '', 'campus-program-actions'), node('small', '仅加入本地待投清单'), pending));
      return {card, main, pending, update(record) {
        const name = record.programName || `${record.batchYear || ''}届校园招聘`, batch = [record.batchYear ? `${record.batchYear}届` : '', record.batchType].filter(Boolean).join(' · ');
        setText(title, name); setText(company, [valueText(record.company), batch].filter(Boolean).join(' · ')); main.setAttribute('aria-label', `查看校招详情：${valueText(record.company)}·${name}`);
        const labels = [...record.endDate ? [`截止 ${record.endDate}`] : [], ...values(record.targetDegrees).length ? [values(record.targetDegrees).join('/')] : [], `${count(record.jobCount)} 个岗位`];
        const signature = labels.join('|'); if (tags.dataset.signature !== signature) { tags.replaceChildren(...labels.map(tag)); tags.dataset.signature = signature; }
        setText(reason, record.reason || '可结合个人方向和项目要求进一步核对。'); setText(risk, record.risk || ''); risk.hidden = !record.risk;
        const added = record.pending === true || record.added === true; setText(pending, added ? record.addedLabel || '已加入待投' : '加入待投'); pending.disabled = !canAct() || added; main.disabled = !canAct();
      }};
    }
    function detailSection(title, text) { return append(node('section', '', 'campus-detail-section'), node('h3', title), node('p', text || '待核实')); }
    function showDetail(jobId) {
      if (frozen) return; const job = jobs().find(job => job.id === jobId); if (!job || !(state.visibleIds || []).includes(jobId)) return;
      let pane = tabs.get('detail')?.pane;
      if (!pane) { pane = node('section', '', 'campus-workspace campus-detail-panel'); pane.id = 'campus-detail-panel'; pane.setAttribute('role', 'tabpanel'); pane.setAttribute('aria-labelledby', 'campus-detail-tab'); pane.hidden = true; workspace.after(pane); addTab('detail', 'campus-detail-tab', job.title, pane); }
      detailId = jobId;
      const head = append(node('header', '', 'campus-pane-header'), node('h2', job.title), node('p', [valueText(job.company), job.city, job.salary].filter(Boolean).join(' · ')));
      const scroll = node('div', '', 'campus-detail-scroll');
      append(scroll, append(node('div', '', 'campus-detail-tags'), ...[job.type, job.education, ...sourceLabels(job)].filter(Boolean).map(tag)), detailSection('岗位职责', valueText(job.duties)), detailSection('任职要求', valueText(job.requirements)), detailSection('推荐说明', reasonFor(job)));
      const actions = node('footer', '', 'campus-detail-actions');
      append(actions, createButton('定制简历', () => emit('tailor', {jobId}), 'campus-button is-primary'), createButton('精筛这个职位', () => emit('screen', {ids: [jobId]})), createButton('加入待投', () => emit('add-pending', {jobId})));
      pane.replaceChildren(head, scroll, actions); tabs.get('detail').button.querySelector('.campus-tab-title').textContent = job.title;
      tabs.get('detail').close.setAttribute('aria-label', `关闭 ${job.title}`); refreshActions(); activate('detail');
    }
    function refreshActions() {
      tabs.get('detail')?.pane.querySelectorAll('.campus-detail-actions button').forEach(button => { button.disabled = !canAct(); });
      visiblePrograms().forEach(program => programRefs.get(program.id)?.update(program));
    }
    function onTabsKey(event) {
      const target = event.target.closest('[role=tab]'); if (!target || !allTabs().includes(target)) return;
      if (event.key === 'Delete') { if (target === resumeTab) return; event.preventDefault(); const entry = [...tabs].find(([, tab]) => tab.button === target); if (entry) closeTab(entry[0]); return; }
      const current = allTabs(), index = current.indexOf(target); let next;
      if (event.key === 'ArrowRight') next = current[(index + 1) % current.length];
      if (event.key === 'ArrowLeft') next = current[(index - 1 + current.length) % current.length];
      if (event.key === 'Home') next = current[0]; if (event.key === 'End') next = current.at(-1);
      if (!next) return; event.preventDefault(); const entry = [...tabs].find(([, tab]) => tab.button === next); activate(next === resumeTab ? 'resume' : entry[0], true);
    }
    listen(resumeTab, 'click', () => activate('resume')); listen(tablist, 'keydown', onTabsKey);
    ensureResultsTab(); activate('resume');

    function setFacts(ref, rows) {
      const signature = JSON.stringify(rows); if (signature === ref.signature) return; ref.signature = signature;
      ref.rows.replaceChildren(...rows.map(([label, value]) => append(node('div'), node('dt', label), node('dd', valueText(value) || '尚未提供'))));
    }
    function update(patch = {}) {
      if (frozen) return;
      state = {...state, ...patch, profile: patch.profile ? {...state.profile, ...patch.profile} : state.profile};
      if (state.stopped) stopAnimations();
      chat.dataset.phase = state.phase; chat.dataset.done = String(Boolean(state.done)); chat.dataset.stopped = String(Boolean(state.stopped)); workspace.dataset.done = String(Boolean(state.done));
      const p = state.profile || {}, stage = Math.min(4, count(state.profileStage)), directionCount = Math.min(3, count(state.directionCount));
      chat.dataset.motion = reduced() ? 'still' : 'live'; motionHead.dataset.complete = String(Boolean(state.done));
      setText(motionTitle, state.stopped ? '已停止，保留当前思考' : state.done ? '已为你整理校招与职位建议' : state.phase === 'profile' ? '正在读懂你的经历' : state.phase === 'directions' ? '让经历连接更多可能' : '正在寻找值得了解的机会');
      setText(motionSubtitle, state.stopped ? '已出现的画像和方向仍可展开回看' : state.done ? `${programsForHead()} · 结合简历事实整理` : state.phase === 'profile' ? `${p.name || '当前简历'} · ${stage ? ['教育背景', '经历概览', '项目与技能', '求职方向'][stage - 1] : '准备读取简历'}` : state.phase === 'directions' ? '从已有经历出发，逐一梳理推荐方向' : '站内校招 · 站内职位，保留来源与依据');
      readingSteps.forEach((segment, index) => { segment.dataset.complete = String(stage > index); segment.dataset.active = String(!state.stopped && !state.done && state.phase === 'profile' && stage === index + 1); });
      const profileRows = [
        [['学校', p.school], ['学历 / 届别', [p.education, p.year ? `${p.year}届` : ''].filter(Boolean).join(' · ')], ['专业', p.major]],
        [['实习经历', p.internship || p.experience || p.experiences], ['经历补充', p.experienceNote || p.internshipNote || '可在对话中补充经历细节']],
        [['项目经历', p.projects], ['技能', p.skills || p.keywords]],
        [['意向方向', p.direction], ['意向城市', p.city], ['待补信息', p.missingInfo || p.missing || '继续核对岗位要求与个人贡献']]
      ];
      reveal(profileGroup.root, stage > 0); setText(profileGroup.meta, `${stage} / 4`);
      facts.forEach((ref, index) => {
        setFacts(ref, profileRows[index]);
        const entered = reveal(ref.card, stage > index), reading = !state.stopped && !state.done && state.phase === 'profile' && stage === index + 1;
        ref.card.dataset.active = String(reading); ref.card.dataset.complete = String(stage > index && !reading); setText(ref.mark, reading ? '·' : '✓');
        if (entered) {
          [...ref.rows.children].forEach((row, rowIndex) => animate(row, [{opacity: 0, transform: 'translateY(7px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 440, delay: 120 + rowIndex * 115}));
          animate(ref.mark, [{opacity: 0, transform: 'scale(.45)'}, {opacity: 1, transform: 'scale(1)'}], {duration: 420, delay: 300});
        }
      });
      const profileComplete = stage === 4 && state.phase !== 'profile'; profileGroup.root.dataset.complete = String(profileComplete);
      if (reveal(profileReady, profileComplete)) animate(profileGroup.body, [{transform: 'translateY(6px)'}, {transform: 'translateY(0)'}], {duration: 680});
      const defaultTitles = p.direction === '数据分析' ? ['数据分析', '产品分析', '业务分析'] : p.direction === '用户研究' ? ['用户研究', '产品经理', '产品运营'] : ['产品经理', '产品运营', '用户研究'];
      const directionValues = state.directions || p.directions || defaultTitles.map(title => ({title, reason: '结合现有简历经历，继续核对岗位职责与能力要求。'}));
      reveal(directionGroup.root, directionCount > 0); setText(directionGroup.meta, `${directionCount} 个方向`);
      directions.forEach((ref, index) => {
        const record = directionValues[index]; if (!record) return; setText(ref.title, typeof record === 'string' ? record : record.title || record.name); setText(ref.reason, typeof record === 'string' ? '可继续了解对应岗位要求。' : record.reason || record.description || '可继续了解对应岗位要求。');
        if (reveal(ref.card, directionCount > index, index * 100)) {
          animate(ref.arc, [{strokeDashoffset: 100}, {strokeDashoffset: 0}], {duration: 900, delay: 180 + index * 100});
          animate(ref.seal.querySelector('span'), [{opacity: 0, transform: 'translate(-3px,3px) scale(.6)'}, {opacity: 1, transform: 'translate(0,0) scale(1)'}], {duration: 540, delay: 320 + index * 100});
        }
      });
      const visible = visibleJobs(), programs = visiblePrograms(), total = Math.max(jobs().length, count(state.total)), scanned = Math.min(total, count(state.scanned));
      reveal(searchGroup.root, ['search', 'results'].includes(state.phase) || scanned > 0 || state.done); setText(searchGroup.meta, `${visible.length} 个已整理`);
      progress.value = total ? Math.min(100, (state.done ? total : scanned) / total * 100) : 0;
      setText(progressCopy, state.stopped ? `已停止，保留 ${visible.length} 个已整理职位` : state.done ? `已整理 ${visible.length} 个校招与职位，可在右侧查看详情。` : `正在整理站内来源 · ${scanned} / ${total}`);
      sourceRefs.forEach(ref => {
        const available = jobs().filter(job => sourceLabels(job).includes(ref.label)).length, received = visible.filter(job => sourceLabels(job).includes(ref.label)).length;
        setText(ref.value, `${received} / ${available}`); setText(ref.status, state.stopped ? '已停止' : state.done ? '已整理' : received ? '整理中' : '待整理'); ref.item.dataset.active = String(!state.done && !state.stopped && received > 0); ref.item.dataset.complete = String(Boolean(state.done));
        if (received > ref.received) animate(ref.value, [{opacity: .25, transform: 'translateY(5px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 440});
        ref.received = received;
      });
      const ids = new Set(visible.map(job => job.id)); jobRefs.forEach((ref, id) => { ref.card.hidden = !ids.has(id); });
      visible.forEach((job, index) => { let ref = jobRefs.get(job.id); if (!ref) { ref = renderJob(job); jobRefs.set(job.id, ref); } ref.update(job); const current = list.children[index]; if (current !== ref.card) list.insertBefore(ref.card, current || null); reveal(ref.card, true); });
      const programIds = new Set(programs.map(program => program.id)); programRefs.forEach((ref, id) => { ref.card.hidden = !programIds.has(id); });
      programs.forEach((program, index) => { let ref = programRefs.get(program.id); if (!ref) { ref = renderProgram(program); programRefs.set(program.id, ref); } ref.update(program); const current = programList.children[index]; if (current !== ref.card) programList.insertBefore(ref.card, current || null); reveal(ref.card, true); });
      const title = `校招投递建议 · 筛出 ${programs.length} 个项目`;
      setText(paneHeader.querySelector('h2'), title); setText(paneHeader.querySelector('p'), `本次筛选出的校招项目 · 加入后进待投清单 · ${visible.length} 个相关职位`);
      const resultsTab = tabs.get('results'); if (resultsTab) { setText(resultsTab.button.querySelector('.campus-tab-title'), title); resultsTab.button.title = title; resultsTab.close.setAttribute('aria-label', `关闭 ${title}`); }
      relatedHeading.hidden = !visible.length; list.hidden = !visible.length; empty.hidden = programs.length > 0; setText(empty, state.done ? '暂无校招投递建议，可在对话中调整方向后重新整理。' : state.stopped ? '已停止，暂无整理项目。' : '正在整理站内校招项目…');
      reveal(anchor, programs.length > 0 || visible.length > 0); setText(anchorTitle, title); setText(anchorCopy, [...new Set(programs.map(program => valueText(program.company)))].slice(0, 3).join('、') || '本地校招与职位示例'); anchor.disabled = !programs.length && !visible.length;
      if (detailId && !ids.has(detailId)) closeTab('detail'); refreshActions();
      if (patch.openResults) showResults(true);
    }
    function programsForHead() { return `${visiblePrograms().length} 个校招项目 · ${visibleJobs().length} 个相关职位`; }
    function freeze() {
      if (frozen) return; frozen = true; stopAnimations();
      listeners.splice(0).forEach(remove => remove());
      chat.dataset.frozen = 'true'; chat.querySelectorAll('button').forEach(button => { button.disabled = true; });
      historyNote.hidden = false; setText(historyNote, '本次整理已结束，以上过程可展开回看。');
      tabs.forEach(tab => { tab.wrapper.remove(); if (tab.pane !== workspace) tab.pane.remove(); }); tabs.clear(); workspace.remove();
      restore(resumeTab, savedTab); restore(resume, savedResume);
      if (active === controller) active = null;
    }
    const controller = {update, freeze, destroy: freeze}; active = controller; update(options); return controller;
  }
  window.XiaoyouCampusViews = {mount};
})();
