// ===== blog.js — 정신과 블로그 + 티스토리 블로그 =====

// ===== 티스토리 카테고리 =====
const TISTORY_CATEGORIES = {
  health:    '건강·증상',
  food:      '음식·영양',
  living:    '생활·절약',
  recommend: '추천·비교',
  issue:     '시사·이슈',
  finance:   '재테크·금융',
  parenting: '육아·교육'
};

// ===== 티스토리 postStyle 매핑 =====
const TISTORY_POST_STYLE = {
  health:    'health',
  food:      'health',
  living:    'info',
  recommend: 'recommend',
  issue:     'essay',
  finance:   'info',
  parenting: 'info'
};

// ===== 티스토리 시스템 프롬프트 =====
const TISTORY_SYSTEM = {
  health: `당신은 건강·음식 정보 티스토리 블로그 작가입니다.

[핵심 원칙 — 차별화 필수]
- 인터넷에 이미 넘쳐나는 일반론 절대 금지.
- 독자가 "이건 다른 데서 못 읽은 내용이다"라고 느껴야 한다.
- 구체적 수치는 반드시 "왜 그 수치인지" 메커니즘까지 설명한다. 수치만 나열 금지.
- 반박 포인트 포함: "흔히 알려진 것과 달리~", "실제로는~" 식의 전환이 1개 이상 있어야 한다.
- 현재 계절과 시의성을 자연스럽게 반영한다.

[톤앤매너]
- 1인칭. "이게 궁금해서 직접 찾아봤는데" 식의 친근한 구어체.
- 단언체: "~다", "~해야 한다".
- 공포 조장 금지. 희망적 프레이밍.

[구조]
[목차]
1. (소제목1)
2. (소제목2)
3. (소제목3)
4. (소제목4)
5. (소제목5)

서론: 독자가 이미 알고 있다고 착각하는 것에 균열을 내는 도입. 180~220자.

(사진)

## (소제목1~5)
각 320~400자. 수치의 메커니즘까지 설명. 반박 포인트 포함.

(사진)

[정리]
핵심 3줄 요약. 뻔한 말 금지.

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  info: `당신은 생활정보 티스토리 블로그 작가입니다.

[핵심 원칙 — 차별화 필수]
- 인터넷에서 복붙되는 팁 목록 절대 금지.
- 각 항목은 "왜 대부분의 사람이 이걸 잘못 알고 있는지"부터 시작한다.
- 역발상, 실패 경험, 비용/시간의 현실적 계산 중 하나 이상 포함.
- 현재 계절과 시의성을 자연스럽게 반영한다.

[톤앤매너]
- 1인칭. 직접 해보거나 찾아본 사람처럼.
- 단언체. 시니컬한 구어체이되 정보 밀도 높게.

[구조]
[목차]
1. (소제목1)
2. (소제목2)
3. (소제목3)
4. (소제목4)
5. (소제목5)

서론: 왜 기존에 알던 방식이 틀렸거나 부족한지 한 방에 설득. 180~220자.

(사진)

## (소제목1~5)
각 320~400자. 단순 방법이 아닌 원리와 현실적 맥락 포함.

(사진)

[한 줄 정리]
핵심 한 줄로 끊음. 뻔하지 않게.

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  recommend: `당신은 추천·비교 콘텐츠 티스토리 블로그 작가입니다.

[핵심 원칙 — 차별화 필수]
- "가성비 최고", "강력 추천" 같은 광고성 표현 절대 금지.
- 단점을 솔직하게 쓰되 "이런 사람에게는 이게 맞다"로 정리한다.
- 가격 대비 현실적 판단 포함.

[톤앤매너]
- 1인칭. 직접 써봤거나 꼼꼼히 비교해본 사람의 시점.
- 단언체. "이게 낫다", "이건 별로다" 솔직하게.

[구조]
[목차]
1. 고르기 전에 알아야 할 핵심 기준
2~5. (추천항목별)
6. 유형별 최종 추천 요약

각 항목 320~380자. 특징, 장단점, 가격대, 추천 대상 명시.
총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  essay: `당신은 티스토리 개인 블로그 작가입니다.

[톤앤매너 샘플]
"분명하게 말하지만, 이 글은 나태하게 살라는 말을 하려는 것은 아니다. 갓생이든 뭐든 무언가에 몰입하고 어제보다 나은 상태를 지향하는 행동은 인간을 인간답게 만드는 훌륭한 동력이다."

- 1인칭. 자기 생각을 직설적으로 밀어붙임.
- 시니컬하되 히스테릭하지 않음. 억지 유머 금지. 마무리는 짧게 끊음.
- 현재 날짜/계절/시의성을 자연스럽게 반영.

[구조]
[목차] 1~3개 소제목
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

[문단 구성 - 순수 텍스트만]
제목 (SEO 최적화, 인천 가로수 정신건강의학과 포함)
서두: 주제 소개 1~2문장
(지도)
1문단: 환자 공감 도입. 200~250자
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

총 1500~1800자. 마크다운 기호 절대 금지.`,
      `다음 주제로 작성해주세요: ${title}`,
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


// ==================== 티스토리 — 키워드 리서치 기반 ====================

// STEP 1: 키워드 발굴
async function discoverTistoryKeywords() {
  const categoryEl = document.getElementById('tistoryCategory');
  const category = categoryEl?.value || 'health';
  const categoryName = TISTORY_CATEGORIES[category] || category;

  setLoading('tistoryLoading', true, '인기 키워드를 분석 중입니다...');
  document.getElementById('tistoryKeywordResult').style.display = 'none';
  document.getElementById('tistoryStep2').style.display = 'none';
  document.getElementById('tistoryResult').style.display = 'none';

  try {
    const apiKey = localStorage.getItem('CLAUDE_API_KEY');
    if (!apiKey) throw new Error('Claude API 키가 설정되지 않았습니다.');

    const ctx = getTodayContext();

    // 웹 검색으로 인기 키워드 발굴
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
        max_tokens: 2000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `당신은 티스토리 블로그 키워드 리서치 전문가입니다.
웹 검색으로 ${categoryName} 카테고리의 인기 블로그 키워드를 발굴하고
반드시 순수 JSON만 반환하세요. 마크다운 없이 JSON만.`,
        messages: [{
          role: 'user',
          content: `오늘 날짜: ${ctx.dateStr} / 계절: ${ctx.season}

"${categoryName} 티스토리 블로그 인기글" 또는 "${categoryName} 네이버 블로그 인기 검색어" 등으로 검색해서
현재 시점에 사람들이 많이 검색하는 ${categoryName} 관련 키워드를 발굴해주세요.

다음 기준으로 메인 키워드 8개를 선정하세요:
1. 네이버에서 파워링크(광고)가 붙을 가능성이 높은 상업적 키워드
2. 월간 검색량이 충분히 있을 것으로 예상되는 키워드
3. 현재 계절(${ctx.season})과 시의성에 맞는 키워드

각 메인 키워드마다 2~3차 파생 키워드 3개씩 생성하세요.
파생 키워드는 메인 키워드보다 구체적이고 경쟁이 낮은 롱테일 키워드여야 합니다.

반드시 순수 JSON으로만:
{
  "keywords": [
    {
      "main": "메인 키워드",
      "derivatives": ["파생키워드1", "파생키워드2", "파생키워드3"],
      "reason": "이 키워드를 선정한 이유 한 줄"
    }
  ]
}`
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API 오류 (${response.status})`);
    }

    const data = await response.json();
    const textBlock = data.content?.find(b => b.type === 'text');
    if (!textBlock?.text) throw new Error('키워드 분석 결과를 받지 못했습니다.');

    const parsed = safeParseJSON(textBlock.text);
    renderKeywordResult(parsed.keywords, category);

  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('tistoryLoading', false);
  }
}

