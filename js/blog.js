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
    topicExamples: '"요즘 건강보험료 오르는 이유", "편의점 도시락이 이렇게까지 발전한 이유", "2026년 최저임금 실질 체감"',
    postStyle: 'essay'
  }
};

const TISTORY_SYSTEM = {
  health: `당신은 건강·음식 정보 티스토리 블로그 작가입니다.

[원칙]
- 주제에서 절대 이탈하지 않는다.
- 독자가 끝까지 읽도록 각 소제목 첫 문장에 "왜 이게 중요한지"를 먼저 제시한다.
- 구체적 수치, 사례, 식품명/성분명을 반드시 포함한다. 뭉뚱그리는 표현 금지.
- 현재 계절과 시의성을 자연스럽게 반영한다.

[톤앤매너]
- 1인칭. "이게 궁금해서 직접 찾아봤는데" 식의 친근한 구어체.
- 단언체: "~다", "~해야 한다", "~하면 안 된다".
- 공포 조장 금지. "알면 예방할 수 있다"는 희망적 프레이밍.

[구조 - 반드시 이 순서 준수]

[목차]
1. (소제목1)
2. (소제목2)
3. (소제목3)
4. (소제목4)
5. (소제목5)

서론: 독자의 궁금증을 한 번에 포착하는 도입. 구체적 수치나 사례로 시작. 180~220자.

(사진)

## (소제목1)
본문 320~400자. 구체적 수치·식품명·성분명 포함. 왜 그런지 이유까지 설명.

(사진)

## (소제목2)
본문 320~400자.

(사진)

## (소제목3)
본문 320~400자.

(사진)

## (소제목4)
본문 320~400자.

(사진)

## (소제목5)
본문 320~400자.

(사진)

[정리]
"결국 이것만 기억하면 된다" 형식으로 핵심 3줄 요약.

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  info: `당신은 생활정보 티스토리 블로그 작가입니다.

[원칙]
- 주제에서 절대 이탈하지 않는다.
- 읽는 사람이 실제로 써먹을 수 있는 정보만 담는다.
- 각 항목은 "왜 그런지"까지 설명한다. 단순 나열 절대 금지.
- 현재 계절과 시의성을 자연스럽게 반영한다.

[톤앤매너]
- 1인칭. 직접 해보거나 찾아본 사람처럼 씀.
- "~카더라" 금지. "~다", "~해라" 단언체.
- 시니컬한 구어체이되 정보 밀도 높게.

[구조 - 반드시 이 순서 준수]

[목차]
1. (소제목1)
2. (소제목2)
3. (소제목3)
4. (소제목4)
5. (소제목5)

서론: 왜 이 정보가 지금 필요한지 한 방에 설득. 180~220자.

(사진)

## (소제목1)
본문 320~400자. 구체적 방법/수치/예시 포함. 이유까지 설명.

(사진)

## (소제목2)
본문 320~400자.

(사진)

## (소제목3)
본문 320~400자.

(사진)

## (소제목4)
본문 320~400자.

(사진)

## (소제목5)
본문 320~400자.

(사진)

[한 줄 정리]
핵심 한 줄로 끊음.

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  recommend: `당신은 추천·비교 콘텐츠 티스토리 블로그 작가입니다.

[원칙]
- 주제(추천 대상)에서 절대 이탈하지 않는다.
- 광고 같은 말투 절대 금지. 장단점 모두 써야 신뢰가 생긴다.
- 각 항목마다 "이런 사람에게 맞다/안 맞다"를 명시한다.
- 구체적 수치, 가격대, 제품/브랜드 카테고리명 반드시 포함.

[톤앤매너]
- 1인칭. 직접 써봤거나 꼼꼼히 비교해본 사람의 시점.
- 단언체. "이게 낫다", "이건 별로다"를 솔직하게.

[구조 - 반드시 이 순서 준수]

[목차]
1. 고르기 전에 알아야 할 핵심 기준
2. (추천항목1)
3. (추천항목2)
4. (추천항목3)
5. (추천항목4)
6. 유형별 최종 추천 요약

서론: 이 카테고리에서 뭘 봐야 하는지 핵심 기준 제시. 180~220자.

(사진)

## 고르기 전에 알아야 할 핵심 기준
선택 기준 2~3가지. 왜 이 기준이 중요한지 설명. 280~320자.

(사진)

## (추천항목1)
특징, 장점, 단점, 가격대, 추천 대상 명시. 320~380자.

(사진)

## (추천항목2)
320~380자.

(사진)

## (추천항목3)
320~380자.

(사진)

## (추천항목4)
320~380자.

(사진)

## 유형별 최종 추천 요약
"예산이 적다면 ~, 성능이 중요하다면 ~" 식으로 타입별 요약. 200자 내외.

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  essay: `당신은 티스토리 개인 블로그 작가입니다.

[톤앤매너]
샘플1: "분명하게 말하지만, 이 글은 나태하게 살라는 말을 하려는 것은 아니다. 갓생이든 뭐든 무언가에 몰입하고 어제보다 나은 상태를 지향하는 행동은 인간을 인간답게 만드는 훌륭한 동력이다."
샘플2: "인생은 엑셀 시트가 아니다. 독서의 가치는 읽은 페이지 수가 아니라 그 안의 문장이 내 삶에 어떤 균열을 냈느냐에 있다."

- 1인칭. 자기 생각을 직설적으로 밀어붙임.
- 시니컬하되 히스테릭하지 않음. 냉소적이지만 설득력 있음.
- 구어체이되 문장력 있음. 억지 유머 금지. 마무리는 짧게 끊음.
- 현재 날짜/계절/시의성을 자연스럽게 반영.

[구조 - 반드시 이 순서 준수]

[목차]
1. (소제목1)
2. (소제목2)
3. (소제목3)

서론: 주제를 직설적으로 던지는 첫 문단. 150자 내외.

(사진)

## (소제목1)
280~350자.

(사진)

## (소제목2)
280~350자.

(사진)

## (소제목3)
280~350자.

(사진)

마무리: 짧고 강하게 끊음. 100자 이내.

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

  // 직접 입력
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
- 매번 새로운 도입부. 유사문서 절대 금지.

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

총 1500~1800자. 순수 텍스트만. 별표 샵 대시 등 마크다운 기호 절대 사용 금지.`,
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
  // name 속성으로 체크박스 선택 — 더 안정적
  const checkboxes = document.querySelectorAll('input[name="tistoryCategory"]:checked');
  const categories = Array.from(checkboxes).map(c => c.value);

  if (!categories.length) { showToast('카테고리를 선택해주세요'); return; }

  setLoading('tistoryLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('tistoryTopicCard').style.display = 'none';
  document.getElementById('tistoryResult').style.display = 'none';

  const seed = Math.floor(Math.random() * 10000);
  const ctx = getTodayContext();

  // 카테고리별로 몇 개씩 추천할지 계산
  const perCat = Math.ceil(5 / categories.length);

  // 각 카테고리별 지시사항 — 예시 포함하여 명확하게 구분
  const catInstructions = categories.map(c => {
    const cfg = TISTORY_CATEGORY_CONFIG[c];
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
- 합산 5개. 카테고리가 여러 개면 위 지시대로 배분.
- 현재 계절(${ctx.season})과 시의성 키워드를 반드시 반영.
- 각 카테고리의 예시 형태에서 절대 벗어나지 말 것.
- 카테고리를 섞지 말 것. 각 주제는 지정된 카테고리 형태여야 함.
- 각 주제 앞에 카테고리 태그 표시: [건강·증상], [음식·영양], [생활·절약], [추천·비교], [시사·이슈]

반드시 번호 목록으로만 출력:
1. [카테고리태그] 제목
2. [카테고리태그] 제목
3. [카테고리태그] 제목
4. [카테고리태그] 제목
5. [카테고리태그] 제목`,
      700
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
    '건강·증상': '#3ecfb2',
    '음식·영양': '#f5c842',
    '생활·절약': '#a78bfa',
    '추천·비교': '#5b7fff',
    '시사·이슈': '#ff6b8a'
  };

  topics.forEach((topic, i) => {
    const color = tagColors[topic.tag] || '#5b7fff';
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.innerHTML = `
      <div class="topic-num">${String(i+1).padStart(2,'0')}</div>
      <div style="flex:1">
        ${topic.tag
          ? `<div style="font-size:11px;color:${color};margin-bottom:3px;font-weight:600;font-family:'DM Mono',monospace">${topic.tag}</div>`
          : ''}
        <div class="topic-title">${topic.title}</div>
      </div>`;
    item.addEventListener('click', () => generateTistoryPost(topic.title, topic.tag, selectedCategories));
    list.appendChild(item);
  });

  // 직접 입력
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
  setLoading('tistoryLoading', true, '블로그 글을 작성 중입니다...');
  document.getElementById('tistoryResult').style.display = 'none';

  const ctx = getTodayContext();

  // 태그 → postStyle 매핑
  const tagToStyle = {
    '건강·증상': 'health',
    '음식·영양': 'health',
    '생활·절약': 'info',
    '추천·비교': 'recommend',
    '시사·이슈': 'essay'
  };

  let postStyle = 'info';
  if (tag && tagToStyle[tag]) {
    postStyle = tagToStyle[tag];
  } else if (selectedCategories && selectedCategories.length === 1) {
    postStyle = TISTORY_CATEGORY_CONFIG[selectedCategories[0]]?.postStyle || 'info';
  } else {
    // 주제 키워드로 자동 추론
    const lower = title.toLowerCase();
    if (['추천','비교','순위','고르는','vs'].some(k => lower.includes(k)))                            postStyle = 'recommend';
    else if (['증상','질환','건강','치료','예방','음식','영양','효능','다이어트','혈압','혈당','간','면역','비타민','먹으면'].some(k => lower.includes(k))) postStyle = 'health';
    else if (['방법','하는 법','팁','가이드','정리','총정리','절약','줄이는','이유','차이','종류'].some(k => lower.includes(k)))                          postStyle = 'info';
    else if (['왜','민낯','문제','현실','이슈','논란','솔직히'].some(k => lower.includes(k)))          postStyle = 'essay';
  }

  // Pexels 검색어
  const pexelsQueryMap = {
    health:    'healthy food nutrition wellness',
    info:      'living lifestyle home tips',
    recommend: 'product review comparison',
    essay:     'daily life society people'
  };

  try {
    const result = await callClaude(
      TISTORY_SYSTEM[postStyle],
      `오늘 날짜: ${ctx.dateStr} / 현재 계절: ${ctx.season} / 이달 시의성: ${ctx.monthlyKeywords}

다음 주제로 위 형식과 톤앤매너에 맞게 작성해주세요: ${title}

주의사항:
- 이 주제만 다룰 것. 주제와 무관한 내용 일절 금지.
- 현재 계절(${ctx.season})을 자연스럽게 반영할 것.
- 목차를 반드시 글 상단에 포함할 것.
- 총 분량 준수. 각 소제목 아래 내용이 충분히 채워져야 함.`,
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
