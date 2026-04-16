// ===== app.js =====

// ===== 탭 전환 =====
function switchTab(tab) {
  document.querySelectorAll('.nav-item').forEach(i => {
    i.classList.toggle('active', i.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.toggle('active', p.id === 'tab-' + tab);
  });
  // 모바일 헤더 타이틀 업데이트
  const label = document.querySelector(`.nav-item[data-tab="${tab}"] .nav-label`);
  const mTitle = document.getElementById('mobileTitle');
  if (mTitle && label) mTitle.textContent = label.textContent;
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    switchTab(item.dataset.tab);
    closeMobileDrawer();
  });
});

// ===== Mobile Drawer =====
function openMobileDrawer() {
  document.getElementById('mobileDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileDrawer() {
  document.getElementById('mobileDrawer')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== API 상태 =====
function updateApiStatus() {
  const ok = !!localStorage.getItem('CLAUDE_API_KEY');
  ['statusDot', 'mobileApiDot'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('ok', ok);
  });
  const txt = document.getElementById('statusText');
  if (txt) txt.textContent = ok ? 'API 연결됨' : 'API 미설정';
}
updateApiStatus();

// ===== 공통 유틸 =====
function copyResult(id) {
  const el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText((el.innerText || el.textContent).trim()).then(() => showToast('복사됨!'));
}

function copyText(id) {
  const el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim()).then(() => showToast('복사됨!'));
}

function copyAllThreads(listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  const posts = list.querySelectorAll('.thread-post-text');
  const text = Array.from(posts).map((p, i) => `[${i+1}]\n${p.textContent.trim()}`).join('\n\n---\n\n');
  navigator.clipboard.writeText(text).then(() => showToast('전체 복사됨!'));
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:var(--ink);color:#fff;padding:9px 20px;border-radius:20px;
      font-size:13px;font-weight:600;z-index:9999;opacity:0;
      transition:opacity 0.2s;pointer-events:none;
      font-family:var(--fm);letter-spacing:0.02em;
      white-space:nowrap;
    `;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(() => { t.style.opacity = '0'; }, 1800);
}

function setLoading(id, visible, text = '처리 중...') {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = visible ? 'flex' : 'none';
  const p = el.querySelector('p');
  if (p && text) p.textContent = text;
}

function sendToThreads(outputId) {
  const el = document.getElementById(outputId);
  if (!el) return;
  const text = (el.innerText || el.textContent).trim();
  if (!text) { showToast('먼저 글을 생성해주세요'); return; }
  const input = document.getElementById('threadsInput');
  if (input) input.value = text;
  switchTab('threads');
  showToast('스레드 탭으로 이동했습니다');
}
