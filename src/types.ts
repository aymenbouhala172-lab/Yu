export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface QuranEvidence {
  surah: string;
  ayahNumber: number | string;
  arabicText: string;
  explanation: string;
}

export interface HadithEvidence {
  hadithText: string;
  source: string; // e.g., صحيح البخاري، صحيح مسلم
  grade: string; // e.g., صحيح، متفق عليه، حسن
  explanation: string;
}

export interface RuleOrPrinciple {
  title: string;
  rule: string;
  explanation: string;
  example: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  evidenceReference?: string;
  doubtContext?: string; // For questions testing clarification on a misconception
}

export interface LessonContent {
  id: string;
  title: string;
  subtitle: string;
  doorId: string;
  order: number;
  level: Level;
  estimatedMinutes: number;
  objectives: string[];
  centralRule: string; // الضابط الإجمالي / القاعدة المركزية
  introduction: string; // المدخل والتمهيد المنهجي
  detailedExplanation: {
    sectionTitle: string;
    content: string[];
  }[];
  quranEvidences: QuranEvidence[];
  hadithEvidences: HadithEvidence[];
  principles: RuleOrPrinciple[];
  contemporaryDoubtsAndClarifications?: {
    doubt: string;
    clarification: string;
    scholarlyRule: string;
  }[];
  practicalApplications: string[]; // تطبيقات فقهية ومعاصرة
  goldenSummary: string[]; // الخلاصة الذهبية / النقاط الجوهرية
  quiz: QuizQuestion[];
}

export interface Door {
  id: string;
  title: string;
  shortTitle: string;
  category: 'aqeedah' | 'fiqh' | 'tazkiyah' | 'uloom';
  iconName: string;
  description: string;
  pedagogicalGoal: string; // المقصد الشرعي والتربوي من الباب
  colorTheme: {
    primary: string;
    border: string;
    badge: string;
    accent: string;
  };
  lessons: LessonContent[];
  requiredPrerequisiteDoorId?: string;
}

export interface UserProgress {
  completedLessonIds: string[];
  unlockedDoorIds: string[];
  lessonQuizScores: Record<string, { score: number; total: number; passed: boolean; completedAt: string }>;
  masteryCertificates: Record<string, { awardedAt: string; scorePercent: number }>;
  userNotes: Record<string, string>; // lessonId -> note text
  bookmarkedLessons: string[];
  savedFlashcards: string[];
  streakDays: number;
  lastActiveDate: string;
}

export interface ScholarMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: 'thinking' | 'search' | 'fast';
  thoughtProcess?: string;
  sources?: { title: string; uri: string }[];
  contextLessonId?: string;
}

export interface BoldDilemma {
  id: string;
  category: 'aqeedah' | 'fiqh' | 'ethics' | 'modernity' | 'philosophy' | 'psychology';
  categoryLabel: string;
  title: string;
  boldQuestion: string;
  colorAccent: string; // emerald, amber, sapphire, rose, violet
  badgeText: string;
  theDilemma: string; // جوهر الشبهة أو التحدي
  rationalDeconstruction: string[]; // التفكيك العقلي والفلسفي
  scripturalFoundations: {
    text: string;
    source: string;
    pointOfEvidence: string;
  }[];
  decisiveRule: string; // الضابط الحاسم
  practicalTakeaway: string; // الخلاصة المعرفية والعملية
  suggestedScholarPrompt: string; // نص جاهز للمدارسة مع المعلم الذكي
}

