import { create } from 'zustand';
import type {
  AppState, Page, QuestionPaper, Question, WizardState, PaperDetails, Section, TeacherProfile
} from './types';
import { generateId } from './types';
import { api } from './api';

// Ensure no data remains on local devices
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('qpg-storage');
    window.localStorage.removeItem('qp-generator-store');
  }
} catch {
  // Ignore local storage access errors
}

const defaultWizard: WizardState = {
  step: 1,
  paperId: null,
  details: {
    title: '',
    exam: '',
    subjects: [],
    targetClass: '',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    duration: '3 Hours',
    maxMarks: 300,
    institution: '',
    teacherName: '',
    instructions: '1. All questions are compulsory.\n2. Read each question carefully before answering.\n3. Use blue or black ball-point pen only.\n4. Do not write on the question paper.',
    logoUrl: undefined,
  },
  sections: [],
  selectedQuestionIds: [],
  tempQuestions: [],
};

interface Store extends AppState {
  isOnline: boolean;
  isLoadingData: boolean;
  dataLoaded: boolean;
  setPage: (page: Page) => void;
  fetchOnlineData: () => Promise<void>;
  // Papers
  addPaper: (paper: QuestionPaper) => Promise<void>;
  updatePaper: (id: string, updates: Partial<QuestionPaper>) => Promise<void>;
  deletePaper: (id: string) => Promise<void>;
  duplicatePaper: (id: string) => Promise<void>;
  clearAllPapers: () => Promise<void>;
  // Question bank
  addToBank: (q: Question) => Promise<void>;
  updateBankQuestion: (id: string, updates: Partial<Question>) => Promise<void>;
  deleteBankQuestion: (id: string) => Promise<void>;
  clearAllBankQuestions: () => Promise<void>;
  // Wizard
  setWizardStep: (step: number) => void;
  setWizardDetails: (details: Partial<PaperDetails>) => void;
  setWizardSections: (sections: Section[]) => void;
  addWizardSection: (section: Section) => void;
  updateWizardSection: (id: string, updates: Partial<Section>) => void;
  deleteWizardSection: (id: string) => void;
  addTempQuestion: (q: Question) => void;
  updateTempQuestion: (id: string, updates: Partial<Question>) => void;
  deleteTempQuestion: (id: string) => void;
  toggleSelectedQuestion: (id: string) => void;
  resetWizard: () => void;
  loadPaperIntoWizard: (paperId: string) => void;
  saveWizardAsDraft: () => Promise<string>;
  publishWizardPaper: () => Promise<string>;
  // Teacher
  updateTeacher: (updates: Partial<TeacherProfile>) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  // Clean real initial state - NO mock or fake data
  papers: [],
  questionBank: [],
  wizard: defaultWizard,
  currentPage: 'dashboard',
  isOnline: true,
  isLoadingData: false,
  dataLoaded: false,
  teacher: {
    name: 'Teacher',
    email: '',
    institution: '',
    avatar: 'T',
  },

  setPage: (page) => set({ currentPage: page }),

  fetchOnlineData: async () => {
    if (get().isLoadingData) return;
    set({ isLoadingData: true });
    try {
      const [papers, userQuestions, profile] = await Promise.all([
        api.papers.getAll().catch(() => []),
        api.userQuestions.getAll().catch(() => []),
        api.profile.get().catch(() => ({
          name: 'Teacher',
          email: '',
          institution: '',
          avatar: 'T',
        })),
      ]);

      set({
        papers,
        questionBank: userQuestions,
        teacher: profile,
        dataLoaded: true,
        isLoadingData: false,
        isOnline: true,
      });
    } catch (err) {
      console.error('Failed to sync online data:', err);
      set({ isLoadingData: false, isOnline: false });
    }
  },

  addPaper: async (paper) => {
    // Optimistic update
    set((s) => ({ papers: [paper, ...s.papers] }));
    try {
      const saved = await api.papers.create(paper);
      set((s) => ({
        papers: s.papers.map((p) => (p.id === paper.id ? saved : p)),
      }));
    } catch (err) {
      console.error('Failed to save paper online:', err);
    }
  },

