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

[절대 금지]
- "2주에 한 번", "충분한 수분 섭취", "규칙적인 운동" 같은 뻔한 조언
- 수치만 나열하고 이유 안 쓰는 것 (왜 그 수치인지 메커니즘까지 필수)
- 다른 블로그 10개에서 똑같이 나오는 일반론
- "~하는 것이 좋습니다", "도움이 됩니다" 같은 흐릿한 표현

[반드시 포함]
- "흔히 알려진 것과 달리~", "실제로는~" 식의 반박 포인트 최소 1개
- 수치의 메커니즘 설명 (왜 그 수치인지 원리까지)
- 독자가 "이건 다른 데서 못 읽었다"고 느낄 각도

[톤앤매너]
- 1인칭. "이게 궁금해서 직접 찾아봤는데" 식의 친근한 구어체.
- 단언체. 공포 조장 금지. 현재 계절과 시의성 반영.

[구조]
[목차] 1~5개 소제목
서론 180~220자 (사진)
## 소제목별 320~400자 (사진)
[정리] 핵심 3줄

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  info: `당신은 생활정보 티스토리 블로그 작가입니다.

[절대 금지]
- 인터넷에서 복붙되는 팁 목록 나열
- 이유 없는 방법 나열 (왜 그래야 하는지 원리 필수)
- 다른 블로그 10개에서 똑같이 나오는 내용

[반드시 포함]
- 역발상 또는 "대부분이 잘못 알고 있는 것" 시각 최소 1개
- 비용/시간의 현실적 계산 또는 실패 경험

[톤앤매너]
- 1인칭. 직접 해보거나 찾아본 사람처럼.
- 단언체. 시니컬한 구어체이되 정보 밀도 높게.
- 현재 계절과 시의성 자연스럽게 반영.

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
- 구체적 가격대와 현실적 판단

[톤앤매너]
- 1인칭. 직접 써봤거나 꼼꼼히 비교해본 사람의 시점.
- 단언체. "이게 낫다", "이건 별로다" 솔직하게.

[구조]
[목차]
1. 고르기 전에 알아야 할 핵심 기준
2~5. (추천항목별)
6. 유형별 최종 추천 요약

각 항목 320~380자. 특징·장단점·가격대·추천 대상 명시.
총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

  essay: `당신은 티스토리 개인 블로그 작가입니다.

[톤앤매너 샘플]
"분명하게 말하지만, 이 글은 나태하게 살라는 말을 하려는 것은 아니다."

- 1인칭. 자기 생각을 직설적으로 밀어붙임.
- 시니컬하되 히스테릭하지 않음. 마무리는 짧게 끊음.
- 현재 날짜/계절/시의성 자연스럽게 반영.

[구조]
[목차] 1~3개 소제목
서론 150자 내외 → ## 소제목별 280~350자 → 마무리 100자 이내
총 1500~2000자. ## 소제목 외 마크다운 기호 일절 금지.`
};

// ===== 블랙키위 이미지 입력 관련 변수 =====
let blackkiwiImageFile = null;

// ===== 블랙키위 이미지 붙여넣기/업로드 초기화 =====
function initBlackkiwiUpload() {
  const dropzone  = document.getElementById('blackkiwiDropzone');
  const fileInput = document.getElementById('blackkiwiFileInput');
  if (!dropzone || !fileInput) return;

  // 드래그앤드롭
  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files[0]) setBlackkiwiImage(files[0]);
  });

  // 클릭 업로드
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) setBlackkiwiImage(fileInput.files[0]);
    fileInput.value = '';
  });

  // Ctrl+V 붙여넣기 — 티스토리 탭 활성화 시
  document.addEventListener('paste', e => {
    const activeTab = document.querySelector('.tab-panel.active');
    if (!activeTab || activeTab.id !== 'tab-tistory') return;
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (file) {
      setBlackkiwiImage(file);
      showToast('📋 스크린샷 붙여넣기 완료');
    }
  });
}

