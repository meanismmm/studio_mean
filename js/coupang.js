// ===== coupang.js — 쿠팡 파트너스 이미지 분석 + 홍보글 생성 =====

let coupangExtractedProduct = null;

// ===== 이미지 업로드 UI 처리 =====
function initCoupangImageUpload() {
  const dropzone = document.getElementById('coupangDropzone');
  const fileInput = document.getElementById('coupangImageInput');
  const preview   = document.getElementById('coupangImagePreview');

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
    handleImageFiles(e.dataTransfer.files);
  });

  // 클릭 업로드
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => handleImageFiles(fileInput.files));
}

// 업로드된 이미지 파일 처리
function handleImageFiles(files) {
  const preview = document.getElementById('coupangImagePreview');
  const arr = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 3);
  if (!arr.length) { showToast('이미지 파일을 선택해주세요 (최대 3장)'); return; }

  preview.innerHTML = '';
  preview.style.display = 'flex';

  arr.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = e => {
      const div = document.createElement('div');
      div.className = 'image-preview-item';
      div.innerHTML = `
        <img src="${e.target.result}" alt="상품 이미지 ${i+1}" />
        <span class="preview-badge">${i+1}</span>`;
      preview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });

  // 파일 목록 저장
  window._coupangFiles = arr;
  document.getElementById('coupangAnalyzeBtn').style.display = 'block';
  document.getElementById('coupangExtractResult').style.display = 'none';
  coupangExtractedProduct = null;
}