// 키워드 결과 렌더링
function renderKeywordResult(keywords, category) {
  const box = document.getElementById('tistoryKeywordResult');

  // 전체 키워드 목록 (복사용)
  const allKeywords = [];
  keywords.forEach(k => {
    allKeywords.push(k.main);
    k.derivatives.forEach(d => allKeywords.push(d));
  });

  box.innerHTML = `
    <div class="card-title">
      STEP 1 결과 — 발굴된 키워드
      <button class="btn-sm btn-accent" onclick="navigator.clipboard.writeText(${JSON.stringify(allKeywords.join('\n'))}).then(()=>showToast('전체 키워드 복사됨!'))">
        📋 전체 복사
      </button>
    </div>

    <div style="background:#0d0d15;border:1px solid #2a3a7a;border-radius:6px;padding:12px;margin-bottom:14px;font-size:12px;color:#9090a8;line-height:1.7">
      📌 아래 키워드를 <strong style="color:#e8e8f0">네이버</strong>에서 검색해보세요.<br>
      ① 파워링크(광고) 있는지 확인 &nbsp;|&nbsp; ② <a href="https://searchad.naver.com" target="_blank" style="color:#5b7fff">네이버 키워드 도구</a>에서 월간 조회수 확인<br>
      조회수 <strong style="color:#3ecfb2">5만 이상 + 파워링크 있음</strong> → 아래 STEP 2에 입력
    </div>

    <div class="keyword-grid">
      ${keywords.map((k, i) => `
        <div class="keyword-card">
          <div class="keyword-main">
            <span class="keyword-num">${String(i+1).padStart(2,'0')}</span>
            <span class="keyword-text">${k.main}</span>
            <button class="btn-sm" onclick="navigator.clipboard.writeText('${k.main}').then(()=>showToast('복사됨!'))">복사</button>
          </div>
          <div class="keyword-reason">${k.reason}</div>
          <div class="keyword-derivatives">
            ${k.derivatives.map(d => `
              <div class="keyword-derivative">
                <span>↳ ${d}</span>
                <button class="btn-sm" onclick="navigator.clipboard.writeText('${d}').then(()=>showToast('복사됨!'))">복사</button>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  box.style.display = 'block';

  // STEP 2 표시
  document.getElementById('tistoryStep2Category').value = category;
  document.getElementById('tistoryStep2').style.display = 'block';
}

// STEP 2: 키워드 입력 후 글 생성
async function generateTistoryFromKeyword() {
  const keyword = document.getElementById('tistoryFinalKeyword').value.trim();
  if (!keyword) { showToast('최종 키워드를 입력해주세요'); return; }

  const category = document.getElementById('tistoryStep2Category').value || 'health';
  const postStyle = TISTORY_POST_STYLE[category] || 'info';
  const ctx = getTodayContext();

  const pexelsQueryMap = {
    health:    'healthy food nutrition wellness',
    info:      'living lifestyle home tips',
    recommend: 'product review comparison',
    essay:     'daily life society people'
  };

  // 기존 글 패턴 분석 후 차별화 글 생성
  setLoading('tistoryLoading', true, '기존 글 패턴 분석 중...');
  document.getElementById('tistoryResult').style.display = 'none';

  let differentiationGuide = '';
  try {
    const patternAnalysis = await analyzeExistingContent(keyword);
    if (patternAnalysis) {
      differentiationGuide = `
[차별화 필수 지시 — 검색 분석 결과]
기존 상위 글들의 공통 구조: ${patternAnalysis.commonStructure || '없음'}

아래는 이미 다른 블로그에 넘쳐나므로 절대 그대로 쓰지 마라:
- 반복 수치: ${(patternAnalysis.overusedNumbers || []).join(', ') || '없음'}
- 반복 팁: ${(patternAnalysis.overusedTips || []).join(', ') || '없음'}
- 상투적 표현: ${(patternAnalysis.overusedPhrases || []).join(', ') || '없음'}

이 각도로 차별화하라:
- 미개척 관점: ${(patternAnalysis.unusedAngles || []).join(', ') || '새로운 시각'}
- 구조 차별화: ${patternAnalysis.differentStructure || '역순 또는 반박 구조'}`;
    }
  } catch(e) {
    console.warn('패턴 분석 실패, 기본값으로 진행');
  }

  setLoading('tistoryLoading', true, '차별화된 글을 작성 중...');

  try {
    const result = await callClaude(
      TISTORY_SYSTEM[postStyle],
      `오늘 날짜: ${ctx.dateStr} / 현재 계절: ${ctx.season} / 이달 시의성: ${ctx.monthlyKeywords}
${differentiationGuide}

다음 키워드로 SEO 최적화된 블로그 글을 작성해주세요: "${keyword}"

[SEO 지시]
- 제목에 키워드 "${keyword}" 반드시 포함
- 첫 문단에 키워드 자연스럽게 포함
- 소제목에 키워드 변형 표현 포함 (예: "${keyword} 방법", "${keyword} 주의사항" 등)
- 목차를 반드시 글 상단에 포함
- 총 분량 준수
- 인터넷에 이미 있는 표현과 구조를 반복하지 말 것`,
      3500
    );

    document.getElementById('tistoryTitleBox').textContent = keyword + ' — 생성된 글';
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

// 기존 글 패턴 분석 (차별화용)
async function analyzeExistingContent(keyword) {
  const apiKey = localStorage.getItem('CLAUDE_API_KEY');
  if (!apiKey) return null;

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
      max_tokens: 800,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      system: '당신은 블로그 콘텐츠 차별화 전략가입니다. 반드시 순수 JSON만 반환하세요.',
      messages: [{
        role: 'user',
        content: `"${keyword}" 키워드로 검색해서 상위 블로그 글 3~5개를 분석하세요.

반드시 아래 JSON 형식으로만:
{
  "commonStructure": "상위 글들의 공통 구조나 전개 방식",
  "overusedNumbers": ["반복되는 수치들"],
  "overusedTips": ["여러 글에서 반복되는 팁"],
  "overusedPhrases": ["자주 등장하는 상투적 표현"],
  "unusedAngles": ["아직 다뤄지지 않은 각도나 관점"],
  "differentStructure": "차별화할 수 있는 구조 제안"
}`
      }]
    })
  });

  if (!response.ok) return null;

  const data = await response.json();
  const textBlock = data.content?.find(b => b.type === 'text');
  if (!textBlock?.text) return null;

  try {
    return safeParseJSON(textBlock.text);
  } catch(e) {
    return null;
  }
}
