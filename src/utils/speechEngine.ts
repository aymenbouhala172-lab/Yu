// Authentic Arabic Scholar Voice Engine
// Exclusively powered by Gemini Studio High-Fidelity Human AI Voices:
// - Charon: صوت الشيخ الوقور الجليل
// - Fenrir: القارئ المنشد الخاشع
// - Puck: المعلم والمحاضر الفصيح
// Strictly natural human studio audio with instant in-memory and session caching.

export type StudioVoicePersona = 'charon' | 'fenrir' | 'puck';

export interface VoiceOption {
  id: StudioVoicePersona;
  label: string;
  desc: string;
  icon: string;
}

export const SCHOLAR_VOICES: VoiceOption[] = [
  {
    id: 'charon',
    label: 'صوت الشيخ الوقور (Charon)',
    desc: 'نبرة صوت بشري عربي رخيم جهوري كعالم شرعي جليل في مجلس إقراء وتأصيل',
    icon: '🎙️',
  },
  {
    id: 'fenrir',
    label: 'القارئ المنشد الخاشع (Fenrir)',
    desc: 'نبرة صوت بشري شجية عذبة تفيض بالسكينة والتأمل والخشوع',
    icon: '📿',
  },
  {
    id: 'puck',
    label: 'المعلم والمحاضر الفصيح (Puck)',
    desc: 'بيان صوتي بشري ناصع ومخارج حروف واضحة للشرح والبيان',
    icon: '📜',
  },
];

// In-memory client cache for synthesized human audio (0ms instant replay)
export const clientAudioCache = new Map<string, string>();

// Clean Arabic text from markdown syntax and clutter for clean recitation
export function sanitizeArabicForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // link text only
    .replace(/[*_~`#>[\]]/g, '') // remove markdown symbols
    .replace(/^[•\-–—]\s*/gm, '، ') // bullet points to natural pauses
    .replace(/«|»|“|”|"/g, ' ') // quotes to subtle spacing
    .replace(/\n{2,}/g, '. ') // paragraph breaks to period pauses
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Extracts concise scholarly speech text (~200-350 chars) for high-speed voice synthesis
 */
export function extractScholarSpeechText(text: string): string {
  if (!text) return '';
  const sanitized = sanitizeArabicForSpeech(text);
  if (sanitized.length <= 350) {
    return sanitized;
  }
  
  const sliced = sanitized.slice(0, 380);
  const lastBoundary = Math.max(
    sliced.lastIndexOf('. '),
    sliced.lastIndexOf('! '),
    sliced.lastIndexOf('؟ '),
    sliced.lastIndexOf('.\n'),
    sliced.lastIndexOf('، '),
    sliced.lastIndexOf('؛ ')
  );
  if (lastBoundary > 120) {
    return sliced.slice(0, lastBoundary + 1).trim();
  }
  return sliced.trim();
}

export function getAudioCacheKey(text: string, voice: StudioVoicePersona): string {
  const speechText = extractScholarSpeechText(text);
  const snippet = speechText.slice(0, 80);
  return `${voice}_scholar_${snippet}_${speechText.length}`;
}

/**
 * Fetch Studio human audio from backend Gemini AI TTS
 */
export async function fetchNaturalScholarAudio(
  text: string,
  voice: StudioVoicePersona = 'charon'
): Promise<{ success: boolean; audioUrl?: string; error?: string; retryAfterSeconds?: number }> {
  const speechText = extractScholarSpeechText(text);
  if (!speechText) {
    return { success: false, error: 'النص فارغ' };
  }

  const cacheKey = getAudioCacheKey(speechText, voice);

  // 1. Check in-memory cache for instant 0ms playback
  if (clientAudioCache.has(cacheKey)) {
    return { success: true, audioUrl: clientAudioCache.get(cacheKey)! };
  }

  // 2. Check SessionStorage cache
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const stored = window.sessionStorage.getItem(`tts_${cacheKey}`);
      if (stored && stored.startsWith('data:audio/')) {
        clientAudioCache.set(cacheKey, stored);
        return { success: true, audioUrl: stored };
      }
    } catch {
      // Storage quota fallback
    }
  }

  // 3. Fetch from Server Gemini Studio TTS
  try {
    const res = await fetch('/api/ai/tts-recitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: speechText,
        voice,
        style: 'scholar',
      }),
    });

    const data = await res.json();
    if (data.success && data.audioUrl) {
      clientAudioCache.set(cacheKey, data.audioUrl);
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem(`tts_${cacheKey}`, data.audioUrl);
        }
      } catch {
        // Ignore quota limits
      }
      return { success: true, audioUrl: data.audioUrl };
    }

    return {
      success: false,
      error: data.error || 'تعذر توليد صوت الشيخ في هذه اللحظة، يرجى الضغط على زر إعادة الاستماع.',
      retryAfterSeconds: data.retryAfterSeconds,
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'تعذر الاتصال بمحرك صوت الشيخ، يرجى المحاولة بعد لحظات.',
    };
  }
}
