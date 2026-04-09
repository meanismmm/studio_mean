const crypto = require('crypto');

function parseQcCnt(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    if (val.includes('<')) return 5;
    return parseInt(val) || 0;
  }
  return 0;
}

async function queryKeyword(kw, license, secret, customerId) {
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(timestamp);
  hmac.update('.');
  hmac.update('GET');
  hmac.update('.');
  hmac.update('/keywordstool');
  const signature = hmac.digest('base64');

  const params = new URLSearchParams({
    hintKeywords: kw,
    showDetail: '1'
  });

  const response = await fetch(`https://api.searchad.naver.com/keywordstool?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Timestamp':  timestamp,
      'X-API-KEY':    license,
      'X-Customer':   customerId,
      'X-Signature':  signature,
    }
  });

  const data = await response.json();
  return data.keywordList || [];
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { keywords } = req.body;
  if (!keywords || !keywords.length) return res.status(400).json({ error: 'keywords required' });

  const license    = process.env.NAVER_API_LICENSE;
  const secret     = process.env.NAVER_API_SECRET;
  const customerId = process.env.NAVER_CUSTOMER_ID;

  const results = {};

  for (const keyword of keywords) {
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) continue;

    const kw        = keyword.trim();
    const kwNoSpace = kw.replace(/\s+/g, ''); // 띄어쓰기 제거 버전

    try {
      // 원본과 띄어쓰기 제거 버전 동시 조회
      const variants = kwNoSpace !== kw ? [kw, kwNoSpace] : [kw];
      let bestItem = null;
      let bestTotal = -1;

      for (const variant of variants) {
        const list = await queryKeyword(variant, license, secret, customerId);

        // 정확히 일치하는 항목 우선, 없으면 첫 번째
        const exact = list.find(k => k.relKeyword === variant);
        const item  = exact || list[0];

        if (item) {
          const pc = parseQcCnt(item.monthlyPcQcCnt);
          const mo = parseQcCnt(item.monthlyMobileQcCnt);
          const total = pc + mo;
          if (total > bestTotal) {
            bestTotal = total;
            bestItem = { pc, mobile: mo, total };
          }
        }
      }

      if (bestItem) {
        results[kw] = bestItem;
      } else {
        results[kw] = { pc: 0, mobile: 0, total: 0 };
      }
    } catch (e) {
      console.error('keyword error:', kw, e.message);
      results[kw] = null;
    }
  }

  res.status(200).json(results);
};
