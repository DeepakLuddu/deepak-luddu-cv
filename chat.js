// =========================================================
// Chat widget client logic
// Talks to /api/chat (Vercel serverless function backed by AI SDK + OpenAI)
// =========================================================

(function () {
  const launcher = document.getElementById('chat-launcher');
  const launcherBtn = document.getElementById('chat-launcher-btn');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close-btn');
  const messagesEl = document.getElementById('chat-messages');
  const startersEl = document.getElementById('chat-starters');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');

  if (!launcher || !panel || !form) return;

  // Conversation state (kept in memory; resets on reload)
  const messages = [];
  let isStreaming = false;

  // ---------- Open / close ----------
  function openChat() {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    launcher.classList.add('is-hidden');
    setTimeout(() => input.focus(), 200);
  }
  function closeChat() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    launcher.classList.remove('is-hidden');
  }
  launcherBtn.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);

  // Show the launcher label briefly after page load to nudge attention
  window.addEventListener('load', () => {
    setTimeout(() => {
      launcher.classList.add('has-hint');
      setTimeout(() => launcher.classList.remove('has-hint'), 4000);
    }, 2500);
  });

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) closeChat();
  });

  // ---------- Starter chips ----------
  startersEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('.chat-starter');
    if (!btn) return;
    const prompt = btn.dataset.prompt;
    if (prompt) sendMessage(prompt);
  });

  // ---------- Rendering ----------
  function hideStarters() {
    if (startersEl) startersEl.style.display = 'none';
  }
  function renderUserMessage(text) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg user';
    wrap.innerHTML = '<div class="chat-msg-bubble"></div>';
    wrap.querySelector('.chat-msg-bubble').textContent = text;
    messagesEl.appendChild(wrap);
    scrollToBottom();
  }
  function renderAssistantPlaceholder() {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg assistant';
    wrap.innerHTML =
      '<div class="chat-msg-bubble"><div class="chat-typing"><span></span><span></span><span></span></div></div>';
    messagesEl.appendChild(wrap);
    scrollToBottom();
    return wrap.querySelector('.chat-msg-bubble');
  }
  function renderError(text) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg assistant error';
    wrap.innerHTML = '<div class="chat-msg-bubble"></div>';
    wrap.querySelector('.chat-msg-bubble').textContent = text;
    messagesEl.appendChild(wrap);
    scrollToBottom();
  }
  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  // ---------- Send ----------
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    sendMessage(text);
  });

  async function sendMessage(text) {
    if (isStreaming) return;
    if (!text || text.length === 0) return;
    if (text.length > 500) {
      renderError('That question is a bit long. Try something shorter.');
      return;
    }

    hideStarters();
    renderUserMessage(text);
    messages.push({ role: 'user', content: text });
    input.value = '';
    setLoading(true);

    const bubble = renderAssistantPlaceholder();
    let assistantText = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!res.ok) {
        let errMsg = "Sorry, I couldn't process that. Please try again in a moment.";
        try {
          const data = await res.json();
          if (data?.error) errMsg = data.error;
        } catch {}
        bubble.parentElement.remove();
        renderError(errMsg);
        setLoading(false);
        return;
      }

      if (!res.body) {
        bubble.parentElement.remove();
        renderError('No response received. Please try again.');
        setLoading(false);
        return;
      }

      // Plain-text streaming: just append chunks as they arrive.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          assistantText += chunk;
          bubble.textContent = assistantText;
          scrollToBottom();
        }
      }

      if (assistantText) {
        messages.push({ role: 'assistant', content: assistantText });
      } else {
        // No text came through; replace placeholder with friendly fallback
        bubble.innerHTML = '';
        bubble.textContent = "I didn't catch a response that time. Could you try rephrasing?";
      }
    } catch (err) {
      console.error('Chat error:', err);
      bubble.parentElement.remove();
      renderError('Network issue. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function setLoading(loading) {
    isStreaming = loading;
    input.disabled = loading;
    sendBtn.disabled = loading;
  }
})();
