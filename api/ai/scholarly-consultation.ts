import { ThinkingLevel } from '@google/genai';
import {
  setCorsHeaders,
  getGeminiClient,
  SCHOLAR_SYSTEM_PROMPT,
  buildGeminiContents,
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

  // Parse body if it's a string
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { prompt, mode = 'thinking', lessonContext, chatHistory = [], stream = false } = body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'الرجاء إدخال سؤالك أو استفسارك الشرعي.' });
  }

  const client = getGeminiClient();
  if (!client) {
    return res.status(500).json({
      error: 'لم يتم العثور على مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) في متغيرات البيئة.',
      reply: 'الرجاء التأكد من إضافة GEMINI_API_KEY في إعدادات البيئة (Vercel Environment Variables).',
    });
  }

  const contents = buildGeminiContents(prompt, chatHistory, lessonContext);
  const isStreamRequest = stream === true || req.url?.includes('/stream') || req.query?.stream === 'true';

  if (isStreamRequest) {
    // SSE Streaming
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    const modelsToTry = ['gemini-3.7-flash', 'gemini-3.1-flash-lite'];

    for (let i = 0; i < modelsToTry.length; i++) {
      const currentModel = modelsToTry[i];
      try {
        let config: any = {
          systemInstruction: `${SCHOLAR_SYSTEM_PROMPT}\nأنت الآن في مجلس المدارسة الشرعية العميقة والفورية. ابدأ مباشرة في بسط الجواب الفقهي والتأصيلي المفصل بالأدلة والتعليل دون تأخير.`,
        };

        if (mode === 'thinking' && currentModel === 'gemini-3.7-flash') {
          config.thinkingConfig = {
            thinkingLevel: ThinkingLevel.LOW,
          };
        } else if (mode === 'search') {
          config.systemInstruction = `${SCHOLAR_SYSTEM_PROMPT}\nأنت في وضع (البحث والتحري والتوثيق المعتمد). اذكر القرارات الفقهية والمصادر الموثقة.`;
          if (currentModel === 'gemini-3.7-flash') {
            config.tools = [{ googleSearch: {} }];
          }
        }

        const streamResponse = await client.models.generateContentStream({
          model: currentModel,
          contents,
          config,
        });

        const accumulatedSources: any[] = [];

        for await (const chunk of streamResponse) {
          const textChunk = chunk.text || '';
          const grounding = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (grounding && Array.isArray(grounding)) {
            for (const c of grounding) {
              if (c.web?.uri) {
                accumulatedSources.push({
                  title: c.web.title || 'مصدر توثيقي معتمد',
                  uri: c.web.uri,
                });
              }
            }
          }

          if (textChunk) {
            res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
          }
        }

        if (accumulatedSources.length > 0) {
          res.write(`data: ${JSON.stringify({ sources: accumulatedSources })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        return res.end();
      } catch (error: any) {
        if (i < modelsToTry.length - 1 && isTransientOrQuotaError(error)) {
          continue;
        }
        res.write(
          `data: ${JSON.stringify({
            error: 'عذراً، حدث تعثر مؤقت في معالجة الاستفسار. يرجى إعادة طرح السؤال.',
          })}\n\n`
        );
        res.write('data: [DONE]\n\n');
        return res.end();
      }
    }
    return;
  }

  // Non-streaming consultation
  try {
    if (mode === 'thinking') {
      try {
        const response = await client.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: contents,
          config: {
            systemInstruction: `${SCHOLAR_SYSTEM_PROMPT}\nأنت الآن في وضع (الاستنباط والتحقيق والتحليل العقلي والشرعي العميق). أجب مباشرة إجابة وافية محررة بالأدلة والتفريع.`,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });

        return res.status(200).json({
          reply: response.text || 'بارك الله فيك، تم استخراج الجواب المؤصل.',
          mode: 'thinking',
        });
      } catch (err: any) {
        if (isTransientOrQuotaError(err)) {
          const fallbackResponse = await client.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: contents,
            config: {
              systemInstruction: `${SCHOLAR_SYSTEM_PROMPT}\nأنت في وضع الاستنباط والتحقيق العلمي المؤصل.`,
            },
          });
          return res.status(200).json({
            reply: fallbackResponse.text || 'بارك الله فيك، تم استخراج الجواب المؤصل.',
            mode: 'thinking-resilient',
          });
        }
        throw err;
      }
    } else if (mode === 'search') {
      try {
        const response = await client.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: contents,
          config: {
            systemInstruction: `${SCHOLAR_SYSTEM_PROMPT}\nأنت في وضع (البحث والتحري والتوثيق). استخدم أداة البحث للتحقق من تخريج الأحاديث، وقرارات المجامع الفقهية وهيئات كبار العلماء والتوثيق المعاصر.`,
            tools: [{ googleSearch: {} }],
          },
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = chunks
          .filter((c: any) => c.web?.uri)
          .map((c: any) => ({
            title: c.web.title || 'مصدر توثيقي',
            uri: c.web.uri,
          }));

        return res.status(200).json({
          reply: response.text || 'تم التوثيق والتحري الشرعي.',
          sources,
          mode: 'search',
        });
      } catch (err: any) {
        if (isTransientOrQuotaError(err)) {
          const fallback = await client.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: contents,
            config: {
              systemInstruction: SCHOLAR_SYSTEM_PROMPT,
            },
          });
          return res.status(200).json({
            reply: fallback.text || 'تمت الإجابة الشرعية.',
            sources: [
              { title: 'القرآن الكريم والتفاسير المعتمدة', uri: 'https://quran.ksu.edu.sa' },
              { title: 'الموسوعة الحديثية والفقهية - الدرر السنية', uri: 'https://dorar.net' },
            ],
            mode: 'search-fallback',
          });
        }
        throw err;
      }
    } else {
      // Fast mode
      try {
        const response = await client.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: contents,
          config: {
            systemInstruction: `${SCHOLAR_SYSTEM_PROMPT}\nأنت في وضع (المعلم المباشر السريع). أجب بإيجاز ذكي وتركيز عالي، أو حاور الطالب بما يناسب سؤاله.`,
          },
        });

        return res.status(200).json({
          reply: response.text || 'نفع الله بك وزادك علماً.',
          mode: 'fast',
        });
      } catch (err: any) {
        if (isTransientOrQuotaError(err)) {
          const fallback = await client.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: contents,
            config: {
              systemInstruction: SCHOLAR_SYSTEM_PROMPT,
            },
          });
          return res.status(200).json({
            reply: fallback.text || 'نفع الله بك وزادك علماً.',
            mode: 'fast-resilient',
          });
        }
        throw err;
      }
    }
  } catch (error: any) {
    console.error('API /scholarly-consultation error:', error?.message || error);
    return res.status(500).json({
      error: 'حدث تعثر في معالجة السؤال. يرجى إعادة طرح السؤال وسيقوم الشيخ بالإجابة مباشرة.',
      details: error?.message || 'Server Error',
    });
  }
}
