// studio_mean local server
// Serves the static app and keeps OPENAI_API_KEY out of the browser.

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
loadEnvFromAncestors(ROOT);

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 8787);
const MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-sol';
const MAX_BODY_BYTES = 256 * 1024;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function loadEnvFromAncestors(startDir) {
  let dir = path.resolve(startDir);
  while (true) {
    const candidate = path.join(dir, '.env');
    if (fs.existsSync(candidate)) {
      const lines = fs.readFileSync(candidate, 'utf8').split(/\r?\n/);
      for (const line of lines) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!match || match[1].startsWith('#') || process.env[match[1]]) continue;
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[match[1]] = value;
      }
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('요청 본문이 너무 큽니다.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new Error('잘못된 JSON 요청입니다.'));
      }
    });
    req.on('error', reject);
  });
}

function extractOutputText(data) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const parts = [];
  for (const item of data.output || []) {
    if (item.type !== 'message') continue;
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

async function generateWithOpenAI(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw Object.assign(new Error('OPENAI_API_KEY가 설정되지 않았습니다.'), { status: 503 });

  const systemPrompt = String(payload.systemPrompt || '').trim();
  const userPrompt = String(payload.userPrompt || '').trim();
  if (!systemPrompt || !userPrompt) {
    throw Object.assign(new Error('시스템 프롬프트와 사용자 프롬프트가 필요합니다.'), { status: 400 });
  }

  const allowedEfforts = new Set(['none', 'low', 'medium', 'high']);
  const allowedVerbosity = new Set(['low', 'medium', 'high']);
  const effort = allowedEfforts.has(payload.reasoningEffort) ? payload.reasoningEffort : 'low';
  const verbosity = allowedVerbosity.has(payload.verbosity) ? payload.verbosity : 'medium';
  const maxOutputTokens = Math.min(Math.max(Number(payload.maxOutputTokens) || 4000, 256), 12000);

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      instructions: systemPrompt,
      input: userPrompt,
      reasoning: { effort },
      text: { verbosity },
      max_output_tokens: maxOutputTokens,
      store: false
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || `OpenAI API 오류 (${response.status})`;
    throw Object.assign(new Error(message), { status: response.status });
  }

  const text = extractOutputText(data);
  if (!text) throw Object.assign(new Error('OpenAI 응답에 본문이 없습니다.'), { status: 502 });

  return {
    text,
    model: data.model || MODEL,
    usage: data.usage || null
  };
}

function serveStatic(req, res) {
  const requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host || HOST}`).pathname);
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  if (relativePath.split(/[\\/]/).some(segment => segment.startsWith('.'))) {
    sendJson(res, 403, { error: '접근할 수 없는 경로입니다.' });
    return;
  }
  const filePath = path.resolve(ROOT, relativePath);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    sendJson(res, 403, { error: '접근할 수 없는 경로입니다.' });
    return;
  }

  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      sendJson(res, 404, { error: '파일을 찾을 수 없습니다.' });
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host || HOST}`).pathname;

  if (req.method === 'GET' && pathname === '/api/health') {
    sendJson(res, 200, {
      ok: true,
      provider: 'OpenAI',
      model: MODEL,
      keyConfigured: Boolean(process.env.OPENAI_API_KEY)
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/generate') {
    try {
      const payload = await readJson(req);
      const result = await generateWithOpenAI(payload);
      sendJson(res, 200, result);
    } catch (error) {
      console.error(`[OpenAI] ${error.message}`);
      sendJson(res, error.status || 500, { error: error.message || '생성 중 오류가 발생했습니다.' });
    }
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { error: '지원하지 않는 요청입니다.' });
    return;
  }

  serveStatic(req, res);
});

if (require.main === module) {
  server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
      console.error(`포트 ${PORT}이 이미 사용 중입니다. 기존 studio_mean 서버를 확인하세요.`);
      process.exitCode = 1;
      return;
    }
    throw error;
  });
  server.listen(PORT, HOST, () => {
    console.log(`studio_mean: http://${HOST}:${PORT}`);
    console.log(`OpenAI: ${process.env.OPENAI_API_KEY ? 'configured' : 'missing'} / model: ${MODEL}`);
  });
}

module.exports = { server, extractOutputText, loadEnvFromAncestors };
