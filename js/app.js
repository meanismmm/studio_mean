// ===== app.js — 탭 라우팅 & 공통 유틸 =====

// 탭 전환
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const tab = item.dataset.tab;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('tab-' + tab)?.classList.add('active');
  });
});

// API 상태 표시
function updateApiStatus() {
  const claudeKey = localStorage.getItem('CLAUDE_API_KEY');
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  if (!dot || !text) return;
  if (claudeKey) {
    dot.classList.add('ok');
    dot.classList.remove('warn');
    text.textContent = 'API 연결됨';
  } else {
    dot.classList.remove('ok');
    text.textContent = 'API 미설정';
  }
}
updateApiStatus();

// 결과 복사
function copyResult(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText || el.textContent;
  navigator.clipboard.writeText(text.trim()).then(() => showToast('복사됨!'));
}

function copyText(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim()).then(() => showToast('복사됨!'));
}

// 스레드 전체 복사 (포스트 번호 포함)
function copyAllThreads(listElementId) {
  const list = document.getElementById(listElementId);
  if (!list) return;
  const posts = list.querySelectorAll('.thread-post-text');
  const texts = Array.from(posts).map((p, i) => `[${i+1}]\n${p.textContent.trim()}`);
  navigator.clipboard.writeText(texts.join('\n\n---\n\n')).then(() => showToast('전체 복사됨!'));
}

// 토스트 메시지
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
      background:#5b7fff;color:#fff;padding:8px 20px;border-radius:20px;
      font-size:13px;font-weight:600;z-index:9999;opacity:0;
      transition:opacity 0.2s;pointer-events:none;
      font-family:'DM Mono',monospace;letter-spacing:0.02em;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 1800);
}

// 로딩 토글
function setLoading(id, visible, text = '처리 중...') {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = visible ? 'flex' : 'none';
  const textEl = el.querySelector('p');
  if (textEl && text) textEl.textContent = text;
}

// 블로그 글 → 스레드 탭으로 전달
function sendToThreads(outputElementId, source) {
  const el = document.getElementById(outputElementId);
  if (!el) return;
  const text = el.innerText || el.textContent;
  if (!text.trim()) { showToast('먼저 글을 생성해주세요'); return; }

  // 스레드 탭의 텍스트에어리어에 삽입
  const input = document.getElementById('threadsInput');
  if (input) input.value = text.trim();

  // 스레드 탭으로 전환
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('[data-tab="threads"]')?.classList.add('active');
  document.getElementById('tab-threads')?.classList.add('active');

  showToast('스레드 탭으로 이동했습니다');
}
