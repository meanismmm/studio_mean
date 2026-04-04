// ===== blog.js =====

// ===== 유틸: 오늘 날짜 및 시의성 컨텍스트 =====
function getTodayContext() {
const now   = new Date();
const year  = now.getFullYear();
const month = now.getMonth() + 1;
const day   = now.getDate();
const dateStr = `${year}년 ${month}월 ${day}일`;

const seasonMap = {
12: ‘겨울’, 1: ‘겨울’, 2: ‘겨울’,
3:  ‘봄’,   4: ‘봄’,   5: ‘봄’,
6:  ‘여름’, 7: ‘여름’, 8: ‘여름’,
9:  ‘가을’, 10: ‘가을’, 11: ‘가을’
};
const season = seasonMap[month];

const monthlyKeywords = {
1:  ‘새해 결심, 다이어트 시작, 신년 건강검진, 독감 유행, 겨울 건조증’,
2:  ‘환절기 면역력, 봄맞이 준비, 미세먼지 시작, 입학 준비 건강’,
3:  ‘봄 알레르기, 황사 대비, 꽃가루 증상, 새학기 스트레스, 봄나물 효능’,
4:  ‘봄철 피로, 춘곤증 극복, 꽃놀이 준비, 야외활동 증가, 자외선 주의’,
5:  ‘가정의 달 건강, 황금연휴 음식, 초여름 냉방병, 어버이날 선물’,
6:  ‘여름 시작 건강관리, 자외선 차단, 냉방병 예방, 수분 보충, 장마 준비’,
7:  ‘장마철 식중독, 무더위 건강, 에어컨 냉방병, 여름 보양식, 휴가 전 건강’,
8:  ‘폭염 대처, 열사병 예방, 여름 피부 관리, 휴가 후 피로 회복, 개학 준비’,
9:  ‘환절기 감기, 가을 건강관리, 추석 음식 과식, 면역력 강화, 가을 다이어트’,
10: ‘가을 건조한 피부, 독감 예방접종, 환절기 알레르기, 가을 제철 음식’,
11: ‘김장 음식 효능, 겨울 건강 준비, 감기 독감 예방, 건조증 관리, 난방 시작’,
12: ‘연말 과음 과식 회복, 겨울 면역력, 연말 다이어트, 새해 건강 준비’
};

return { dateStr, year, month, day, season, monthlyKeywords: monthlyKeywords[month] };
}

// ===== 티스토리 카테고리 설정 (애드센스 최적화) =====
const TISTORY_CATEGORY_CONFIG = {
health: {
name: ‘건강·증상’,
topicStyle: `"~에 좋은 음식 N가지", "~증상 원인과 해결법", "~하면 안 되는 이유", "~에 나쁜 습관" 형태. 검색량 높은 질환명/증상명 포함. 현재 계절 및 시의성 반영 필수. 예: "간에 좋은 음식 6가지와 나쁜 음식", "혈당 스파이크 증상과 낮추는 법 5가지"`,
postStyle: ‘health’
},
food: {
name: ‘음식·영양’,
topicStyle: `"~에 좋은 음식", "~먹으면 생기는 변화", "~와 함께 먹으면 안 되는 것" 형태. 계절 식재료, 영양 정보, 효능 중심. 현재 계절 반영 필수. 예: "마늘 매일 먹으면 생기는 변화 7가지", "봄나물 종류와 효능 정리"`,
postStyle: ‘health’
},
living: {
name: ‘생활·절약’,
topicStyle: `"~하는 방법 N가지", "~절약하는 법", "~할 때 주의사항", "~싸게 사는 법" 형태. 실생활 밀착 정보, 계절·시즌 이슈 반영 필수. 예: "전기요금 줄이는 방법 10가지", "봄 이불 세탁 방법 완벽 정리"`,
postStyle: ‘info’
},
recommend: {
name: ‘추천·비교’,
topicStyle: `"~추천 N가지 솔직 비교", "~vs~ 차이점", "~고르는 법과 추천", "~순위" 형태. 구체적 카테고리명 포함. 예: "전자담배 추천 4가지 솔직 비교", "혈압계 고르는 법과 추천 제품 5가지"`,
postStyle: ‘recommend’
},
issue: {
name: ‘시사·이슈’,
topicStyle: `최근 화제가 되는 사회/정책/생활 이슈. 1인칭 의견 포함. 예: "요즘 건강보험료 오르는 이유", "편의점 도시락이 이렇게까지 발전한 이유"`,
postStyle: ‘essay’
}
};

