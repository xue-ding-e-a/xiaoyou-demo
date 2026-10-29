/* Target-job understanding is a retained product in the Agent conversation.
 * The right workspace owns the single original A4 and its format.
 * Source: public upagent-CFN5tJOA.js Tv @496374 (10px/p-4/150ms job surface),
 * message parts @385500 and horizontal Agent/workspace @758600–760400;
 * video 29–41s supplies keyword/line correspondence, not this chat composition.
 * API remains open(job|id|null), sync(), close(). close freezes chat history.
 * No network, document clones, document writes or format/control changes.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const terms = [
    ['需求调研', '需求分析', '需求判断', '用户访谈', '用户研究', '用户问题', '研究方法', '需求整理', '调研', '访谈'],
    ['个人贡献', '研发协作', '跨团队', '产品流程', '交互原型', '功能设计', '原型设计', '需求评审', '项目协作', '跟进上线', '协作', '设计', '上线', '推动'],
    ['用户反馈', '使用分析', '验证依据', '业务数据', '分析报表', '转化漏斗', '需求验收', '验证', '反馈', '结果', '指标', '数据', 'SQL', 'Excel']
  ];
  const tokens = terms.flatMap((group, point) => group.map(word => ({word, point}))).sort((a, b) => b.word.length - a.word.length);
  const pattern = new RegExp(tokens.map(token => token.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi');
  const pointLabels = ['需求与调研', '职责与个人贡献', '结果与验证'];
  let active = null, sequence = 0;
  const node = (tag, cls = '', text = '') => { const result = document.createElement(tag); result.className = cls; result.textContent = text; return result; };
  const value = (input, fallback = '') => typeof input === 'string' ? input.slice(0, 4000) : fallback;
  function setText(target, text) { if (target.textContent !== text) target.textContent = text; }
  function addText(parent, text) {
    pattern.lastIndex = 0;
    let cursor = 0;
    for (const match of text.matchAll(pattern)) {
      parent.append(document.createTextNode(text.slice(cursor, match.index)));
      const mark = node('mark', 'target-job-keyword', match[0]);
      mark.dataset.targetPoint = String(tokens.find(token => token.word.toLowerCase() === match[0].toLowerCase()).point);
      parent.append(mark); cursor = match.index + match[0].length;
    }
    parent.append(document.createTextNode(text.slice(cursor)));
  }
  function addSection(record, label, text) {
    const section = node('section', 'target-job-section'), list = node('ul', 'target-job-copy');
    section.append(node('h3', '', label));
    const clauses = text.split(/[；;\n]+/).map(part => part.trim()).filter(Boolean);
    (clauses.length ? clauses : ['暂未提供，请先补充职位信息。']).forEach(clause => { const item = node('li'); addText(item, clause); list.append(item); });
    section.append(list); record.body.append(section);
  }
  function freeze(record) {
    if (!record || record.frozen) return;
    // Queued tasks can replace this run before MutationObserver delivers the
    // host's final state. Reconcile once synchronously, then retain that state.
    syncRecord(record);
    record.frozen = true; record.observers.forEach(observer => observer.disconnect());
    record.panel.dataset.frozen = 'true';
    record.panel.dataset.motion = 'off';
    record.panel.querySelectorAll('.target-job-keyword.is-active').forEach(mark => { mark.classList.remove('is-active'); mark.removeAttribute('aria-current'); });
    record.rows.forEach(row => { if (row.root.dataset.state === 'reading') row.root.dataset.state = 'retained'; });
    if (record.panel.dataset.followState === 'running') { setText(record.status, '本轮已结束，保留当前对齐过程'); setText(record.modeLabel, '过程已保留'); }
    record.note.hidden = false;
    if (active === record) active = null;
  }
  function syncRecord(record) {
    if (active !== record || record.frozen || !record.panel.isConnected) return;
    const preview = $('preview'), documentText = $('resume-text');
    if (!preview || record.round && preview.dataset.round !== record.round) return;
    const state = preview.dataset.state || 'idle', type = preview.dataset.taskType || 'analysis';
    const step = Number(preview.dataset.step || 0), phase = preview.dataset.editPhase || 'idle';
    const pending = state === 'running' ? documentText?.querySelector('[data-ai-pending="true"]') : null;
    const pulse = state !== 'running' ? documentText?.querySelector('[data-ai-pulse="true"]') : null;
    const focus = pending || pulse;
    let point = focus ? Number(focus.dataset.resumePoint) : -1;
    const all = state !== 'running' && documentText?.dataset.aiPulse === 'true';
    if (!Number.isInteger(point) || point < 0 || point > 2) point = -1;
    if (point < 0 && state === 'running' && step > 0 && preview.dataset.analysisPhase !== 'preparing') point = Math.min(step - 1, 2);
    if (state === 'running' && (type === 'analysis' && preview.dataset.analysisPhase === 'preparing' || type === 'edit' && step === 0)) point = -1;
    let message = '对照职位要求，核对简历中的真实经历';
    if (state === 'running') message = type === 'edit'
      ? point < 0 ? '正在定位项目经历' : `正在${phase === 'idle' ? '核对' : '改写'}第 ${point + 1} 条 · ${pointLabels[point]}`
      : point < 0 ? '正在理解目标岗位与简历' : `正在核对第 ${point + 1} 条 · ${pointLabels[point]}`;
    else if (state === 'stopped') message = type === 'edit' ? '已停止改写，保留当前修改' : '已停止分析，简历正文未改动';
    else if (all || point >= 0) message = all ? '对照整段项目经历与职位要求' : `建议对应第 ${point + 1} 条 · ${pointLabels[point]}`;
    else if (state === 'done') message = type === 'edit' ? '本轮改写已完成，请核对岗位与经历' : '分析完成，选择修改方向后再改写';
    const lines = [...(documentText?.querySelectorAll('[data-resume-point]') || [])];
    const signature = JSON.stringify([state, type, step, point, all, message, lines.map(line => line.textContent)]);
    if (record.signature === signature) return;
    record.signature = signature; record.panel.dataset.followState = state; record.panel.dataset.activePoint = all ? 'all' : String(point);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    record.panel.dataset.motion = state === 'stopped' || reduced ? 'off' : 'on';
    record.panel.dataset.mode = state === 'done' ? 'complete' : state === 'stopped' ? 'stopped' : type === 'edit' ? 'writing' : point < 0 ? 'understanding' : 'reading';
    setText(record.modeLabel, state === 'done' ? type === 'edit' ? '本轮已完成' : '等待确认方向' : state === 'stopped' ? '过程已保留' : type === 'edit' ? '逐条改写' : '岗位理解');
    setText(record.brand, state === 'done' ? '✓' : '✦');
    setText(record.status, message);
    record.panel.querySelectorAll('.target-job-keyword').forEach(mark => {
      const isActive = state !== 'stopped' && (all || point >= 0 && Number(mark.dataset.targetPoint) === point);
      mark.classList.toggle('is-active', isActive);
      if (isActive) mark.setAttribute('aria-current', 'true'); else mark.removeAttribute('aria-current');
    });
    if (point >= 0) record.seen = Math.max(record.seen, point + 1);
    if (state === 'done' || all) record.seen = 3;
    record.progress.hidden = record.seen === 0;
    record.rows.forEach((row, index) => {
      row.root.hidden = index >= record.seen;
      row.root.dataset.state = state === 'stopped' ? 'retained' : state === 'done' || all || index < point ? 'done' : index === point ? 'reading' : 'retained';
      setText(row.badge, row.root.dataset.state === 'done' ? '已核对' : row.root.dataset.state === 'reading' ? type === 'edit' ? '改写中' : '核对中' : '已保留');
      const line = lines.find(line => Number(line.dataset.resumePoint) === index);
      if (line && index < record.seen) setText(row.copy, line.textContent);
    });
    const checked = record.rows.filter(row => !row.root.hidden && row.root.dataset.state === 'done').length;
    setText(record.progressCount, `${checked} / 3 已核对`);
    document.dispatchEvent(new CustomEvent('xiaoyou:resume-product', {detail: {journey: record.host, state}}));
  }
  function open(input) {
    const store = window.XiaoyouCareerStore, job = typeof input === 'string' ? store?.getJob(input) : input || store?.getJob('pine-pm');
    const messages = $('messages'); if (!job || !messages || !$('resume-paper')) return false;
    const journey = [...messages.querySelectorAll(':scope > .combo-run[data-resume-journey]')].at(-1);
    const host = journey || messages;
    freeze(active);
    const id = ++sequence, panel = node('details', 'target-job-panel'); panel.open = true;
    panel.dataset.jobId = value(job.id); panel.dataset.layout = 'split'; panel.dataset.mode = 'understanding';
    panel.dataset.motion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'off' : 'on';
    const header = node('summary', 'target-job-header'), heading = node('div', 'target-job-heading');
    const eyebrow = node('span', 'target-job-eyebrow', '目标职位 · 简历对齐');
    heading.append(eyebrow, node('h2', 'target-job-title', value(job.title, '目标职位')), node('span', 'target-job-company', value(job.company, '目标公司')));
    const chevron = node('span', 'target-job-toggle', '⌄'); chevron.setAttribute('aria-hidden', 'true');
    header.append(node('span', 'target-job-logo', value(job.company, '岗').slice(0, 1)), heading, chevron);
    const status = node('p', 'target-job-status', '正在理解目标岗位与简历'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const statusShell = node('div', 'target-job-status-shell'), brand = node('span', 'target-job-brand', '✦'); brand.setAttribute('aria-hidden', 'true');
    const modeLabel = node('span', 'target-job-mode-label', '岗位理解'), statusCopy = node('div', 'target-job-status-copy'); statusCopy.append(modeLabel, status);
    const activity = node('span', 'target-job-activity'); activity.setAttribute('aria-hidden', 'true');
    [0, 1, 2].forEach(() => activity.append(node('i'))); statusShell.append(brand, statusCopy, activity);
    const body = node('div', 'target-job-body'); body.id = `target-job-body-${id}`;
    const progress = node('section', 'target-job-progress'); progress.hidden = true;
    const progressHeading = node('div', 'target-job-progress-heading'), progressCount = node('small', '', '0 / 3 已核对');
    progressHeading.append(node('h3', '', '经历与岗位对齐记录'), progressCount); progress.append(progressHeading);
    const list = node('ol', 'target-job-evidence-list'); progress.append(list);
    const rows = pointLabels.map((label, index) => {
      const root = node('li', 'target-job-evidence-row'); root.hidden = true; root.dataset.point = String(index);
      const top = node('div', 'target-job-evidence-heading'), badge = node('small', '', '待核对'), copy = node('p');
      const marker = node('span', 'target-job-evidence-node'), number = node('span', 'target-job-evidence-number', String(index + 1)); marker.setAttribute('aria-hidden', 'true');
      const check = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); check.setAttribute('viewBox', '0 0 16 16'); check.classList.add('target-job-evidence-check');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', 'M3 8.2 6.3 11.4 13 4.8'); check.append(path); marker.append(number, check);
      const text = node('div', 'target-job-evidence-content'); top.append(node('strong', '', label), badge); text.append(top, node('span', 'target-job-evidence-caption', '简历正文'), copy); root.append(marker, text); list.append(root); return {root, badge, copy};
    });
    const note = node('p', 'target-job-history-note', '本轮对齐过程已保留，可展开回看。'); note.hidden = true;
    const record = {panel, host, round: journey?.dataset.resumeJourney || '', body, status, brand, modeLabel, progress, progressCount, rows, note, seen: 0, signature: '', frozen: false, observers: []};
    const meta = node('div', 'target-job-meta'); [job.city, job.type, job.education, job.salary].filter(item => typeof item === 'string' && item.trim()).forEach(item => meta.append(node('span', '', value(item))));
    addSection(record, '岗位职责', value(job.duties)); addSection(record, '任职要求', value(job.requirements));
    if (job.gap) { const focus = node('div', 'target-job-focus'), copy = node('p'); focus.append(node('strong', '', '简历对齐重点')); addText(copy, value(job.gap)); focus.append(copy); body.append(focus); }
    panel.append(header, meta, statusShell, body, progress, note);
    if (journey) journey.append(panel); else messages.insertBefore(panel, messages.querySelector('.original-thinking'));
    active = record;
    const observe = (target, options) => { if (!target) return; const observer = new MutationObserver(() => syncRecord(record)); observer.observe(target, options); record.observers.push(observer); };
    observe($('preview'), {attributes: true, attributeFilter: ['data-state', 'data-step', 'data-round', 'data-task-type', 'data-edit-phase', 'data-analysis-phase', 'data-review-issue']});
    observe($('resume-text'), {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-ai-pending', 'data-ai-pulse', 'data-resume-point']});
    syncRecord(record); return true;
  }
  function close() { freeze(active); }
  function sync() { if (active) syncRecord(active); }
  window.XiaoyouTargetJob = Object.freeze({open, close, sync});
})();
