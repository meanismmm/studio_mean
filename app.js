// ===== app.js =====

function switchTab(tab) {
  // 패널 전환
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.toggle('active', p.id === 'tab-' + tab);
  });

  // 데스크톱 사이드바
  document.querySelectorAll('#desktopNav .nav-item').forEach(i => {
    i.classList.toggle('active', i.dataset.tab === tab);
  });

  // 모바일 하단 탭
  document.querySelectorAll('.bottom-nav-item').forEach(i => {
    i.classList.toggle('active', i.dataset.tab === tab);
  });

  // 모바일: 페이지 상단으로 스크롤
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 데스크톱 사이드바 클릭
document.querySelectorAll('#desktopNav .nav-item').forEach(item => {
  item.addEventListener('click', () => switchTab(item.dataset.tab));
});

// 모바일 하단 탭 클릭
document.querySelectorAll('.bottom-nav-item').forEach(item => {
  item.addEventListener('click', () => switchTab(item.dataset.tab));
});

// API 상태 표시
function updateApiStatus() {
  const ok = !!localStorage.getItem('CLAUDE_API_KEY');
  const dot  = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  if (dot)  { dot.className = 'status-dot' + (ok ? ' ok' : ''); }
  if (text) { text.textContent = ok ? 'API 연결됨' : 'API 미설정'; }
}
updateApiStatus();

// ===== 공통 유틸 =====
function copyResult(id) {
  const el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText((el.innerText || el.textContent).trim())
    .then(() => showToast('복사됨!'));
}

function copyAllThreads(listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  const posts = list.querySelectorAll('.thread-post-text');
  const text  = Array.from(posts).map((p, i) => `[${i+1}]\n${p.textContent.trim()}`).join('\n\n---\n\n');
  navigator.clipboard.writeText(text).then(() => showToast('전체 복사됨!'));
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = [
      'position:fixed','bottom:80px','left:50%','transform:translateX(-50%)',
      'background:var(--ink)','color:#fff','padding:11px 22px','border-radius:50px',
      'font-size:14px','font-weight:600','z-index:9999','opacity:0',
      'transition:opacity 0.2s','pointer-events:none',
      'font-family:var(--fm)','letter-spacing:0.02em',
      'white-space:nowrap','box-shadow:0 4px 16px rgba(0,0,0,0.25)'
    ].join(';');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2000);
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
