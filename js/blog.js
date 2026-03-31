// ===== blog.js =====

async function recommendPsychTopics() {
  const excludeEl = document.getElementById('psychExclude');
  const exclude = excludeEl.value.trim().split('\n').filter(Boolean);
  setLoading('psychLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('psychTopicCard').style.display = 'none';
  document.getElementById('psychResult').style.display = 'none';
  try {
    const result = await callClaude(
      '당신은 정신건강의학과 블로그 주제 기획 전문가입니다.',
      `인천 가로수 정신건강의학과 네이버 블로그 포스팅 주제 5개를 추천해주세요.
제외 주제: ${exclude.length ? exclude.join(', ') : '없음'}
의원급 진료 가능 질환, 네이버 검색량 있는 주제, 카테고리 다양하게.

반드시 아래 형식으로만 답하세요. 번호와 제목만:
1. 제목1
2. 제목2
3. 제목3
4. 제목4
5. 제목5`,
      500
    );
    const lines = result.trim().split('\n').filter(l => l.match(/^\d+\./));
    const topics = lines.map(l => l.replace(/^\d+\.\s*/, '').trim());
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
따뜻하고 공감적인 의사 어투로 작성합니다.
(사진) 표시를 각 단락 사이에 넣어주세요.
마지막에 반드시 "인천 가로수 정신건강의학과 이성철 원장" 을 넣어주세요.`,
      `다음 주제로 네이버 블로그 글을 작성해주세요: ${title}
800자 이상, SEO 최적화, 소제목 포함, (사진) 위치 표시 포함.
제목도 맨 위에 써주세요.`,
      2000
    );
    document.getElementById('psychTitleBox').textContent = title;
    document.getElementById('psychOutput').textContent = result;
    document.getElementById('psychImages').style.display = 'block';
    const imgList = document.getElementById('psychImageList');
    imgList.innerHTML = '<div style="color:#7a7a8c;font-size:12px">이미지 검색 중...</div>';
    try {
      const images = await searchPexels('mental health therapy', 5);
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
  try {
    const result = await callClaude(
      '당신은 티스토리 개인 블로그 주제 기획자입니다.',
      `카테고리: ${catNames}
공감되고 유머있는 개인 블로그 주제 5개를 번호 목록으로만 답해주세요.
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
1인칭, 솔직하고 유머있는 구어체로 씁니다.
소제목은 ## 형식으로, 사진 위치는 (사진) 으로 표시해주세요.`,
      `다음 주제로 티스토리 블로그 글을 작성해주세요: ${title}
800자 이상, 소제목 포함, (사진) 위치 표시, 마지막은 "끝이다." 류로 마무리.`,
      2000
    );
    document.getElementById('tistoryTitleBox').textContent = title;
    document.getElementById('tistoryOutput').textContent = result;
    document.getElementById('tistoryResult').style.display = 'block';
  } catch(e) { showToast('오류: ' + e.message); }
  finally { setLoading('tistoryLoading', false); }
}
