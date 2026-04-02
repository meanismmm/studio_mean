// ===== quiz.js =====

let currentQuiz = null;

async function generateQuiz() {
  const category = document.getElementById('quizCategory').value;
  const difficulty = document.querySelector('input[name="quizDifficulty"]:checked')?.value || 'normal';
  const lang = document.querySelector('input[name="quizLang"]:checked')?.value || 'ko';

  setLoading('quizLoading', true);
  document.getElementById('quizResult').style.display = 'none';

  const catMap = {
    math:       '수학·논리 문제',
    iq:         'IQ 테스트형 패턴/규칙 찾기',
    psychology: '심리테스트 (선택지형)',
    common:     '상식 퀴즈',
    nonsense:   '넌센스·수수께끼'
  };
  const diffMap = { easy: '쉬움', normal: '보통', hard: '어려움' };
  const isKo = lang === 'ko';

  try {
    const result = await callClaude(
      '당신은 유튜브 숏츠 퀴즈 콘텐츠 전문가입니다. 반드시 순수 JSON만 반환하세요. 마크다운 코드블록 없이 JSON만.',
      `카테고리: ${catMap[category]}
난이도: ${diffMap[difficulty]}
언어: ${isKo ? '한국어' : 'English'}

유튜브 숏츠에서 조회수가 잘 나오는 퀴즈를 하나 만들어주세요.
나레이션은 실제로 읽었을 때 자연스럽고 흥미롭게, 구어체로 작성하세요.

아래 JSON 구조를 정확히 따르세요:

{
  "hookTitle": "시청자를 멈추게 만드는 자극적인 타이틀 (15자 이내)",
  "subTitle": "부제목 또는 보조 설명 한 줄",
  "question": "문제 텍스트 (명확하고 구체적으로)",
  "options": ["선택지A", "선택지B", "선택지C", "선택지D"],
  "answer": "정답 텍스트",
  "answerOption": "A or B or C or D",
  "explanation": "정답 해설 (왜 그런지 근거 포함, 2~3문장)",
  "funFact": "정답과 연관된 흥미로운 추가 사실 1가지",
  "difficulty": "${difficulty}",

  "narration": {
    "hook":      "영상 시작 0~3초. 시청자가 스크롤을 멈추게 만드는 한 마디. 충격적이거나 도발적으로.",
    "intro":     "3~8초. 문제 배경 설명 또는 흥미 유발 2~3문장. 구어체.",
    "question":  "8~20초. 문제를 자연스럽게 읽어주는 나레이션. 선택지도 천천히 읽어줌.",
    "countdown": "20~26초. 긴장감 조성 멘트 후 카운트다운. 예: '과연 정답은? 지금 바로 맞혀보세요! 5... 4... 3... 2... 1...'",
    "reveal":    "26~30초. 정답 공개 직전 한 박자 뜸 들이기. 예: '정답은... 바로!'",
    "answer":    "30~40초. 정답 발표 + 해설 나레이션. 자신감 있고 명확하게.",
    "funFact":   "40~48초. 추가 재미 사실 나레이션. '그런데 알고 계셨나요?' 형식.",
    "outro":     "48~55초. 다음 퀴즈 예고 + 구독/좋아요/알림 CTA. 1~2문장."
  },

  "scenes": [
    {
      "id": 1,
      "name": "훅",
      "timeStart": "0:00",
      "timeEnd": "0:03",
      "duration": "3초",
      "narrationRef": "hook",
      "screenDesc": "화면에 표시할 내용과 레이아웃 설명",
      "captionText": "자막 텍스트 (짧고 강렬하게)",
      "captionStyle": "자막 스타일 설명 (크기, 색상, 위치, 애니메이션)",
      "bgm": "배경음악 무드 및 추천 키워드",
      "sfx": "효과음 설명",
      "transition": "이전 장면에서의 전환 효과",
      "capcut": "CapCut 앱에서 구현하는 방법 단계별 설명",
      "aiImagePrompt": "이 장면 배경/썸네일 생성용 AI 이미지 프롬프트 (영어, Midjourney/DALL-E 호환)",
      "aiVideoPrompt": "이 장면 영상 생성용 AI 프롬프트 (영어, Runway/Sora 호환)"
    },
    {
      "id": 2,
      "name": "인트로",
      "timeStart": "0:03",
      "timeEnd": "0:08",
      "duration": "5초",
      "narrationRef": "intro",
      "screenDesc": "",
      "captionText": "",
      "captionStyle": "",
      "bgm": "",
      "sfx": "",
      "transition": "",
      "capcut": "",
      "aiImagePrompt": "",
      "aiVideoPrompt": ""
    },
    {
      "id": 3,
      "name": "문제",
      "timeStart": "0:08",
      "timeEnd": "0:20",
      "duration": "12초",
      "narrationRef": "question",
      "screenDesc": "",
      "captionText": "",
      "captionStyle": "",
      "bgm": "",
      "sfx": "",
      "transition": "",
      "capcut": "",
      "aiImagePrompt": "",
      "aiVideoPrompt": ""
    },
    {
      "id": 4,
      "name": "카운트다운",
      "timeStart": "0:20",
      "timeEnd": "0:26",
      "duration": "6초",
      "narrationRef": "countdown",
      "screenDesc": "",
      "captionText": "5   4   3   2   1",
      "captionStyle": "",
      "bgm": "",
      "sfx": "",
      "transition": "",
      "capcut": "",
      "aiImagePrompt": "",
      "aiVideoPrompt": ""
    },
    {
      "id": 5,
      "name": "정답공개",
      "timeStart": "0:26",
      "timeEnd": "0:40",
      "duration": "14초",
      "narrationRef": "reveal + answer",
      "screenDesc": "",
      "captionText": "",
      "captionStyle": "",
      "bgm": "",
      "sfx": "",
      "transition": "",
      "capcut": "",
      "aiImagePrompt": "",
      "aiVideoPrompt": ""
    },
    {
      "id": 6,
      "name": "추가정보",
      "timeStart": "0:40",
      "timeEnd": "0:48",
      "duration": "8초",
      "narrationRef": "funFact",
      "screenDesc": "",
      "captionText": "",
      "captionStyle": "",
      "bgm": "",
      "sfx": "",
      "transition": "",
      "capcut": "",
      "aiImagePrompt": "",
      "aiVideoPrompt": ""
    },
    {
      "id": 7,
      "name": "아웃트로",
      "timeStart": "0:48",
      "timeEnd": "0:55",
      "duration": "7초",
      "narrationRef": "outro",
      "screenDesc": "",
      "captionText": "",
      "captionStyle": "",
      "bgm": "",
      "sfx": "",
      "transition": "",
      "capcut": "",
      "aiImagePrompt": "",
      "aiVideoPrompt": ""
    }
  ],

  "thumbnail": {
    "title": "썸네일 메인 텍스트",
    "subText": "썸네일 보조 텍스트",
    "colorScheme": "썸네일 색상 조합 제안",
    "aiPrompt": "썸네일 생성용 AI 이미지 프롬프트 (영어)"
  },

  "hashtags": ["#퀴즈", "#두뇌테스트", "#숏츠", "#IQ테스트", "#수학퀴즈"],
  "title": "유튜브 업로드용 영상 제목",
  "description": "유튜브 영상 설명란 텍스트 (3~5줄)"
}`,
      1800
    );

    const clean = result.replace(/```json|```/g, '').trim();
    currentQuiz = JSON.parse(clean);
    renderQuiz(currentQuiz, lang);
  } catch(e) {
    showToast('퀴즈 생성 오류: ' + e.message);
  } finally {
    setLoading('quizLoading', false);
  }
}


