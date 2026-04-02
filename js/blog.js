// ===== blog.js =====

// ===== 티스토리 카테고리별 설정 =====
const TISTORY_CATEGORY_CONFIG = {
  social: {
    name: '사회 이슈',
    topicStyle: '사회 구조적 문제나 세태를 꼬집는 주제. "~의 민낯", "왜 우리는 ~하는가" 형태.',
    postStyle: 'essay'
  },
  news: {
    name: '화제 뉴스',
    topicStyle: '최근 화제가 될 만한 뉴스나 사건에 대한 개인 의견 주제.',
    postStyle: 'essay'
  },
  tip: {
    name: '생활 팁',
    topicStyle: '"~하는 법", "~할 때 이렇게 해라", "~추천" 형태의 실용적 주제.',
    postStyle: 'info'
  },
  common: {
    name: '상식',
    topicStyle: '"~의 진짜 이유", "알고 보면 ~", "~에 대한 오해" 형태의 지식 주제.',
    postStyle: 'info'
  },
  review: {
    name: '리뷰·경험담',
    topicStyle: '직접 써본/가본/경험한 것에 대한 솔직한 리뷰 주제.',
    postStyle: 'review'
  }
};

const TISTORY_SYSTEM = {
  essay: `당신은 티스토리 개인 블로그 작가입니다.

[톤앤매너 - 에세이형]
샘플1: "분명하게 말하지만, 이 글은 나태하게 살라는 말을 하려는 것은 아니다. 갓생이든 뭐든 무언가에 몰입하고 어제보다 나은 상태를 지향하는 행동은 인간을 인간답게 만드는 훌륭한 동력이고 분명 사람을 더 발전하게 만든다."
샘플2: "인생은 엑셀 시트가 아니다. 독서의 가치는 읽은 페이지 수가 아니라 그 안의 문장이 내 삶에 어떤 균열을 냈느냐에 있다."

- 1인칭. 자기 생각을 직설적으로 밀어붙임
- 시니컬하되 히스테릭하지 않음. 냉소적이지만 설득력 있음
- 구어체이되 문장력 있음. 비유가 구체적이고 날카로움
- 억지 유머 금지. 마무리는 짧게 끊음.

[형식]
- 소제목은 ## 형식으로 3~4개
- 사진 위치마다 (사진) 표시
- 총 1300~1600자
- ## 소제목 외 마크다운 기호 일절 금지`,

  info: `당신은 티스토리 개인 블로그 작가입니다.

[원칙]
- 주어진 주제에서 절대 이탈하지 않는다. 글 전체가 해당 주제만 다룬다.
- 서론에서 주제를 명확히 제시하고, 본론에서 실질적 정보를 제공하고, 결론에서 핵심을 정리한다.

[톤앤매너 - 정보형]
샘플: "나는 주택에 산다. 수도관이 얼어 버려서 집에 물이 안나온다. 해결하려고 이것저것 찾아봤는데, 결론만 말하면 세 가지다."

- 1인칭. 직접 경험하거나 직접 찾아본 사람처럼 씀
- 시니컬한 구어체이되, 정보는 명확하고 구체적으로
- "~카더라"가 아니라 "~다", "~해라" 식으로 단언
- 쓸데없는 감상이나 주제 이탈 금지. 정보 밀도 높게.
- 마무리는 핵심 한 줄 요약으로 끊음.

[형식]
- 서론(주제 제시, 150자 내외) → ## 소제목 본론 3~5개 → 결론(핵심 요약, 100자 내외)
- 각 본론 소제목 아래 실질적 내용 250~350자
- 사진 위치마다 (사진) 표시
- 총 1500~1800자
- ## 소제목 외 마크다운 기호 일절 금지`,

  review: `당신은 티스토리 개인 블로그 작가입니다.

[원칙]
- 주어진 주제(리뷰 대상)에서 절대 이탈하지 않는다.
- 리뷰 대상의 장단점을 구체적으로 다룬다. 추상적인 감상 금지.

[톤앤매너 - 리뷰형]
- 1인칭. 직접 써본/가본/경험한 사람의 시점
- 좋으면 좋다, 나쁘면 나쁘다. 광고 같은 말투 금지.
- 구체적인 수치, 비교, 상황 묘사 포함
- 결론에서 "이런 사람에게 추천/비추천" 명시

[형식]
- 서론(첫인상/구매 계기, 150자 내외) → ## 소제목 본론 3~4개(각 항목 리뷰) → 결론(총평 + 추천 대상)
- 각 본론 소제목 아래 250~350자
- 사진 위치마다 (사진) 표시
- 총 1400~1700자
- ## 소제목 외 마크다운 기호 일절 금지`
};


