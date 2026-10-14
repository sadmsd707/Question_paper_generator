import { Zap, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { EXAM_COLORS, EXAM_TEMPLATES, EXAM_SUBJECTS } from '../types';
import type { Exam } from '../types';
import { generateId } from '../types';

const TEMPLATE_INFO: Record<Exam, {
  desc: string;
  fullDesc: string;
  questions: string;
  duration: string;
  marks: string;
  subjects: string;
  pattern: string[];
}> = {
  'JEE Main': {
    desc: 'Joint Entrance Examination Main',
    fullDesc: 'National level entrance exam for NITs, IIITs, CFTIs. Conducted by NTA.',
    questions: '90 Questions',
    duration: '3 Hours',
    marks: '300 Marks',
    subjects: 'Physics, Chemistry, Mathematics',
    pattern: [
      'Section A: 20 MCQ questions (4 marks each, -1 for wrong)',
      'Section B: 10 Numerical questions (4 marks each, no negative marking)',
      'Attempt any 5 of 10 in Section B',
    ],
  },
  'JEE Advanced': {
    desc: 'Joint Entrance Examination Advanced',
    fullDesc: 'Entrance exam for IITs. Two papers of 3 hours each. More complex marking schemes.',
    questions: '54 Questions',
    duration: '3 Hours per paper',
    marks: '180 Marks',
    subjects: 'Physics, Chemistry, Mathematics',
    pattern: [
      'Section 1: 6 Single Correct MCQs (3 marks, -1 for wrong)',
      'Section 2: 8 Multiple Correct MCQs (4 marks, -2 partial)',
      'Section 3: 6 Integer type (4 marks, no negative)',
      'Marking varies by paper and year',
    ],
  },
  'NEET UG': {
    desc: 'National Eligibility cum Entrance Test',
    fullDesc: 'Entrance exam for MBBS/BDS admissions. 4 subjects with 2 sections each.',
    questions: '180 Questions',
    duration: '3 Hours 20 Minutes',
    marks: '720 Marks',
    subjects: 'Physics, Chemistry, Botany, Zoology',
    pattern: [
      'Each subject has Section A (35 MCQs) and Section B (15 MCQs)',
      'Attempt any 10 from Section B',
      '+4 for correct, -1 for wrong',
      'Total: 180 questions (160 attempted)',
    ],
  },
  'MHT-CET': {
    desc: 'Maharashtra Common Entrance Test',
    fullDesc: 'State level entrance exam for Maharashtra engineering and pharmacy admissions.',
    questions: '150 Questions',
    duration: '3 Hours',
    marks: '200 Marks',
    subjects: 'Physics, Chemistry, Mathematics/Biology',
    pattern: [
      'Mathematics: 50 questions × 2 marks = 100 marks',
      'Physics: 25 questions × 1 mark = 25 marks',
      'Chemistry: 25 questions × 1 mark = 25 marks',
      'No negative marking',
    ],
  },
};

export function Templates() {
  const { setPage, setWizardDetails, setWizardSections, resetWizard } = useStore();
  const exams: Exam[] = ['JEE Main', 'JEE Advanced', 'NEET UG', 'MHT-CET'];

  const handleUseTemplate = (exam: Exam) => {
    resetWizard();
    const templateSections = EXAM_TEMPLATES[exam]?.sections.map((s) => ({
      ...s, id: generateId(), questionIds: [],
    })) || [];
    setWizardDetails({
      exam,
      subjects: EXAM_SUBJECTS[exam],
      maxMarks: exam === 'JEE Main' ? 300 : exam === 'JEE Advanced' ? 180 : exam === 'NEET UG' ? 720 : 200,
      duration: exam === 'NEET UG' ? '3 Hours 20 Minutes' : '3 Hours',
    });
    setWizardSections(templateSections);
    setPage('create');
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Examination Templates</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
          Start with a pre-configured template based on the official exam pattern. You can customize every aspect after loading.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 20 }}>
        {exams.map((exam) => {
          const info = TEMPLATE_INFO[exam];
          const color = EXAM_COLORS[exam];
          return (
            <div
              key={exam}
              className="card"
              style={{
                borderTop: `4px solid ${color}`,
                display: 'flex', flexDirection: 'column', gap: 0,
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 6px 24px ${color}20`)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px var(--color-shadow)')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: color + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color, fontWeight: 800, fontSize: 16, flexShrink: 0,
                }}>
                  {exam.split(' ').map(w => w[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>{exam}</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>{info.desc}</p>
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--color-charcoal-light)', marginBottom: 14, lineHeight: 1.6 }}>
                {info.fullDesc}
              </p>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Questions', value: info.questions },
                  { label: 'Duration', value: info.duration },
                  { label: 'Total Marks', value: info.marks },
                ].map((s) => (
                  <div key={s.label} style={{
                    padding: '6px 12px', background: 'var(--color-cream)',
                    borderRadius: 'var(--radius-md)', fontSize: 12,
                  }}>
                    <span style={{ color: 'var(--color-muted)' }}>{s.label}: </span>
                    <span style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Pattern */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Exam Pattern</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {info.pattern.map((p, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--color-charcoal-light)' }}>
                      <span style={{ color, flexShrink: 0, marginTop: 1 }}>•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subjects */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Subjects</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {EXAM_SUBJECTS[exam].map((s) => (
                    <span key={s} className="badge badge-neutral" style={{ fontSize: 12 }}>{s}</span>
                  ))}
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={() => handleUseTemplate(exam)}
                style={{ alignSelf: 'flex-start', fontSize: 13 }}
              >
                <Zap size={15} /> Use This Template
                <ChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
