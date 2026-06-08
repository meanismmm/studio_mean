// ===== blog.js — 정신과 블로그 + 티스토리 =====

// ======= 정신과 블로그 =======

const PSYCH_AGE_HINTS = {
  '10대 청소년':    '학업·친구관계·진로 스트레스, 부모에게 말 못하는 감정, 정체성 혼란',
  '20~30대 청년':  '직장·연애·독립·SNS 비교, 번아웃, 사회적 불안, 자기 의심',
  '40~50대 중장년': '직장 스트레스·자녀 독립·갱년기·빈 둥지 증후군·노부모 돌봄',
  '60대 이상 노년': '은퇴·배우자 상실·고립감·신체 질환 동반 우울·치매와의 감별',
  '전체 연령':      '연령을 가리지 않는 공통 경험과 공감대 위주',
};

const PSYCH_READER_HINTS = {
  '환자 본인':        '증상 인식·치료 동기·일상 회복·자기이해·병원 방문 결정 등 1인칭 공감 중심',
  '보호자(가족·지인)': '증상 발견·대화법·도움 방법·가족 소진 예방·병원 안내·거부감 다루기 등',
};

async function recommendPsychTopics() {
  // 질환 선택
  const diseaseChecks = document.querySelectorAll('input[name="psychDisease"]:checked');
  const diseases = Array.from(diseaseChecks).map(c => c.value);
  const diseaseStr = diseases.length ? diseases.join('·') : '전체(제한 없음)';

  // 연령대
  const ageEl = document.querySelector('input[name="psychAge"]:checked');
  const ageGroup = ageEl ? ageEl.value : '전체 연령';

  // 독자 유형
  const readerEl = document.querySelector('input[name="psychReader"]:checked');
  const readerType = readerEl ? readerEl.value : '환자 본인';

  const ageHint    = PSYCH_AGE_HINTS[ageGroup]    || '';
  const readerHint = PSYCH_READER_HINTS[readerType] || '';

  setLoading('psychLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('psychTopicCard').style.display = 'none';
  document.getElementById('psychResult').style.display = 'none';

  try {
    const result = await callClaude(
      '당신은 정신건강의학과 블로그 주제 기획 전문가입니다. 반드시 순수 JSON만 반환하세요.',
      `인천 가로수 정신건강의학과(이성철 원장) 네이버 블로그에 올릴 포스팅 주제를 5개 추천해주세요.

[독자 조건 — 반드시 반영]
- 대상 질환: ${diseaseStr}
- 독자 연령대: ${ageGroup} → ${ageHint}
- 독자 유형: ${readerType} → ${readerHint}

[핵심 지시]
- 5개 주제 모두 위 독자 조건에 맞는 관점·어휘로 제목 작성
- 5개 주제가 서로 다른 각도여야 한다 (증상·치료·오해·일상회복·주변인 대처 등 분산)
- 의원급 진료 가능한 질환 범위 내
- 네이버 검색량이 충분한 주제
- 매 요청마다 새로운 조합

JSON 형식:
{
  "topics": [
    {
      "title": "블로그 포스팅 제목 (SEO 최적화, 인천 가로수 정신건강의학과 포함)",
      "disease": "다루는 질환/증상",
      "angle": "이 글의 접근 각도 (예: 오해와 진실, 치료 방법, 증상 소개)",
      "summary": "글 요약 (2문장)",
      "searchKeyword": "주요 검색 키워드"
    }
  ]
}`,
      800
    );

    const clean = result.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    renderPsychTopics(data.topics);
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('psychLoading', false);
  }
}

function renderPsychTopics(topics) {
  const list = document.getElementById('psychTopicList');
  list.innerHTML = '';
  topics.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.innerHTML = `
      <div class="topic-num">${String(i+1).padStart(2,'0')}</div>
      <div>
        <div class="topic-title">${t.title}</div>
        <div class="topic-desc">${t.disease} · ${t.angle}</div>
        <div class="topic-desc" style="margin-top:2px">${t.summary}</div>
      </div>
    `;
    item.addEventListener('click', () => generatePsychPost(t));
    list.appendChild(item);
  });
  document.getElementById('psychTopicCard').style.display = 'block';
}