// ===== 정신건강의학과 블로그 =====

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
  } catch(e) { showToast('오류: ' + e.message); }
  finally { setLoading('psychLoading', false); }
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
  const directItem = document.createElement('div');
  directItem.className = 'topic-item';
  directItem.style.borderStyle = 'dashed';
  directItem.innerHTML = `<div class="topic-num">✏️</div><div style="display:flex;gap:8px;align-items:center;width:100%"><input type="text" id="psychDirectInput" placeholder="주제 직접 입력..." style="flex:1;background:#0d0d0f;border:1px solid #3a3a45;border-radius:6px;padding:7px 10px;color:#e8e8f0;font-size:13px;font-family:inherit;outline:none" onkeydown="if(event.key==='Enter'){const v=this.value.trim();if(v)generatePsychPost(v);}"/><button class="btn-sm btn-accent" onclick="const v=document.getElementById('psychDirectInput').value.trim();if(v)generatePsychPost(v);">생성</button></div>`;
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
    document.getElementById('psychImages').style.display = 'block';
    const imgList = document.getElementById('psychImageList');
    imgList.innerHTML = '<div style="color:#7a7a8c;font-size:12px">이미지 검색 중...</div>';
    try {
      const images = await searchPexels('mental health therapy calm', 5);
      if (images.length) {
        imgList.innerHTML = images.map((img, i) =>
          `<div class="image-link-item"><span style="color:#4a4a5a;font-size:11px;min-width:20px">${i+1}</span><a href="${img.src}" target="_blank">${img.src}</a><button class="btn-sm" onclick="navigator.clipboard.writeText('${img.src}').then(()=>showToast('복사됨!'))">복사</button></div>`
        ).join('');
      } else {
        imgList.innerHTML = '<div style="color:#7a7a8c;font-size:12px">Pexels API 키 설정 시 이미지 링크 표시</div>';
      }
    } catch(e) { imgList.innerHTML = ''; }
    document.getElementById('psychResult').style.display = 'block';
  } catch(e) { showToast('오류: ' + e.message); }
  finally { setLoading('psychLoading', false); }
}


// ===== 티스토리 블로그 =====

async function recommendTistoryTopics() {
  const checkboxes = document.querySelectorAll('#tab-tistory .checkbox-group input:checked');
  const categories = Array.from(checkboxes).map(c => c.value);
  if (!categories.length) { showToast('카테고리를 선택해주세요'); return; }

  setLoading('tistoryLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('tistoryTopicCard').style.display = 'none';
  document.getElementById('tistoryResult').style.display = 'none';

  const seed = Math.floor(Math.random() * 10000);

  const catInstructions = categories.map(c => {
    const cfg = TISTORY_CATEGORY_CONFIG[c];
    return `[${cfg.name}] ${cfg.topicStyle}`;
  }).join('\n');

  try {
    const result = await callClaude(
      '당신은 티스토리 블로그 주제 기획자입니다.',
      `요청번호: ${seed}
선택된 카테고리와 주제 방향:
${catInstructions}

위 카테고리에 어울리는 주제를 합산 5개 추천. 카테고리가 여러 개면 고르게 배분.
각 주제 앞에 카테고리 태그를 붙임: [생활팁] 제목 형식.
반드시 번호 목록으로만:
1. [카테고리] 제목
2. [카테고리] 제목
3. [카테고리] 제목
4. [카테고리] 제목
5. [카테고리] 제목`,
      500
    );

    const lines = result.trim().split('\n').filter(l => l.match(/^\d+\./));
    const topics = lines.map(l => {
      const text = l.replace(/^\d+\.\s*/, '').trim();
      const tagMatch = text.match(/^\[(.+?)\]\s*(.+)/);
      if (tagMatch) return { tag: tagMatch[1], title: tagMatch[2].trim() };
      return { tag: '', title: text };
    });

    renderTistoryTopics(topics, categories);
  } catch(e) { showToast('오류: ' + e.message); }
  finally { setLoading('tistoryLoading', false); }
}

function renderTistoryTopics(topics, selectedCategories) {
  const list = document.getElementById('tistoryTopicList');
  list.innerHTML = '';

  topics.forEach((topic, i) => {
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.innerHTML = `
      <div class="topic-num">${String(i+1).padStart(2,'0')}</div>
      <div>
        ${topic.tag ? `<div style="font-size:11px;color:#6a6a8a;margin-bottom:3px">${topic.tag}</div>` : ''}
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
      <input type="text" id="tistoryDirectInput"
        placeholder="주제 직접 입력..."
        style="flex:1;background:#0d0d0f;border:1px solid #3a3a45;border-radius:6px;padding:7px 10px;color:#e8e8f0;font-size:13px;font-family:inherit;outline:none"
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

  // 카테고리 태그 → postStyle 매핑
  const catMap = {
    '사회 이슈': 'social',
    '화제 뉴스': 'news',
    '생활 팁': 'tip',
    '상식': 'common',
    '리뷰·경험담': 'review'
  };

  let postStyle = 'essay'; // 기본값

  if (tag && catMap[tag]) {
    postStyle = TISTORY_CATEGORY_CONFIG[catMap[tag]].postStyle;
  } else if (selectedCategories && selectedCategories.length === 1) {
    postStyle = TISTORY_CATEGORY_CONFIG[selectedCategories[0]]?.postStyle || 'essay';
  } else {
    // 주제 직접 입력 시 키워드로 스타일 자동 추론
    const infoKeywords = ['방법', '추천', '하는 법', '팁', 'tip', '가이드', '정리', '총정리', '순위', '비교', '알아보기', '이유', '차이', '종류'];
    const reviewKeywords = ['리뷰', '후기', '사용기', '경험', '다녀온', '써본', '먹어본', '가본'];
    const lowerTitle = title.toLowerCase();
    if (reviewKeywords.some(k => lowerTitle.includes(k))) postStyle = 'review';
    else if (infoKeywords.some(k => lowerTitle.includes(k))) postStyle = 'info';
    else postStyle = 'essay';
  }

  try {
    const result = await callClaude(
      TISTORY_SYSTEM[postStyle],
      `다음 주제로 위 형식과 톤앤매너에 맞게 작성해주세요: ${title}

주의: 이 주제만 다룰 것. 주제와 무관한 내용 일절 금지.`,
      2500
    );

    document.getElementById('tistoryTitleBox').textContent = title;
    document.getElementById('tistoryOutput').textContent = result;
    document.getElementById('tistoryResult').style.display = 'block';
  } catch(e) { showToast('오류: ' + e.message); }
  finally { setLoading('tistoryLoading', false); }
}
