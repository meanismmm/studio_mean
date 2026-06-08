// ===== api.js — Claude API 공통 모듈 =====

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
    throw new Error(err.error?.message || `API 오류 (${response.status})`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
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
