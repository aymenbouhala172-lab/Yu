import {
  setCorsHeaders,
  getGeminiClient,
  cleanTextForSpeech,
  pcmToWav,
  isTransientOrQuotaError,
} from '../geminiHelper.js';

// In-memory cache for warm serverless instances
const ttsAudioCache = new Map<string, string>();

export default async function handler(req: any, res: any) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { text, voice = 'charon', style = 'scholar' } = body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'الرجاء توفير النص المراد تلاوته أو قراءته.' });
  }

  const client = getGeminiClient();
  if (!client) {
    return res.status(500).json({ error: 'مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) غير مهيأ في متغيرات البيئة.' });
  }

  let cleanedText = cleanTextForSpeech(text);
  if (cleanedText.length > 360) {
    const sliced = cleanedText.slice(0, 360);
    const lastPeriod = Math.max(
      sliced.lastIndexOf('.'),
      sliced.lastIndexOf('؟'),
      sliced.lastIndexOf('!'),
      sliced.lastIndexOf('،'),
      sliced.lastIndexOf('؛')
    );
    cleanedText = lastPeriod > 100 ? sliced.slice(0, lastPeriod + 1) : sliced;
  }

  if (!cleanedText) {
    return res.status(400).json({ error: 'النص فارغ بعد التنقيح.' });
  }

  const cacheKey = `${voice}_${style}_${cleanedText.slice(0, 100)}_${cleanedText.length}`;
  if (ttsAudioCache.has(cacheKey)) {
    return res.status(200).json({
      success: true,
      audioUrl: ttsAudioCache.get(cacheKey),
      cached: true,
    });
  }

  let targetVoiceName = 'Charon';
  if (voice === 'fenrir') {
    targetVoiceName = 'Fenrir';
  } else if (voice === 'puck') {
    targetVoiceName = 'Puck';
  } else {
    targetVoiceName = 'Charon';
  }

  let attempt = 0;
  const maxAttempts = 2;
  let retryAfterSeconds = 5;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: cleanedText }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: targetVoiceName },
            },
          },
        },
      });

      let rawBase64: string | undefined;
      const candidates = response.candidates || [];
      for (const cand of candidates) {
        const parts = cand.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            rawBase64 = part.inlineData.data;
            break;
          }
        }
        if (rawBase64) break;
      }

      if (!rawBase64) {
        throw new Error('لم يتم استلام بيانات الصوت من النموذج.');
      }

      const pcmBuffer = Buffer.from(rawBase64, 'base64');
      const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);
      const audioUrl = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;

      if (ttsAudioCache.size > 200) {
        const keys = Array.from(ttsAudioCache.keys()).slice(0, 60);
        keys.forEach((k) => ttsAudioCache.delete(k));
      }
      ttsAudioCache.set(cacheKey, audioUrl);

      return res.status(200).json({
        success: true,
        audioUrl,
        voice: targetVoiceName,
        durationEstimateSec: Math.round(pcmBuffer.length / (24000 * 2)),
      });
    } catch (error: any) {
      const errMsg = String(error?.message || error?.details || '');
      const retryMatch = errMsg.match(/retry in ([0-9.]+)s/i) || errMsg.match(/retryDelay":"([0-9]+)s"/i);
      if (retryMatch && retryMatch[1]) {
        retryAfterSeconds = Math.ceil(parseFloat(retryMatch[1]));
      }

      if (attempt < maxAttempts && isTransientOrQuotaError(error)) {
        const pauseMs = Math.min(Math.max((retryAfterSeconds || 1) * 1000, 1000), 2500);
        await new Promise((resolve) => setTimeout(resolve, pauseMs));
        continue;
      }

      const isQuota = isTransientOrQuotaError(error);
      const waitNotice = retryAfterSeconds > 0 ? ` (جاهز خلال ${retryAfterSeconds} ثانية)` : '';
      const errorMessage = isQuota
        ? `محرك تلاوة الشيخ يستعد لإعادة التهيئة${waitNotice}. يمكنك الضغط على زر إعادة الاستماع الآن.`
        : 'تعذر توليد التلاوة الصوتية للشيخ في هذه اللحظة، يرجى إعادة المحاولة.';

      return res.status(200).json({
        success: false,
        quotaExhausted: isQuota,
        retryAfterSeconds,
        error: errorMessage,
        details: error?.message,
      });
    }
  }
}
