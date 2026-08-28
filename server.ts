import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment.');
      return null;
    }
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper to check if an error is transient (HTTP 503 UNAVAILABLE / high demand, HTTP 429 RESOURCE_EXHAUSTED, etc.)
function isTransientOrQuotaError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.code || err.statusCode;
  const message = String(err.message || err.details || (typeof err === 'object' ? JSON.stringify(err) : err) || '');
  return (
    status === 429 ||
    status === 503 ||
    status === 500 ||
    status === 502 ||
    status === 504 ||
    status === 'RESOURCE_EXHAUSTED' ||
    status === 'UNAVAILABLE' ||
    status === 'Service Unavailable' ||
    message.includes('429') ||
    message.includes('503') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('UNAVAILABLE') ||
    message.includes('high demand') ||
    message.includes('quota') ||
    message.includes('rate-limit') ||
    message.includes('rate limit') ||
    message.includes('overloaded') ||
    message.includes('temporarily unavailable')
  );
}

// System Prompt for the AI Islamic Scholar & Mentor (العالم والمُعلّم الشرعي والمفكر المتمكن)
const SCHOLAR_SYSTEM_PROMPT = `
أنت «العالم والفقيه والمفكر الإسلامي الراسخ» (الشيخ والمُعلّم الذكي والمربي الحكيم).
تتميز بالرسوخ في علوم الكتاب والسنة على منهج السلف الصالح، وسعة الأفق، ورجاحة العقل، والقدرة الفائقة على التفكير الحي الأصيل والتحليل العميق والتأصيل الشرعي لأي مسألة أو سؤال يُطرح عليك دون قيود أو إجابات جاهزة معلبة.

منهجك في التفكير والإجابة:
1. **التفكير المباشر والحي لكل سؤال:** فكّر في كل سؤال يطرحه السائل تفكيراً حياً أصيلاً، وتناول عين المسألة المحددة بخصوصها ودقتها، وإياك والأجوبة المعلبة أو القوالب الجاهزة المكررة.
2. **الشمول وسعة العلم:** أجب عن أي سؤال يُطرح عليك في أي باب دون استثناء:
   - المسائل الفقهية والأصولية: حرّر محل النزاع، واذكر أقوال المذاهب الفقهية المعتبرة بأدلتها، ثم بيّن القول الراجح بدليله وعلته الأصولية.
   - قضايا العقيدة والتوحيد وأعمال القلوب: بالبرهان القاطع من القرآن والسنة، والاستدلال الفطري والعقلي الصريح.
   - النوازل المعاصرة والمستجدات (كالذكاء الاصطناعي، العملات المشفرة، التقنيات الحيوية، المعاملات المالية الحديثة، الفلسفة المعاصرة): فكّك التكييف الفقهي والمقاصد الشرعية، واجمع بين فهم الواقع وحكم الشرع.
   - الأسئلة الفكرية وتفنيد الشبهات: انقض الشبهة ببرهان العقل والنقل الصريح بأدب ورفق وقوة حجة تسكن إليها النفوس.
   - الأسئلة التربوية والاستشارات الحياتية: بالحكمة والتربية والموعظة الحسنة.
3. **الأسلوب والبيان:** لغة عربية فصيحة عذبة، واضحة، متواضعة، دافئة، مع الالتزام بالأدب النبوي، وضرب الأمثلة الميسرة، وختام الإجابة بخلاصة نافعة جامعة.
`;

// Helper to build contents array with conversation history
function buildGeminiContents(prompt: string, chatHistory?: any[], lessonContext?: any): any[] {
  const contents: any[] = [];

  // Include previous dialogue turns if available
  if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
    for (const msg of chatHistory) {
      if (msg.role && msg.content) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(msg.content) }],
        });
      }
    }
  }

  // Format current user question
  let currentText = prompt;
  if (lessonContext && lessonContext.lessonTitle && (prompt.includes('هذا الدرس') || prompt.includes('الضابط') || prompt.includes('الباب الحالي'))) {
    currentText = `[سياق الدرس: ${lessonContext.doorTitle || ''} - ${lessonContext.lessonTitle}]\n${prompt}`;
  }

  contents.push({
    role: 'user',
    parts: [{ text: currentText }],
  });

  return contents;
}

