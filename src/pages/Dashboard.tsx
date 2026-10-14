import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  FilePlus, FileText, Download, Clock,
  ChevronRight, Zap, CheckCircle, AlertCircle, Search, Copy, Trash2, Edit3, Eye
} from 'lucide-react';
import { useStore } from '../store';
import { formatDate, EXAM_COLORS } from '../types';
import type { QuestionPaper } from '../types';
import { api } from '../api';

function StatCard({ icon, label, value, color }: { icon: ReactNode; label: string; value: number | string; color: string }) {
  return (
    <div className="stat-card">
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--radius-md)',
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-charcoal)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

function PaperCard({ paper, onEdit, onDuplicate, onDelete, onPreview }: {
  paper: QuestionPaper;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  const examColor = paper.details.exam ? EXAM_COLORS[paper.details.exam] : '#7a7a7a';
  return (
    <div className="card fade-in" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: examColor + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: examColor, fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>
          {paper.details.exam?.split(' ').map(w => w[0]).join('') || 'QP'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-charcoal)', lineHeight: 1.3, marginBottom: 4 }}>
            {paper.details.title || 'Untitled Paper'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {paper.details.exam && (
              <span className="badge badge-terra" style={{ fontSize: 11 }}>{paper.details.exam}</span>
            )}
            <span className={`badge ${paper.status === 'published' ? 'badge-green' : 'badge-neutral'}`} style={{ fontSize: 11 }}>
              {paper.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <FileText size={12} /> {paper.questions.length} Questions
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} /> {formatDate(paper.updatedAt)}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Download size={12} /> {paper.downloadCount}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
        <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 10px' }} onClick={onPreview}>
          <Eye size={14} /> Preview
        </button>
        <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 10px' }} onClick={onEdit}>
          <Edit3 size={14} /> Edit
        </button>
        <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 10px' }} onClick={onDuplicate}>
          <Copy size={14} /> Copy
        </button>
        <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 10px', color: 'var(--color-red)', marginLeft: 'auto' }} onClick={onDelete}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

const TEMPLATE_CARDS = [
  { exam: 'JEE Main', desc: '90 Questions • 3 hrs • 300 Marks', color: '#d4622a' },
  { exam: 'JEE Advanced', desc: '54 Questions • 3 hrs • 180 Marks', color: '#8b4513' },
  { exam: 'NEET UG', desc: '180 Questions • 3:20 hrs • 720 Marks', color: '#2d7a4f' },
  { exam: 'MHT-CET', desc: '150 Questions • 3 hrs • 200 Marks', color: '#8b6914' },
];

export function Dashboard() {
  const { papers, teacher, setPage, duplicatePaper, deletePaper, resetWizard, loadPaperIntoWizard } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [totalQuestions, setTotalQuestions] = useState<number>(489558);

  useEffect(() => {
    api.stats()
      .then((s) => {
        if (s.totalQuestions || s.total) {
          setTotalQuestions(s.totalQuestions || s.total);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = papers.filter((p) => {
    const matchSearch = !search || p.details.title.toLowerCase().includes(search.toLowerCase()) || (p.details.exam || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const totalPublished = papers.filter((p) => p.status === 'published').length;
  const totalDrafts = papers.filter((p) => p.status === 'draft').length;
  const totalDownloads = papers.reduce((a, p) => a + (p.downloadCount || 0), 0);

  const handleCreate = () => {
    resetWizard();
    setPage('create');
  };

  const displayName = teacher.name && teacher.name !== 'Teacher' ? teacher.name : 'Educator';

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Welcome */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-charcoal)', marginBottom: 6 }}>
            Welcome, {displayName} 👋
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
            {teacher.institution ? `${teacher.institution} • ` : ''}
            {totalQuestions.toLocaleString()} Real Questions Available Online • Cloud Storage Active
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreate} style={{ fontSize: 15, padding: '12px 24px' }}>
          <FilePlus size={18} />
          Create Question Paper
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon={<FileText size={20} />} label="Online Question Bank" value={totalQuestions.toLocaleString()} color="var(--color-terra)" />
        <StatCard icon={<FilePlus size={20} />} label="My Question Papers" value={papers.length} color="#b5511f" />
        <StatCard icon={<CheckCircle size={20} />} label="Published Papers" value={totalPublished} color="var(--color-green)" />
        <StatCard icon={<AlertCircle size={20} />} label="Draft Papers" value={totalDrafts} color="#8b6914" />
        <StatCard icon={<Download size={20} />} label="Total Downloads" value={totalDownloads} color="var(--color-charcoal)" />
      </div>

      {/* Quick Templates */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Quick Templates</h3>
          <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setPage('templates')}>
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {TEMPLATE_CARDS.map((t) => (
            <button
              key={t.exam}
              onClick={() => { resetWizard(); setPage('create'); }}
              style={{
                background: 'white',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 18px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = t.color;
                e.currentTarget.style.boxShadow = `0 4px 16px ${t.color}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: t.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: t.color, fontWeight: 700, fontSize: 13, flexShrink: 0,
              }}>
                {t.exam.split(' ').map(w => w[0]).join('')}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-charcoal)', marginBottom: 3 }}>{t.exam}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{t.desc}</div>
              </div>
              <Zap size={16} style={{ marginLeft: 'auto', color: t.color }} />
            </button>
          ))}
        </div>
      </div>

      {/* My Papers */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Recent Papers</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 32, width: 200, height: 36 }}
                placeholder="Search papers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Filters */}
            {(['all', 'published', 'draft'] as const).map((f) => (
              <button
                key={f}
                className={`tab-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
                style={{ padding: '6px 14px', fontSize: 13 }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setPage('my-papers')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ width: 56, height: 56, background: 'var(--color-beige)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <FileText size={24} style={{ color: 'var(--color-beige-dark)' }} />
            </div>
            <p style={{ fontWeight: 500, marginBottom: 8 }}>No question papers yet</p>
            <p style={{ fontSize: 13, marginBottom: 20 }}>Create your first question paper to get started.</p>
            <button className="btn-primary" onClick={handleCreate}>
              <FilePlus size={16} /> Create Paper
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.slice(0, 6).map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                onEdit={() => loadPaperIntoWizard(paper.id)}
                onDuplicate={() => duplicatePaper(paper.id)}
                onDelete={() => { if (confirm('Delete this paper?')) deletePaper(paper.id); }}
                onPreview={() => { loadPaperIntoWizard(paper.id); }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
