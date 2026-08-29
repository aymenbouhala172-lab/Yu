import { setCorsHeaders } from './geminiHelper.js';

export default async function handler(req: any, res: any) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Minhaj Al-Mutafaqqih Vercel Serverless API',
  });
}
