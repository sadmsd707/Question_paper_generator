import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, BookOpen, Plus, Trash2, Edit3, Copy, GripVertical, Save, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';
import { EXAM_SUBJECTS, EXAM_COLORS, EXAM_TEMPLATES, QUESTION_TYPES, generateId, calculateTotalMarks } from '../types';
import type { Exam, Subject, Question, Section, QuestionType } from '../types';
import { StepIndicator } from '../components/StepIndicator';
import { QuestionForm } from '../components/QuestionForm';
import { PaperPreview } from '../components/PaperPreview';
import { QuestionBankBrowser } from '../components/QuestionBankBrowser';
import { MathText } from '../components/MathText';

// ─── Step 1: Exam Selection ───────────────────────────────────────────────────
function Step1({ onNext }: { onNext: () => void }) {
  const { wizard, setWizardDetails } = useStore();
  const exams: Exam[] = ['JEE Main', 'JEE Advanced', 'NEET UG', 'MHT-CET'];

  const examInfo: Record<Exam, { desc: string; questions: string; duration: string; marks: string }> = {
    'JEE Main': { desc: 'Joint Entrance Examination Main', questions: '90 Questions', duration: '3 Hours', marks: '300 Marks' },
    'JEE Advanced': { desc: 'Joint Entrance Examination Advanced', questions: '54 Questions', duration: '3 Hours', marks: '180 Marks' },
    'NEET UG': { desc: 'National Eligibility cum Entrance Test', questions: '180 Questions', duration: '3 hrs 20 min', marks: '720 Marks' },
    'MHT-CET': { desc: 'Maharashtra Common Entrance Test', questions: '150 Questions', duration: '3 Hours', marks: '200 Marks' },
  };

  return (
    <div style={{ padding: '32px', maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Select Examination</h2>
      <p style={{ color: 'var(--color-muted)', marginBottom: 28, fontSize: 14 }}>
        Choose the examination type for which you want to create the question paper.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {exams.map((exam) => {
          const color = EXAM_COLORS[exam];
          const isSelected = wizard.details.exam === exam;
          return (
            <button
              key={exam}
              onClick={() => setWizardDetails({ exam, subjects: EXAM_SUBJECTS[exam] })}
              style={{
                background: isSelected ? color + '12' : 'white',
                border: `2px solid ${isSelected ? color : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s',
                position: 'relative',
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 22, height: 22, borderRadius: '50%',
                  background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={12} color="white" />
                </div>
              )}
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: color + '18', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: 14, color: color,
                fontWeight: 700, fontSize: 15,
              }}>
                {exam.split(' ').map(w => w[0]).join('')}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-charcoal)', marginBottom: 4 }}>{exam}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 12 }}>{examInfo[exam].desc}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[examInfo[exam].questions, examInfo[exam].duration, examInfo[exam].marks].map((tag) => (
                  <span key={tag} style={{
                    background: 'var(--color-beige)', color: 'var(--color-charcoal-light)',
                    padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                  }}>{tag}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
        <button
          className="btn-primary"
          onClick={onNext}
          disabled={!wizard.details.exam}
          style={{ opacity: wizard.details.exam ? 1 : 0.5 }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Subject Selection ────────────────────────────────────────────────
function Step2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { wizard, setWizardDetails } = useStore();
  const exam = wizard.details.exam as Exam;
  const allSubjects = exam ? EXAM_SUBJECTS[exam] : [];

  const toggleSubject = (sub: Subject) => {
    const cur = wizard.details.subjects;
    const next = cur.includes(sub) ? cur.filter((s) => s !== sub) : [...cur, sub];
    setWizardDetails({ subjects: next });
  };

  const subjectColors: Record<Subject, string> = {
    Physics: '#d4622a',
    Chemistry: '#2d7a4f',
    Mathematics: '#8b6914',
    Biology: '#6b4f9e',
    Botany: '#3a7d44',
    Zoology: '#c0392b',
  };

  return (
    <div style={{ padding: '32px', maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Select Subjects</h2>
      <p style={{ color: 'var(--color-muted)', marginBottom: 28, fontSize: 14 }}>
        Choose one or more subjects to include in the question paper.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {allSubjects.map((sub) => {
          const isSelected = wizard.details.subjects.includes(sub);
          const color = subjectColors[sub] || '#7a7a7a';
          return (
            <button
              key={sub}
              onClick={() => toggleSubject(sub)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 20px',
                background: isSelected ? color + '10' : 'white',
                border: `2px solid ${isSelected ? color : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, color,
              }}>
                {sub[0]}
              </div>
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-charcoal)', flex: 1 }}>{sub}</span>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: `2px solid ${isSelected ? color : 'var(--color-border)'}`,
                background: isSelected ? color : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isSelected && <Check size={11} color="white" />}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
        <button className="btn-secondary" onClick={onBack}>
          <ChevronLeft size={16} /> Back
        </button>
        <button
          className="btn-primary"
          onClick={onNext}
          disabled={wizard.details.subjects.length === 0}
          style={{ opacity: wizard.details.subjects.length > 0 ? 1 : 0.5 }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Paper Details ────────────────────────────────────────────────────
function Step3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { wizard, setWizardDetails } = useStore();
  const d = wizard.details;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!d.title.trim()) e.title = 'Paper title is required.';
    if (!d.institution.trim()) e.institution = 'Institution name is required.';
    if (!d.teacherName.trim()) e.teacherName = 'Teacher name is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-md)', fontSize: 14, outline: 'none',
    fontFamily: 'var(--font-sans)', color: 'var(--color-charcoal)', background: 'white',
  };

  const field = (key: keyof typeof d, label: string, placeholder: string, type = 'text', required = false, textarea = false) => (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-charcoal-light)', marginBottom: 5 }}>
        {label} {required && '*'}
      </label>
      {textarea ? (
        <textarea
          style={{ ...inputStyle, minHeight: 90, resize: 'vertical', borderColor: errors[key] ? 'var(--color-red)' : 'var(--color-border)' }}
          placeholder={placeholder}
          value={d[key] as string}
          onChange={(e) => setWizardDetails({ [key]: e.target.value })}
        />
      ) : (
        <input
          type={type}
          style={{ ...inputStyle, borderColor: errors[key] ? 'var(--color-red)' : 'var(--color-border)' }}
          placeholder={placeholder}
          value={d[key] as string | number}
          onChange={(e) => setWizardDetails({ [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
        />
      )}
      {errors[key] && <span style={{ fontSize: 11, color: 'var(--color-red)' }}>{errors[key]}</span>}
    </div>
  );

  return (
    <div style={{ padding: '32px', maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Paper Details</h2>
      <p style={{ color: 'var(--color-muted)', marginBottom: 28, fontSize: 14 }}>
        Fill in the details that will appear on the question paper header.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {field('title', 'Question Paper Title', 'e.g., JEE Main Full Syllabus Mock Test – 2025', 'text', true)}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {field('targetClass', 'Class / Student Group', 'e.g., Class 12 / Dropper')}
          {field('academicYear', 'Academic Year', 'e.g., 2024-2025')}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {field('duration', 'Exam Duration', 'e.g., 3 Hours')}
          {field('maxMarks', 'Maximum Marks', '300', 'number')}
        </div>

        {field('institution', 'Institution / Coaching Name', 'e.g., Excellence Coaching Institute', 'text', true)}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {field('teacherName', 'Teacher Name', 'e.g., Prof. Rajesh Sharma', 'text', true)}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-charcoal-light)', marginBottom: 5 }}>
              Logo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              style={{ ...inputStyle, padding: '8px 12px', fontSize: 13 }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setWizardDetails({ logoUrl: reader.result as string });
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-charcoal-light)', marginBottom: 5 }}>
            Student Instructions
          </label>
          <textarea
            style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }}
            value={d.instructions}
            onChange={(e) => setWizardDetails({ instructions: e.target.value })}
            placeholder="Instructions for students..."
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
        <button className="btn-secondary" onClick={onBack}>
          <ChevronLeft size={16} /> Back
        </button>
        <button className="btn-primary" onClick={() => { if (validate()) onNext(); }}>
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Add Questions ────────────────────────────────────────────────────
function Step4({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { wizard, addTempQuestion, updateTempQuestion, deleteTempQuestion } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editQ, setEditQ] = useState<Question | null>(null);
  const [activeTab, setActiveTab] = useState<'manual' | 'bank'>('bank');

  const allQuestions = wizard.tempQuestions;
  const addedIds = new Set(allQuestions.map(q => q.id));

  // Derive exam filter for the browser
  const examMap: Record<string, string> = {
    'JEE Main': 'jee-main', 'JEE Advanced': 'jee-advanced',
    'NEET UG': 'neet', 'MHT-CET': 'mhtcet',
  };
  const examFilter = wizard.details.exam ? (examMap[wizard.details.exam] || '') : '';
  const subjectFilter = wizard.details.subjects.length === 1
    ? wizard.details.subjects[0].toLowerCase()
    : '';

  const handleSaveNew = (q: Question) => {
    addTempQuestion(q);
    setShowForm(false);
    setEditQ(null);
  };

  const handleSaveEdit = (q: Question) => {
    updateTempQuestion(q.id, q);
    setEditQ(null);
  };

  const diffBadge = (d: string) => {
    const colors = { Easy: 'var(--color-green)', Medium: '#8b6914', Hard: 'var(--color-red)' };
    return (
      <span style={{
        fontSize: 11, padding: '2px 8px', borderRadius: 20,
        background: (colors as any)[d] + '18',
        color: (colors as any)[d],
        fontWeight: 500,
      }}>{d}</span>
    );
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Add Questions</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
            {allQuestions.length} question{allQuestions.length !== 1 ? 's' : ''} added to paper
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`tab-btn ${activeTab === 'bank' ? 'active' : ''}`} onClick={() => setActiveTab('bank')}>
            <BookOpen size={14} /> Real Question Bank
          </button>
          <button className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => setActiveTab('manual')}>
            ✏️ Create Manually
          </button>
        </div>
      </div>

      {/* Added questions summary bar */}
      {allQuestions.length > 0 && (
        <div style={{ background: 'var(--color-terra-bg)', border: '1px solid var(--color-terra-light)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-terra-dark)' }}>
            {allQuestions.length} question{allQuestions.length !== 1 ? 's' : ''} added:
          </span>
          {allQuestions.slice(0, 6).map((q, idx) => (
            <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 12, border: '1px solid var(--color-border)' }}>
              <span style={{ fontWeight: 600 }}>Q{idx + 1}.</span>
              <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <MathText as="span" content={q.text?.slice(0, 50)} />
              </span>
              <button onClick={() => deleteTempQuestion(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: '0 2px', fontSize: 14, lineHeight: 1 }}>×</button>
            </div>
          ))}
          {allQuestions.length > 6 && (
            <span style={{ fontSize: 12, color: 'var(--color-terra-dark)' }}>+{allQuestions.length - 6} more</span>
          )}
        </div>
      )}

      {/* Manual Tab */}
      {activeTab === 'manual' && (
        <div>
          {!showForm && !editQ && (
            <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginBottom: 16 }}>
              <Plus size={16} /> Add New Question
            </button>
          )}
          {(showForm || editQ) && (
            <div className="card" style={{ padding: 0, marginBottom: 16 }}>
              <QuestionForm
                initial={editQ ?? undefined}
                defaultSubject={wizard.details.subjects[0]}
                onSave={editQ ? handleSaveEdit : handleSaveNew}
                onCancel={() => { setShowForm(false); setEditQ(null); }}
              />
            </div>
          )}
          {allQuestions.length === 0 && !showForm && (
            <div className="empty-state">
              <div style={{ fontSize: 36, marginBottom: 12 }}>✏️</div>
              <p style={{ fontWeight: 500, marginBottom: 6 }}>No questions added yet</p>
              <p style={{ fontSize: 13, marginBottom: 16 }}>Click "Add New Question" or use the Question Bank tab to pick from 490k+ real questions.</p>
            </div>
          )}
          {allQuestions.map((q, idx) => (
            <div key={q.id} className="question-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-muted)', marginTop: 2, minWidth: 28 }}>Q{idx + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <MathText
                    content={q.text}
                    style={{ fontSize: 13.5, color: 'var(--color-charcoal)', marginBottom: 8, lineHeight: 1.6 }}
                  />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="badge badge-terra" style={{ fontSize: 11 }}>{q.type}</span>
                    {q.subject && <span className="badge badge-neutral" style={{ fontSize: 11 }}>{q.subject}</span>}
                    {q.chapter && <span className="badge badge-neutral" style={{ fontSize: 11 }}>{q.chapter}</span>}
                    {diffBadge(q.difficulty)}
                    <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>+{q.marks} / -{q.negativeMarks}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button className="btn-ghost" style={{ padding: 6 }} onClick={() => setEditQ(q)} title="Edit"><Edit3 size={14} /></button>
                  <button className="btn-ghost" style={{ padding: 6 }} onClick={() => addTempQuestion({ ...q, id: generateId(), createdAt: new Date().toISOString() })} title="Duplicate"><Copy size={14} /></button>
                  <button className="btn-ghost" style={{ padding: 6, color: 'var(--color-red)' }} onClick={() => deleteTempQuestion(q.id)} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real Bank Tab */}
      {activeTab === 'bank' && (
        <QuestionBankBrowser
          examFilter={examFilter}
          subjectFilter={subjectFilter}
          onAdd={(q) => addTempQuestion(q)}
          addedIds={addedIds}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
        <button className="btn-secondary" onClick={onBack}><ChevronLeft size={16} /> Back</button>
        <button className="btn-primary" onClick={onNext} disabled={allQuestions.length === 0} style={{ opacity: allQuestions.length > 0 ? 1 : 0.5 }}>
          Next ({allQuestions.length} questions) <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 5: Organize ─────────────────────────────────────────────────────────
function Step5({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { wizard, addWizardSection, updateWizardSection, deleteWizardSection, setWizardSections } = useStore();
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSection, setNewSection] = useState<Omit<Section, 'id' | 'questionIds'>>({
    title: '', subject: '', questionType: '', marksPerQuestion: 4, negativeMarks: 1,
    totalQuestions: 20, isOptional: false, optionalCount: 0,
  });

  const totalMarks = calculateTotalMarks(wizard.sections);
  const totalQuestions = wizard.sections.reduce((s, sec) => s + sec.totalQuestions, 0);
  const exam = wizard.details.exam as Exam;

  const loadTemplate = () => {
    if (!exam || !EXAM_TEMPLATES[exam]) return;
    const templateSections = EXAM_TEMPLATES[exam].sections.map((s) => ({
      ...s, id: generateId(), questionIds: [],
    }));
    setWizardSections(templateSections);
  };

  const handleAddSection = () => {
    if (!newSection.title) return;
    addWizardSection({ ...newSection, id: generateId(), questionIds: [] });
    setShowAddSection(false);
    setNewSection({ title: '', subject: '', questionType: '', marksPerQuestion: 4, negativeMarks: 1, totalQuestions: 20, isOptional: false, optionalCount: 0 });
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px', border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-md)', fontSize: 13, outline: 'none', background: 'white',
    fontFamily: 'var(--font-sans)', color: 'var(--color-charcoal)',
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Organize Paper</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>Define sections, marking scheme, and paper structure.</p>
        </div>
        {exam && EXAM_TEMPLATES[exam] && (
          <button className="btn-secondary" onClick={loadTemplate} style={{ fontSize: 13 }}>
            ⚡ Load {exam} Template
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Sections', value: wizard.sections.length },
          { label: 'Total Questions', value: totalQuestions },
          { label: 'Total Marks', value: totalMarks },
        ].map((s) => (
          <div key={s.label} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '14px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-terra)' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sections */}
      {wizard.sections.length === 0 && (
        <div className="empty-state" style={{ padding: '40px' }}>
          <p style={{ fontWeight: 500, marginBottom: 8 }}>No sections added</p>
          <p style={{ fontSize: 13, marginBottom: 16 }}>Add sections to organize your paper, or load a template.</p>
        </div>
      )}

      {wizard.sections.map((sec, idx) => (
        <div key={sec.id} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <GripVertical size={16} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
            <div style={{ fontWeight: 600, fontSize: 15, flex: 1 }}>Section {idx + 1}: {sec.title}</div>
            <button className="btn-ghost" style={{ padding: 6, color: 'var(--color-red)' }} onClick={() => deleteWizardSection(sec.id)}>
              <Trash2 size={14} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Title</label>
              <input style={{ ...inputStyle, width: '100%' }} value={sec.title} onChange={(e) => updateWizardSection(sec.id, { title: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Subject</label>
              <select style={{ ...inputStyle, width: '100%' }} value={sec.subject} onChange={(e) => updateWizardSection(sec.id, { subject: e.target.value as Subject })}>
                <option value="">Any</option>
                {wizard.details.subjects.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Question Type</label>
              <select style={{ ...inputStyle, width: '100%' }} value={sec.questionType} onChange={(e) => updateWizardSection(sec.id, { questionType: e.target.value as QuestionType })}>
                <option value="">Any</option>
                {QUESTION_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>No. of Questions</label>
              <input type="number" style={{ ...inputStyle, width: '100%' }} value={sec.totalQuestions} min={1} onChange={(e) => updateWizardSection(sec.id, { totalQuestions: Number(e.target.value) })} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Marks / Question</label>
              <input type="number" style={{ ...inputStyle, width: '100%' }} value={sec.marksPerQuestion} min={1} onChange={(e) => updateWizardSection(sec.id, { marksPerQuestion: Number(e.target.value) })} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Neg. Marks</label>
              <input type="number" style={{ ...inputStyle, width: '100%' }} value={sec.negativeMarks} min={0} step={0.25} onChange={(e) => updateWizardSection(sec.id, { negativeMarks: Number(e.target.value) })} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Optional Section?</label>
              <select style={{ ...inputStyle, width: '100%' }} value={sec.isOptional ? 'yes' : 'no'} onChange={(e) => updateWizardSection(sec.id, { isOptional: e.target.value === 'yes' })}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            {sec.isOptional && (
              <div>
                <label style={{ fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Attempt Any</label>
                <input type="number" style={{ ...inputStyle, width: '100%' }} value={sec.optionalCount} min={1} max={sec.totalQuestions} onChange={(e) => updateWizardSection(sec.id, { optionalCount: Number(e.target.value) })} />
              </div>
            )}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-muted)' }}>
            Section Marks: <strong style={{ color: 'var(--color-charcoal)' }}>
              {(sec.isOptional ? sec.optionalCount : sec.totalQuestions) * sec.marksPerQuestion}
            </strong>
            {sec.isOptional && ` (attempt any ${sec.optionalCount} of ${sec.totalQuestions})`}
          </div>
        </div>
      ))}

      {/* Add Section */}
      {showAddSection ? (
        <div style={{ background: 'var(--color-cream)', border: '1.5px dashed var(--color-terra)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 10 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>New Section</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 14 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Section Title *</label>
              <input style={{ ...inputStyle, width: '100%' }} placeholder="e.g., Section A – Physics MCQs" value={newSection.title} onChange={(e) => setNewSection((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Subject</label>
              <select style={{ ...inputStyle, width: '100%' }} value={newSection.subject} onChange={(e) => setNewSection((p) => ({ ...p, subject: e.target.value as Subject }))}>
                <option value="">Any</option>
                {wizard.details.subjects.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>No. of Questions</label>
              <input type="number" style={{ ...inputStyle, width: '100%' }} value={newSection.totalQuestions} min={1} onChange={(e) => setNewSection((p) => ({ ...p, totalQuestions: Number(e.target.value) }))} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Marks / Question</label>
              <input type="number" style={{ ...inputStyle, width: '100%' }} value={newSection.marksPerQuestion} min={1} onChange={(e) => setNewSection((p) => ({ ...p, marksPerQuestion: Number(e.target.value) }))} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-muted)', display: 'block', marginBottom: 4 }}>Neg. Marks</label>
              <input type="number" style={{ ...inputStyle, width: '100%' }} value={newSection.negativeMarks} min={0} step={0.25} onChange={(e) => setNewSection((p) => ({ ...p, negativeMarks: Number(e.target.value) }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary" onClick={handleAddSection} style={{ fontSize: 13 }}>Add Section</button>
            <button className="btn-secondary" onClick={() => setShowAddSection(false)} style={{ fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button
          className="btn-secondary"
          onClick={() => setShowAddSection(true)}
          style={{ marginBottom: 10, borderStyle: 'dashed' }}
        >
          <Plus size={15} /> Add Section
        </button>
      )}

      {/* Validation Warning */}
      {wizard.tempQuestions.length > 0 && wizard.sections.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--color-terra-bg)', border: '1px solid var(--color-terra-light)', borderRadius: 'var(--radius-md)', marginTop: 12, fontSize: 13, color: 'var(--color-terra-dark)' }}>
          <AlertTriangle size={16} />
          Add at least one section to properly organize your questions. You can still proceed without sections.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button className="btn-secondary" onClick={onBack}><ChevronLeft size={16} /> Back</button>
        <button className="btn-primary" onClick={onNext}>Preview & Export <ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

// ─── Step 6: Preview & Export ─────────────────────────────────────────────────
function Step6({ onBack }: { onBack: () => void }) {
  const { saveWizardAsDraft, publishWizardPaper, setPage, updatePaper } = useStore();
  const [saved, setSaved] = useState(false);
  const [exportMode, setExportMode] = useState<'paper' | 'answerkey' | 'solutions'>('paper');

  const handleSaveDraft = async () => {
    await saveWizardAsDraft();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePublish = async () => {
    const id = await publishWizardPaper();
    await updatePaper(id, { downloadCount: 0 });
    setPage('my-papers');
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Preview & Export</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>Review your paper and export it as PDF.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={saved ? 'btn-success' : 'btn-secondary'}
            onClick={handleSaveDraft}
            style={{ fontSize: 13 }}
          >
            <Save size={15} /> {saved ? 'Saved!' : 'Save Draft'}
          </button>
          <button className="btn-primary" onClick={handlePublish} style={{ fontSize: 13 }}>
            <Check size={15} /> Publish Paper
          </button>
        </div>
      </div>

      {/* Export Mode Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([['paper', '📄 Question Paper'], ['answerkey', '🔑 Answer Key'], ['solutions', '📘 Solutions']] as const).map(([mode, label]) => (
          <button
            key={mode}
            className={`tab-btn ${exportMode === mode ? 'active' : ''}`}
            onClick={() => setExportMode(mode)}
          >
            {label}
          </button>
        ))}
      </div>

      <PaperPreview mode={exportMode} />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, flexWrap: 'wrap', gap: 10 }}>
        <button className="btn-secondary" onClick={onBack}><ChevronLeft size={16} /> Back</button>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleSaveDraft}><Save size={15} /> Save Draft</button>
          <button className="btn-primary" onClick={handlePublish}><Check size={15} /> Publish & Finish</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main CreatePaper Component ───────────────────────────────────────────────
export function CreatePaper() {
  const { wizard, setWizardStep } = useStore();
  const step = wizard.step;

  const next = () => setWizardStep(Math.min(step + 1, 6));
  const back = () => setWizardStep(Math.max(step - 1, 1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <StepIndicator current={step} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {step === 1 && <Step1 onNext={next} />}
        {step === 2 && <Step2 onNext={next} onBack={back} />}
        {step === 3 && <Step3 onNext={next} onBack={back} />}
        {step === 4 && <Step4 onNext={next} onBack={back} />}
        {step === 5 && <Step5 onNext={next} onBack={back} />}
        {step === 6 && <Step6 onBack={back} />}
      </div>
    </div>
  );
}
