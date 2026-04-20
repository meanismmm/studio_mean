// ===== blog.js =====

// ===== 티스토리 카테고리 =====
const TISTORY_CAT = {
  health:    { name:'건강·의료',   pStyle:'health',    pexels:'healthcare medical wellness' },
  money:     { name:'금융·재테크', pStyle:'info',      pexels:'finance money investment' },
  law:       { name:'법률·행정',   pStyle:'info',      pexels:'law legal documents' },
  it:        { name:'IT·디지털',   pStyle:'info',      pexels:'technology digital gadget' },
  living:    { name:'생활·절약',   pStyle:'info',      pexels:'living lifestyle home' },
  food:      { name:'음식·영양',   pStyle:'health',    pexels:'food nutrition healthy' },
  travel:    { name:'여행·지역',   pStyle:'info',      pexels:'travel destination tourism' },
  parenting: { name:'육아·교육',   pStyle:'info',      pexels:'parenting child education' },
  beauty:    { name:'뷰티·패션',   pStyle:'recommend', pexels:'beauty skincare fashion' },
  recommend: { name:'추천·비교',   pStyle:'recommend', pexels:'product review comparison' },
  issue:     { name:'시사·이슈',   pStyle:'essay',     pexels:'news society people' },
  pet:       { name:'반려동물',    pStyle:'info',      pexels:'pet dog cat animal' },
};

// 카테고리별 주제 각도 가이드 (다양성 확보)
const TISTORY_ANGLE_GUIDE = {
  health:    '증상·원인·치료·예방·오해와진실·비교·체크리스트 등 다양한 각도',
  money:     '절세·재테크·보험·대출·투자·절약·정부지원금 등 다양한 각도',
  law:       '생활법률·행정절차·분쟁해결·권리찾기·계약·신고방법 등 다양한 각도',
  it:        '앱추천·기기비교·설정법·보안·AI활용·오류해결 등 다양한 각도',
  living:    '절약팁·공공서비스·생활정보·수리·청소·정리정돈 등 다양한 각도',
  food:      '영양정보·레시피·식품오해·다이어트·건강식·카페인 등 다양한 각도',
  travel:    '국내여행지·교통·숙소·할인·여행준비·지역특산 등 다양한 각도',
  parenting: '발달·교육·훈육·육아용품·어린이건강·입시 등 다양한 각도',
  beauty:    '성분분석·루틴·가성비제품·피부타입별·남성뷰티 등 다양한 각도',
  recommend: '가전·생활용품·앱·서비스·식품·의류 등 다양한 카테고리 비교',
  issue:     '정책변화·사회현상·경제이슈·생활밀착이슈 등 다양한 각도',
  pet:       '건강·용품·훈련·먹이·질병·품종정보 등 다양한 각도',
};

const TISTORY_SYSTEM = {
  health: `당신은 건강·음식 정보 티스토리 블로그 작가입니다.

[절대 금지]
- "충분한 수분 섭취", "규칙적인 운동" 같은 뻔한 조언
- 수치만 나열하고 이유 안 쓰는 것 (왜 그 수치인지 메커니즘까지 필수)
- 다른 블로그 10개에서 똑같이 나오는 일반론

[반드시 포함]
- "흔히 알려진 것과 달리~" 식의 반박 포인트 최소 1개
- 수치의 메커니즘 설명

[톤앤매너]
1인칭. "이게 궁금해서 직접 찾아봤는데" 식의 친근한 구어체. 단언체. 공포 조장 금지.

[구조]
[목차] 1~5개 소제목
서론 180~220자 (사진)
## 소제목별 320~400자 (사진)
[정리] 핵심 3줄

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  info: `당신은 생활·정보 티스토리 블로그 작가입니다.

[절대 금지]
- 인터넷에서 복붙되는 팁 목록 나열
- 이유 없는 방법 나열 (원리 필수)

[반드시 포함]
- 역발상 또는 "대부분이 잘못 알고 있는 것" 시각 최소 1개
- 비용/시간의 현실적 계산

[톤앤매너]
1인칭. 직접 해보거나 찾아본 사람처럼. 단언체. 시니컬한 구어체이되 정보 밀도 높게.

[구조]
[목차] 1~5개 소제목
서론 180~220자 (사진)
## 소제목별 320~400자 (사진)
[한 줄 정리]

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  recommend: `당신은 추천·비교 콘텐츠 티스토리 블로그 작가입니다.

[절대 금지]
- "가성비 최고", "강력 추천" 같은 광고성 표현
- 단점 없는 추천

[반드시 포함]
- 각 항목의 단점과 "이런 사람에게는 안 맞다" 명시
- 구체적 가격대

[톤앤매너] 1인칭. 직접 써봤거나 꼼꼼히 비교해본 사람의 시점. 단언체.

[구조]
[목차]
1. 고르기 전에 알아야 할 핵심 기준
2~5. (추천항목별)
6. 유형별 최종 추천 요약

각 항목 320~380자. 특징·장단점·가격대·추천 대상 명시.
총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  essay: `당신은 티스토리 개인 블로그 작가입니다.

[톤앤매너 샘플]
"분명하게 말하지만, 이 글은 나태하게 살라는 말을 하려는 것은 아니다. 갓생이든 뭐든 무언가에 몰입하고 어제보다 나은 상태를 지향하는 행동은 인간을 인간답게 만드는 훌륭한 동력이다."

1인칭. 자기 생각을 직설적으로 밀어붙임. 시니컬하되 히스테릭하지 않음. 억지 유머 금지. 마무리는 짧게 끊음.

[구조] [목차] 1~3개 소제목
서론 150자 내외 → ## 소제목별 280~350자 → 마무리 100자 이내
총 1500~2000자. ## 소제목 외 마크다운 기호 일절 금지.`
};