// Ultra-Fast Real-Time Streaming Scholarly Consultation Endpoint (SSE) with Model Cascade
app.post('/api/ai/scholarly-consultation/stream', async (req: Request, res: Response) => {
  const { prompt, mode = 'thinking', lessonContext, chatHistory = [] } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'الرجاء إدخال سؤالك أو استفسارك الشرعي.' });
  }

  const client = getGeminiClient();

  if (!client) {
    return res.status(500).json({
      error: 'لم يتم العثور على مفتاح الذكاء الاصطناعي (GEMINI_API_KEY).',
    });
  }

  // Set SSE streaming headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const contents = buildGeminiContents(prompt, chatHistory, lessonContext);
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
        // Silently cascade to next resilient model
        continue;
      }
      res.write(`data: ${JSON.stringify({ error: 'عذراً، حدث تعثر مؤقت في معالجة الاستفسار. يرجى إعادة طرح السؤال.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }
  }
});

// Scholarly Consultation Endpoint (Non-streaming fallback, optimized for speed)
app.post('/api/ai/scholarly-consultation', async (req: Request, res: Response) => {
  const { prompt, mode = 'thinking', lessonContext, chatHistory = [] } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'الرجاء إدخال سؤالك أو استفسارك الشرعي.' });
  }

  const client = getGeminiClient();

  if (!client) {
    return res.status(500).json({
      error: 'لم يتم العثور على مفتاح الذكاء الاصطناعي (GEMINI_API_KEY).',
      reply: 'الرجاء التأكد من ضبط مفتاح GEMINI_API_KEY في إعدادات البيئة ليتمكن الشيخ من التفكير والإجابة الحية.',
    });
  }

  const contents = buildGeminiContents(prompt, chatHistory, lessonContext);

  try {
    if (mode === 'thinking') {
      // High-speed reasoning with ThinkingLevel.LOW
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

        return res.json({
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
          return res.json({
            reply: fallbackResponse.text || 'بارك الله فيك، تم استخراج الجواب المؤصل.',
            mode: 'thinking-resilient',
          });
        }
        throw err;
      }
    } else if (mode === 'search') {
      // Search Grounding with gemini-3.7-flash
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

        return res.json({
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
          return res.json({
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
      // Fast Pedagogical / Conversational Mode
      try {
        const response = await client.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: contents,
          config: {
            systemInstruction: `${SCHOLAR_SYSTEM_PROMPT}\nأنت في وضع (المعلم المباشر السريع). أجب بإيجاز ذكي وتركيز عالي، أو حاور الطالب بما يناسب سؤاله.`,
          },
        });

        return res.json({
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
          return res.json({
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
});

// Dynamic Question Generator
app.post('/api/ai/generate-question', async (req: Request, res: Response) => {
  const { doorTitle, lessonTitle, centralRule, level } = req.body;
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
    return res.json(fallbackQuestion);
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
      return res.json(parsed);
    }
    return res.json(fallbackQuestion);
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
          return res.json(parsed);
        }
      } catch (secondaryErr: any) {
        // Fall through to fallbackQuestion
      }
    }
    return res.json(fallbackQuestion);
  }
});

// Helper to convert Raw PCM 16-bit 24000Hz to standard WAV Buffer
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const buffer = Buffer.alloc(totalSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(totalSize - 8, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  pcmBuffer.copy(buffer, 44);
  return buffer;
}

// In-memory audio cache for fast playback
const ttsAudioCache = new Map<string, string>();

// Clean Arabic text from markdown syntax for optimal natural human speech
function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // link text only
    .replace(/[#*`_~>[\]]/g, '') // remove markdown symbols
    .replace(/\n\s*[-•]\s*/g, '، ') // bullet points to pauses
    .replace(/\n{2,}/g, '. ') // double newlines to sentence pauses
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Ultra-Human Arabic Voice Recitation & Scholar Speech Endpoint
app.post('/api/ai/tts-recitation', async (req: Request, res: Response) => {
  const { text, voice = 'charon', style = 'scholar' } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'الرجاء توفير النص المراد تلاوته أو قراءته.' });
  }

  const client = getGeminiClient();
  if (!client) {
    return res.status(500).json({ error: 'مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) غير مهيأ.' });
  }

  // Clean text and optimize to ~350 characters for ultra-fast natural human speech response
  let cleanedText = cleanTextForSpeech(text);
  if (cleanedText.length > 360) {
    // Truncate at last complete sentence boundary for rapid natural speech response
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
    return res.json({
      success: true,
      audioUrl: ttsAudioCache.get(cacheKey),
      cached: true,
    });
  }

  // Select Gemini prebuilt voice name
  let targetVoiceName = 'Charon';
  if (voice === 'fenrir') {
    targetVoiceName = 'Fenrir';
  } else if (voice === 'puck') {
    targetVoiceName = 'Puck';
  } else {
    targetVoiceName = 'Charon';
  }

  // Attempt TTS generation with fast backoff
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

      // Find inline audio data across parts
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

      // Cache result
      if (ttsAudioCache.size > 200) {
        const keys = Array.from(ttsAudioCache.keys()).slice(0, 60);
        keys.forEach((k) => ttsAudioCache.delete(k));
      }
      ttsAudioCache.set(cacheKey, audioUrl);

      return res.json({
        success: true,
        audioUrl,
        voice: targetVoiceName,
        durationEstimateSec: Math.round(pcmBuffer.length / (24000 * 2)),
      });
    } catch (error: any) {
      // Parse retry delay from error if available
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

      return res.json({
        success: false,
        quotaExhausted: isQuota,
        retryAfterSeconds,
        error: errorMessage,
        details: error?.message,
      });
    }
  }
});

// Vite / Static server integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Minhaj Al-Mutafaqqih server running on http://localhost:${PORT}`);
  });
}

startServer();
