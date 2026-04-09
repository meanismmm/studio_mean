module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { keyword } = req.body;
  if (!keyword) return res.status(400).json({ error: 'keyword required' });

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  console.log('[claude-search] keyword:', keyword);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `당신은 블로그 글쓰기를 위한 팩트 수집 전문가입니다.
주어진 키워드를 검색하여 확인된 사실만 추출하세요.
반드시 순수 JSON만 반환하세요. 마크다운 코드블록 없이.`,
        messages: [{
          role: 'user',
          content: `"${keyword}" 키워드로 웹 검색 후, 블로그 글 작성에 필요한 팩트만 추출해주세요.

반드시 아래 JSON 형식으로만 응답:
{
  "facts": [
    "확인된 사실 1 (출처 포함)",
    "확인된 사실 2 (출처 포함)"
  ],
  "caution": ["주의할 점 또는 논란 사항"],
  "summary": "핵심 내용 2줄 요약"
}`
        }]
      })
    });

    console.log('[claude-search] status:', response.status);
    const data = await response.json();
    console.log('[claude-search] content types:', data.content?.map(b => b.type).join(', '));

    const textBlock = data.content?.find(b => b.type === 'text');
    console.log('[claude-search] text:', textBlock?.text?.slice(0, 300));

    if (!textBlock?.text) {
      console.log('[claude-search] no text block, returning empty');
      return res.status(200).json({ facts: [], caution: [], summary: '검색 결과 없음' });
    }

    const text = textBlock.text.replace(/```json|```/g, '').trim();
    try {
      const parsed = JSON.parse(text);
      console.log('[claude-search] parsed facts count:', parsed.facts?.length);
      return res.status(200).json(parsed);
    } catch (e) {
      console.log('[claude-search] JSON parse failed:', e.message);
      return res.status(200).json({ facts: [], caution: [], summary: text.slice(0, 200) });
    }

  } catch (err) {
    console.error('[claude-search] error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
