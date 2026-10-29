/* Public UI anchors: page-BREsbs7n.js pe/D; recruitment-detail-panel-DHrU7BsR.js
 * AiQuestionBar/AiApplyButton; job-progress-view-hCRHSlg2.js Ut/Bt/Ca.
 * These pages share fictional Demo state only. Browser parity limits are documented separately. */
(() => {
  'use strict';
  const store = window.XiaoyouCareerStore;
  if (!store) throw new Error('Load xiaoyou-career-store.js before job pages.');
  const labels = { pending: '待投递', applied: '已投递', replied: '已回复', interview: '已约面', offer: 'Offer', archived: '已归档' };
  const el = (tag, text = '', className = '') => { const item = document.createElement(tag); item.textContent = text; item.className = className; return item; };
  const icon = name => { const item = el('i'); item.dataset.icon = name; item.setAttribute('aria-hidden', 'true'); if (window.UPCV_ICONS?.[name]) item.style.setProperty('--icon', `url("${window.UPCV_ICONS[name]}")`); return item; };
  const btn = (text, handler, className = '', iconName) => { const item = el('button', '', `career-button ${className}`); item.type = 'button'; if (iconName) item.append(icon(iconName)); item.append(el('span', text)); if (handler) item.onclick = handler; return item; };
  const iconBtn = (text, handler, name) => { const item = btn('', handler, 'career-icon-button', name); item.setAttribute('aria-label', text); item.title = text; return item; };
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
  const notice = text => emit('xiaoyou:notice', { text });
  const root = el('section', '', 'career-pages'); root.id = 'career-pages'; root.hidden = true; root.tabIndex = -1; root.setAttribute('aria-label', '求职工作台');
  let page = 'discovery', active = false, previousFocus = null, detailId = '', detailTab = 'announcement', mobileDetail = false, showAdd = false;
  let search = '', edition = 'campus', view = 'list', progressStatus = 'all', source = 'all', showArchived = false;
  let filters = { type: 'all', kind: 'all', sort: 'latest', city: 'all', industry: 'all', major: 'all', education: 'all', companyType: 'all' };
  const inertBefore = new Map();
  const expandedInterviews = new Set(), boardAnimations = new Set();
  const boardLabels = { applied: '已投递', replied: 'HR 已读', interview: '面试', offer: '结果' };
  try { view = localStorage.getItem('xiaoyou-demo:jobs-view:v1') === 'board' ? 'board' : 'list'; } catch (_) { /* Use list in memory. */ }
  const visibleJob = () => store.getJob(detailId);
  const selectedIds = () => store.snapshot().selectedIds;
  function route(action, jobIds) {
    const resolved = [...new Set((jobIds || selectedIds()).filter(id => store.getJob(id)))];
    close(); emit('xiaoyou:career-action', { action, jobIds: resolved });
  }
  function toggleSelected(id, checked) { const ids = new Set(selectedIds()); checked ? ids.add(id) : ids.delete(id); store.setSelected([...ids]); }
  function check(label, checked, handler) { const item = el('input'); item.type = 'checkbox'; item.checked = checked; item.setAttribute('aria-label', label); item.dataset.focusKey = `check-${label}`; item.onclick = event => event.stopPropagation(); item.onchange = () => handler(item.checked); return item; }
  function tag(text, tone = '') { return el('span', text, `career-tag ${tone}`); }
  function avatar(job) { return el('span', job.company.slice(0, 1), 'career-avatar'); }
  function selectedButton(text, chosen, handler, className = '') { const item = btn(text, handler, className); item.setAttribute('aria-pressed', String(chosen)); return item; }
  function empty(title, description, action) {
    const box = el('div', '', 'career-empty'); box.append(icon('briefcase'), el('h3', title), el('p', description)); if (action) box.append(action); return box;
  }
  function positionBoardStatusMenu(wrap) {
    const card = wrap.closest('.career-board-card');
    if (!card) return;
    card.classList.toggle('is-menu-open', wrap.open);
    if (!wrap.open) return;
    const summary = wrap.querySelector('summary'), menu = wrap.querySelector('.career-dropdown-menu');
    const scroller = wrap.closest('.career-progress-content');
    if (!summary || !menu || !scroller) return;
    const bounds = scroller.getBoundingClientRect(), anchor = summary.getBoundingClientRect();
    const top = Math.max(8, bounds.top + 8), bottom = Math.min(window.innerHeight - 8, bounds.bottom - 8);
    const below = Math.max(0, bottom - anchor.bottom - 4), above = Math.max(0, anchor.top - top - 4);
    const desired = Math.min(260, menu.scrollHeight || 208), opensUp = below < desired && above > below;
    menu.style.top = opensUp ? 'auto' : 'calc(100% + 4px)';
    menu.style.bottom = opensUp ? 'calc(100% + 4px)' : 'auto';
    menu.style.maxHeight = `${Math.max(40, Math.min(260, opensUp ? above : below))}px`;
    menu.style.transform = '';
    const menuBounds = menu.getBoundingClientRect();
    const left = Math.max(8, bounds.left + 8), right = Math.min(window.innerWidth - 8, bounds.right - 8);
    const shift = menuBounds.left < left ? left - menuBounds.left : menuBounds.right > right ? right - menuBounds.right : 0;
    if (shift) menu.style.transform = `translateX(${shift}px)`;
  }
  function dropdown(label, choices, value, handler, key = '') {
    const wrap = el('details', '', 'career-dropdown');
    const summary = el('summary'); summary.append(el('span', choices.find(choice => choice[0] === value)?.[1] || label), icon('caret-down')); summary.setAttribute('aria-label', label); summary.setAttribute('aria-haspopup', 'menu'); summary.dataset.focusKey = key;
    const menu = el('div', '', 'career-dropdown-menu'); menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', label);
    choices.forEach(([choice, title]) => {
      const option = btn(title, () => { wrap.open = false; handler(choice); }, 'career-dropdown-option'); option.setAttribute('role', 'menuitemradio'); option.setAttribute('aria-checked', String(choice === value)); option.dataset.focusKey = key;
      if (choice === value) { const mark = el('span', '✓', 'career-menu-check'); mark.setAttribute('aria-hidden', 'true'); option.append(mark); } menu.append(option);
    });
    summary.addEventListener('click', () => { root.querySelectorAll('.career-dropdown[open]').forEach(other => { if (other !== wrap) other.open = false; }); });
    wrap.addEventListener('toggle', () => { summary.setAttribute('aria-expanded', String(wrap.open)); positionBoardStatusMenu(wrap); });
    wrap.addEventListener('keydown', event => {
      const options = [...menu.querySelectorAll('button')]; let index = options.indexOf(document.activeElement);
      if (event.key === 'Escape' && wrap.open) { event.stopPropagation(); wrap.open = false; summary.focus(); }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault(); wrap.open = true;
        index = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        positionBoardStatusMenu(wrap); options[index]?.focus({ preventScroll: true });
      }
    });
    wrap.append(summary, menu); return wrap;
  }
  function searchInput() {
    const wrap = el('label', '', 'career-search'); wrap.append(icon('magnifying-glass'));
    const input = el('input'); input.type = 'search'; input.placeholder = page === 'discovery' ? '搜索公司、职位或关键词' : '搜索公司或职位'; input.setAttribute('aria-label', input.placeholder); input.value = search; input.dataset.focusKey = 'search';
    input.oninput = () => { search = input.value; render(); }; wrap.append(input); return wrap;
  }
  function header() {
    const head = el('header', '', 'career-header');
    const intro = el('div', '', 'career-header-copy'); intro.append(el('h1', page === 'discovery' ? '求职' : '我的职位'), el('p', page === 'discovery' ? '追踪校招进度与社招机会，快速定位目标职位。' : '从待投到 Offer，一站跟进'));
    const actions = el('div', '', 'career-header-actions');
    if (page === 'discovery') {
      const tabs = el('div', '', 'career-segment'); tabs.setAttribute('aria-label', '招聘类型');
      tabs.append(selectedButton('校招', edition === 'campus', () => { edition = 'campus'; filters.type = 'all'; detailId = ''; render(); }, '', 'briefcase'), selectedButton('社招', edition === 'social', () => { edition = 'social'; filters.type = 'all'; detailId = ''; render(); })); actions.append(tabs);
    } else {
      actions.append(btn('添加职位', () => { showAdd = true; render(); }, '', 'note-pencil'), btn('Agent 帮我跟进', () => route('followup', Object.keys(store.snapshot().applications)), 'is-primary', 'sparkle'));
    }
    const back = btn('返回 Agent', close, 'career-back-agent', 'arrow-up'); back.setAttribute('aria-label', '返回 Agent 工作台'); actions.append(back);
    head.append(intro, actions); return head;
  }
  function filterRow() {
    const area = el('div', '', 'career-filters');
    const main = el('div', '', 'career-filter-main');
    const types = el('div', '', 'career-filter-chips');
    (edition === 'campus' ? [['all', '全部类型'], ['校招', '校招'], ['实习', '实习']] : [['all', '全部职位'], ['社招', '社招']]).forEach(([value, label]) => types.append(selectedButton(label, filters.type === value, () => { filters.type = value; render(); })));
    const kinds = el('div', '', 'career-filter-chips'); [['all', '全部'], ['company', '企业校招'], ['public', '事业单位']].forEach(([value, label]) => kinds.append(selectedButton(label, filters.kind === value, () => { filters.kind = value; render(); })));
    if (edition === 'social') kinds.hidden = true;
    main.append(types, kinds, searchInput());
    const row = el('div', '', 'career-filter-selects');
    const controls = [
      ['sort', '排序', [['latest', '最新'], ['deadline', '即将截止']]],
      ['companyType', '企业性质', [['all', '企业性质'], ['民营企业', '民营企业'], ['国有企业', '国有企业'], ['事业单位', '事业单位']]],
      ['city', '城市', [['all', '全国'], ['上海', '上海'], ['杭州', '杭州'], ['北京', '北京']]],
      ['industry', '行业', [['all', '全部行业'], ...[...new Set(store.getJobs().map(job => job.industry))].map(value => [value, value])]],
      ['major', '专业', [['all', '全部专业'], ['专业不限', '专业不限'], ['计算机类', '计算机类'], ['管理类', '管理类']]],
      ['education', '学历', [['all', '全部学历'], ['本科', '本科'], ['硕士', '硕士']]]
    ];
    controls.forEach(([key, label, values]) => row.append(dropdown(label, values, filters[key], value => { filters[key] = value; render(); }, `filter-${key}`)));
    row.append(btn('重置', () => { filters = { type: 'all', kind: 'all', sort: 'latest', city: 'all', industry: 'all', major: 'all', education: 'all', companyType: 'all' }; search = ''; render(); }, 'career-text-button'));
    area.append(main, row); return area;
  }
  function filteredJobs() {
    const needle = search.trim().toLowerCase();
    let result = store.getJobs().filter(job => (edition === 'social' ? job.type === '社招' : job.type !== '社招') &&
      (filters.type === 'all' || filters.type === job.type) &&
      (filters.kind === 'all' || (filters.kind === 'public' ? job.companyType === '事业单位' : job.companyType !== '事业单位')) &&
      ['city', 'industry', 'major', 'education', 'companyType'].every(key => filters[key] === 'all' || job[key] === filters[key]) &&
      (!needle || `${job.company} ${job.title} ${job.city} ${job.requirements} ${job.industry}`.toLowerCase().includes(needle)));
    if (filters.sort === 'deadline') result = result.sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'));
    return result;
  }
  function batchBar(ids, discovery = false) {
    const selected = selectedIds().filter(id => ids.includes(id)); const bar = el('div', '', 'career-batch-bar');
    bar.append(check('选择当前列表全部职位', ids.length > 0 && selected.length === ids.length, checked => { const next = new Set(selectedIds()); ids.forEach(id => checked ? next.add(id) : next.delete(id)); store.setSelected([...next]); }), el('span', selected.length ? `已选 ${selected.length} 个职位` : `共 ${ids.length} 个职位`));
    if (selected.length) {
      bar.append(btn('匹配分析', () => route('match', selected), 'career-small-button', 'sparkle'));
      if (discovery) bar.append(btn('加入待投', () => { selected.forEach(id => { if (!store.snapshot().applications[id]) store.upsertApplication(id, { status: 'pending' }); }); notice(`已将 ${selected.length} 个职位加入我的职位`); }, 'career-small-button'));
      else bar.append(btn('准备投递', () => route('deliver', selected), 'career-small-button is-primary'));
    }
    return bar;
  }
  function companyCard(job) {
    const card = el('article', '', `career-company-card${job.id === detailId ? ' is-selected' : ''}`); card.dataset.jobId = job.id;
    const top = el('div', '', 'career-company-top'); const selection = check(`选择 ${job.company} ${job.title}`, selectedIds().includes(job.id), checked => toggleSelected(job.id, checked)); top.append(avatar(job));
    const main = btn(job.company, () => { detailId = job.id; detailTab = 'announcement'; mobileDetail = true; render(); }, 'career-company-open'); main.setAttribute('aria-pressed', String(job.id === detailId)); top.append(main, selection);
    const detail = btn('', () => { detailId = job.id; detailTab = 'announcement'; mobileDetail = true; render(); }, 'career-company-body');
    detail.append(el('strong', job.type === '校招' ? `${job.year || '毕业年份待核实'} ${job.type}招聘` : job.title), el('p', `${job.industry} · ${job.companyType} · ${job.city}`));
    const meta = el('div', '', 'career-card-meta'); meta.append(tag(job.type), el('span', job.deadline ? `${job.deadline.slice(5).replace('-', '/')} 截止` : '截止时间待核实')); detail.append(meta);
    card.append(top, detail); return card;
  }
  function discovery() {
    const fragment = document.createDocumentFragment(); fragment.append(filterRow());
    const jobs = filteredJobs(); if (!jobs.some(job => job.id === detailId)) detailId = jobs[0]?.id || '';
    const split = el('div', '', `career-discovery-split${mobileDetail ? ' is-detail' : ''}`);
    const left = el('div', '', 'career-company-list');
    const recommend = btn('', () => route('search', []), 'career-recommend'); const copy = el('span'); copy.append(el('strong', 'AI 校招推荐'), el('small', '发现适合你的校招和职位')); recommend.append(icon('sparkle'), copy, icon('caret-down')); left.append(recommend, batchBar(jobs.map(job => job.id), true));
    if (jobs.length) jobs.forEach(job => left.append(companyCard(job))); else left.append(empty('暂无符合条件的职位', '试试其他筛选条件或关键词。'));
    const right = el('div', '', 'career-recruitment-detail'); if (visibleJob()) right.append(detailContent(visibleJob(), false)); else right.append(empty('选择一个职位', '在左侧查看公司和职位详情。'));
    split.append(left, right); fragment.append(split); return fragment;
  }
  function detailContent(job, isProgress) {
    const fragment = document.createDocumentFragment();
    const toolbar = el('div', '', 'career-detail-toolbar');
    toolbar.append(btn(isProgress ? '关闭详情' : '返回职位列表', () => { if (isProgress) detailId = ''; else mobileDetail = false; render(); }, isProgress ? '' : 'career-mobile-back', 'x'), tag('虚构示例', 'is-muted'));
    if (isProgress) toolbar.append(statusControl(job.id));
    fragment.append(toolbar);
    const heading = el('div', '', 'career-detail-heading');
    const brand = el('div', '', 'career-detail-brand'); brand.append(avatar(job), el('span', job.company));
    heading.append(brand, el('h2', isProgress ? job.title : `${job.company}${job.type === '校招' ? ` ${job.year || ''} 校园招聘` : ` · ${job.type}招聘`}`), el('p', `${job.companyType} · ${job.industry} · ${job.city}`));
    const meta = el('div', '', 'career-detail-meta'); meta.append(tag('进行中'), el('span', job.year ? `面向 ${job.year} 届` : '毕业年份待核实'), el('span', job.deadline ? `截止 ${job.deadline.replaceAll('-', '/')}` : '截止时间待核实')); heading.append(meta);
    const actions = el('div', '', 'career-detail-actions');
    const saved = store.snapshot().applications[job.id];
    actions.append(btn('招聘公告', () => { detailTab = 'announcement'; render(); }, '', 'read-cv-logo'), btn('官网投递', () => route('apply', [job.id]), '', 'arrow-square-out'), btn('AI 帮我投', () => route('deliver', [job.id]), 'is-primary', 'sparkle'));
    actions.append(btn(saved ? '查看我的职位' : '加入待投', () => { if (!saved) { store.upsertApplication(job.id, { status: 'pending' }); notice('已加入我的职位 · 待投递'); } else open('progress', { jobId: job.id }); }, 'career-save-button'));
    heading.append(actions); fragment.append(heading);
    const questions = el('div', '', 'career-questions'); questions.append(icon('sparkle'));
    [['这个职位和我的匹配度怎么样？', 'match'], ['帮我针对这个职位优化简历', 'tailor'], ['这个职位的面试该怎么准备？', 'interview']].forEach(([title, action]) => questions.append(btn(title, () => route(action, [job.id])))); fragment.append(questions);
    const tabs = el('div', '', 'career-detail-tabs'); tabs.setAttribute('role', 'tablist');
    [['announcement', '公告'], ['jobs', '校招职位']].forEach(([key, title]) => { const tab = btn(key === 'jobs' ? `${job.type === '社招' ? '招聘职位' : title}  1` : title, () => { detailTab = key; render(); }); tab.setAttribute('role', 'tab'); tab.setAttribute('aria-selected', String(detailTab === key)); tabs.append(tab); }); fragment.append(tabs);
    const body = el('div', '', 'career-detail-body'); body.setAttribute('role', 'tabpanel');
    if (detailTab === 'jobs') {
      const mini = el('article', '', 'career-job-mini'); mini.append(el('h3', job.title), el('strong', job.salary, 'career-salary'), el('p', `${job.city} · ${job.education} · ${job.type}`), el('p', job.duties), btn('分析这个职位', () => route('match', [job.id]), 'career-small-button', 'sparkle')); body.append(mini);
    } else {
      const facts = el('div', '', 'career-job-facts'); facts.append(el('h3', job.title), el('strong', job.salary, 'career-salary'), el('p', `${job.city} · ${job.education}及以上 · ${job.major}`)); body.append(facts);
      [['岗位职责', job.duties], ['任职要求', job.requirements], ['招聘说明', job.extra]].forEach(([title, text]) => { const section = el('section'); section.append(el('h3', title), el('p', text)); body.append(section); });
      const match = store.snapshot().matches[job.id];
      if (match) { const section = el('section', '', 'career-match-summary'); const score = Number(match.score ?? match.totalScore); section.append(el('h3', Number.isFinite(score) ? `匹配分析 · ${score} 分` : '匹配分析'), el('p', typeof match.summary === 'string' ? match.summary : job.gap), btn('查看匹配依据', () => route('match', [job.id]), 'career-text-button')); body.append(section); }
      if (saved) {
        const prep = el('section', '', 'career-preparation'); prep.append(el('h3', '投递准备'), el('p', `${saved.resumeReady ? '✓ 岗位简历已准备' : '○ 岗位简历待准备'}　${saved.greetingReady ? '✓ 招呼语已准备' : '○ 招呼语待准备'}`)); if (saved.greeting) prep.append(el('blockquote', saved.greeting)); body.append(prep);
      }
      const origins = el('div', '', 'career-origins'); origins.append(el('span', '职位来源'), ...job.sources.map(item => tag(item)), el('small', '此处为虚构职位公告，供流程演示。')); body.append(origins);
    }
    fragment.append(body); return fragment;
  }
  function statusControl(id) {
    const value = store.snapshot().applications[id]?.status || 'pending';
    const control = dropdown('修改投递状态', Object.entries(labels), value, status => { store.upsertApplication(id, { status }); notice(`状态已更新为${labels[status]}`); }, `status-${id}`); control.classList.add('career-status-control'); control.dataset.status = value; return control;
  }
  function nextAction(job, app) {
    const actions = {
      pending: ['准备投递', 'deliver'], applied: ['跟进进度', 'followup'], replied: ['准备沟通', 'followup'], interview: ['准备面试', 'interview'], offer: ['查看详情', 'detail'], archived: ['重新加入待投', 'restore']
    };
    const [label, action] = actions[app.status];
    return btn(label, () => { if (action === 'detail') { detailId = job.id; render(); } else if (action === 'restore') store.upsertApplication(job.id, { status: 'pending' }); else route(action, [job.id]); }, 'career-next-action');
  }
  function progressJobs() {
    const snapshot = store.snapshot(); const needle = search.trim().toLowerCase();
    return store.getJobs().filter(job => snapshot.applications[job.id] && (source === 'all' || job.sources.includes(source)) && (!needle || `${job.company} ${job.title}`.toLowerCase().includes(needle)) && (view === 'board' || progressStatus === 'all' || snapshot.applications[job.id].status === progressStatus) && (view !== 'board' || showArchived || snapshot.applications[job.id].status !== 'archived'))
      .sort((a, b) => Number(snapshot.applications[b.id].pinned) - Number(snapshot.applications[a.id].pinned));
  }
  function progressFilters() {
    const area = el('div', '', 'career-progress-filters'); const row = el('div', '', 'career-progress-search'); row.append(searchInput());
    const switcher = el('div', '', 'career-segment'); switcher.setAttribute('aria-label', '职位视图');
    [['list', '列表', 'list'], ['board', '看板', 'squares-four']].forEach(([value, label, name]) => { const button = selectedButton(label, view === value, () => { view = value; try { localStorage.setItem('xiaoyou-demo:jobs-view:v1', view); } catch (_) { /* In-memory view is sufficient. */ } render(); }); button.prepend(icon(name)); switcher.append(button); }); row.append(switcher); area.append(row);
    const sources = el('div', '', 'career-progress-chips'); sources.append(el('span', '来源')); [['all', '全部'], ['站内职位', '站内职位'], ['站内校招', '站内校招'], ['BOSS', 'BOSS'], ['招聘官网', '招聘官网']].forEach(([value, label]) => sources.append(selectedButton(label, source === value, () => { source = value; render(); }))); area.append(sources);
    if (view === 'list') {
      const states = el('div', '', 'career-progress-chips'); states.append(el('span', '状态')); [['all', '全部'], ...Object.entries(labels)].forEach(([value, label]) => states.append(selectedButton(label, progressStatus === value, () => { progressStatus = value; render(); }))); area.append(states);
    } else {
      const archived = el('label', '', 'career-show-archived'); archived.append(check('显示已归档职位', showArchived, value => { showArchived = value; render(); }), el('span', '显示已归档')); area.append(archived);
    }
    return area;
  }
  function progressList(jobs) {
    const snapshot = store.snapshot(); const wrap = el('div', '', 'career-table-wrap'); const table = el('table', '', 'career-table');
    const thead = el('thead'), top = el('tr'); ['', '置顶', '职位', '状态', '下一步', '投递 · 更新'].forEach(text => top.append(el('th', text))); thead.append(top); table.append(thead);
    const tbody = el('tbody');
    jobs.forEach(job => {
      const app = snapshot.applications[job.id]; const row = el('tr'); row.dataset.jobId = job.id;
      const checkbox = el('td'); checkbox.append(check(`选择 ${job.company} ${job.title}`, selectedIds().includes(job.id), checked => toggleSelected(job.id, checked))); row.append(checkbox);
      const pin = el('td'); const pinButton = iconBtn(app.pinned ? '取消置顶' : '置顶职位', () => store.upsertApplication(job.id, { pinned: !app.pinned }), 'flag-pennant'); pinButton.setAttribute('aria-pressed', String(app.pinned)); pinButton.dataset.focusKey = `pin-${job.id}`; pin.append(pinButton); row.append(pin);
      const position = el('td'), openDetail = btn('', () => { detailId = job.id; detailTab = 'announcement'; render(); }, 'career-job-open'); const copy = el('span'); copy.append(el('strong', job.title), el('small', `${job.company} · ${job.city}`)); openDetail.append(avatar(job), copy); position.append(openDetail); row.append(position);
      const status = el('td'); status.append(statusControl(job.id)); row.append(status);
      const action = el('td'); action.append(nextAction(job, app)); if (app.nextAction) action.append(el('small', app.nextAction, 'career-next-note')); row.append(action);
      const updated = el('td', '', 'career-updated'); const date = new Date(app.updated); updated.append(el('span', Number.isNaN(date.getTime()) ? '刚刚' : date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })), el('small', job.sources.join(' · '))); row.append(updated); tbody.append(row);
    });
    table.append(tbody); wrap.append(table); return wrap;
  }
  function boardCard(job) {
    const app = store.snapshot().applications[job.id]; const card = el('article', '', 'career-board-card'); card.dataset.jobId = job.id; card.draggable = true;
    card.dataset.status = app.status;
    card.dataset.expanded = String(expandedInterviews.has(job.id));
    card.addEventListener('dragstart', event => { event.dataTransfer?.setData('text/x-xiaoyou-job', job.id); if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'; card.classList.add('is-dragging'); });
    card.addEventListener('dragend', () => { card.classList.remove('is-dragging'); root.querySelectorAll('.is-drag-over').forEach(column => column.classList.remove('is-drag-over')); });
    const top = el('div', '', 'career-board-card-top');
    const openDetail = btn(job.company, () => { detailId = job.id; detailTab = 'announcement'; render(); }, 'career-board-company');
    top.append(avatar(job), openDetail, check(`选择 ${job.company} ${job.title}`, selectedIds().includes(job.id), checked => toggleSelected(job.id, checked)));
    card.append(top, btn(job.title, () => { detailId = job.id; detailTab = 'announcement'; render(); }, 'career-board-job-title'));
    const bottom = el('div', '', 'career-board-card-bottom');
    const badge = btn(({ applied: '已投递', replied: 'HR 已读', interview: '收到面试邀约', offer: 'Offer 已发放', archived: '已归档' })[app.status] || '待投递', () => {
      if (app.status !== 'interview') { detailId = job.id; render(); return; }
      expandedInterviews.has(job.id) ? expandedInterviews.delete(job.id) : expandedInterviews.add(job.id); render();
    }, `career-board-badge is-${app.status}`);
    if (app.status === 'interview') { badge.prepend(el('span', '', 'career-invite-dot')); badge.setAttribute('aria-expanded', String(expandedInterviews.has(job.id))); badge.setAttribute('aria-label', '展开面试准备'); }
    bottom.append(badge, statusControl(job.id)); card.append(bottom);
    if (app.status === 'interview') {
      const expansion = el('div', '', 'career-interview-expansion');
      const start = btn('开始模拟面试', () => route('interview', [job.id]), 'career-start-interview is-primary');
      start.tabIndex = expandedInterviews.has(job.id) ? 0 : -1; expansion.append(start); card.append(expansion);
    }
    return card;
  }
  function progressBoard(jobs) {
    const snapshot = store.snapshot(); const fragment = document.createDocumentFragment();
    const pending = jobs.filter(job => snapshot.applications[job.id].status === 'pending');
    if (pending.length) {
      const summary = el('div', '', 'career-pending-summary'); const copy = el('div'); copy.append(el('strong', `待投递 ${pending.length}`), el('p', pending.map(job => job.company).join('、')));
      const start = btn('开始投递', () => route('deliver', pending.map(job => job.id)), 'is-primary', 'sparkle'); summary.append(copy, start); fragment.append(summary);
    }
    const stage = el('section', '', 'career-board-stage');
    const stageHead = el('div', '', 'career-board-stage-head'); const brand = el('span', 'UP', 'career-board-up');
    const interviewCount = jobs.filter(job => snapshot.applications[job.id].status === 'interview').length;
    const offerCount = jobs.filter(job => snapshot.applications[job.id].status === 'offer').length;
    const tracking = jobs.filter(job => !['pending','archived'].includes(snapshot.applications[job.id].status)).length;
    const pill = el('div', '', 'career-board-tracking'); pill.append(el('span', offerCount ? `已记录 ${offerCount} 份 Offer` : interviewCount ? `${interviewCount} 个面试机会，做好下一步准备` : `持续跟进 ${tracking} 份投递`, 'career-board-tracking-copy'));
    if (offerCount || interviewCount) { brand.textContent = '✓'; brand.classList.add('is-complete'); }
    stageHead.append(brand, pill); stage.append(stageHead);
    const board = el('div', '', 'career-board');
    ['applied', 'replied', 'interview', 'offer'].forEach(status => {
      const list = jobs.filter(job => snapshot.applications[job.id].status === status); const column = el('section', '', 'career-board-column'); column.dataset.status = status;
      const title = el('h3'); title.append(el('span', boardLabels[status]), el('small', String(list.length))); column.append(title);
      column.addEventListener('dragover', event => { if (event.dataTransfer?.types.includes('text/x-xiaoyou-job')) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; column.classList.add('is-drag-over'); } });
      column.addEventListener('dragleave', event => { if (!column.contains(event.relatedTarget)) column.classList.remove('is-drag-over'); });
      column.addEventListener('drop', event => { event.preventDefault(); column.classList.remove('is-drag-over'); const id = event.dataTransfer?.getData('text/x-xiaoyou-job'); if (store.snapshot().applications[id]) { store.upsertApplication(id, { status }); notice(`已移动到${labels[status]}`); } });
      list.forEach(job => column.append(boardCard(job))); if (!list.length) { const placeholder = el('div', '', 'career-board-empty'); placeholder.setAttribute('aria-label', `${boardLabels[status]}暂无职位`); column.append(placeholder); } board.append(column);
    }); stage.append(board);
    if (showArchived) { const archived = jobs.filter(job => snapshot.applications[job.id].status === 'archived'); const section = el('section', '', 'career-board-archive'); section.append(el('h3', `已归档 ${archived.length}`)); archived.forEach(job => section.append(boardCard(job))); if (!archived.length) section.append(el('p', '暂无归档职位')); stage.append(section); }
    fragment.append(stage); return fragment;
  }
  function progress() {
    const fragment = document.createDocumentFragment(); fragment.append(progressFilters()); const jobs = progressJobs(); fragment.append(batchBar(jobs.map(job => job.id)));
    const content = el('div', '', 'career-progress-content');
    if (view === 'board') content.append(progressBoard(jobs));
    else if (jobs.length) content.append(progressList(jobs));
    else content.append(empty(Object.keys(store.snapshot().applications).length ? '暂无符合条件的职位' : '把心动的职位，放进计划里', '从发现职位加入待投，或添加一个示例职位，开始跟进。', btn('发现职位', () => open('discovery'), 'is-primary', 'compass')));
    fragment.append(content);
    if (detailId && store.getJob(detailId)) { const scrim = el('div', '', 'career-detail-scrim'); scrim.onclick = () => { detailId = ''; render(); }; const drawer = el('aside', '', 'career-job-drawer'); drawer.setAttribute('aria-label', `${store.getJob(detailId).company} 职位详情`); drawer.append(detailContent(store.getJob(detailId), true)); fragment.append(scrim, drawer); }
    return fragment;
  }
  function addDialog() {
    const overlay = el('div', '', 'career-add-overlay'); const dialog = el('section', '', 'career-add-dialog'); dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); dialog.setAttribute('aria-labelledby', 'career-add-title');
    const heading = el('header'); const title = el('h2', '添加职位'); title.id = 'career-add-title'; heading.append(title, iconBtn('关闭添加职位', () => { showAdd = false; render(); }, 'x')); dialog.append(heading, el('p', '选择一个示例职位，加入你的待投清单。'));
    const list = el('div', '', 'career-add-list'); const apps = store.snapshot().applications;
    store.getJobs().forEach(job => { const choice = btn('', () => { store.upsertApplication(job.id, { status: 'pending' }); showAdd = false; render(); notice('已添加到待投清单'); }, 'career-add-choice'); const copy = el('span'); copy.append(el('strong', job.title), el('small', `${job.company} · ${job.city}`)); choice.append(avatar(job), copy, el('span', apps[job.id] ? '已添加' : '+')); choice.disabled = Boolean(apps[job.id]); list.append(choice); });
    dialog.append(list); overlay.append(dialog); overlay.onclick = event => { if (event.target === overlay) { showAdd = false; render(); } }; return overlay;
  }
  function render() {
    if (!active) return;
    // Keep the same job's on-screen position across an immediate state/count update.
    // The browser supplies geometry; DOM-only tests do not verify the motion path.
    const oldCards = new Map([...root.querySelectorAll('.career-board-card')].map(card => [card.dataset.jobId, { rect: card.getBoundingClientRect(), status: card.dataset.status }]));
    boardAnimations.forEach(animation => animation.cancel()); boardAnimations.clear();
    const focused = document.activeElement; const key = focused?.dataset?.focusKey; const selection = focused?.selectionStart; const scrolls = [...root.querySelectorAll('.career-company-list,.career-recruitment-detail,.career-progress-content,.career-detail-body')].map(item => [item.className, item.scrollTop]);
    root.dataset.page = page; root.dataset.view = view; root.replaceChildren(header()); if (page === 'discovery') root.append(discovery()); else root.append(progress());
    const footnote = el('div', '示例职位与本地进度，仅用于演示', 'career-page-footnote'); root.append(footnote); if (showAdd) root.append(addDialog());
    scrolls.forEach(([className, top]) => { const match = [...root.querySelectorAll('[class]')].find(item => item.className === className); if (match) match.scrollTop = top; });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) root.querySelectorAll('.career-board-card').forEach(card => {
      const previous = oldCards.get(card.dataset.jobId); if (!previous || typeof card.animate !== 'function') return;
      const after = card.getBoundingClientRect(), x = previous.rect.left - after.left, y = previous.rect.top - after.top;
      if (Math.abs(x) + Math.abs(y) <= 1) return;
      const changed = previous.status !== card.dataset.status, featured = changed && ['interview','offer'].includes(card.dataset.status);
      // 49.5–50.75s / 65.75–67s: notice at origin, lift, traverse, settle.
      const frames = featured ? [
        { transform: `translate(${x}px, ${y}px)`, offset: 0 },
        { transform: `translate(${x}px, ${y}px)`, offset: .4 },
        { transform: `translate(${x}px, ${y - 18}px) scale(1.025)`, boxShadow: '0 14px 32px #284cff22', offset: .52 },
        { transform: 'translate(0, -18px) scale(1.025)', boxShadow: '0 14px 32px #284cff22', offset: .9 },
        { transform: 'translate(0, 0) scale(1)', offset: 1 }
      ] : [{ transform: `translate(${x}px, ${y}px)` }, { transform: 'translate(0, 0)' }];
      const animation = card.animate(frames, { duration: featured ? 1280 : 450, easing: 'cubic-bezier(.22,.75,.18,1)' }); animation.finished?.catch?.(() => {}); boardAnimations.add(animation); card.classList.add('is-moving');
      animation.onfinish = () => { boardAnimations.delete(animation); card.classList.remove('is-moving'); if (card.dataset.status === 'interview' && card.isConnected) { expandedInterviews.add(card.dataset.jobId); card.dataset.expanded = 'true'; card.querySelector('.career-board-badge')?.setAttribute('aria-expanded','true'); const start = card.querySelector('.career-start-interview'); if (start) start.tabIndex = 0; } };
    });
    if (key) { const target = [...root.querySelectorAll('[data-focus-key]')].find(item => item.dataset.focusKey === key); target?.focus({ preventScroll: true }); if (typeof selection === 'number') { try { target?.setSelectionRange(selection, selection); } catch (_) { /* Summary and nontext inputs have no selection. */ } } }
    if (showAdd) root.querySelector('.career-add-dialog button')?.focus({ preventScroll: true });
  }
  function open(next, options = {}) {
    if (!['discovery', 'progress'].includes(next)) return false;
    const main = document.querySelector('.demo-main'); if (!main) return false;
    if (!active) { previousFocus = document.activeElement; [...main.children].filter(item => item !== root).forEach(item => { inertBefore.set(item, item.inert); item.inert = true; }); }
    if (!root.isConnected) main.append(root);
    if (page !== next) search = '';
    page = next; active = true; showAdd = false; root.hidden = false; detailId = store.getJob(options.jobId)?.id || ''; detailTab = 'announcement'; mobileDetail = Boolean(detailId);
    if (next === 'progress' && ['list', 'board'].includes(options.view)) { view = options.view; try { localStorage.setItem('xiaoyou-demo:jobs-view:v1', view); } catch (_) { /* In-memory view remains usable. */ } }
    if (next === 'discovery' && detailId) { edition = store.getJob(detailId).type === '社招' ? 'social' : 'campus'; filters = { type: 'all', kind: 'all', sort: 'latest', city: 'all', industry: 'all', major: 'all', education: 'all', companyType: 'all' }; search = ''; }
    render(); root.focus({ preventScroll: true }); emit('xiaoyou:career-page', { page, open: true }); return true;
  }
  function close() {
    if (!active) return; active = false; root.hidden = true; showAdd = false;
    boardAnimations.forEach(animation => animation.cancel()); boardAnimations.clear();
    inertBefore.forEach((value, item) => { item.inert = value; }); inertBefore.clear();
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); emit('xiaoyou:career-page', { page, open: false });
  }
  document.addEventListener('click', event => { if (active) root.querySelectorAll('.career-dropdown[open]').forEach(item => { if (!item.contains(event.target)) item.open = false; }); });
  const repositionBoardMenus = () => { if (active) root.querySelectorAll('.career-board-card .career-status-control[open]').forEach(positionBoardStatusMenu); };
  root.addEventListener('scroll', repositionBoardMenus, true);
  window.addEventListener('resize', repositionBoardMenus);
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); if (showAdd) { showAdd = false; render(); } else if (page === 'progress' && detailId) { detailId = ''; render(); } else if (mobileDetail && window.matchMedia('(max-width: 760px)').matches) { mobileDetail = false; render(); } else close(); }
    if (event.key === 'Tab' && showAdd) { const controls = [...root.querySelectorAll('.career-add-dialog button:not(:disabled)')]; const first = controls[0], last = controls.at(-1); if (event.shiftKey && (document.activeElement === first || !root.querySelector('.career-add-dialog').contains(document.activeElement))) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && (document.activeElement === last || !root.querySelector('.career-add-dialog').contains(document.activeElement))) { event.preventDefault(); first?.focus(); } }
  });
  let pendingRender = false;
  store.subscribe(() => { if (!active || pendingRender) return; pendingRender = true; queueMicrotask(() => { pendingRender = false; render(); }); });
  window.XiaoyouJobPages = Object.freeze({ open, close, isOpen: () => active });
})();
