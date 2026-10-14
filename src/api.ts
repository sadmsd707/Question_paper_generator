// API client for the PaperGen backend server
import type { Question, QuestionType, Subject, QuestionPaper, TeacherProfile } from './types';
import { config } from './config';

const BASE = config.apiBaseUrl;

export interface ApiQuestion {
  id: string;
  exam: string;
  subject: string;
  chapter: string;
  topic: string;
  year: number;
  paper_title: string;
  difficulty: string;
  type: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  is_pyq: number;
}

export interface QuestionsResponse {
  total: number;
  page: number;
  limit: number;
  questions: ApiQuestion[];
}

export interface ChapterInfo {
  chapter: string;
  count: number;
}

export interface TopicInfo {
  topic: string;
  count: number;
}

export interface StatsResponse {
  total: number;
  totalQuestions: number;
  byExam: { exam: string; count: number }[];
  bySubject: { subject: string; count: number }[];
  totalPapers: number;
  publishedPapers: number;
  draftPapers: number;
  totalDownloads: number;
  userQuestionsCount: number;
}

export interface StatusResponse {
  ready: boolean;
  totalQuestions: number;
}

async function get<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(BASE + endpoint);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== undefined) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function post<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function put<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function del<T>(endpoint: string): Promise<T> {
  const res = await fetch(BASE + endpoint, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  status: () => get<StatusResponse>('/status'),

  questions: (params: {
    exam?: string;
    subject?: string;
    chapter?: string;
    topic?: string;
    difficulty?: string;
    type?: string;
    search?: string;
    source?: '' | 'pyq' | 'practice';  // '' = all, 'pyq' = PYQs only, 'practice' = non-PYQ practice
    year?: string;
    page?: number;
    limit?: number;
  }) => get<QuestionsResponse>('/questions', params as Record<string, string | number>),

  chapters: (exam: string, subject: string) =>
    get<ChapterInfo[]>('/chapters', { exam, subject }),

  topics: (exam: string, subject: string, chapter: string) =>
    get<TopicInfo[]>('/topics', { exam, subject, chapter }),

  stats: () => get<StatsResponse>('/stats'),

  years: (exam: string) => get<number[]>('/years', { exam }),

  // ─── Online Papers ──────────────────────────────────────────────────────────
  papers: {
    getAll: () => get<QuestionPaper[]>('/papers'),
    getById: (id: string) => get<QuestionPaper>(`/papers/${id}`),
    create: (paper: Partial<QuestionPaper>) => post<QuestionPaper>('/papers', paper),
    update: (id: string, updates: Partial<QuestionPaper>) => put<QuestionPaper>(`/papers/${id}`, updates),
    delete: (id: string) => del<{ success: boolean; id: string }>(`/papers/${id}`),
    clearAll: () => del<{ success: boolean; count: number }>('/papers'),
    duplicate: (id: string) => post<QuestionPaper>(`/papers/${id}/duplicate`, {}),
    download: (id: string) => post<QuestionPaper>(`/papers/${id}/download`, {}),
  },

  // ─── Online User Questions ──────────────────────────────────────────────────
  userQuestions: {
    getAll: () => get<Question[]>('/user-questions'),
    create: (q: Partial<Question>) => post<Question>('/user-questions', q),
    update: (id: string, updates: Partial<Question>) => put<Question>(`/user-questions/${id}`, updates),
    delete: (id: string) => del<{ success: boolean; id: string }>(`/user-questions/${id}`),
    clearAll: () => del<{ success: boolean; count: number }>('/user-questions'),
  },

  // ─── Online Teacher Profile ─────────────────────────────────────────────────
  profile: {
    get: () => get<TeacherProfile>('/profile'),
    update: (p: Partial<TeacherProfile>) => put<TeacherProfile>('/profile', p),
  },
};

// Map API question to app Question type
const TYPE_MAP: Record<string, QuestionType> = {
  mcq: 'MCQ Single',
  mcqm: 'MCQ Multiple',
  integer: 'Integer',
  numerical: 'Numerical',
  'short-answer': 'Short Answer',
};

const SUBJECT_MAP: Record<string, Subject> = {
  physics: 'Physics',
  chemistry: 'Chemistry',
  mathematics: 'Mathematics',
  biology: 'Biology',
  botany: 'Botany',
  zoology: 'Zoology',
};

const EXAM_MARKS: Record<string, { marks: number; neg: number }> = {
  'jee-main': { marks: 4, neg: 1 },
  'jee-advanced': { marks: 4, neg: 2 },
  neet: { marks: 4, neg: 1 },
  mhtcet: { marks: 2, neg: 0 },
};

export function apiQuestionToAppQuestion(q: ApiQuestion): Question {
  const subject = SUBJECT_MAP[q.subject.toLowerCase()] || (q.subject as Subject);
  const type = TYPE_MAP[q.type.toLowerCase()] || 'MCQ Single';
  const marking = EXAM_MARKS[q.exam] || { marks: 4, neg: 1 };
  const hasOptions = q.option_a || q.option_b || q.option_c || q.option_d;
  const options = hasOptions
    ? [
        { id: 'a', text: q.option_a || '' },
        { id: 'b', text: q.option_b || '' },
        { id: 'c', text: q.option_c || '' },
        { id: 'd', text: q.option_d || '' },
      ].filter(o => o.text)
    : [];

  // Normalize correctAnswer: A/B/C/D → a/b/c/d
  const correct = q.correct_answer
    ? q.correct_answer.toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
    : [];
  const correctAnswer = type === 'MCQ Multiple'
    ? correct
    : (correct[0] || '');

  return {
    id: q.id,
    type,
    text: q.question_text,
    options,
    correctAnswer,
    marks: marking.marks,
    negativeMarks: marking.neg,
    subject,
    chapter: q.chapter,
    topic: q.topic,
    difficulty: (q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1).toLowerCase()) as any,
    explanation: q.explanation || '',
    exam: q.exam === 'jee-main' ? 'JEE Main' : q.exam === 'jee-advanced' ? 'JEE Advanced' : q.exam === 'neet' ? 'NEET UG' : 'MHT-CET' as any,
    createdAt: new Date().toISOString(),
  };
}