  updatePaper: async (id, updates) => {
    set((s) => ({
      papers: s.papers.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)),
    }));
    try {
      await api.papers.update(id, updates);
    } catch (err) {
      console.error('Failed to update paper online:', err);
    }
  },

  deletePaper: async (id) => {
    set((s) => ({ papers: s.papers.filter((p) => p.id !== id) }));
    try {
      await api.papers.delete(id);
    } catch (err) {
      console.error('Failed to delete paper online:', err);
    }
  },

  duplicatePaper: async (id) => {
    try {
      const cloned = await api.papers.duplicate(id);
      set((s) => ({ papers: [cloned, ...s.papers] }));
    } catch {
      const paper = get().papers.find((p) => p.id === id);
      if (!paper) return;
      const newPaper: QuestionPaper = {
        ...paper,
        id: generateId(),
        details: { ...paper.details, title: paper.details.title + ' (Copy)' },
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        downloadCount: 0,
      };
      await get().addPaper(newPaper);
    }
  },

  clearAllPapers: async () => {
    set({ papers: [] });
    try {
      await api.papers.clearAll();
    } catch (err) {
      console.error('Failed to clear papers online:', err);
    }
  },

  addToBank: async (q) => {
    set((s) => ({ questionBank: [q, ...s.questionBank] }));
    try {
      const saved = await api.userQuestions.create(q);
      set((s) => ({
        questionBank: s.questionBank.map((item) => (item.id === q.id ? saved : item)),
      }));
    } catch (err) {
      console.error('Failed to save question online:', err);
    }
  },

  updateBankQuestion: async (id, updates) => {
    set((s) => ({
      questionBank: s.questionBank.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    }));
    try {
      await api.userQuestions.update(id, updates);
    } catch (err) {
      console.error('Failed to update question online:', err);
    }
  },

  deleteBankQuestion: async (id) => {
    set((s) => ({ questionBank: s.questionBank.filter((q) => q.id !== id) }));
    try {
      await api.userQuestions.delete(id);
    } catch (err) {
      console.error('Failed to delete question online:', err);
    }
  },

  clearAllBankQuestions: async () => {
    set({ questionBank: [] });
    try {
      await api.userQuestions.clearAll();
    } catch (err) {
      console.error('Failed to clear user questions online:', err);
    }
  },

  setWizardStep: (step) => set((s) => ({ wizard: { ...s.wizard, step } })),
  setWizardDetails: (details) =>
    set((s) => ({ wizard: { ...s.wizard, details: { ...s.wizard.details, ...details } } })),
  setWizardSections: (sections) => set((s) => ({ wizard: { ...s.wizard, sections } })),
  addWizardSection: (section) =>
    set((s) => ({ wizard: { ...s.wizard, sections: [...s.wizard.sections, section] } })),
  updateWizardSection: (id, updates) =>
    set((s) => ({
      wizard: {
        ...s.wizard,
        sections: s.wizard.sections.map((sec) => (sec.id === id ? { ...sec, ...updates } : sec)),
      },
    })),
  deleteWizardSection: (id) =>
    set((s) => ({ wizard: { ...s.wizard, sections: s.wizard.sections.filter((sec) => sec.id !== id) } })),
  addTempQuestion: (q) =>
    set((s) => ({ wizard: { ...s.wizard, tempQuestions: [...s.wizard.tempQuestions, q] } })),
  updateTempQuestion: (id, updates) =>
    set((s) => ({
      wizard: {
        ...s.wizard,
        tempQuestions: s.wizard.tempQuestions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
      },
    })),
  deleteTempQuestion: (id) =>
    set((s) => ({
      wizard: {
        ...s.wizard,
        tempQuestions: s.wizard.tempQuestions.filter((q) => q.id !== id),
        selectedQuestionIds: s.wizard.selectedQuestionIds.filter((qid) => qid !== id),
      },
    })),
  toggleSelectedQuestion: (id) =>
    set((s) => {
      const sel = s.wizard.selectedQuestionIds;
      const next = sel.includes(id) ? sel.filter((qid) => qid !== id) : [...sel, id];
      return { wizard: { ...s.wizard, selectedQuestionIds: next } };
    }),
  resetWizard: () => set({ wizard: defaultWizard }),
  loadPaperIntoWizard: (paperId) => {
    const paper = get().papers.find((p) => p.id === paperId);
    if (!paper) return;
    set({
      wizard: {
        step: 1,
        paperId,
        details: { ...paper.details },
        sections: [...paper.sections],
        selectedQuestionIds: paper.questions.map((q) => q.id),
        tempQuestions: [...paper.questions],
      },
      currentPage: 'create',
    });
  },
  saveWizardAsDraft: async () => {
    const w = get().wizard;
    const allQ = [...get().questionBank.filter((q) => w.selectedQuestionIds.includes(q.id)), ...w.tempQuestions];
    const uniqueQ = allQ.filter((q, i, arr) => arr.findIndex((x) => x.id === q.id) === i);
    const id = w.paperId ?? generateId();
    const now = new Date().toISOString();
    const paperData: QuestionPaper = {
      id,
      details: w.details,
      sections: w.sections,
      questions: uniqueQ,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      downloadCount: 0,
    };

    if (w.paperId && get().papers.find((p) => p.id === w.paperId)) {
      await get().updatePaper(id, { details: w.details, sections: w.sections, questions: uniqueQ, status: 'draft' });
    } else {
      await get().addPaper(paperData);
    }
    set((s) => ({ wizard: { ...s.wizard, paperId: id } }));
    return id;
  },
  publishWizardPaper: async () => {
    const w = get().wizard;
    const allQ = [...get().questionBank.filter((q) => w.selectedQuestionIds.includes(q.id)), ...w.tempQuestions];
    const uniqueQ = allQ.filter((q, i, arr) => arr.findIndex((x) => x.id === q.id) === i);
    const id = w.paperId ?? generateId();
    const now = new Date().toISOString();
    const paperData: QuestionPaper = {
      id,
      details: w.details,
      sections: w.sections,
      questions: uniqueQ,
      status: 'published',
      createdAt: now,
      updatedAt: now,
      downloadCount: 0,
    };

    if (w.paperId && get().papers.find((p) => p.id === w.paperId)) {
      await get().updatePaper(id, { details: w.details, sections: w.sections, questions: uniqueQ, status: 'published' });
    } else {
      await get().addPaper(paperData);
    }
    set((s) => ({ wizard: { ...s.wizard, paperId: id } }));
    return id;
  },
  updateTeacher: async (updates) => {
    set((s) => ({ teacher: { ...s.teacher, ...updates } }));
    try {
      await api.profile.update(updates);
    } catch (err) {
      console.error('Failed to update profile online:', err);
    }
  },
}));
