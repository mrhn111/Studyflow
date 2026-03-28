// ── Legacy schedule system (kept for compatibility) ──────────────────────────
export interface Topic { id: string; name: string }
export interface ScheduledTopic { id: string; name: string; completed: boolean }
export interface DayEntry { date: string; topics: ScheduledTopic[] }

// ── Ambient sound ─────────────────────────────────────────────────────────────
export type AmbientSound = 'none' | 'rain' | 'whitenoise' | 'lofi' | 'forest';

// ── Core new types ────────────────────────────────────────────────────────────
export interface Subject {
  id: string;
  name: string;
  color: string; // hex color
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export type Priority = 'low' | 'medium' | 'high';

export interface HomeworkTask {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;       // "YYYY-MM-DD"
  priority?: Priority;
  description?: string;
  subtasks: Subtask[];
  completed: boolean;
  createdAt: string;     // ISO string
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  date: string;          // "YYYY-MM-DD"
  notes?: string;
}

export interface WeeklyGoal {
  id: string;
  subjectId: string;
  target: number;        // questions per week
  progress: number;      // done so far this week
  weekStart: string;     // "YYYY-MM-DD" Monday of current week
}

export interface SubjectNote {
  subjectId: string;
  content: string;
  updatedAt: string;     // ISO timestamp
}

// ── App-wide state ────────────────────────────────────────────────────────────
export interface AppState {
  // Legacy
  topics: Topic[];
  deadline: string;
  schedule: DayEntry[];
  currentTopicId: string | null; // points to HomeworkTask.id for Focus pill
  // New
  subjects: Subject[];
  homework: HomeworkTask[];
  exams: Exam[];
  weeklyGoals: WeeklyGoal[];
  notes: SubjectNote[];
  hasCompletedOnboarding: boolean;
  username: string;
  darkMode: boolean;
}
