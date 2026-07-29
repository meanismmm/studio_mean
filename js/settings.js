const KEY_MAP = { pexelsKey: 'PEXELS_API_KEY' };
const KEY_LABELS = { PEXELS_API_KEY: 'Pexels API Key' };

function loadSavedKeys() {
  Object.entries(KEY_MAP).forEach(([inputId, storageKey]) => {
    const input = document.getElementById(inputId);
    if (input && localStorage.getItem(storageKey)) input.placeholder = '•••••••• (저장됨)';
  });
  renderKeyStatus();
}

function saveKey(inputId, storageKey) {
  const input = document.getElementById(inputId);
  const value = input?.value.trim();
  if (!value) return showToast('값을 입력해 주세요.');
  localStorage.setItem(storageKey, value);
  input.value = '';
  input.placeholder = '•••••••• (저장됨)';
  showToast(`${KEY_LABELS[storageKey] || storageKey} 저장됨`);
  renderKeyStatus();
}

function renderKeyStatus() {
  const grid = document.getElementById('keyStatusGrid');
  if (!grid) return;
  grid.innerHTML = Object.entries(KEY_LABELS).map(([key, label]) => {
    const isSet = Boolean(localStorage.getItem(key));
    return `<div class="key-status-item"><div class="key-dot ${isSet ? 'set' : 'unset'}"></div><span>${label}</span><span style="color:${isSet ? '#4ecdc4' : '#4a4a5a'};margin-left:auto;font-size:11px">${isSet ? '설정됨' : '미설정'}</span></div>`;
  }).join('');
}

function clearAllKeys() {
  if (!confirm('저장된 Pexels API 키를 삭제하시겠습니까?')) return;
  localStorage.removeItem('PEXELS_API_KEY');
  loadSavedKeys();
  showToast('Pexels API 키가 삭제되었습니다.');
}

document.querySelector('[data-tab="settings"]')?.addEventListener('click', renderKeyStatus);
loadSavedKeys();
