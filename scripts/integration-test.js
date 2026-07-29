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
    title: '청소년 공황장애 치료, 병원에서는 무엇을 할까요? 인천 가로수 정신건강의학과',
    disease: '공황장애',
    angle: '청소년이 병원에서 받는 평가와 치료의 실제',
    summary: '청소년 공황장애 진료에서는 증상을 세심히 평가하고, 교육·상담·인지행동치료와 필요시 신중한 약물치료를 개인에 맞게 조합합니다.',
    searchKeyword: '청소년 공황장애 치료',
    ageGroup: '10대 청소년',
    readerType: '환자 본인',
    contentPlan: [
      '병원에서 무엇을 하는지 두려운 청소년에게 핵심 답변을 먼저 제시',
      '공황발작의 양상과 생활 영향을 대화로 확인하는 임상적 평가',
      '신체 질환과 다른 불안 문제를 함께 살피는 이유',
      '증상 이해 교육과 인지행동치료에서 배우는 내용',
      '청소년 약물치료를 전문의 판단에 따라 신중히 검토하는 맥락',
      '가족의 협조와 학교·일상으로 회복하는 과정'
    ]
  };
  const planText = topic.contentPlan.map((item, index) => `  ${index + 1}. ${item}`).join('\n');
  const brief = `[원고 계약 — 최우선]
- 선택 제목: ${topic.title}
- 핵심 질문: 청소년 공황장애 치료를 위해 병원에서는 무엇을 하는가
- 한 문장 직접 답변: ${topic.summary}
- 대상 질환/증상: ${topic.disease}
- 독자 연령대: ${topic.ageGroup}
- 독자 유형: ${topic.readerType}
- 접근 각도: ${topic.angle}
- 핵심 메시지: ${topic.summary}
- 문단 계획:
${planText}`;

  const draft = await generate(
    systemPrompt,
    `다음 원고 계약에 따라 블로그 글을 작성하세요. 구조 형식을 그대로 따르고 순수 텍스트로 출력하세요.\n\n${brief}\n검색 키워드: ${topic.searchKeyword}`,
    8000,
    'medium',
    'high'
  );

  const reviewed = await generate(
    reviewPrompt,
    `아래 원고 계약과 초안을 대조하세요. 첫 문단에서 핵심 질문에 답하고, 여섯 문단 모두 제목과 직접 관련되며, 10대 독자 조건을 유지하도록 고친 완성본만 출력하세요.\n\n${brief}\n\n[초안]\n${draft.text}`,
    8000,
    'high',
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
    reasonableLength: text.length >= 1800 && text.length <= 2600,
    treatmentCoverage: ['평가', '인지행동', '약물'].every(keyword => text.includes(keyword)),
    adolescentFocus: text.includes('청소년') && !text.includes('직장인')
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
