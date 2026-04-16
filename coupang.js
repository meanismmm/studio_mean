// ===== coupang.js =====

let coupangProduct  = null;
let coupangImgFiles = [];

function initCoupang() {
  const dz   = document.getElementById('coupangDropzone');
  const fi   = document.getElementById('coupangFileInput');
  if (!dz || !fi) return;

  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
  dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag-over'); addCoupangFiles(Array.from(e.dataTransfer.files)); });
  dz.addEventListener('click', () => fi.click());
  fi.addEventListener('change', () => { addCoupangFiles(Array.from(fi.files)); fi.value=''; });

  document.addEventListener('paste', e => {
    if (document.querySelector('.tab-panel.active')?.id !== 'tab-coupang') return;
    const items = Array.from(e.clipboardData?.items || []);
    const imgItem = items.find(i => i.type.startsWith('image/'));
    if (!imgItem) return;
    e.preventDefault();
    const f = imgItem.getAsFile();
    if (f) { addCoupangFiles([f]); showToast('📋 이미지 붙여넣기 완료'); }
  });
}

function addCoupangFiles(files) {
  const imgs = files.filter(f => f.type.startsWith('image/'));
  if (!imgs.length) return;
  coupangImgFiles = [...coupangImgFiles, ...imgs];
  renderCoupangPreview();
  document.getElementById('coupangAnalyzeBtn').style.display = 'block';
  document.getElementById('coupangExtractResult').style.display = 'none';
  document.getElementById('coupangOptionsCard').style.display  = 'none';
  coupangProduct = null;
}

function renderCoupangPreview() {
  const p = document.getElementById('coupangImgPreview');
  p.innerHTML = ''; p.style.display = coupangImgFiles.length ? 'flex' : 'none';
  coupangImgFiles.forEach((f, i) => {
    const r = new FileReader();
    r.onload = e => {
      const d = document.createElement('div');
      d.className = 'image-preview-item';
      d.innerHTML = `<img src="${e.target.result}" alt="${i+1}"/><span class="preview-badge">${i+1}</span><button class="preview-remove" onclick="removeCoupangImg(${i})">×</button>`;
      p.appendChild(d);
    };
    r.readAsDataURL(f);
  });
  const c = document.getElementById('coupangImgCount');
  if (c) c.textContent = `${coupangImgFiles.length}장`;
}

function removeCoupangImg(i) {
  coupangImgFiles.splice(i, 1);
  renderCoupangPreview();
  if (!coupangImgFiles.length) document.getElementById('coupangAnalyzeBtn').style.display = 'none';
}

function resetCoupang() {
  coupangImgFiles = []; coupangProduct = null;
  renderCoupangPreview();
  ['coupangAnalyzeBtn','coupangExtractResult','coupangOptionsCard','coupangBlogResult','coupangThreadsResult']
    .forEach(id => { const el = document.getElementById(id); if(el) el.style.display='none'; });
}

async function analyzeCoupang() {
  if (!coupangImgFiles.length) { showToast('이미지를 먼저 업로드해주세요'); return; }
  const key = localStorage.getItem('CLAUDE_API_KEY');
  if (!key) { showToast('Claude API 키를 설정해주세요'); return; }

  setLoading('_global', true, `이미지 ${coupangImgFiles.length}장 분석 중...`);
  document.getElementById('coupangExtractResult').style.display = 'none';
  document.getElementById('coupangOptionsCard').style.display   = 'none';

  try {
    const imgContents = await Promise.all(coupangImgFiles.map(f => new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = e => res({ type:'image', source:{ type:'base64', media_type:f.type, data:e.target.result.split(',')[1] }});
      r.onerror = rej; r.readAsDataURL(f);
    })));

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{ 'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({
        model:'claude-sonnet-4-20250514', max_tokens:1000,
        system:'당신은 쿠팡 상품 상세페이지 분석 전문가입니다. 반드시 순수 JSON만 반환하세요.',
        messages:[{ role:'user', content:[...imgContents,{ type:'text', text:`상품 정보를 분석해서 아래 JSON으로만 답하세요:
{"name":"상품명","price":"가격","brand":"브랜드","features":["특징1","특징2","특징3","특징4","특징5"],"targetAudience":"타겟","painPoint":"해결 문제","wowPoint":"핵심 혜택","category":"home/beauty/fashion/digital/baby/pet/sports/food 중 하나","pexelsQuery":"영어 검색어 2~3단어"}` }] }]
      })
    });

    if (!resp.ok) { const e = await resp.json().catch(()=>({})); throw new Error(e.error?.message||`API 오류 (${resp.status})`); }
    const data = await resp.json();
    const text = data.content?.find(b=>b.type==='text')?.text || '';
    coupangProduct = safeParseJSON(text);
    renderCoupangExtract(coupangProduct);
    document.getElementById('coupangOptionsCard').style.display = 'block';
  } catch(e) {
    showToast('분석 오류: ' + e.message);
  } finally {
    setLoading('_global', false);
  }
}