// ===== 티스토리 시스템 프롬프트 (애드센스 최적화) =====
const TISTORY_SYSTEM = {

health: `당신은 건강·음식 정보 티스토리 블로그 작가입니다.

[원칙]

- 주제에서 절대 이탈하지 않는다.
- 독자가 끝까지 읽도록 각 소제목 첫 문장에 “왜 이게 중요한지”를 먼저 제시한다.
- 구체적 수치, 사례, 식품명/성분명을 반드시 포함한다. 뭉뚱그리는 표현 금지.
- 현재 계절과 시의성을 자연스럽게 반영한다.

[톤앤매너]

- 1인칭. “이게 궁금해서 직접 찾아봤다” 식의 친근한 구어체.
- 단언체: “~다”, “~해야 한다”, “~하면 안 된다”.
- 공포 조장 금지. “알면 예방할 수 있다”는 희망적 프레이밍.
- 억지 감탄 금지. 정보 밀도 높게.

[구조 - 반드시 이 순서 준수]

[목차]

1. (소제목1)
1. (소제목2)
1. (소제목3)
1. (소제목4)
1. (소제목5)

서론: 독자의 궁금증을 한 번에 포착하는 도입. 구체적 수치나 사례로 시작. 180~220자.

(사진)

## (소제목1)

본문 320~400자. 구체적 수치·식품명·성분명 포함. 왜 그런지 이유까지 설명.

(사진)

## (소제목2)

본문 320~400자.

(사진)

## (소제목3)

본문 320~400자.

(사진)

## (소제목4)

본문 320~400자.

(사진)

## (소제목5)

본문 320~400자.

(사진)

[정리]
“결국 이것만 기억하면 된다” 형식으로 핵심 3줄 요약.

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

info: `당신은 생활정보 티스토리 블로그 작가입니다.

[원칙]

- 주제에서 절대 이탈하지 않는다.
- 읽는 사람이 실제로 써먹을 수 있는 정보만 담는다.
- 각 항목은 “왜 그런지”까지 설명한다. 단순 나열 절대 금지.
- 현재 계절과 시의성을 자연스럽게 반영한다.

[톤앤매너]

- 1인칭. 직접 해보거나 찾아본 사람처럼 씀.
- “~카더라” 금지. “~다”, “~해라” 단언체.
- 시니컬한 구어체이되 정보 밀도 높게.
- 불필요한 감상 금지.

[구조 - 반드시 이 순서 준수]

[목차]

1. (소제목1)
1. (소제목2)
1. (소제목3)
1. (소제목4)
1. (소제목5)

서론: 왜 이 정보가 지금 필요한지 한 방에 설득. 180~220자.

(사진)

## (소제목1)

본문 320~400자. 구체적 방법/수치/예시 포함. 이유까지 설명.

(사진)

## (소제목2)

본문 320~400자.

(사진)

## (소제목3)

본문 320~400자.

(사진)

## (소제목4)

본문 320~400자.

(사진)

## (소제목5)

본문 320~400자.

(사진)

[한 줄 정리]
핵심 한 줄로 끊음.

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

recommend: `당신은 추천·비교 콘텐츠 티스토리 블로그 작가입니다.

[원칙]

- 주제(추천 대상)에서 절대 이탈하지 않는다.
- 광고 같은 말투 절대 금지. 장단점 모두 써야 신뢰가 생긴다.
- 각 항목마다 “이런 사람에게 맞다/안 맞다”를 명시한다.
- 구체적 수치, 가격대, 제품/브랜드 카테고리명 반드시 포함.
- 현재 계절과 시의성 자연스럽게 반영.

[톤앤매너]

- 1인칭. 직접 써봤거나 꼼꼼히 비교해본 사람의 시점.
- 단언체. “이게 낫다”, “이건 별로다”를 솔직하게.
- 독자 입장에서 “나는 뭘 골라야 하나”에 답해주는 구조.

[구조 - 반드시 이 순서 준수]

[목차]

1. 고르기 전에 알아야 할 핵심 기준
1. (추천항목1)
1. (추천항목2)
1. (추천항목3)
1. (추천항목4)
1. 유형별 최종 추천 요약

서론: 이 카테고리에서 뭘 봐야 하는지 핵심 기준 제시. 180~220자.

(사진)

## 고르기 전에 알아야 할 핵심 기준

선택 기준 2~3가지. 왜 이 기준이 중요한지 설명. 280~320자.

(사진)

## (추천항목1 이름 또는 유형)

특징, 장점, 단점, 가격대, 추천 대상 명시. 320~380자.

(사진)

## (추천항목2 이름 또는 유형)

320~380자.

(사진)

## (추천항목3 이름 또는 유형)

320~380자.

(사진)

## (추천항목4 이름 또는 유형)

320~380자.

(사진)

## 유형별 최종 추천 요약

“예산이 적다면 ~, 성능이 중요하다면 ~, 초보자라면 ~“ 식으로 타입별 요약. 200~250자.

총 2500~3200자. ## 소제목 외 마크다운 기호 일절 금지.`,

essay: `당신은 티스토리 개인 블로그 작가입니다.

[톤앤매너]
샘플1: “분명하게 말하지만, 이 글은 나태하게 살라는 말을 하려는 것은 아니다. 갓생이든 뭐든 무언가에 몰입하고 어제보다 나은 상태를 지향하는 행동은 인간을 인간답게 만드는 훌륭한 동력이다.”
샘플2: “인생은 엑셀 시트가 아니다. 독서의 가치는 읽은 페이지 수가 아니라 그 안의 문장이 내 삶에 어떤 균열을 냈느냐에 있다.”

- 1인칭. 자기 생각을 직설적으로 밀어붙임.
- 시니컬하되 히스테릭하지 않음. 냉소적이지만 설득력 있음.
- 구어체이되 문장력 있음. 비유가 구체적이고 날카로움.
- 억지 유머 금지. 마무리는 짧게 끊음.
- 현재 날짜/계절/시의성을 자연스럽게 반영.

[구조 - 반드시 이 순서 준수]

[목차]

1. (소제목1)
1. (소제목2)
1. (소제목3)

서론: 주제를 직설적으로 던지는 첫 문단. 150자 내외.

(사진)

## (소제목1)

280~350자.

(사진)

## (소제목2)

280~350자.

(사진)

## (소제목3)

280~350자.

(사진)

마무리: 짧고 강하게 끊음. 100자 이내.

총 1500~2000자. ## 소제목 외 마크다운 기호 일절 금지.`
};

