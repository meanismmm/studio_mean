// ===== blog.js =====

const TISTORY_POST_STYLE = {
  health:'health', food:'health', living:'info',
  recommend:'recommend', issue:'essay', finance:'info', parenting:'info'
};

const TISTORY_SYSTEM = {
  health: `당신은 건강·음식 정보 티스토리 블로그 작가입니다.

[절대 금지]
- "2주에 한 번", "충분한 수분 섭취" 같은 뻔한 조언
- 수치만 나열하고 이유 안 쓰는 것 (왜 그 수치인지 메커니즘까지 필수)
- 다른 블로그 10개에서 똑같이 나오는 일반론

[반드시 포함]
- "흔히 알려진 것과 달리~" 식의 반박 포인트 최소 1개
- 수치의 메커니즘 설명

[톤앤매너]
1인칭. "이게 궁금해서 직접 찾아봤는데" 식의 친근한 구어체. 단언체. 공포 조장 금지. 현재 계절 반영.

[구조]
[목차] 1~5개 소제목
서론 180~220자 (사진)
## 소제목별 320~400자 (사진)
[정리] 핵심 3줄

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  info: `당신은 생활정보 티스토리 블로그 작가입니다.

[절대 금지]
- 인터넷에서 복붙되는 팁 목록 나열
- 이유 없는 방법 나열

[반드시 포함]
- 역발상 또는 "대부분이 잘못 알고 있는 것" 시각 최소 1개
- 비용/시간의 현실적 계산

[톤앤매너]
1인칭. 직접 해보거나 찾아본 사람처럼. 단언체. 시니컬한 구어체이되 정보 밀도 높게. 현재 계절 반영.

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
[목차] 1.고르기 전 핵심 기준 / 2~5.추천항목 / 6.유형별 요약
각 항목 320~380자. 특징·장단점·가격대·추천 대상 명시.
총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  essay: `당신은 티스토리 개인 블로그 작가입니다.

샘플: "분명하게 말하지만, 이 글은 나태하게 살라는 말을 하려는 것은 아니다."

1인칭. 직설적. 시니컬하되 히스테릭하지 않음. 마무리는 짧게 끊음. 현재 날짜/계절 반영.

[구조] [목차] 1~3개 소제목
서론 150자 내외 → ## 소제목별 280~350자 → 마무리 100자 이내
총 1500~2000자. ## 소제목 외 마크다운 기호 일절 금지.`
};

// ==================== 정신과 블로그 ====================

async function recommendPsychTopics() {
  const excludeEl = document.getElementById('psychExclude');
  const manual  = excludeEl.value.trim().split('\n').filter(Boolean);
  const saved   = JSON.parse(localStorage.getItem('psych_used_topics') || '[]');
  const exclude = [...new Set([...manual, ...saved])];
  const seed = Math.floor(Math.random() * 10000);

  setLoading('psychLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('psychTopicCard').style.display = 'none';
  document.getElementById('psychResult').style.display    = 'none';

  try {
    const result = await callClaude(
      '당신은 정신건강의학과 블로그 주제 기획 전문가입니다.',
      `오늘: ${new Date().toLocaleDateString('ko-KR')} / 번호: ${seed}
인천 가로수 정신건강의학과 네이버 블로그 주제 5개 추천.
제외: ${exclude.length ? exclude.join(', ') : '없음'}
의원급 진료 가능 질환. 네이버 검색량 있는 주제. 카테고리 다양하게. 매번 새롭게.
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
    setLoading('psychLoading', false);
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

  // 직접 입력
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
  setLoading('psychLoading', true, '블로그 글을 작성 중입니다...');
  document.getElementById('psychResult').style.display = 'none';

  try {
    const result = await callClaude(
      `당신은 인천 가로수 정신건강의학과(이성철 원장) 네이버 블로그 작가입니다.

[톤앤매너]
샘플: "매달 약국에서 가장 꾸준히 팔리는 약을 하나만 꼽으라고 한다면 단연 생리통 진통제가 아닐까 합니다."
따뜻하고 공감적인 의사 어투. ~합니다/~지요/~이지요 체. 환자 감정 공감 먼저. 소제목·마크다운 없음. 수필처럼 문단이 이어짐. 비유·은유 풍부. 매번 새로운 도입부.

[문단 구성 - 순수 텍스트만]
제목 (SEO 최적화, 인천 가로수 정신건강의학과 포함)
서두 1~2문장
(지도)
1문단: 환자 공감 도입 200~250자 (사진)
2문단: 질환/증상 설명. 비유 활용 200~250자 (사진)
3문단: 원인 또는 오해와 진실 200~250자 (사진)
4문단: 방치 시 위험성 200~250자 (사진)
5문단: 치료 방법과 회복 가능성. 희망적으로 200~250자 (사진)
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
    setLoading('psychLoading', false);
  }
}

// ==================== 티스토리 ====================

async function generateTistoryPost() {
  const keyword  = document.getElementById('tistoryKeyword').value.trim();
  if (!keyword) { showToast('키워드를 입력해주세요'); return; }

  const category = document.getElementById('tistoryCategory').value || 'living';
  const postStyle = TISTORY_POST_STYLE[category] || 'info';
  const ctx = getTodayContext();

  const pexelsMap = {
    health:'healthy food nutrition wellness', info:'living lifestyle home tips',
    recommend:'product review comparison', essay:'daily life society people'
  };

  setLoading('tistoryLoading', true, '블로그 글을 작성 중...');
  document.getElementById('tistoryResult').style.display = 'none';

  try {
    const result = await callClaude(
      TISTORY_SYSTEM[postStyle],
      `오늘: ${ctx.dateStr} / 계절: ${ctx.season} / 이달 시의성: ${ctx.monthlyKeywords}

키워드: "${keyword}"

[SEO 지시]
- 제목에 키워드 "${keyword}" 반드시 포함
- 첫 문단에 키워드 자연스럽게 포함
- 소제목에 키워드 변형 표현 포함
- 목차를 반드시 글 상단에 포함
- 총 분량 준수`, 3500
    );

    document.getElementById('tistoryTitleBox').textContent = keyword;
    document.getElementById('tistoryOutput').textContent   = result;
    await renderPexelsImages(pexelsMap[postStyle] || 'lifestyle', 'tistoryImageList', 'tistoryImages');
    document.getElementById('tistoryResult').style.display = 'block';
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('tistoryLoading', false);
  }
}
