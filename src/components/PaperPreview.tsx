import { useRef } from 'react';
import { Download, Printer } from 'lucide-react';
import { useStore } from '../store';
import type { Question, Section, PaperDetails } from '../types';
import { calculateTotalMarks } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MathText } from './MathText';

interface PaperPreviewProps {
  mode: 'paper' | 'answerkey' | 'solutions';
  paperId?: string; // If provided, use saved paper; otherwise use wizard
}

function OptionLabel({ id }: { id: string }) {
  return (
    <span style={{ fontWeight: 600, minWidth: 20 }}>({id.toUpperCase()})</span>
  );
}

function QuestionBlock({ q, idx, showAnswer, showExplanation }: {
  q: Question;
  idx: number;
  showAnswer: boolean;
  showExplanation: boolean;
}) {
  const hasOptions = q.options.length > 0;
  const correctIds = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];

  return (
    <div style={{ marginBottom: 18, pageBreakInside: 'avoid' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <span style={{ fontWeight: 700, minWidth: 28, flexShrink: 0 }}>{idx}.</span>
        <div style={{ flex: 1 }}>
          <MathText as="span" content={q.text} style={{ lineHeight: 1.65 }} />
          {q.marks && (
            <span style={{ fontSize: '9pt', color: '#555', marginLeft: 8, whiteSpace: 'nowrap' }}>
              [{q.marks}M{q.negativeMarks ? `, -${q.negativeMarks}` : ''}]
            </span>
          )}
        </div>
      </div>

      {hasOptions && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: q.options.length <= 4 ? '1fr 1fr' : '1fr',
          gap: '4px 24px',
          paddingLeft: 36,
          marginBottom: 6,
        }}>
          {q.options.map((opt) => {
            const isCorrect = showAnswer && correctIds.includes(opt.id);
            return (
              <div key={opt.id} style={{
                display: 'flex', gap: 6, alignItems: 'flex-start',
                padding: isCorrect ? '2px 6px' : undefined,
                background: isCorrect ? '#e8f5ee' : undefined,
                borderRadius: isCorrect ? 4 : undefined,
                border: isCorrect ? '1px solid #2d7a4f' : undefined,
              }}>
                <OptionLabel id={opt.id} />
                <MathText
                  as="span"
                  content={opt.text}
                  style={{ lineHeight: 1.5, fontWeight: isCorrect ? 600 : undefined, color: isCorrect ? '#1a5c38' : undefined }}
                />
              </div>
            );
          })}
        </div>
      )}

      {(q.type === 'Numerical' || q.type === 'Integer' || q.type === 'Short Answer') && showAnswer && (
        <div style={{ paddingLeft: 36, color: '#1a5c38', fontWeight: 600, fontSize: '10pt' }}>
          Answer: <MathText as="span" content={q.correctAnswer as string} />
        </div>
      )}

      {showExplanation && q.explanation && (
        <div style={{
          marginLeft: 36, marginTop: 6,
          padding: '8px 12px',
          background: '#fdf0ea', borderLeft: '3px solid #d4622a',
          fontSize: '10pt', lineHeight: 1.5,
        }}>
          <strong>Solution:</strong>
          <MathText content={q.explanation} style={{ marginTop: 4 }} />
        </div>
      )}
    </div>
  );
}