function renderCoupangExtract(p) {
  const box = document.getElementById('coupangExtractResult');
  box.innerHTML = `
    <div class="card-title">STEP 2 — 추출된 상품 정보 <span style="font-size:9px;color:var(--teal)">✓ 수정 가능</span></div>
    <div class="form-group"><label>상품명 <span class="required">*</span></label><input type="text" id="ep_name" value="${esc(p.name||'')}"/></div>
    <div class="form-group"><label>브랜드</label><input type="text" id="ep_brand" value="${esc(p.brand||'')}"/></div>
    <div class="form-group"><label>가격</label><input type="text" id="ep_price" value="${esc(p.price||'')}"/></div>
    <div class="form-group"><label>핵심 특징</label><textarea id="ep_features" rows="4">${(p.features||[]).join('\n')}</textarea></div>
    <div class="form-group"><label>타겟 고객</label><input type="text" id="ep_target" value="${esc(p.targetAudience||'')}"/></div>
    <div class="form-group"><label>해결 문제</label><input type="text" id="ep_pain" value="${esc(p.painPoint||'')}"/></div>
    <div class="form-group"><label>핵심 혜택</label><input type="text" id="ep_wow" value="${esc(p.wowPoint||'')}"/></div>
    <div class="form-group"><label>파트너스 링크 <span class="optional">(선택)</span></label><input type="text" id="ep_url" placeholder="https://link.coupang.com/a/..."/></div>`;
  box.style.display = 'block';
}

function esc(s) { return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

async function generateCoupang() {
  if (!coupangProduct) { showToast('먼저 이미지를 분석해주세요'); return; }
  const p = {
    name:     document.getElementById('ep_name')?.value.trim()  || coupangProduct.name,
    brand:    document.getElementById('ep_brand')?.value.trim() || '',
    price:    document.getElementById('ep_price')?.value.trim() || '가격 미확인',
    features: (document.getElementById('ep_features')?.value||'').split('\n').map(s=>s.trim()).filter(Boolean),
    target:   document.getElementById('ep_target')?.value.trim() || '',
    pain:     document.getElementById('ep_pain')?.value.trim()   || '',
    wow:      document.getElementById('ep_wow')?.value.trim()    || '',
    url:      document.getElementById('ep_url')?.value.trim()    || '[파트너스 링크]',
    pexelsQuery: coupangProduct.pexelsQuery || 'product lifestyle'
  };
  if (!p.name) { showToast('상품명을 입력해주세요'); return; }

  const type  = document.querySelector('input[name="coupangType"]:checked')?.value  || 'blog';
  const style = document.querySelector('input[name="coupangStyle"]:checked')?.value || 'pain';
  const ctx   = getTodayContext();

  setLoading('_global', true, '홍보글을 생성 중...');
  document.getElementById('coupangBlogResult').style.display    = 'none';
  document.getElementById('coupangThreadsResult').style.display = 'none';

  try {
    if (type === 'blog' || type === 'both') {
      const res = await callClaude(
        `당신은 쿠팡 파트너스 블로그 마케터입니다.
${style==='pain'?'[PAIN형] 공감 문제 → 기존 해결책 한계 → 이 상품이 해결책 → 혜택 → 구매 유도':'[WOW형] 놀라운 혜택 → 압도적 특장점 → 실제 효과 → 가성비 → 구매 유도'}
광고처럼 보이지 않게. 진짜 써본 사람처럼. 목차 포함 2000~2500자. ## 소제목 외 마크다운 기호 일절 금지. 마지막에 파트너스 링크 + 수수료 고지.`,
        `상품명: ${p.name}${p.brand?` (${p.brand})`:''}\n가격: ${p.price}\n특징: ${p.features.join(', ')}\n타겟: ${p.target}\n해결문제: ${p.pain}\n핵심혜택: ${p.wow}\n링크: ${p.url}\n날짜: ${ctx.dateStr} / 계절: ${ctx.season}

[출력구조]
첫줄: SEO 제목
빈줄
[목차]...
본문...
마무리 + 링크
※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 일정액의 수수료를 제공받을 수 있습니다.`, 3000
      );
      const lines = res.trim().split('\n');
      document.getElementById('coupangBlogTitle').textContent  = lines[0].replace(/^#+\s*/,'').trim();
      document.getElementById('coupangBlogOutput').textContent = lines.slice(1).join('\n').trim();
      await renderPexelsImages(p.pexelsQuery, 'coupangImgList', 'coupangBlogImages');
      document.getElementById('coupangBlogResult').style.display = 'block';
    }

    if (type === 'threads' || type === 'both') {
      const res = await callClaude(
        '스레드(Threads) 쿠팡 파트너스 콘텐츠 전문가. 반드시 순수 JSON만 반환.',
        `상품: ${p.name} / 가격: ${p.price} / 특징: ${p.features.join(', ')} / 혜택: ${p.wow} / 링크: ${p.url}
스타일: ${style==='pain'?'PAIN형':'WOW형'}
포스트 5개. 1번:훅 2번:공감 3번:특징3가지 4번:가성비 5번:구매+링크+해시태그
각 500자 이내. 5번 마지막에 "※ 파트너스 링크 포함"
{"posts":[{"no":1,"text":"","type":"hook"},{"no":2,"text":"","type":"content"},{"no":3,"text":"","type":"content"},{"no":4,"text":"","type":"content"},{"no":5,"text":"","type":"cta"}]}`, 1500
      );
      const parsed = safeParseJSON(res);
      renderThreadsPosts(parsed.posts, 'coupangThreadsList');
      document.getElementById('coupangThreadsResult').style.display = 'block';
    }
  } catch(e) {
    showToast('오류: ' + e.message);
  } finally {
    setLoading('_global', false);
  }
}

document.addEventListener('DOMContentLoaded', initCoupang);
