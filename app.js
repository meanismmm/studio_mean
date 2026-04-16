// ===== app.js — 반드시 맨 먼저 로드 =====

// ===== 공통 유틸 (다른 JS들이 사용) =====

function showToast(msg, duration = 2200) {
  let t = document.getElementById('_toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '_toast';
    t.style.cssText = [
      'position:fixed','bottom:88px','left:50%','transform:translateX(-50%) scale(0.92)',
      'background:var(--ink)','color:rgba(255,255,255,0.92)',
      'padding:12px 24px','border-radius:50px',
      'font-size:14px','font-weight:600','z-index:9999','opacity:0',
      'transition:opacity 0.2s, transform 0.2s',
      'pointer-events:none','font-family:var(--fm)',
      'white-space:nowrap','box-shadow:0 6px 20px rgba(0,0,0,0.3)',
      'border:1px solid rgba(255,255,255,0.08)'
    ].join(';');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) scale(1)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) scale(0.92)';
  }, duration);
}

// 글로벌 로딩 오버레이
function setLoading(id, visible, text = '처리 중...') {
  // 기존 카드 방식 지원 (하위호환)
  const cardEl = document.getElementById(id);
  if (cardEl && cardEl.classList.contains('loading-card')) {
    cardEl.style.display = visible ? 'flex' : 'none';
    const p = cardEl.querySelector('p');
    if (p && text) p.textContent = text;
    return;
  }

  // 글로벌 오버레이
  let overlay = document.getElementById('_loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = '_loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-box">
        <div class="spinner"></div>
        <p id="_loadingText">처리 중...</p>
      </div>`;
    document.body.appendChild(overlay);
  }

  const textEl = document.getElementById('_loadingText');
  if (textEl) textEl.textContent = text;

  if (visible) {
    overlay.classList.add('visible');
  } else {
    overlay.classList.remove('visible');
  }
}

function copyResult(id) {
  const el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText((el.innerText || el.textContent).trim())
    .then(() => showToast('✓ 복사됨'))
    .catch(() => showToast('복사 실패'));
}

function copyAllThreads(listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  const posts = list.querySelectorAll('.thread-post-text');
  const text  = Array.from(posts).map((p, i) => `[${i+1}]\n${p.textContent.trim()}`).join('\n\n---\n\n');
  navigator.clipboard.writeText(text).then(() => showToast('✓ 전체 복사됨'));
}

function sendToThreads(outputId) {
  const el = document.getElementById(outputId);
  if (!el) return;
  const text = (el.innerText || el.textContent).trim();
  if (!text) { showToast('먼저 글을 생성해주세요'); return; }
  const input = document.getElementById('threadsInput');
  if (input) input.value = text;
  switchTab('threads');
  showToast('스레드 탭으로 이동');
}

// ===== 탭 전환 =====
function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.toggle('active', p.id === 'tab-' + tab);
  });
  document.querySelectorAll('.nav-item[data-tab]').forEach(i => {
    i.classList.toggle('active', i.dataset.tab === tab);
  });
  document.querySelectorAll('.bottom-nav-item[data-tab]').forEach(i => {
    i.classList.toggle('active', i.dataset.tab === tab);
  });
  // 현재 탭 이름 업데이트
  const label = document.querySelector(`.nav-item[data-tab="${tab}"] .nav-label, .bottom-nav-item[data-tab="${tab}"] .bottom-nav-label`);
  const titleEl = document.getElementById('_topbarTitle');
  if (titleEl && label) titleEl.textContent = label.textContent;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== API 상태 =====
function updateApiStatus() {
  const ok = !!localStorage.getItem('CLAUDE_API_KEY');
  ['statusDot'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'status-dot' + (ok ? ' ok' : '');
  });
  ['_mobileApiDot'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'mobile-api-dot' + (ok ? ' ok' : '');
  });
  const txt = document.getElementById('statusText');
  if (txt) txt.textContent = ok ? 'API 연결됨' : 'API 미설정';
  const mtxt = document.getElementById('_mobileApiText');
  if (mtxt) mtxt.textContent = ok ? '연결됨' : '미설정';
}

// ===== 이벤트 바인딩 (DOM 로드 후) =====
document.addEventListener('DOMContentLoaded', () => {
  // 데스크톱 사이드바
  document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });

  // 모바일 하단 탭
  document.querySelectorAll('.bottom-nav-item[data-tab]').forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });

  updateApiStatus();
});