function renderQuiz(quiz, lang) {
  const n = quiz.narration || {};
  const scenes = quiz.scenes || [];

  // ── 1. 퀴즈 기본 정보 ──────────────────────────────────
  document.getElementById('quizOutput').innerHTML = `
    <div class="quiz-section">
      <div class="quiz-label">훅 타이틀</div>
      <div class="quiz-content" style="font-size:20px;font-weight:700;color:#ffd166">${quiz.hookTitle}</div>
      ${quiz.subTitle ? `<div style="margin-top:4px;font-size:13px;color:#7a7a8c">${quiz.subTitle}</div>` : ''}
    </div>

    <div class="quiz-section">
      <div class="quiz-label">문제</div>
      <div class="quiz-content">${quiz.question}</div>
      ${quiz.options?.length ? `
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
          ${quiz.options.map((o, i) => `
            <div style="padding:8px 12px;border-radius:8px;background:#1a1a22;border:1px solid #2a2a35;font-size:13px;color:#e8e8f0">
              <span style="color:#5b7fff;font-weight:700;margin-right:8px">${['A','B','C','D'][i]}</span>${o}
            </div>`).join('')}
        </div>` : ''}
    </div>

    <div class="quiz-section">
      <div class="quiz-label">정답</div>
      <div style="font-size:16px;font-weight:700;color:#4ecdc4;margin-bottom:6px">
        ✅ ${quiz.answerOption ? `(${quiz.answerOption}) ` : ''}${quiz.answer}
      </div>
      <div style="font-size:13px;color:#b0b0c0;line-height:1.7">${quiz.explanation}</div>
      ${quiz.funFact ? `
        <div style="margin-top:10px;padding:10px 12px;border-radius:8px;background:#1a1a22;border-left:3px solid #ffd166;font-size:12px;color:#7a7a8c;line-height:1.7">
          💡 ${quiz.funFact}
        </div>` : ''}
    </div>`;

  // ── 2. 나레이션 전문 ────────────────────────────────────
  const narLines = [
    n.hook      ? `[훅 · 0~3초]\n${n.hook}`           : '',
    n.intro     ? `[인트로 · 3~8초]\n${n.intro}`       : '',
    n.question  ? `[문제 · 8~20초]\n${n.question}`     : '',
    n.countdown ? `[카운트다운 · 20~26초]\n${n.countdown}` : '',
    n.reveal    ? `[정답 예고 · 26~30초]\n${n.reveal}` : '',
    n.answer    ? `[정답 발표 · 30~40초]\n${n.answer}` : '',
    n.funFact   ? `[추가 사실 · 40~48초]\n${n.funFact}` : '',
    n.outro     ? `[아웃트로 · 48~55초]\n${n.outro}`   : '',
  ].filter(Boolean).join('\n\n');

  const narEl = document.getElementById('quizNarrationText');
  if (narEl) {
    narEl.textContent = narLines;
    document.getElementById('quizNarrationBox').style.display = 'block';
  }

  // ── 3. CapCut 장면별 편집 가이드 ───────────────────────
  let capcutBox = document.getElementById('capcutGuideBox');
  if (!capcutBox) {
    capcutBox = document.createElement('div');
    capcutBox.id = 'capcutGuideBox';
    capcutBox.className = 'narration-box';
    document.getElementById('quizResult').appendChild(capcutBox);
  }

  const sceneColors = {
    '훅':       '#ff6b6b',
    '인트로':   '#ffd166',
    '문제':     '#5b7fff',
    '카운트다운': '#f97316',
    '정답공개': '#4ecdc4',
    '추가정보': '#a78bfa',
    '아웃트로': '#34d399'
  };

  capcutBox.innerHTML = `
    <div class="card-title" style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
      <span>📱 CapCut 장면별 편집 가이드</span>
      <button class="btn-sm btn-accent" onclick="window._copyCapcut()">전체 복사</button>
    </div>
    <div style="font-size:12px;color:#7a7a8c;margin-bottom:14px">총 영상 길이: 약 55초 · 장면 수: ${scenes.length}개</div>

    ${scenes.map(s => `
      <div style="margin-bottom:16px;padding:14px;border-radius:10px;background:#12121a;border:1px solid #2a2a35">

        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <span style="padding:3px 10px;border-radius:20px;background:${sceneColors[s.name]||'#5b7fff'}22;color:${sceneColors[s.name]||'#5b7fff'};font-size:12px;font-weight:700">
            SCENE ${s.id} · ${s.name}
          </span>
          <span style="font-size:11px;color:#5a5a6a">${s.timeStart} ~ ${s.timeEnd} (${s.duration})</span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;line-height:1.7">
          <div>
            <div style="color:#5a5a6a;margin-bottom:3px">🎙 나레이션</div>
            <div style="color:#c0c0d0">${n[s.narrationRef] || s.narrationRef || '-'}</div>
          </div>
          <div>
            <div style="color:#5a5a6a;margin-bottom:3px">🖥 화면 구성</div>
            <div style="color:#c0c0d0">${s.screenDesc || '-'}</div>
          </div>
          <div>
            <div style="color:#5a5a6a;margin-bottom:3px">💬 자막 텍스트</div>
            <div style="color:#ffd166;font-weight:600">${s.captionText || '-'}</div>
          </div>
          <div>
            <div style="color:#5a5a6a;margin-bottom:3px">🎨 자막 스타일</div>
            <div style="color:#c0c0d0">${s.captionStyle || '-'}</div>
          </div>
          <div>
            <div style="color:#5a5a6a;margin-bottom:3px">🎵 BGM</div>
            <div style="color:#c0c0d0">${s.bgm || '-'}</div>
          </div>
          <div>
            <div style="color:#5a5a6a;margin-bottom:3px">🔊 효과음</div>
            <div style="color:#c0c0d0">${s.sfx || '-'}</div>
          </div>
          <div>
            <div style="color:#5a5a6a;margin-bottom:3px">✂️ 전환 효과</div>
            <div style="color:#c0c0d0">${s.transition || '-'}</div>
          </div>
          <div>
            <div style="color:#5a5a6a;margin-bottom:3px">📲 CapCut 구현</div>
            <div style="color:#c0c0d0">${s.capcut || '-'}</div>
          </div>
        </div>
      </div>`).join('')}`;

  // ── 4. AI 영상 제작 프롬프트 ────────────────────────────
  let aiBox = document.getElementById('aiPromptBox');
  if (!aiBox) {
    aiBox = document.createElement('div');
    aiBox.id = 'aiPromptBox';
    aiBox.className = 'narration-box';
    document.getElementById('quizResult').appendChild(aiBox);
  }

  aiBox.innerHTML = `
    <div class="card-title" style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
      <span>🤖 AI 영상 제작 프롬프트</span>
      <button class="btn-sm btn-accent" onclick="window._copyAiPrompts()">전체 복사</button>
    </div>

    ${quiz.thumbnail ? `
      <div style="margin-bottom:16px;padding:14px;border-radius:10px;background:#12121a;border:1px solid #2a2a35">
        <div style="font-size:12px;color:#ffd166;font-weight:700;margin-bottom:10px">🖼 썸네일</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;line-height:1.7">
          <div><span style="color:#5a5a6a">메인 텍스트:</span> <span style="color:#e8e8f0">${quiz.thumbnail.title||'-'}</span></div>
          <div><span style="color:#5a5a6a">보조 텍스트:</span> <span style="color:#e8e8f0">${quiz.thumbnail.subText||'-'}</span></div>
          <div><span style="color:#5a5a6a">색상 조합:</span> <span style="color:#e8e8f0">${quiz.thumbnail.colorScheme||'-'}</span></div>
        </div>
        <div style="margin-top:10px">
          <div style="font-size:11px;color:#5a5a6a;margin-bottom:4px">AI 이미지 프롬프트 (Midjourney / DALL-E)</div>
          <div style="padding:8px 10px;background:#0d0d15;border-radius:6px;font-size:11px;color:#a0a0c0;font-family:monospace;line-height:1.6;word-break:break-all">${quiz.thumbnail.aiPrompt||'-'}</div>
          <button class="btn-sm" style="margin-top:6px" onclick="navigator.clipboard.writeText('${(quiz.thumbnail.aiPrompt||'').replace(/'/g,"\\'")}').then(()=>showToast('복사됨!'))">복사</button>
        </div>
      </div>` : ''}

    ${scenes.filter(s => s.aiImagePrompt || s.aiVideoPrompt).map(s => `
      <div style="margin-bottom:12px;padding:14px;border-radius:10px;background:#12121a;border:1px solid #2a2a35">
        <div style="font-size:12px;color:${sceneColors[s.name]||'#5b7fff'};font-weight:700;margin-bottom:10px">
          SCENE ${s.id} · ${s.name} <span style="color:#5a5a6a;font-weight:400">(${s.timeStart}~${s.timeEnd})</span>
        </div>

        ${s.aiImagePrompt ? `
          <div style="margin-bottom:10px">
            <div style="font-size:11px;color:#5a5a6a;margin-bottom:4px">🖼 이미지 프롬프트 (Midjourney / DALL-E)</div>
            <div style="padding:8px 10px;background:#0d0d15;border-radius:6px;font-size:11px;color:#a0a0c0;font-family:monospace;line-height:1.6;word-break:break-all">${s.aiImagePrompt}</div>
            <button class="btn-sm" style="margin-top:6px" onclick="navigator.clipboard.writeText('${(s.aiImagePrompt||'').replace(/'/g,"\\'")}').then(()=>showToast('복사됨!'))">복사</button>
          </div>` : ''}

        ${s.aiVideoPrompt ? `
          <div>
            <div style="font-size:11px;color:#5a5a6a;margin-bottom:4px">🎬 영상 프롬프트 (Runway / Sora)</div>
            <div style="padding:8px 10px;background:#0d0d15;border-radius:6px;font-size:11px;color:#a0a0c0;font-family:monospace;line-height:1.6;word-break:break-all">${s.aiVideoPrompt}</div>
            <button class="btn-sm" style="margin-top:6px" onclick="navigator.clipboard.writeText('${(s.aiVideoPrompt||'').replace(/'/g,"\\'")}').then(()=>showToast('복사됨!'))">복사</button>
          </div>` : ''}
      </div>`).join('')}`;

  // ── 5. 유튜브 업로드 정보 ──────────────────────────────
  let ytBox = document.getElementById('ytInfoBox');
  if (!ytBox) {
    ytBox = document.createElement('div');
    ytBox.id = 'ytInfoBox';
    ytBox.className = 'narration-box';
    document.getElementById('quizResult').appendChild(ytBox);
  }

  ytBox.innerHTML = `
    <div class="card-title" style="margin-bottom:12px">📤 유튜브 업로드 정보</div>
    <div style="font-size:12px;line-height:1.9;color:#c0c0d0">
      <div style="margin-bottom:8px">
        <span style="color:#5a5a6a">제목</span><br>
        <span style="color:#ffd166;font-size:13px;font-weight:600">${quiz.title||quiz.hookTitle||'-'}</span>
        <button class="btn-sm" style="margin-left:8px" onclick="navigator.clipboard.writeText('${(quiz.title||quiz.hookTitle||'').replace(/'/g,"\\'")}').then(()=>showToast('복사됨!'))">복사</button>
      </div>
      <div style="margin-bottom:8px">
        <span style="color:#5a5a6a">설명란</span><br>
        <div style="padding:8px 10px;background:#12121a;border-radius:6px;font-size:12px;color:#a0a0c0;line-height:1.7;white-space:pre-wrap">${quiz.description||'-'}</div>
        <button class="btn-sm" style="margin-top:4px" onclick="navigator.clipboard.writeText('${(quiz.description||'').replace(/'/g,"\\'")}').then(()=>showToast('복사됨!'))">복사</button>
      </div>
      <div>
        <span style="color:#5a5a6a">해시태그</span><br>
        <span style="color:#5b7fff">${(quiz.hashtags||[]).join(' ')}</span>
        <button class="btn-sm" style="margin-left:8px" onclick="navigator.clipboard.writeText('${(quiz.hashtags||[]).join(' ').replace(/'/g,"\\'")}').then(()=>showToast('복사됨!'))">복사</button>
      </div>
    </div>`;

  // ── 전체 복사용 텍스트 생성 ────────────────────────────
  const fullCapcutText = scenes.map(s =>
    `[SCENE ${s.id} · ${s.name}] ${s.timeStart}~${s.timeEnd} (${s.duration})\n` +
    `나레이션: ${n[s.narrationRef] || s.narrationRef || '-'}\n` +
    `화면: ${s.screenDesc || '-'}\n` +
    `자막: ${s.captionText || '-'}\n` +
    `자막스타일: ${s.captionStyle || '-'}\n` +
    `BGM: ${s.bgm || '-'}\n` +
    `효과음: ${s.sfx || '-'}\n` +
    `전환: ${s.transition || '-'}\n` +
    `CapCut: ${s.capcut || '-'}`
  ).join('\n\n');

  const fullAiText = scenes.filter(s => s.aiImagePrompt || s.aiVideoPrompt).map(s =>
    `[SCENE ${s.id} · ${s.name}]\n` +
    (s.aiImagePrompt ? `이미지 프롬프트: ${s.aiImagePrompt}\n` : '') +
    (s.aiVideoPrompt ? `영상 프롬프트: ${s.aiVideoPrompt}` : '')
  ).join('\n\n');

  window._copyCapcut = function() {
    const text = `━━━ 나레이션 전문 ━━━\n${narLines}\n\n━━━ CapCut 편집 가이드 ━━━\n${fullCapcutText}\n\n━━━ 해시태그 ━━━\n${(quiz.hashtags||[]).join(' ')}`;
    navigator.clipboard.writeText(text).then(() => showToast('CapCut 가이드 복사됨!'));
  };

  window._copyAiPrompts = function() {
    const text = `━━━ AI 영상 제작 프롬프트 ━━━\n${fullAiText}\n\n━━━ 썸네일 프롬프트 ━━━\n${quiz.thumbnail?.aiPrompt||''}`;
    navigator.clipboard.writeText(text).then(() => showToast('AI 프롬프트 복사됨!'));
  };

  document.getElementById('quizResult').style.display = 'block';
  if (document.getElementById('actionsStatus')) {
    document.getElementById('actionsStatus').style.display = 'none';
  }
}
