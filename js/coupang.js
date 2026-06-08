// ===== coupang.js — 쿠팡 파트너스 숏츠 =====

// 카테고리별 검색 키워드 매핑
const COUPANG_KEYWORDS = {
  home: ['주방용품', '청소용품', '수납정리', '생활잡화', '욕실용품'],
  beauty: ['스킨케어', '마스크팩', '선크림', '영양제', '다이어트'],
  fashion: ['가방', '신발', '패딩', '티셔츠', '액세서리'],
  digital: ['무선이어폰', '보조배터리', '충전기', '스마트워치', '블루투스스피커'],
  baby: ['유아식', '기저귀', '장난감', '유모차', '아기옷'],
  pet: ['사료', '간식', '장난감', '사료그릇', '리드줄'],
  sports: ['요가매트', '덤벨', '운동화', '자전거', '등산용품'],
  food: ['건강식품', '간편식', '음료', '과자', '커피']
};

let currentProduct = null;

async function fetchCoupangProduct() {
  const category = document.getElementById('coupangCategory').value;
  const urlInput = document.getElementById('coupangUrl').value.trim();
  const btn = document.getElementById('fetchCoupangBtn');

  // API 키 확인
  const accessKey = localStorage.getItem('COUPANG_ACCESS_KEY');
  const secretKey = localStorage.getItem('COUPANG_SECRET_KEY');

  btn.disabled = true;
  document.getElementById('productCard').style.display = 'none';
  document.getElementById('coupangResult').style.display = 'none';
  setLoading('coupangLoading', true, '상품을 조회 중입니다...');

  try {
    let product;

    if (urlInput) {
      // URL에서 상품 ID 추출
      const match = urlInput.match(/products\/(\d+)/);
      if (!match) throw new Error('올바른 쿠팡 상품 URL을 입력해주세요');
      product = await fetchProductById(match[1], accessKey, secretKey);
    } else if (accessKey && secretKey) {
      // API로 인기 상품 조회
      product = await fetchTrendingProduct(category, accessKey, secretKey);
    } else {
      // API 키 없으면 Claude로 상품 추천
      product = await fetchProductWithClaude(category);
    }

    currentProduct = product;
    renderProductCard(product);
  } catch (e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('coupangLoading', false);
    btn.disabled = false;
  }
}

// 쿠팡 파트너스 API - HMAC 서명 생성
function generateCoupangSignature(method, url, secretKey, accessKey) {
  const now = new Date();
  const datetime = now.toISOString().replace(/[-:]/g, '').slice(0, 13) + 'Z';
  const message = datetime + method + url;
  // 브라우저에서는 HMAC 서명이 제한적 — 실 환경에서는 GitHub Actions 백엔드 필요
  return { datetime, signature: btoa(message + secretKey).slice(0, 32) };
}

async function fetchTrendingProduct(category, accessKey, secretKey) {
  const keywords = COUPANG_KEYWORDS[category];
  const keyword = keywords[Math.floor(Math.random() * keywords.length)];

  // 쿠팡 파트너스 상품 검색 API
  // 참고: 브라우저에서 직접 호출 시 CORS 이슈가 있을 수 있음
  // 실제 운영 시 GitHub Actions 또는 프록시 서버 경유 권장
  try {
    const path = `/v2/providers/affiliate_open_api/apis/openapi/products/bestcategories/1`;
    const resp = await fetch(`https://api-gateway.coupang.com${path}`, {
      headers: {
        'Authorization': `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${new Date().toISOString()}, signature=dummy`,
        'Content-Type': 'application/json'
      }
    });

    if (resp.ok) {
      const data = await resp.json();
      const item = data.data?.[0];
      if (item) return formatCoupangItem(item, keyword);
    }
  } catch(e) {
    // API 직접 호출 실패 시 Claude 폴백
  }

  // 폴백: Claude로 상품 추천
  return await fetchProductWithClaude(category, keyword);
}

async function fetchProductById(productId, accessKey, secretKey) {
  return await fetchProductWithClaude('home', `상품ID: ${productId}`);
}

