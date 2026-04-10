// ===== blog.js — 정신과 블로그 + 티스토리 블로그 =====

const TISTORY_POST_STYLE = {
  health:    'health',
  food:      'health',
  living:    'info',
  recommend: 'recommend',
  issue:     'essay',
  finance:   'info',
  parenting: 'info'
};

const TISTORY_SYSTEM = {
  health: `티스토리 건강·음식 블로그 작가. 1인칭 구어체. 단언체.
금지: 뻔한 조언("충분한 수분 섭취" 등), 이유 없는 수치 나열, "도움이 됩니다" 류 표현, 팩트에 없는 수치·사실 창작.
필수: 반박 포인트 1개 이상("흔히 알려진 것과 달리~"), 메커니즘 설명.
구조: [목차] → 서론180~220자(사진) → ##소제목별320~400자(사진) → [정리]핵심3줄. 총2500~3200자. ##외 마크다운 금지.`,

  info: `티스토리 생활정보 블로그 작가. 1인칭 구어체. 단언체. 시니컬하되 정보 밀도 높게.
금지: 복붙 팁 나열, 이유 없는 방법 나열, 팩트에 없는 수치·사실 창작.
필수: 역발상 또는 "대부분이 잘못 알고 있는 것" 시각 1개, 현실적 비용/시간 계산.
구조: [목차] → 서론180~220자(사진) → ##소제목별320~400자(사진) → [한줄정리]. 총2500~3200자. ##외 마크다운 금지.`,

  recommend: `티스토리 추천·비교 블로그 작가. 1인칭. 직접 써본 사람 시점.
금지: "가성비 최고" 등 광고성 표현, 단점 없는 추천, 팩트에 없는 수치·사실 창작.
필수: 각 항목 단점과 "이런 사람에게는 안 맞다" 명시, 구체적 가격대.
구조: [목차] → 1.핵심기준 → 2~5.항목별(320~380자, 특징·장단점·가격·추천대상) → 6.최종요약. 총2500~3200자. ##외 마크다운 금지.`,

  essay: `티스토리 개인 블로그 작가. 1인칭. 직설적. 시니컬하되 히스테릭하지 않게.
금지: 팩트에 없는 수치·사실 창작.
필수: 자기 생각을 밀어붙이는 논리, 짧고 강한 마무리.
구조: [목차]1~3개 → 서론150자 → ##소제목별280~350자 → 마무리100자이내. 총1500~2000자. ##외 마크다운 금지.`
};

// ===== 네이버 검색량 조회 =====
async function fetchNaverSearchVolume(keywords) {
  try {
    const response = await fetch('/api/naver-keyword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords })
    });
    if (!response.ok) return {};
    return await response.json();
  } catch (e) {
    return {};
  }
}

function formatVol(n) {
  if (!n || n === 0) return '0';
  if (n >= 10000) return (n / 10000).toFixed(1) + '만';
  if (n >= 1000)  return (n / 1000).toFixed(1) + '천';
  return n.toString();
}

function volBadge(volData, keyword) {
  const v = volData[keyword];
  if (!v && v !== 0) return `<span style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono)">-</span>`;
  const total = v.total || 0;
  if (total === 0) return `<span style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono)">검색량 미미</span>`;
  const color = total >= 50000 ? '#2a7a6a'
              : total >= 10000 ? '#c8922a'
              : total >= 1000  ? '#6b5bab'
              : '#888';
  return `<span style="font-size:10px;font-family:var(--font-mono);color:${color};background:${color}18;padding:2px 8px;border-radius:20px;border:1px solid ${color}30">🔍 ${formatVol(total)} (PC ${formatVol(v.pc)} / 모 ${formatVol(v.mobile)})</span>`;
}