function PaperDocument({
  questions, sections, details, mode,
}: {
  questions: Question[];
  sections: Section[];
  details: PaperDetails;
  mode: 'paper' | 'answerkey' | 'solutions';
}) {
  const showAnswer = mode === 'answerkey' || mode === 'solutions';
  const showExplanation = mode === 'solutions';
  const totalMarks = sections.length > 0 ? calculateTotalMarks(sections) : questions.reduce((s, q) => s + q.marks, 0);

  // Group questions by section if sections exist
  const hasSections = sections.length > 0;

  return (
    <div style={{
      background: 'white',
      width: '100%',
      fontFamily: 'Times New Roman, Times, serif',
      fontSize: '11pt',
      color: '#000',
      lineHeight: 1.6,
    }}>
      {/* Header */}
      <div style={{ borderBottom: '3px double #000', paddingBottom: 10, marginBottom: 14, textAlign: 'center' }}>
        {details.logoUrl && (
          <img src={details.logoUrl} alt="logo" style={{ height: 60, marginBottom: 8 }} />
        )}
        <div style={{ fontSize: '18pt', fontWeight: 'bold', letterSpacing: '0.5px' }}>
          {details.institution || 'Institution Name'}
        </div>
        <div style={{ fontSize: '14pt', fontWeight: 'bold', marginTop: 4 }}>
          {details.title || `${details.exam} Question Paper`}
        </div>
        {mode === 'answerkey' && (
          <div style={{ fontSize: '13pt', color: '#c0392b', fontWeight: 'bold', marginTop: 4 }}>— ANSWER KEY —</div>
        )}
        {mode === 'solutions' && (
          <div style={{ fontSize: '13pt', color: '#d4622a', fontWeight: 'bold', marginTop: 4 }}>— SOLUTIONS —</div>
        )}
      </div>

      {/* Meta Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px', marginBottom: 12, fontSize: '10.5pt' }}>
        <div><strong>Examination:</strong> {details.exam || '—'}</div>
        <div><strong>Max Marks:</strong> {totalMarks || details.maxMarks}</div>
        <div><strong>Subject(s):</strong> {details.subjects.join(', ') || '—'}</div>
        <div><strong>Duration:</strong> {details.duration || '—'}</div>
        <div><strong>Class/Group:</strong> {details.targetClass || '—'}</div>
        <div><strong>Academic Year:</strong> {details.academicYear || '—'}</div>
        <div><strong>Teacher:</strong> {details.teacherName || '—'}</div>
        <div><strong>Date:</strong> ________________</div>
      </div>

      {/* Instructions */}
      {details.instructions && mode === 'paper' && (
        <div style={{ border: '1px solid #555', padding: '8px 12px', marginBottom: 14, fontSize: '10pt' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4, fontSize: '11pt' }}>General Instructions:</div>
          {details.instructions.split('\n').filter(Boolean).map((line: string, i: number) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {/* Questions */}
      {hasSections ? (
        sections.map((sec, sIdx) => {
          const sectionQs = questions.filter((q) =>
            (!sec.subject || q.subject === sec.subject) &&
            (!sec.questionType || q.type === sec.questionType)
          ).slice(0, sec.totalQuestions);
          const qStart = sections.slice(0, sIdx).reduce((s, prev) => s + prev.totalQuestions, 0) + 1;

          return (
            <div key={sec.id} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', fontSize: '12pt', borderBottom: '1.5px solid #333', paddingBottom: 4, marginBottom: 10 }}>
                {sec.title}
                <span style={{ fontSize: '10pt', fontWeight: 'normal', marginLeft: 12 }}>
                  ({sec.totalQuestions} Questions × {sec.marksPerQuestion} Marks = {sec.totalQuestions * sec.marksPerQuestion} Marks
                  {sec.negativeMarks > 0 ? ` | −${sec.negativeMarks} for wrong` : ''}
                  {sec.isOptional ? ` | Attempt any ${sec.optionalCount}` : ''})
                </span>
              </div>
              {sectionQs.length === 0 && (
                <div style={{ color: '#888', fontStyle: 'italic', paddingLeft: 20 }}>
                  No questions assigned to this section.
                </div>
              )}
              {sectionQs.map((q, qi) => (
                <QuestionBlock
                  key={q.id}
                  q={q}
                  idx={qStart + qi}
                  showAnswer={showAnswer}
                  showExplanation={showExplanation}
                />
              ))}
            </div>
          );
        })
      ) : (
        <div>
          {questions.map((q, idx) => (
            <QuestionBlock
              key={q.id}
              q={q}
              idx={idx + 1}
              showAnswer={showAnswer}
              showExplanation={showExplanation}
            />
          ))}
        </div>
      )}

      {/* Answer Key Table (for answer key mode) */}
      {mode === 'answerkey' && questions.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 'bold', fontSize: '12pt', borderBottom: '1.5px solid #333', paddingBottom: 4, marginBottom: 12 }}>
            Answer Key Summary
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6 }}>
            {questions.map((q, idx) => {
              const ans = Array.isArray(q.correctAnswer)
                ? q.correctAnswer.map(a => a.toUpperCase()).join(', ')
                : typeof q.correctAnswer === 'string' && q.options.length > 0
                  ? q.correctAnswer.toUpperCase()
                  : q.correctAnswer as string;
              return (
                <div key={q.id} style={{ display: 'flex', gap: 8, fontSize: '10pt', padding: '3px 0' }}>
                  <span style={{ fontWeight: 600, minWidth: 32 }}>Q{idx + 1}.</span>
                  <MathText as="span" content={ans} style={{ color: '#1a5c38', fontWeight: 600 }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #555', marginTop: 24, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: '#555' }}>
        <span>{details.institution}</span>
        <span>Page 1</span>
        <span>{details.exam} | {details.academicYear}</span>
      </div>
    </div>
  );
}

export function PaperPreview({ mode, paperId }: PaperPreviewProps) {
  const { wizard, papers, updatePaper } = useStore();
  const previewRef = useRef<HTMLDivElement>(null);

  // Use saved paper if paperId provided, else wizard state
  const paper = paperId ? papers.find((p) => p.id === paperId) : null;
  const questions = paper ? paper.questions : wizard.tempQuestions;
  const sections = paper ? paper.sections : wizard.sections;
  const details = paper ? paper.details : wizard.details;

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    const el = previewRef.current;
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = pdfWidth / (imgWidth / (96 / 25.4));
    const renderedHeight = (imgHeight / (96 / 25.4)) * ratio;

    const pageCount = Math.ceil(renderedHeight / pdfHeight);
    for (let i = 0; i < pageCount; i++) {
      if (i > 0) pdf.addPage();
      pdf.addImage(
        imgData,
        'PNG',
        0,
        -(i * pdfHeight),
        pdfWidth,
        renderedHeight,
        undefined,
        'FAST'
      );
    }

    const filename = `${(details.title || 'question-paper').replace(/\s+/g, '-')}-${mode}.pdf`;
    pdf.save(filename);

    // Increment download count
    if (paper) {
      updatePaper(paper.id, { downloadCount: (paper.downloadCount || 0) + 1 });
    }
  };

  const modeLabels = {
    paper: '📄 Question Paper',
    answerkey: '🔑 Answer Key',
    solutions: '📘 Solutions',
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-muted)' }}>
          {modeLabels[mode]} Preview
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => window.print()} style={{ fontSize: 13 }}>
            <Printer size={15} /> Print
          </button>
          <button className="btn-primary" onClick={handleDownloadPDF} style={{ fontSize: 13 }}>
            <Download size={15} /> Download PDF
          </button>
        </div>
      </div>

      {/* Paper Preview */}
      <div style={{ overflowX: 'auto', background: 'var(--color-cream)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <div
          ref={previewRef}
          style={{
            background: 'white',
            width: '210mm',
            minWidth: '210mm',
            padding: '18mm 16mm',
            margin: '0 auto',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          }}
        >
          {questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#888', fontFamily: 'Inter, sans-serif' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <p style={{ fontWeight: 500 }}>No questions to preview</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>Add questions in Step 4 to see the preview.</p>
            </div>
          ) : (
            <PaperDocument questions={questions} sections={sections} details={details} mode={mode} />
          )}
        </div>
      </div>
    </div>
  );
}
