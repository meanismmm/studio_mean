// ===== api.js — OpenAI API 공통 모듈 =====
// API 키는 브라우저에 저장하지 않고 로컬 Node 서버의 .env에서만 읽습니다.

async function callAI(systemPrompt, userPrompt, maxOutputTokens = 2000, options = {}) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt,
      userPrompt,
      maxOutputTokens,
      reasoningEffort: options.reasoningEffort || 'low',
      verbosity: options.verbosity || 'medium'
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `OpenAI API 오류 (${response.status})`);
  }

  const data = await response.json();
  return data.text || '';
}

// Pexels 이미지 검색
async function searchPexels(query, count = 5) {
  const key = localStorage.getItem('PEXELS_API_KEY');
  if (!key) return [];

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
}
