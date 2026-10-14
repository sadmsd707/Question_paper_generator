import { useState } from 'react';
import { Search, Copy, Trash2, Edit3, Eye, FilePlus } from 'lucide-react';
import { useStore } from '../store';
import { formatDate, EXAM_COLORS } from '../types';
import type { QuestionPaper } from '../types';
import { PaperPreview } from '../components/PaperPreview';

function PaperRow({ paper, onEdit, onDuplicate, onDelete, onPreview }: {
  paper: QuestionPaper;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  const examColor = paper.details.exam ? EXAM_COLORS[paper.details.exam] : '#7a7a7a';
  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.12s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-cream)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
    >
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: examColor + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: examColor, fontWeight: 700, fontSize: 12, flexShrink: 0,
          }}>
            {paper.details.exam?.split(' ').map(w => w[0]).join('') || 'QP'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{paper.details.title || 'Untitled'}</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{paper.details.institution}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '14px 16px', fontSize: 13 }}>
        {paper.details.exam ? (
          <span className="badge badge-terra">{paper.details.exam}</span>
        ) : '—'}
      </td>
      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-charcoal-light)' }}>
        {paper.details.subjects.join(', ') || '—'}
      </td>
      <td style={{ padding: '14px 16px', fontSize: 13 }}>{paper.questions.length}</td>
      <td style={{ padding: '14px 16px', fontSize: 13 }}>
        <span className={`badge ${paper.status === 'published' ? 'badge-green' : 'badge-neutral'}`}>
          {paper.status === 'published' ? 'Published' : 'Draft'}
        </span>
      </td>
      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--color-muted)' }}>{formatDate(paper.updatedAt)}</td>
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn-ghost" style={{ padding: 6 }} onClick={onPreview} title="Preview"><Eye size={14} /></button>
          <button className="btn-ghost" style={{ padding: 6 }} onClick={onEdit} title="Edit"><Edit3 size={14} /></button>
          <button className="btn-ghost" style={{ padding: 6 }} onClick={onDuplicate} title="Duplicate"><Copy size={14} /></button>
          <button className="btn-ghost" style={{ padding: 6, color: 'var(--color-red)' }} onClick={onDelete} title="Delete"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

export function MyPapers() {
  const { papers, deletePaper, duplicatePaper, loadPaperIntoWizard } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [examFilter, setExamFilter] = useState('all');
  const [previewPaperId, setPreviewPaperId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'paper' | 'answerkey' | 'solutions'>('paper');

  const filtered = papers.filter((p) => {
    const matchSearch = !search || p.details.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchExam = examFilter === 'all' || p.details.exam === examFilter;
    return matchSearch && matchStatus && matchExam;
  });

  const exams = Array.from(new Set(papers.map((p) => p.details.exam).filter(Boolean)));

  if (previewPaperId) {
    const paper = papers.find((p) => p.id === previewPaperId);
    return (
      <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="btn-secondary" onClick={() => setPreviewPaperId(null)} style={{ fontSize: 13 }}>← Back</button>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{paper?.details.title}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['paper', 'answerkey', 'solutions'] as const).map((m) => (
            <button key={m} className={`tab-btn ${previewMode === m ? 'active' : ''}`} onClick={() => setPreviewMode(m)}>
              {m === 'paper' ? '📄 Paper' : m === 'answerkey' ? '🔑 Answer Key' : '📘 Solutions'}
            </button>
          ))}
        </div>
        <PaperPreview mode={previewMode} paperId={previewPaperId} />
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>My Question Papers</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
            ☁️ Stored online on cloud server • {papers.length} paper{papers.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            useStore.getState().resetWizard();
            useStore.getState().setPage('create');
          }}
          style={{ fontSize: 14, padding: '10px 20px' }}
        >
          <FilePlus size={16} /> Create Paper
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32, width: 240 }}
            placeholder="Search papers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-input" style={{ width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select className="form-input" style={{ width: 160 }} value={examFilter} onChange={(e) => setExamFilter(e.target.value)}>
          <option value="all">All Exams</option>
          {exams.map((e) => <option key={e as string} value={e as string}>{e}</option>)}
        </select>
        <span style={{ fontSize: 13, color: 'var(--color-muted)', marginLeft: 'auto' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
          <p style={{ fontWeight: 500, marginBottom: 8 }}>
            {papers.length === 0 ? 'No question papers created yet' : 'No papers match your filters'}
          </p>
          <p style={{ fontSize: 13, marginBottom: 16 }}>
            {papers.length === 0
              ? 'Build and download question papers online from 489,500+ JEE, NEET, and MHT-CET questions.'
              : 'Try clearing your filters or search terms.'}
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              useStore.getState().resetWizard();
              useStore.getState().setPage('create');
            }}
          >
            <FilePlus size={16} /> Create Question Paper
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-cream)', borderBottom: '1px solid var(--color-border)' }}>
                  {['Paper', 'Exam', 'Subjects', 'Questions', 'Status', 'Updated', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((paper) => (
                  <PaperRow
                    key={paper.id}
                    paper={paper}
                    onEdit={() => loadPaperIntoWizard(paper.id)}
                    onDuplicate={() => duplicatePaper(paper.id)}
                    onDelete={() => { if (confirm('Delete this paper?')) deletePaper(paper.id); }}
                    onPreview={() => setPreviewPaperId(paper.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
