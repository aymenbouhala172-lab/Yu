import healthHandler from './health.js';
import scholarlyConsultationHandler from './ai/scholarly-consultation.js';
import generateQuestionHandler from './ai/generate-question.js';
import ttsRecitationHandler from './ai/tts-recitation.js';
import { setCorsHeaders } from './geminiHelper.js';

export default async function handler(req: any, res: any) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';

  // Route: /api/health
  if (url.includes('/health')) {
    return healthHandler(req, res);
  }

  // Route: /api/ai/scholarly-consultation or /stream
  if (url.includes('/scholarly-consultation')) {
    return scholarlyConsultationHandler(req, res);
  }

  // Route: /api/ai/generate-question
  if (url.includes('/generate-question')) {
    return generateQuestionHandler(req, res);
  }

  // Route: /api/ai/tts-recitation
  if (url.includes('/tts-recitation')) {
    return ttsRecitationHandler(req, res);
  }

  // Default API status
  return res.status(200).json({
    status: 'ok',
    service: 'Minhaj Al-Mutafaqqih API Engine',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/health',
      '/api/ai/scholarly-consultation',
      '/api/ai/scholarly-consultation/stream',
      '/api/ai/generate-question',
      '/api/ai/tts-recitation',
    ],
  });
}
