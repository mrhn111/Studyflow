import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  AppState, Subject, HomeworkTask, Exam, WeeklyGoal, Subtask, Priority,
} from '../types';

const STORAGE_KEY = 'studyflow-v1';

const defaultState: AppState = {
  topics: [], deadline: '', schedule: [], currentTopicId: null,
  subjects: [], homework: [], exams: [], weeklyGoals: [], notes: [],
  hasCompletedOnboarding: false, username: '', darkMode: false,
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultState;
}

function persist(s: AppState) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

function monday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d); m.setDate(d.getDate() + diff);
  return `${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,'0')}-${String(m.getDate()).padStart(2,'0')}`;
}

interface AppContextValue extends AppState {
  completeOnboarding(subjects: Subject[], goals: {subjectId:string;target:number}[]): void;
  addSubject(s: Subject): void;
  removeSubject(id: string): void;
  addHomework(t: Omit<HomeworkTask,'id'|'createdAt'>): void;
  updateHomework(id: string, u: Partial<Omit<HomeworkTask,'id'|'createdAt'>>): void;
  deleteHomework(id: string): void;
  toggleSubtask(taskId: string, subtaskId: string): void;
  addExam(e: Omit<Exam,'id'>): void;
  updateExam(id: string, u: Partial<Omit<Exam,'id'>>): void;
  deleteExam(id: string): void;
  setWeeklyGoal(subjectId: string, target: number): void;
  logGoalProgress(id: string, amount: number): void;
  resetGoalProgress(id: string): void;
  resetAllGoalProgress(): void;
  saveNote(subjectId: string, content: string): void;
  setCurrentTopic(id: string|null): void;
  setUsername(name: string): void;
  setDarkMode(dark: boolean): void;
  resetAllData(): void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  function update(next: AppState) { setState(next); persist(next); }

  const ctx: AppContextValue = {
    ...state,

    completeOnboarding(subjects, goals) {
      const wk = monday();
      update({
        ...state, subjects,
        weeklyGoals: goals.map(g => ({
          id: crypto.randomUUID(), subjectId: g.subjectId,
          target: g.target, progress: 0, weekStart: wk,
        })),
        hasCompletedOnboarding: true,
      });
    },

    addSubject(s) { update({ ...state, subjects: [...state.subjects, s] }); },

    removeSubject(id) {
      update({
        ...state,
        subjects:     state.subjects.filter(s => s.id !== id),
        homework:     state.homework.filter(h => h.subjectId !== id),
        exams:        state.exams.filter(e => e.subjectId !== id),
        weeklyGoals:  state.weeklyGoals.filter(g => g.subjectId !== id),
        notes:        state.notes.filter(n => n.subjectId !== id),
      });
    },

    addHomework(t) {
      const task: HomeworkTask = {
        ...t, id: crypto.randomUUID(), createdAt: new Date().toISOString(),
      };
      update({ ...state, homework: [...state.homework, task] });
    },

    updateHomework(id, u) {
      update({ ...state, homework: state.homework.map(h => h.id === id ? { ...h, ...u } : h) });
    },

    deleteHomework(id) {
      update({ ...state, homework: state.homework.filter(h => h.id !== id) });
    },

    toggleSubtask(taskId, subtaskId) {
      update({
        ...state,
        homework: state.homework.map(h =>
          h.id !== taskId ? h : {
            ...h,
            subtasks: h.subtasks.map((s: Subtask) =>
              s.id === subtaskId ? { ...s, completed: !s.completed } : s
            ),
          }
        ),
      });
    },

    addExam(e) { update({ ...state, exams: [...state.exams, { ...e, id: crypto.randomUUID() }] }); },

    updateExam(id, u) {
      update({ ...state, exams: state.exams.map(e => e.id === id ? { ...e, ...u } : e) });
    },

    deleteExam(id) { update({ ...state, exams: state.exams.filter(e => e.id !== id) }); },

    setWeeklyGoal(subjectId, target) {
      const wk = monday();
      const existing = state.weeklyGoals.find(g => g.subjectId === subjectId);
      if (existing) {
        update({ ...state, weeklyGoals: state.weeklyGoals.map(g => g.subjectId === subjectId ? { ...g, target, weekStart: wk } : g) });
      } else {
        const ng: WeeklyGoal = { id: crypto.randomUUID(), subjectId, target, progress: 0, weekStart: wk };
        update({ ...state, weeklyGoals: [...state.weeklyGoals, ng] });
      }
    },

    logGoalProgress(id, amount) {
      update({ ...state, weeklyGoals: state.weeklyGoals.map(g => g.id === id ? { ...g, progress: g.progress + amount } : g) });
    },

    resetGoalProgress(id) {
      update({ ...state, weeklyGoals: state.weeklyGoals.map(g => g.id === id ? { ...g, progress: 0, weekStart: monday() } : g) });
    },

    resetAllGoalProgress() {
      const wk = monday();
      update({ ...state, weeklyGoals: state.weeklyGoals.map(g => ({ ...g, progress: 0, weekStart: wk })) });
    },

    saveNote(subjectId, content) {
      const updatedAt = new Date().toISOString();
      const exists = state.notes.some(n => n.subjectId === subjectId);
      const notes = exists
        ? state.notes.map(n => n.subjectId === subjectId ? { ...n, content, updatedAt } : n)
        : [...state.notes, { subjectId, content, updatedAt }];
      update({ ...state, notes });
    },

    setCurrentTopic(id) { update({ ...state, currentTopicId: id }); },
    setUsername(name) { update({ ...state, username: name }); },
    setDarkMode(dark) { update({ ...state, darkMode: dark }); },

    resetAllData() {
      localStorage.removeItem(STORAGE_KEY);
      setState(defaultState);
    },
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const c = useContext(AppContext);
  if (!c) throw new Error('useApp must be used within AppProvider');
  return c;
}

// Unused but exported to satisfy legacy imports that might reference these
export function _legacyExports() {
  const _p: Priority = 'low';
  return _p;
}
