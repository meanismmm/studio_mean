// ===== blog.js =====

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
인천 가로수 정신건강의학과 네이버 블로그 포스팅 주제 5개를 추천해주세요.
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
  document.getElementById('psychTopicCard').style.display = 'block';
}

async function generatePsychPost(title) {
  setLoading('psychLoading', true, '블로그 글을 작성 중입니다...');
  document.getElementById('psychResult').style.display = 'none';
  try {
    const result = await callClaude(
      `당신은 인천 가로수 정신건강의학과(이성철 원장) 네이버 블로그 작가입니다.

[톤앤매너 — 매우 중요]
아래 샘플의 문체를 정확히 분석하고 따르세요.

샘플:
"매달 약국에서 가장 꾸준히 팔리는 약을 하나만 꼽으라고 한다면 단연 생리통 진통제가 아닐까 합니다. 많은 여성이 다가올 육체적 통증에 대비해 약을 상비하지만, 생리 시작 전 찾아오는 '감정의 통증' 앞에서는 아무런 대응도 하지 못한 채 속수무책의 상황에 빠지곤 하지요."

"결론부터 말씀드리면, 기업은 여러분의 정신과 진료 기록을 열람할 수 없습니다. 의료법 제21조와 개인정보보호법에 따라, 환자 본인의 동의 없는 의료 기록 열람은 법으로 엄격히 금지되어 있습니다."

[핵심 문체 특징]
- 따뜻하고 공감적인 의사 어투. ~합니다 / ~지요 / ~이지요 체
- 환자의 감정에 먼저 공감한 뒤 의학 정보를 자연스럽게 연결
- 소제목 없음. 구분점 없음. 번호 목록 없음. 마크다운 없음
- 수필처럼 문단이 자연스럽게 이어지는 완성된 글
- 비유와 은유를 풍부하게 활용 (예: "이슬비도 결국 비입니다")
- 전문 용어는 쉽게 풀어서 설명
- 매번 새로운 도입부. 유사문서 절대 금지

[문단 구성 — 반드시 이 순서와 형식]
제목 (SEO 최적화, "인천 가로수 정신건강의학과" 포함)

서두: 주제를 자연스럽게 소개하는 1~2문장

(지도)

1문단: 환자 공감 도입. 진료실 경험이나 일상적 상황으로 시작. (200~250자)

(사진)

2문단: 질환/증상 설명. 어렵지 않게, 비유 활용. (200~250자)

(사진)

3문단: 원인 또는 오해와 진실. (200~250자)

(사진)

4문단: 방치 시 위험성 또는 치료 필요성. (200~250자)

(사진)

5문단: 치료 방법과 회복 가능성. 희망적으로. (200~250자)

(사진)

---

맺음말: 따뜻한 마무리 2~3문장. 병원 방문 권유.

인천 가로수 정신건강의학과 이성철 원장

총 글자 수: 1500~1800자. 순수 텍스트만. 마크다운 절대 금지.`,
      `다음 주제로 위 형식과 톤앤매너에 맞게 작성해주세요: ${title}`,
      2500
    );
       // 마크다운 기호 후처리 제거
    const cleaned = result
      .replace(/\*\*(.*?)\*\*/g, '$1')   // **굵게** 제거
      .replace(/\*(.*?)\*/g, '$1')        // *기울임* 제거
      .replace(/^#+\s*/gm, '')            // # 제목 기호 제거
      .replace(/^-\s+/gm, '')             // - 목록 기호 제거
      .replace(/^\d+\.\s+/gm, '')         // 1. 번호 목록 제거
      .replace(/`(.*?)`/g, '$1')          // `코드` 제거
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

async function recommendTistoryTopics() {
  const checkboxes = document.querySelectorAll('#tab-tistory .checkbox-group input:checked');
  const categories = Array.from(checkboxes).map(c => c.value);
  if (!categories.length) { showToast('카테고리를 선택해주세요'); return; }
  setLoading('tistoryLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('tistoryTopicCard').style.display = 'none';
  document.getElementById('tistoryResult').style.display = 'none';
  const catMap = { social:'사회 이슈', news:'화제 뉴스', tip:'생활 팁', common:'상식', review:'리뷰·경험담' };
  const catNames = categories.map(c => catMap[c] || c).join(', ');
  const seed = Math.floor(Math.random() * 10000);
  try {
    const result = await callClaude(
      '당신은 티스토리 개인 블로그 주제 기획자입니다.',
      `요청번호: ${seed} / 카테고리: ${catNames}
시니컬하고 직설적인 1인칭 시점으로 쓸 수 있는 주제 5개.
반드시 번호 목록으로만:
1. 제목1
2. 제목2
3. 제목3
4. 제목4
5. 제목5`,
      400
    );
    const lines = result.trim().split('\n').filter(l => l.match(/^\d+\./));
    const topics = lines.map(l => l.replace(/^\d+\.\s*/, '').trim());
    renderTistoryTopics(topics);
  } catch(e) { showToast('오류: ' + e.message); }
  finally { setLoading('tistoryLoading', false); }
}

function renderTistoryTopics(topics) {
  const list = document.getElementById('tistoryTopicList');
  list.innerHTML = '';
  topics.forEach((title, i) => {
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.innerHTML = `<div class="topic-num">${String(i+1).padStart(2,'0')}</div><div><div class="topic-title">${title}</div></div>`;
    item.addEventListener('click', () => generateTistoryPost(title));
    list.appendChild(item);
  });
  document.getElementById('tistoryTopicCard').style.display = 'block';
}

async function generateTistoryPost(title) {
  setLoading('tistoryLoading', true, '블로그 글을 작성 중입니다...');
  document.getElementById('tistoryResult').style.display = 'none';
  try {
    const result = await callClaude(
      `당신은 티스토리 개인 블로그 작가입니다.

[톤앤매너 — 매우 중요]
아래 샘플의 문체를 정확히 분석하고 따르세요.

샘플1:
"분명하게 말하지만, 이 글은 나태하게 살라는 말을 하려는 것은 아니다. 갓생이든 뭐든 무언가에 몰입하고 어제보다 나은 상태를 지향하는 행동은 인간을 인간답게 만드는 훌륭한 동력이고 분명 사람을 더 발전하게 만들지도 모른, 아니, 발전하게 만든다."

샘플2:
"갓생이라는 단어가 유행할 무렵부터 우리는 우리도 모르는 사이 삶의 모든 순간을 '숫자'로 치환하려는 강박을 느끼게 되지 않았나 생각이 든다. 인생은 엑셀 시트가 아니다. 독서의 가치는 읽은 페이지 수가 아니라 그 안의 문장이 내 삶에 어떤 균열을 냈느냐에 있고, 운동의 가치는 소모한 칼로리가 아니라 내 몸이 느끼는 활력에 있다."

샘플3:
"나는 주택에 산다. 겨울이면, 아파트나 빌라, 원룸이 아닌 일반 개인주택-국민주택들은 수도관이 어는 경우가 왕왕 있는데 지난주 역대급 한파에 수도관이 얼어 버려서 집에 물이 안나온다. 아, 이제 짜증이 난다."

[핵심 문체 특징]
- 1인칭. 자기 생각을 직설적으로 밀어붙임
- 시니컬하되 히스테릭하지 않음. 냉소적이지만 설득력 있음
- 구어체이되 문장력이 있음. 비유가 구체적이고 날카로움
- 웃기려는 게 아니라 그냥 솔직한 것. 억지 유머 금지
- 마무리는 짧게 끊음. "끝이다." 스타일

[형식]
- 소제목은 ## 형식으로
- 사진 위치는 (사진) 표시
- 총 1000자 내외
- 마크다운 소제목(##) 외 다른 마크다운 금지`,
      `다음 주제로 위 톤앤매너에 맞게 티스토리 블로그 글을 작성해주세요: ${title}`,
      2000
    );
    document.getElementById('tistoryTitleBox').textContent = title;
    document.getElementById('tistoryOutput').textContent = result;
    document.getElementById('tistoryResult').style.display = 'block';
  } catch(e) { showToast('오류: ' + e.message); }
  finally { setLoading('tistoryLoading', false); }
}
