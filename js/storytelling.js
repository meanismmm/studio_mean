// ===== storytelling.js — 스토리텔링 숏츠 =====

let selectedTopic = null;

async function recommendTopics() {
  const checkboxes = document.querySelectorAll('#tab-storytelling .checkbox-group input:checked');
  const categories = Array.from(checkboxes).map(c => c.value);
  if (!categories.length) { showToast('카테고리를 하나 이상 선택해주세요'); return; }

  const rangeEl = document.querySelector('input[name="topicRange"]:checked');
  const range = rangeEl?.value || 'all';

  setLoading('storytellingLoading', true, '주제를 추천하고 있습니다...');
  document.getElementById('topicListCard').style.display = 'none';
  document.getElementById('storytellingResult').style.display = 'none';

  const catMap = {
    conspiracy: '음모론', universe: '우주', mystery: '미스터리',
    history: '역사 미스터리', paranormal: '초자연현상'
  };
  const catNames = categories.map(c => catMap[c] || c).join(', ');

  const rangeDesc = {
    all: '유명한 주제와 덜 알려진 흥미로운 주제를 골고루 섞어서',
    famous: '이미 많이 알려진 유명한 주제로만',
    hidden: '아직 많이 알려지지 않았지만 서사가 강하고 흥미로운 주제로만'
  }[range];

  try {
    const result = await callClaude(
      '당신은 유튜브 숏츠 주제 기획 전문가입니다. 반드시 순수 JSON만 반환하세요.',
      `카테고리: ${catNames}
조건: ${rangeDesc} 5개의 숏츠 주제를 추천해주세요.
각 주제는 유튜브 숏츠에서 조회수가 잘 나오는, 훅이 강한 주제여야 합니다.

JSON 형식:
{
  "topics": [
    {
      "title": "주제 제목 (한국어, 강렬하게)",
      "category": "카테고리",
      "hook": "첫 문장 훅 (시청자를 멈추게 할 한 문장)",
      "summary": "주제 요약 (2-3문장)",
      "famousness": "유명함/덜알려짐"
    }
  ]
}`,
      800
    );

    const clean = result.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    renderTopicList(data.topics);
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('storytellingLoading', false);
  }
}

function renderTopicList(topics) {
  const list = document.getElementById('topicList');
  list.innerHTML = '';

  topics.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.innerHTML = `
      <div class="topic-num">${String(i+1).padStart(2,'0')}</div>
      <div>
        <div class="topic-title">${t.title}</div>
        <div class="topic-desc">${t.category} · ${t.famousness}</div>
        <div class="topic-desc" style="margin-top:3px;font-style:italic">"${t.hook}"</div>
      </div>
    `;
    item.addEventListener('click', () => generateStoryScript(t));
    list.appendChild(item);
  });

  document.getElementById('topicListCard').style.display = 'block';
}

async function generateStoryScript(topic) {
  selectedTopic = topic;
  setLoading('storytellingLoading', true, `"${topic.title}" 스크립트 생성 중...`);
  document.getElementById('storytellingResult').style.display = 'none';

  const systemPrompt = `당신은 유튜브 숏츠 전문 스크립트 작가입니다.
음모론·우주·미스터리 등 흥미로운 주제로 시청자를 끌어당기는 강렬한 스크립트를 씁니다.
스크립트 구조: 훅(3초) → 사실 제시 → 반전/핵심 포인트 → CTA
반드시 순수 JSON만 반환하세요.`;

  try {
    const result = await callClaude(
      systemPrompt,
      `주제: ${topic.title}
카테고리: ${topic.category}
훅: ${topic.hook}
요약: ${topic.summary}

위 주제로 유튜브 숏츠 스크립트를 한국어와 영어 둘 다 작성해주세요.
총 영상 길이: 50~60초

JSON 형식:
{
  "ko": {
    "title": "영상 제목 (한국어, SEO 최적화)",
    "scenes": [
      {"no": 1, "duration": 3, "visual": "화면 설명", "caption": "자막", "narration": "나레이션"},
      {"no": 2, "duration": 8, "visual": "화면 설명", "caption": "자막", "narration": "나레이션"},
      {"no": 3, "duration": 8, "visual": "화면 설명", "caption": "자막", "narration": "나레이션"},
      {"no": 4, "duration": 10, "visual": "반전 장면", "caption": "자막", "narration": "나레이션"},
      {"no": 5, "duration": 8, "visual": "결론 장면", "caption": "자막", "narration": "나레이션"},
      {"no": 6, "duration": 3, "visual": "CTA", "caption": "구독 유도", "narration": "CTA"}
    ],
    "fullNarration": "전체 나레이션",
    "hashtags": ["#태그1", "#태그2", "#태그3", "#태그4", "#태그5"]
  },
  "en": {
    "title": "Video title (English, SEO optimized)",
    "scenes": [
      {"no": 1, "duration": 3, "visual": "scene description", "caption": "caption", "narration": "narration"},
      {"no": 2, "duration": 8, "visual": "scene description", "caption": "caption", "narration": "narration"},
      {"no": 3, "duration": 8, "visual": "scene description", "caption": "caption", "narration": "narration"},
      {"no": 4, "duration": 10, "visual": "twist scene", "caption": "caption", "narration": "narration"},
      {"no": 5, "duration": 8, "visual": "conclusion", "caption": "caption", "narration": "narration"},
      {"no": 6, "duration": 3, "visual": "CTA", "caption": "subscribe CTA", "narration": "CTA"}
    ],
    "fullNarration": "full narration text",
    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
  }
}`,
      2000
    );

    const clean = result.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    renderStoryScript(data, topic.title);
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('storytellingLoading', false);
  }
}

function formatScriptText(script) {
  let text = `📌 제목: ${script.title}\n\n${'─'.repeat(40)}\n\n`;
  (script.scenes || []).forEach(s => {
    text += `[장면 ${s.no}] ${s.duration}초\n`;
    text += `📸 화면: ${s.visual}\n`;
    text += `💬 자막: ${s.caption}\n`;
    text += `🎙 나레이션: ${s.narration}\n\n`;
  });
  text += `${'─'.repeat(40)}\n${(script.hashtags || []).join(' ')}`;
  return text;
}

function renderStoryScript(data, topicTitle) {
  document.getElementById('storyScriptKo').textContent = formatScriptText(data.ko);
  document.getElementById('storyScriptEn').textContent = formatScriptText(data.en);
  document.getElementById('storytellingResult').style.display = 'block';
}
