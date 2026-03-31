// ===== quiz.js — 퀴즈 숏츠 자동화 =====

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
  const diffMap = { easy: '쉬움 (누구나 맞출 수 있는)', normal: '보통', hard: '어려움 (생각해야 풀 수 있는)' };
  const isKo = lang === 'ko';

  try {
    const result = await callClaude(
      `당신은 유튜브 숏츠 퀴즈 콘텐츠 전문가입니다. 반드시 순수 JSON만 반환하세요.`,
      `카테고리: ${catMap[category]}
난이도: ${diffMap[difficulty]}
언어: ${isKo ? '한국어' : 'English'}

유튜브 숏츠에서 조회수가 잘 나오는 ${isKo ? '한국어' : 'English'} 퀴즈를 하나 만들어주세요.
레퍼런스 스타일: "미국 대학 입시 문제" 같은 자극적인 타이틀 + 간결한 문제 + 반전있는 답

JSON 형식:
{
  "hookTitle": "${isKo ? '영상 상단에 들어갈 자극적인 타이틀 (예: 미국 대학 입시 문제)' : 'viral hook title'}",
  "question": "${isKo ? '문제 텍스트' : 'question text'}",
  "options": ["${isKo ? '선택지1 (객관식인 경우, 없으면 빈 배열)' : 'option1'}"],
  "answer": "${isKo ? '정답' : 'answer'}",
  "explanation": "${isKo ? '해설 (왜 이게 답인지 흥미롭게)' : 'explanation'}",
  "difficulty": "${difficulty}",
  "narration": {
    "intro": "${isKo ? '오프닝 나레이션 (2-3문장, 흥미 유발)' : 'opening narration'}",
    "question": "${isKo ? '문제 읽어주는 나레이션' : 'question narration'}",
    "countdown": "${isKo ? '카운트다운 멘트 (예: 자, 생각해볼까요? 5...4...3...2...1...)' : 'countdown narration'}",
    "answer": "${isKo ? '정답 발표 나레이션' : 'answer narration'}",
    "outro": "${isKo ? '아웃트로 CTA (구독 유도)' : 'outro CTA'}"
  },
  "captions": {
    "hook": "${isKo ? '훅 자막' : 'hook caption'}",
    "question": "${isKo ? '문제 자막' : 'question caption'}",
    "countdown": "${isKo ? '카운트다운 자막 (숫자)' : 'countdown caption'}",
    "answer": "${isKo ? '정답 자막' : 'answer caption'}",
    "cta": "${isKo ? '구독 유도 자막' : 'CTA caption'}"
  },
  "hashtags": ${isKo ? '["#퀴즈", "#수학퀴즈", "#두뇌테스트", "#IQ테스트", "#숏츠"]' : '["#quiz", "#brainteaser", "#mathpuzzle", "#shorts", "#viral"]'}
}`,
      1000
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
  const isKo = lang === 'ko';
  const output = document.getElementById('quizOutput');

  output.innerHTML = `
    <div class="quiz-section">
      <div class="quiz-label">훅 타이틀</div>
      <div class="quiz-content" style="font-size:18px;color:#ffd166">🎬 ${quiz.hookTitle}</div>
    </div>
    <div class="quiz-section">
      <div class="quiz-label">${isKo ? '문제' : 'Question'}</div>
      <div class="quiz-content">${quiz.question}</div>
      ${quiz.options?.length ? `<div style="margin-top:8px;color:#7a7a8c;font-size:13px">${quiz.options.join(' / ')}</div>` : ''}
    </div>
    <div class="quiz-section">
      <div class="quiz-label">${isKo ? '정답' : 'Answer'}</div>
      <div class="quiz-answer">✅ ${quiz.answer}</div>
    </div>
    <div class="quiz-section">
      <div class="quiz-label">${isKo ? '해설' : 'Explanation'}</div>
      <div class="quiz-explanation">${quiz.explanation}</div>
    </div>
    <div class="quiz-section">
      <div class="quiz-label">${isKo ? '해시태그' : 'Hashtags'}</div>
      <div style="font-size:12px;color:#5b7fff">${(quiz.hashtags || []).join(' ')}</div>
    </div>
  `;

  // 나레이션 세팅
  const narEl = document.getElementById('quizNarrationText');
  const narration = quiz.narration;
  narEl.textContent = `[오프닝] ${narration.intro}\n\n[문제] ${narration.question}\n\n[카운트다운] ${narration.countdown}\n\n[정답] ${narration.answer}\n\n[아웃트로] ${narration.outro}`;
  document.getElementById('quizNarrationBox').style.display = 'block';

  document.getElementById('quizResult').style.display = 'block';
  document.getElementById('actionsStatus').style.display = 'none';
}

// GitHub Actions 트리거 — 퀴즈 영상 렌더링
async function triggerGithubActions() {
  if (!currentQuiz) { showToast('먼저 퀴즈를 생성해주세요'); return; }

  const token = localStorage.getItem('GITHUB_TOKEN');
  const repo = localStorage.getItem('GITHUB_REPO') || 'meanismmm/studio_mean';

  if (!token) { showToast('GitHub 토큰을 설정 탭에서 입력해주세요'); return; }

  const btn = document.getElementById('actionsBtn');
  btn.disabled = true;
  const statusBox = document.getElementById('actionsStatus');
  statusBox.style.display = 'block';
  statusBox.className = 'status-box running';
  statusBox.textContent = '⏳ GitHub Actions 트리거 중...';

  try {
    const [owner, repoName] = repo.split('/');
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          event_type: 'render_quiz',
          client_payload: {
            quiz: currentQuiz,
            timestamp: new Date().toISOString()
          }
        })
      }
    );

    if (response.status === 204) {
      statusBox.className = 'status-box success';
      statusBox.innerHTML = `✅ GitHub Actions 트리거 성공!<br>
        <a href="https://github.com/${repo}/actions" target="_blank" 
           style="color:#4ecdc4;font-size:11px;margin-top:4px;display:inline-block">
          → Actions 탭에서 진행 상황 확인
        </a><br>
        <span style="font-size:11px;opacity:0.7">완료 후 Artifacts에서 mp4 다운로드 가능</span>`;
    } else {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
  } catch(e) {
    statusBox.className = 'status-box error';
    statusBox.textContent = '❌ 오류: ' + e.message;
  } finally {
    btn.disabled = false;
  }
}
