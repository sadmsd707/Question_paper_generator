import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Copy, BookOpen } from 'lucide-react';
import { useStore } from '../store';
import type { Question } from '../types';
import { generateId } from '../types';
import { QuestionForm } from '../components/QuestionForm';
import { QuestionBankBrowser } from '../components/QuestionBankBrowser';
import { MathText } from '../components/MathText';
import { api } from '../api';

type View = 'browse' | 'my-saved' | 'add';

export function QuestionBank() {
  const { questionBank, addToBank, updateBankQuestion, deleteBankQuestion } = useStore();
  const [view, setView] = useState<View>('browse');
  const [editQ, setEditQ] = useState<Question | null>(null);
  const [stats, setStats] = useState<{ total: number; byExam: any[]; bySubject: any[] } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const addedIds = new Set(questionBank.map(q => q.id));

  useEffect(() => {
    api.stats()
      .then(s => { setStats(s); setLoadingStats(false); })
      .catch(() => setLoadingStats(false));
  }, []);

  const handleSaveNew = (q: Question) => {
    addToBank(q);
    setView('my-saved');
  };

  const handleSaveEdit = (q: Question) => {
    updateBankQuestion(q.id, q);
    setEditQ(null);
    setView('my-saved');
  };

  const handleDuplicate = (q: Question) => {
    addToBank({ ...q, id: generateId(), createdAt: new Date().toISOString() });
  };

  const diffColor = (d: string) => {
    if (d === 'Easy') return 'var(--color-green)';
    if (d === 'Medium') return '#8b6914';
    return 'var(--color-red)';
  };

  if (editQ) {
    return (
      <div style={{ padding: '20px 32px', maxWidth: 800, margin: '0 auto' }}>
        <button className="btn-ghost" onClick={() => setEditQ(null)} style={{ marginBottom: 16 }}>← Back</button>
        <div className="card" style={{ padding: 0 }}>
          <QuestionForm initial={editQ} onSave={handleSaveEdit} onCancel={() => setEditQ(null)} />
        </div>
      </div>
    );
  }

  if (view === 'add') {
    return (
      <div style={{ padding: '20px 32px', maxWidth: 800, margin: '0 auto' }}>
        <button className="btn-ghost" onClick={() => setView('browse')} style={{ marginBottom: 16 }}>← Back to Bank</button>
        <div className="card" style={{ padding: 0 }}>
          <QuestionForm onSave={handleSaveNew} onCancel={() => setView('browse')} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Question Bank</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
            {loadingStats ? 'Loading stats...' : stats ? `${stats.total.toLocaleString()} real questions from JEE, NEET & MHT-CET datasets` : 'Browse and add real questions to your papers'}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setView('add')} style={{ fontSize: 13 }}>
          <Plus size={15} /> Add Custom Question
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Questions', value: stats.total, color: 'var(--color-terra)' },
            ...stats.byExam.map(e => ({
              label: e.exam === 'jee-main' ? 'JEE Main' : e.exam === 'jee-advanced' ? 'JEE Advanced' : e.exam === 'neet' ? 'NEET UG' : 'MHT-CET',
              value: e.count,
              color: e.exam === 'jee-main' ? '#d4622a' : e.exam === 'jee-advanced' ? '#8b4513' : e.exam === 'neet' ? 'var(--color-green)' : '#8b6914',
            }))
          ].map(s => (
            <div key={s.label} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{Number(s.value).toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--color-cream)', padding: 4, borderRadius: 'var(--radius-md)', width: 'fit-content', marginBottom: 20 }}>
        {([['browse', '📚 Browse All Questions'], ['my-saved', `⭐ My Saved (${questionBank.length})`]] as const).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: view === v ? 'white' : 'transparent',
              color: view === v ? 'var(--color-charcoal)' : 'var(--color-muted)',
              fontWeight: view === v ? 600 : 500,
              fontSize: 14, cursor: 'pointer',
              boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Browse Tab */}
      {view === 'browse' && (
        <QuestionBankBrowser
          onAdd={(q) => addToBank(q)}
          addedIds={addedIds}
        />
      )}

      {/* My Saved Tab */}
      {view === 'my-saved' && (
        <div>
          {questionBank.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40, marginBottom: 14 }}>⭐</div>
              <p style={{ fontWeight: 500, marginBottom: 8 }}>No saved questions yet</p>
              <p style={{ fontSize: 13, marginBottom: 20 }}>Browse the question bank and add questions, or create custom ones.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-primary" onClick={() => setView('browse')}><BookOpen size={15} /> Browse Questions</button>
                <button className="btn-secondary" onClick={() => setView('add')}><Plus size={15} /> Add Custom</button>
              </div>
            </div>
          ) : (
            questionBank.map((q, idx) => (
              <div key={q.id} className="question-card">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-muted)', fontSize: 13, minWidth: 24, marginTop: 2 }}>#{idx + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span className="badge badge-terra" style={{ fontSize: 11 }}>{q.type}</span>
                      {q.subject && <span className="badge badge-neutral" style={{ fontSize: 11 }}>{q.subject}</span>}
                      {q.chapter && <span className="badge badge-neutral" style={{ fontSize: 11 }}>{q.chapter}</span>}
                      {q.topic && <span className="badge badge-neutral" style={{ fontSize: 11 }}>{q.topic}</span>}
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: diffColor(q.difficulty) + '18', color: diffColor(q.difficulty), fontWeight: 500 }}>
                        {q.difficulty}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>+{q.marks} / -{q.negativeMarks}</span>
                    </div>
                    <MathText
                      content={q.text}
                      style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--color-charcoal)', marginBottom: q.options.length > 0 ? 10 : 0 }}
                    />
                    {q.options.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 13, color: 'var(--color-charcoal-light)' }}>
                        {q.options.map(opt => {
                          const isCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(opt.id) : q.correctAnswer === opt.id;
                          return (
                            <div key={opt.id} style={{ display: 'flex', gap: 6, color: isCorrect ? 'var(--color-green)' : undefined, fontWeight: isCorrect ? 600 : undefined }}>
                              <span>({opt.id.toUpperCase()})</span>
                              <MathText as="span" content={opt.text} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button className="btn-ghost" style={{ padding: 6 }} onClick={() => setEditQ(q)} title="Edit"><Edit3 size={14} /></button>
                    <button className="btn-ghost" style={{ padding: 6 }} onClick={() => handleDuplicate(q)} title="Duplicate"><Copy size={14} /></button>
                    <button className="btn-ghost" style={{ padding: 6, color: 'var(--color-red)' }} onClick={() => {
                      if (confirm('Remove from saved?')) deleteBankQuestion(q.id);
                    }} title="Remove"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
