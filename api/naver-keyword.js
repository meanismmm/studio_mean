const crypto = require('crypto');

function parseQcCnt(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    if (val.includes('<')) return 5; // "< 10" → 5로 처리
    return parseInt(val) || 0;
  }
  return 0;
}

function isValidKeyword(keyword) {
  if (!keyword || typeof keyword !== 'string') return false;
  const trimmed = keyword.trim();
  if (trimmed.length === 0 || trimmed.length > 25) return false;
  if (/[!@#$%^&*()+=\[\]{};':"\\|,.<>\/?]/.test(trimmed)) return false;
  return true;
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
    if (!isValidKeyword(keyword)) {
      console.log('skipped:', keyword);
      continue;
    }

    const timestamp = Date.now().toString();
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(timestamp);
    hmac.update('.');
    hmac.update('GET');
    hmac.update('.');
    hmac.update('/keywordstool');
    const signature = hmac.digest('base64');

    const params = new URLSearchParams({
      hintKeywords: keyword.trim(),
      showDetail: '1'
    });

    try {
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

      if (data.keywordList && data.keywordList.length > 0) {
        const exact = data.keywordList.find(k => k.relKeyword === keyword.trim());
        const item  = exact || data.keywordList[0];
        const pc = parseQcCnt(item.monthlyPcQcCnt);
        const mo = parseQcCnt(item.monthlyMobileQcCnt);
        results[keyword] = { pc, mobile: mo, total: pc + mo };
      }
    } catch (e) {
      console.error('keyword error:', keyword, e.message);
      results[keyword] = null;
    }
  }

  res.status(200).json(results);
};
