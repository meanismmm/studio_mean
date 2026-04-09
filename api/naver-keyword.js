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

  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}\nGET\n/keywordstool`)
    .digest('base64');

  const params = new URLSearchParams({
    hintKeywords: keywords.join(','),
    showDetail: '1'
  });

  try {
    const response = await fetch(`https://api.naver.com/keywordstool?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type':  'application/json; charset=UTF-8',
        'X-Timestamp':   timestamp,
        'X-API-KEY':     license,
        'X-Customer':    customerId,
        'X-Signature':   signature,
      }
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
