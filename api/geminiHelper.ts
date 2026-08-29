import { GoogleGenAI } from '@google/genai';

// Helper to set universal CORS headers on responses to prevent any cross-origin blocks
export function setCorsHeaders(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}

// Initialize Gemini Client securely via process.env.GEMINI_API_KEY
let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined in process.env');
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// System Prompt for the AI Islamic Scholar & Mentor
export const SCHOLAR_SYSTEM_PROMPT = `
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

// Helper to check if an error is transient (HTTP 503 UNAVAILABLE / quota, etc.)
export function isTransientOrQuotaError(err: any): boolean {
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

// Build contents array with conversation history
export function buildGeminiContents(prompt: string, chatHistory?: any[], lessonContext?: any): any[] {
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

// Convert Raw PCM 16-bit 24000Hz to standard WAV Buffer
export function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
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
  buffer.writeUInt16LE(1, 20); // PCM format
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

// Clean Arabic text from markdown syntax for optimal speech synthesis
export function cleanTextForSpeech(rawText: string): string {
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