// ==================== 티스토리 ====================

async function recommendTistoryTopics() {
  const cat     = document.getElementById('tistoryCategory').value || 'health';
  const catInfo = TISTORY_CAT[cat];
  const angles  = TISTORY_ANGLE_GUIDE[cat] || '다양한 각도';
  const saved   = JSON.parse(localStorage.getItem(`tistory_used_${cat}`) || '[]');
  const seed    = Math.floor(Math.random() * 10000);
  const ctx     = getTodayContext();

  setLoading('_global', true, '주제를 추천하고 있습니다...');
  document.getElementById('tistoryTopicCard').style.display = 'none';
  document.getElementById('tistoryResult').style.display    = 'none';

  try {
    const result = await callClaude(
      '당신은 티스토리 애드센스 블로그 주제 기획 전문가입니다.',
      `오늘: ${ctx.dateStr} / 요청번호: ${seed}

카테고리: ${catInfo.name}
제외 주제 (절대 포함 금지): ${saved.length ? saved.join(', ') : '없음'}

[핵심 지시 — 다양성 필수]
- 5개 주제가 서로 완전히 다른 각도여야 한다
- 추천 각도 예시: ${angles}
- 계절/시즌 주제는 5개 중 최대 1개만 허용. 나머지는 계절과 무관한 상시 검색 키워드로
- 매 요청마다 완전히 새로운 주제. 이전과 비슷한 주제 금지.
- 네이버 파워링크가 붙을 만한 상업적 가치 있는 키워드
- 연중 검색되는 "상록 키워드" 위주로 선정
- 제목 형태: "~하는 방법", "~추천", "~주의사항", "~총정리", "~원인과 해결법", "~차이점", "~비용", "~기간" 중 다양하게 택

반드시 번호 목록으로만:
1. 제목1
2. 제목2
3. 제목3
4. 제목4
5. 제목5`, 600
    );

    const topics = result.trim().split('\n')
      .filter(l => l.match(/^\d+\./))
      .map(l => l.replace(/^\d+\.\s*/, '').trim());

    localStorage.setItem(`tistory_used_${cat}`,
      JSON.stringify([...new Set([...saved, ...topics])].slice(-100)));

    renderTistoryTopics(topics, cat);
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('_global', false);
  }
}

