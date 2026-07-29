// ===== app.js — 탭 라우팅 & 공통 유틸 =====

// 탭 전환
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const tab = item.dataset.tab;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
  });
});

// OpenAI 서버 상태 표시
async function updateApiStatus() {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  try {
    const response = await fetch('/api/health', { cache: 'no-store' });
    if (!response.ok) throw new Error('health check failed');
    const data = await response.json();
    if (!data.keyConfigured) throw new Error('key missing');
    dot.classList.add('ok');
    dot.classList.remove('warn');
    text.textContent = `${data.provider} · ${data.model}`;
    const detail = document.getElementById('openaiServerStatus');
    if (detail) detail.textContent = `연결됨 · ${data.model}`;
  } catch (_) {
    dot.classList.remove('ok');
    dot.classList.add('warn');
    text.textContent = 'OpenAI 서버 연결 실패';
    const detail = document.getElementById('openaiServerStatus');
    if (detail) detail.textContent = '연결되지 않았습니다. 잠시 후 다시 확인해 주세요.';
  }
}
updateApiStatus();

// 공통: 결과 복사
function copyResult(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText || el.textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('복사됨!');
  });
}
function copyText(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim()).then(() => showToast('복사됨!'));
}

// 토스트 메시지
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
      background:#5b7fff; color:#fff; padding:8px 20px; border-radius:20px;
      font-size:13px; font-weight:600; z-index:9999; opacity:0;
      transition:opacity 0.2s; pointer-events:none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 1800);
}

// 공통: 로딩 토글
function setLoading(id, visible, text = '처리 중...') {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = visible ? 'flex' : 'none';
  const textEl = el.querySelector('p');
  if (textEl) textEl.textContent = text;
}
