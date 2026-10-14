import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * Sanitizes and normalizes LaTeX string before KaTeX processing.
 * Fixes common artifacts found in Indian entrance exam question banks (ExamGoal, MathType, etc.)
 */
function cleanLatex(tex: string): string {
  if (!tex) return '';
  let s = tex.trim();

  // Unescape HTML entities that might be trapped inside the LaTeX code
  s = s.replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>')
       .replace(/&amp;/g, '&')
       .replace(/&quot;/g, '"')
       .replace(/&#39;/g, "'");

  // Fix MathType vector artifacts: \mathop {{A_1}}\limits^ \to -> \vec{A_1} or \overrightarrow{A_1}
  s = s.replace(/\\mathop\s*\{+([^}]+)\}+\s*\\limits\^\s*\\to/g, '\\vec{$1}');
  s = s.replace(/\\mathop\s*\{+([^}]+)\}+\s*\\limits\^\{\s*\\to\s*\}/g, '\\vec{$1}');
  s = s.replace(/\\mathop\s*\{+([^}]+)\}+\s*\\limits\s*\^\s*\\to/g, '\\vec{$1}');

  // Convert legacy Plain TeX \matrix{...} to LaTeX \begin{matrix}...\end{matrix}
  if (s.includes('\\matrix{') && !s.includes('\\begin{matrix}')) {
    s = s.replace(/\\matrix\{([\s\S]*?)\}/g, '\\begin{matrix}$1\\end{matrix}');
  }

  return s;
}

/**
 * Parses mixed text containing raw LaTeX ($$...$$, $...$, \[...\], \(...\))
 * and converts math expressions to beautiful, accessible KaTeX HTML.
 */
export function renderMathHtml(text?: string | null): string {
  if (!text) return '';

  let str = text;

  // 1. Display math: \[ ... \]
  str = str.replace(/\\\[([\s\S]*?)\\\]/g, (_, tex) => {
    try {
      return katex.renderToString(cleanLatex(tex), { displayMode: true, throwOnError: false });
    } catch {
      return tex;
    }
  });

  // 2. Block/Inline math: $$ ... $$
  str = str.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
    const cleaned = cleanLatex(tex);
    if (!cleaned) return '';
    try {
      return katex.renderToString(cleaned, { displayMode: false, throwOnError: false });
    } catch {
      return tex;
    }
  });

  // 3. Parentheses math: \( ... \)
  str = str.replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) => {
    try {
      return katex.renderToString(cleanLatex(tex), { displayMode: false, throwOnError: false });
    } catch {
      return tex;
    }
  });

  // 4. Single dollar: $ ... $ (ensuring not double $$, and not plain currency like $50)
  str = str.replace(/(^|[^\$])\$([^\$\n]+?)\$(?!\$)/g, (match, prefix, tex) => {
    if (/^\s*\d+([.,]\d+)?\s*$/.test(tex)) return match; // skip currency
    try {
      return prefix + katex.renderToString(cleanLatex(tex), { displayMode: false, throwOnError: false });
    } catch {
      return match;
    }
  });

  // 5. Convert newlines to <br/> while avoiding duplicate breaks
  str = str.replace(/\n/g, '<br/>');

  return str;
}

interface MathTextProps {
  content?: string | null;
  className?: string;
  style?: React.CSSProperties;
  as?: 'div' | 'span';
}

/**
 * React Component to render question text, math, options, and explanations
 * with KaTeX math formula typography.
 */
export const MathText: React.FC<MathTextProps> = ({
  content,
  className = '',
  style,
  as = 'div',
}) => {
  const html = useMemo(() => renderMathHtml(content), [content]);

  const Component = as;

  return (
    <Component
      className={`math-rendered ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MathText;
