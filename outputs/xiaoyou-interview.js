/* Video reference: user-provided 54-64s; key-63 and quarter-61-64.
 * Public-source visual vocabulary: job-progress Ut/Bt and upagent preview surfaces.
 * Local text practice only: no audio, model call, account or application mutation.
 * API: XiaoyouInterview.mount(panel,{job,onBack}) -> {destroy()}.
 */
(() => {
  'use strict';
  const mounts = new WeakMap();
  const el = (tag, text = '', cls = '') => { const n = document.createElement(tag); n.textContent = text; n.className = cls; return n; };
  const button = (label, action, cls = '') => { const n = el('button', label, `interview-button ${cls}`); n.type = 'button'; n.onclick = action; return n; };
  const clamp = value => Math.max(0, Math.min(100, Math.round(value)));
  const mean = values => values.length ? values.reduce((a,b) => a+b,0)/values.length : 0;
  function mount(panel, { job = {}, onBack = () => {}, prepared = false } = {}) {
    if (!panel?.replaceChildren) throw new TypeError('Interview requires a DOM panel');
    mounts.get(panel)?.destroy();
    const profile = window.XiaoyouCareerStore?.snapshot().profile || { name:'林同学' };
    const company = String(job.company || '目标公司'), title = String(job.title || '目标职位');
    const root = el('section', '', 'interview-stage'); panel.replaceChildren(root);
    const timers = new Set(), animations = new Set(); let destroyed = false, index = 0, phase = 'preparing';
    const answers = [], questions = [
      { short:'项目与个人贡献', text:`请介绍一个与你申请的${title}相关的项目。你独立负责了什么，怎样判断完成效果？` },
      { short:'需求优先级', text:'当多个用户需求同时出现时，你怎样判断优先级？请用一次具体的取舍说明。' },
      { short:'指标与验证', text:'请分享一次你验证方案效果的经历。如何设定成功指标，结果怎样支持下一步决策？' },
      { short:'沟通与协作', text:'当你与团队成员对方案意见不一致时，你怎样推动沟通并达成决定？' },
      { short:'问题复盘', text:'讲一次没有达到预期的经历。你发现了什么问题，又做了哪些调整？' },
      { short:'产品分析', text:'选择一个你熟悉的产品，说明一个用户痛点、改进方向和验证方法。' },
      { short:'岗位理解', text:`结合${company}这个岗位的职责，你最能贡献的能力是什么？哪些方面还需要补足？` },
      { short:'反问与下一步', text:'如果现在进入面试的反问环节，你最想确认哪些信息？为什么这些信息对你重要？' }
    ];
    const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alive = () => !destroyed && root.isConnected;
    const later = (delay, fn) => { const id = setTimeout(() => { timers.delete(id); if (alive()) fn(); }, delay); timers.add(id); return id; };
    const cancelTimers = () => { timers.forEach(clearTimeout); timers.clear(); };
    const header = el('header', '', 'interview-stage-header'), brand = el('span','UP','interview-up'), status = el('span','正在准备模拟面试…','interview-stage-status');
    header.append(brand,status,button('返回我的职位', onBack, 'interview-back'));
    const content = el('div','','interview-stage-content'); root.append(header,content);
    function setPhase(next, label) { phase=next; root.dataset.phase=next; status.textContent=label; brand.textContent=next==='report'?'✓':'UP'; }
    function waveform(small = false) {
      const wave = el('div','','interview-wave'+(small?' is-small':'')); wave.setAttribute('aria-hidden','true');
      const heights=[15,32,20,43,61,24,39,48,27,55,68,32,18,44,59,28,45,66,34,22,51,41,60,24,42,31,49,18];
      heights.forEach((height,i)=>{const bar=el('span');bar.style.setProperty('--bar-height',`${height}px`);bar.style.setProperty('--bar-delay',`${-i*.075}s`);wave.append(bar);});return wave;
    }
    function prepare() {
      setPhase('preparing','正在准备模拟面试…');
      const scene=el('div','','interview-preparation'); const context=el('p',`${company} · ${title}`,'interview-context');
      const list=el('ol','','interview-prepare-list');
      const lines=[`梳理目标岗位 · ${title}`,'关联简历中的项目与个人贡献',`准备岗位练习题 · ${questions.length} 道`];
      const rows=lines.map((line,i)=>{const row=el('li');row.dataset.state=i?'pending':'working';row.append(el('span','','interview-step-marker'),el('span',line));list.append(row);return row;});
      scene.append(context,list,el('p','文字练习 · 使用当前示例资料','interview-mode-note'));content.replaceChildren(scene);
      const finish = n => { rows[n].dataset.state='done'; rows[n].firstChild.textContent='✓'; if(rows[n+1])rows[n+1].dataset.state='working'; };
      if(reduced()){rows.forEach((_,i)=>finish(i));later(0,showQuestion);}
      else {later(650,()=>finish(0));later(1350,()=>finish(1));later(2050,()=>finish(2));later(2550,showQuestion);}
    }
    function showQuestion() {
      if(!alive())return;cancelTimers();setPhase('question','模拟面试进行中');
      const scene=el('div','','interview-question-scene');
      scene.append(el('p',`模拟面试 · ${title} · ${company} · 第 ${index+1} / ${questions.length} 题`,'interview-context'));
      const speaker=el('div','','interview-speaker');speaker.append(el('span','UP','interview-speaker-avatar'),waveform(),el('small','文字练习 · 按自己的节奏作答','interview-mode-note'));
      const prompt=el('h2','','interview-question'); prompt.setAttribute('aria-label',questions[index].text);
      const animatedText=el('span');animatedText.setAttribute('aria-hidden','true');prompt.append(animatedText);
      const form=el('form','','interview-answer-form');form.noValidate=true;
      const answerRow=el('div','','interview-answer-row'), avatar=el('span',String(profile.name||'林').slice(0,1),'interview-user-avatar');
      const userWave=waveform(true), input=el('textarea');input.rows=3;input.placeholder='用真实经历回答：背景、你的行动、结果与复盘…';input.setAttribute('aria-label',`第${index+1}题的回答`);
      answerRow.append(avatar,userWave,input);form.append(answerRow);
      const bottom=el('div','','interview-answer-actions'), count=el('span','0 字','interview-answer-count'), error=el('span','','interview-answer-error');error.setAttribute('role','alert');
      const submit=button(index===questions.length-1?'完成并查看报告':'提交并继续',null,'is-primary');submit.type='submit';submit.disabled=true;
      bottom.append(count,error,submit);form.append(bottom);scene.append(speaker,prompt,form);content.replaceChildren(scene);
      if(reduced())animatedText.textContent=questions[index].text;
      else { const text=questions[index].text; for(let at=1;at<=text.length;at++)later(at*24,()=>{animatedText.textContent=text.slice(0,at);}); later(text.length*24+300,()=>speaker.classList.add('is-listening')); }
      input.addEventListener('input',()=>{const length=input.value.trim().length;count.textContent=`${length} 字`;submit.disabled=length<10;error.textContent='';form.dataset.hasAnswer=String(length>0);speaker.classList.add('is-listening');});
      form.addEventListener('submit',event=>{
        event.preventDefault();if(phase!=='question')return;const answer=input.value.trim();
        if(answer.length<10){error.textContent='请至少用 10 个字说明你的经历。';input.focus();return;}
        answers.push({question:questions[index],answer});setPhase('recorded','回答已记录');input.readOnly=true;submit.disabled=true;submit.textContent='✓ 回答已记录';
        later(reduced()?0:500,()=>{index++;if(index<questions.length)showQuestion();else showReport();});
      });
    }
    function evaluate(answer) {
      const length=answer.replace(/\s/g,'').length;
      const structure=[/背景|场景|当时|目标|问题/,/我|本人|负责|主导/,/采取|通过|设计|分析|整理|沟通|完成|推动/,/结果|最终|提升|降低|完成|反馈/].filter(test=>test.test(answer)).length;
      const specific=[/例如|比如|一次|项目|具体/,/访谈|记录|数据|原型|文档|测试|清单|报表/,/\d|百分|比例|次数|人数/,/结果|效果|验证|反馈/].filter(test=>test.test(answer)).length;
      return [clamp(structure*22+Math.min(12,length/12)),clamp(Math.min(5,(answer.match(/需求|用户|产品|流程|原型|数据|分析|运营|研究|项目/g)||[]).length)*16+15),clamp(specific*22+10),clamp(length<60?length: length<=350?85:Math.max(50,100-(length-350)/12)),clamp(20+[/复盘|反思|不足|问题/,/改进|调整|下一步|后续|迭代/,/原因|因为|判断|依据/,/验证|跟踪|记录|反馈/].filter(test=>test.test(answer)).length*20)];
    }
    function showReport() {
      if(!alive())return;cancelTimers();setPhase('report','模拟面试报告已生成');
      const evaluated=answers.map(item=>evaluate(item.answer));const dimensions=['回答结构','岗位关联','具体证据','表达完整度','复盘与改进'];
      const values=dimensions.map((_,i)=>clamp(mean(evaluated.map(row=>row[i]))));const total=clamp(mean(values));
      const report=el('article','','interview-report');
      const head=el('header','','interview-report-heading');const titleBox=el('div');titleBox.append(el('h2','模拟面试报告'),el('p',`${company} · ${title}`));head.append(titleBox,el('span',`${answers.length} 题已完成 · 文字练习`));report.append(head);
      const columns=el('div','','interview-report-columns');
      const overview=el('section','','interview-report-overview');
      const overviewTop=el('div','','interview-overview-top');const ring=el('div','','interview-report-ring');ring.style.setProperty('--score', '0deg');const number=el('strong','0');ring.append(el('div'));ring.firstChild.append(number,el('small','练习检查分'));
      const conclusion=el('div');conclusion.append(el('small','本地示例规则'),el('h3',total>=75?'已有清晰的表达基础，继续补足证据。':total>=50?'经历已讲出来，再把行动与结果说具体。':'先从一个具体场景，说明你的行动。'),el('p','仅检查文字表达，不代表招聘评价。'));
      overviewTop.append(ring,conclusion);overview.append(overviewTop,el('p','结合你实际输入的回答，检查结构、岗位词、证据线索、篇幅和复盘表达。分数不判断经历真伪，也不预测录用结果。','interview-report-explanation'));
      const rules=el('details','','interview-scoring-rules');rules.append(el('summary','查看示例评分规则'),el('p','结构：背景、个人行动、过程、结果四类关键词每类 22 分，篇幅最多加 12 分。关联：需求、用户、产品、流程、原型、数据、分析、运营、研究、项目等词，每次命中 16 分，最多计 5 次，基础 15 分。证据：案例、交付物、数字、反馈四类线索每类 22 分，基础 10 分。完整度：不足 60 字按字数计分；60–350 字为 85 分；超过 350 字每多 12 字减 1 分，最低 50 分。复盘：问题、调整、依据、验证四类表达每类 20 分，基础 20 分。各项限制在 0–100，取八题平均后五维等权平均。这些关键词规则仅用于练习，不核实事实或评价专业水平。'));overview.append(rules);
      const ability=el('section','','interview-report-abilities');ability.append(el('h3','五维表达检查'));
      const bars=[];dimensions.forEach((label,i)=>{const row=el('div','','interview-ability');const meter=el('div','','interview-ability-meter'),fill=el('span');meter.append(fill);if(values[i]<65)row.classList.add('needs-work');row.append(el('span',label),meter,el('strong',String(values[i])));ability.append(row);bars.push(fill);});
      const detail=el('section','','interview-report-detail');detail.append(el('h3','逐题表现'));
      answers.forEach((item,i)=>{const disclosure=el('details','','interview-question-review');const summary=el('summary');summary.append(el('b',String(i+1).padStart(2,'0')),el('span',item.question.short),el('strong',`${clamp(mean(evaluated[i]))}`));disclosure.append(summary,el('p',item.question.text),el('blockquote',item.answer));detail.append(disclosure);});
      const plan=el('div','','interview-action-plan');plan.append(el('h3','下一步练习计划'));
      const advice=['用「背景—行动—结果」重讲一段项目经历。','对照目标 JD，明确能力与个人贡献的关联。','补充可追溯的交付物、数据或用户反馈。','保留关键事实，整理一段 90 秒回答。','补充一次取舍原因、调整动作与后续验证。'];
      values.map((value,i)=>({value,i})).sort((a,b)=>a.value-b.value).slice(0,3).forEach(({i},rank)=>{const row=el('div');row.append(el('span',rank?'继续练习':'优先补强'),el('p',advice[i]));plan.append(row);});detail.append(plan);
      columns.append(overview,ability,detail);report.append(columns);
      const footer=el('footer','','interview-report-actions');footer.append(button('再练一次',()=>{answers.length=0;index=0;prepare();}),button('返回我的职位',onBack,'is-primary'));report.append(footer);content.replaceChildren(report);
      if(reduced()){number.textContent=String(total);ring.style.setProperty('--score',`${total*3.6}deg`);bars.forEach((bar,i)=>bar.style.width=`${values[i]}%`);}
      else { for(let step=1;step<=24;step++)later(step*25,()=>{const score=Math.round(total*(1-Math.pow(1-step/24,3)));number.textContent=String(score);ring.style.setProperty('--score',`${score*3.6}deg`);});bars.forEach((bar,i)=>later(120+i*100,()=>bar.style.width=`${values[i]}%`)); }
    }
    function destroy(){if(destroyed)return;destroyed=true;cancelTimers();animations.forEach(animation=>animation.cancel());animations.clear();root.remove();mounts.delete(panel);}
    const controller={destroy};mounts.set(panel,controller);if(prepared)showQuestion();else prepare();return controller;
  }
  window.XiaoyouInterview=Object.freeze({mount});
})();
