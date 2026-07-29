const MODEL = 'gpt-5.6-sol';
const MAX_BODY_BYTES = 256 * 1024;

function json(status, payload) {
  return Response.json(payload, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

function extractOutputText(data) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const parts = [];
  for (const item of data.output || []) {
    if (item.type !== 'message') continue;
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

async function generate(request, env) {
  if (!env.OPENAI_API_KEY) return json(503, { error: 'OpenAI API 키가 설정되지 않았습니다.' });
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) return json(413, { error: '요청 본문이 너무 큽니다.' });
  let payload;
  try { payload = await request.json(); } catch { return json(400, { error: '올바른 JSON 요청이 아닙니다.' }); }

  const systemPrompt = String(payload.systemPrompt || '').trim();
  const userPrompt = String(payload.userPrompt || '').trim();
  if (!systemPrompt || !userPrompt) return json(400, { error: '시스템 프롬프트와 사용자 프롬프트가 필요합니다.' });

  const effort = new Set(['none', 'low', 'medium', 'high']).has(payload.reasoningEffort) ? payload.reasoningEffort : 'low';
  const verbosity = new Set(['low', 'medium', 'high']).has(payload.verbosity) ? payload.verbosity : 'medium';
  const maxOutputTokens = Math.min(Math.max(Number(payload.maxOutputTokens) || 4000, 256), 12000);
  const model = env.OPENAI_MODEL || MODEL;
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model, instructions: systemPrompt, input: userPrompt, reasoning: { effort }, text: { verbosity }, max_output_tokens: maxOutputTokens, store: false })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return json(response.status, { error: data.error?.message || `OpenAI API 오류 (${response.status})` });
  const text = extractOutputText(data);
  if (!text) return json(502, { error: 'OpenAI 응답에 본문이 없습니다.' });
  return json(200, { text, model: data.model || model, usage: data.usage || null });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/api/health') {
      return json(200, { ok: true, provider: 'OpenAI', model: env.OPENAI_MODEL || MODEL, keyConfigured: Boolean(env.OPENAI_API_KEY) });
    }
    if (request.method === 'POST' && url.pathname === '/api/generate') return generate(request, env);
    if (url.pathname.startsWith('/api/')) return json(404, { error: 'API 경로를 찾을 수 없습니다.' });
    return env.ASSETS.fetch(request);
  }
};
