// ===== threads.js =====

const THREADS_TONE = {
  casual: `스레드(Threads) 콘텐츠 전문가. 친근한 1인칭 구어체. "~요","~ㄴ데요" 체. 500자 이내. 줄바꿈 활용. 해시태그는 마지막에만.`,
  info:   `스레드(Threads) 콘텐츠 전문가. 정보 전달형. 단언체. 숫자·구체적 정보로 신뢰성. 500자 이내. 줄바꿈 활용.`,
  emotional: `스레드(Threads) 콘텐츠 전문가. 공감·감성형. "우리 모두~", "혹시 이런 적?" 식의 공감 유도. 따뜻하고 진솔한 어조. 500자 이내.`
};

async function generateThreads() {
  const input = document.getElementById('threadsInput').value.trim();
  if (!input) { showToast('블로그 글을 붙여넣어 주세요'); return; }

  const url   = document.getElementById('threadsSourceUrl').value.trim();
  const count = document.querySelector('input[name="threadsCount"]:checked')?.value || '5';
  const tone  = document.querySelector('input[name="threadsTone"]:checked')?.value  || 'casual';

  setLoading('_global', true, '스레드를 생성 중입니다...');
  document.getElementById('threadsResult').style.display = 'none';

  try {
    const result = await callClaude(
      THREADS_TONE[tone],
      `아래 블로그 글을 스레드 포스트 ${count}개로 변환해주세요.

[규칙]
1번: 강렬한 훅 — 스크롤 멈추게 만드는 첫 줄
2번~${Number(count)-1}번: 핵심 내용 각각 하나의 포인트로 분리
마지막: 핵심 요약 + 링크 유도 + 해시태그 3~5개
${url ? `블로그 링크: ${url}` : '블로그 링크: [링크] (실제 링크로 교체하세요)'}

반드시 순수 JSON으로만:
{
  "posts": [
    {"no":1,"text":"내용","type":"hook"},
    {"no":2,"text":"내용","type":"content"},
    {"no":${count},"text":"내용 + 링크 + 해시태그","type":"cta"}
  ]
}

[원본 글]
${input.slice(0, 3000)}`, 2000
    );

    const parsed = safeParseJSON(result);
    renderThreadsPosts(parsed.posts, 'threadsPostList');
    document.getElementById('threadsResult').style.display = 'block';
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('_global', false);
  }
}

function renderThreadsPosts(posts, listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.innerHTML = '';

  posts.forEach((post, i) => {
    const isFirst = i === 0;
    const isLast  = i === posts.length - 1;
    const chars   = post.text.length;
    const over    = chars > 500;
    const near    = chars > 450;

    const div = document.createElement('div');
    div.className = 'thread-post';
    div.innerHTML = `
      <div class="thread-post-header">
        <span class="thread-post-num ${isFirst?'first':isLast?'last':''}">
          ${isFirst ? '🪝 훅' : isLast ? '🔗 CTA' : `${post.no}번`}
        </span>
        <button class="btn-sm" onclick="navigator.clipboard.writeText(this.closest('.thread-post').querySelector('.thread-post-text').textContent.trim()).then(()=>showToast('복사됨!'))">복사</button>
      </div>
      <div class="thread-post-text">${escapeHtml(post.text)}</div>
      <div class="thread-char-count ${over?'over':near?'warn':''}">${chars}/500자${over?' ⚠️ 초과':''}</div>`;
    list.appendChild(div);
  });
}

function escapeHtml(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#039;').replace(/\n/g,'<br>');
}
