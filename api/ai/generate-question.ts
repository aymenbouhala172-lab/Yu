import {
  setCorsHeaders,
  getGeminiClient,
  isTransientOrQuotaError,
} from '../geminiHelper.js';

export default async function handler(req: any, res: any) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { doorTitle, lessonTitle, centralRule, level } = body;
  const client = getGeminiClient();

  const fallbackQuestion = {
    question: centralRule
      ? `وفق الضابط الشرعي المقرّر: «${centralRule}»، ما هو التطبيق الأصولي الصحيح؟`
      : `ما هو الأصل المعتمد في دراسة ${lessonTitle || 'هذا الباب'}؟`,
    options: [
      'الاعتماد على الكتاب والسنة بفهم سلف الأمة والجمع بين الأدلة المحكمة',
      'الاعتماد على الرأي المجرد دون اعتبار للنصوص والضوابط',
      'إسقاط الاستدلال بظواهر النصوص دون فقه المقاصد',
      'التقليد المحض دون نظر في الدليل عند القدرة على الاستنباط',
    ],
    correctIndex: 0,
    explanation: 'الرجوع للكتاب والسنة والضوابط الأصولية المستقرة هو الأصل والمنهاج السديد عند أهل العلم.',
    evidenceReference: 'قوله تعالى: ﴿فَإِن تَنَازَعْتُمْ فِي شَيْءٍ فَرُدُّوهُ إِلَى اللَّهِ وَالرَّسُولِ﴾ [النساء: 59]',
  };

  if (!client) {
    return res.status(200).json(fallbackQuestion);
  }

  const prompt = `
أنت واضع اختبارات شرعية أكاديمية متقن.
أنشئ سؤالاً تفاعلياً جديداً لفحص إتقان الطالب للدرس التالي:
الباب: ${doorTitle || 'العقيدة والفقه'}
الدرس: ${lessonTitle || 'الضوابط الشرعية'}
الضابط المركزي: ${centralRule || 'اعتبار الأدلة والمقاصد'}
المستوى: ${level || 'متوسط'}

قم بإرجاع كائن JSON صالح فقط بالشكل التالي دون أي نصوص إضافية:
{
  "question": "نص السؤال الدقيق",
  "options": ["الخيار 1", "الخيار 2", "الخيار 3", "الخيار 4"],
  "correctIndex": 0,
  "explanation": "الشرح التأصيلي للإجابة وسبب خطأ الخيارات الأخرى",
  "evidenceReference": "الدليل من القرآن أو السنة"
}
`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed && parsed.question && Array.isArray(parsed.options) && parsed.options.length >= 2) {
      return res.status(200).json(parsed);
    }
    return res.status(200).json(fallbackQuestion);
  } catch (err: any) {
    if (isTransientOrQuotaError(err)) {
      try {
        const secondaryResponse = await client.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        const parsed = JSON.parse(secondaryResponse.text || '{}');
        if (parsed && parsed.question && Array.isArray(parsed.options) && parsed.options.length >= 2) {
          return res.status(200).json(parsed);
        }
      } catch (secondaryErr: any) {
        // Fall through to fallback
      }
    }
    return res.status(200).json(fallbackQuestion);
  }
}
