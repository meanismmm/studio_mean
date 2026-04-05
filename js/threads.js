// ===== threads.js — 스레드 포스트 생성 =====

const THREADS_TONE_SYSTEM = {
  casual: `당신은 스레드(Threads) 콘텐츠 전문가입니다.

[스레드 특성]
- 각 포스트는 독립적으로 읽혀야 하지만 이어지는 흐름이 있어야 함
- 500자 이내 (스레드 제한)
- 줄바꿈을 적극 활용해 가독성 높임
- 해시태그는 마지막 포스트에만 모아서
- 이모지는 포인트로만, 남발 금지

[말투]
- 친근한 1인칭 구어체
- "~요", "~ㄴ데요", "~더라고요" 체
- 딱딱하지 않고 대화하는 느낌`,

  info: `당신은 스레드(Threads) 콘텐츠 전문가입니다.

[스레드 특성]
- 각 포스트는 독립적으로 읽혀야 하지만 이어지는 흐름이 있어야 함
- 500자 이내 (스레드 제한)
- 줄바꿈을 적극 활용해 가독성 높임
- 해시태그는 마지막 포스트에만 모아서
- 숫자와 구체적 정보로 신뢰성 확보

[말투]
- 정보 전달에 집중
- 단언체 "~입니다", "~합니다"
- 핵심을 먼저, 이유는 뒤에`,

  emotional: `당신은 스레드(Threads) 콘텐츠 전문가입니다.

[스레드 특성]
- 각 포스트는 독립적으로 읽혀야 하지만 이어지는 흐름이 있어야 함
- 500자 이내 (스레드 제한)
- 줄바꿈을 적극 활용해 가독성 높임
- 해시태그는 마지막 포스트에만 모아서
- 독자의 감정을 건드리는 표현

[말투]
- 공감과 감성 중심
- "우리 모두~", "혹시 이런 적 있나요?" 식의 공감 유도
- 따뜻하고 진솔한 어조`
};

async function generateThreads() {
  const input = document.getElementById('threadsInput').value.trim();
  if (!input) { showToast('블로그 글을 붙여넣어 주세요'); return; }

  const sourceUrl = document.getElementById('threadsSourceUrl').value.trim();
  const count = document.querySelector('input[name="threadsCount"]:checked')?.value || '5';
  const tone = document.querySelector('input[name="threadsTone"]:checked')?.value || 'casual';

  setLoading('threadsLoading', true, '스레드를 생성 중입니다...');
  document.getElementById('threadsResult').style.display = 'none';

  try {
    const systemPrompt = THREADS_TONE_SYSTEM[tone];

    const userPrompt = `아래 블로그 글을 스레드 포스트 ${count}개로 변환해주세요.

[규칙]
1. 첫 번째 포스트: 강렬한 훅. 스크롤을 멈추게 만드는 첫 줄. 본 글의 핵심 가치를 한 줄로 압축.
2. 2번~${Number(count)-1}번 포스트: 글의 핵심 내용을 각각 하나의 포인트로 분리. 각 포스트는 독립적으로 이해 가능해야 함.
3. 마지막 포스트: 핵심 요약 1~2줄 + 블로그 링크 유도 문구 + 해시태그 3~5개.
${sourceUrl ? `블로그 링크: ${sourceUrl}` : '블로그 링크: [링크] (실제 링크로 교체하세요)'}

[출력 형식 — 반드시 순수 JSON으로만]
{
  "posts": [
    {"no": 1, "text": "포스트 내용", "type": "hook"},
    {"no": 2, "text": "포스트 내용", "type": "content"},
    ...
    {"no": ${count}, "text": "포스트 내용 + 링크 + 해시태그", "type": "cta"}
  ]
}

[원본 블로그 글]
${input.slice(0, 3000)}`;

    const result = await callClaude(systemPrompt, userPrompt, 2000);
    const parsed = safeParseJSON(result);
    renderThreadsPosts(parsed.posts, 'threadsPostList');
    document.getElementById('threadsResult').style.display = 'block';
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('threadsLoading', false);
  }
}

function renderThreadsPosts(posts, listElementId) {
  const list = document.getElementById(listElementId);
  if (!list) return;
  list.innerHTML = '';

  posts.forEach((post, i) => {
    const isFirst = i === 0;
    const isLast = i === posts.length - 1;
    const charCount = post.text.length;
    const isOverLimit = charCount > 500;
    const isNearLimit = charCount > 450;

    const div = document.createElement('div');
    div.className = 'thread-post';
    div.innerHTML = `
      <div class="thread-post-header">
        <span class="thread-post-num ${isFirst ? 'first' : isLast ? 'last' : ''}">
          ${isFirst ? '🪝 훅' : isLast ? '🔗 CTA' : `${post.no}번`}
        </span>
        <button class="btn-sm" onclick="navigator.clipboard.writeText(this.closest('.thread-post').querySelector('.thread-post-text').textContent.trim()).then(()=>showToast('복사됨!'))">복사</button>
      </div>
      <div class="thread-post-text">${escapeHtml(post.text)}</div>
      <div class="thread-char-count ${isOverLimit ? 'over' : isNearLimit ? 'warn' : ''}">
        ${charCount}/500자${isOverLimit ? ' ⚠️ 초과' : ''}
      </div>`;
    list.appendChild(div);
  });
}

// 쿠팡 탭에서도 스레드 렌더링에 사용
function renderCoupangThreads(posts) {
  renderThreadsPosts(posts, 'coupangThreadsList');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}