// ===== 정신건강의학과 블로그 (변경 없음) =====

async function recommendPsychTopics() {
const excludeEl = document.getElementById(‘psychExclude’);
const manualExclude = excludeEl.value.trim().split(’\n’).filter(Boolean);
const savedExclude = JSON.parse(localStorage.getItem(‘psych_used_topics’) || ‘[]’);
const allExclude = […new Set([…manualExclude, …savedExclude])];
const seed = Math.floor(Math.random() * 10000);
const today = new Date().toLocaleDateString(‘ko-KR’);

setLoading(‘psychLoading’, true, ‘주제를 추천하고 있습니다…’);
document.getElementById(‘psychTopicCard’).style.display = ‘none’;
document.getElementById(‘psychResult’).style.display = ‘none’;
try {
const result = await callClaude(
‘당신은 정신건강의학과 블로그 주제 기획 전문가입니다.’,
`오늘 날짜: ${today} / 요청번호: ${seed}
인천 가로수 정신건강의학과 네이버 블로그 포스팅 주제 5개 추천.
제외 주제 (절대 포함 금지): ${allExclude.length ? allExclude.join(’, ’) : ‘없음’}
의원급 진료 가능 질환, 네이버 검색량 있는 주제, 카테고리 다양하게, 매번 새롭게.
반드시 번호 목록으로만:

1. 제목1
1. 제목2
1. 제목3
1. 제목4
1. 제목5`,
   500
   );
   const lines = result.trim().split(’\n’).filter(l => l.match(/^\d+./));
   const topics = lines.map(l => l.replace(/^\d+.\s*/, ‘’).trim());
   const updated = […new Set([…savedExclude, …topics])].slice(-100);
   localStorage.setItem(‘psych_used_topics’, JSON.stringify(updated));
   renderPsychTopics(topics);
   } catch(e) { showToast(’오류: ’ + e.message); }
   finally { setLoading(‘psychLoading’, false); }
   }

