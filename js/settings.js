// ===== settings.js — API 키 관리 =====

const KEY_MAP = {
  claudeKey: 'CLAUDE_API_KEY',
  geminiKey: 'GEMINI_API_KEY',
  ttsKey: 'GCP_TTS_KEY',
  coupangAccessKey: 'COUPANG_ACCESS_KEY',
  coupangSecretKey: 'COUPANG_SECRET_KEY',
  pexelsKey: 'PEXELS_API_KEY',
  githubToken: 'GITHUB_TOKEN',
  githubRepo: 'GITHUB_REPO'
};

const KEY_LABELS = {
  CLAUDE_API_KEY: 'Claude API Key',
  GEMINI_API_KEY: 'Gemini API Key',
  GCP_TTS_KEY: 'Google Cloud TTS',
  COUPANG_ACCESS_KEY: '쿠팡 Access Key',
  COUPANG_SECRET_KEY: '쿠팡 Secret Key',
  PEXELS_API_KEY: 'Pexels API Key',
  GITHUB_TOKEN: 'GitHub Token',
  GITHUB_REPO: 'GitHub Repo'
};

// 페이지 로드 시 저장된 키 마스킹 표시
function loadSavedKeys() {
  Object.entries(KEY_MAP).forEach(([inputId, storageKey]) => {
    const saved = localStorage.getItem(storageKey);
    const input = document.getElementById(inputId);
    if (saved && input) {
      if (input.type === 'text') {
        input.value = saved;
      } else {
        input.placeholder = '••••••••• (저장됨)';
      }
    }
  });
  renderKeyStatus();
}

function saveKey(inputId, storageKey) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const val = input.value.trim();
  if (!val) { showToast('값을 입력해주세요'); return; }
  localStorage.setItem(storageKey, val);
  input.value = '';
  input.placeholder = '••••••••• (저장됨)';
  showToast(`${KEY_LABELS[storageKey] || storageKey} 저장됨`);
  renderKeyStatus();
  updateApiStatus();
}

function renderKeyStatus() {
  const grid = document.getElementById('keyStatusGrid');
  if (!grid) return;
  grid.innerHTML = Object.entries(KEY_LABELS).map(([key, label]) => {
    const isSet = !!localStorage.getItem(key);
    return `
      <div class="key-status-item">
        <div class="key-dot ${isSet ? 'set' : 'unset'}"></div>
        <span>${label}</span>
        <span style="color:${isSet ? '#4ecdc4' : '#4a4a5a'};margin-left:auto;font-size:11px">${isSet ? '설정됨' : '미설정'}</span>
      </div>
    `;
  }).join('');
}

function clearAllKeys() {
  if (!confirm('모든 API 키를 삭제하시겠습니까?')) return;
  Object.values(KEY_MAP).forEach(k => localStorage.removeItem(k));
  loadSavedKeys();
  updateApiStatus();
  showToast('모든 키가 초기화되었습니다');
}

// 설정 탭 진입 시 상태 렌더링
document.querySelector('[data-tab="settings"]').addEventListener('click', () => {
  renderKeyStatus();
});

// 초기 로드
loadSavedKeys();