function renderTistoryTopics(topics, cat) {
  const list = document.getElementById('tistoryTopicList');
  list.innerHTML = '';

  topics.forEach((title, i) => {
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.innerHTML = `<div class="topic-num">${String(i+1).padStart(2,'0')}</div><div><div class="topic-title">${title}</div></div>`;
    item.addEventListener('click', () => generateTistoryPost(title, cat));
    list.appendChild(item);
  });

  const d = document.createElement('div');
  d.className = 'topic-item';
  d.style.borderStyle = 'dashed';
  d.innerHTML = `
    <div class="topic-num">✏️</div>
    <div style="display:flex;gap:8px;align-items:center;width:100%">
      <input type="text" id="tistoryDirectInput" placeholder="주제 직접 입력..."
        style="flex:1;background:var(--bg-input);border:1.5px solid var(--border);border-radius:var(--rs);padding:10px 12px;color:var(--t1);font-size:16px;font-family:inherit;outline:none"
        onkeydown="if(event.key==='Enter'){const v=this.value.trim();if(v)generateTistoryPost(v,'${cat}');}"/>
      <button class="btn-sm btn-accent" onclick="const v=document.getElementById('tistoryDirectInput').value.trim();if(v)generateTistoryPost(v,'${cat}');">생성</button>
    </div>`;
  list.appendChild(d);
  document.getElementById('tistoryTopicCard').style.display = 'block';
}

async function generateTistoryPost(title, cat) {
  const catInfo   = TISTORY_CAT[cat] || TISTORY_CAT.living;
  const postStyle = catInfo.pStyle;
  const ctx       = getTodayContext();

  setLoading('_global', true, '블로그 글을 작성 중...');
  document.getElementById('tistoryResult').style.display = 'none';

  try {
    const result = await callClaude(
      TISTORY_SYSTEM[postStyle],
      `오늘: ${ctx.dateStr}

키워드: "${title}"

[SEO 지시]
- 제목에 키워드 "${title}" 반드시 포함
- 첫 문단에 키워드 자연스럽게 포함
- 소제목에 키워드 변형 표현 포함
- 목차를 반드시 글 상단에 포함
- 인터넷에 이미 있는 뻔한 표현과 구조 반복 금지
- 총 분량 준수`, 3500
    );

    document.getElementById('tistoryTitleBox').textContent = title;
    document.getElementById('tistoryOutput').textContent   = result;
    await renderPexelsImages(catInfo.pexels, 'tistoryImageList', 'tistoryImages');
    document.getElementById('tistoryResult').style.display = 'block';
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('_global', false);
  }
}

// ==================== 정신과 블로그 ====================

// 정신과 주제 각도 가이드
const PSYCH_ANGLE_GUIDE = [
  '증상 인식·자가진단', '오해와 진실', '치료 방법·과정',
  '일상 회복', '가족·주변인 대처법', '직장·학교 스트레스',
  '관계 문제', '수면 장애', '공황·불안', '우울증 유형별',
  '약물치료 궁금증', '청소년 정신건강', '노인 정신건강',
  '계절성 감정 변화', '번아웃·과로'
];

async function recommendPsychTopics() {
  const excludeEl = document.getElementById('psychExclude');
  const manual    = excludeEl.value.trim().split('\n').filter(Boolean);
  const saved     = JSON.parse(localStorage.getItem('psych_used_topics') || '[]');
  const exclude   = [...new Set([...manual, ...saved])];
  const seed      = Math.floor(Math.random() * 10000);
  // 매번 다른 각도 힌트 3개를 랜덤 선택
  const angleHints = [...PSYCH_ANGLE_GUIDE]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .join(', ');

  setLoading('_global', true, '주제를 추천하고 있습니다...');
  document.getElementById('psychTopicCard').style.display = 'none';
  document.getElementById('psychResult').style.display    = 'none';

  try {
    const result = await callClaude(
      '당신은 정신건강의학과 블로그 주제 기획 전문가입니다.',
      `오늘: ${new Date().toLocaleDateString('ko-KR')} / 번호: ${seed}

인천 가로수 정신건강의학과 네이버 블로그 포스팅 주제 5개 추천.
제외 주제 (절대 포함 금지): ${exclude.length ? exclude.join(', ') : '없음'}

[핵심 지시 — 다양성 필수]
- 5개 주제가 서로 완전히 다른 질환·각도여야 한다
- 이번 추천에서 특히 고려할 각도 힌트: ${angleHints}
- 의원급 진료 가능한 질환 위주
- 네이버 검색량이 충분한 주제
- 계절성 주제는 5개 중 최대 1개만 허용
- 매 요청마다 새로운 조합. 이전 주제와 겹치지 않게.

반드시 번호 목록으로만:
1. 제목1
2. 제목2
3. 제목3
4. 제목4
5. 제목5`, 500
    );

    const topics = result.trim().split('\n')
      .filter(l => l.match(/^\d+\./))
      .map(l => l.replace(/^\d+\.\s*/, '').trim());

    localStorage.setItem('psych_used_topics',
      JSON.stringify([...new Set([...saved, ...topics])].slice(-100)));
    renderPsychTopics(topics);
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('_global', false);
  }
}

