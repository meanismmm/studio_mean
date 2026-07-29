// ===== blog.js — 정신과 블로그 + 티스토리 =====

// JSON 파싱 헬퍼
function safeParseJSON(text) {
  const s = text.replace(/```json|```/g, '').trim();
  try { return JSON.parse(s); } catch (_) {}
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch (_) {} }
  throw new Error('응답 파싱 실패 (토큰 부족 또는 JSON 형식 오류)');
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

const PSYCH_SYSTEM = `당신은 인천 가로수 정신건강의학과(이성철 원장) 네이버 블로그 작가입니다.

[출력 형식 — 아래를 정확히 그대로 따르세요]

SEO 최적화 제목 ("인천 가로수 정신건강의학과" 포함)
---
독자 마음을 건드리는 한 줄 감성 요약 (제목 내용과 겹치지 않게)
---
서두 1~2문장 (주제를 감성적으로 소개)
(지도)
1문단 본문 (제공된 문단 계획 1의 내용, 250~350자)
--사진1--
2문단 본문 (제공된 문단 계획 2의 내용, 250~350자)
--사진2--
3문단 본문 (제공된 문단 계획 3의 내용, 250~350자)
--사진3--
4문단 본문 (제공된 문단 계획 4의 내용, 250~350자)
--사진4--
5문단 본문 (제공된 문단 계획 5의 내용, 250~350자)
--사진5--
6문단 본문 (제공된 문단 계획 6의 내용, 250~350자)
---
맺음말 (따뜻한 마무리 2~3문장, 병원 방문 권유)
인천 가로수 정신건강의학과 이성철 원장

[반드시 지켜야 할 마커]
아래 마커는 글 안에서 사진·지도 삽입 위치를 표시하는 실제 텍스트입니다. 변형 없이 정확히 출력하세요.
- "---" : 제목 아래, 요약 아래, 맺음말 위 — 총 3곳
- "(지도)" : 서두 바로 아래 한 줄. 괄호 포함해서 정확히 이 5글자 그대로 출력.
- "--사진1--", "--사진2--", "--사진3--", "--사진4--", "--사진5--" : 각 문단 사이에 순서대로
마크다운 기호(#, *, **, >, \` 등) 절대 금지. 총 2000~2200자.

[톤앤매너]
따뜻하고 공감적인 의사 어투. ~합니다/~지요/~이지요 체.
환자 감정 공감 먼저, 의학 정보 자연스럽게 연결.
소제목 없음. 구분점 없음. 번호 없음. 마크다운 없음. 별표 없음.
수필처럼 문단이 자연스럽게 이어지는 완성된 글.
비유와 은유는 신선하고 오리지널하게. 전문용어는 쉽게 풀어서.
공포 조장 금지. 과도한 위험 강조 금지.
샘플 어투: "매달 약국에서 가장 꾸준히 팔리는 약을 하나만 꼽으라고 한다면 단연 생리통 진통제가 아닐까 합니다."

[오리지널리티 — 절대 금지 표현]
"감정의 롤러코스터", "마음의 감기", "화재경보기가 오작동", "압력솥에 증기가 쌓이듯",
"강물이 댐에 막히듯", "징검다리 역할", "악순환의 고리", "장기전에 대비",
"혼자 끙끙 앓지 마시고" (→ "혼자 감당하려 하지 마시고"), "평온한 마음의 항구",
"피부가 얇아서", "마라톤을 뛰듯",
"지금 도움을 청하는 것은 약함이 아니라 강함", "약함의 신호가 아니라 용기",
"당신은 혼자가 아닙니다", "함께라면 반드시 이겨낼 수 있습니다",
우울증을 감기·신체 질환과 단순 비교하는 비유 일체 ("감기처럼", "감기약처럼" 등).
FAQ식 나열 구조 금지: 예상 질문을 순서대로 나열하며 "첫째... 둘째..." 또는 "또 다른 걱정은..."으로 이어가는 구성.
같은 글 안에서 유사한 구조의 비유 3개 이상 반복 금지.
매 글마다 완전히 새로운 도입부와 비유 사용.

[의학적·사실적 정확성 — 반드시 준수]
- 단일 원인 단정 금지: "~때문에 생긴다" → "~등이 복합적으로 작용한다"
- 치료 효과 과장 금지: "반드시 낫는다" → "충분히 회복 가능하다"
- 치료 시간 단정 금지: "수주 내에 변화를 경험한다", "○개월이면" 등 구체적 회복 시점 예측 금지. 대신 "회복의 속도는 사람마다 다르지만 전문적 치료가 그 과정을 단단하게 지탱해줍니다" 수준으로 서술.
- 특정 병원의 실제 운영 절차를 확인 없이 단정하지 않는다. 접수 방식, 동의 여부, 보험, 진료비, 미성년자 내원 요건 등 행정 정보는 "병원에 직접 문의"로만 안내한다. 다만 제목이 치료·진료 내용을 묻는 경우, 일반적인 정신건강의학과의 임상적 평가와 치료 방법은 개인차와 전문의 판단을 명시하여 구체적으로 설명한다.
- 인과관계 단순화 금지: 뇌 화학물질 불균형을 단독 원인으로 서술 금지
- 자살·자해 표현: "자살로 이어진다" → "정신건강 위기 상황에 더 취약해질 수 있다"
- 치료 효과 개인차 명시: 회복 속도는 사람마다 다름을 언급
- 청소년 약물치료: "전문의 판단에 따라 신중하게" 맥락 포함
- 공황발작 지속 시간: "10분 내외"로 단정 금지, "수십 분 이내"로 서술
- 자기애성 성격장애: "공감 능력 결여" → "공감 능력이 현저히 제한된"

[글 완성도 — 반드시 준수]
- 선택된 제목은 원고 전체가 답해야 할 최우선 질문이다. 제목과 무관한 질환 일반론으로 범위를 넓히지 않는다.
- 서두에서 제목의 질문을 분명히 제기하고, 1문단 안에 핵심 답을 먼저 제시한 뒤 2~6문단에서 구체화한다.
- 제공된 6개 문단 계획을 순서대로 따르며, 모든 문단이 제목의 질문에 직접 기여해야 한다.
- 독자 연령대와 독자 유형을 원고 전체에 반영한다. 청소년 대상 글을 성인 직장인 사례로 쓰는 식의 대상 이탈은 금지한다.
- 각 문단은 단 하나의 구체적이고 밀도 있는 통찰을 중심으로 깊이 전개한다. 여러 주제를 나열하지 않는다.
- 독자가 "이건 정확히 내 이야기다"라고 느낄 만큼 세밀하고 구체적인 심리 묘사를 포함한다. 막연한 위로나 일반론 금지.
- 임상에서 실제로 마주치는 환자의 말투·표현·행동을 반영한 생생한 묘사를 활용한다.
- 문단 간 논리적·감정적 흐름이 자연스럽게 이어진다. 주제를 갑작스럽게 전환하거나 새로운 걱정을 돌연 도입하지 않는다.
- 전문가의 깊은 이해에서 비롯된 언어를 사용한다. 검색으로 쉽게 찾을 수 있는 정보를 단순 나열하는 수준의 글은 금지.

[기타]
- 병원 공지문, 의료진 소개 등 본문과 무관한 내용 삽입 금지
- 문단 수 줄이거나 형식 변경 금지
- 일반인 독자 기준 언어 사용`;