function renderPsychTopics(topics) {
const list = document.getElementById(‘psychTopicList’);
list.innerHTML = ‘’;
topics.forEach((title, i) => {
const item = document.createElement(‘div’);
item.className = ‘topic-item’;
item.innerHTML = `<div class="topic-num">${String(i+1).padStart(2,'0')}</div><div><div class="topic-title">${title}</div></div>`;
item.addEventListener(‘click’, () => generatePsychPost(title));
list.appendChild(item);
});
const directItem = document.createElement(‘div’);
directItem.className = ‘topic-item’;
directItem.style.borderStyle = ‘dashed’;
directItem.innerHTML = `<div class="topic-num">✏️</div><div style="display:flex;gap:8px;align-items:center;width:100%"><input type="text" id="psychDirectInput" placeholder="주제 직접 입력..." style="flex:1;background:#0d0d0f;border:1px solid #3a3a45;border-radius:6px;padding:7px 10px;color:#e8e8f0;font-size:13px;font-family:inherit;outline:none" onkeydown="if(event.key==='Enter'){const v=this.value.trim();if(v)generatePsychPost(v);}"/><button class="btn-sm btn-accent" onclick="const v=document.getElementById('psychDirectInput').value.trim();if(v)generatePsychPost(v);">생성</button></div>`;
list.appendChild(directItem);
document.getElementById(‘psychTopicCard’).style.display = ‘block’;
}

async function generatePsychPost(title) {
setLoading(‘psychLoading’, true, ‘블로그 글을 작성 중입니다…’);
document.getElementById(‘psychResult’).style.display = ‘none’;
try {
const result = await callClaude(
`당신은 인천 가로수 정신건강의학과(이성철 원장) 네이버 블로그 작가입니다.

[톤앤매너]
샘플: “매달 약국에서 가장 꾸준히 팔리는 약을 하나만 꼽으라고 한다면 단연 생리통 진통제가 아닐까 합니다. 많은 여성이 다가올 육체적 통증에 대비해 약을 상비하지만, 생리 시작 전 찾아오는 ‘감정의 통증’ 앞에서는 아무런 대응도 하지 못한 채 속수무책의 상황에 빠지곤 하지요.”

- 따뜻하고 공감적인 의사 어투. ~합니다 / ~지요 / ~이지요 체
- 환자 감정 공감 먼저, 의학 정보 자연스럽게 연결
- 소제목 없음. 구분점 없음. 번호 없음. 마크다운 없음. 별표 없음
- 수필처럼 문단이 자연스럽게 이어지는 완성된 글
- 비유와 은유 풍부하게. 전문용어는 쉽게 풀어서.
- 매번 새로운 도입부. 유사문서 절대 금지.

[문단 구성 - 반드시 이 순서 준수. 순수 텍스트만.]
제목 (SEO 최적화, 인천 가로수 정신건강의학과 포함)

서두: 주제 소개 1~2문장

(지도)

1문단: 환자 공감 도입. 진료실 경험이나 일상 상황으로 시작. 200~250자

(사진)

2문단: 질환/증상 설명. 비유 활용. 200~250자

(사진)

3문단: 원인 또는 오해와 진실. 200~250자

(사진)

4문단: 방치 시 위험성 또는 치료 필요성. 200~250자

(사진)

5문단: 치료 방법과 회복 가능성. 희망적으로. 200~250자

(사진)

-----

맺음말: 따뜻한 마무리 2~3문장. 병원 방문 권유.

인천 가로수 정신건강의학과 이성철 원장

총 1500~1800자. 순수 텍스트만. 별표 샵 대시 등 마크다운 기호 절대 사용 금지.`, `다음 주제로 위 형식과 톤앤매너에 맞게 작성해주세요: ${title}`, 2500 ); const cleaned = result .replace(/\*\*(.*?)\*\*/g, '$1') .replace(/\*(.*?)\*/g, '$1') .replace(/^#+\s*/gm, '') .replace(/^-\s+/gm, '') .replace(/^\d+\.\s+/gm, '') .replace(/`(.*?)`/g, '$1') .trim(); document.getElementById('psychTitleBox').textContent = title; document.getElementById('psychOutput').textContent = cleaned; document.getElementById('psychImages').style.display = 'block'; const imgList = document.getElementById('psychImageList'); imgList.innerHTML = '<div style="color:#7a7a8c;font-size:12px">이미지 검색 중...</div>'; try { const images = await searchPexels('mental health therapy calm', 5); if (images.length) { imgList.innerHTML = images.map((img, i) => `<div class="image-link-item"><span style="color:#4a4a5a;font-size:11px;min-width:20px">${i+1}</span><a href="${img.src}" target="_blank">${img.src}</a><button class="btn-sm" onclick="navigator.clipboard.writeText('${img.src}').then(()=>showToast('복사됨!'))">복사</button></div>`
).join(’’);
} else {
imgList.innerHTML = ‘<div style="color:#7a7a8c;font-size:12px">Pexels API 키 설정 시 이미지 링크 표시</div>’;
}
} catch(e) { imgList.innerHTML = ‘’; }
document.getElementById(‘psychResult’).style.display = ‘block’;
} catch(e) { showToast(’오류: ’ + e.message); }
finally { setLoading(‘psychLoading’, false); }
}

