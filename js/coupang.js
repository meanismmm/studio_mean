// ===== coupang.js — 쿠팡 파트너스 홍보글 생성 =====

async function generateCoupangContent() {
  const productName = document.getElementById('coupangProductName').value.trim();
  if (!productName) { showToast('상품명을 입력해주세요'); return; }

  const price        = document.getElementById('coupangProductPrice').value.trim();
  const category     = document.getElementById('coupangCategory').value;
  const featuresRaw  = document.getElementById('coupangProductFeatures').value.trim();
  const affiliateUrl = document.getElementById('coupangAffiliateUrl').value.trim();
  const type         = document.querySelector('input[name="coupangType"]:checked')?.value || 'blog';
  const style        = document.querySelector('input[name="coupangStyle"]:checked')?.value || 'pain';

  const features = featuresRaw
    ? featuresRaw.split('\n').map(f => f.trim()).filter(Boolean)
    : [];

  const product = {
    name: productName,
    price: price || '가격 미입력',
    category,
    features,
    affiliateUrl: affiliateUrl || '[파트너스 링크를 여기에 입력]'
  };

  setLoading('coupangLoading', true, '홍보글을 생성 중입니다...');
  document.getElementById('coupangBlogResult').style.display   = 'none';
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

// ===== 블로그 홍보글 생성 =====
async function generateCoupangBlog(product, style) {
  const ctx = getTodayContext();

  const styleGuide = style === 'pain'
    ? `[PAIN형 구조]
공감되는 문제 상황 제시 → 기존 해결책의 한계 → 이 상품이 완벽한 해결책인 이유 → 구체적 혜택 → 구매 유도`
    : `[WOW형 구조]
충격적이거나 놀라운 사실/혜택으로 시작 → 상품의 압도적 특장점 → 실제 사용 효과 → 가성비/가치 강조 → 구매 유도`;

  const featuresText = product.features.length
    ? product.features.map((f, i) => `${i + 1}. ${f}`).join('\n')
    : '(특징 미입력 — 상품명 기반으로 추론해서 작성)';

  const result = await callClaude(
    `당신은 쿠팡 파트너스 블로그 마케터입니다.

${styleGuide}

[글 작성 원칙]
- 광고처럼 보이지 않게. 진짜 써본 사람처럼 솔직하게.
- 구체적 수치와 상황 묘사 포함.
- SEO를 위해 상품명 키워드를 자연스럽게 반복.
- 목차 포함, 총 2000~2500자.
- ## 소제목 외 마크다운 기호 일절 금지.
- 글 마지막에 파트너스 링크 안내 + 수수료 고지 문구 포함.`,
    `다음 상품에 대한 ${style === 'pain' ? 'PAIN형' : 'WOW형'} 블로그 홍보글을 작성해주세요.

[상품 정보]
상품명: ${product.name}
가격: ${product.price}
카테고리: ${product.category}
주요 특징:
${featuresText}
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

마지막: 구매 권유 + 파트너스 링크 안내
※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 일정액의 수수료를 제공받을 수 있습니다.`,
    3000
  );

  // 제목(첫 줄)과 본문 분리
  const lines = result.trim().split('\n');
  const title = lines[0].replace(/^#+\s*/, '').trim();
  const body  = lines.slice(1).join('\n').trim();

  document.getElementById('coupangBlogTitle').textContent = title;
  document.getElementById('coupangBlogOutput').textContent = body;

  // Pexels 이미지 — 상품명 기반 영어 검색어
  const pexelsQuery = buildPexelsQuery(product.name, product.category);
  await renderPexelsImages(pexelsQuery, 'coupangImageList', 'coupangBlogImages');

  document.getElementById('coupangBlogResult').style.display = 'block';
}

// ===== 스레드 홍보 포스트 생성 =====
async function generateCoupangThreads(product, style) {
  const featuresText = product.features.length
    ? product.features.join(', ')
    : '(특징 미입력)';

  const result = await callClaude(
    '당신은 스레드(Threads) 쿠팡 파트너스 콘텐츠 전문가입니다. 반드시 순수 JSON만 반환하세요.',
    `다음 상품에 대한 스레드 홍보 포스트 5개를 작성해주세요.

[상품 정보]
상품명: ${product.name}
가격: ${product.price}
주요 특징: ${featuresText}
파트너스 링크: ${product.affiliateUrl}
홍보 스타일: ${style === 'pain' ? 'PAIN형 (문제 공감 → 해결책)' : 'WOW형 (놀라운 혜택 강조)'}

[포스트 구성]
1번: 강렬한 훅 — 이 상품을 모르면 손해라는 느낌, 첫 줄에서 스크롤 멈추게
2번: 이런 사람에게 필요한 이유 (공감 유도, 구체적 상황 묘사)
3번: 핵심 특징 3가지 — 줄바꿈으로 간결하게
4번: 가격 대비 가치 강조
5번: 구매 유도 + 링크 + 해시태그 5개

[규칙]
- 각 포스트 500자 이내
- 줄바꿈으로 가독성 확보
- 광고 티 나지 않게 솔직한 어조
- 5번 포스트 마지막에 "※ 파트너스 링크 포함" 문구

반드시 순수 JSON으로만 출력:
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

// ===== Pexels 검색어 생성 (상품명 → 영어) =====
function buildPexelsQuery(productName, category) {
  const categoryQueryMap = {
    home:    'home organization storage',
    beauty:  'beauty skincare product',
    fashion: 'fashion clothing style',
    digital: 'technology gadget electronics',
    baby:    'baby child toys',
    pet:     'pet dog cat',
    sports:  'sports fitness exercise',
    food:    'healthy food nutrition'
  };

  // 카테고리 기반 기본 쿼리
  return categoryQueryMap[category] || 'product lifestyle';
}
