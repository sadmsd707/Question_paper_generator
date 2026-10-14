import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { Question, QuestionType, Subject } from '../types';
import { QUESTION_TYPES, CHAPTERS, generateId } from '../types';
import { MathText } from './MathText';

interface QuestionFormProps {
  initial?: Partial<Question>;
  defaultSubject?: Subject | '';
  onSave: (q: Question) => void;
  onCancel: () => void;
}

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export function QuestionForm({ initial, defaultSubject, onSave, onCancel }: QuestionFormProps) {
  const [q, setQ] = useState<Question>({
    id: initial?.id ?? generateId(),
    type: initial?.type ?? 'MCQ Single',
    text: initial?.text ?? '',
    options: initial?.options ?? [
      { id: 'a', text: '' },
      { id: 'b', text: '' },
      { id: 'c', text: '' },
      { id: 'd', text: '' },
    ],
    correctAnswer: initial?.correctAnswer ?? 'a',
    marks: initial?.marks ?? 4,
    negativeMarks: initial?.negativeMarks ?? 1,
    subject: initial?.subject ?? defaultSubject ?? '',
    chapter: initial?.chapter ?? '',
    topic: initial?.topic ?? '',
    difficulty: initial?.difficulty ?? 'Medium',
    explanation: initial?.explanation ?? '',
    createdAt: initial?.createdAt ?? new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const needsOptions = ['MCQ Single', 'MCQ Multiple', 'Assertion-Reason', 'Paragraph Based'].includes(q.type);
  const isMultiAnswer = q.type === 'MCQ Multiple';

  const validate = () => {
    const e: Record<string, string> = {};
    if (!q.text.trim()) e.text = 'Question text is required.';
    if (needsOptions && q.options.some((o) => !o.text.trim())) e.options = 'All options must have text.';
    if (!q.subject) e.subject = 'Subject is required.';
    if (q.marks <= 0) e.marks = 'Marks must be positive.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(q);
  };

  const updateOption = (id: string, text: string) => {
    setQ((prev) => ({ ...prev, options: prev.options.map((o) => (o.id === id ? { ...o, text } : o)) }));
  };

  const addOption = () => {
    const nextId = String.fromCharCode(97 + q.options.length);
    setQ((prev) => ({ ...prev, options: [...prev.options, { id: nextId, text: '' }] }));
  };

  const removeOption = (id: string) => {
    setQ((prev) => ({ ...prev, options: prev.options.filter((o) => o.id !== id) }));
  };

  const toggleMultiAnswer = (id: string) => {
    const cur = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer as string];
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    setQ((prev) => ({ ...prev, correctAnswer: next }));
  };

  const chapters = q.subject && CHAPTERS[q.subject as Subject] ? CHAPTERS[q.subject as Subject] : [];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 14, outline: 'none',
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-charcoal)',
    background: 'white',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 500,
    color: 'var(--color-charcoal-light)', marginBottom: 5,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontWeight: 600, fontSize: 16 }}>{initial?.id ? 'Edit Question' : 'Add Question'}</h3>
        <button className="btn-ghost" onClick={onCancel} style={{ padding: 6 }}><X size={18} /></button>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', maxHeight: 'calc(90vh - 130px)' }}>
        {/* Row 1: Type, Subject */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Question Type *</label>
            <select
              style={inputStyle}
              value={q.type}
              onChange={(e) => setQ((p) => ({ ...p, type: e.target.value as QuestionType }))}
            >
              {QUESTION_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Subject *</label>
            <select
              style={{ ...inputStyle, borderColor: errors.subject ? 'var(--color-red)' : 'var(--color-border)' }}
              value={q.subject}
              onChange={(e) => setQ((p) => ({ ...p, subject: e.target.value as Subject, chapter: '' }))}
            >
              <option value="">Select subject</option>
              {(['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Botany', 'Zoology'] as Subject[]).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {errors.subject && <span style={{ fontSize: 11, color: 'var(--color-red)' }}>{errors.subject}</span>}
          </div>
        </div>

        {/* Row 2: Chapter, Topic, Difficulty */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Chapter</label>
            <select style={inputStyle} value={q.chapter} onChange={(e) => setQ((p) => ({ ...p, chapter: e.target.value }))}>
              <option value="">Select chapter</option>
              {chapters.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Topic</label>
            <input style={inputStyle} placeholder="Topic..." value={q.topic} onChange={(e) => setQ((p) => ({ ...p, topic: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Difficulty</label>
            <select style={inputStyle} value={q.difficulty} onChange={(e) => setQ((p) => ({ ...p, difficulty: e.target.value as typeof q.difficulty }))}>
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label style={labelStyle}>Question Statement *</label>
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: 'vertical', borderColor: errors.text ? 'var(--color-red)' : 'var(--color-border)' }}
            placeholder="Enter the full question statement here. You can include LaTeX formulas like $$\vec{A} \times \vec{B}$$ or $x^2 + y^2 = r^2$..."
            value={q.text}
            onChange={(e) => setQ((p) => ({ ...p, text: e.target.value }))}
          />
          {errors.text && <span style={{ fontSize: 11, color: 'var(--color-red)' }}>{errors.text}</span>}
          {q.text.includes('$') && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--color-cream)', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 13 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 4 }}>Live Math Preview:</div>
              <MathText content={q.text} />
            </div>
          )}
        </div>

        {/* Options */}
        {needsOptions && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={labelStyle}>Answer Options *</label>
              {errors.options && <span style={{ fontSize: 11, color: 'var(--color-red)' }}>{errors.options}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt) => {
                const isCorrect = isMultiAnswer
                  ? (Array.isArray(q.correctAnswer) ? q.correctAnswer : []).includes(opt.id)
                  : q.correctAnswer === opt.id;
                return (
                  <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => isMultiAnswer ? toggleMultiAnswer(opt.id) : setQ((p) => ({ ...p, correctAnswer: opt.id }))}
                      style={{
                        width: 28, height: 28, borderRadius: isMultiAnswer ? 6 : '50%',
                        border: `2px solid ${isCorrect ? 'var(--color-green)' : 'var(--color-border)'}`,
                        background: isCorrect ? 'var(--color-green)' : 'white',
                        color: isCorrect ? 'white' : 'var(--color-charcoal)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                      }}
                      title={`Mark (${opt.id.toUpperCase()}) as correct`}
                    >
                      {opt.id.toUpperCase()}
                    </button>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder={`Option ${opt.id.toUpperCase()}...`}
                      value={opt.text}
                      onChange={(e) => updateOption(opt.id, e.target.value)}
                    />
                    {q.options.length > 2 && (
                      <button className="btn-ghost" style={{ padding: 6, color: 'var(--color-red)' }} onClick={() => removeOption(opt.id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
              <button className="btn-ghost" onClick={addOption} style={{ fontSize: 13, alignSelf: 'flex-start', marginTop: 4 }}>
                <Plus size={14} /> Add Option
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 8 }}>
              {isMultiAnswer ? 'Click option letters to mark multiple correct answers.' : 'Click the circle to mark the correct answer.'}
            </p>
          </div>
        )}

        {/* Numerical / Integer answer */}
        {(q.type === 'Numerical' || q.type === 'Integer' || q.type === 'Short Answer') && (
          <div>
            <label style={labelStyle}>Correct Answer</label>
            <input
              style={inputStyle}
              placeholder={q.type === 'Integer' ? 'Enter integer value...' : 'Enter numerical value...'}
              value={q.correctAnswer as string}
              onChange={(e) => setQ((p) => ({ ...p, correctAnswer: e.target.value }))}
            />
          </div>
        )}

        {/* Marks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Marks for Correct Answer *</label>
            <input
              type="number"
              style={{ ...inputStyle, borderColor: errors.marks ? 'var(--color-red)' : 'var(--color-border)' }}
              value={q.marks}
              min={1}
              onChange={(e) => setQ((p) => ({ ...p, marks: Number(e.target.value) }))}
            />
            {errors.marks && <span style={{ fontSize: 11, color: 'var(--color-red)' }}>{errors.marks}</span>}
          </div>
          <div>
            <label style={labelStyle}>Negative Marks (enter as positive)</label>
            <input
              type="number"
              style={inputStyle}
              value={q.negativeMarks}
              min={0}
              onChange={(e) => setQ((p) => ({ ...p, negativeMarks: Number(e.target.value) }))}
            />
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label style={labelStyle}>Solution / Explanation (optional)</label>
          <textarea
            style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
            placeholder="Detailed explanation or solution..."
            value={q.explanation}
            onChange={(e) => setQ((p) => ({ ...p, explanation: e.target.value }))}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={handleSave}>
          {initial?.id ? 'Save Changes' : 'Add Question'}
        </button>
      </div>
    </div>
  );
}
