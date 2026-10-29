/* Scenario composition for the local demo. Source UI: SuggestSlide / QuickRepliesCard,
 * upagent-CFN5tJOA.js displayName anchors @279683 / @314685; tool labels: Nh @362130.
 * No network requests, account data, plugin execution or application submission. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const node = (tag, text = '', className = '') => {
    const element = document.createElement(tag);
    element.textContent = text; element.className = className; return element;
  };
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
  const notice = text => emit('xiaoyou:notice', { text });
  const icon = name => {
    const element = node('i'); element.dataset.icon = name; element.setAttribute('aria-hidden', 'true');
    const source = window.UPCV_ICONS?.[name];
    if (source) element.style.setProperty('--icon', `url("${source}")`);
    return element;
  };
  const button = (text, action, primary = false) => {
    const element = node('button', text, `scenario-button${primary ? ' is-primary' : ''}`);
    element.type = 'button'; element.onclick = action; return element;
  };
  // Search and an existing list enter the same screening pipeline at different points.
  const discoverySteps = {
    strategy: { title: '理解简历，制定策略', tools: ['读取简历', '读取求职画像'], description: '提取岗位方向、毕业时间和技能，明确硬条件与优先项。' },
    search: { title: '跨来源搜索职位', tools: ['站内职位搜索', '校招搜索', 'BOSS 职位搜索', '网页搜索'], description: '围绕同一策略检索多个来源，并保留来源信息。' },
    import: { title: '读取当前职位列表', tools: ['插件读取职位列表'], description: '从已有职位列表开始，保留来源记录与重复关系。' },
    filter: { title: '去重与检查硬条件', tools: ['职位初筛', '校招初筛'], description: '合并重复职位，检查城市、招聘类型、岗位方向和毕业年份。' },
    review: { title: '读取详情，逐项精筛', tools: ['职位详情', 'BOSS 职位详情', '获取网页详情', '职位匹配评估'], description: '核对职责、门槛和简历证据，将不确定项单独列出。' },
    deliver: { title: '整理推荐与待核实清单', tools: ['生成职位推荐清单', '生成校招推荐清单'], description: '保留每项结论的依据，支持对比、加入待投与针对岗位改简历。' }
  };
  const definitions = {
    jobs: {
      title: '找职位工作流', prompt: '结合我的简历，搜索站内、校招、BOSS 和招聘官网，筛选适合我的职位。',
      subtitle: '从搜索策略到详情精筛，形成有依据的职位清单。',
      steps: ['strategy', 'search', 'filter', 'review', 'deliver'].map(id => discoverySteps[id])
    },
    screen: {
      title: '批量筛选工作流', prompt: '按我的求职条件，批量筛选当前职位列表，并展示保留和排除的依据。',
      subtitle: '一次看清哪些值得投、哪些需核实、哪些不符合。',
      steps: ['import', 'filter', 'review', 'deliver'].map(id => discoverySteps[id])
    },
    apply: {
      title: '网申填写工作流', prompt: '根据我的简历填写网申信息，标出缺失和需要核对的字段，提交前由我确认。',
      subtitle: '把简历信息映射到表单，缺失项留给你补充。',
      steps: [
        { title: '读取简历与档案', tools: ['读取简历', '读取求职画像'], description: '整理基础信息、教育经历和项目经历。' },
        { title: '识别网申字段', tools: ['扫描网申表单'], description: '识别页面字段、必填项和字段类型。' },
        { title: '匹配字段并填写', tools: ['填写网申表单'], description: '将有依据的信息填入对应字段，缺失信息不猜测。' },
        { title: '检查遗漏，等待确认', tools: ['网申字段核对', '定位提交入口'], description: '标记待补项。信息确认后，仍由你手动提交网申。' }
      ]
    }
  };
  const jobs = [
    { id: 'pine-pm', company: '云杉科技', title: '产品经理 · 校招', city: '上海', direction: '产品', type: '校招', year: 2027, salary: '12–18K · 14薪', sources: ['站内职位', 'BOSS'], remote: false,
      duties: '参与用户访谈与需求分析，设计产品流程和交互原型；与研发协作，跟进上线与用户反馈。',
      requirements: '2027届本科及以上；具备校园产品项目经历，能够说明需求判断与个人贡献。SQL 为加分项。',
      gap: '简历已有需求调研与功能设计经历，但个人贡献与验证依据还不够具体。', extra: '培养方向为产品经理。业务场景、团队配置和转正考核方式需在沟通时进一步确认。' },
    { id: 'bridge-ops', company: '星桥数据', title: '产品运营 · 校招', city: '上海', direction: '产品', type: '校招', year: 2027, salary: '11–16K · 13薪', sources: ['站内校招'], remote: false,
      duties: '整理用户反馈，协助产品功能推广与使用分析；维护反馈记录，推动需求与运营协同。',
      requirements: '2027届本科及以上；熟悉 Excel，具备用户研究或校园项目经验；能够将反馈转化为改进建议。',
      gap: '用户反馈与校园推广经历相关，仍需补充可追溯的运营结果。', extra: '岗位兼顾产品与运营。具体工作中数据分析和内容运营的占比需向招聘方核实。' },
    { id: 'mountain-data', company: '远山软件', title: '数据分析实习生', city: '杭州', direction: '数据分析', type: '实习', year: 2027, salary: '180–250元/天', sources: ['站内职位'], remote: false,
      duties: '使用 SQL 整理业务数据，维护分析报表，并与产品团队讨论转化漏斗和异常指标。',
      requirements: '在校本科生；熟悉 SQL 和 Excel；每周到岗至少4天、连续实习3个月。',
      gap: '技能栏包含 SQL，但简历尚未呈现完整的数据分析项目证据。', extra: '岗位为线下实习。每周到岗天数和实习时长属于需要候选人确认的条件。' },
    { id: 'sail-assistant', company: '启程科技', title: '产品助理 · 校招', city: '上海', direction: '产品', type: '校招', year: null, salary: '薪资待核实', sources: ['招聘官网'], remote: true,
      duties: '协助需求整理、原型设计和项目文档维护；参加需求评审，追踪问题并整理验收记录。',
      requirements: '本科及以上，具备清晰表达与文档整理能力；公告未明确毕业年份和薪资范围。',
      gap: '方向与经历相关，但毕业年份、薪资和远程安排需要招聘方确认。', extra: '示例公告允许部分远程协作，但未说明远程天数。不要将部分远程理解为全程远程。' },
    { id: 'sky-senior', company: '晴空科技', title: '资深产品经理', city: '上海', direction: '产品', type: '社招', year: null, salary: '25–35K · 14薪', sources: ['BOSS'], remote: false,
      duties: '独立负责商业产品规划，管理需求优先级，协调多个团队并对产品经营指标负责。',
      requirements: '3年以上全职产品经验，具有复杂业务产品独立负责经历。',
      gap: '当前简历为应届生校园项目，不满足3年以上全职经验要求。', extra: '职位明确面向有经验候选人。即使城市和岗位方向符合，也不应混入校招推荐清单。' },
    { id: 'north-research', company: '北辰教育', title: '用户研究 · 校招', city: '北京', direction: '用户研究', type: '校招', year: 2027, salary: '10–15K · 13薪', sources: ['站内校招', '站内职位'], remote: false,
      duties: '协助用户访谈、可用性测试和研究记录整理，向产品团队提供用户问题与改进建议。',
      requirements: '2027届本科及以上，具备访谈或研究项目经历；需要在北京办公。',
      gap: '已有用户调研经历，但需要展示研究方法与洞察产出；城市与默认意向不同。', extra: '适合愿意扩大岗位方向和城市范围的候选人。是否接受异地需要先修改搜索策略。' }
  ];
  let activeRun = null;
  const savedJobs = new Set();
  const originalTabTitle = $('resume-tab')?.querySelector('span')?.textContent || '产品经理校招简历 · 示例';
  const defaultCriteria = context => ({
    city: typeof context?.city === 'string' ? context.city : '上海',
    direction: typeof context?.direction === 'string' ? context.direction : '产品',
    campusOnly: context?.campusOnly !== false,
    year: Number(context?.year) || 2027,
    remote: Boolean(context?.remote)
  });
  const getJob = context => {
    const known = jobs.find(job => job.id === context?.job?.id || job.id === context?.jobId);
    if (known) return known;
    if (context?.job && typeof context.job.company === 'string' && typeof context.job.title === 'string') return { id: context.job.id || 'custom-job', company: context.job.company, title: context.job.title };
    return context?.jobId || context?.job ? { id: context.jobId || 'unknown-job', company: '待确认公司', title: '待确认职位' } : jobs[0];
  };

  function createJourney({ title, steps }) {
    const element = node('details', '', 'combo-run'); element.open = true;
    const summary = node('summary', '', 'combo-run-heading');
    const label = node('span', '', 'combo-run-label'), current = node('small', '准备开始', 'combo-current');
    label.append(node('strong', title), current);
    const count = node('span', '', 'combo-count');
    summary.append(icon('sparkle'), label, count, icon('caret-down')); element.append(summary);
    // Keep the complete trace available without competing with the visual work.
    const executionLog = node('details', '', 'product-execution-log');
    const logSummary = node('summary');
    logSummary.append(node('span', '执行记录'), icon('caret-down'));
    executionLog.append(logSummary);
    const list = node('ol', '', 'combo-steps');
    const rows = steps.map((step, index) => {
      const item = node('li', '', 'combo-step'), marker = node('span', String(index + 1), 'combo-step-marker');
      const copy = node('div', '', 'combo-step-copy'), top = node('div', '', 'combo-step-title');
      const badge = node('span', '待执行', 'combo-step-status'); top.append(node('strong', step.title), badge);
      copy.append(top, node('p', step.description, 'combo-step-description'));
      const output = node('div', '', 'combo-stage-result'); output.hidden = true;
      copy.append(output);
      const tools = node('div', '', 'combo-step-tools');
      (step.tools || []).forEach(tool => tools.append(node('span', tool)));
      const toolDetails = expandable('执行详情', tools); toolDetails.classList.add('combo-tool-details'); copy.append(toolDetails);
      item.append(marker, copy); list.append(item); return { item, marker, badge, output };
    });
    executionLog.append(list); element.append(executionLog);
    function update(index = 0, state = 'running') {
      const cursor = Math.max(0, Math.min(steps.length - 1, index));
      const completed = state === 'done' ? steps.length : cursor;
      count.textContent = `${completed} / ${steps.length}`;
      current.textContent = state === 'done' ? '工作流已完成' : state === 'stopped' ? '已停止，保留当前结果' : state === 'waiting' ? `等待你确认 · ${steps[cursor].title}` : steps[cursor].title;
      element.dataset.state = state; element.dataset.step = String(cursor);
      rows.forEach(({ item, marker, badge }, rowIndex) => {
        const value = state === 'done' || rowIndex < cursor ? 'done' : rowIndex > cursor ? 'pending' : state;
        item.dataset.state = value;
        marker.textContent = value === 'done' ? '✓' : String(rowIndex + 1);
        badge.textContent = ({ done: '已完成', pending: '待执行', running: '执行中', waiting: '待你确认', stopped: '已停止' })[value];
        if (rowIndex === cursor && ['running', 'waiting'].includes(state)) item.setAttribute('aria-current', 'step');
        else item.removeAttribute('aria-current');
      });
    }
    function setStageResult(index, result = {}) {
      const row = rows[index]; if (!row) return;
      row.output.replaceChildren(); row.output.hidden = !result.summary;
      if (!result.summary) return;
      row.output.append(node('span', result.summary));
      if (result.actionLabel && typeof result.onInspect === 'function') {
        const inspect = button(result.actionLabel, result.onInspect); inspect.classList.add('combo-result-action'); row.output.append(inspect);
      }
    }
    update(0, 'running'); return { element, update, setStageResult };
  }

  function clearPreview() {
    $('scenario-workspace')?.remove();
    const resume = $('resume-tabpanel'); if (resume) resume.hidden = false;
    const tab = $('resume-tab');
    if (tab) { tab.setAttribute('aria-controls', 'resume-tabpanel'); const text = tab.querySelector('span'); if (text) text.textContent = originalTabTitle; }
    $('preview')?.classList.remove('scenario-preview');
    activeRun = null;
  }
  function evaluateJob(job, criteria) {
    const exclusions = [], questions = [];
    const city = criteria.city.trim();
    if (city && city !== '不限' && !city.split(/[、,，\s]+/).includes(job.city)) exclusions.push(`工作地点为${job.city}，不在所选城市内`);
    if (criteria.campusOnly && job.type !== '校招') exclusions.push(`属于${job.type}职位，当前只看校招`);
    const direction = criteria.direction.trim();
    if (direction && direction !== '不限' && !job.title.includes(direction) && !job.direction.includes(direction)) exclusions.push(`职位方向为${job.direction}，与${direction}不同`);
    if (criteria.remote && !job.remote) exclusions.push('职位未提供远程安排');
    if (job.type === '社招') exclusions.push('要求3年以上全职经验，当前简历为应届生');
    if (job.type === '校招' && job.year && job.year !== criteria.year) exclusions.push(`面向${job.year}届，与${criteria.year}届不一致`);
    if (job.type === '校招' && !job.year) questions.push('公告未注明毕业年份，需要核实');
    if (job.salary.includes('待核实')) questions.push('薪资范围尚未公开');
    if (criteria.remote && job.remote) questions.push('仅说明部分远程，具体天数需要核实');
    const status = exclusions.length ? 'excluded' : questions.length ? 'uncertain' : 'recommended';
    return { status, exclusions, reasons: exclusions.length ? exclusions : questions.length ? questions : [`${job.city} · ${job.type} · ${job.year || '年份待核实'}届符合当前条件`, '简历中有相关校园项目，可以继续核对岗位细节'], questions };
  }
  function tag(text, tone = '') { return node('span', text, `scenario-tag${tone ? ` is-${tone}` : ''}`); }
  function labeledValue(label, value) {
    const row = node('div', '', 'scenario-fact'); row.append(node('dt', label), node('dd', value)); return row;
  }
  function expandable(title, content) {
    const details = node('details', '', 'scenario-details');
    const summary = node('summary', title); summary.append(icon('caret-down')); details.append(summary, content); return details;
  }
  function request(key, context = {}) { emit('xiaoyou:scenario-request', { key, context }); }

  function createRun({ key, round = 0, points = [], context = {} }) {
    if (!definitions[key]) throw new Error(`Unknown scenario: ${key}`);
    const definition = definitions[key], criteria = defaultCriteria(context.criteria || context.config || context);
    const tracker = createJourney({ title: definition.title, steps: definition.steps });
    const mobileTracker = createJourney({ title: definition.title, steps: definition.steps });
    mobileTracker.element.classList.add('scenario-mobile-journey'); mobileTracker.element.open = false;
    const panel = node('section', '', 'scenario-workspace'); panel.id = 'scenario-workspace';
    panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 'resume-tab');
    const header = node('header', '', 'scenario-panel-head'), heading = node('div', '', 'scenario-panel-heading');
    heading.append(node('h2', definition.title), tag('演示数据'));
    header.append(heading, node('p', definition.subtitle));
    const stageLine = node('div', '', 'scenario-stage-line'); stageLine.setAttribute('role', 'status');
    const body = node('div', '', 'scenario-body');
    panel.append(header, stageLine, mobileTracker.element, body);
    let stage = 0, state = 'running', stopped = false, lastView = '', filter = 'all', funnelView = '';
    const phase = { source: key === 'jobs' ? 1 : 0, filter: key === 'jobs' ? 2 : 1, review: key === 'jobs' ? 3 : 2 };
    const completed = index => state === 'done' || stage > index;
    const sourceRecords = jobs.flatMap(job => job.sources.map(source => ({ job, source })));
    const screeningModel = () => jobs.map(job => ({ job, evaluation: evaluateJob(job, criteria) }));
    const selected = new Set(), guideNotes = [], summaryNodes = new Set();
    const application = {
      name: '林同学', email: 'lin@example.com', school: '某大学 · 信息管理与信息系统 · 本科',
      graduation: '2027-06', project: points.join('\n') || '校园二手交易平台：参与需求调研、功能设计和推广。',
      available: '', city: '', acknowledged: false, confirmed: false
    };
    const fields = [
      { id: 'name', label: '姓名', source: '简历 · 基础信息', required: true },
      { id: 'email', label: '联系邮箱', source: '简历 · 联系方式', required: true, type: 'email' },
      { id: 'school', label: '学校与专业', source: '简历 · 教育经历', required: true },
      { id: 'graduation', label: '毕业时间', source: '简历 · 教育经历', required: true, type: 'month' },
      { id: 'project', label: '项目经历', source: '简历 · 项目经历', required: true, multiline: true },
      { id: 'available', label: '最早到岗日期', source: '简历未提供，需要你补充', required: true, type: 'date' },
      { id: 'city', label: '期望工作城市', source: '需要你确认当前意向', required: true }
    ];
    const fieldErrors = () => fields.filter(field => {
      const value = application[field.id].trim();
      if (!value) return true;
      if (field.type === 'email') return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (field.type === 'date') return !/^\d{4}-\d{2}-\d{2}$/.test(value);
      if (field.type === 'month') return !/^\d{4}-\d{2}$/.test(value);
      return false;
    });
    function counts() {
      const result = { recommended: 0, uncertain: 0, excluded: 0 };
      screeningModel().forEach(({ evaluation }) => result[evaluation.status]++); return result;
    }
    function summaryText() {
      if (key === 'apply') {
        if (stage === 0 && state !== 'done') return '已保留简历资料；尚未完成网申字段识别。';
        if (stage === 1 && state !== 'done') return state === 'stopped' ? '已停止识别网申字段，尚未填写信息。' : '正在识别网申字段，尚未填写信息。';
        const missing = fieldErrors().length;
        return application.confirmed ? '填写信息已确认，等待你手动提交。' : missing ? `已匹配${fields.length - missing}项信息，${missing}项待补充或核对。` : '必填项已补齐，请核对后确认。';
      }
      if (state !== 'done') return `${state === 'stopped' ? '已停止' : '正在执行'}：${definition.steps[stage].title}；已完成的阶段产出已保留。`;
      const count = counts();
      return `已整理${jobs.length}个示例职位：${count.recommended}个推荐，${count.uncertain}个待核实，${count.excluded}个不符合当前条件。`;
    }
    function updateSummaries() { summaryNodes.forEach(element => { element.textContent = summaryText(); }); }
    function currentIsDifferent() { return $('app')?.dataset.state === 'running' && String(round) !== $('app')?.dataset.round; }
    function present(guard = true) {
      if (guard && currentIsDifferent()) { notice('当前任务正在执行，请完成或停止后再查看其他结果。'); return false; }
      const existing = $('scenario-workspace'); if (existing !== panel) existing?.remove();
      const resume = $('resume-tabpanel'); resume.hidden = true;
      if (panel.parentElement !== $('preview')) resume.after(panel);
      const tab = $('resume-tab'); tab.setAttribute('aria-controls', 'scenario-workspace');
      const label = tab.querySelector('span'); if (label) label.textContent = definition.title;
      $('preview').classList.add('scenario-preview'); activeRun = api; return true;
    }
    function openResult() { if (present()) emit('xiaoyou:preview', { open: true }); }
    function inspectOutput(selector, funnel) {
      if (!present()) return;
      if (funnel) { funnelView = funnel; render(true); }
      emit('xiaoyou:preview', { open: true });
      panel.querySelector(selector)?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
    function updateStageResults() {
      const count = counts(), sourceCount = sourceRecords.length, hardCount = jobs.length - count.excluded;
      const items = key === 'apply' ? [
        { summary: '已整理基础、教育与项目资料，共5项可用信息。', actionLabel: '查看资料', onInspect: () => inspectOutput('.scenario-application-target') },
        { summary: `已识别${fields.length}个必填字段，分为4组核对。`, actionLabel: '查看字段', onInspect: () => inspectOutput('.scenario-application-form') },
        { summary: `已填入5项有来源的信息；到岗日期与城市需你补充。`, actionLabel: '查看填写结果', onInspect: () => inspectOutput('.scenario-application-form') },
        { summary: summaryText(), actionLabel: '核对待补信息', onInspect: () => inspectOutput('.scenario-missing-nav') }
      ] : [
        ...(key === 'jobs' ? [{ summary: `${criteria.city || '不限城市'} · ${criteria.direction || '不限方向'} · ${criteria.campusOnly ? '校招' : '招聘类型不限'} · ${criteria.year}届`, actionLabel: '查看策略', onInspect: () => inspectOutput('.scenario-strategy') }] : []),
        { summary: `${key === 'screen' ? '已读取列表' : '4个来源检索完成'}，保留${sourceCount}条来源记录。`, actionLabel: '查看来源', onInspect: () => inspectOutput('.scenario-source-card') },
        { summary: `合并${sourceCount - jobs.length}条重复记录；${hardCount}个职位进入详情核对，${count.excluded}个因硬条件排除。`, actionLabel: '查看初筛', onInspect: () => inspectOutput('.scenario-funnel', 'hard') },
        { summary: `已核对${hardCount}个职位的职责、门槛与简历证据，${count.uncertain}个仍有信息待核实。`, actionLabel: '查看依据', onInspect: () => inspectOutput('.scenario-funnel', 'review') },
        { summary: `${count.recommended}个推荐 · ${count.uncertain}个待核实 · ${count.excluded}个不符合。`, actionLabel: '查看清单', onInspect: () => inspectOutput('.scenario-results') }
      ];
      items.forEach((item, index) => {
        const result = completed(index) ? item : {};
        tracker.setStageResult(index, result); mobileTracker.setStageResult(index, result);
      });
    }
    function makeStrategy() {
      const card = node('section', '', 'scenario-card scenario-strategy'), title = node('div', '', 'scenario-section-heading');
      title.append(node('h3', key === 'screen' ? '这次按什么筛选' : '这次怎么找')); card.append(title);
      const groups = node('div', '', 'scenario-strategy-groups');
      const hard = node('section', '', 'scenario-strategy-group'); hard.append(node('h4', '硬性条件'));
      const facts = node('dl', '', 'scenario-facts');
      facts.append(labeledValue('岗位方向', criteria.direction || '不限'), labeledValue('工作城市', criteria.city || '不限'), labeledValue('招聘类型', criteria.campusOnly ? '校招' : '不限'), labeledValue('筛选毕业年份', `${criteria.year}届`)); hard.append(facts);
      if (criteria.remote) hard.append(tag('需提供远程安排'));
      const preferred = node('section', '', 'scenario-strategy-group'); preferred.append(node('h4', '优先考虑'), node('p', '能用校园项目说明需求分析、个人贡献和用户反馈的岗位；薪资未公开时保留为待核实，不自动排除。'));
      const scope = node('section', '', 'scenario-strategy-group'); scope.append(node('h4', key === 'screen' ? '筛选范围' : '搜索范围'), node('p', key === 'screen' ? '从当前已有列表进入同一套去重、硬条件与详情精筛流程。' : '站内职位、站内校招、BOSS 与招聘官网；同一职位保留所有来源。'));
      groups.append(hard, preferred, scope); card.append(groups);
      if (criteria.year !== 2027) card.append(node('p', `当前筛选意向为${criteria.year}届，示例简历仍为2027届；请核实毕业时间后再投递。`, 'scenario-helper'));
      const form = node('form', '', 'scenario-strategy-form'); form.noValidate = true;
      const formFields = {};
      [['direction', '岗位方向', criteria.direction], ['city', '工作城市（不限或多个城市用顿号分隔）', criteria.city], ['year', '毕业年份', criteria.year]].forEach(([name, label, value]) => {
        const wrapper = node('label', '', 'scenario-field'); wrapper.append(node('span', label));
        const input = document.createElement('input'); input.value = String(value); input.name = name; input.maxLength = name === 'city' ? 50 : 30;
        if (name === 'year') { input.type = 'number'; input.min = '2020'; input.max = '2035'; }
        input.setAttribute('aria-label', label); wrapper.append(input); form.append(wrapper); formFields[name] = input;
      });
      const check = node('label', '', 'scenario-checkbox-label'), checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = criteria.campusOnly;
      check.append(checkbox, node('span', '只看校招职位')); form.append(check);
      const remoteCheck = node('label', '', 'scenario-checkbox-label'), remoteCheckbox = document.createElement('input'); remoteCheckbox.type = 'checkbox'; remoteCheckbox.checked = criteria.remote;
      remoteCheck.append(remoteCheckbox, node('span', '需要有远程安排')); form.append(remoteCheck);
      const error = node('p', '', 'scenario-error'); error.setAttribute('role', 'alert'); error.hidden = true;
      const apply = button('按新条件重新筛选', null, true); apply.type = 'submit'; apply.disabled = state === 'running';
      form.append(error, apply);
      form.onsubmit = event => {
        event.preventDefault(); if (state === 'running') return;
        const year = Number(formFields.year.value);
        if (!Number.isInteger(year) || year < 2020 || year > 2035) { error.hidden = false; error.textContent = '请填写2020至2035之间的毕业年份。'; formFields.year.focus(); return; }
        request(key, { ...criteria, city: formFields.city.value.trim() || '不限', direction: formFields.direction.value.trim() || '不限', campusOnly: checkbox.checked, remote: remoteCheckbox.checked, year });
      };
      const details = expandable('调整搜索与筛选条件', form); details.classList.add('scenario-strategy-editor'); card.append(details);
      if (state === 'running') card.append(node('p', '执行中可在消息框补充城市、岗位或筛选条件；完整条件可在本轮结束后调整。', 'scenario-helper'));
      return card;
    }
    function sourceProgress() {
      const section = node('section', '', 'scenario-card scenario-source-card'); section.append(node('h3', key === 'screen' ? '职位列表来源' : '搜索来源'));
      const grid = node('div', '', 'scenario-sources');
      ['站内职位', '站内校招', 'BOSS', '招聘官网'].forEach(source => {
        const records = sourceRecords.filter(record => record.source === source), ready = completed(phase.source);
        const status = ready ? '已完成' : stage < phase.source ? key === 'screen' ? '待读取' : '待搜索' : state === 'stopped' ? '已停止' : key === 'screen' ? '读取中' : '搜索中';
        const details = node('details', '', 'scenario-source-detail'); details.dataset.source = source; details.dataset.state = ready ? 'done' : stage < phase.source ? 'pending' : state;
        const row = node('summary', '', 'scenario-source'); row.append(icon(source === '招聘官网' ? 'magnifying-glass' : 'briefcase'), node('span', source), node('strong', `${status}${ready ? ` · ${records.length}条` : ''}`), icon('caret-down'));
        const result = node('div', '', 'scenario-source-records');
        if (ready) records.forEach(({ job }) => {
          const record = node('div', '', 'scenario-source-record'); record.dataset.jobId = job.id;
          record.append(node('strong', `${job.company} · ${job.title}`), node('p', `${job.city} · ${job.year ? `${job.year}届` : '毕业年份待核实'}${job.sources.length > 1 ? ` · 同时见于${job.sources.filter(item => item !== source).join('、')}` : ''}`)); result.append(record);
        });
        else result.append(node('p', state === 'stopped' ? '来源记录尚未读取完成。' : '完成这一阶段后，可查看来源中的原始职位记录。', 'scenario-helper'));
        details.append(row, result); grid.append(details);
      });
      section.append(grid);
      if (completed(phase.filter)) section.append(node('p', `${sourceRecords.length}条来源记录 → 合并${sourceRecords.length - jobs.length}条重复记录 → ${jobs.length}个独立职位。`, 'scenario-helper'));
      return section;
    }
    function funnelStages() {
      const model = screeningModel(), passed = model.filter(({ evaluation }) => evaluation.status !== 'excluded');
      return [
        { id: 'sources', title: '来源记录', ready: completed(phase.source), records: sourceRecords.map(({ job, source }) => ({ job, id: `${source}:${job.id}`, detail: source })) },
        { id: 'unique', title: '去重后', ready: completed(phase.filter), records: model.map(({ job }) => ({ job, id: job.id, detail: job.sources.length > 1 ? `合并${job.sources.length}条记录 · ${job.sources.join('、')}` : job.sources[0] })) },
        { id: 'hard', title: '硬条件通过', ready: completed(phase.filter), records: passed.map(({ job, evaluation }) => ({ job, id: job.id, detail: evaluation.questions.length ? '已知硬条件无冲突；缺失信息进入详情核实' : '城市、方向、招聘类型与毕业年份符合筛选条件' })) },
        { id: 'review', title: '已核对详情', ready: completed(phase.review), records: passed.map(({ job, evaluation }) => ({ job, id: job.id, detail: evaluation.questions.length ? evaluation.questions.join('；') : `已核对职责、要求和简历证据；${job.gap}` })) },
        { id: 'recommended', title: '推荐', ready: state === 'done', records: model.filter(({ evaluation }) => evaluation.status === 'recommended').map(({ job, evaluation }) => ({ job, id: job.id, detail: evaluation.reasons.join('；') })) },
        { id: 'uncertain', title: '待核实', ready: state === 'done', records: model.filter(({ evaluation }) => evaluation.status === 'uncertain').map(({ job, evaluation }) => ({ job, id: job.id, detail: evaluation.questions.join('；') })) }
      ];
    }
    function createFunnel() {
      const card = node('section', '', 'scenario-card scenario-funnel'); card.append(node('h3', '这一轮怎么筛出来'));
      const stages = funnelStages(), navigation = node('div', '', 'scenario-funnel-stages'), results = node('div', '', 'scenario-funnel-records');
      navigation.setAttribute('role', 'group'); navigation.setAttribute('aria-label', '查看各阶段筛选记录');
      if (!stages.find(item => item.id === funnelView && item.ready)) funnelView = '';
      stages.forEach(item => {
        const action = button('', () => { funnelView = item.id; renderRecords(); }); action.dataset.funnelStep = item.id; action.disabled = !item.ready;
        action.append(node('strong', item.ready ? String(item.records.length) : '—'), node('span', item.title)); navigation.append(action);
      });
      const exclusions = screeningModel().filter(({ evaluation }) => evaluation.status === 'excluded');
      const skipped = node('div', '', 'scenario-exclusion-records');
      exclusions.forEach(({ job, evaluation }) => { const row = node('div', '', 'scenario-exclusion-record'); row.dataset.jobId = job.id; row.append(node('strong', `${job.company} · ${job.title}`), node('p', evaluation.exclusions.join('；'))); skipped.append(row); });
      const excluded = expandable(`查看硬条件未通过的${exclusions.length}个职位`, skipped); excluded.hidden = !completed(phase.filter);
      card.append(navigation, results, excluded);
      function renderRecords() {
        navigation.querySelectorAll('button').forEach(action => action.setAttribute('aria-pressed', String(action.dataset.funnelStep === funnelView)));
        results.replaceChildren(); const selectedStage = stages.find(item => item.id === funnelView && item.ready);
        results.dataset.funnelView = selectedStage?.id || 'pending';
        if (!selectedStage) { results.append(node('p', stages.some(item => item.ready) ? '点击上方阶段，查看对应职位和筛选依据。' : '先完成来源读取，再逐层查看筛选结果。', 'scenario-helper')); return; }
        results.append(node('p', `${selectedStage.title} · ${selectedStage.records.length}条`, 'scenario-funnel-caption'));
        if (!selectedStage.records.length) results.append(node('p', '该阶段没有符合条件的职位。', 'scenario-helper'));
        selectedStage.records.forEach(({ job, id, detail }) => {
          const row = node('div', '', 'scenario-funnel-record'); row.dataset.recordId = id; row.dataset.jobId = job.id;
          row.append(node('strong', `${job.company} · ${job.title}`), node('p', detail)); results.append(row);
        });
      }
      renderRecords(); return card;
    }
    function evidence(job) {
      const wrap = node('div', '', 'scenario-evidence');
      const eligibility = node('dl', '', 'scenario-facts'); eligibility.append(labeledValue('职位毕业要求', job.year ? `${job.year}届` : '公告未注明'), labeledValue('当前筛选意向', `${criteria.year}届`), labeledValue('简历原始信息', '2027届本科'), labeledValue('毕业时间判断', !job.year ? '职位信息待核实' : job.year !== criteria.year ? '职位与筛选意向不符' : job.year !== 2027 ? '职位与简历年份不符' : '职位、意向与简历一致')); wrap.append(eligibility);
      const originalPoints = points.length ? points : ['参与需求调研和功能设计，确定了小程序的主要功能模块。', '负责项目相关工作，与团队合作完成开发。', '项目上线后取得了良好效果，获得用户认可。'];
      const originalForIssue = index => index === 3 ? originalPoints.join('\n') : originalPoints[[0, 2, 1][index]] || '简历未提供这一条内容';
      const dimensions = [
        { title: '需求与岗位要求', requirement: job.requirements, gap: '说明具体调研方法、发现的问题以及功能取舍依据。' },
        { title: '结果与验证', requirement: job.duties, gap: '补充已有反馈或验证记录；没有的数据保留待补，不编造指标。' },
        { title: '个人贡献', requirement: '能说明自己负责的工作及与团队协作的边界。', gap: job.gap },
        { title: '表达与相关性', requirement: '围绕岗位职责清晰表达项目经历。', gap: '把笼统能力描述改为有行动、有对象的经历表述。' }
      ];
      dimensions.forEach((dimension, index) => {
        const row = node('section', '', 'scenario-evidence-row'); row.dataset.evidenceIssue = String(index);
        row.append(node('h6', dimension.title));
        const facts = node('dl'); facts.append(labeledValue(index < 2 ? '岗位原文' : '核对重点', dimension.requirement), labeledValue('简历原文', originalForIssue(index)), labeledValue('差距 / 待补', dimension.gap), labeledValue('信息来源', `${job.sources.join('、')} · 示例职位；产品经理校招简历 · 示例${index > 1 ? '。核对重点为基于岗位职责的归纳' : ''}`)); row.append(facts);
        const focus = { issue: index, label: dimension.title, requirement: dimension.requirement, requirementType: index < 2 ? 'original' : 'derived', original: originalForIssue(index), gap: dimension.gap };
        row.append(button('针对这一项改简历', () => request('resume', { targetJob: job, job, from: key, evidenceIssue: index, evidenceFocus: focus }))); wrap.append(row);
      });
      return wrap;
    }
    function createResults() {
      const section = node('section', '', 'scenario-results');
      const heading = node('div', '', 'scenario-section-heading'); heading.append(node('h3', key === 'screen' ? '筛选结果' : '职位推荐清单'), node('span', `${jobs.length}个独立职位`, 'scenario-helper')); section.append(heading);
      const tabs = node('div', '', 'scenario-filters'); tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', '职位结果分类');
      const list = node('div', '', 'scenario-job-list'), compare = node('div', '', 'scenario-comparison');
      const actions = node('div', '', 'scenario-result-actions');
      const compareAction = button('对比所选职位', () => {
        if (selected.size < 2) return notice('请先勾选至少两个职位进行对比。');
        renderComparison(); compare.hidden = false;
      });
      const addSelected = button('加入待投清单', () => {
        if (!selected.size) return notice('请先勾选需要加入清单的职位。');
        selected.forEach(id => savedJobs.add(id)); renderList(); notice(`已将${selected.size}个示例职位加入本次待投清单。`);
      });
      actions.append(compareAction, addSelected); section.append(tabs, actions, list, compare); compare.hidden = true;
      function updateActions() { compareAction.disabled = selected.size < 2; addSelected.disabled = selected.size === 0; compareAction.textContent = selected.size ? `对比所选职位（${selected.size}）` : '对比所选职位'; }
      function renderTabs() {
        tabs.replaceChildren(); const count = counts();
        [['all', `全部 ${jobs.length}`], ['recommended', `推荐 ${count.recommended}`], ['uncertain', `待核实 ${count.uncertain}`], ['excluded', `不符合 ${count.excluded}`]].forEach(([id, text]) => {
          const tab = button(text, () => { filter = id; renderTabs(); renderList(); }); tab.setAttribute('aria-pressed', String(filter === id)); tabs.append(tab);
        });
      }
      function renderComparison() {
        compare.replaceChildren();
        const top = node('div', '', 'scenario-section-heading'); top.append(node('h3', '职位对比'), button('收起', () => { compare.hidden = true; })); compare.append(top);
        const choices = screeningModel().filter(({ job }) => selected.has(job.id)).map(({ job }) => job);
        if (choices.length < 2) { compare.append(node('p', '再选择一个职位，即可对比。')); return; }
        const table = node('table', '', 'scenario-table'), head = node('thead'), header = node('tr'); header.append(node('th', '核对维度'));
        choices.forEach(job => header.append(node('th', `${job.company}\n${job.title}`))); head.append(header); table.append(head);
        const rows = node('tbody');
        [['地点 / 类型', job => `${job.city} · ${job.type}`], ['薪资', job => job.salary], ['核心要求', job => job.requirements], ['简历缺口 / 风险', job => job.gap], ['筛选依据', job => evaluateJob(job, criteria).reasons.join('；')]].forEach(([label, value]) => {
          const row = node('tr'); row.append(node('th', label)); choices.forEach(job => row.append(node('td', value(job)))); rows.append(row);
        }); table.append(rows); const wrap = node('div', '', 'scenario-table-wrap'); wrap.tabIndex = 0; wrap.setAttribute('aria-label', '可横向滚动的职位对比表'); wrap.append(table); compare.append(wrap);
      }
      function renderList() {
        list.replaceChildren();
        const visible = screeningModel().filter(({ evaluation }) => filter === 'all' || evaluation.status === filter).map(({ job }) => job);
        if (!visible.length) list.append(node('p', '当前分类没有职位，可以调整筛选条件。', 'scenario-empty'));
        visible.forEach(job => {
          const evaluation = evaluateJob(job, criteria), article = node('article', '', 'scenario-job-card'); article.dataset.jobId = job.id; article.dataset.match = evaluation.status;
          const title = node('div', '', 'scenario-job-heading'), select = node('label', '', 'scenario-job-select'), checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = selected.has(job.id); checkbox.setAttribute('aria-label', `选择${job.company}的${job.title}`);
          checkbox.onchange = () => { if (checkbox.checked) selected.add(job.id); else selected.delete(job.id); updateActions(); if (!compare.hidden) renderComparison(); };
          select.append(checkbox); const copy = node('div', '', 'scenario-job-title'); copy.append(node('h4', job.title), node('p', `${job.company} · ${job.city} · ${job.type}`));
          title.append(select, copy, tag(({ recommended: '推荐', uncertain: '待核实', excluded: '不符合' })[evaluation.status], evaluation.status)); article.append(title);
          const metadata = node('div', '', 'scenario-job-meta'); metadata.append(node('strong', job.salary)); job.sources.forEach(source => metadata.append(tag(source))); article.append(metadata);
          const reasons = node('ul', '', 'scenario-reasons'); evaluation.reasons.forEach(reason => reasons.append(node('li', reason))); article.append(reasons);
          const detailsBody = node('div', '', 'scenario-job-detail');
          detailsBody.append(node('h5', '职责'), node('p', job.duties), node('h5', '要求'), node('p', job.requirements), node('h5', '匹配依据与缺口'), evidence(job), node('h5', '完整说明'), node('p', job.extra), node('p', '以上为演示职位与示例判断，未从真实招聘网站读取。', 'scenario-helper'));
          article.append(expandable('查看职位详情与完整判断依据', detailsBody));
          const bottom = node('div', '', 'scenario-job-actions');
          const save = button(savedJobs.has(job.id) ? '已加入待投' : '加入待投', () => {
            if (savedJobs.has(job.id)) savedJobs.delete(job.id); else savedJobs.add(job.id);
            save.textContent = savedJobs.has(job.id) ? '已加入待投' : '加入待投'; save.setAttribute('aria-pressed', String(savedJobs.has(job.id)));
          }); save.setAttribute('aria-pressed', String(savedJobs.has(job.id)));
          bottom.append(save, button('针对岗位改简历', () => request('resume', { targetJob: job, job, from: key })), button('填写网申', () => request('apply', { job, from: key })));
          article.append(bottom); list.append(article);
        }); updateActions();
      }
      renderTabs(); renderList(); return section;
    }
    function renderApplication() {
      const target = getJob(context), targetCard = node('section', '', 'scenario-card scenario-application-target');
      targetCard.append(node('h3', `${target.company} · ${target.title}`), node('p', '使用虚构资料演示字段识别与填写。不会向招聘平台提交信息。', 'scenario-helper')); body.append(targetCard);
      if (stage === 0 && state !== 'done') {
        const profile = node('dl', '', 'scenario-facts');
        profile.append(labeledValue('使用资料', '产品经理校招简历 · 示例'), labeledValue('教育背景', '本科 · 2027届'), labeledValue('经历来源', '校园二手交易平台')); targetCard.append(profile); return;
      }
      const form = node('form', '', 'scenario-application-form scenario-card'); form.noValidate = true;
      const intro = node('div', '', 'scenario-section-heading'), progress = node('span', '', 'scenario-helper'); intro.append(node('h3', '网申字段核对'), progress); form.append(intro);
      const missingNav = node('div', '', 'scenario-missing-nav'); missingNav.setAttribute('aria-label', '定位待补充字段'); form.append(missingNav);
      const controls = new Map(), labels = new Map();
      const canEdit = state === 'done';
      const groups = [
        { title: '基本信息', ids: ['name', 'email'] },
        { title: '教育背景', ids: ['school', 'graduation'] },
        { title: '项目经历', ids: ['project'] },
        { title: '本次求职意向', ids: ['available', 'city'] }
      ];
      const groupContainers = new Map();
      groups.forEach((group, index) => {
        const fieldset = node('fieldset', '', 'scenario-form-group'); fieldset.dataset.formGroup = String(index);
        fieldset.append(node('legend', group.title)); form.append(fieldset); group.ids.forEach(id => groupContainers.set(id, fieldset));
      });
      fields.forEach(field => {
        const wrapper = node('label', '', 'scenario-field'), labelRow = node('span', '', 'scenario-field-heading');
        labelRow.append(node('strong', `${field.label}${field.required ? ' *' : ''}`)); const status = tag(''); labelRow.append(status); wrapper.append(labelRow);
        const input = document.createElement(field.multiline ? 'textarea' : 'input');
        input.name = field.id; input.id = `scenario-apply-${round}-${field.id}`; input.required = field.required; input.maxLength = field.multiline ? 3000 : 200;
        if (!field.multiline) input.type = field.type || 'text'; else input.rows = 4;
        input.value = stage >= 2 || state === 'done' ? application[field.id] : '';
        input.placeholder = field.id === 'city' ? '例如：上海' : field.id === 'available' ? '' : '等待从简历匹配';
        input.disabled = !canEdit; input.setAttribute('aria-label', field.label);
        input.oninput = () => { application[field.id] = input.value; application.confirmed = false; receipt.hidden = true; refreshFields(); updateSummaries(); updateStageResults(); };
        wrapper.append(input, node('small', field.source, 'scenario-field-source')); groupContainers.get(field.id).append(wrapper); controls.set(field.id, input); labels.set(field.id, status);
      });
      const mapping = node('div', '', 'scenario-mapping'); fields.forEach(field => mapping.append(labeledValue(field.label, field.source)));
      form.append(expandable('查看字段映射与信息来源', mapping));
      const check = node('label', '', 'scenario-checkbox-label'), checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = application.acknowledged; checkbox.disabled = !canEdit;
      checkbox.onchange = () => { application.acknowledged = checkbox.checked; application.confirmed = false; receipt.hidden = true; refreshFields(); updateSummaries(); updateStageResults(); };
      check.append(checkbox, node('span', '我已核对这份示例表单，信息与本次意向一致')); form.append(check);
      const error = node('p', '', 'scenario-error'); error.setAttribute('role', 'alert'); error.hidden = true;
      const receipt = node('div', '', 'scenario-receipt'); receipt.setAttribute('role', 'status'); receipt.hidden = !application.confirmed;
      receipt.append(node('strong', '填写结果已确认'), node('p', '信息已就绪，等待你在真实网申页面手动提交。本 Demo 不会提交网申。'));
      const submit = button('确认填写结果', null, true); submit.type = 'submit'; submit.disabled = !canEdit;
      form.append(error, submit, receipt); body.append(form);
      function refreshFields() {
        const invalid = fieldErrors(), pending = new Set(invalid.map(field => field.id));
        progress.textContent = stage < 2 && state !== 'done' ? state === 'stopped' ? '字段识别已停止 · 尚未填写' : `识别${fields.length}个字段中 · 尚未填写` : `${fields.length - invalid.length}项已匹配 · ${invalid.length}项待补充或核对`;
        missingNav.replaceChildren();
        if (stage >= 2 || state === 'done') {
          missingNav.append(node('span', invalid.length ? `${invalid.length}项待补充或核对` : '必填信息已补齐'));
          invalid.forEach(field => {
            const locate = button(field.label, () => { const input = controls.get(field.id); input.scrollIntoView({ block: 'nearest', behavior: 'auto' }); input.focus(); }); locate.dataset.missingField = field.id; locate.disabled = !canEdit; missingNav.append(locate);
          });
          if (!canEdit && invalid.length) missingNav.append(node('small', '检查结束后可补充'));
        } else missingNav.append(node('span', state === 'stopped' ? '字段识别未完成' : '正在读取字段类型与必填规则'));
        fields.forEach(field => {
          const label = labels.get(field.id), input = controls.get(field.id);
          const unfilled = stage < 2 && state !== 'done';
          label.textContent = unfilled ? '待填写' : pending.has(field.id) ? '待补充' : application.confirmed ? '已确认' : ['available', 'city'].includes(field.id) ? '已补充' : '已填入';
          label.className = `scenario-tag${unfilled || pending.has(field.id) ? ' is-uncertain' : ''}`;
          input.setAttribute('aria-invalid', String(!unfilled && pending.has(field.id)));
        });
        submit.textContent = application.confirmed ? '已确认填写结果' : '确认填写结果'; submit.disabled = !canEdit || application.confirmed;
        if (!invalid.length && application.acknowledged) error.hidden = true;
      }
      form.onsubmit = event => {
        event.preventDefault(); if (!canEdit || application.confirmed) return;
        const invalid = fieldErrors();
        if (invalid.length) { error.textContent = `请补充或检查：${invalid.map(field => field.label).join('、')}。`; error.hidden = false; controls.get(invalid[0].id).focus(); return; }
        if (!application.acknowledged) { error.textContent = '请先核对信息并勾选确认。'; error.hidden = false; checkbox.focus(); return; }
        application.confirmed = true; error.hidden = true; receipt.hidden = false; refreshFields(); updateSummaries(); updateStageResults();
      };
      refreshFields();
    }
    function render(force = false) {
      const signature = `${stage}:${state}:${guideNotes.length}`;
      if (!force && signature === lastView) return;
      lastView = signature;
      const scroll = panel.scrollTop; body.replaceChildren();
      stageLine.textContent = state === 'done' ? key === 'apply' ? '已完成字段匹配 · 等待你核对' : '工作流已完成 · 查看结果与依据' : state === 'stopped' ? `已停止 · ${definition.steps[stage].title}` : `${stage + 1} / ${definition.steps.length} · ${definition.steps[stage].title}`;
      panel.dataset.scenario = key; panel.dataset.state = state; panel.dataset.step = String(stage);
      if (guideNotes.length) {
        const notes = node('section', '', 'scenario-guide-notes'); notes.append(node('h3', '补充要求'));
        guideNotes.forEach(note => notes.append(node('p', `${note.applied ? '已更新条件' : '待你确认'}：${note.text}`))); body.append(notes);
      }
      if (key === 'apply') renderApplication();
      else {
        body.append(makeStrategy());
        body.append(sourceProgress(), createFunnel());
        if (stage >= definition.steps.length - 2 || state === 'done') {
          if (state === 'running') {
            const reviewed = completed(phase.review);
            const working = node('section', '', 'scenario-card'); working.append(node('h3', reviewed ? '详情已核对，正在整理结果' : '正在核对详情与简历证据'), node('p', '城市、毕业时间、经历要求和信息缺口会逐项进入最终清单；未核实的信息会保留标记。', 'scenario-helper'));
            const rows = node('div', '', 'scenario-review-rows');
            screeningModel().filter(({ evaluation }) => evaluation.status !== 'excluded').forEach(({ job }) => { const row = node('div', '', 'scenario-review-row'); row.append(node('span', `${job.company} · ${job.title}`), tag(reviewed ? '已核对' : '详情核对中')); rows.append(row); }); working.append(rows); body.append(working);
          } else if (state === 'done') body.append(createResults());
        }
      }
      if (state === 'stopped') body.prepend(node('p', '本轮已停止，以上保留当前进度；尚未完成的阶段没有生成结果。', 'scenario-stopped'));
      panel.scrollTop = scroll; updateSummaries(); updateStageResults();
    }
    const api = {
      key, title: definition.title, steps: definition.steps, journey: tracker.element,
      status(index = stage) { return state === 'stopped' ? '工作流已停止' : `正在${definition.steps[Math.max(0, Math.min(definition.steps.length - 1, index))].title}`; },
      update(index, nextState = 'running') {
        if (stopped && nextState !== 'stopped') return;
        if (state === 'done' && nextState === 'running') return;
        if (nextState === 'stopped') stopped = true;
        stage = Math.max(stage, Math.min(definition.steps.length - 1, Math.max(0, Number(index) || 0)));
        state = nextState; tracker.update(stage, state); mobileTracker.update(stage, state);
        render(); present(false);
      },
      result() {
        const result = node('section', '', 'scenario-chat-result'); result.dataset.scenarioResult = key;
        const summary = node('p', summaryText()); summaryNodes.add(summary); result.append(summary);
        result.append(button(key === 'apply' ? '查看并核对填写结果' : '查看结果与匹配依据', openResult));
        if (key === 'jobs') result.append(button('继续批量筛选', () => request('screen', { ...criteria })));
        return result;
      },
      guide(text, nextContext = {}) {
        if (state !== 'running') return { applied: false, reason: '当前工作流未在执行' };
        const value = String(text || '').trim(); if (!value) return { applied: false };
        let changed = false;
        if (key !== 'apply') {
          const incoming = nextContext.criteria || nextContext.config || nextContext;
          if (typeof incoming.city === 'string') { criteria.city = incoming.city.trim() || '不限'; changed = true; }
          if (typeof incoming.direction === 'string') { criteria.direction = incoming.direction.trim() || '不限'; changed = true; }
          if (typeof incoming.campusOnly === 'boolean') { criteria.campusOnly = incoming.campusOnly; changed = true; }
          if (typeof incoming.remote === 'boolean') { criteria.remote = incoming.remote; changed = true; }
          if (Number.isInteger(Number(incoming.year)) && Number(incoming.year) >= 2020 && Number(incoming.year) <= 2035) { criteria.year = Number(incoming.year); changed = true; }
          const cities = ['上海', '杭州', '北京', '深圳', '广州'].filter(city => value.includes(city));
          if (/不限城市|城市不限/.test(value)) { criteria.city = '不限'; changed = true; }
          else if (cities.length) { criteria.city = cities.join('、'); changed = true; }
          if (/只看校招|仅看校招/.test(value)) { criteria.campusOnly = true; changed = true; }
          if (/包含实习|不限招聘类型|不限校招/.test(value)) { criteria.campusOnly = false; changed = true; }
          const direction = value.match(/(?:只看|目标岗位(?:是|改为)?|岗位方向(?:是|改为)?)[：:\s]*(产品|数据分析|用户研究|运营)/);
          if (direction) { criteria.direction = direction[1]; changed = true; }
          if (/不限岗位|不限方向/.test(value)) { criteria.direction = '不限'; changed = true; }
          if (/要求远程|只看远程/.test(value)) { criteria.remote = true; changed = true; }
        }
        guideNotes.push({ text: value, applied: changed }); render(true);
        return { applied: changed, pending: !changed, message: changed ? '已更新筛选条件' : '已保留补充要求，需进一步确认具体字段或条件' };
      }
    };
    return api;
  }
  window.XiaoyouScenarios = {
    keys: Object.keys(definitions),
    describe(key) { const item = definitions[key]; return item ? { title: item.title, prompt: item.prompt } : null; },
    createRun, createJourney, clearPreview
  };
})();
