// ===== blog.js — 정신과 블로그 + 티스토리 블로그 =====

// ===== 티스토리 카테고리별 설정 =====
const TISTORY_CATEGORY_CONFIG = {
  health: {
    name: '건강·증상',
    topicExamples: '"간에 좋은 음식 6가지", "혈당 스파이크 증상과 낮추는 법", "춘곤증 극복하는 방법 5가지"',
    postStyle: 'health'
  },
  food: {
    name: '음식·영양',
    topicExamples: '"마늘 매일 먹으면 생기는 변화 7가지", "봄나물 종류와 효능 정리", "단백질 많은 음식 순위 TOP10"',
    postStyle: 'health'
  },
  living: {
    name: '생활·절약',
    topicExamples: '"전기요금 줄이는 방법 10가지", "봄 이불 세탁 방법 완벽 정리", "냉장고 정리 방법과 보관 기간"',
    postStyle: 'info'
  },
  recommend: {
    name: '추천·비교',
    topicExamples: '"전자담배 추천 4가지 솔직 비교", "공기청정기 고르는 법과 추천 5가지", "혈압계 추천 순위"',
    postStyle: 'recommend'
  },
  issue: {
    name: '시사·이슈',
    topicExamples: '"청년들이 결혼을 포기하는 진짜 이유", "한국 사회에서 고독사가 늘어나는 구조적 원인", "SNS가 청소년 자존감에 미치는 영향", "워라밸을 추구할수록 더 불안해지는 이유", "학벌 사회가 여전히 유지되는 메커니즘"',
    postStyle: 'essay'
  }
};