// Claude를 활용한 상품 추천 (API 없을 때 폴백)
async function fetchProductWithClaude(category, keyword = '') {
  const categoryNames = {
    home:'주방/생활', beauty:'뷰티/건강', fashion:'패션',
    digital:'디지털/가전', baby:'유아/아동', pet:'반려동물',
    sports:'스포츠/레저', food:'식품'
  };
  const catName = categoryNames[category] || category;
  const kw = keyword || (COUPANG_KEYWORDS[category] || ['인기'])[0];

  const result = await callClaude(
    '당신은 쿠팡 파트너스 마케터입니다. JSON만 반환하세요. 마크다운 없이 순수 JSON만.',
    `쿠팡에서 인기있는 ${catName} 카테고리의 "${kw}" 관련 실제 상품 하나를 추천해주세요.
반드시 아래 JSON 형식으로만 답하세요:
{
  "name": "상품명 (구체적이고 실제같은 이름)",
  "price": "가격 (예: 29,900원)",
  "category": "${catName}",
  "keyword": "${kw}",
  "features": ["특징1", "특징2", "특징3"],
  "targetAudience": "주요 타겟 (예: 30대 직장인 여성)",
  "painPoint": "이 상품이 해결하는 문제",
  "wowPoint": "이 상품의 놀라운 점"
}`,
    500
  );

  const clean = result.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

function renderProductCard(product) {
  const info = document.getElementById('productInfo');
  info.innerHTML = `
    <div class="product-details">
      <div class="product-name">${product.name}</div>
      <div class="product-price">${product.price}</div>
      <div class="product-category">${product.category} · ${product.keyword || ''}</div>
      ${product.features ? `<div style="margin-top:8px;font-size:11px;color:#7a7a8c">${product.features.join(' · ')}</div>` : ''}
    </div>
  `;
  document.getElementById('productCard').style.display = 'block';
}

async function generateCoupangScript() {
  if (!currentProduct) return;

  const scriptType = document.querySelector('input[name="scriptType"]:checked')?.value || 'PAIN';
  const btn = document.getElementById('generateScriptBtn');
  btn.disabled = true;
  setLoading('coupangLoading', true, '스크립트를 생성 중입니다...');
  document.getElementById('coupangResult').style.display = 'none';

  try {
    const systemPrompt = `당신은 유튜브 숏츠 전문 스크립트 작가입니다.
쿠팡 파트너스 상품 홍보 숏츠를 위한 완성도 높은 스크립트를 작성합니다.
반드시 지정된 JSON 형식으로만 응답하세요. 마크다운 없이 순수 JSON만.`;

    const userPrompt = scriptType === 'PAIN'
      ? `다음 상품에 대한 PAIN형 유튜브 숏츠 스크립트를 작성해주세요.
PAIN형 = 공감되는 문제 제시 → 해결책으로 상품 소개 → 구매 유도

상품 정보:
- 이름: ${currentProduct.name}
- 가격: ${currentProduct.price}
- 카테고리: ${currentProduct.category}
- 특징: ${(currentProduct.features || []).join(', ')}
- 타겟: ${currentProduct.targetAudience || '전 연령'}
- 해결 문제: ${currentProduct.painPoint || ''}

JSON 형식:
{
  "hook": "첫 3초 훅 문구 (강렬하게)",
  "scenes": [
    {"no": 1, "duration": 3, "visual": "화면 설명", "caption": "자막 텍스트", "narration": "나레이션"},
    {"no": 2, "duration": 4, "visual": "화면 설명", "caption": "자막 텍스트", "narration": "나레이션"},
    {"no": 3, "duration": 4, "visual": "화면 설명", "caption": "자막 텍스트", "narration": "나레이션"},
    {"no": 4, "duration": 4, "visual": "화면 설명", "caption": "자막 텍스트", "narration": "나레이션"},
    {"no": 5, "duration": 3, "visual": "화면 설명", "caption": "자막 텍스트", "narration": "나레이션"},
    {"no": 6, "duration": 3, "visual": "CTA 화면", "caption": "구매 유도 자막", "narration": "CTA 나레이션"}
  ],
  "fullNarration": "전체 나레이션 텍스트 (이어서 읽을 수 있게)",
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3", "#해시태그4", "#해시태그5"]
}`
      : `다음 상품에 대한 WOW형 유튜브 숏츠 스크립트를 작성해주세요.
WOW형 = 놀라운 사실/혜택 제시 → 임팩트 강조 → 구매 충동 유발

상품 정보:
- 이름: ${currentProduct.name}
- 가격: ${currentProduct.price}
- 카테고리: ${currentProduct.category}
- 특징: ${(currentProduct.features || []).join(', ')}
- WOW 포인트: ${currentProduct.wowPoint || ''}

JSON 형식:
{
  "hook": "첫 3초 훅 문구 (충격/놀라움)",
  "scenes": [
    {"no": 1, "duration": 3, "visual": "화면 설명", "caption": "자막 텍스트", "narration": "나레이션"},
    {"no": 2, "duration": 4, "visual": "화면 설명", "caption": "자막 텍스트", "narration": "나레이션"},
    {"no": 3, "duration": 4, "visual": "화면 설명", "caption": "자막 텍스트", "narration": "나레이션"},
    {"no": 4, "duration": 4, "visual": "화면 설명", "caption": "자막 텍스트", "narration": "나레이션"},
    {"no": 5, "duration": 3, "visual": "화면 설명", "caption": "자막 텍스트", "narration": "나레이션"},
    {"no": 6, "duration": 3, "visual": "CTA 화면", "caption": "구매 유도 자막", "narration": "CTA 나레이션"}
  ],
  "fullNarration": "전체 나레이션 텍스트",
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3", "#해시태그4", "#해시태그5"]
}`;

    const result = await callClaude(systemPrompt, userPrompt, 1500);
    const clean = result.replace(/```json|```/g, '').trim();
    const script = JSON.parse(clean);

    renderCoupangScript(script);
  } catch (e) {
    showToast('스크립트 생성 오류: ' + e.message);
  } finally {
    setLoading('coupangLoading', false);
    btn.disabled = false;
  }
}

function renderCoupangScript(script) {
  const output = document.getElementById('coupangScriptOutput');

  let html = `🎬 훅: ${script.hook}\n\n`;
  html += `${'─'.repeat(40)}\n\n`;

  (script.scenes || []).forEach(s => {
    html += `[장면 ${s.no}] ${s.duration}초\n`;
    html += `📸 화면: ${s.visual}\n`;
    html += `💬 자막: ${s.caption}\n`;
    html += `🎙 나레이션: ${s.narration}\n\n`;
  });

  html += `${'─'.repeat(40)}\n`;
  html += `${(script.hashtags || []).join(' ')}`;

  output.textContent = html;

  // 나레이션
  const narEl = document.getElementById('coupangNarration');
  narEl.textContent = script.fullNarration || '';
  document.getElementById('coupangNarrationBox').style.display = 'block';

  // 파트너스 링크 (실제로는 API에서 받아야 함)
  const linkBox = document.getElementById('coupangLinkBox');
  const linkEl = document.getElementById('coupangAffiliateLink');
  linkEl.textContent = 'https://link.coupang.com/a/[파트너스_링크] — 쿠팡 파트너스 센터에서 복사';
  linkBox.style.display = 'block';

  document.getElementById('coupangResult').style.display = 'block';
}
