// ===== api.js — Claude API 공통 모듈 (Gemini 폴백 포함) =====

// ===== Gemini 폴백 =====
async function callGemini(systemPrompt, userPrompt, maxTokens = 2000) {
  const apiKey = localStorage.getItem('GEMINI_API_KEY');
  if (!apiKey) throw new Error('Gemini API 키가 설정되지 않았습니다. 설정 탭에서 입력해주세요.');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { maxOutputTokens: maxTokens }
      })
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini 오류 (${response.status})`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ===== Claude → Gemini 자동 폴백 =====
async function callClaude(systemPrompt, userPrompt, maxTokens = 2000) {
  const apiKey = localStorage.getItem('CLAUDE_API_KEY');
  if (!apiKey) {
    throw new Error('Claude API 키가 설정되지 않았습니다. 설정 탭에서 입력해주세요.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.error?.message || '';

    // 크레딧 부족 감지 — 메시지에 credit/balance 포함 또는 400/529 상태코드
    const isCreditError = msg.toLowerCase().includes('credit') ||
                          msg.toLowerCase().includes('balance') ||
                          response.status === 529;

    if (isCreditError) {
      const geminiKey = localStorage.getItem('GEMINI_API_KEY');
      if (geminiKey) {
        showToast('⚠️ Claude 잔액 부족 — Gemini로 대체 중...');
        return await callGemini(systemPrompt, userPrompt, maxTokens);
      } else {
        throw new Error('Claude 크레딧이 부족합니다. 설정에서 Gemini API 키를 등록하거나 Claude 크레딧을 충전해주세요.');
      }
    }

    throw new Error(msg || `API 오류 (${response.status})`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

// ===== Pexels 이미지 검색 =====
async function searchPexels(query, count = 5) {
  const key = localStorage.getItem('PEXELS_API_KEY');
  if (!key) return [];

  try {
    const resp = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      { headers: { Authorization: key } }
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.photos || []).map(p => ({
      url: p.url,
      src: p.src.large,
      photographer: p.photographer
    }));
  } catch (e) {
    return [];
  }
}

// ===== Pexels 이미지 목록 렌더링 =====
async function renderPexelsImages(query, listElementId, wrapperElementId) {
  const wrapper = document.getElementById(wrapperElementId);
  const list    = document.getElementById(listElementId);
  if (!wrapper || !list) return;

  wrapper.style.display = 'block';
  list.innerHTML = '<div style="color:#55556a;font-size:12px;font-family:\'DM Mono\',monospace">이미지 검색 중...</div>';

  const images = await searchPexels(query, 5);

  if (!images.length) {
    list.innerHTML = '<div style="color:#55556a;font-size:12px">Pexels API 키 설정 시 이미지 링크 표시</div>';
    return;
  }

  list.innerHTML = images.map((img, i) => `
    <div class="image-link-item">
      <span style="color:#55556a;font-size:11px;min-width:18px;font-family:'DM Mono',monospace">${i + 1}</span>
      <a href="${img.src}" target="_blank" rel="noopener">${img.src}</a>
      <button class="btn-sm" onclick="navigator.clipboard.writeText('${img.src}').then(()=>showToast('링크 복사됨!'))">복사</button>
    </div>
  `).join('');
}

// ===== JSON 안전 파싱 =====
function safeParseJSON(text) {
  let clean = text.replace(/```json|```/g, '').trim();
  const firstBrace = Math.min(
    clean.indexOf('{') === -1 ? Infinity : clean.indexOf('{'),
    clean.indexOf('[') === -1 ? Infinity : clean.indexOf('[')
  );
  const lastBrace = Math.max(clean.lastIndexOf('}'), clean.lastIndexOf(']'));
  if (firstBrace !== Infinity && lastBrace !== -1) {
    clean = clean.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(clean);
}

// ===== 날짜/시의성 컨텍스트 =====
function getTodayContext() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  const day   = now.getDate();
  const dateStr = `${year}년 ${month}월 ${day}일`;

  const seasonMap = {
    12:'겨울',1:'겨울',2:'겨울',
    3:'봄',4:'봄',5:'봄',
    6:'여름',7:'여름',8:'여름',
    9:'가을',10:'가을',11:'가을'
  };

  const monthlyKeywords = {
    1:'새해 결심, 다이어트 시작, 신년 건강검진, 독감 유행, 겨울 건조증',
    2:'환절기 면역력, 봄맞이 준비, 미세먼지 시작, 입학 준비 건강',
    3:'봄 알레르기, 황사 대비, 꽃가루 증상, 새학기 스트레스, 봄나물 효능',
    4:'봄철 피로, 춘곤증 극복, 꽃놀이 준비, 야외활동 증가, 자외선 주의',
    5:'가정의 달 건강, 황금연휴 음식, 초여름 냉방병, 어버이날 선물',
    6:'여름 시작 건강관리, 자외선 차단, 냉방병 예방, 수분 보충, 장마 준비',
    7:'장마철 식중독, 무더위 건강, 에어컨 냉방병, 여름 보양식, 휴가 전 건강',
    8:'폭염 대처, 열사병 예방, 여름 피부 관리, 휴가 후 피로 회복, 개학 준비',
    9:'환절기 감기, 가을 건강관리, 추석 음식 과식, 면역력 강화, 가을 다이어트',
    10:'가을 건조한 피부, 독감 예방접종, 환절기 알레르기, 가을 제철 음식',
    11:'김장 음식 효능, 겨울 건강 준비, 감기 독감 예방, 건조증 관리, 난방 시작',
    12:'연말 과음 과식 회복, 겨울 면역력, 연말 다이어트, 새해 건강 준비'
  };

  return { dateStr, year, month, day, season: seasonMap[month], monthlyKeywords: monthlyKeywords[month] };
}
