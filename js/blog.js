// ===== blog.js — 정신과 블로그 + 티스토리 =====

// JSON 파싱 헬퍼 (코드펜스 제거 + 첫 {...} 블록 추출)
function safeParseJSON(text) {
  const s = text.replace(/```json|```/g, '').trim();
  try { return JSON.parse(s); } catch (_) {}
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch (_) {} }
  throw new Error('응답 파싱 실패 (토큰이 부족하거나 JSON 형식 오류)');
}

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
  const diseaseChecks = document.querySelectorAll('input[name="psychDisease"]:checked');
  const diseases  = Array.from(diseaseChecks).map(c => c.value);
  const diseaseStr = diseases.length ? diseases.join('·') : '전체(제한 없음)';

  const ageEl     = document.querySelector('input[name="psychAge"]:checked');
  const ageGroup  = ageEl ? ageEl.value : '전체 연령';

  const readerEl  = document.querySelector('input[name="psychReader"]:checked');
  const readerType = readerEl ? readerEl.value : '환자 본인';

  const ageHint    = PSYCH_AGE_HINTS[ageGroup]     || '';
  const readerHint = PSYCH_READER_HINTS[readerType] || '';

  setLoading('psychLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('psychTopicCard').style.display = 'none';
  document.getElementById('psychResult').style.display    = 'none';

  try {
    const result = await callClaude(
      '당신은 정신건강의학과 블로그 주제 기획 전문가입니다. 반드시 순수 JSON만 반환하세요.',
      `인천 가로수 정신건강의학과(이성철 원장) 네이버 블로그 포스팅 주제 5개 추천.

[독자 조건]
- 대상 질환: ${diseaseStr}
- 독자 연령대: ${ageGroup} → ${ageHint}
- 독자 유형: ${readerType} → ${readerHint}

[지시]
- 5개 주제가 서로 다른 각도 (증상·치료·오해·일상회복·주변인 대처)
- 의원급 진료 범위, 네이버 검색량 충분한 주제
- 매 요청마다 새로운 조합

{"topics":[{"title":"제목","disease":"질환","angle":"각도","summary":"요약2문장","searchKeyword":"키워드"}]}`,
      2000
    );

    const data = safeParseJSON(result);
    renderPsychTopics(data.topics);
  } catch(e) {
    showToast('오류: ' + e.message);
    console.error('[psychTopics]', e);
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
- 매번 새로운 도입부와 비유 사용

[포맷]
- 소개 문단(감성적 도입)
- 본문 단락들(각 단락 후 (사진) 표시)
- 마무리 문단(희망과 치료 권유)
- 서명: "인천 가로수 정신건강의학과 이성철 원장"

반드시 순수 JSON만 반환하세요.`;

  try {
    const result = await callClaude(
      PSYCH_SYSTEM,
      `다음 주제로 네이버 블로그 포스팅을 작성해주세요.

제목: ${topic.title}
질환/증상: ${topic.disease}
접근 각도: ${topic.angle}
핵심 메시지: ${topic.summary}
검색 키워드: ${topic.searchKeyword}

{"title":"제목","intro":"소개문단(100자이상)","sections":[{"heading":"소제목【】형식","content":"본문(200자이상)"}],"closing":"마무리(80자이상)","pexelsQuery":"영문키워드"}`,
      4000
    );

    const post = safeParseJSON(result);
    await renderPsychPost(post);
  } catch(e) {
    showToast('오류: ' + e.message);
    console.error('[psychPost]', e);
  } finally {
    setLoading('psychLoading', false);
  }
}

async function renderPsychPost(post) {
  document.getElementById('psychTitleBox').textContent = post.title;

  let content = post.intro + '\n\n(사진)\n\n';
  (post.sections || []).forEach(s => {
    content += `${s.heading}\n\n${s.content}\n\n(사진)\n\n`;
  });
  content += post.closing + '\n\n---\n\n인천 가로수 정신건강의학과 이성철 원장';
  document.getElementById('psychOutput').textContent = content;

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
  } catch(_) {
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
  document.getElementById('tistoryResult').style.display    = 'none';

  const catMap  = { social:'사회 이슈', news:'화제 뉴스', tip:'생활 팁', common:'상식', review:'리뷰·경험담' };
  const catNames = categories.map(c => catMap[c] || c).join(', ');

  try {
    const result = await callClaude(
      '당신은 티스토리 개인 블로그 주제 기획자입니다. 반드시 순수 JSON만 반환하세요.',
      `카테고리: ${catNames}

개인 블로그 포스팅 주제 5개 추천. 요즘 사람들이 관심 가질 주제, 1인칭 경험담 가능한 주제, 공감되는 주제.

{"topics":[{"title":"포스팅 제목","category":"카테고리","angle":"접근 각도","hook":"독자를 잡는 첫 문장"}]}`,
      2000
    );

    const data = safeParseJSON(result);
    renderTistoryTopics(data.topics);
  } catch(e) {
    showToast('오류: ' + e.message);
    console.error('[tistoryTopics]', e);
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
1인칭, 솔직 직설체, 구어체, 유머와 자기비하 자연스럽게 섞음. 새로운 도입부 사용.
반드시 순수 JSON만 반환하세요.`;

  try {
    const result = await callClaude(
      TISTORY_SYSTEM,
      `주제: ${topic.title} / 카테고리: ${topic.category} / 접근: ${topic.angle} / 첫문장힌트: ${topic.hook}

{"title":"최종제목","intro":"도입(100자이상)","sections":[{"heading":"소제목","content":"본문(150자이상)"}],"closing":"마무리(50자이상)"}`,
      3000
    );

    const post = safeParseJSON(result);
    renderTistoryPost(post);
  } catch(e) {
    showToast('오류: ' + e.message);
    console.error('[tistoryPost]', e);
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