function renderPsychTopics(topics) {
  const list = document.getElementById('psychTopicList');
  list.innerHTML = '';

  topics.forEach((title, i) => {
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.innerHTML = `<div class="topic-num">${String(i+1).padStart(2,'0')}</div><div><div class="topic-title">${title}</div></div>`;
    item.addEventListener('click', () => generatePsychPost(title));
    list.appendChild(item);
  });

  const d = document.createElement('div');
  d.className = 'topic-item';
  d.style.borderStyle = 'dashed';
  d.innerHTML = `
    <div class="topic-num">✏️</div>
    <div style="display:flex;gap:8px;align-items:center;width:100%">
      <input type="text" id="psychDirectInput" placeholder="주제 직접 입력..."
        style="flex:1;background:var(--bg-input);border:1.5px solid var(--border);border-radius:var(--rs);padding:10px 12px;color:var(--t1);font-size:16px;font-family:inherit;outline:none"
        onkeydown="if(event.key==='Enter'){const v=this.value.trim();if(v)generatePsychPost(v);}"/>
      <button class="btn-sm btn-accent" onclick="const v=document.getElementById('psychDirectInput').value.trim();if(v)generatePsychPost(v);">생성</button>
    </div>`;
  list.appendChild(d);
  document.getElementById('psychTopicCard').style.display = 'block';
}

async function generatePsychPost(title) {
  setLoading('_global', true, '블로그 글을 작성 중입니다...');
  document.getElementById('psychResult').style.display = 'none';

  try {
    const result = await callClaude(
      `당신은 인천 가로수 정신건강의학과(이성철 원장) 네이버 블로그 작가입니다.

[톤앤매너]
샘플: "매달 약국에서 가장 꾸준히 팔리는 약을 하나만 꼽으라고 한다면 단연 생리통 진통제가 아닐까 합니다. 많은 여성이 다가올 육체적 통증에 대비해 약을 상비하지만, 생리 시작 전 찾아오는 '감정의 통증' 앞에서는 아무런 대응도 하지 못한 채 속수무책의 상황에 빠지곤 하지요."

따뜻하고 공감적인 의사 어투. ~합니다/~지요/~이지요 체.
환자 감정 공감 먼저, 의학 정보 자연스럽게 연결.
소제목 없음. 구분점 없음. 번호 없음. 마크다운 없음. 별표 없음.
수필처럼 문단이 자연스럽게 이어지는 완성된 글.
비유와 은유 풍부하게. 전문용어는 쉽게 풀어서.
매번 새로운 도입부. 인터넷에 이미 있는 글과 같은 도입부 절대 금지.

[문단 구성 - 순수 텍스트만]
제목 (SEO 최적화, 인천 가로수 정신건강의학과 포함)
서두: 주제 소개 1~2문장
(지도)
1문단: 환자 공감 도입. 200~250자 (사진)
2문단: 질환/증상 설명. 비유 활용. 200~250자 (사진)
3문단: 원인 또는 오해와 진실. 200~250자 (사진)
4문단: 방치 시 위험성 또는 치료 필요성. 200~250자 (사진)
5문단: 치료 방법과 회복 가능성. 희망적으로. 200~250자 (사진)
---
맺음말: 따뜻한 마무리 2~3문장. 병원 방문 권유.
인천 가로수 정신건강의학과 이성철 원장

총 1500~1800자. 마크다운 기호 절대 금지.`,
      `다음 주제로 작성해주세요: ${title}`, 2500
    );

    const cleaned = result
      .replace(/\*\*(.*?)\*\*/g,'$1').replace(/\*(.*?)\*/g,'$1')
      .replace(/^#+\s*/gm,'').replace(/^-\s+/gm,'')
      .replace(/^\d+\.\s+/gm,'').replace(/`(.*?)`/g,'$1').trim();

    document.getElementById('psychTitleBox').textContent = title;
    document.getElementById('psychOutput').textContent   = cleaned;
    await renderPexelsImages('mental health therapy calm', 'psychImageList', 'psychImages');
    document.getElementById('psychResult').style.display = 'block';
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('_global', false);
  }
}
