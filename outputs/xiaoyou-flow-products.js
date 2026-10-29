/* Read-only Agent thinking products for screening, materials, ATS and interview.
 * Sources: upagent-CFN5tJOA.js ScoreCard @295253, FormCard @216270,
 * TailorProcessCard @324851, ToolInvocationCard @383425; video 20–28/42–47/54–56s.
 * Composition and motion timings are the requested local adaptation. No network,
 * form submissions, workspace ownership, A4 copies, or workflow timers live here.
 * mount({host,key,profile,jobs,matches}) -> {update(patch),freeze(),destroy()}.
 */
(() => {
  'use strict';
  const node = (tag, value = '', className = '') => { const n = document.createElement(tag); n.textContent = value; n.className = className; return n; };
  const append = (owner, ...children) => { owner.append(...children.filter(Boolean)); return owner; };
  const text = (n, value) => { const next = String(value ?? ''); if (n.textContent !== next) n.textContent = next; };
  const array = value => Array.isArray(value) ? value : [];
  const integer = value => Math.max(0, Math.floor(Number(value) || 0));
  const score = value => Math.max(0, Math.min(100, Number(value) || 0));
  const copy = value => Array.isArray(value) ? value.join('；') : String(value ?? '');
  const labels = {screen: '逐岗精筛', deliver: '投递材料准备', apply: '网申信息整理', interview: '面试准备'};
  const fieldGroups = [
    {label: '基本信息', fields: [['name', '姓名', '简历 · 基本信息'], ['email', '邮箱', '简历 · 联系方式'], ['phone', '手机号', '待你补充'], ['city', '意向城市', '求职画像']]},
    {label: '教育经历', fields: [['school', '学校', '简历 · 教育经历'], ['education', '学历', '简历 · 教育经历'], ['year', '毕业年份', '简历 · 教育经历'], ['major', '专业', '简历 · 教育经历']]},
    {label: '补充信息', fields: [['availability', '可到岗时间', '待你确认'], ['experience', '项目经历', '简历 · 项目经历']]}
  ];

  function mount(options = {}) {
    if (!options.host?.append) throw new TypeError('FlowProducts requires a journey host');
    let state = {phase: 'idle', progress: 0, scanned: 0, total: 0, visibleIds: [], matches: {}, rows: {}, filledFields: [], fieldValues: {}, missingFields: [], done: false, stopped: false, ...options};
    const key = options.key, root = node('section', '', 'flow-chat-products'); root.dataset.key = key;
    options.host.append(root);
    const animations = new Set(), frames = new Set(), counters = new Set(), appeared = new WeakSet();
    let frozen = false;
    const reduced = () => frozen || state.stopped || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    function animate(target, keyframes, settings = {}) {
      if (reduced() || typeof target.animate !== 'function') return;
      const animation = target.animate(keyframes, {duration: 480, easing: 'cubic-bezier(.22,1,.36,1)', ...settings});
      animations.add(animation); animation.finished?.then(() => animations.delete(animation), () => animations.delete(animation));
    }
    function reveal(target, delay = 0) {
      target.hidden = false;
      if (appeared.has(target)) return;
      appeared.add(target); animate(target, [{opacity: 0, transform: 'translateY(18px) scale(.985)'}, {opacity: 1, transform: 'translateY(0) scale(1)'}], {delay, fill: 'backwards'});
    }
    function number(ref, target, paint, duration = 820) {
      target = score(target); if (ref.target === target) return;
      ref.target = target; ref.paint = paint; const revision = ref.revision = (ref.revision || 0) + 1;
      if (ref.frame != null) { cancelAnimationFrame(ref.frame); frames.delete(ref.frame); ref.frame = null; }
      if (reduced()) { ref.value = target; paint(target); return; }
      counters.add(ref); const start = performance.now(), from = ref.value || 0; paint(from);
      function tick(now) {
        if (frozen || state.stopped || ref.revision !== revision) return;
        if (ref.frame != null) frames.delete(ref.frame);
        const progress = Math.min(1, Math.max(0, (now - start) / duration)); ref.value = from + (target - from) * (1 - Math.pow(1 - progress, 3)); paint(ref.value);
        if (progress < 1) { ref.frame = requestAnimationFrame(tick); frames.add(ref.frame); }
        else { ref.frame = null; counters.delete(ref); }
      }
      ref.frame = requestAnimationFrame(tick); frames.add(ref.frame);
    }
    function stopMotion() {
      animations.forEach(animation => animation.cancel()); animations.clear(); frames.forEach(cancelAnimationFrame); frames.clear();
      counters.forEach(ref => { ref.revision = (ref.revision || 0) + 1; ref.frame = null; ref.value = ref.target; ref.paint?.(ref.target); }); counters.clear();
    }
    const statusHead = node('header', '', 'flow-product-status'), brand = node('span', '✦', 'flow-product-brand');
    const statusCopy = node('span', labels[key] || '正在整理'), statusCheck = node('span', '', 'flow-product-complete');
    append(statusHead, brand, statusCopy, statusCheck); root.append(statusHead);
    function group(title, className) {
      const item = node('details', '', `flow-product-group ${className}`), caption = node('span', title), meta = node('small'), body = node('div', '', 'flow-product-body');
      item.open = true; item.hidden = true;
      append(item, append(node('summary'), caption, meta, node('span', '⌄', 'flow-product-chevron')), body); root.append(item);
      return {item, caption, meta, body};
    }
    const requirements = key === 'screen' ? group('本轮细化要求', 'flow-criteria-product') : null;
    const chips = requirements ? node('div', '', 'flow-criteria-chips') : null;
    const scan = key === 'screen' ? group('逐岗评估记录', 'flow-screen-product') : null;
    const scanTop = scan ? node('div', '', 'flow-scan-heading') : null, scanCopy = scan ? node('p') : null, scanCount = scan ? node('strong', '0') : null;
    const scanTrack = scan ? node('div', '', 'flow-scan-track') : null, scanFill = scan ? node('span') : null;
    const matches = key === 'screen' ? node('div', '', 'flow-match-list') : null, empty = scan ? node('p', '正在对照简历逐岗核对，未达标的职位不列入结果。', 'flow-product-empty') : null;
    if (requirements) requirements.body.append(chips);
    if (scan) { append(scanTop, scanCopy, append(node('span', '', 'flow-scan-count'), scanCount, node('small', ' 个达标'))); scanTrack.append(scanFill); append(scan.body, scanTop, scanTrack, matches, empty); }
    const materials = key === 'deliver' ? group('简历与招呼语', 'flow-material-product') : null;
    const materialTop = materials ? node('p', '', 'flow-material-summary') : null, materialList = materials ? node('div', '', 'flow-material-list') : null;
    if (materials) append(materials.body, materialTop, materialList);
    const fields = key === 'apply' ? group('识别并补全字段', 'flow-apply-product') : null;
    const fieldIntro = fields ? node('p', '先填入简历已有信息；手机号和可到岗时间留给你核对。', 'flow-field-intro') : null;
    const fieldGroupsRoot = fields ? node('div', '', 'flow-field-groups') : null;
    if (fields) append(fields.body, fieldIntro, fieldGroupsRoot);
    const interview = key === 'interview' ? group('围绕当前职位准备练习', 'flow-interview-product') : null;
    const interviewList = interview ? node('ol', '', 'flow-interview-list') : null;
    if (interview) interview.body.append(interviewList);
    const matchRefs = new Map(), materialRefs = new Map(), fieldRefs = new Map(), interviewRefs = [];
    const jobs = () => array(state.jobs);
    const jobFor = id => jobs().find(job => job.id === id);

    function makeScore() {
      const root = node('div', '', 'flow-match-score'), svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), counter = {value: 0};
      svg.setAttribute('viewBox', '0 0 100 64'); svg.setAttribute('aria-hidden', 'true'); let arc;
      for (const cls of ['flow-score-track', 'flow-score-arc']) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', 'M 10 52 A 40 40 0 0 1 90 52'); path.setAttribute('pathLength', '100'); path.setAttribute('class', cls); svg.append(path); if (cls === 'flow-score-arc') arc = path;
      }
      const value = node('strong', '0'); append(root, svg, append(node('div'), value, node('small', '匹配度')));
      return {root, update(next) { root.setAttribute('aria-label', `示例匹配分 ${Math.round(score(next))}`); number(counter, next, n => { text(value, Math.round(n)); arc.style.strokeDashoffset = String(100 - n); }); }};
    }
    function matchCard(job) {
      const card = node('article', '', 'flow-match-card'); card.dataset.jobId = job.id; card.hidden = true;
      const gauge = makeScore(), heading = node('div', '', 'flow-match-heading'), logo = node('span', String(job.company || '岗').slice(0, 2), 'flow-company-mark');
      const title = node('h4', job.title), company = node('p', `${job.company} · ${job.city || '城市待核实'}`), reason = node('p', '', 'flow-match-reason');
      append(heading, logo, append(node('div'), company, title), gauge.root);
      const disclosure = node('details', '', 'flow-match-evidence'), dimensionList = node('div', '', 'flow-dimension-list');
      append(disclosure, append(node('summary'), node('span', '匹配依据'), node('span', '⌄', 'flow-product-chevron')), dimensionList);
      append(card, heading, reason, disclosure); matches.append(card);
      const dimensions = new Map();
      return {card, update(value) {
        gauge.update(value.score); text(reason, (value.summary || job.gap || '结合简历继续核对岗位要求。').replace(/（示例规则评分）$/, ''));
        array(value.dimensions).forEach((dimension, index) => {
          const id = dimension.label || String(index); let ref = dimensions.get(id);
          if (!ref) {
            const row = node('section', '', 'flow-dimension'), label = node('strong'), value = node('small'), bar = node('div', '', 'flow-dimension-bar'), fill = node('span'), proof = node('p'), gap = node('p', '', 'flow-dimension-gap');
            bar.append(fill); append(row, append(node('div', '', 'flow-dimension-heading'), label, value), bar, proof, gap); dimensionList.append(row); ref = {row, label, value, fill, proof, gap}; dimensions.set(id, ref);
          }
          text(ref.label, dimension.label); text(ref.value, `${Math.round(score(dimension.score))} / 100`); ref.fill.style.width = `${score(dimension.score)}%`; text(ref.proof, copy(dimension.evidence)); text(ref.gap, dimension.gap ? `待核实 · ${copy(dimension.gap)}` : ''); ref.gap.hidden = !dimension.gap; ref.row.hidden = false;
        });
        dimensions.forEach((ref, id) => { ref.row.hidden = !array(value.dimensions).some((item, index) => (item.label || String(index)) === id); });
      }};
    }
    function stateMark(kind) {
      const root = node('span', '', 'flow-material-state'), mark = node('i'), label = node('span'); append(root, mark, label);
      return {root, update(value) {
        const next = ['ready', 'submitted', 'done'].includes(value) ? 'ready' : ['working', 'running'].includes(value) ? 'working' : 'idle';
        const previous = root.dataset.state; root.dataset.state = next; text(mark, next === 'ready' ? '✓' : next === 'working' ? '' : '·');
        text(label, next === 'ready' ? kind === 'resume' ? '简历已定制' : kind === 'greeting' ? '招呼语已生成' : '已模拟投递' : next === 'working' ? kind === 'submit' ? '模拟投递中' : '准备中' : kind === 'submit' ? '待确认' : '待准备');
        if (next === 'ready' && previous !== next) animate(mark, [{opacity: 0, transform: 'scale(.45)'}, {opacity: 1, transform: 'scale(1.15)', offset: .65}, {opacity: 1, transform: 'scale(1)'}], {duration: 340});
      }};
    }
    function materialCard(job) {
      const card = node('article', '', 'flow-material-card'); card.dataset.jobId = job.id; card.hidden = true;
      const identity = node('div', '', 'flow-material-identity'), logo = node('span', String(job.company || '岗').slice(0, 2), 'flow-company-mark');
      const pdf = append(node('div', '', 'flow-material-pdf'), node('b', 'PDF'), node('span'));
      const resume = stateMark('resume'), greeting = stateMark('greeting'), submitted = stateMark('submit');
      const materialTask = (title, status) => append(node('div', '', 'flow-material-task'), node('h5', title), status);
      append(identity, logo, append(node('div'), node('strong', job.company), node('span', job.title))); append(card, identity, pdf, append(node('div', '', 'flow-material-pair'), materialTask('定制简历', resume.root), materialTask('专属招呼语', greeting.root)), submitted.root); materialList.append(card);
      return {card, update(row) {
        text(pdf.lastChild, row.resumeName || `${state.profile?.name || '林同学'}_${job.company}_${job.title.replace(/\s*[·/].*$/, '')}.pdf`);
        const readyResume = row.resumeStatus || (row.resumeReady ? 'ready' : 'idle'), readyGreeting = row.greetingStatus || (row.greetingReady ? 'ready' : 'idle');
        resume.update(readyResume); greeting.update(readyGreeting); submitted.update(row.submitStatus || (row.status && !['pending', 'archived'].includes(row.status) ? 'submitted' : 'idle'));
        submitted.root.hidden = state.phase !== 'submit' && !['working', 'submitted'].includes(row.submitStatus); card.dataset.active = String(state.activeId === job.id && !state.done && !state.stopped); card.dataset.ready = String(readyResume === 'ready' && readyGreeting === 'ready');
      }};
    }
    if (fields) fieldGroups.forEach(config => {
      const group = node('section', '', 'flow-field-group'); group.append(node('h4', config.label)); const list = node('dl'); group.append(list); fieldGroupsRoot.append(group);
      config.fields.forEach(([id, label, source]) => {
        const row = node('div', '', 'flow-field'); row.dataset.field = id;
        const mark = node('i', '·'), caption = node('dt', label), value = node('dd', '待读取'), provenance = node('small', source);
        append(row, mark, caption, append(node('div'), value, provenance)); list.append(row); fieldRefs.set(id, {row, mark, value, provenance, source});
      });
    });
    if (interview) [
      ['梳理岗位关注点', '核对职责、任职要求与当前职位上下文。'],
      ['整理可追问的经历', '围绕项目中的个人贡献、判断过程与结果依据。'],
      ['准备逐题练习', '生成与示例经历相关的问题，准备好后在右侧作答。']
    ].forEach(([title, description], index) => {
      const row = node('li', '', 'flow-interview-step'), mark = node('i', String(index + 1));
      append(row, mark, append(node('div'), node('h4', title), node('p', description))); interviewList.append(row); interviewRefs.push({row, mark});
    });
    const history = node('p', '', 'flow-product-history'); history.hidden = true; root.append(history);

    function update(patch = {}) {
      if (frozen) return;
      const resetMatches = Object.hasOwn(patch, 'matches') && Object.keys(patch.matches || {}).length === 0 && Array.isArray(patch.visibleIds) && patch.visibleIds.length === 0;
      state = {...state, ...patch, profile: patch.profile ? {...state.profile, ...patch.profile} : state.profile,
        rows: patch.rows ? {...state.rows, ...patch.rows} : state.rows,
        fieldValues: patch.fieldValues ? {...state.fieldValues, ...patch.fieldValues} : state.fieldValues,
        matches: patch.matches ? resetMatches ? {} : {...state.matches, ...patch.matches} : state.matches};
      root.dataset.phase = state.phase; root.dataset.done = String(Boolean(state.done)); root.dataset.stopped = String(Boolean(state.stopped));
      text(statusCopy, state.stopped ? '已停止，保留当前过程' : state.phaseLabel || labels[key]);
      text(statusCheck, state.done ? '✓' : state.stopped ? 'Ⅱ' : '');
      if (requirements) {
        reveal(requirements.item); const p = state.profile || {}, values = [p.direction || '方向待确认', p.city || '城市不限', p.jobType && p.jobType !== '不限' ? p.jobType : '校招 / 实习', p.industry && p.industry !== '不限' ? p.industry : '', p.minSalaryK ? `月薪 ≥ ${p.minSalaryK}K` : '', `匹配度 ≥ ${p.minScore ?? 80}`].filter(Boolean);
        const signature = values.join('|'); if (chips.dataset.signature !== signature) { chips.replaceChildren(...values.map((value, index) => { const chip = node('span', value); animate(chip, [{opacity: 0, transform: 'translateX(12px)'}, {opacity: 1, transform: 'translateX(0)'}], {duration: 420, delay: index * 100, fill: 'backwards'}); return chip; })); chips.dataset.signature = signature; }
        text(requirements.meta, '只读过程');
      }
      if (scan) {
        reveal(scan.item); const total = Math.max(integer(state.total), jobs().length), scanned = Math.min(total, integer(state.scanned));
        const eligible = array(state.visibleIds).filter(id => state.matches?.[id]?.eligible === true && Number(state.matches[id].score) >= (state.profile?.minScore ?? 80) && jobFor(id));
        text(scan.meta, `${scanned} / ${total}`); text(scanCopy, state.stopped ? `已核对 ${scanned} 个职位` : state.done ? `已核对 ${total} 个职位` : `正在逐岗核对 · ${scanned} / ${total}`); text(scanCount, eligible.length);
        scanTrack.setAttribute('role', 'progressbar'); scanTrack.setAttribute('aria-label', '逐岗精筛进度'); scanTrack.setAttribute('aria-valuemin', '0'); scanTrack.setAttribute('aria-valuemax', String(total)); scanTrack.setAttribute('aria-valuenow', String(scanned)); scanFill.style.width = `${total ? scanned / total * 100 : 0}%`;
        matchRefs.forEach((ref, id) => { ref.card.hidden = !eligible.includes(id); });
        eligible.forEach((id, index) => {
          let ref = matchRefs.get(id); if (!ref) { ref = matchCard(jobFor(id)); matchRefs.set(id, ref); }
          const current = matches.children[index]; if (current !== ref.card) matches.insertBefore(ref.card, current || null);
          ref.card.dataset.recommended = String(index === 0); ref.card.dataset.active = String(state.activeId === id && !state.stopped); ref.update(state.matches[id]); reveal(ref.card, index * 40);
        });
        empty.hidden = eligible.length > 0; text(empty, state.done ? '当前要求下暂无达标职位，可调整细化要求再筛。' : state.stopped ? '当前未出现达标结果，已停止本轮核对。' : '正在对照简历逐岗核对，未达标的职位不列入结果。');
      }
      if (materials) {
        reveal(materials.item); let ready = 0, sent = 0;
        jobs().forEach((job, index) => {
          let ref = materialRefs.get(job.id); if (!ref) { ref = materialCard(job); materialRefs.set(job.id, ref); }
          const row = {...state.applications?.[job.id], ...state.rows?.[job.id]}; ref.update(row); reveal(ref.card, index * 55);
          if ((row.resumeStatus === 'ready' || row.resumeReady) && (row.greetingStatus === 'ready' || row.greetingReady)) ready++;
          if (row.submitStatus === 'submitted' || row.status && !['pending', 'archived'].includes(row.status)) sent++;
        });
        materialRefs.forEach((ref, id) => { if (!jobFor(id)) ref.card.hidden = true; });
        text(materials.meta, `${ready} / ${jobs().length} 已准备`); text(materialTop, state.phase === 'submit' ? `模拟投递进度 ${sent} / ${jobs().length} · 材料状态分别保留` : `${ready} / ${jobs().length} 个职位的两项材料已齐备`);
      }
      if (fields) {
        reveal(fields.item); const filled = new Set(array(state.filledFields)), missing = new Set(array(state.missingFields)), userFields = new Set(array(state.userFields));
        text(fields.meta, `${filled.size} / ${fieldRefs.size} 已整理`);
        fieldRefs.forEach((ref, id) => {
          const active = state.activeField === id && !state.stopped && !state.done, complete = filled.has(id), absent = missing.has(id) || state.done && !complete;
          const previous = ref.row.dataset.state; ref.row.dataset.state = active ? 'working' : complete ? 'ready' : absent ? 'missing' : 'idle';
          text(ref.mark, complete ? '✓' : absent ? '!' : active ? '' : '·'); text(ref.value, complete ? copy(state.fieldValues?.[id]) || '待核对' : absent ? '待你补充' : active ? '正在补全…' : '待读取'); text(ref.provenance, userFields.has(id) ? '由你补充' : absent ? '待你补充' : ref.source);
          if (complete && previous !== 'ready') animate(ref.row, [{backgroundColor: 'rgba(69,89,255,.12)', transform: 'translateX(5px)'}, {backgroundColor: 'rgba(69,89,255,0)', transform: 'translateX(0)'}], {duration: 560});
        });
      }
      if (interview) {
        reveal(interview.item); const done = state.done ? 3 : Math.min(2, Math.floor(integer(state.progress) / 33));
        text(interview.meta, `${done} / 3`);
        interviewRefs.forEach((ref, index) => { const next = index < done ? 'ready' : index === done && !state.stopped && !state.done ? 'working' : 'idle'; ref.row.dataset.state = next; text(ref.mark, next === 'ready' ? '✓' : next === 'working' ? '' : String(index + 1)); reveal(ref.row, index * 100); });
      }
      if (state.stopped) stopMotion();
    }
    function freeze() {
      if (frozen) return; frozen = true; root.dataset.frozen = 'true'; stopMotion(); history.hidden = false;
      text(history, '本次过程已保留，可展开回看。后续操作请使用当前任务窗口。');
    }
    update(options); return {update, freeze, destroy: freeze};
  }
  window.XiaoyouFlowProducts = {mount};
})();