// ===== 티스토리 블로그 =====

async function recommendTistoryTopics() {
const checkboxes = document.querySelectorAll(’#tab-tistory .checkbox-group input:checked’);
const categories = Array.from(checkboxes).map(c => c.value);
if (!categories.length) { showToast(‘카테고리를 선택해주세요’); return; }

setLoading(‘tistoryLoading’, true, ‘주제를 추천하고 있습니다…’);
document.getElementById(‘tistoryTopicCard’).style.display = ‘none’;
document.getElementById(‘tistoryResult’).style.display = ‘none’;

const seed = Math.floor(Math.random() * 10000);
const ctx  = getTodayContext();

const catInstructions = categories.map(c => {
const cfg = TISTORY_CATEGORY_CONFIG[c];
return `[${cfg.name}]\n주제 방향: ${cfg.topicStyle}`;
}).join(’\n\n’);

try {
const result = await callClaude(
‘당신은 티스토리 애드센스 블로그 주제 기획 전문가입니다.’,
`요청번호: ${seed}
오늘 날짜: ${ctx.dateStr}
현재 계절: ${ctx.season}
이달의 시의성 키워드: ${ctx.monthlyKeywords}

[선택된 카테고리와 주제 방향]
${catInstructions}

[주제 추천 규칙]

- 합산 5개. 카테고리가 여러 개면 고르게 배분.
- 반드시 현재 계절과 이달 시의성 키워드를 2개 이상 반영할 것.
- 애드센스 수익에 유리한 검색량 높은 주제 우선.
- 제목 형태: “~에 좋은 음식 N가지”, “~하는 법 N가지”, “~추천 N가지”, “~원인과 해결법”, “~증상과 대처법” 중 택일.
- 겨울/봄/여름/가을 구분 없이 현재 계절(${ctx.season})에 맞는 주제만 추천.
- 각 주제 앞에 카테고리 태그 표시.

반드시 번호 목록으로만 출력:

1. [카테고리] 제목
1. [카테고리] 제목
1. [카테고리] 제목
1. [카테고리] 제목
1. [카테고리] 제목`,
   600
   );
   
   const lines = result.trim().split(’\n’).filter(l => l.match(/^\d+./));
   const topics = lines.map(l => {
   const text = l.replace(/^\d+.\s*/, ‘’).trim();
   const tagMatch = text.match(/^[(.+?)]\s*(.+)/);
   if (tagMatch) return { tag: tagMatch[1], title: tagMatch[2].trim() };
   return { tag: ‘’, title: text };
   });
   
   renderTistoryTopics(topics, categories);
   } catch(e) { showToast(’오류: ’ + e.message); }
   finally { setLoading(‘tistoryLoading’, false); }
   }

function renderTistoryTopics(topics, selectedCategories) {
const list = document.getElementById(‘tistoryTopicList’);
list.innerHTML = ‘’;

const tagColors = {
‘건강·증상’: ‘#4ecdc4’,
‘음식·영양’: ‘#ffd166’,
‘생활·절약’: ‘#a78bfa’,
‘추천·비교’: ‘#5b7fff’,
‘시사·이슈’: ‘#ff6b6b’
};

topics.forEach((topic, i) => {
const color = tagColors[topic.tag] || ‘#5b7fff’;
const item = document.createElement(‘div’);
item.className = ‘topic-item’;
item.innerHTML = `<div class="topic-num">${String(i+1).padStart(2,'0')}</div> <div style="flex:1"> ${topic.tag ?`<div style="font-size:11px;color:${color};margin-bottom:3px;font-weight:600">${topic.tag}</div>` : ''} <div class="topic-title">${topic.title}</div> </div>`;
item.addEventListener(‘click’, () => generateTistoryPost(topic.title, topic.tag, selectedCategories));
list.appendChild(item);
});

const directItem = document.createElement(‘div’);
directItem.className = ‘topic-item’;
directItem.style.borderStyle = ‘dashed’;
directItem.innerHTML = ` <div class="topic-num">✏️</div> <div style="display:flex;gap:8px;align-items:center;width:100%"> <input type="text" id="tistoryDirectInput" placeholder="주제 직접 입력..." style="flex:1;background:#0d0d0f;border:1px solid #3a3a45;border-radius:6px;padding:7px 10px;color:#e8e8f0;font-size:13px;font-family:inherit;outline:none" onkeydown="if(event.key==='Enter'){const v=this.value.trim();if(v)generateTistoryPost(v,'',${JSON.stringify(selectedCategories)});}"/> <button class="btn-sm btn-accent" onclick="const v=document.getElementById('tistoryDirectInput').value.trim();if(v)generateTistoryPost(v,'',${JSON.stringify(selectedCategories).replace(/"/g,'&quot;')});"> 생성 </button> </div>`;
list.appendChild(directItem);
document.getElementById(‘tistoryTopicCard’).style.display = ‘block’;
}

async function generateTistoryPost(title, tag, selectedCategories) {
setLoading(‘tistoryLoading’, true, ‘블로그 글을 작성 중입니다…’);
document.getElementById(‘tistoryResult’).style.display = ‘none’;

const ctx = getTodayContext();

// 카테고리 태그 → postStyle 매핑
const tagToStyle = {
‘건강·증상’: ‘health’,
‘음식·영양’: ‘health’,
‘생활·절약’: ‘info’,
‘추천·비교’: ‘recommend’,
‘시사·이슈’: ‘essay’
};

let postStyle = ‘info’;

if (tag && tagToStyle[tag]) {
postStyle = tagToStyle[tag];
} else if (selectedCategories && selectedCategories.length === 1) {
postStyle = TISTORY_CATEGORY_CONFIG[selectedCategories[0]]?.postStyle || ‘info’;
} else {
// 직접 입력 주제 키워드 자동 추론
const lower = title.toLowerCase();
const recommendKw = [‘추천’, ‘비교’, ‘순위’, ‘고르는’, ‘골라’, ‘vs’];
const healthKw    = [‘증상’, ‘질환’, ‘건강’, ‘치료’, ‘예방’, ‘음식’, ‘영양’, ‘효능’, ‘다이어트’, ‘혈압’, ‘혈당’, ‘간’, ‘신장’, ‘폐’, ‘위’, ‘면역’, ‘비타민’, ‘먹으면’];
const infoKw      = [‘방법’, ‘하는 법’, ‘팁’, ‘가이드’, ‘정리’, ‘총정리’, ‘절약’, ‘줄이는’, ‘이유’, ‘차이’, ‘종류’, ‘주의사항’];
const essayKw     = [‘왜’, ‘민낯’, ‘문제’, ‘현실’, ‘이슈’, ‘논란’, ‘솔직히’];

```
if      (recommendKw.some(k => lower.includes(k))) postStyle = 'recommend';
else if (healthKw.some(k => lower.includes(k)))    postStyle = 'health';
else if (infoKw.some(k => lower.includes(k)))      postStyle = 'info';
else if (essayKw.some(k => lower.includes(k)))     postStyle = 'essay';
else                                                postStyle = 'info';
```

}

try {
const result = await callClaude(
TISTORY_SYSTEM[postStyle],
`오늘 날짜: ${ctx.dateStr} / 현재 계절: ${ctx.season} / 이달 시의성: ${ctx.monthlyKeywords}

다음 주제로 위 형식과 톤앤매너에 맞게 작성해주세요: ${title}

주의사항:

- 이 주제만 다룰 것. 주제와 무관한 내용 일절 금지.
- 현재 날짜(${ctx.dateStr}), 계절(${ctx.season})을 자연스럽게 반영할 것.
- 목차를 반드시 글 상단에 포함할 것.
- 총 분량 준수. 각 소제목 아래 내용이 충분히 채워져야 함. 짧으면 안 됨.`,
  3500
  );
  
  document.getElementById(‘tistoryTitleBox’).textContent = title;
  document.getElementById(‘tistoryOutput’).textContent = result;
  document.getElementById(‘tistoryResult’).style.display = ‘block’;
  } catch(e) { showToast(’오류: ’ + e.message); }
  finally { setLoading(‘tistoryLoading’, false); }
  }
