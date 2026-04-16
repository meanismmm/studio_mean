// ===== api.js =====

async function callClaude(system, user, maxTokens = 2000) {
  const key = localStorage.getItem('CLAUDE_API_KEY');
  if (!key) throw new Error('Claude API 키를 설정해주세요 (설정 탭)');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }]
    })
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error?.message || `API 오류 (${res.status})`);
  }
  const d = await res.json();
  return d.content[0]?.text || '';
}

async function searchPexels(query, count = 5) {
  const key = localStorage.getItem('PEXELS_API_KEY');
  if (!key) return [];
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      { headers: { Authorization: key } }
    );
    if (!res.ok) return [];
    const d = await res.json();
    return (d.photos || []).map(p => ({ url: p.url, src: p.src.large, photographer: p.photographer }));
  } catch { return []; }
}

async function renderPexelsImages(query, listId, wrapperId) {
  const wrap = document.getElementById(wrapperId);
  const list = document.getElementById(listId);
  if (!wrap || !list) return;
  wrap.style.display = 'block';
  list.innerHTML = '<div style="color:var(--t4);font-size:11px;font-family:var(--fm)">이미지 검색 중...</div>';
  const imgs = await searchPexels(query, 5);
  if (!imgs.length) {
    list.innerHTML = '<div style="color:var(--t4);font-size:11px">Pexels API 키 설정 시 이미지 링크 표시</div>';
    return;
  }
  list.innerHTML = imgs.map((img, i) => `
    <div class="image-link-item">
      <span style="color:var(--t4);font-size:10px;min-width:16px;font-family:var(--fm)">${i+1}</span>
      <a href="${img.src}" target="_blank" rel="noopener">${img.src}</a>
      <button class="btn-sm" onclick="navigator.clipboard.writeText('${img.src}').then(()=>showToast('링크 복사됨!'))">복사</button>
    </div>`).join('');
}

function safeParseJSON(text) {
  let s = text.replace(/```json|```/g, '').trim();
  const a = Math.min(s.indexOf('{') < 0 ? Infinity : s.indexOf('{'), s.indexOf('[') < 0 ? Infinity : s.indexOf('['));
  const b = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
  if (a !== Infinity && b !== -1) s = s.slice(a, b + 1);
  return JSON.parse(s);
}

function getTodayContext() {
  const now = new Date();
  const m = now.getMonth() + 1;
  const seasons = {12:'겨울',1:'겨울',2:'겨울',3:'봄',4:'봄',5:'봄',6:'여름',7:'여름',8:'여름',9:'가을',10:'가을',11:'가을'};
  const keywords = {
    1:'새해 결심, 다이어트, 독감, 겨울 건조증',2:'환절기 면역, 봄맞이, 미세먼지',
    3:'봄 알레르기, 황사, 춘곤증',4:'봄 피로, 꽃놀이, 자외선',
    5:'가정의달, 황금연휴, 냉방병 예방',6:'여름 시작, 냉방병, 자외선',
    7:'장마, 식중독, 에어컨 청소',8:'폭염, 열사병, 개학',
    9:'환절기 감기, 추석, 면역력',10:'독감 예방접종, 건조증',
    11:'김장, 겨울 준비, 감기',12:'연말, 과음 회복, 새해 준비'
  };
  return {
    dateStr: now.toLocaleDateString('ko-KR'),
    year: now.getFullYear(), month: m, day: now.getDate(),
    season: seasons[m],
    monthlyKeywords: keywords[m]
  };
}
