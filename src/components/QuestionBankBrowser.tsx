import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Check, BookOpen, ChevronLeft, ChevronRight, Loader, Eye, EyeOff, X } from 'lucide-react';
import { api, apiQuestionToAppQuestion } from '../api';
import type { ApiQuestion, ChapterInfo, TopicInfo } from '../api';
import type { Question } from '../types';
import { MathText } from './MathText';

interface Props {
  /** Exam filter pre-set (e.g. 'jee-main') – locked from outside, cannot be changed */
  examFilter?: string;
  /** Subject filter pre-set (e.g. 'physics') – locked from outside */
  subjectFilter?: string;
  /** Called when teacher clicks Add for a question */
  onAdd: (q: Question) => void;
  /** IDs already added */
  addedIds: Set<string>;
}

const EXAM_OPTIONS = [
  { value: '', label: 'All Exams' },
  { value: 'jee-main', label: 'JEE Main' },
  { value: 'jee-advanced', label: 'JEE Advanced' },
  { value: 'neet', label: 'NEET UG' },
  { value: 'mhtcet', label: 'MHT-CET' },
];

const SUBJECT_MAP: Record<string, string[]> = {
  '': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  'jee-main': ['Physics', 'Chemistry', 'Mathematics'],
  'jee-advanced': ['Physics', 'Chemistry', 'Mathematics'],
  'neet': ['Physics', 'Chemistry', 'Biology'],
  'mhtcet': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
};

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'mcq', label: 'MCQ Single' },
  { value: 'mcqm', label: 'MCQ Multiple' },
  { value: 'integer', label: 'Integer' },
  { value: 'numerical', label: 'Numerical' },
];

const DIFF_OPTIONS = [
  { value: '', label: 'All Levels' },
  { value: 'easy', label: '🟢 Easy' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'hard', label: '🔴 Hard' },
];

const PAGE_SIZE = 40;

function diffColor(d: string) {
  if (d === 'easy') return 'var(--color-green)';
  if (d === 'medium') return '#8b6914';
  return 'var(--color-red)';
}

function QuestionCard({ q, added, onAdd, showAnswer }: {
  q: ApiQuestion; added: boolean; onAdd: () => void; showAnswer: boolean;
}) {
  const opts = [
    { id: 'A', text: q.option_a },
    { id: 'B', text: q.option_b },
    { id: 'C', text: q.option_c },
    { id: 'D', text: q.option_d },
  ].filter(o => o.text);

  const diff = (q.difficulty || 'medium').toLowerCase();

  return (
    <div className={`question-card ${added ? 'selected-q' : ''}`} style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Tags row */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
            {q.is_pyq === 1 && (
              <span style={{ fontSize: 10, padding: '2px 7px', background: '#fff3cd', color: '#7d5a00', borderRadius: 20, fontWeight: 700, border: '1px solid #f0c040' }}>
                ⭐ PYQ {q.year}
              </span>
            )}
            <span className="badge badge-terra" style={{ fontSize: 11 }}>{q.type?.toUpperCase()}</span>
            <span className="badge badge-neutral" style={{ fontSize: 11 }}>{q.subject}</span>
            {q.chapter && <span className="badge badge-neutral" style={{ fontSize: 11 }}>{q.chapter}</span>}
            {q.topic && q.topic !== q.chapter && q.topic.length < 60 && (
              <span className="badge badge-neutral" style={{ fontSize: 11, color: 'var(--color-charcoal-light)' }}>
                {q.topic}
              </span>
            )}
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: diffColor(diff) + '18', color: diffColor(diff), fontWeight: 600 }}>
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </span>
            {q.paper_title && (
              <span style={{ fontSize: 10, color: 'var(--color-muted)', marginLeft: 2 }}>{q.paper_title}</span>
            )}
          </div>

          {/* Question text */}
          <MathText
            content={q.question_text}
            style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--color-charcoal)', marginBottom: opts.length > 0 ? 10 : 0 }}
          />

          {/* Options */}
          {opts.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 20px', fontSize: 13, marginLeft: 4, marginBottom: 4 }}>
              {opts.map(opt => {
                const isCorrect = showAnswer && q.correct_answer?.toUpperCase() === opt.id;
                return (
                  <div key={opt.id} style={{
                    display: 'flex', gap: 6, padding: isCorrect ? '3px 8px' : undefined,
                    background: isCorrect ? 'var(--color-green-light)' : undefined,
                    borderRadius: isCorrect ? 6 : undefined,
                    color: isCorrect ? 'var(--color-green)' : 'var(--color-charcoal-light)',
                    fontWeight: isCorrect ? 700 : undefined,
                    border: isCorrect ? '1px solid var(--color-green)' : undefined,
                  }}>
                    <span style={{ fontWeight: 600, flexShrink: 0 }}>({opt.id})</span>
                    <MathText as="span" content={opt.text} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Integer/Numerical answer */}
          {(q.type === 'integer' || q.type === 'numerical') && showAnswer && q.correct_answer && (
            <div style={{ fontSize: 13, color: 'var(--color-green)', fontWeight: 700, marginTop: 4 }}>
              ✓ Answer: <MathText as="span" content={q.correct_answer} />
            </div>
          )}

          {/* Explanation snippet */}
          {showAnswer && q.explanation && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-muted)', fontStyle: 'italic', borderTop: '1px solid var(--color-border)', paddingTop: 6 }}>
              <MathText content={'💡 ' + q.explanation} />
            </div>
          )}
        </div>

        {/* Add button */}
        <button
          className={added ? 'btn-success' : 'btn-secondary'}
          style={{ fontSize: 12, padding: '7px 14px', flexShrink: 0 }}
          onClick={onAdd}
          disabled={added}
        >
          {added ? <><Check size={13} /> Added</> : <><Plus size={13} /> Add</>}
        </button>
      </div>
    </div>
  );
}

