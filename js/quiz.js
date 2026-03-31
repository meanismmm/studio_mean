// ===== quiz.js =====

let currentQuiz = null;

async function generateQuiz() {
  const category = document.getElementById('quizCategory').value;
  const difficulty = document.querySelector('input[name="quizDifficulty"]:checked')?.value || 'normal';
  const lang = document.querySelector('input[name="quizLang"]:checked')?.value || 'ko';

  setLoading('quizLoading', true);
  document.getElementById('quizResult').style.display = 'none';

  const catMap = {
    math: '수학·논리 문제', iq: 'IQ 테스트형 패턴/규칙 찾기',
    psychology: '심리테스트 (선택지형)', common: '상식 퀴즈',
    nonsense: '넌센스·수수께끼'
  };
  const diffMap = { easy: '쉬움', normal: '보통', hard: '어려움' };
  const isKo = lang === 'ko';

  try {
    const result = await callClaude(
      '당신은 유튜브 숏츠 퀴즈 콘텐츠 전문가입니다. 반드시 순수 JSON만 반환하세요.',
      `카테고리: ${catMap[category]}
난이도: ${diffMap[difficulty]}
언어: ${isKo ? '한국어' : 'English'}

유튜브 숏츠에서 조회수가 잘 나오는 퀴즈를 하나 만들어주세요.
나레이션은 실제로 읽었을 때 자연스럽고 흥미롭게, 구어체로 작성하세요.

JSON:
{
  "hookTitle": "자극적인 타이틀",
  "question": "문제 텍스트",
  "options": ["선택지1","선택지2","선택지3"],
  "answer": "정답",
  "explanation": "해설",
  "difficulty": "${difficulty}",
  "narration": {
    "intro": "오프닝 나레이션 (2~3문장, 흥미 유발, 구어체)",
    "question": "문제 읽어주는 나레이션 (문제를 그대로 읽되 자연스럽게)",
    "countdown": "카운트다운 멘트 (예: 자, 생각해볼까요? 5...4...3...2...1...)",
    "answer": "정답 발표 나레이션 (정답 + 짧은 해설)",
    "outro": "아웃트로 CTA (구독/팔로우 유도, 1~2문장)"
  },
  "captions": {
    "hook": "훅 자막",
    "question": "문제 자막 (짧게 요약)",
    "countdown": "5  4  3  2  1",
    "answer": "정답 자막",
    "cta": "구독 유도 자막"
  },
  "hashtags": ["#퀴즈","#두뇌테스트","#숏츠","#IQ테스트","#수학퀴즈"]
}`,
      1200
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
  const output = document.getElementById('quizOutput');
  const n = quiz.narration || {};

  // 나레이션 전문
  const fullNarration =
    `[오프닝] ${n.intro || ''}\n\n[문제] ${n.question || ''}\n\n[카운트다운] ${n.countdown || ''}\n\n[정답] ${n.answer || ''}\n\n[아웃트로] ${n.outro || ''}`;

  // CapCut 편집 가이드
  const scenes = [
    { name: '오프닝',     time: '0:00 ~ 0:03', duration: '3초',  screen: '다크 배경 + 훅 타이틀 텍스트',       caption: quiz.captions?.hook || '',    transition: '페이드인' },
    { name: '문제',       time: '0:03 ~ 0:18', duration: '15초', screen: '흰 배경 + 문제 텍스트 + 선택지',    caption: quiz.captions?.question || '', transition: '슬라이드 업' },
    { name: '카운트다운', time: '0:18 ~ 0:23', duration: '5초',  screen: '다크 배경 + 숫자 카운트 5→1',       caption: '5  4  3  2  1',               transition: '플래시 컷' },
    { name: '정답',       time: '0:23 ~ 0:33', duration: '10초', screen: '흰 배경 + 정답 강조 + 해설 텍스트', caption: quiz.captions?.answer || '',   transition: '페이드인' },
    { name: 'CTA',        time: '0:33 ~ 0:37', duration: '4초',  screen: '다크 배경 + 구독/팔로우 텍스트',    caption: quiz.captions?.cta || '',      transition: '페이드아웃' },
  ];

  const capcut = scenes.map(s =>
    `[${s.name}] ${s.time} (${s.duration})\n화면: ${s.screen}\n자막: ${s.caption}\n전환: ${s.transition}`
  ).join('\n\n');

  const fullCopy =
    `━━━ 나레이션 전문 ━━━\n${fullNarration}\n\n━━━ CapCut 편집 가이드 ━━━\n${capcut}\n\n━━━ 해시태그 ━━━\n${(quiz.hashtags||[]).join(' ')}`;

  output.innerHTML = `
    <div class="quiz-section">
      <div class="quiz-label">훅 타이틀</div>
      <div class="quiz-content" style="font-size:18px;color:#ffd166">${quiz.hookTitle}</div>
    </div>
    <div class="quiz-section">
      <div class="quiz-label">문제</div>
      <div class="quiz-content">${quiz.question}</div>
      ${quiz.options?.length ? `<div style="margin-top:8px;color:#7a7a8c;font-size:13px;line-height:1.8">${quiz.options.map((o,i)=>['A','B','C','D'][i]+'. '+o).join('<br>')}</div>` : ''}
    </div>
    <div class="quiz-section">
      <div class="quiz-label">정답</div>
      <div class="quiz-answer" style="color:#4ecdc4">✅ ${quiz.answer}</div>
      <div class="quiz-explanation" style="margin-top:4px">${quiz.explanation}</div>
    </div>`;

  // 나레이션 박스
  const narEl = document.getElementById('quizNarrationText');
  if (narEl) {
    narEl.textContent = fullNarration;
    document.getElementById('quizNarrationBox').style.display = 'block';
  }

  // CapCut 가이드 박스 동적 추가
  let guideBox = document.getElementById('capcutGuideBox');
  if (!guideBox) {
    guideBox = document.createElement('div');
    guideBox.id = 'capcutGuideBox';
    guideBox.className = 'narration-box';
    document.getElementById('quizResult').appendChild(guideBox);
  }
  guideBox.innerHTML = `
    <div class="card-title" style="margin-bottom:10px">
      CapCut 편집 가이드
      <button class="btn-sm btn-accent" onclick="copyCapcutAll()">전체 복사</button>
    </div>
    <div style="font-size:13px;color:#e8e8f0;line-height:2">
      ${scenes.map(s => `
        <div style="padding:10px 0;border-bottom:1px solid #2a2a32">
          <span style="color:#4ecdc4;font-weight:700">[${s.name}]</span>
          <span style="color:#7a7a8c;margin-left:8px">${s.time} · ${s.duration}</span><br>
          <span style="color:#7a7a8c">화면:</span> ${s.screen}<br>
          <span style="color:#7a7a8c">자막:</span> ${s.caption}<br>
          <span style="color:#7a7a8c">전환:</span> ${s.transition}
        </div>`).join('')}
    </div>
    <div style="margin-top:12px;font-size:12px;color:#5b7fff">${(quiz.hashtags||[]).join(' ')}</div>`;

  window._fullCopy = fullCopy;
  window.copyCapcutAll = function() {
    navigator.clipboard.writeText(window._fullCopy).then(() => showToast('전체 복사됨!'));
  };

  document.getElementById('quizResult').style.display = 'block';
  document.getElementById('actionsStatus').style.display = 'none';
}
