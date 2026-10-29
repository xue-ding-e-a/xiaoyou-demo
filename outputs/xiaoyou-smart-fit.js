/* Local single-page adaptation of original index-B8J-P1Dt.js knc.
   See work/smart-fit-source.md for source offsets and local geometry differences. */
(() => {
  'use strict';
  const PAGE_HEIGHT = 297 * 3.78;
  const MIN_FONT = 12, NORMAL_FONT = 13, MAX_FONT = 16;
  const MIN_LINE = 1, NORMAL_LINE = 1.2, MAX_LINE = 1.8;
  const FONT_STEP = .2, LINE_STEP = .05, LOW = 85, HIGH = 95, FIT_MAX = 101.5;
  const round = value => Math.round(value * 100) / 100;
  const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
  const $ = id => document.getElementById(id);
  let active = null;

  function notice(result) {
    document.dispatchEvent(new CustomEvent('xiaoyou:notice', {detail:{text:result.message}}));
    document.dispatchEvent(new CustomEvent('xiaoyou:smart-fit-complete', {detail:result}));
    return result;
  }

  function cancellation(message) {
    const error = new Error(message);
    error.name = 'SmartFitCancelled';
    return error;
  }

  async function adjust() {
    const paper = $('resume-paper'), font = $('resume-font-size'), line = $('resume-line-height');
    if (!paper || !font || !line) return notice({success:false, status:'unavailable', message:'请等待简历加载后再试。'});
    if ($('preview')?.dataset.state === 'running') return notice({success:false, status:'busy', message:'请等待当前回复结束后再调整。'});
    let size = Number(font.value), leading = Number(line.value), changes = 0;
    if (!Number.isFinite(size) || !Number.isFinite(leading) || size <= 0 || leading <= 0) {
      return notice({success:false, status:'unavailable', message:'无法读取当前字号和行高。'});
    }
    const initial = {fontSize:size, lineHeight:leading};
    const originalText = paper.textContent;
    let initialFillRate = null;

    function check() {
      if (!paper.isConnected || $('preview')?.hidden || $('preview')?.dataset.state === 'running') {
        throw cancellation('简历状态已变化，已停止自动调整。');
      }
      if (Number(font.value) !== size || Number(line.value) !== leading || paper.textContent !== originalText) {
        throw cancellation('检测到新的编辑，已停止自动调整。');
      }
    }

    function measure() {
      check();
      const bounds = paper.getBoundingClientRect();
      if (!(bounds.width > 0) || !(paper.offsetWidth > 0)) return 0;
      // The website measures inside an unscaled iframe. This local paper is scaled
      // as a whole, so undo that visual scale before summing its real content.
      const scale = bounds.width / paper.offsetWidth;
      let height;
      if (paper.scrollHeight > paper.clientHeight) {
        height = paper.scrollHeight;
      } else {
        const style = getComputedStyle(paper);
        const children = Array.from(paper.children).filter(child => {
          const computed = getComputedStyle(child);
          return !child.hidden && computed.display !== 'none' && computed.position !== 'absolute' && computed.position !== 'fixed';
        });
        if (!children.length) return 0;
        height = children.reduce((sum, child) => {
          const computed = getComputedStyle(child);
          return sum + child.getBoundingClientRect().height / scale + (parseFloat(computed.marginTop) || 0) + (parseFloat(computed.marginBottom) || 0);
        }, 0) + (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
      }
      if (!(height > 0)) return 0;
      const percent = height / PAGE_HEIGHT * 100;
      return Math.abs(percent - 100) < 2 ? 100 : round(percent);
    }

    function setControl(control, value) {
      const text = String(round(value));
      let option = Array.from(control.options).find(item => Number(item.value) === Number(text));
      // The original metadata accepts fractional steps even though its visible
      // select lists mostly whole sizes. Keep the actual local selection valid.
      if (!option) {
        option = document.createElement('option');
        option.value = text;
        option.textContent = text;
        option.dataset.smartFit = 'true';
        control.append(option);
      }
      control.value = option.value;
    }

    function apply(nextSize, nextLeading) {
      check();
      size = round(nextSize);
      leading = round(nextLeading);
      setControl(font, size);
      setControl(line, leading);
      // Set both values before notifying existing workspace/format sync handlers.
      font.dispatchEvent(new Event('change', {bubbles:true}));
      line.dispatchEvent(new Event('change', {bubbles:true}));
      changes++;
    }

    async function reflow() {
      // Local equivalent of the source's iframe reflow + 100ms settle, without
      // mutating body padding or the user's document margins.
      void paper.offsetHeight;
      await wait(100);
      check();
    }
    const ideal = rate => rate >= LOW && rate <= HIGH;
    const fits = rate => rate > 0 && rate <= FIT_MAX;
    async function stable(predicate) {
      if (!predicate(measure())) return false;
      await wait(200);
      await reflow();
      return predicate(measure());
    }

    async function shrinkFont(target) {
      while (size > target) {
        apply(Math.max(size - FONT_STEP, target), leading);
        await wait(100);
        if (await stable(fits)) return true;
      }
      return false;
    }
    async function shrinkLine(target) {
      while (leading > target) {
        apply(size, Math.max(leading - LINE_STEP, target));
        await wait(100);
        if (await stable(fits)) return true;
      }
      return false;
    }
    async function shrink() {
      await reflow();
      if (size > NORMAL_FONT) {
        if (leading > NORMAL_LINE && await shrinkLine(NORMAL_LINE)) return;
        if (!fits(measure()) || initialFillRate <= 100) await shrinkFont(MIN_FONT);
      } else if (leading > NORMAL_LINE) {
        await shrinkLine(MIN_LINE);
      } else {
        if (await shrinkFont(MIN_FONT)) return;
        if (!fits(measure())) await shrinkLine(MIN_LINE);
      }
      await wait(300);
      await reflow();
    }

    async function enlargeStep(nextSize, nextLeading) {
      const previous = {size, leading, fill:measure()};
      apply(nextSize, nextLeading);
      await wait(100);
      await reflow();
      const rate = measure();
      // A line wrap can cause a discontinuous jump. Unlike the source's >=98
      // early success, never report an overflowing local page as successful.
      if (rate > FIT_MAX && fits(previous.fill)) {
        apply(previous.size, previous.leading);
        await reflow();
        return true;
      }
      if (await stable(ideal)) return true;
      return rate >= 98;
    }
    async function growFont(target) {
      while (size < target) if (await enlargeStep(Math.min(size + FONT_STEP, target), leading)) return true;
      return false;
    }
    async function growLine(target) {
      while (leading < target) if (await enlargeStep(size, Math.min(leading + LINE_STEP, target))) return true;
      return false;
    }
    async function enlarge() {
      await reflow();
      if (size < NORMAL_FONT) {
        if (leading < NORMAL_LINE) {
          if (await growFont(NORMAL_FONT)) return;
          if (measure() < LOW && await growLine(NORMAL_LINE)) return;
        } else if (await growFont(MAX_FONT)) return;
      } else if (leading < NORMAL_LINE) {
        if (await growLine(MAX_LINE)) return;
      } else {
        let fontTurn = true;
        while (size < MAX_FONT || leading < MAX_LINE) {
          if (fontTurn && size < MAX_FONT) {
            if (await enlargeStep(Math.min(size + FONT_STEP, MAX_FONT), leading)) return;
          } else if (leading < MAX_LINE) {
            if (await enlargeStep(size, Math.min(leading + LINE_STEP, MAX_LINE))) return;
          }
          fontTurn = !fontTurn;
        }
      }
      await wait(300);
      await reflow();
    }

    function result(success, status, message) {
      return {success, status, message, fontSize:size, lineHeight:leading,
        fillRate:measure(), initialFillRate, initial, changes};
    }
    try {
      await document.fonts?.ready;
      await reflow();
      initialFillRate = measure();
      if (!initialFillRate) return notice(result(false, 'unavailable', '简历内容尚未显示，请稍后再试。'));
      if (ideal(initialFillRate)) return notice(result(true, 'ideal', '当前简历内容已经在一页内合理分布。'));
      if (initialFillRate > 100 && size <= MIN_FONT && leading <= MIN_LINE) {
        const lines = Math.ceil((initialFillRate - 100) / 5);
        return notice(result(false, 'overflow', `内容仍超出一页约${Math.round(initialFillRate - 100)}%，建议删减约${lines}行内容。`));
      }
      if (initialFillRate < LOW && size >= MAX_FONT && leading >= MAX_LINE) {
        return notice(result(false, 'underfull', '已到最大字号和行高，建议补充相关经历以充实简历。'));
      }
      if (initialFillRate > 100 || initialFillRate >= LOW) await shrink();
      else await enlarge();
      const finalRate = measure();
      if (ideal(finalRate)) return notice(result(true, 'ideal', `已调整字号和行高，内容占一页约${Math.round(finalRate)}%。`));
      if (finalRate > FIT_MAX) {
        const lines = Math.ceil((finalRate - 100) / 5);
        return notice(result(false, 'overflow', `内容仍超出一页约${Math.round(finalRate - 100)}%，建议删减约${lines}行内容。`));
      }
      if (finalRate < LOW && initialFillRate < LOW) {
        return notice(result(false, 'underfull', `调整后内容占一页约${Math.round(finalRate)}%，可补充相关经历。`));
      }
      return notice(result(true, 'fit', `已调整至一页内，内容占一页约${Math.round(finalRate)}%。`));
    } catch (error) {
      return notice({success:false, status:error.name === 'SmartFitCancelled' ? 'cancelled' : 'error',
        message:error.name === 'SmartFitCancelled' ? error.message : '调整未完成，请稍后重试。',
        fontSize:Number(font.value), lineHeight:Number(line.value), initialFillRate, initial, changes});
    }
  }

  function run() {
    if (active) return active;
    active = adjust().finally(() => {active = null;});
    return active;
  }
  window.XiaoyouSmartFit = Object.freeze({run, get running() {return active !== null;}});
})();