// ===== 팩트 수집 =====
async function fetchKeywordFacts(keyword) {
  try {
    const response = await fetch('/api/claude-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword })
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    return null;
  }
}

// ===== STEP1 탭 전환 =====
function switchTistoryTab(mode) {
  const imageBtn  = document.getElementById('tistoryTabImage');
  const directBtn = document.getElementById('tistoryTabDirect');
  const imageMode  = document.getElementById('tistoryModeImage');
  const directMode = document.getElementById('tistoryModeDirect');

  if (mode === 'image') {
    imageBtn.style.background  = 'var(--navy)';
    imageBtn.style.color       = '#fff';
    imageBtn.style.fontWeight  = '600';
    directBtn.style.background = 'var(--bg-input)';
    directBtn.style.color      = 'var(--text-muted)';
    directBtn.style.fontWeight = '400';
    imageMode.style.display  = 'block';
    directMode.style.display = 'none';
  } else {
    directBtn.style.background = 'var(--navy)';
    directBtn.style.color      = '#fff';
    directBtn.style.fontWeight = '600';
    imageBtn.style.background  = 'var(--bg-input)';
    imageBtn.style.color       = 'var(--text-muted)';
    imageBtn.style.fontWeight  = '400';
    directMode.style.display = 'block';
    imageMode.style.display  = 'none';
  }

  // 결과 초기화
  document.getElementById('tistoryKeywordResult').style.display = 'none';
  document.getElementById('tistoryStep2').style.display = 'none';
  document.getElementById('tistoryResult').style.display = 'none';
}

// ===== 키워드 직접 입력 → 검색량 조회 =====
async function loadDirectKeywords() {
  const raw = document.getElementById('tistoryDirectKeywords').value.trim();
  if (!raw) { showToast('키워드를 입력해주세요'); return; }

  const category = document.getElementById('tistoryDirectCategory').value || 'living';
  const keywords = raw.split('\n').map(k => k.trim()).filter(Boolean).slice(0, 10);

  setLoading('tistoryLoading', true, '검색량 조회 중...');
  document.getElementById('tistoryKeywordResult').style.display = 'none';
  document.getElementById('tistoryStep2').style.display = 'none';
  document.getElementById('tistoryResult').style.display = 'none';

  const volData = await fetchNaverSearchVolume(keywords);

  setLoading('tistoryLoading', false);

  const box = document.getElementById('tistoryKeywordResult');
  box.innerHTML = `
    <div class="card-title">키워드 검색량 — ${keywords.length}개</div>
    <div class="keyword-grid">
      ${keywords.map((kw, i) => {
        const escaped = kw.replace(/'/g, "\\'");
        return `
        <div class="keyword-card">
          <div class="keyword-main">
            <span class="keyword-num">${String(i+1).padStart(2,'0')}</span>
            <span class="keyword-text">${kw}</span>
            <button class="btn-sm btn-accent"
              onclick="selectDirectKeyword('${escaped}','${category}')">선택</button>
          </div>
          <div style="margin:4px 0">${volBadge(volData, kw)}</div>
        </div>`;
      }).join('')}
    </div>
  `;
  box.style.display = 'block';
  document.getElementById('tistoryStep2').style.display = 'block';
}

function selectDirectKeyword(keyword, category) {
  document.getElementById('tistoryFinalKeyword').value = keyword;
  document.getElementById('tistoryStep2Category').value = category;
  document.getElementById('tistoryStep2').scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast(`"${keyword}" 선택됨`);
}

// ===== 메인 키워드 인라인 편집 =====
function editMainKeyword(cardId, currentKeyword) {
  const textEl = document.getElementById(`kw-text-${cardId}`);
  if (!textEl) return;
  const escaped = currentKeyword.replace(/'/g, "\\'");
  textEl.innerHTML = `
    <input id="kw-input-${cardId}" type="text" value="${currentKeyword}"
      style="font-size:14px;font-weight:600;color:var(--navy);background:var(--bg-input);border:1.5px solid var(--teal);border-radius:6px;padding:3px 8px;outline:none;width:140px;font-family:inherit;"
      onkeydown="if(event.key==='Enter')confirmEditKeyword('${cardId}');if(event.key==='Escape')cancelEditKeyword('${cardId}','${escaped}');"
    />
    <button class="btn-sm btn-accent" onclick="confirmEditKeyword('${cardId}')" style="margin-left:4px">확인</button>
    <button class="btn-sm" onclick="cancelEditKeyword('${cardId}','${escaped}')">취소</button>
  `;
  document.getElementById(`kw-input-${cardId}`)?.focus();
}

async function confirmEditKeyword(cardId) {
  const input = document.getElementById(`kw-input-${cardId}`);
  if (!input) return;
  const newKeyword = input.value.trim();
  if (!newKeyword) return;
  const textEl  = document.getElementById(`kw-text-${cardId}`);
  const badgeEl = document.getElementById(`kw-badge-${cardId}`);
  const escaped = newKeyword.replace(/'/g, "\\'");
  textEl.innerHTML = `<span class="keyword-text">${newKeyword}</span>
    <button class="btn-sm" style="margin-left:4px;font-size:10px;opacity:0.6" onclick="editMainKeyword('${cardId}','${escaped}')">✏️</button>`;
  if (badgeEl) badgeEl.innerHTML = `<span style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono)">조회중...</span>`;
  const volData = await fetchNaverSearchVolume([newKeyword]);
  if (badgeEl) badgeEl.innerHTML = volBadge(volData, newKeyword);
}

function cancelEditKeyword(cardId, originalKeyword) {
  const textEl = document.getElementById(`kw-text-${cardId}`);
  if (!textEl) return;
  const escaped = originalKeyword.replace(/'/g, "\\'");
  textEl.innerHTML = `<span class="keyword-text">${originalKeyword}</span>
    <button class="btn-sm" style="margin-left:4px;font-size:10px;opacity:0.6" onclick="editMainKeyword('${cardId}','${escaped}')">✏️</button>`;
}

// ===== 블랙키위 이미지 관련 =====
let blackkiwiImageFile = null;

function initBlackkiwiUpload() {
  const dropzone  = document.getElementById('blackkiwiDropzone');
  const fileInput = document.getElementById('blackkiwiFileInput');
  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files[0]) setBlackkiwiImage(files[0]);
  });
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) setBlackkiwiImage(fileInput.files[0]);
    fileInput.value = '';
  });
  document.addEventListener('paste', e => {
    const activeTab = document.querySelector('.tab-panel.active');
    if (!activeTab || activeTab.id !== 'tab-tistory') return;
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (file) { setBlackkiwiImage(file); showToast('📋 스크린샷 붙여넣기 완료'); }
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

// ===== STEP 1: 이미지에서 키워드 읽기 + 필터링 =====
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
        max_tokens: 1200,
        system: `티스토리 애드센스 키워드 전략가. 반드시 순수 JSON만 반환.`,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: blackkiwiImageFile.type, data: base64 } },
            {
              type: 'text',
              text: `날짜:${ctx.dateStr} 계절:${ctx.season}
블랙키위 트렌드 키워드 이미지. 모든 키워드 읽고 필터링.
제거: 인물이름, 순수연예오락(드라마·앨범·콘서트), 스포츠경기결과, 숫자·기호만인것, 중복
유지: 정책·제도, 건강·의료, 생활·소비, 금융·부동산, 음식·맛집, 육아·교육, 여행·축제, 기업명(정보성파생가능), 지역명(정보성), 계절·시의성
각 키워드: 파생3개(롱테일), 카테고리(health/food/living/recommend/issue/finance/parenting), 이유1줄
JSON만:
{"filtered":[{"main":"키워드","category":"living","derivatives":["파생1","파생2","파생3"],"reason":"이유"}],"removed":["제거1"]}`
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
    await renderFilteredKeywords(parsed);

  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('tistoryLoading', false);
  }
}