function setBlackkiwiImage(file) {
  blackkiwiImageFile = file;

  const preview = document.getElementById('blackkiwiPreview');
  const reader  = new FileReader();
  reader.onload = e => {
    preview.innerHTML = `
      <div style="position:relative;display:inline-block;width:100%">
        <img src="${e.target.result}" alt="블랙키위 스크린샷"
          style="width:100%;border-radius:8px;border:1.5px solid var(--border);display:block;max-height:200px;object-fit:cover;" />
        <button onclick="clearBlackkiwiImage()"
          style="position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,0.9);color:var(--navy);border:none;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;font-weight:700;">×</button>
      </div>`;
    preview.style.display = 'block';
    document.getElementById('blackkiwiFilterBtn').style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function clearBlackkiwiImage() {
  blackkiwiImageFile = null;
  document.getElementById('blackkiwiPreview').style.display = 'none';
  document.getElementById('blackkiwiPreview').innerHTML = '';
  document.getElementById('blackkiwiFilterBtn').style.display = 'none';
  document.getElementById('tistoryKeywordResult').style.display = 'none';
  document.getElementById('tistoryStep2').style.display = 'none';
  document.getElementById('tistoryResult').style.display = 'none';
}

// ===== STEP 1: 이미지에서 키워드 읽기 + 필터링 (API 1회) =====
async function filterTistoryKeywords() {
  if (!blackkiwiImageFile) { showToast('블랙키위 스크린샷을 먼저 붙여넣어 주세요'); return; }

  setLoading('tistoryLoading', true, '이미지에서 키워드를 읽는 중...');
  document.getElementById('tistoryKeywordResult').style.display = 'none';
  document.getElementById('tistoryStep2').style.display = 'none';
  document.getElementById('tistoryResult').style.display = 'none';

  const ctx    = getTodayContext();
  const apiKey = localStorage.getItem('CLAUDE_API_KEY');
  if (!apiKey) { showToast('Claude API 키를 설정해주세요'); setLoading('tistoryLoading', false); return; }

  try {
    // 이미지 → base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = e => resolve(e.target.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blackkiwiImageFile);
    });

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
        max_tokens: 1500,
        system: `당신은 티스토리 블로그 키워드 전략가입니다. 반드시 순수 JSON만 반환하세요.`,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: blackkiwiImageFile.type, data: base64 }
            },
            {
              type: 'text',
              text: `오늘 날짜: ${ctx.dateStr} / 계절: ${ctx.season}

위 이미지는 블랙키위 일간 트렌드 키워드 화면입니다.
이미지에서 키워드 텍스트를 모두 읽어낸 뒤, 아래 기준으로 필터링하세요.

[제거할 키워드]
- 연예인·인물 이름 (가수, 배우, 운동선수, 정치인 등)
- 연예·방송·음악 관련 (드라마, 예능, 앨범, 콘서트 등)
- 단발성 사건·사고 (특정 기업 실적, 주가, 사건사고)
- 지역 특정 행사·이슈 / 스포츠 경기 결과
- 숫자만 있는 항목 (+5.7천, 32 등)

[남길 키워드]
- 정보성 검색 가능 (방법, 이유, 효과, 비용 등으로 파생 가능)
- 생활·건강·금융·육아·정책·제도 등 일상 밀착 정보성

남긴 키워드마다:
1. 2~3차 파생 키워드 3개 (더 구체적인 롱테일)
2. 카테고리 (health/food/living/recommend/issue/finance/parenting)
3. 선정 이유 한 줄

반드시 순수 JSON으로만:
{
  "filtered": [
    {
      "main": "키워드",
      "category": "living",
      "derivatives": ["파생1", "파생2", "파생3"],
      "reason": "선정 이유"
    }
  ],
  "removed": ["제거된키워드1", "제거된키워드2"]
}`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API 오류 (${response.status})`);
    }

    const data      = await response.json();
    const textBlock = data.content?.find(b => b.type === 'text');
    if (!textBlock?.text) throw new Error('결과를 받지 못했습니다.');

    const parsed = safeParseJSON(textBlock.text);
    renderFilteredKeywords(parsed);

  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('tistoryLoading', false);
  }
}

// 필터링 결과 렌더링
function renderFilteredKeywords(data) {
  const box      = document.getElementById('tistoryKeywordResult');
  const filtered = data.filtered || [];
  const removed  = data.removed  || [];

  if (!filtered.length) {
    box.innerHTML = `<div class="card-title">필터링 결과</div>
      <div style="color:var(--text-muted);font-size:13px;padding:12px 0">
        포스팅 가능한 키워드가 없습니다. 다른 트렌드 키워드 이미지를 붙여넣어 주세요.
      </div>`;
    box.style.display = 'block';
    return;
  }

  const allKeywords = filtered.flatMap(k => [k.main, ...k.derivatives]);

  const catColors = {
    health:'#2a7a6a', food:'#c8922a', living:'#6b5bab',
    recommend:'#1c2b4a', issue:'#c0403a', finance:'#2a5a8a', parenting:'#4a8a2a'
  };
  const catNames = {
    health:'건강', food:'음식', living:'생활',
    recommend:'추천', issue:'시사', finance:'금융', parenting:'육아'
  };

  box.innerHTML = `
    <div class="card-title">
      필터링 결과 — ${filtered.length}개 선별
      <div style="display:flex;gap:6px;align-items:center">
        <span style="font-size:10px;color:var(--text-muted);font-weight:400">제거 ${removed.length}개</span>
        <button class="btn-sm btn-accent"
          onclick="navigator.clipboard.writeText(${JSON.stringify(allKeywords.join('\n'))}).then(()=>showToast('전체 키워드 복사됨!'))">
          📋 전체 복사
        </button>
      </div>
    </div>

    <div style="background:var(--gold-dim);border:1px solid rgba(200,146,42,0.2);border-radius:8px;padding:11px 13px;margin-bottom:14px;font-size:12px;color:var(--text-secondary);line-height:1.7">
      📌 아래 키워드를 <strong style="color:var(--navy)">네이버</strong>에서 검색하세요.<br>
      ① 파워링크(광고) 존재 확인 &nbsp;|&nbsp;
      ② <a href="https://searchad.naver.com" target="_blank" style="color:var(--navy-light);font-weight:600">네이버 키워드 도구</a>에서 월간 조회수 확인<br>
      <strong style="color:var(--teal)">조회수 5만+ + 파워링크 있음</strong> → 파생 키워드 옆 <strong>선택</strong> 클릭
    </div>

    <div class="keyword-grid">
      ${filtered.map((k, i) => {
        const color   = catColors[k.category] || '#1c2b4a';
        const catName = catNames[k.category]  || k.category;
        return `
        <div class="keyword-card">
          <div class="keyword-main">
            <span class="keyword-num">${String(i+1).padStart(2,'0')}</span>
            <span class="keyword-text">${k.main}</span>
            <span style="font-size:10px;font-family:var(--font-mono);color:${color};background:${color}18;padding:2px 7px;border-radius:20px;border:1px solid ${color}30">${catName}</span>
            <button class="btn-sm" onclick="navigator.clipboard.writeText('${k.main}').then(()=>showToast('복사됨!'))">복사</button>
          </div>
          <div class="keyword-reason">${k.reason}</div>
          <div class="keyword-derivatives">
            ${k.derivatives.map(d => `
              <div class="keyword-derivative">
                <span>↳ ${d}</span>
                <button class="btn-sm btn-accent"
                  onclick="selectKeyword('${d.replace(/'/g,"\\'")}', '${k.category}')">
                  선택
                </button>
              </div>
            `).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>

    ${removed.length ? `
    <div style="margin-top:14px;padding:10px 13px;background:var(--bg-input);border-radius:8px;border:1px solid var(--border)">
      <div style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);letter-spacing:0.1em;margin-bottom:6px">REMOVED</div>
      <div style="font-size:12px;color:var(--text-muted)">${removed.join(' · ')}</div>
    </div>` : ''}
  `;

  box.style.display = 'block';
  document.getElementById('tistoryStep2').style.display = 'block';
}

// 파생 키워드 선택 → STEP 2 자동 입력
function selectKeyword(keyword, category) {
  document.getElementById('tistoryFinalKeyword').value = keyword;
  document.getElementById('tistoryStep2Category').value = category;
  document.getElementById('tistoryStep2').scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast(`"${keyword}" 선택됨`);
}

// STEP 2: 글 생성 (API 1회)
async function generateTistoryFromKeyword() {
  const keyword = document.getElementById('tistoryFinalKeyword').value.trim();
  if (!keyword) { showToast('최종 키워드를 입력해주세요'); return; }

  const category  = document.getElementById('tistoryStep2Category').value || 'living';
  const postStyle = TISTORY_POST_STYLE[category] || 'info';
  const ctx       = getTodayContext();

  const pexelsQueryMap = {
    health:    'healthy food nutrition wellness',
    info:      'living lifestyle home tips',
    recommend: 'product review comparison',
    essay:     'daily life society people'
  };

  setLoading('tistoryLoading', true, '블로그 글을 작성 중...');
  document.getElementById('tistoryResult').style.display = 'none';

  try {
    const result = await callClaude(
      TISTORY_SYSTEM[postStyle],
      `오늘 날짜: ${ctx.dateStr} / 현재 계절: ${ctx.season} / 이달 시의성: ${ctx.monthlyKeywords}

다음 키워드로 SEO 최적화된 블로그 글을 작성해주세요: "${keyword}"

[SEO 지시]
- 제목에 키워드 "${keyword}" 반드시 포함
- 첫 문단에 키워드 자연스럽게 포함
- 소제목에 키워드 변형 표현 포함
- 목차를 반드시 글 상단에 포함
- 총 분량 준수`,
      3500
    );

    document.getElementById('tistoryTitleBox').textContent = keyword;
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

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initBlackkiwiUpload);


// ==================== 정신과 블로그 ====================

async function recommendPsychTopics() {
  const excludeEl = document.getElementById('psychExclude');
  const manualExclude = excludeEl.value.trim().split('\n').filter(Boolean);
  const savedExclude  = JSON.parse(localStorage.getItem('psych_used_topics') || '[]');
  const allExclude    = [...new Set([...manualExclude, ...savedExclude])];
  const seed  = Math.floor(Math.random() * 10000);
  const today = new Date().toLocaleDateString('ko-KR');

  setLoading('psychLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('psychTopicCard').style.display = 'none';
  document.getElementById('psychResult').style.display    = 'none';

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

    const lines  = result.trim().split('\n').filter(l => l.match(/^\d+\./));
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
        style="flex:1;background:var(--bg-input);border:1.5px solid var(--border);border-radius:8px;padding:7px 10px;color:var(--text-primary);font-size:13px;font-family:inherit;outline:none"
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
샘플: "매달 약국에서 가장 꾸준히 팔리는 약을 하나만 꼽으라고 한다면 단연 생리통 진통제가 아닐까 합니다."

- 따뜻하고 공감적인 의사 어투. ~합니다 / ~지요 / ~이지요 체
- 환자 감정 공감 먼저, 의학 정보 자연스럽게 연결
- 소제목 없음. 마크다운 없음. 수필처럼 문단이 자연스럽게 이어짐.
- 비유와 은유 풍부하게. 전문용어는 쉽게 풀어서.
- 매번 새로운 도입부.

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
    document.getElementById('psychOutput').textContent   = cleaned;
    await renderPexelsImages('mental health therapy calm', 'psychImageList', 'psychImages');
    document.getElementById('psychResult').style.display = 'block';
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('psychLoading', false);
  }
}
