// ===== blog.js — 정신과 블로그 + 티스토리 =====

function safeJSON(text) {
  let clean = text.replace(/```json|```/g, '').trim();
  const first = Math.min(
    clean.indexOf('{') === -1 ? Infinity : clean.indexOf('{'),
    clean.indexOf('[') === -1 ? Infinity : clean.indexOf('[')
  );
  const last = Math.max(clean.lastIndexOf('}'), clean.lastIndexOf(']'));
  if (first !== Infinity && last !== -1) clean = clean.slice(first, last + 1);
  return JSON.parse(clean);
}

async function recommendPsychTopics() {
  const excludeEl = document.getElementById('psychExclude');
  const exclude = excludeEl.value.trim().split('\n').filter(Boolean);
  setLoading('psychLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('psychTopicCard').style.display = 'none';
  document.getElementById('psychResult').style.display = 'none';
  try {
    const result = await callClaude(
      '당신은 정신건강의학과 블로그 주제 기획 전문가입니다. 반드시 순수 JSON만 반환하세요. 마크다운 없이.',
      `인천 가로수 정신건강의학과 네이버 블로그 포스팅 주제 5개 추천.
제외: ${exclude.length ? exclude.join(', ') : '없음'}
의원급 진료 가능 질환, 네이버 검색량 있는 주제, 카테고리 다양하게.
JSON만: {"topics":[{"title":"제목","disease":"질환","angle":"각도","summary":"요약","searchKeyword":"키워드"}]}`,
      1000
    );
    const data = safeJSON(result);
    renderPsychTopics(data.topics);
  } catch(e) { showToast('오류: ' + e.message); }
  finally { setLoading('psychLoading', false); }
}

function renderPsychTopics(topics) {
  const list = document.getElementById('psychTopicList');
  list.innerHTML = '';
  topics.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.innerHTML = `<div class="topic-num">${String(i+1).padStart(2,'0')}</div><div><div class="topic-title">${t.title}</div><div class="topic-desc">${t.disease} · ${t.angle}</div><div class="topic-desc">${t.summary}</div></div>`;
    item.addEventListener('click', () => generatePsychPost(t));
    list.appendChild(item);
  });
  document.getElementById('psychTopicCard').style.display = 'block';
}

async function generatePsychPost(topic) {
  setLoading('psychLoading', true, '블로그 글을 작성 중입니다...');
  document.getElementById('psychResult').style.display = 'none';
  try {
    const result = await callClaude(
      '당신은 인천 가로수 정신건강의학과(이성철 원장) 네이버 블로그 작가입니다. 따뜻하고 공감적인 의사 어투. 반드시 순수 JSON만 반환. 마크다운 없이.',
      `주제: ${topic.title} / 질환: ${topic.disease} / 각도: ${topic.angle} / 키워드: ${topic.searchKeyword}
JSON형식: {"title":"제목","intro":"감성적도입150자이상","sections":[{"heading":"【소제목】","content":"본문200자이상"},{"heading":"【소제목】","content":"본문200자이상"},{"heading":"【소제목】","content":"본문200자이상"}],"closing":"마무리100자이상","pexelsQuery":"english keyword"}`,
      3000
    );
    const post = safeJSON(result);
    await renderPsychPost(post);
  } catch(e) { showToast('오류: ' + e.message); }
  finally { setLoading('psychLoading', false); }
}

async function renderPsychPost(post) {
  document.getElementById('psychTitleBox').textContent = post.title || '';
  let content = (post.intro || '') + '\n\n(사진)\n\n';
  (post.sections || []).forEach(s => { content += `${s.heading}\n\n${s.content}\n\n(사진)\n\n`; });
  content += (post.closing || '') + '\n\n---\n\n인천 가로수 정신건강의학과 이성철 원장';
  document.getElementById('psychOutput').textContent = content;
  const imgList = document.getElementById('psychImageList');
  imgList.innerHTML = '<div style="color:#7a7a8c;font-size:12px">이미지 검색 중...</div>';
  document.getElementById('psychImages').style.display = 'block';
  try {
    const images = await searchPexels(post.pexelsQuery || 'mental health therapy', 5);
    if (images.length) {
      imgList.innerHTML = images.map((img, i) => `<div class="image-link-item"><span style="color:#4a4a5a;font-size:11px;min-width:20px">${i+1}</span><a href="${img.src}" target="_blank">${img.src}</a><button class="btn-sm" onclick="navigator.clipboard.writeText('${img.src}').then(()=>showToast('복사됨!'))">복사</button></div>`).join('');
    } else {
      imgList.innerHTML = '<div style="color:#7a7a8c;font-size:12px">Pexels API 키 설정 시 이미지 링크 표시</div>';
    }
  } catch(e) { imgList.innerHTML = '<div style="color:#7a7a8c;font-size:12px">이미지 검색 실패</div>'; }
  document.getElementById('psychResult').style.display = 'block';
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
      '당신은 티스토리 개인 블로그 주제 기획자입니다. 반드시 순수 JSON만 반환. 마크다운 없이.',
      `카테고리: ${catNames}. 공감되고 유머있는 주제 5개.
JSON만: {"topics":[{"title":"제목","category":"카테고리","angle":"접근방식","hook":"첫문장"}]}`,
      800
    );
    const data = safeJSON(result);
    renderTistoryTopics(data.topics);
  } catch(e) { showToast('오류: ' + e.message); }
  finally { setLoading('tistoryLoading', false); }
}

function renderTistoryTopics(topics) {
  const list = document.getElementById('tistoryTopicList');
  list.innerHTML = '';
  topics.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.innerHTML = `<div class="topic-num">${String(i+1).padStart(2,'0')}</div><div><div class="topic-title">${t.title}</div><div class="topic-desc">${t.category} · ${t.angle}</div><div class="topic-desc" style="font-style:italic">"${t.hook}"</div></div>`;
    item.addEventListener('click', () => generateTistoryPost(t));
    list.appendChild(item);
  });
  document.getElementById('tistoryTopicCard').style.display = 'block';
}

async function generateTistoryPost(topic) {
  setLoading('tistoryLoading', true, '블로그 글을 작성 중입니다...');
  document.getElementById('tistoryResult').style.display = 'none';
  try {
    const result = await callClaude(
      '당신은 티스토리 개인 블로그 작가입니다. 1인칭 솔직하고 유머있는 구어체. 반드시 순수 JSON만 반환. 마크다운 없이.',
      `주제: ${topic.title} / 각도: ${topic.angle} / 첫문장힌트: ${topic.hook}
JSON형식: {"title":"최종제목","intro":"도입150자이상","sections":[{"heading":"소제목","content":"본문200자이상"},{"heading":"소제목","content":"본문200자이상"},{"heading":"소제목","content":"본문200자이상"}],"closing":"마무리"}`,
      3000
    );
    const post = safeJSON(result);
    renderTistoryPost(post);
  } catch(e) { showToast('오류: ' + e.message); }
  finally { setLoading('tistoryLoading', false); }
}

function renderTistoryPost(post) {
  document.getElementById('tistoryTitleBox').textContent = post.title || '';
  let content = (post.intro || '') + '\n\n(사진)\n\n';
  (post.sections || []).forEach(s => { content += `## ${s.heading}\n\n${s.content}\n\n(사진)\n\n`; });
  content += '---\n\n' + (post.closing || '');
  document.getElementById('tistoryOutput').textContent = content;
  document.getElementById('tistoryResult').style.display = 'block';
}