// ===== 필터링 결과 렌더링 =====
async function renderFilteredKeywords(data) {
  const box      = document.getElementById('tistoryKeywordResult');
  const filtered = data.filtered || [];
  const removed  = data.removed  || [];

  if (!filtered.length) {
    box.innerHTML = `<div class="card-title">필터링 결과</div>
      <div style="color:var(--text-muted);font-size:13px;padding:12px 0">포스팅 가능한 키워드가 없습니다.</div>`;
    box.style.display = 'block';
    return;
  }

  box.innerHTML = `<div class="card-title">검색량 조회 중...</div>`;
  box.style.display = 'block';

  const mainKeywords = filtered.map(k => k.main);
  const volData = await fetchNaverSearchVolume(mainKeywords);
  const allKeywords = filtered.flatMap(k => [k.main, ...k.derivatives]);

  const catColors = { health:'#2a7a6a', food:'#c8922a', living:'#6b5bab', recommend:'#1c2b4a', issue:'#c0403a', finance:'#2a5a8a', parenting:'#4a8a2a' };
  const catNames  = { health:'건강', food:'음식', living:'생활', recommend:'추천', issue:'시사', finance:'금융', parenting:'육아' };

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
    <div class="keyword-grid">
      ${filtered.map((k, i) => {
        const cardId  = `card-${i}`;
        const color   = catColors[k.category] || '#1c2b4a';
        const catName = catNames[k.category]  || k.category;
        const escaped = k.main.replace(/'/g, "\\'");
        return `
        <div class="keyword-card">
          <div class="keyword-main">
            <span class="keyword-num">${String(i+1).padStart(2,'0')}</span>
            <span id="kw-text-${cardId}">
              <span class="keyword-text">${k.main}</span>
              <button class="btn-sm" style="margin-left:4px;font-size:10px;opacity:0.6" onclick="editMainKeyword('${cardId}','${escaped}')">✏️</button>
            </span>
            <span style="font-size:10px;font-family:var(--font-mono);color:${color};background:${color}18;padding:2px 7px;border-radius:20px;border:1px solid ${color}30">${catName}</span>
            <button class="btn-sm" onclick="navigator.clipboard.writeText('${escaped}').then(()=>showToast('복사됨!'))">복사</button>
          </div>
          <div id="kw-badge-${cardId}" style="margin:4px 0 6px 0">${volBadge(volData, k.main)}</div>
          <div class="keyword-reason">${k.reason}</div>
          <div class="keyword-derivatives">
            ${k.derivatives.map(d => `
              <div class="keyword-derivative">
                <span>↳ ${d}</span>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                  <span id="vol-${CSS.escape(d)}" style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono)">-</span>
                  <button class="btn-sm btn-accent"
                    onclick="selectKeywordWithVol('${d.replace(/'/g,"\\'")}','${k.category}')">선택</button>
                </div>
              </div>`).join('')}
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

// ===== 파생 키워드 선택 시 검색량 즉시 조회 =====
async function selectKeywordWithVol(keyword, category) {
  const volEl = document.getElementById(`vol-${CSS.escape(keyword)}`);
  if (volEl) volEl.textContent = '조회중...';
  const volData = await fetchNaverSearchVolume([keyword]);
  const v = volData[keyword];
  if (volEl) {
    if (v && v.total > 0) {
      const color = v.total >= 50000 ? '#2a7a6a' : v.total >= 10000 ? '#c8922a' : v.total >= 1000 ? '#6b5bab' : '#888';
      volEl.innerHTML = `<span style="color:${color};background:${color}18;padding:2px 8px;border-radius:20px;border:1px solid ${color}30">🔍 ${formatVol(v.total)} (PC ${formatVol(v.pc)} / 모 ${formatVol(v.mobile)})</span>`;
    } else {
      volEl.textContent = '검색량 미미';
    }
  }
  document.getElementById('tistoryFinalKeyword').value = keyword;
  document.getElementById('tistoryStep2Category').value = category;
  document.getElementById('tistoryStep2').scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast(`"${keyword}" 선택됨`);
}

// ===== STEP 2: 글 생성 =====
async function generateTistoryFromKeyword() {
  const keyword = document.getElementById('tistoryFinalKeyword').value.trim();
  if (!keyword) { showToast('최종 키워드를 입력해주세요'); return; }

  const category    = document.getElementById('tistoryStep2Category').value || 'living';
  const postStyle   = TISTORY_POST_STYLE[category] || 'info';
  const useWebSearch = document.getElementById('tistoryWebSearch')?.checked || false;
  const ctx         = getTodayContext();

  const pexelsQueryMap = { health:'healthy food nutrition wellness', info:'living lifestyle home tips', recommend:'product review comparison', essay:'daily life society people' };

  document.getElementById('tistoryResult').style.display = 'none';

  let factContext = '';
  if (useWebSearch) {
    setLoading('tistoryLoading', true, '최신 정보를 검색하는 중...');
    const facts = await fetchKeywordFacts(keyword);
    if (facts && facts.facts && facts.facts.length > 0) {
      factContext = `
★ 웹 검색으로 확인한 최신 팩트 — 반드시 이 사실 기반으로 작성, 여기 없는 수치·날짜·인물은 지어내지 말 것 ★
${facts.facts.map((f, i) => `${i+1}. ${f}`).join('\n')}
${facts.caution?.length ? `\n주의(단정 금지): ${facts.caution.join(' / ')}` : ''}
요약: ${facts.summary || ''}
`;
    }
  }

  setLoading('tistoryLoading', true, '블로그 글을 작성 중...');

  try {
    const result = await callClaude(
      TISTORY_SYSTEM[postStyle],
      `날짜:${ctx.dateStr} 계절:${ctx.season} 시의성:${ctx.monthlyKeywords}
${factContext}
키워드 "${keyword}"로 SEO 최적화 블로그 글 작성.
제목에 키워드 포함. 첫 문단에 키워드 포함. 목차 글 상단에 포함.`,
      3000
    );

    document.getElementById('tistoryTitleBox').textContent = keyword;
    document.getElementById('tistoryOutput').textContent = result;
    await renderPexelsImages(pexelsQueryMap[postStyle] || 'lifestyle blog', 'tistoryImageList', 'tistoryImages');
    document.getElementById('tistoryResult').style.display = 'block';
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('tistoryLoading', false);
  }
}

document.addEventListener('DOMContentLoaded', initBlackkiwiUpload);


// ==================== 정신과 블로그 ====================

async function recommendPsychTopics() {
  const excludeEl     = document.getElementById('psychExclude');
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
      '정신건강의학과 블로그 주제 기획 전문가.',
      `날짜:${today} 번호:${seed}
인천 가로수 정신건강의학과 네이버 블로그 주제 5개 추천.
제외(금지): ${allExclude.length ? allExclude.join(', ') : '없음'}
조건: 의원급 진료 가능, 검색량 있는 주제, 카테고리 다양하게.
번호 목록으로만:
1. 제목1
2. 제목2
3. 제목3
4. 제목4
5. 제목5`,
      400
    );

    const lines  = result.trim().split('\n').filter(l => l.match(/^\d+\./));
    const topics = lines.map(l => l.replace(/^\d+\.\s*/, '').trim());
    const updated = [...new Set([...savedExclude, ...topics])].slice(-100);
    localStorage.setItem('psych_used_topics', JSON.stringify(updated));
    await renderPsychTopics(topics);
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('psychLoading', false);
  }
}

async function renderPsychTopics(topics) {
  const list = document.getElementById('psychTopicList');
  list.innerHTML = `<div style="color:var(--text-muted);font-size:12px;padding:8px 0">검색량 조회 중...</div>`;
  document.getElementById('psychTopicCard').style.display = 'block';

  const keywords = topics.map(t => t.replace(/[^\uAC00-\uD7A3\u1100-\u11FF\w\s]/g, '').trim().split(' ').slice(0, 3).join(' '));
  const volData = await fetchNaverSearchVolume(keywords);

  list.innerHTML = '';
  topics.forEach((title, i) => {
    const kw   = keywords[i];
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.innerHTML = `
      <div class="topic-num">${String(i+1).padStart(2,'0')}</div>
      <div style="flex:1">
        <div class="topic-title">${title}</div>
        <div style="margin-top:4px">${volBadge(volData, kw)}</div>
      </div>`;
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
      `인천 가로수 정신건강의학과(이성철 원장) 네이버 블로그 작가.
톤: 따뜻한 의사 어투. ~합니다/~지요 체. 공감 먼저, 정보 연결. 소제목 없음. 마크다운 없음. 수필체.
구조(순수텍스트): 제목(SEO+병원명) → 서두1~2문장 → (지도) → 1문단:공감도입200~250자(사진) → 2문단:증상설명200~250자(사진) → 3문단:원인200~250자(사진) → 4문단:위험성200~250자(사진) → 5문단:치료·희망200~250자(사진) → 맺음말:따뜻한마무리+방문권유 → 인천 가로수 정신건강의학과 이성철 원장
총1500~1800자. 마크다운 절대금지.`,
      `주제: ${title}`,
      2000
    );

    const cleaned = result
      .replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
      .replace(/^#+\s*/gm, '').replace(/^-\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '').replace(/`(.*?)`/g, '$1').trim();

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