// ===== 웹 검색으로 기존 글 패턴 분석 =====
async function analyzeExistingContent(title) {
  const apiKey = localStorage.getItem('CLAUDE_API_KEY');
  if (!apiKey) throw new Error('Claude API 키가 설정되지 않았습니다.');

  // 검색 도구를 써서 기존 상위 글 패턴 파악
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
      max_tokens: 1000,
      tools: [{
        type: 'web_search_20250305',
        name: 'web_search'
      }],
      system: `당신은 블로그 콘텐츠 차별화 전략가입니다.
주어진 주제로 검색해서 상위에 노출된 글들의 패턴을 분석하고,
반드시 순수 JSON만 반환하세요.`,
      messages: [{
        role: 'user',
        content: `"${title}" 주제로 검색해서 상위 블로그 글 3~5개를 분석하세요.

분석 후 반드시 아래 JSON 형식으로만 답하세요:
{
  "commonStructure": "상위 글들이 공통으로 쓰는 소제목 구조나 전개 방식 (예: 원인→증상→해결책 순서)",
  "overusedNumbers": ["반복되는 수치들 (예: 2주에 1번, 26도, 30% 절약 등)"],
  "overusedTips": ["여러 글에서 반복되는 팁이나 조언들"],
  "overusedPhrases": ["자주 등장하는 상투적 표현들"],
  "unusedAngles": ["아직 다뤄지지 않은 각도나 관점 (차별화 포인트)"],
  "differentStructure": "위 글들과 다르게 가져갈 수 있는 구조 제안"
}`
      }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API 오류 (${response.status})`);
  }

  const data = await response.json();

  // 응답에서 텍스트 블록 추출
  const textBlock = data.content?.find(b => b.type === 'text');
  if (!textBlock?.text) {
    // 검색 결과가 없거나 실패 시 기본값 반환
    return {
      commonStructure: '일반적인 원인→방법→효과 구조',
      overusedNumbers: [],
      overusedTips: [],
      overusedPhrases: [],
      unusedAngles: ['개인 경험 중심', '실패 사례 포함', '비용/시간 현실적 계산'],
      differentStructure: '역순 구조 또는 Q&A 형식'
    };
  }

  try {
    return safeParseJSON(textBlock.text);
  } catch(e) {
    return {
      commonStructure: textBlock.text.slice(0, 200),
      overusedNumbers: [],
      overusedTips: [],
      overusedPhrases: [],
      unusedAngles: ['개인 경험 중심', '실패 사례 포함'],
      differentStructure: '차별화된 구조'
    };
  }
}

// ===== 티스토리 시스템 프롬프트 =====
const TISTORY_SYSTEM = {
  health: `당신은 건강·음식 정보 티스토리 블로그 작가입니다.

[핵심 원칙 — 차별화 필수]
- 인터넷에 이미 넘쳐나는 일반론 절대 금지. "2주에 한 번", "충분한 수분 섭취" 같은 뻔한 말 하지 마라.
- 독자가 "이건 다른 데서 못 읽은 내용이다"라고 느껴야 한다.
- 구체적 수치는 반드시 "왜 그 수치인지" 메커니즘까지 설명한다. 수치만 나열 금지.
- 반박 포인트 포함: "흔히 알려진 것과 달리~", "실제로는~" 식의 전환이 1개 이상 있어야 한다.
- 현재 계절과 시의성을 자연스럽게 반영한다.

[톤앤매너]
- 1인칭. "이게 궁금해서 직접 찾아봤는데" 식의 친근한 구어체.
- 단언체: "~다", "~해야 한다".
- 공포 조장 금지. 희망적 프레이밍.

[구조 - 반드시 이 순서 준수]

[목차]
1. (소제목1)
2. (소제목2)
3. (소제목3)
4. (소제목4)
5. (소제목5)

서론: 독자가 이미 알고 있다고 착각하는 것에 균열을 내는 도입. 180~220자.

(사진)

## (소제목1)
320~400자. 수치의 메커니즘까지 설명. 왜 그런지 원리 포함.

(사진)

## (소제목2)
320~400자.

(사진)

## (소제목3)
320~400자.

(사진)

## (소제목4)
320~400자.

(사진)

## (소제목5)
320~400자.

(사진)

[정리]
"결국 이것만 기억하면 된다" 형식으로 핵심 3줄 요약. 뻔한 말 금지.

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  info: `당신은 생활정보 티스토리 블로그 작가입니다.

[핵심 원칙 — 차별화 필수]
- 인터넷에서 복붙되는 팁 목록 절대 금지. 읽는 사람이 "이건 다르다"고 느껴야 한다.
- 각 항목은 단순 방법 나열이 아니라 "왜 대부분의 사람이 이걸 잘못 알고 있는지"부터 시작한다.
- 역발상, 실패 경험, 비용/시간의 현실적 계산 중 하나 이상 포함.
- 현재 계절과 시의성을 자연스럽게 반영한다.

[톤앤매너]
- 1인칭. 직접 해보거나 찾아본 사람처럼.
- 단언체. 시니컬한 구어체이되 정보 밀도 높게.
- "~카더라" 금지.

[구조 - 반드시 이 순서 준수]

[목차]
1. (소제목1)
2. (소제목2)
3. (소제목3)
4. (소제목4)
5. (소제목5)

서론: 왜 기존에 알던 방식이 틀렸거나 부족한지 한 방에 설득. 180~220자.

(사진)

## (소제목1)
320~400자. 단순 방법이 아닌 원리와 현실적 맥락 포함.

(사진)

## (소제목2)
320~400자.

(사진)

## (소제목3)
320~400자.

(사진)

## (소제목4)
320~400자.

(사진)

## (소제목5)
320~400자.

(사진)

[한 줄 정리]
핵심 한 줄로 끊음. 뻔하지 않게.

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  recommend: `당신은 추천·비교 콘텐츠 티스토리 블로그 작가입니다.

[핵심 원칙 — 차별화 필수]
- 광고 같은 말투, "가성비 최고", "강력 추천" 같은 표현 절대 금지.
- 단점을 솔직하게 쓰되 "그래도 이런 사람에게는 이게 맞다"는 식으로 정리한다.
- 가격 대비 현실적 판단 포함. 비싼 게 항상 낫지 않다는 관점 유지.
- 구체적 수치, 가격대, 브랜드/제품 카테고리 반드시 포함.

[톤앤매너]
- 1인칭. 직접 써봤거나 꼼꼼히 비교해본 사람의 시점.
- 단언체. "이게 낫다", "이건 별로다" 솔직하게.

[구조 - 반드시 이 순서 준수]

[목차]
1. 고르기 전에 알아야 할 핵심 기준
2. (추천항목1)
3. (추천항목2)
4. (추천항목3)
5. (추천항목4)
6. 유형별 최종 추천 요약

서론: 180~220자.

(사진)

## 고르기 전에 알아야 할 핵심 기준
280~320자.

(사진)

## (추천항목1~4)
각 320~380자. 특징, 장단점, 가격대, 추천 대상 명시.

(사진)

## 유형별 최종 추천 요약
200자 내외.

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  essay: `당신은 티스토리 개인 블로그 작가입니다.

[톤앤매너 샘플]
샘플1: "분명하게 말하지만, 이 글은 나태하게 살라는 말을 하려는 것은 아니다. 갓생이든 뭐든 무언가에 몰입하고 어제보다 나은 상태를 지향하는 행동은 인간을 인간답게 만드는 훌륭한 동력이다."
샘플2: "인생은 엑셀 시트가 아니다. 독서의 가치는 읽은 페이지 수가 아니라 그 안의 문장이 내 삶에 어떤 균열을 냈느냐에 있다."

- 1인칭. 자기 생각을 직설적으로 밀어붙임.
- 시니컬하되 히스테릭하지 않음. 억지 유머 금지. 마무리는 짧게 끊음.
- 현재 날짜/계절/시의성을 자연스럽게 반영.

[구조]

[목차]
1~3개 소제목

서론 150자 내외 → ## 소제목별 280~350자 → 마무리 100자 이내

총 1500~2000자. ## 소제목 외 마크다운 기호 일절 금지.`
};


// ==================== 정신과 블로그 ====================

async function recommendPsychTopics() {
  const excludeEl = document.getElementById('psychExclude');
  const manualExclude = excludeEl.value.trim().split('\n').filter(Boolean);
  const savedExclude = JSON.parse(localStorage.getItem('psych_used_topics') || '[]');
  const allExclude = [...new Set([...manualExclude, ...savedExclude])];
  const seed = Math.floor(Math.random() * 10000);
  const today = new Date().toLocaleDateString('ko-KR');

  setLoading('psychLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('psychTopicCard').style.display = 'none';
  document.getElementById('psychResult').style.display = 'none';

  try {
    const result = await callClaude(
      '당신은 정신건강의학과 블로그 주제 기획 전문가입니다.',
      `오늘 날짜: ${today} / 요청번호: ${seed}
인천 가로수 정신건강의학과 네이버 블로그 포스팅 주제 5개 추천.
제외 주제 (절대 포함 금지): ${allExclude.length ? allExclude.join(', ') : '없음'}
의원급 진료 가능 질환, 네이버 검색량 있는 주제, 카테고리 다양하게, 매번 새롭게.
반드시 번호 목록으로만:
1. 제목1
2. 제목2
3. 제목3
4. 제목4
5. 제목5`,
      500
    );

    const lines = result.trim().split('\n').filter(l => l.match(/^\d+\./));
    const topics = lines.map(l => l.replace(/^\d+\.\s*/, '').trim());
    const updated = [...new Set([...savedExclude, ...topics])].slice(-100);
    localStorage.setItem('psych_used_topics', JSON.stringify(updated));
    renderPsychTopics(topics);
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('psychLoading', false);
  }
}

function renderPsychTopics(topics) {
  const list = document.getElementById('psychTopicList');
  list.innerHTML = '';

  topics.forEach((title, i) => {
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.innerHTML = `
      <div class="topic-num">${String(i+1).padStart(2,'0')}</div>
      <div><div class="topic-title">${title}</div></div>`;
    item.addEventListener('click', () => generatePsychPost(title));
    list.appendChild(item);
  });

  const directItem = document.createElement('div');
  directItem.className = 'topic-item';
  directItem.style.borderStyle = 'dashed';
  directItem.innerHTML = `
    <div class="topic-num">✏️</div>
    <div style="display:flex;gap:8px;align-items:center;width:100%">
      <input type="text" id="psychDirectInput" placeholder="주제 직접 입력..."
        style="flex:1;background:#0d0d15;border:1px solid #23232f;border-radius:6px;padding:7px 10px;color:#e8e8f0;font-size:13px;font-family:inherit;outline:none"
        onkeydown="if(event.key==='Enter'){const v=this.value.trim();if(v)generatePsychPost(v);}"/>
      <button class="btn-sm btn-accent"
        onclick="const v=document.getElementById('psychDirectInput').value.trim();if(v)generatePsychPost(v);">생성</button>
    </div>`;
  list.appendChild(directItem);
  document.getElementById('psychTopicCard').style.display = 'block';
}

async function generatePsychPost(title) {
  setLoading('psychLoading', true, '블로그 글을 작성 중입니다...');
  document.getElementById('psychResult').style.display = 'none';

  try {
    const result = await callClaude(
      `당신은 인천 가로수 정신건강의학과(이성철 원장) 네이버 블로그 작가입니다.

[톤앤매너]
샘플: "매달 약국에서 가장 꾸준히 팔리는 약을 하나만 꼽으라고 한다면 단연 생리통 진통제가 아닐까 합니다. 많은 여성이 다가올 육체적 통증에 대비해 약을 상비하지만, 생리 시작 전 찾아오는 '감정의 통증' 앞에서는 아무런 대응도 하지 못한 채 속수무책의 상황에 빠지곤 하지요."

- 따뜻하고 공감적인 의사 어투. ~합니다 / ~지요 / ~이지요 체
- 환자 감정 공감 먼저, 의학 정보 자연스럽게 연결
- 소제목 없음. 구분점 없음. 번호 없음. 마크다운 없음. 별표 없음
- 수필처럼 문단이 자연스럽게 이어지는 완성된 글
- 비유와 은유 풍부하게. 전문용어는 쉽게 풀어서.
- 매번 새로운 도입부. 인터넷에 이미 있는 글과 같은 도입부 절대 금지.

[문단 구성 - 반드시 이 순서 준수. 순수 텍스트만.]
제목 (SEO 최적화, 인천 가로수 정신건강의학과 포함)

서두: 주제 소개 1~2문장

(지도)

1문단: 환자 공감 도입. 진료실 경험이나 일상 상황으로 시작. 200~250자

(사진)

2문단: 질환/증상 설명. 비유 활용. 200~250자

(사진)

3문단: 원인 또는 오해와 진실. 200~250자

(사진)

4문단: 방치 시 위험성 또는 치료 필요성. 200~250자

(사진)

5문단: 치료 방법과 회복 가능성. 희망적으로. 200~250자

(사진)

---

맺음말: 따뜻한 마무리 2~3문장. 병원 방문 권유.

인천 가로수 정신건강의학과 이성철 원장

총 1500~1800자. 순수 텍스트만. 마크다운 기호 절대 금지.`,
      `다음 주제로 위 형식과 톤앤매너에 맞게 작성해주세요: ${title}`,
      2500
    );

    const cleaned = result
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^#+\s*/gm, '')
      .replace(/^-\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/`(.*?)`/g, '$1')
      .trim();

    document.getElementById('psychTitleBox').textContent = title;
    document.getElementById('psychOutput').textContent = cleaned;
    await renderPexelsImages('mental health therapy calm', 'psychImageList', 'psychImages');
    document.getElementById('psychResult').style.display = 'block';
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('psychLoading', false);
  }
}


// ==================== 티스토리 블로그 ====================

async function recommendTistoryTopics() {
  const checkboxes = document.querySelectorAll('input[name="tistoryCategory"]:checked');
  const categories = Array.from(checkboxes).map(c => c.value);
  if (!categories.length) { showToast('카테고리를 선택해주세요'); return; }

  setLoading('tistoryLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('tistoryTopicCard').style.display = 'none';
  document.getElementById('tistoryResult').style.display = 'none';

  const seed = Math.floor(Math.random() * 10000);
  const ctx = getTodayContext();

  const isIssueOnly = categories.length === 1 && categories[0] === 'issue';
  const totalCount = isIssueOnly ? 10 : Math.ceil(5 / categories.length) * categories.length;
  const perCat = isIssueOnly ? 10 : Math.ceil(5 / categories.length);

  const catInstructions = categories.map(c => {
    const cfg = TISTORY_CATEGORY_CONFIG[c];
    if (c === 'issue') {
      return `[시사·이슈] — 이 카테고리에서 ${perCat}개 추천
다양한 관점(경제적, 사회문화적, 심리학적, 세대론적, 구조적 원인 등)에서 한국 사회의 깊이 있는 문제·현상을 다룰 것.
시의성 있는 단발성 뉴스가 아니라, 오랫동안 공감받을 수 있는 구조적 사회 문제나 현상을 선택할 것.
제목 예시: ${cfg.topicExamples}
각 주제는 서로 다른 사회 영역(가족/노동/교육/소비/젠더/고령화/디지털 등)에서 고르게 분산할 것.`;
    }
    return `[${cfg.name}] — 이 카테고리에서 ${perCat}개 추천
제목 예시: ${cfg.topicExamples}
반드시 위 예시와 같은 형태의 제목을 만들 것.`;
  }).join('\n\n');

  try {
    const result = await callClaude(
      '당신은 티스토리 애드센스 블로그 주제 기획 전문가입니다.',
      `요청번호: ${seed}
오늘 날짜: ${ctx.dateStr} / 현재 계절: ${ctx.season}
이달의 시의성 키워드: ${ctx.monthlyKeywords}

[카테고리별 주제 추천 지시]
${catInstructions}

[공통 규칙]
- 합산 ${totalCount}개. 카테고리가 여러 개면 위 지시대로 배분.
- 각 카테고리의 예시 형태에서 절대 벗어나지 말 것.
- 카테고리를 섞지 말 것.
- 각 주제 앞에 카테고리 태그 표시: [건강·증상], [음식·영양], [생활·절약], [추천·비교], [시사·이슈]
${isIssueOnly ? '- 시사·이슈 10개는 반드시 서로 다른 사회 영역에서 고르게 분산할 것.' : '- 현재 계절(' + ctx.season + ')과 시의성 키워드를 반드시 반영.'}

반드시 번호 목록으로만 출력:
${Array.from({length: totalCount}, (_, i) => `${i+1}. [카테고리태그] 제목`).join('\n')}`,
      isIssueOnly ? 1200 : 700
    );

    const lines = result.trim().split('\n').filter(l => l.match(/^\d+\./));
    const topics = lines.map(l => {
      const text = l.replace(/^\d+\.\s*/, '').trim();
      const tagMatch = text.match(/^\[(.+?)\]\s*(.+)/);
      if (tagMatch) return { tag: tagMatch[1], title: tagMatch[2].trim() };
      return { tag: '', title: text };
    });

    renderTistoryTopics(topics, categories);
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('tistoryLoading', false);
  }
}

function renderTistoryTopics(topics, selectedCategories) {
  const list = document.getElementById('tistoryTopicList');
  list.innerHTML = '';

  const tagColors = {
    '건강·증상': '#3ecfb2', '음식·영양': '#f5c842',
    '생활·절약': '#a78bfa', '추천·비교': '#5b7fff', '시사·이슈': '#ff6b8a'
  };

  topics.forEach((topic, i) => {
    const color = tagColors[topic.tag] || '#5b7fff';
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.innerHTML = `
      <div class="topic-num">${String(i+1).padStart(2,'0')}</div>
      <div style="flex:1">
        ${topic.tag ? `<div style="font-size:11px;color:${color};margin-bottom:3px;font-weight:600;font-family:'DM Mono',monospace">${topic.tag}</div>` : ''}
        <div class="topic-title">${topic.title}</div>
      </div>`;
    item.addEventListener('click', () => generateTistoryPost(topic.title, topic.tag, selectedCategories));
    list.appendChild(item);
  });

  const directItem = document.createElement('div');
  directItem.className = 'topic-item';
  directItem.style.borderStyle = 'dashed';
  directItem.innerHTML = `
    <div class="topic-num">✏️</div>
    <div style="display:flex;gap:8px;align-items:center;width:100%">
      <input type="text" id="tistoryDirectInput" placeholder="주제 직접 입력..."
        style="flex:1;background:#0d0d15;border:1px solid #23232f;border-radius:6px;padding:7px 10px;color:#e8e8f0;font-size:13px;font-family:inherit;outline:none"
        onkeydown="if(event.key==='Enter'){const v=this.value.trim();if(v)generateTistoryPost(v,'',${JSON.stringify(selectedCategories)});}"/>
      <button class="btn-sm btn-accent"
        onclick="const v=document.getElementById('tistoryDirectInput').value.trim();if(v)generateTistoryPost(v,'',${JSON.stringify(selectedCategories).replace(/"/g,'&quot;')});">
        생성
      </button>
    </div>`;
  list.appendChild(directItem);
  document.getElementById('tistoryTopicCard').style.display = 'block';
}

async function generateTistoryPost(title, tag, selectedCategories) {
  const ctx = getTodayContext();

  const tagToStyle = {
    '건강·증상': 'health', '음식·영양': 'health',
    '생활·절약': 'info', '추천·비교': 'recommend', '시사·이슈': 'essay'
  };

  let postStyle = 'info';
  if (tag && tagToStyle[tag]) {
    postStyle = tagToStyle[tag];
  } else if (selectedCategories && selectedCategories.length === 1) {
    postStyle = TISTORY_CATEGORY_CONFIG[selectedCategories[0]]?.postStyle || 'info';
  } else {
    const lower = title.toLowerCase();
    if (['추천','비교','순위','고르는','vs'].some(k => lower.includes(k))) postStyle = 'recommend';
    else if (['증상','질환','건강','치료','예방','음식','영양','효능','다이어트','혈압','혈당','간','면역','비타민','먹으면'].some(k => lower.includes(k))) postStyle = 'health';
    else if (['방법','하는 법','팁','가이드','정리','총정리','절약','줄이는','이유','차이','종류'].some(k => lower.includes(k))) postStyle = 'info';
    else if (['왜','민낯','문제','현실','이슈','논란','솔직히'].some(k => lower.includes(k))) postStyle = 'essay';
  }

  const pexelsQueryMap = {
    health: 'healthy food nutrition wellness',
    info:   'living lifestyle home tips',
    recommend: 'product review comparison',
    essay:  'daily life society people'
  };

  // ===== STEP 1: 기존 글 패턴 분석 =====
  setLoading('tistoryLoading', true, '기존 글 패턴 분석 중...');
  document.getElementById('tistoryResult').style.display = 'none';

  let patternAnalysis = null;
  try {
    patternAnalysis = await analyzeExistingContent(title);
  } catch(e) {
    // 분석 실패해도 글 생성은 계속
    console.warn('패턴 분석 실패, 기본값으로 진행:', e.message);
  }

  // ===== STEP 2: 분석 결과 기반 차별화 지시 생성 =====
  let differentiationGuide = '';
  if (patternAnalysis) {
    differentiationGuide = `
[차별화 필수 지시 — 검색 분석 결과]
기존 상위 글들의 공통 구조: ${patternAnalysis.commonStructure || '없음'}

아래 항목들은 이미 다른 블로그에 넘쳐나므로 절대 그대로 쓰지 마라:
- 반복 수치: ${(patternAnalysis.overusedNumbers || []).join(', ') || '없음'}
- 반복 팁: ${(patternAnalysis.overusedTips || []).join(', ') || '없음'}
- 상투적 표현: ${(patternAnalysis.overusedPhrases || []).join(', ') || '없음'}

대신 이 각도로 차별화하라:
- 미개척 관점: ${(patternAnalysis.unusedAngles || []).join(', ') || '새로운 시각'}
- 구조 차별화: ${patternAnalysis.differentStructure || '역순 또는 반박 구조'}

위 분석을 반드시 반영해서 기존 글들과 명확히 다른 글을 써라.`;
  }

  // ===== STEP 3: 글 생성 =====
  setLoading('tistoryLoading', true, '차별화된 글을 작성 중...');

  try {
    const result = await callClaude(
      TISTORY_SYSTEM[postStyle],
      `오늘 날짜: ${ctx.dateStr} / 현재 계절: ${ctx.season} / 이달 시의성: ${ctx.monthlyKeywords}
${differentiationGuide}

다음 주제로 위 형식, 톤앤매너, 차별화 지시에 맞게 작성해주세요: ${title}

주의사항:
- 이 주제만 다룰 것.
- 현재 계절(${ctx.season})을 자연스럽게 반영할 것.
- 목차를 반드시 글 상단에 포함할 것.
- 총 분량 준수. 각 소제목 아래 내용이 충분히 채워져야 함.
- 인터넷에 이미 있는 표현과 구조를 반복하지 말 것.`,
      3500
    );

    document.getElementById('tistoryTitleBox').textContent = title;
    document.getElementById('tistoryOutput').textContent = result;

    await renderPexelsImages(
      pexelsQueryMap[postStyle] || 'lifestyle blog',
      'tistoryImageList',
      'tistoryImages'
    );

    document.getElementById('tistoryResult').style.display = 'block';
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('tistoryLoading', false);
  }
}
