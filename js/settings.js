// ===== settings.js — API 키 관리 =====

const KEY_LABELS = {
  CLAUDE_API_KEY:      '🤖 Claude',
  PEXELS_API_KEY:      '🖼️ Pexels',
  COUPANG_ACCESS_KEY:  '🛒 쿠팡 AccessKey',
  COUPANG_SECRET_KEY:  '🛒 쿠팡 SecretKey',
  GCP_TTS_KEY:         '🔊 GCP TTS'
};

function saveKey(inputId, storageKey) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const value = input.value.trim();
  if (!value) { showToast('값을 입력해주세요'); return; }
  localStorage.setItem(storageKey, value);
  input.value = '';
  showToast('저장됨!');
  renderKeyStatus();
  updateApiStatus();
}

function clearAllKeys() {
  if (!confirm('모든 API 키를 초기화할까요?')) return;
  Object.keys(KEY_LABELS).forEach(k => localStorage.removeItem(k));
  renderKeyStatus();
  updateApiStatus();
  showToast('초기화됨');
}

function renderKeyStatus() {
  const grid = document.getElementById('keyStatusGrid');
  if (!grid) return;
  grid.innerHTML = Object.entries(KEY_LABELS).map(([key, label]) => {
    const saved = !!localStorage.getItem(key);
    return `
      <div class="key-status-item">
        <span class="dot ${saved ? 'ok' : 'no'}"></span>
        <span>${label}</span>
        ${saved ? '<span style="color:#3ecfb2;font-size:10px;margin-left:auto">✓</span>' : ''}
      </div>
    `;
  }).join('');
}

// 설정 탭 진입 시 기존 키 마스킹 표시
document.querySelector('[data-tab="settings"]')?.addEventListener('click', () => {
  renderKeyStatus();

  // 이미 저장된 키 힌트 표시
  const fields = [
    ['claudeKey', 'CLAUDE_API_KEY'],
    ['pexelsKey', 'PEXELS_API_KEY'],
    ['coupangAccessKey', 'COUPANG_ACCESS_KEY'],
    ['coupangSecretKey', 'COUPANG_SECRET_KEY'],
    ['ttsKey', 'GCP_TTS_KEY']
  ];

  fields.forEach(([inputId, storageKey]) => {
    const el = document.getElementById(inputId);
    if (!el) return;
    if (localStorage.getItem(storageKey)) {
      el.placeholder = '저장됨 (변경하려면 새 값 입력)';
    }
  });
});

// 초기 렌더
renderKeyStatus();