// ===== 이미지 분석 → 상품 정보 추출 =====
async function analyzeCoupangImages() {
  const files = window._coupangFiles;
  if (!files || !files.length) { showToast('이미지를 먼저 업로드해주세요'); return; }

  setLoading('coupangLoading', true, '이미지에서 상품 정보를 분석 중입니다...');
  document.getElementById('coupangExtractResult').style.display = 'none';
  document.getElementById('coupangBlogResult').style.display    = 'none';
  document.getElementById('coupangThreadsResult').style.display = 'none';

  try {
    // 이미지를 base64로 변환
    const imageContents = await Promise.all(files.map(f => fileToBase64Content(f)));

    const apiKey = localStorage.getItem('CLAUDE_API_KEY');
    if (!apiKey) throw new Error('Claude API 키가 설정되지 않았습니다.');

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
        max_tokens: 1000,
        system: '당신은 쿠팡 상품 상세페이지 분석 전문가입니다. 이미지에서 상품 정보를 추출하여 반드시 순수 JSON만 반환하세요. 마크다운 없이 JSON만.',
        messages: [{
          role: 'user',
          content: [
            ...imageContents,
            {
              type: 'text',
              text: `위 쿠팡 상품 상세페이지 이미지들을 분석해서 상품 정보를 추출해주세요.

반드시 아래 JSON 형식으로만 답하세요:
{
  "name": "상품명 (정확하게)",
  "price": "가격 (이미지에서 읽은 값, 없으면 '미확인')",
  "brand": "브랜드명 (있는 경우)",
  "features": ["핵심 특징1", "핵심 특징2", "핵심 특징3", "핵심 특징4", "핵심 특징5"],
  "targetAudience": "주요 타겟 고객 추정",
  "painPoint": "이 상품이 해결하는 문제",
  "wowPoint": "가장 강조된 혜택이나 특장점",
  "category": "상품 카테고리 (home/beauty/fashion/digital/baby/pet/sports/food 중 하나)",
  "pexelsQuery": "이 상품 관련 이미지 검색어 (영어 2~3단어)"
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

    const data = await response.json();
    const text = data.content[0]?.text || '';
    const product = safeParseJSON(text);

    coupangExtractedProduct = product;
    renderExtractedProduct(product);

  } catch(e) {
    showToast('분석 오류: ' + e.message);
  } finally {
    setLoading('coupangLoading', false);
  }
}

// 파일 → base64 API content 객체
function fileToBase64Content(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const base64 = e.target.result.split(',')[1];
      resolve({
        type: 'image',
        source: {
          type: 'base64',
          media_type: file.type,
          data: base64
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 추출된 상품 정보 미리보기 렌더링
function renderExtractedProduct(product) {
  const box = document.getElementById('coupangExtractResult');

  box.innerHTML = `
    <div class="card-title">
      추출된 상품 정보
      <span style="font-size:10px;color:#3ecfb2;font-weight:400">✓ 분석 완료 — 수정 후 홍보글 생성</span>
    </div>

    <div class="form-group">
      <label>상품명 <span class="required">*</span></label>
      <input type="text" id="ep_name" value="${escapeAttr(product.name || '')}" placeholder="상품명" />
    </div>

    <div class="form-group">
      <label>브랜드</label>
      <input type="text" id="ep_brand" value="${escapeAttr(product.brand || '')}" placeholder="브랜드명" />
    </div>

    <div class="form-group">
      <label>가격</label>
      <input type="text" id="ep_price" value="${escapeAttr(product.price || '')}" placeholder="예: 29,900원" />
    </div>

    <div class="form-group">
      <label>핵심 특징 <span class="optional">(줄바꿈으로 구분)</span></label>
      <textarea id="ep_features" rows="5">${(product.features || []).join('\n')}</textarea>
    </div>

    <div class="form-group">
      <label>타겟 고객</label>
      <input type="text" id="ep_target" value="${escapeAttr(product.targetAudience || '')}" placeholder="예: 홈오피스 직장인" />
    </div>

    <div class="form-group">
      <label>해결하는 문제 (PAIN)</label>
      <input type="text" id="ep_pain" value="${escapeAttr(product.painPoint || '')}" placeholder="예: 책상 위 케이블 정리가 어렵다" />
    </div>

    <div class="form-group">
      <label>핵심 혜택 (WOW)</label>
      <input type="text" id="ep_wow" value="${escapeAttr(product.wowPoint || '')}" placeholder="예: 조립 없이 5분 설치" />
    </div>

    <div class="form-group">
      <label>파트너스 링크 <span class="optional">(생성된 글에 삽입)</span></label>
      <input type="text" id="ep_url" placeholder="https://link.coupang.com/a/..." />
    </div>
  `;

  box.style.display = 'block';
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ===== 홍보글 생성 (추출된 정보 기반) =====
async function generateCoupangContent() {
  // 이미지 분석 결과가 없으면 먼저 분석 유도
  if (!coupangExtractedProduct) {
    showToast('먼저 이미지를 업로드하고 [상품 정보 분석] 버튼을 눌러주세요');
    return;
  }

  // 편집된 필드값 수집
  const product = {
    name:           document.getElementById('ep_name')?.value.trim()     || coupangExtractedProduct.name,
    brand:          document.getElementById('ep_brand')?.value.trim()    || '',
    price:          document.getElementById('ep_price')?.value.trim()    || '가격 미확인',
    features:       (document.getElementById('ep_features')?.value || '').split('\n').map(f => f.trim()).filter(Boolean),
    targetAudience: document.getElementById('ep_target')?.value.trim()   || '',
    painPoint:      document.getElementById('ep_pain')?.value.trim()     || '',
    wowPoint:       document.getElementById('ep_wow')?.value.trim()      || '',
    affiliateUrl:   document.getElementById('ep_url')?.value.trim()      || '[파트너스 링크를 여기에 입력]',
    category:       coupangExtractedProduct.category || 'home',
    pexelsQuery:    coupangExtractedProduct.pexelsQuery || 'product lifestyle'
  };

  if (!product.name) { showToast('상품명을 입력해주세요'); return; }

  const type  = document.querySelector('input[name="coupangType"]:checked')?.value  || 'blog';
  const style = document.querySelector('input[name="coupangStyle"]:checked')?.value || 'pain';

  setLoading('coupangLoading', true, '홍보글을 생성 중입니다...');
  document.getElementById('coupangBlogResult').style.display    = 'none';
  document.getElementById('coupangThreadsResult').style.display = 'none';

  try {
    if (type === 'blog' || type === 'both') {
      await generateCoupangBlog(product, style);
    }
    if (type === 'threads' || type === 'both') {
      await generateCoupangThreads(product, style);
    }
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('coupangLoading', false);
  }
}

// ===== 블로그 홍보글 =====
async function generateCoupangBlog(product, style) {
  const ctx = getTodayContext();

  const styleGuide = style === 'pain'
    ? `[PAIN형]
공감되는 문제 상황 제시 → 기존 해결책의 한계 → 이 상품이 완벽한 해결책인 이유 → 구체적 혜택 → 구매 유도`
    : `[WOW형]
충격적이거나 놀라운 사실/혜택으로 시작 → 압도적 특장점 → 실제 사용 효과 → 가성비/가치 강조 → 구매 유도`;

  const featuresText = product.features.length
    ? product.features.map((f, i) => `${i+1}. ${f}`).join('\n')
    : '(특징 없음 — 상품명 기반으로 추론)';

  const result = await callClaude(
    `당신은 쿠팡 파트너스 블로그 마케터입니다.

${styleGuide}

[원칙]
- 광고처럼 보이지 않게. 진짜 써본 사람처럼 솔직하게.
- 구체적 수치와 상황 묘사 포함.
- SEO를 위해 상품명 키워드를 자연스럽게 반복.
- 목차 포함, 총 2000~2500자.
- ## 소제목 외 마크다운 기호 일절 금지.
- 글 마지막에 파트너스 링크 안내 + 수수료 고지 문구.`,
    `[상품 정보]
상품명: ${product.name}${product.brand ? ` (${product.brand})` : ''}
가격: ${product.price}
카테고리: ${product.category}
핵심 특징:
${featuresText}
타겟: ${product.targetAudience}
해결 문제: ${product.painPoint}
핵심 혜택: ${product.wowPoint}
파트너스 링크: ${product.affiliateUrl}
오늘 날짜: ${ctx.dateStr} / 계절: ${ctx.season}

[출력 구조]
첫 줄: SEO 최적화 제목 (상품명 포함)
빈 줄
[목차]
1. 소제목1
2. 소제목2
3. 소제목3
4. 소제목4

본문 (목차 순서대로 ## 소제목 사용)

마무리: 구매 권유 + 파트너스 링크 안내
※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 일정액의 수수료를 제공받을 수 있습니다.`,
    3000
  );

  const lines = result.trim().split('\n');
  const title = lines[0].replace(/^#+\s*/, '').trim();
  const body  = lines.slice(1).join('\n').trim();

  document.getElementById('coupangBlogTitle').textContent  = title;
  document.getElementById('coupangBlogOutput').textContent = body;

  await renderPexelsImages(product.pexelsQuery, 'coupangImageList', 'coupangBlogImages');
  document.getElementById('coupangBlogResult').style.display = 'block';
}

// ===== 스레드 홍보 포스트 =====
async function generateCoupangThreads(product, style) {
  const result = await callClaude(
    '당신은 스레드(Threads) 쿠팡 파트너스 콘텐츠 전문가입니다. 반드시 순수 JSON만 반환하세요.',
    `[상품 정보]
상품명: ${product.name}${product.brand ? ` (${product.brand})` : ''}
가격: ${product.price}
핵심 특징: ${product.features.join(', ')}
핵심 혜택: ${product.wowPoint}
해결 문제: ${product.painPoint}
파트너스 링크: ${product.affiliateUrl}
홍보 스타일: ${style === 'pain' ? 'PAIN형' : 'WOW형'}

[포스트 구성]
1번: 강렬한 훅 — 스크롤 멈추게 만드는 첫 줄
2번: 이런 사람에게 필요한 이유 (공감 유도)
3번: 핵심 특징 3가지 — 줄바꿈으로 간결하게
4번: 가격 대비 가치 강조
5번: 구매 유도 + 링크 + 해시태그 5개

[규칙]
- 각 포스트 500자 이내, 줄바꿈 활용
- 광고 티 나지 않게, 솔직한 어조
- 5번 마지막에 "※ 파트너스 링크 포함" 문구

순수 JSON으로만:
{
  "posts": [
    {"no": 1, "text": "내용", "type": "hook"},
    {"no": 2, "text": "내용", "type": "content"},
    {"no": 3, "text": "내용", "type": "content"},
    {"no": 4, "text": "내용", "type": "content"},
    {"no": 5, "text": "내용 + 링크 + 해시태그", "type": "cta"}
  ]
}`,
    1500
  );

  const parsed = safeParseJSON(result);
  renderThreadsPosts(parsed.posts, 'coupangThreadsList');
  document.getElementById('coupangThreadsResult').style.display = 'block';
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initCoupangImageUpload);