// Pill-style active filter tag
function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'var(--color-terra-bg)', color: 'var(--color-terra-dark)',
      border: '1px solid var(--color-terra-light)',
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
    }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-terra)', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
    </span>
  );
}

export function QuestionBankBrowser({ examFilter, subjectFilter, onAdd, addedIds }: Props) {
  // Initialise from props so wizard pre-selects the exam/subject chosen in earlier steps
  const [exam, setExam] = useState(examFilter || '');
  const [subject, setSubject] = useState(subjectFilter || '');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [type, setType] = useState('');
  const [source, setSource] = useState<'' | 'pyq' | 'practice'>(''); // '' = all, 'pyq' = PYQs only, 'practice' = practice only
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [serverReady, setServerReady] = useState<boolean | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Server check ──────────────────────────────────────────────────────────
  useEffect(() => {
    api.status()
      .then(s => setServerReady(s.ready))
      .catch(() => setServerReady(false));
  }, []);

  // ── Debounce search ───────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  // ── Load chapters when exam+subject changes ───────────────────────────────
  useEffect(() => {
    setChapter('');
    setTopic('');
    setTopics([]);
    if (!exam && !subject) { setChapters([]); return; }
    api.chapters(exam, subject).then(setChapters).catch(() => setChapters([]));
  }, [exam, subject]);

  // ── Load topics when chapter changes ─────────────────────────────────────
  useEffect(() => {
    setTopic('');
    setTopics([]);
    if (!chapter) return;
    api.topics(exam, subject, chapter).then(setTopics).catch(() => setTopics([]));
  }, [exam, subject, chapter]);

  // ── Fetch questions ───────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    if (serverReady === false) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.questions({
        exam, subject, chapter, topic, difficulty, type,
        search: debouncedSearch,
        source,
        page, limit: PAGE_SIZE,
      });
      setQuestions(res.questions);
      setTotal(res.total);
    } catch {
      setError('Could not connect to the PaperGen server. Make sure it is running (npm run server).');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [exam, subject, chapter, topic, difficulty, type, debouncedSearch, source, page, serverReady]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);
  useEffect(() => { setPage(1); }, [exam, subject, chapter, topic, difficulty, type, debouncedSearch, source]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const subjectsForExam = SUBJECT_MAP[exam] || SUBJECT_MAP[''];

  const sel: React.CSSProperties = {
    padding: '8px 10px', border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-md)', fontSize: 13, outline: 'none',
    background: 'white', color: 'var(--color-charcoal)',
    fontFamily: 'var(--font-sans)', cursor: 'pointer',
    transition: 'border-color 0.15s',
  };

  // ── Server error UI ───────────────────────────────────────────────────────
  if (serverReady === false) {
    return (
      <div style={{ padding: 24, background: 'var(--color-red-light)', border: '1px solid var(--color-red)', borderRadius: 'var(--radius-lg)', margin: '16px 0' }}>
        <div style={{ fontWeight: 600, color: 'var(--color-red)', marginBottom: 8, fontSize: 15 }}>⚠️ Backend Server Not Running</div>
        <p style={{ fontSize: 13, color: 'var(--color-red)', marginBottom: 12 }}>
          The question bank requires the local API server. Open a <strong>new terminal</strong> in the project folder and run:
        </p>
        <code style={{ display: 'block', background: '#1e1e1e', color: '#d4f0b0', padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
          npm run server
        </code>
        <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 12 }}>
          First run builds a database from 490k questions (~1 min). After that it loads in under 2 seconds.
        </p>
        <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => {
          setServerReady(null);
          api.status().then(s => setServerReady(s.ready)).catch(() => setServerReady(false));
        }}>
          🔄 Retry Connection
        </button>
      </div>
    );
  }

  const activeFilters = [
    exam && !examFilter && { label: EXAM_OPTIONS.find(o => o.value === exam)?.label || exam, clear: () => { setExam(''); } },
    subject && !subjectFilter && { label: subject.charAt(0).toUpperCase() + subject.slice(1), clear: () => setSubject('') },
    chapter && { label: `📚 ${chapter}`, clear: () => { setChapter(''); setTopic(''); } },
    topic && { label: `🏷 ${topic}`, clear: () => setTopic('') },
    difficulty && { label: DIFF_OPTIONS.find(o => o.value === difficulty)?.label?.replace(/^[🟢🟡🔴]\s/, '') || difficulty, clear: () => setDifficulty('') },
    type && { label: TYPE_OPTIONS.find(o => o.value === type)?.label || type, clear: () => setType('') },
    source === 'pyq' && { label: '⭐ PYQs Only', clear: () => setSource('') },
    source === 'practice' && { label: '📝 Practice Only', clear: () => setSource('') },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div>
      {/* ── Filter Row 1: Exam + Subject + Chapter + Topic ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>

        {/* Exam — locked if passed from wizard */}
        {examFilter ? (
          <div style={{ ...sel, background: 'var(--color-terra-bg)', color: 'var(--color-terra-dark)', border: '1.5px solid var(--color-terra-light)', fontWeight: 600 }}>
            {EXAM_OPTIONS.find(o => o.value === examFilter)?.label || examFilter}
          </div>
        ) : (
          <select style={sel} value={exam} onChange={e => setExam(e.target.value)}>
            {EXAM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}

        {/* Subject — locked if passed from wizard */}
        {subjectFilter ? (
          <div style={{ ...sel, background: 'var(--color-terra-bg)', color: 'var(--color-terra-dark)', border: '1.5px solid var(--color-terra-light)', fontWeight: 600 }}>
            {subjectFilter.charAt(0).toUpperCase() + subjectFilter.slice(1)}
          </div>
        ) : (
          <select style={sel} value={subject} onChange={e => setSubject(e.target.value)}>
            <option value="">All Subjects</option>
            {subjectsForExam.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
          </select>
        )}

        {/* Chapter */}
        <select
          style={{ ...sel, minWidth: 160, maxWidth: 220, borderColor: chapter ? 'var(--color-terra)' : undefined }}
          value={chapter}
          onChange={e => setChapter(e.target.value)}
          disabled={chapters.length === 0}
        >
          <option value="">{chapters.length === 0 ? 'Select exam first' : `All Chapters (${chapters.length})`}</option>
          {chapters.map(c => (
            <option key={c.chapter} value={c.chapter}>{c.chapter} ({c.count.toLocaleString()})</option>
          ))}
        </select>

        {/* Topic — only shows when a chapter is selected */}
        {chapter && (
          <select
            style={{ ...sel, minWidth: 160, maxWidth: 240, borderColor: topic ? 'var(--color-terra)' : undefined }}
            value={topic}
            onChange={e => setTopic(e.target.value)}
            disabled={topics.length === 0}
          >
            <option value="">{topics.length === 0 ? 'Loading topics…' : `All Topics (${topics.length})`}</option>
            {topics.map(t => (
              <option key={t.topic} value={t.topic}>{t.topic} ({t.count.toLocaleString()})</option>
            ))}
          </select>
        )}
      </div>

      {/* ── Filter Row 2: Difficulty + Type + PYQ + Search ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <select style={sel} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          {DIFF_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select style={sel} value={type} onChange={e => setType(e.target.value)}>
          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Source toggle: All / PYQs / Practice */}
        <div style={{ display: 'flex', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
          {([['', 'All'], ['pyq', '⭐ PYQs'], ['practice', '📝 Practice']] as const).map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setSource(val)}
              style={{
                padding: '7px 13px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                background: source === val ? 'var(--color-terra)' : 'white',
                color: source === val ? 'white' : 'var(--color-charcoal-light)',
                borderRight: val !== 'practice' ? '1px solid var(--color-border)' : 'none',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 180px' }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
          <input
            style={{ ...sel, width: '100%', paddingLeft: 28, paddingRight: search ? 28 : undefined }}
            placeholder="Search question text..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', lineHeight: 1, fontSize: 16 }}>×</button>
          )}
        </div>

        {/* Show/Hide answers */}
        <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 10px', whiteSpace: 'nowrap' }}
          onClick={() => setShowAnswers(!showAnswers)}>
          {showAnswers ? <EyeOff size={14} /> : <Eye size={14} />}
          {showAnswers ? 'Hide Ans' : 'Show Ans'}
        </button>

        {/* Clear all */}
        {activeFilters.length > 0 && (
          <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 10px', color: 'var(--color-red)', whiteSpace: 'nowrap' }}
            onClick={() => { setChapter(''); setTopic(''); setDifficulty(''); setType(''); setSearch(''); setSource(''); if (!examFilter) setExam(''); if (!subjectFilter) setSubject(''); }}>
            <X size={13} /> Clear All
          </button>
        )}
      </div>

      {/* ── Active filter tags ── */}
      {activeFilters.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {activeFilters.map(f => <FilterTag key={f.label} label={f.label} onRemove={f.clear} />)}
        </div>
      )}

      {/* ── Result count ── */}
      <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, minHeight: 24 }}>
        {loading ? (
          <><Loader size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Searching 489,558 questions…</>
        ) : (
          <><BookOpen size={13} /><strong style={{ color: 'var(--color-charcoal)' }}>{total.toLocaleString()}</strong> questions match your filters</>
        )}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--color-red-light)', color: 'var(--color-red)', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && questions.length === 0 && !error && (
        <div className="empty-state" style={{ padding: '40px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p style={{ fontWeight: 500 }}>No questions match your filters</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Try a different chapter, topic, or remove some filters.</p>
        </div>
      )}

      {/* ── Question list ── */}
      {questions.map(q => (
        <QuestionCard
          key={q.id}
          q={q}
          added={addedIds.has(q.id)}
          showAnswer={showAnswers}
          onAdd={() => !addedIds.has(q.id) && onAdd(apiQuestionToAppQuestion(q))}
        />
      ))}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            Page <strong style={{ color: 'var(--color-charcoal)' }}>{page}</strong> / <strong style={{ color: 'var(--color-charcoal)' }}>{totalPages.toLocaleString()}</strong>
          </span>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight size={14} />
          </button>
          <input
            type="number" min={1} max={totalPages} value={page}
            onChange={e => setPage(Math.max(1, Math.min(totalPages, Number(e.target.value))))}
            style={{ width: 62, padding: '6px 8px', border: '1.5px solid var(--color-border)', borderRadius: 8, fontSize: 13, textAlign: 'center', outline: 'none' }}
          />
          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>({total.toLocaleString()} total)</span>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
