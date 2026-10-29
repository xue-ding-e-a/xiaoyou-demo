/* Cached WorkspaceWindowHeader yy @555625 and horizontal panels @758749.
 * Owns only the added pane/tab; preserves the original A4 and toolbar handlers. */
(() => {
  'use strict';
  let active = null;
  const node = (tag, text = '', cls = '') => { const n = document.createElement(tag); n.textContent = text; n.className = cls; return n; };
  const capture = (element, names) => new Map(names.map(name => [name, element.getAttribute(name)]));
  const restore = (element, attrs) => attrs.forEach((value, name) => value === null ? element.removeAttribute(name) : element.setAttribute(name, value));
  function mount({key, title}) {
    active?.destroy();
    const resume = document.getElementById('resume-tabpanel'), resumeTab = document.getElementById('resume-tab');
    const tablist = resumeTab.closest('[role=tablist]'), preview = document.getElementById('preview'), app = document.getElementById('app');
    const savedResume = capture(resume, ['hidden', 'aria-hidden']), savedTab = capture(resumeTab, ['aria-selected', 'tabindex']);
    const listeners = [], animations = new Set(); let destroyed = false, selected = 'resume', tab = null, userRevision = 0;
    const panel = node('section', '', 'scenario-workspace career-workspace flow-window');
    panel.id = 'scenario-workspace'; panel.dataset.scenario = key; panel.dataset.layout = 'split';
    panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', `flow-${key}-tab`); panel.hidden = true; resume.after(panel);
    app.classList.add('workflow-split');
    function listen(target, event, callback, options) { target.addEventListener(event, callback, options); listeners.push(() => target.removeEventListener(event, callback, options)); }
    function ensureTab() {
      if (tab || destroyed) return;
      const wrapper = node('div', '', 'workspace-tab flow-window-tab'); wrapper.dataset.windowTab = 'true';
      const button = node('button', '', 'flow-window-tab-button'); button.type = 'button'; button.id = `flow-${key}-tab`;
      button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', panel.id); button.setAttribute('aria-selected', 'false'); button.tabIndex = -1;
      button.append(node('span', key === 'apply' ? '▤' : key === 'interview' ? '✧' : '▧', 'flow-tab-icon'), node('span', title, 'flow-tab-label')); button.title = title;
      const close = node('button', '×', 'workspace-tab-close flow-window-close'); close.type = 'button'; close.tabIndex = -1; close.setAttribute('aria-label', `关闭 ${title}`);
      button.onclick = () => { userRevision++; activate('result'); }; close.onclick = () => { userRevision++; closeTab(); };
      wrapper.append(button, close); tablist.append(wrapper); tab = {wrapper, button};
    }
    function activate(name, focus = false) {
      if (destroyed) return;
      if (name === 'result') ensureTab();
      selected = name; resume.hidden = name !== 'resume'; resume.setAttribute('aria-hidden', String(name !== 'resume'));
      panel.hidden = name !== 'result'; resumeTab.setAttribute('aria-selected', String(name === 'resume')); resumeTab.tabIndex = name === 'resume' ? 0 : -1;
      if (tab) { tab.button.setAttribute('aria-selected', String(name === 'result')); tab.button.tabIndex = name === 'result' ? 0 : -1; }
      if (focus) (name === 'resume' ? resumeTab : tab.button).focus();
      if (name === 'result' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches && typeof panel.animate === 'function') {
        const animation = panel.animate([{opacity: 0, transform: 'scale(.985)'}, {opacity: 1, transform: 'scale(1)'}], {duration: 250, easing: 'ease-out'});
        animations.add(animation); animation.finished?.then(() => animations.delete(animation), () => animations.delete(animation));
      }
      window.dispatchEvent(new Event('resize'));
    }
    function closeTab() { if (!tab || destroyed) return; tab.wrapper.remove(); tab = null; if (selected === 'result') activate('resume', true); }
    function open({automatic = false, revision} = {}) {
      if (destroyed || automatic && (preview.hidden || revision !== undefined && revision !== userRevision)) return;
      if (preview.hidden) document.dispatchEvent(new CustomEvent('xiaoyou:preview', {detail: {open: true}}));
      if (!automatic) userRevision++;
      activate('result');
    }
    listen(resumeTab, 'click', () => { userRevision++; activate('resume'); });
    listen(tablist, 'keydown', event => {
      if (destroyed) return;
      const target = event.target.closest('[role=tab]'); if (!target || target !== resumeTab && target !== tab?.button) return;
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End', 'Delete'].includes(event.key)) return;
      event.preventDefault(); event.stopImmediatePropagation(); userRevision++;
      if (event.key === 'Delete') { if (target === resumeTab) document.dispatchEvent(new CustomEvent('xiaoyou:preview', {detail: {open: false}})); else closeTab(); return; }
      activate(event.key === 'Home' ? 'resume' : event.key === 'End' && tab ? 'result' : tab && target === resumeTab ? 'result' : 'resume', true);
    }, true);
    listen(document.getElementById('workspace-close-all'), 'click', () => { userRevision++; closeTab(); });
    ensureTab(); activate('resume');
    const controller = {panel, open, revision: () => userRevision, destroy() {
      if (destroyed) return; destroyed = true; listeners.splice(0).forEach(remove => remove());
      animations.forEach(animation => animation.cancel()); animations.clear(); tab?.wrapper.remove(); tab = null;
      panel.remove(); restore(resume, savedResume); restore(resumeTab, savedTab);
      if (active === controller) { active = null; app.classList.remove('workflow-split'); }
    }}; active = controller; return controller;
  }
  window.XiaoyouFlowWorkspace = {mount};
})();