async function generatePsychPost(topic) {
  setLoading('psychLoading', true, '블로그 글을 작성 중입니다...');
  document.getElementById('psychResult').style.display = 'none';

  const PSYCH_SYSTEM = `당신은 인천 가로수 정신건강의학과(이성철 원장)의 네이버 블로그 작가입니다.

[글쓰기 원칙]
- 따뜻하고 공감적인 의사 어투
- 환자의 감정에 먼저 공감한 뒤 의학 정보 제공
- 어렵지 않은 언어로, 하지만 전문성이 느껴지게
- 매번 새로운 도입부와 비유를 사용 (유사문서 절대 금지)
- 네이버 블로그 SEO 최적화 (제목에 키워드, 지역명 포함)

[포맷]
- 소개 문단 (감성적 도입)
- (사진) 표시
- 본문 단락들 (각 단락 후 (사진) 표시)
- 마무리 문단 (희망과 치료 권유)
- 서명: "인천 가로수 정신건강의학과 이성철 원장"

반드시 순수 JSON만 반환하세요.`;

  try {
    const result = await callClaude(
      PSYCH_SYSTEM,
      `다음 주제로 네이버 블로그 포스팅을 작성해주세요:

제목: ${topic.title}
질환/증상: ${topic.disease}
접근 각도: ${topic.angle}
핵심 메시지: ${topic.summary}
검색 키워드: ${topic.searchKeyword}

JSON 형식:
{
  "title": "최종 블로그 제목",
  "intro": "소개 문단 (감성적 도입, 100자 이상)",
  "sections": [
    {
      "heading": "소제목 (【 】 형식 사용)",
      "content": "본문 (200자 이상, 전문적이되 공감적으로)"
    }
  ],
  "closing": "마무리 문단 (치료 권유, 희망적 메시지, 80자 이상)",
  "pexelsQuery": "이미지 검색 영문 키워드 (예: mental health therapy)"
}`,
      2000
    );

    const clean = result.replace(/```json|```/g, '').trim();
    const post = JSON.parse(clean);
    await renderPsychPost(post);
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('psychLoading', false);
  }
}

async function renderPsychPost(post) {
  // 제목
  document.getElementById('psychTitleBox').textContent = post.title;

  // 본문 조합
  let content = post.intro + '\n\n(사진)\n\n';
  (post.sections || []).forEach(s => {
    content += `${s.heading}\n\n${s.content}\n\n(사진)\n\n`;
  });
  content += post.closing + '\n\n---\n\n인천 가로수 정신건강의학과 이성철 원장';
  document.getElementById('psychOutput').textContent = content;

  // Pexels 이미지 검색
  const imgList = document.getElementById('psychImageList');
  imgList.innerHTML = '<div style="color:#7a7a8c;font-size:12px">이미지 검색 중...</div>';
  document.getElementById('psychImages').style.display = 'block';

  try {
    const images = await searchPexels(post.pexelsQuery || 'mental health', 5);
    if (images.length) {
      imgList.innerHTML = images.map((img, i) =>
        `<div class="image-link-item">
          <span style="color:#4a4a5a;font-size:11px;min-width:20px">${i+1}</span>
          <a href="${img.src}" target="_blank">${img.src}</a>
          <button class="btn-sm" onclick="navigator.clipboard.writeText('${img.src}').then(()=>showToast('복사됨!'))">복사</button>
        </div>`
      ).join('');
    } else {
      imgList.innerHTML = '<div style="color:#7a7a8c;font-size:12px">Pexels API 키를 설정하면 이미지 링크가 표시됩니다</div>';
    }
  } catch(e) {
    imgList.innerHTML = '<div style="color:#7a7a8c;font-size:12px">이미지 검색 실패</div>';
  }

  document.getElementById('psychResult').style.display = 'block';
}

// ======= 티스토리 블로그 =======

