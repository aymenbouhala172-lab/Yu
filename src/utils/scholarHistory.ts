import { ScholarMessage } from '../types';

export interface ScholarSession {
  id: string;
  title: string;
  preview?: string;
  date: string;
  updatedAt?: string;
  doorTitle?: string;
  lessonTitle?: string;
  mode?: 'thinking' | 'search' | 'fast';
  messages: ScholarMessage[];
}

const STORAGE_KEY = 'minhaj_scholar_history_v2';
const LEGACY_STORAGE_KEY = 'minhaj_scholar_history_v1';

export function loadScholarHistory(): ScholarSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Fallback to legacy if available
    const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyData) {
      const parsed = JSON.parse(legacyData);
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Error loading scholar history:', e);
    return [];
  }
}

export function saveScholarHistory(sessions: ScholarSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving scholar history:', e);
  }
}

export function createNewScholarSession(initialTopic?: string, doorTitle?: string, lessonTitle?: string): ScholarSession {
  const newId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: newId,
    title: initialTopic || 'استشارة شرعية جديدة',
    date: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    doorTitle,
    lessonTitle,
    messages: [
      {
        id: `welcome-${newId}`,
        role: 'assistant',
        content: `السلام عليكم ورحمة الله وبركاته، مرحباً بك في هذه الاستشارة الشرعية المستقلة.
        
تفضل بطرح سؤالك أو المسألة التي تود بحثها وتحريرها، وسيتولى الشيخ الذكي تفصيل الجواب بالأدلة والضوابط المعتمدة في سجل خاص بهذه المسألة.`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        mode: 'thinking',
      },
    ],
  };
}

