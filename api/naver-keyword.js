import crypto from 'crypto';

export default async function handler(req, res) {
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
    const timestamp = Date.now().toString();
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(timestamp);
    hmac.update('.');
    hmac.update('GET');
    hmac.update('.');
    hmac.update('/keywordstool');
    const signature = hmac.digest('base64');

    const params = new URLSearchParams({
      hintKeywords: keyword,
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
      const list = data.keywordList || [];

      // 입력 키워드와 정확히 일치하는 항목 먼저 찾고, 없으면 첫 번째 항목 사용
      const exact = list.find(k => k.relKeyword === keyword);
      const item  = exact || list[0];

      if (item) {
        const pc = parseInt(item.monthlyPcQcCnt)     || 0;
        const mo = parseInt(item.monthlyMobileQcCnt) || 0;
        results[keyword] = { pc, mobile: mo, total: pc + mo };
      }
    } catch (e) {
      console.error('keyword error:', keyword, e.message);
      results[keyword] = null;
    }

  res.status(200).json(results);
}