const PSYCH_REVIEW_SYSTEM = `${PSYCH_SYSTEM}

[최종 편집 역할]
당신은 지금 초안을 새로 쓰는 작가가 아니라 최종 원고 편집자입니다.
제공된 초안의 핵심 내용과 고유한 표현은 최대한 살리되, 위의 모든 작성 원칙을 기준으로 다음을 교정하세요.
- 상투적인 AI 문장, 막연한 위로, 정보 나열을 제거하고 구체적인 심리 묘사로 바꿉니다.
- 의학적 단정, 치료 효과 과장, 진료 절차·비용·법률 관련 서술을 제거합니다.
- 문단별 통찰이 하나씩 분명하고 앞뒤 흐름이 자연스럽게 이어지도록 다듬습니다.
- 지정된 제목·구분선·지도·사진 마커와 2000~2200자 분량을 지킵니다.
- 원래 선택 제목의 핵심 질문과 대상 독자를 초안보다 우선합니다. 초안이 빗나갔다면 해당 문단을 과감히 다시 씁니다.
- 검토 의견이나 설명 없이 발행 가능한 최종 원고만 출력합니다.`;

async function recommendPsychTopics() {
  const diseaseChecks = document.querySelectorAll('input[name="psychDisease"]:checked');
  const diseases   = Array.from(diseaseChecks).map(c => c.value);
  const diseaseStr = diseases.length ? diseases.join('·') : '전체(제한 없음)';

  const ageEl      = document.querySelector('input[name="psychAge"]:checked');
  const ageGroup   = ageEl ? ageEl.value : '전체 연령';

  const readerEl   = document.querySelector('input[name="psychReader"]:checked');
  const readerType = readerEl ? readerEl.value : '환자 본인';

  const ageHint    = PSYCH_AGE_HINTS[ageGroup]     || '';
  const readerHint = PSYCH_READER_HINTS[readerType] || '';

  // 버튼 로딩 상태
  const recBtn     = document.querySelector('#tab-psych button.btn-primary');
  const recBtnSpan = recBtn ? recBtn.querySelector('span') : null;
  if (recBtn) recBtn.disabled = true;
  if (recBtnSpan) recBtnSpan.textContent = '추천 중...';

  setLoading('psychLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('psychTopicCard').style.display = 'none';
  document.getElementById('psychResult').style.display    = 'none';

  try {
    const result = await callAI(
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
- 제목이 묻는 질문에 직접 답하는 한 문장과, 그 답을 전개하는 서로 겹치지 않는 6개 문단 계획을 작성
- 문단 계획은 선택한 연령대와 독자 유형에 맞고, 여섯 문단 모두 제목과 직접 관련되어야 함

{"topics":[{"title":"제목","disease":"질환","angle":"각도","summary":"요약2문장","coreQuestion":"제목이 묻는 핵심 질문","directAnswer":"핵심 질문에 대한 직접 답변 한 문장","contentPlan":["1문단 역할","2문단 역할","3문단 역할","4문단 역할","5문단 역할","6문단 역할"],"searchKeyword":"키워드"}]}`,
      3000,
      { reasoningEffort: 'low', verbosity: 'medium' }
    );

    const data = safeParseJSON(result);
    if (!data || !Array.isArray(data.topics) || !data.topics.length) {
      throw new Error('주제 추천 결과를 받지 못했습니다. 다시 시도해주세요.');
    }
    data.topics.forEach(topic => {
      topic.ageGroup = ageGroup;
      topic.readerType = readerType;
      topic.ageHint = ageHint;
      topic.readerHint = readerHint;
    });
    renderPsychTopics(data.topics);
  } catch(e) {
    showToast('오류: ' + e.message);
    console.error('[psychTopics]', e);
  } finally {
    setLoading('psychLoading', false);
    if (recBtn) recBtn.disabled = false;
    if (recBtnSpan) recBtnSpan.textContent = '주제 추천 (5개)';
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
    item.addEventListener('click', () => {
      list.querySelectorAll('.topic-item').forEach(el => el.classList.remove('generating'));
      item.classList.add('generating');
      generatePsychPost(t).finally(() => item.classList.remove('generating'));
    });
    list.appendChild(item);
  });
  document.getElementById('psychTopicCard').style.display = 'block';
}

async function generatePsychPost(topic) {
  setLoading('psychLoading', true, '블로그 글을 작성 중입니다...');
  document.getElementById('psychResult').style.display = 'none';

  try {
    const contentPlan = Array.isArray(topic.contentPlan) && topic.contentPlan.length === 6
      ? topic.contentPlan
      : [
          '독자가 제목의 상황에서 느끼는 걱정과 핵심 답변',
          '제목의 질문과 직접 관련된 임상적 설명',
          '제목의 질문과 관련된 평가 또는 판단 기준',
          '제목의 질문과 관련된 구체적인 치료 내용',
          '치료 선택의 개인차와 전문의 판단',
          '청소년과 보호자가 현실적으로 기억할 점'
        ];
    const planText = contentPlan.map((item, index) => `  ${index + 1}. ${item}`).join('\n');
    const brief = `[원고 계약 — 최우선]
- 선택 제목: ${topic.title}
- 핵심 질문: ${topic.coreQuestion || topic.title}
- 한 문장 직접 답변: ${topic.directAnswer || topic.summary}
- 대상 질환/증상: ${topic.disease}
- 독자 연령대: ${topic.ageGroup || '전체 연령'} (${topic.ageHint || ''})
- 독자 유형: ${topic.readerType || '환자 본인'} (${topic.readerHint || ''})
- 접근 각도: ${topic.angle}
- 핵심 메시지: ${topic.summary}
- 문단 계획:
${planText}

제목은 임의로 다른 주제로 바꾸지 마세요. 첫 문단에서 직접 답하고, 모든 문단이 이 질문을 설명해야 합니다.`;

    const draft = await callAI(
      PSYCH_SYSTEM,
      `다음 원고 계약에 따라 블로그 글을 작성하세요. 위 구조 형식을 반드시 그대로 따르고, JSON 없이 순수 텍스트로 출력하세요.

${brief}
- 검색 키워드: ${topic.searchKeyword}`,
      8000,
      { reasoningEffort: 'medium', verbosity: 'high' }
    );

    setLoading('psychLoading', true, '원고를 편집·검수하고 있습니다...');
    const result = await callAI(
      PSYCH_REVIEW_SYSTEM,
      `아래 원고 계약과 초안을 대조하여 최종 검수하세요.

${brief}

[검수 통과 조건]
- 본문이 선택 제목의 핵심 질문에 실제로 답하는가
- 첫 문단에 직접 답변이 있는가
- 여섯 문단 모두 제목과 직접 관련되는가
- 독자 연령대와 독자 유형이 끝까지 유지되는가
- 하나라도 어기면 초안의 해당 부분을 다시 써서 고친 뒤 완성본만 출력

[초안]
${draft}`,
      8000,
      { reasoningEffort: 'high', verbosity: 'high' }
    );

    // 마크다운 기호 후처리 제거
    const cleaned = result
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^#+\s*/gm, '')
      .replace(/`(.*?)`/g, '$1')
      .trim();

    // 첫 줄을 제목으로 표시
    const firstLine = cleaned.split('\n')[0].trim();
    document.getElementById('psychTitleBox').textContent = firstLine;
    document.getElementById('psychOutput').textContent   = cleaned;

    // Pexels 이미지
    await renderPsychImages(topic.searchKeyword || 'mental health therapy');

    document.getElementById('psychResult').style.display = 'block';
  } catch(e) {
    showToast('오류: ' + e.message);
    console.error('[psychPost]', e);
  } finally {
    setLoading('psychLoading', false);
  }
}

async function renderPsychImages(keyword) {
  const imgList = document.getElementById('psychImageList');
  imgList.innerHTML = '<div style="color:#7a7a8c;font-size:12px">이미지 검색 중...</div>';
  document.getElementById('psychImages').style.display = 'block';

  try {
    const images = await searchPexels(keyword + ' mental health', 5);
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
}

// ======= 티스토리 블로그 =======

async function recommendTistoryTopics() {
  const checkboxes = document.querySelectorAll('#tab-tistory .checkbox-group input:checked');
  const categories = Array.from(checkboxes).map(c => c.value);
  if (!categories.length) { showToast('카테고리를 선택해주세요'); return; }

  setLoading('tistoryLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('tistoryTopicCard').style.display = 'none';
  document.getElementById('tistoryResult').style.display    = 'none';

  const catMap   = { social:'사회 이슈', news:'화제 뉴스', tip:'생활 팁', common:'상식', review:'리뷰·경험담' };
  const catNames = categories.map(c => catMap[c] || c).join(', ');

  try {
    const result = await callAI(
      '당신은 티스토리 개인 블로그 주제 기획자입니다. 반드시 순수 JSON만 반환하세요.',
      `카테고리: ${catNames}

개인 블로그 포스팅 주제 5개 추천. 요즘 관심 가질 주제, 1인칭 경험담 가능, 공감되는 주제.

{"topics":[{"title":"포스팅 제목","category":"카테고리","angle":"접근 각도","hook":"독자를 잡는 첫 문장"}]}`,
      3000,
      { reasoningEffort: 'low', verbosity: 'medium' }
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
    const result = await callAI(
      TISTORY_SYSTEM,
      `주제: ${topic.title} / 카테고리: ${topic.category} / 접근: ${topic.angle} / 첫문장힌트: ${topic.hook}

{"title":"최종제목","intro":"도입(100자이상)","sections":[{"heading":"소제목","content":"본문(150자이상)"}],"closing":"마무리(50자이상)"}`,
      6000,
      { reasoningEffort: 'medium', verbosity: 'high' }
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
