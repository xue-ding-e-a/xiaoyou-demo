/* All cards retain the normal Agent/workspace split. Video-led products live
 * in the conversation. Compatibility facade for existing result buttons. */
(() => {
  'use strict';
  const app = document.getElementById('app'), scroll = document.getElementById('scroll-area');
  function sync() { app.classList.remove('video-stage', 'stage-chat-open', 'stage-tools-open'); }
  function openConversation() {
    sync();
    const picker = [...scroll.querySelectorAll('.revision-picker')].at(-1);
    if (picker) scroll.scrollTop += picker.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 12;
    else scroll.scrollTop = scroll.scrollHeight;
  }
  window.XiaoyouStage = Object.freeze({openConversation, closeConversation: sync, sync});
  sync();
})();
