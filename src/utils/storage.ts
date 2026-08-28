import { UserProgress } from '../types';

const STORAGE_KEY = 'minhaj_mutafaqqih_progress_v1';

export const INITIAL_PROGRESS: UserProgress = {
  completedLessonIds: [],
  unlockedDoorIds: ['door-aqeedah', 'door-fiqh', 'door-tazkiyah', 'door-uloom'], // All doors accessible to visitors
  lessonQuizScores: {},
  masteryCertificates: {},
  userNotes: {},
  bookmarkedLessons: [],
  savedFlashcards: [],
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

export function loadUserProgress(): UserProgress {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return INITIAL_PROGRESS;
    const parsed: UserProgress = JSON.parse(data);
    
    // Check streak
    const today = new Date().toISOString().split('T')[0];
    if (parsed.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (parsed.lastActiveDate === yesterday) {
        parsed.streakDays += 1;
      } else {
        parsed.streakDays = 1;
      }
      parsed.lastActiveDate = today;
      saveUserProgress(parsed);
    }
    
    return {
      ...INITIAL_PROGRESS,
      ...parsed,
    };
  } catch (e) {
    console.error('Error loading progress:', e);
    return INITIAL_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving progress:', e);
  }
}
