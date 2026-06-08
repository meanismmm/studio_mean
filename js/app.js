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

// API 상태 표시
function updateApiStatus() {
  const claudeKey = localStorage.getItem('CLAUDE_API_KEY');
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
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

// Google Cloud TTS 공통 함수
async function generateTTS(narrationElementId, audioElementId) {
  const ttsKey = localStorage.getItem('GCP_TTS_KEY');
  if (!ttsKey) { showToast('Google Cloud TTS API 키를 설정해주세요'); return; }

  const narrationEl = document.getElementById(narrationElementId);
  if (!narrationEl || !narrationEl.textContent.trim()) {
    showToast('나레이션 텍스트가 없습니다');
    return;
  }

  const text = narrationEl.textContent.trim();
  showToast('TTS 생성 중...');

  try {
    const resp = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: 'ko-KR', name: 'ko-KR-Wavenet-C', ssmlGender: 'FEMALE' },
          audioConfig: { audioEncoding: 'MP3', speakingRate: 1.05, pitch: 0 }
        })
      }
    );
    const data = await resp.json();
    if (!data.audioContent) throw new Error('TTS 생성 실패');

    const audioSrc = 'data:audio/mp3;base64,' + data.audioContent;
    const audioEl = document.getElementById(audioElementId);
    if (audioEl) {
      audioEl.src = audioSrc;
      audioEl.style.display = 'block';
    }

    // 다운로드 링크도 추가
    const link = document.createElement('a');
    link.href = audioSrc;
    link.download = 'narration.mp3';
    link.textContent = '⬇ MP3 다운로드';
    link.style.cssText = 'display:block;margin-top:8px;font-size:12px;color:#5b7fff;';
    const box = audioEl ? audioEl.parentElement : narrationEl.parentElement;
    const existing = box.querySelector('a[download]');
    if (existing) existing.remove();
    box.appendChild(link);

    showToast('TTS 생성 완료!');
  } catch (e) {
    showToast('TTS 오류: ' + e.message);
  }
}
