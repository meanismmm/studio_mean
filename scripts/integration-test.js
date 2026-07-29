const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.STUDIO_MEAN_URL || 'http://127.0.0.1:8787';
const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'blog.js'), 'utf8');
const systemMatch = source.match(/const PSYCH_SYSTEM = `([\s\S]*?)`;\s*\r?\n\s*const PSYCH_REVIEW_SYSTEM/);

if (!systemMatch) {
  throw new Error('js/blog.js에서 PSYCH_SYSTEM을 찾지 못했습니다.');
}

const systemPrompt = systemMatch[1];
const reviewPrompt = `${systemPrompt}

[최종 편집 역할]
초안의 핵심 내용은 살리되 위 작성 원칙을 모두 적용해 최종 원고를 완성하세요.
상투적인 AI 문장, 의학적 단정, 치료 효과 과장, 진료 절차·비용·법률 서술을 제거하세요.
검토 의견 없이 발행 가능한 최종 원고만 출력하세요.`;

async function generate(system, user, maxOutputTokens, reasoningEffort, verbosity) {
  const response = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt: system, userPrompt: user, maxOutputTokens, reasoningEffort, verbosity })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

function countExactLines(text, value) {
  return text.split(/\r?\n/).filter(line => line.trim() === value).length;
}

async function main() {
  const health = await fetch(`${BASE_URL}/api/health`).then(r => r.json());
  if (!health.ok || !health.keyConfigured) throw new Error('OpenAI 서버가 준비되지 않았습니다.');

  const topic = {
    title: '불안한 생각 때문에 잠들기 어려운 밤, 마음에서는 무슨 일이 일어날까요',
    disease: '불안·수면 문제',
    angle: '증상 이해와 일상 회복',
    summary: '잠들기 직전 생각이 많아지는 경험을 구체적으로 설명하고, 불안과 수면이 서로 영향을 주는 구조 및 전문적 도움의 의미를 안내합니다.',
    searchKeyword: '인천 불안 수면 정신건강의학과'
  };

  const draft = await generate(
    systemPrompt,
    `다음 주제로 블로그 글을 작성해주세요. 구조 형식을 그대로 따르고 순수 텍스트로 출력하세요.\n\n주제: ${topic.title}\n질환/증상: ${topic.disease}\n접근 각도: ${topic.angle}\n핵심 메시지: ${topic.summary}\n검색 키워드: ${topic.searchKeyword}`,
    8000,
    'medium',
    'high'
  );

  const reviewed = await generate(
    reviewPrompt,
    `아래 초안을 최종 검수하여 발행 가능한 완성본만 출력하세요.\n\n[초안]\n${draft.text}`,
    8000,
    'medium',
    'high'
  );

  const text = reviewed.text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/`(.*?)`/g, '$1')
    .trim();

  const checks = {
    brandInTitle: text.split(/\r?\n/)[0].includes('인천 가로수 정신건강의학과'),
    separators: countExactLines(text, '---') === 3,
    mapMarker: countExactLines(text, '(지도)') === 1,
    photoMarkers: [1, 2, 3, 4, 5].every(number => countExactLines(text, `--사진${number}--`) === 1),
    signature: text.includes('인천 가로수 정신건강의학과 이성철 원장'),
    noMarkdownHeadings: !/^#+\s/m.test(text),
    reasonableLength: text.length >= 1800 && text.length <= 2600
  };

  console.log(`MODEL=${health.model}`);
  console.log(`TITLE=${text.split(/\r?\n/)[0]}`);
  console.log(`CHARACTERS=${text.length}`);
  console.log(`DRAFT_TOKENS=${draft.usage?.total_tokens ?? 'unknown'}`);
  console.log(`REVIEW_TOKENS=${reviewed.usage?.total_tokens ?? 'unknown'}`);
  for (const [name, passed] of Object.entries(checks)) console.log(`${name}=${passed ? 'PASS' : 'FAIL'}`);

  if (Object.values(checks).some(passed => !passed)) process.exitCode = 1;
}

main().catch(error => {
  console.error(`INTEGRATION_TEST_ERROR=${error.message}`);
  process.exitCode = 1;
});
