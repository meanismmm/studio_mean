// ===== coupang.js — 쿠팡 파트너스 홍보글 생성 =====

const COUPANG_CATEGORY_MAP = {
  home:    '주방/생활용품',
  beauty:  '뷰티/건강',
  fashion: '패션/의류',
  digital: '디지털/가전',
  baby:    '유아/아동',
  pet:     '반려동물',
  sports:  '스포츠/레저',
  food:    '식품'
};

async function generateCoupangContent() {
  const url = document.getElementById('coupangUrl').value.trim();
  const category = document.getElementById('coupangCategory').value;
  const type = document.querySelector('input[name="coupangType"]:checked')?.value || 'blog';
  const style = document.querySelector('input[name="coupangStyle"]:checked')?.value || 'pain';

  setLoading('coupangLoading', true, url ? '상품 페이지를 분석 중입니다...' : '상품을 구성 중입니다...');
  document.getElementById('coupangBlogResult').style.display = 'none';
  document.getElementById('coupangThreadsResult').style.display = 'none';

  try {
    // 상품 정보 획득
    const product = await getCoupangProduct(url, category);

    // 생성 유형에 따라 분기
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

// 상품 정보 획득 (URL 분석 or 카테고리 기반 생성)
async function getCoupangProduct(url, category) {
  if (url) {
    // URL이 있으면 Claude에게 상품 페이지 정보 분석 요청
    return await analyzeProductUrl(url);
  } else {
    // URL 없으면 카테고리 기반으로 상품 구성
    return await generateProductInfo(category);
  }
}

async function analyzeProductUrl(url) {
  const result = await callClaude(
    '당신은 쿠팡 상품 분석 전문가입니다. 반드시 순수 JSON만 반환하세요.',
    `다음 쿠팡 상품 URL을 보고, URL 구조에서 파악 가능한 정보와 일반적인 쿠팡 상품 패턴을 바탕으로 상품 정보를 구성해주세요.
URL에서 직접 정보를 가져올 수 없으므로, URL 패턴과 카테고리 추정을 통해 현실적인 상품 정보를 만들어주세요.

URL: ${url}

반드시 아래 JSON 형식으로만 답하세요:
{
  "name": "추정 상품명 (구체적이고 현실적인 이름)",
  "price": "추정 가격대",
  "category": "카테고리",
  "features": ["주요 특징1", "주요 특징2", "주요 특징3", "주요 특징4"],
  "targetAudience": "주요 타겟 고객",
  "painPoint": "이 상품이 해결하는 핵심 문제",
  "wowPoint": "이 상품의 가장 놀라운 혜택이나 특징",
  "pexelsQuery": "이 상품 관련 Pexels 이미지 검색어 (영어 2~3단어)",
  "affiliateUrl": "${url}"
}`,
    600
  );
  return safeParseJSON(result);
}

async function generateProductInfo(category) {
  const catName = COUPANG_CATEGORY_MAP[category] || category;
  const ctx = getTodayContext();

  const result = await callClaude(
    '당신은 쿠팡 파트너스 마케터입니다. 반드시 순수 JSON만 반환하세요.',
    `현재 시즌(${ctx.season}, ${ctx.monthlyKeywords})에 쿠팡에서 잘 팔리는 ${catName} 카테고리 인기 상품 하나를 구성해주세요.

반드시 아래 JSON 형식으로만 답하세요:
{
  "name": "상품명 (구체적이고 현실적인 이름)",
  "price": "가격대",
  "category": "${catName}",
  "features": ["주요 특징1", "주요 특징2", "주요 특징3", "주요 특징4"],
  "targetAudience": "주요 타겟 고객",
  "painPoint": "이 상품이 해결하는 핵심 문제",
  "wowPoint": "이 상품의 가장 놀라운 혜택이나 특징",
  "pexelsQuery": "이 상품 관련 Pexels 이미지 검색어 (영어 2~3단어)",
  "affiliateUrl": "https://link.coupang.com/a/[파트너스링크를_여기에_입력]"
}`,
    600
  );
  return safeParseJSON(result);
}

// 블로그 홍보글 생성
async function generateCoupangBlog(product, style) {
  const ctx = getTodayContext();

  const styleGuide = style === 'pain'
    ? `[PAIN형 구조]
공감되는 문제 상황 제시 → 기존 해결책의 한계 → 이 상품이 완벽한 해결책인 이유 → 구체적 혜택 → 구매 유도`
    : `[WOW형 구조]
충격적이거나 놀라운 사실/혜택으로 시작 → 상품의 압도적 특장점 → 실제 사용 효과 → 가성비/가치 강조 → 구매 유도`;

  const result = await callClaude(
    `당신은 쿠팡 파트너스 블로그 마케터입니다.

${styleGuide}

[글 작성 원칙]
- 광고처럼 보이지 않게. 진짜 써본 사람처럼 솔직하게.
- 구체적 수치와 상황 묘사 포함.
- SEO를 위해 상품명과 카테고리 키워드를 자연스럽게 반복.
- 쿠팡 파트너스 링크 삽입 위치 명시.
- 목차 포함, 2000~2500자.
- ## 소제목 외 마크다운 기호 일절 금지.`,
    `다음 상품에 대한 ${style === 'pain' ? 'PAIN형' : 'WOW형'} 블로그 홍보글을 작성해주세요.

[상품 정보]
- 상품명: ${product.name}
- 가격: ${product.price}
- 카테고리: ${product.category}
- 주요 특징: ${(product.features || []).join(', ')}
- 타겟: ${product.targetAudience || ''}
- 해결 문제: ${product.painPoint || ''}
- 핵심 혜택: ${product.wowPoint || ''}
- 파트너스 링크: ${product.affiliateUrl || '[링크]'}

오늘 날짜: ${ctx.dateStr} / 계절: ${ctx.season}

[구조]
제목 (SEO 최적화)

[목차]
1~4개 소제목 나열

본문 (목차 순서대로)

마무리: 구매 권유 + 파트너스 링크 안내
※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로 수수료를 받을 수 있습니다.`,
    3000
  );

  // 제목 추출 (첫 줄)
  const lines = result.trim().split('\n');
  const title = lines[0].replace(/^#*\s*/, '').trim();
  const body = lines.slice(1).join('\n').trim();

  document.getElementById('coupangBlogTitle').textContent = title;
  document.getElementById('coupangBlogOutput').textContent = body;

  // Pexels 이미지
  const query = product.pexelsQuery || `${product.category} product`;
  await renderPexelsImages(query, 'coupangImageList', 'coupangBlogImages');

  document.getElementById('coupangBlogResult').style.display = 'block';
}

// 스레드 홍보 포스트 생성
async function generateCoupangThreads(product, style) {
  const result = await callClaude(
    '당신은 스레드(Threads) 쿠팡 파트너스 콘텐츠 전문가입니다. 반드시 순수 JSON만 반환하세요.',
    `다음 상품에 대한 스레드 홍보 포스트 5개를 작성해주세요.

[상품 정보]
- 상품명: ${product.name}
- 가격: ${product.price}
- 주요 특징: ${(product.features || []).join(', ')}
- 핵심 혜택: ${product.wowPoint || ''}
- 파트너스 링크: ${product.affiliateUrl || '[링크]'}

[구성]
1번: 강렬한 훅 (이 상품을 모르면 손해라는 느낌)
2번: 이런 사람에게 필요한 이유 (공감 유도)
3번: 핵심 특징 3가지 간결하게
4번: 가격 대비 가치 강조
5번: 구매 유도 + 링크 + 해시태그

[규칙]
- 각 포스트 500자 이내
- 줄바꿈으로 가독성 확보
- 광고 티 나지 않게
- 마지막에 "※ 파트너스 링크 포함" 문구

반드시 순수 JSON으로만:
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