async function recommendTistoryTopics() {
  const checkboxes = document.querySelectorAll('#tab-tistory .checkbox-group input:checked');
  const categories = Array.from(checkboxes).map(c => c.value);
  if (!categories.length) { showToast('카테고리를 선택해주세요'); return; }

  setLoading('tistoryLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('tistoryTopicCard').style.display = 'none';
  document.getElementById('tistoryResult').style.display = 'none';

  const catMap = { social:'사회 이슈', news:'화제 뉴스', tip:'생활 팁', common:'상식', review:'리뷰·경험담' };
  const catNames = categories.map(c => catMap[c] || c).join(', ');

  try {
    const result = await callClaude(
      '당신은 티스토리 개인 블로그 주제 기획자입니다. 반드시 순수 JSON만 반환하세요.',
      `카테고리: ${catNames}

개인 블로그 포스팅 주제 5개를 추천해주세요.
- 요즘 사람들이 관심 가질 만한 주제
- 1인칭 개인 경험담이나 솔직한 의견을 녹일 수 있는 주제
- 가볍게 웃으면서 읽을 수 있거나, 공감되는 주제

JSON 형식:
{
  "topics": [
    {
      "title": "포스팅 제목",
      "category": "카테고리",
      "angle": "글의 접근 각도 (예: 직접 경험담, 비교 분석, 논평)",
      "hook": "첫 문장 (독자를 잡아끄는 한 문장)"
    }
  ]
}`,
      600
    );

    const clean = result.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    renderTistoryTopics(data.topics);
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('tistoryLoading', false);
  }
}

function renderTistoryTopics(topics) {
  const list = document.getElementById('tistoryTopicList');
  list.innerHTML = '';
  topics.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.innerHTML = `
      <div class="topic-num">${String(i+1).padStart(2,'0')}</div>
      <div>
        <div class="topic-title">${t.title}</div>
        <div class="topic-desc">${t.category} · ${t.angle}</div>
        <div class="topic-desc" style="margin-top:2px;font-style:italic">"${t.hook}"</div>
      </div>
    `;
    item.addEventListener('click', () => generateTistoryPost(t));
    list.appendChild(item);
  });
  document.getElementById('tistoryTopicCard').style.display = 'block';
}

async function generateTistoryPost(topic) {
  setLoading('tistoryLoading', true, '블로그 글을 작성 중입니다...');
  document.getElementById('tistoryResult').style.display = 'none';

  const TISTORY_SYSTEM = `당신은 티스토리 개인 블로그 작가입니다.

[글쓰기 스타일 - 매우 중요]
- 1인칭 시점, 솔직하고 직설적인 어투
- 유머와 자기비하적 표현을 자연스럽게 섞음
- 구어체 사용 (예: ~이다, ~한다, ~이라고, 뭐 그렇다)
- 경험담이나 개인 의견을 강하게 드러냄
- 비유와 은유를 창의적으로 활용
- 새로운 표현, 새로운 도입부 사용 (유사문서 절대 금지)

[포맷]
- 도입 (강렬한 첫 문장)
- 소제목들 (##)
- (사진) 표시 중간중간
- 마무리 (짧고 인상적으로, "끝이다" 류 마무리 가능)

반드시 순수 JSON만 반환하세요.`;

  try {
    const result = await callClaude(
      TISTORY_SYSTEM,
      `다음 주제로 티스토리 개인 블로그 글을 작성해주세요:

제목: ${topic.title}
카테고리: ${topic.category}
접근 방식: ${topic.angle}
첫 문장 힌트: ${topic.hook}

JSON 형식:
{
  "title": "최종 제목",
  "intro": "도입 문단 (강렬하고 솔직하게, 100자 이상)",
  "sections": [
    {
      "heading": "소제목 (## 스타일, 창의적으로)",
      "content": "본문 (솔직하고 유머있게, 150자 이상)"
    }
  ],
  "closing": "마무리 (짧고 임팩트있게, 50자 이상)"
}`,
      1800
    );

    const clean = result.replace(/```json|```/g, '').trim();
    const post = JSON.parse(clean);
    renderTistoryPost(post);
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('tistoryLoading', false);
  }
}

function renderTistoryPost(post) {
  document.getElementById('tistoryTitleBox').textContent = post.title;

  let content = post.intro + '\n\n(사진)\n\n';
  (post.sections || []).forEach(s => {
    content += `## ${s.heading}\n\n${s.content}\n\n(사진)\n\n`;
  });
  content += '---\n\n' + post.closing;
  document.getElementById('tistoryOutput').textContent = content;
  document.getElementById('tistoryResult').style.display = 'block';
}
