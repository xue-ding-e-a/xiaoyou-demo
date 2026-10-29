/* Demo-only career state. Fictional jobs; no UPCV account, API or submission access. */
(() => {
  'use strict';
  const KEY = 'xiaoyou-demo:career:v1';
  const copy = value => JSON.parse(JSON.stringify(value));
  const text = (value, fallback = '', max = 4000) => typeof value === 'string' ? value.slice(0, max) : fallback;
  const sourceLabels = Object.freeze({ BOSS: 'BOSS直聘', '站内职位': '站内资源', '站内校招': '站内校招', '网页搜索': '网页搜索', '招聘官网': '企业官网' });
  const jobs = [
    { id: 'pine-pm', company: '云杉科技', title: '产品经理 · 校招', city: '上海', direction: '产品', type: '校招', year: 2027, salary: '12–18K · 14薪', sources: ['站内职位', 'BOSS'], industry: '互联网', companyType: '民营企业', education: '本科', major: '专业不限', remote: false, deadline: '2026-11-30',
      duties: '参与用户访谈与需求分析，设计产品流程和交互原型；与研发协作，跟进上线与用户反馈。', requirements: '2027届本科及以上；具备校园产品项目经历，能够说明需求判断与个人贡献。SQL 为加分项。', gap: '简历已有需求调研与功能设计经历，但个人贡献与验证依据还不够具体。', extra: '培养方向为产品经理。业务场景、团队配置和转正考核方式需在沟通时进一步确认。' },
    { id: 'bridge-ops', company: '星桥数据', title: '产品运营 · 校招', city: '上海', direction: '产品', type: '校招', year: 2027, salary: '11–16K · 13薪', sources: ['站内校招'], industry: '互联网', companyType: '民营企业', education: '本科', major: '专业不限', remote: false, deadline: '2026-11-15',
      duties: '整理用户反馈，协助产品功能推广与使用分析；维护反馈记录，推动需求与运营协同。', requirements: '2027届本科及以上；熟悉 Excel，具备用户研究或校园项目经验；能够将反馈转化为改进建议。', gap: '用户反馈与校园推广经历相关，仍需补充可追溯的运营结果。', extra: '岗位兼顾产品与运营。具体工作中数据分析和内容运营的占比需向招聘方核实。' },
    { id: 'mountain-data', company: '远山软件', title: '数据分析实习生', city: '杭州', direction: '数据分析', type: '实习', year: 2027, salary: '180–250元/天', sources: ['站内职位'], industry: '软件服务', companyType: '民营企业', education: '本科', major: '计算机类', remote: false, deadline: '2026-12-20',
      duties: '使用 SQL 整理业务数据，维护分析报表，并与产品团队讨论转化漏斗和异常指标。', requirements: '在校本科生；熟悉 SQL 和 Excel；每周到岗至少4天、连续实习3个月。', gap: '技能栏包含 SQL，但简历尚未呈现完整的数据分析项目证据。', extra: '岗位为线下实习。每周到岗天数和实习时长需要候选人确认。' },
    { id: 'sail-assistant', company: '启程科技', title: '产品助理 · 校招', city: '上海', direction: '产品', type: '校招', year: null, salary: '薪资待核实', sources: ['招聘官网'], industry: '软件服务', companyType: '民营企业', education: '本科', major: '专业不限', remote: true, deadline: '',
      duties: '协助需求整理、原型设计和项目文档维护；参加需求评审，追踪问题并整理验收记录。', requirements: '本科及以上，具备清晰表达与文档整理能力；公告未明确毕业年份和薪资范围。', gap: '方向与经历相关，但毕业年份、薪资和远程安排需要招聘方确认。', extra: '示例公告允许部分远程协作，但未说明远程天数。' },
    { id: 'sky-senior', company: '晴空科技', title: '资深产品经理', city: '上海', direction: '产品', type: '社招', year: null, salary: '25–35K · 14薪', sources: ['BOSS'], industry: '互联网', companyType: '民营企业', education: '本科', major: '专业不限', remote: false, deadline: '',
      duties: '独立负责商业产品规划，管理需求优先级，协调多个团队并对产品经营指标负责。', requirements: '3年以上全职产品经验，具有复杂业务产品独立负责经历。', gap: '当前简历为应届生校园项目，不满足3年以上全职经验要求。', extra: '职位明确面向有经验候选人，应与校招推荐分开评估。' },
    { id: 'north-research', company: '北辰教育', title: '用户研究 · 校招', city: '北京', direction: '用户研究', type: '校招', year: 2027, salary: '10–15K · 13薪', sources: ['站内校招', '站内职位'], industry: '教育', companyType: '民营企业', education: '本科', major: '专业不限', remote: false, deadline: '2026-11-08',
      duties: '协助用户访谈、可用性测试和研究记录整理，向产品团队提供用户问题与改进建议。', requirements: '2027届本科及以上，具备访谈或研究项目经历；需要在北京办公。', gap: '已有用户调研经历，但需要展示研究方法与洞察产出；城市与默认意向不同。', extra: '适合愿意扩大岗位方向和城市范围的候选人。是否接受异地需要先确认。' },
    { id: 'river-product', company: '清川智造', title: '数字化产品专员 · 校招', city: '上海', direction: '产品', type: '校招', year: 2027, salary: '10–15K · 14薪', sources: ['站内校招', '招聘官网'], industry: '智能制造', companyType: '国有企业', education: '本科', major: '管理类', remote: false, deadline: '2026-11-10',
      duties: '参与企业内部数字化需求调研，绘制业务流程，协助需求验收与产品上线。', requirements: '2027届本科及以上；信息管理或相关专业优先；能清晰记录需求与推动协作。', gap: '信息管理背景与岗位相关，需补充流程设计及需求验收的具体产出。', extra: '轮岗安排和办公地点需在正式沟通时核实。' },
    { id: 'wood-service', company: '青木公共服务研究院', title: '信息服务助理 · 校招', city: '杭州', direction: '产品', type: '校招', year: 2027, salary: '薪资待核实', sources: ['招聘官网'], industry: '公共服务', companyType: '事业单位', education: '本科', major: '管理类', remote: false, deadline: '2026-11-03',
      duties: '参与公共服务信息平台调研、需求整理和使用反馈分析，协助维护服务资料。', requirements: '2027届本科及以上；信息管理相关专业；具体资格条件以招聘公告为准。', gap: '专业方向相关，但岗位资格、考试安排和薪酬仍需核实。', extra: '示例事业单位招聘，不代表真实招聘公告。' }
  ];
  // These are fictional catalogue records, not results fetched from the named
  // platforms. One stable job ID may retain several illustrative source labels.
  const additionalJobs = [
    ['gale-product','霁禾科技','AI 产品助理 · 校招','上海','产品','校招',2027,'本科','14–20K · 14薪',['BOSS','网页搜索'],'人工智能'],
    ['mint-platform','薄荷云图','平台产品经理 · 校招','上海','产品','校招',2027,'本科','12–18K · 13薪',['站内职位'],'软件服务'],
    ['cobalt-b2b','钴蓝协作','企业服务产品经理 · 校招','上海','产品','校招',2027,'本科','13–19K · 14薪',['招聘官网','网页搜索'],'企业服务'],
    ['amber-ops','琥珀互联','产品运营专员 · 校招','上海','产品','校招',2027,'本科','10–15K · 13薪',['站内校招'],'互联网'],
    ['tide-commerce','潮汐集市','电商产品经理 · 校招','上海','产品','校招',2027,'本科','15–21K · 14薪',['BOSS','站内职位'],'电子商务'],
    ['sprout-intern','芽序工具','产品实习生','上海','产品','实习',2027,'本科','180–220元/天',['BOSS'],'软件服务'],
    ['ink-finance','墨辰数科','金融产品研究员 · 校招','上海','产品','校招',2027,'硕士','20–26K · 14薪',['招聘官网'],'金融科技'],
    ['crest-product','峰岸应用','产品培训生 · 2026届','上海','产品','校招',2026,'本科','11–16K · 13薪',['站内校招'],'互联网'],
    ['axis-product','轴点系统','高级产品经理','上海','产品','社招',null,'本科','28–38K · 15薪',['BOSS','网页搜索'],'企业服务'],
    ['lumen-pm','流明智联','智能硬件产品经理 · 校招','杭州','产品','校招',2027,'本科','15–22K · 14薪',['招聘官网'],'智能硬件'],
    ['cedar-pm','杉序信息','内容产品经理 · 校招','北京','产品','校招',2027,'本科','16–23K · 14薪',['BOSS'],'数字内容'],
    ['bay-pm','湾境创新','出行产品经理 · 校招','深圳','产品','校招',2027,'本科','16–24K · 14薪',['站内职位','网页搜索'],'智慧交通'],
    ['violet-pm','紫穗科技','行业产品助理 · 校招','成都','产品','校招',2027,'本科','10–15K · 13薪',['站内校招'],'软件服务'],
    ['willow-pm','柳岸电商','交易产品经理 · 校招','广州','产品','校招',2027,'本科','12–18K · 13薪',['招聘官网'],'电子商务'],
    ['meadow-pm','原野数智','数字化产品专员 · 校招','南京','产品','校招',2027,'本科','11–17K · 14薪',['网页搜索'],'智能制造'],
    ['orbit-data','环序数据','业务数据分析师 · 校招','上海','数据分析','校招',2027,'本科','12–18K · 14薪',['站内职位'],'企业服务'],
    ['quartz-data','晶石实验室','数据科学助理 · 校招','杭州','数据分析','校招',2027,'硕士','18–26K · 14薪',['招聘官网','网页搜索'],'人工智能'],
    ['dawn-data','晨曦图谱','数据分析实习生','北京','数据分析','实习',2027,'本科','200–260元/天',['BOSS'],'数字内容'],
    ['reed-data','苇序科技','增长数据分析师 · 校招','深圳','数据分析','校招',2027,'本科','15–22K · 14薪',['站内校招'],'互联网'],
    ['iris-data','鸢尾商业','商业分析助理 · 校招','成都','数据分析','校招',2027,'本科','10–15K · 13薪',['网页搜索'],'零售'],
    ['ripple-research','涟漪研究','用户研究员 · 校招','上海','用户研究','校招',2027,'硕士','15–21K · 14薪',['招聘官网'],'咨询服务'],
    ['plum-research','梅序教育','学习体验研究员 · 校招','杭州','用户研究','校招',2027,'本科','11–16K · 13薪',['站内校招'],'教育'],
    ['acorn-research','橡果洞察','用户研究实习生','北京','用户研究','实习',2027,'硕士','180–250元/天',['BOSS','网页搜索'],'咨询服务'],
    ['stone-research','石径互动','体验研究助理 · 校招','深圳','用户研究','校招',2027,'本科','13–18K · 14薪',['站内职位'],'互联网'],
    ['petal-design','花序设计','交互设计师 · 校招','上海','交互设计','校招',2027,'本科','12–18K · 13薪',['招聘官网'],'设计服务'],
    ['lake-design','湖镜数字','体验设计师 · 校招','杭州','交互设计','校招',2027,'本科','11–17K · 13薪',['BOSS'],'软件服务'],
    ['star-design','星麓智研','智能体验设计师 · 校招','北京','交互设计','校招',2027,'硕士','16–24K · 14薪',['站内校招','网页搜索'],'人工智能'],
    ['branch-design','枝间创意','交互设计实习生','广州','交互设计','实习',2027,'本科','150–220元/天',['站内职位'],'设计服务'],
    ['cloud-dev','云栖前端','前端开发工程师 · 校招','上海','前端开发','校招',2027,'本科','16–23K · 14薪',['BOSS','招聘官网'],'软件服务'],
    ['bamboo-dev','竹澜系统','Web 前端工程师 · 校招','深圳','前端开发','校招',2027,'本科','18–26K · 14薪',['站内职位'],'企业服务'],
    ['silver-dev','银叶科技','前端研发工程师 · 校招','杭州','前端开发','校招',2027,'本科','15–22K · 14薪',['网页搜索'],'互联网'],
    ['pearl-dev','珠序工具','前端开发实习生','成都','前端开发','实习',2027,'本科','160–230元/天',['站内校招'],'软件服务'],
    ['frost-market','霜桥品牌','市场运营专员 · 校招','上海','市场运营','校招',2027,'本科','11–16K · 13薪',['招聘官网'],'消费品'],
    ['coral-market','珊序生活','用户运营专员 · 校招','广州','市场运营','校招',2027,'本科','10–15K · 13薪',['BOSS'],'零售'],
    ['moon-market','月岛传媒','内容运营专员 · 校招','北京','市场运营','校招',2027,'本科','13–18K · 13薪',['站内职位','网页搜索'],'数字内容'],
    ['firefly-market','萤光商贸','渠道运营助理 · 校招','杭州','市场运营','校招',2027,'大专','9–13K · 13薪',['站内校招'],'电子商务'],
    ['summit-hr','峦序企业服务','人力资源专员 · 校招','上海','人力资源','校招',2027,'本科','10–14K · 13薪',['招聘官网'],'企业服务'],
    ['brook-hr','溪谷人才','招聘运营助理 · 校招','南京','人力资源','校招',2027,'本科','8–12K · 13薪',['BOSS','网页搜索'],'人力资源服务'],
    ['sun-finance','曦原实业','财务分析助理 · 校招','上海','财务','校招',2027,'本科','11–16K · 14薪',['站内校招'],'智能制造'],
    ['field-finance','田域供应链','财务管培生 · 校招','北京','财务','校招',2027,'硕士','14–20K · 14薪',['招聘官网','网页搜索'],'物流供应链']
  ];
  const roleContent = {
    '产品': ['开展用户访谈与需求整理，绘制业务流程和交互原型，协同开发测试并记录上线反馈。', '能够结合项目说明需求判断、个人贡献与交付物；熟悉需求分析和原型设计。', '已有校园产品经历可供核对，需补充具体决策、验收方式与结果依据。', '管理类'],
    '数据分析': ['整理业务数据和指标口径，使用 SQL 与表格工具维护分析报表，解释异常并形成验证建议。', '掌握 SQL、Excel 和基础统计方法，能够提供完整的数据分析项目。', '简历需要补充数据清洗、指标定义、分析结论及其验证过程。', '计算机类'],
    '用户研究': ['协助制定研究问题，执行访谈或可用性测试，整理原始记录并向业务团队呈现研究结论。', '熟悉访谈、问卷或可用性测试方法，能够区分事实、推断和研究限制。', '需核对研究方法、样本选择和洞察如何影响实际设计。', '专业不限'],
    '交互设计': ['梳理用户任务与界面流程，制作交互原型，参与设计评审和可用性测试，维护设计说明。', '能够提供设计作品集，熟悉 Figma 或同类原型工具，表达清晰。', '需要作品集展示问题定义、交互取舍和测试反馈。', '专业不限'],
    '前端开发': ['使用 JavaScript 构建页面和组件，联调接口，完成代码审查、测试与性能问题排查。', '掌握 HTML、CSS、JavaScript，具备独立完成前端项目的经历。', '简历尚需提供代码贡献、组件设计及测试或性能验证证据。', '计算机类'],
    '市场运营': ['整理用户与渠道反馈，协助策划内容和活动，跟踪传播与转化数据，复盘运营动作。', '具备清晰文案表达和表格分析能力，能够说明活动目标与个人执行过程。', '需要补充受众分析、渠道执行和可追溯的活动结果。', '专业不限'],
    '人力资源': ['协助招聘需求整理、候选人沟通与流程安排，维护招聘数据，支持入职与培训项目。', '具备细致的信息整理与沟通能力，遵守候选人信息保密要求。', '需核对招聘协作、流程组织或校园活动中的相关经验。', '管理类'],
    '财务': ['协助核对业务台账与费用数据，整理经营分析材料，维护预算记录并支持月度报表。', '具备会计或财务基础，熟悉 Excel，能够准确核对数据与原始凭据。', '需要核对财务课程、数据准确性与台账或分析项目的证据。', '管理类']
  };
  additionalJobs.forEach(([id,company,title,city,direction,type,year,education,salary,sources,industry],index) => {
    const [duties,skills,gap,major] = roleContent[direction];
    const eligibility = type === '社招' ? '3年以上相关全职工作经验' : type === '实习' ? `${year}届在校生；每周到岗至少4天，连续实习3个月` : `${year}届毕业生`;
    jobs.push({ id,company,title,city,direction,type,year,education,salary,sources,industry,major,
      companyType: industry === '智能制造' || industry === '物流供应链' ? '国有企业' : '民营企业', remote: id === 'mint-platform',
      deadline: type === '社招' ? '' : `2026-${index % 3 === 0 ? '12' : '11'}-${String(5+index%24).padStart(2,'0')}`,
      duties: `${industry}场景：${duties}`, requirements: `${education}及以上；${eligibility}；${skills}`, gap,
      extra: '虚构示例岗位。来源名称仅用于展示多来源工作流，未连接平台或实际检索招聘信息；工作安排以演示条件为准。' });
  });
  jobs.forEach(job => {
    const monthly = job.salary.match(/^(\d+(?:\.\d+)?)[–-]\d+(?:\.\d+)?K/);
    job.minSalaryK = monthly ? Number(monthly[1]) : null;
  });
  const jobIds = new Set(jobs.map(job => job.id));
  const statuses = new Set(['pending', 'applied', 'replied', 'interview', 'offer', 'archived']);
  const listeners = new Set();
  const initial = () => ({ profile: { ready: true, name: '林同学', direction: '产品', city: '上海', year: 2027, education: '本科', school: '某大学', internship: '', projects: ['校园二手交易平台：参与需求调研、功能设计和推广。'], minScore: 80, minSalaryK: 0, jobType: '不限', industry: '不限' }, candidateIds: [], searchCompleted: false, shortlistIds: [], selectedIds: [], matches: {}, applications: {} });
  const ids = value => [...new Set(Array.isArray(value) ? value.filter(id => jobIds.has(id)) : [])];
  function clean(value, depth = 0) {
    if (depth > 6) return null;
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'string') return value.slice(0, 12000);
    if (Array.isArray(value)) return value.slice(0, 100).map(item => clean(item, depth + 1));
    if (value && typeof value === 'object') {
      const result = {};
      Object.keys(value).slice(0, 100).forEach(key => { if (!['__proto__', 'constructor', 'prototype'].includes(key)) result[key] = clean(value[key], depth + 1); });
      return result;
    }
    return null;
  }
  function application(id, patch = {}, previous = {}) {
    return { id, status: statuses.has(patch.status) ? patch.status : statuses.has(previous.status) ? previous.status : 'pending',
      resumeReady: typeof patch.resumeReady === 'boolean' ? patch.resumeReady : previous.resumeReady === true,
      greetingReady: typeof patch.greetingReady === 'boolean' ? patch.greetingReady : previous.greetingReady === true,
      greeting: text(patch.greeting, previous.greeting || ''), updated: text(patch.updated, previous.updated || new Date().toISOString(), 80),
      pinned: typeof patch.pinned === 'boolean' ? patch.pinned : previous.pinned === true,
      nextAction: text(patch.nextAction, previous.nextAction || '', 200),
      resumeName: text(patch.resumeName, previous.resumeName || '', 200) };
  }
  function profile(patch, previous) {
    const next = { ...previous };
    ['name', 'direction', 'city', 'education', 'school', 'internship'].forEach(key => { if (typeof patch[key] === 'string') next[key] = text(patch[key]); });
    if (typeof patch.ready === 'boolean') next.ready = patch.ready;
    if (Number.isInteger(patch.year) && patch.year >= 2000 && patch.year <= 2100) next.year = patch.year;
    if (Array.isArray(patch.projects)) next.projects = clean(patch.projects);
    if (typeof patch.minScore === 'number' && Number.isFinite(patch.minScore) && patch.minScore >= 0 && patch.minScore <= 100) next.minScore = patch.minScore;
    if (typeof patch.minSalaryK === 'number' && Number.isFinite(patch.minSalaryK) && patch.minSalaryK >= 0 && patch.minSalaryK <= 1000) next.minSalaryK = patch.minSalaryK;
    if (['不限', '校招', '实习', '社招'].includes(patch.jobType)) next.jobType = patch.jobType;
    if (typeof patch.industry === 'string') next.industry = text(patch.industry.trim(), '不限', 80) || '不限';
    return next;
  }
  let state = initial();
  function read(saved) {
    if (!saved || typeof saved !== 'object') return;
    if (saved.profile && typeof saved.profile === 'object') state.profile = profile(saved.profile, state.profile);
    state.candidateIds = ids(saved.candidateIds); state.selectedIds = ids(saved.selectedIds);
    // Older v1 data stored fine-screened IDs as candidates. Preserve the data,
    // but only an explicit new marker identifies a completed broad search.
    state.searchCompleted = saved.searchCompleted === true; state.shortlistIds = ids(saved.shortlistIds);
    jobs.forEach(job => {
      if (saved.matches?.[job.id] && typeof saved.matches[job.id] === 'object') state.matches[job.id] = clean(saved.matches[job.id]);
      if (saved.applications?.[job.id] && typeof saved.applications[job.id] === 'object') state.applications[job.id] = application(job.id, saved.applications[job.id]);
    });
  }
  try { read(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch (_) { /* Memory state remains usable if storage is unavailable. */ }
  function commit() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* Private mode / full storage. */ }
    listeners.forEach(listener => { try { listener(copy(state)); } catch (error) { console.error('Career state subscriber failed', error); } });
    return copy(state);
  }
  window.XiaoyouCareerStore = Object.freeze({
    getJobs: () => copy(jobs),
    getJob: id => { const job = jobs.find(item => item.id === id); return job ? copy(job) : null; },
    sourceLabel: value => Object.hasOwn(sourceLabels,value) ? sourceLabels[value] : String(value || ''),
    snapshot: () => copy(state),
    updateProfile: patch => { if (patch && typeof patch === 'object') state.profile = profile(patch, state.profile); return commit(); },
    setCandidates: values => { state.candidateIds = ids(values); state.searchCompleted = true; return commit(); },
    setShortlist: values => { state.shortlistIds = ids(values); return commit(); },
    setSelected: values => { state.selectedIds = ids(values); return commit(); },
    setMatch: (id, result) => { if (jobIds.has(id) && result && typeof result === 'object') state.matches[id] = clean(result); return commit(); },
    upsertApplication: (id, patch = {}) => { if (jobIds.has(id)) state.applications[id] = application(id, { ...patch, updated: new Date().toISOString() }, state.applications[id]); return commit(); },
    subscribe: listener => { if (typeof listener !== 'function') return () => {}; listeners.add(listener); return () => listeners.delete(listener); },
    reset: () => { state = initial(); return commit(); }
  });
})();
