import React from 'react';

interface BlogContentRendererProps {
  content: string;
  className?: string;
}

// Canonical slug generator — MUST stay in sync with BlogPostDetail.tsx
export function makeSlug(text: string): string {
  return text
    .replace(/&amp;/gi, 'and')
    .replace(/&[a-z]+;/gi, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({
  content,
  className = '',
}) => {
  if (!content) return null;

  const processHtml = (raw: string): string => {
    if (!raw) return '';

    let html = raw;

    // ── STEP 1: Convert legacy Markdown to HTML if no HTML block tags detected ──
    if (!/<(h[1-6]|p|ul|ol|li|blockquote|table|div|strong|em)\b[^>]*>/i.test(raw)) {
      html = raw
        .split(/\n\n+/)
        .map((block) => {
          const t = block.trim();
          if (!t) return '';
          if (t.startsWith('# '))   return `<h1>${t.slice(2)}</h1>`;
          if (t.startsWith('## '))  return `<h2>${t.slice(3)}</h2>`;
          if (t.startsWith('### ')) return `<h3>${t.slice(4)}</h3>`;
          if (t.startsWith('> ')) return `<blockquote>${t.replace(/^> /gm, '')}</blockquote>`;
          if (t.startsWith('- ') || t.startsWith('* ')) {
            const items = t.split(/\n/).map((l) => `<li>${l.replace(/^[-*]\s+/, '')}</li>`).join('');
            return `<ul>${items}</ul>`;
          }
          return `<p>${t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}</p>`;
        })
        .filter(Boolean)
        .join('\n');
    }

    // ── STEP 2: Clean ALL heading tags — strip style/class/id, re-apply clean ones ──
    // This removes Word inline color styles that override CSS
    html = html.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_match, level, inner) => {
      // Strip any nested spans injected by Word (keep text only if just spans)
      const cleanText = inner.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1').trim();
      const id = makeSlug(cleanText.replace(/<[^>]+>/g, ''));
      return `<h${level} id="${id}" class="cms-heading cms-h${level}">${cleanText}</h${level}>`;
    });

    // ── STEP 3: Style all hyperlinks in brand orange ──
    html = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_match, attrs, text) => {
      // Remove any existing class/style from Word
      const cleanAttrs = attrs
        .replace(/\s*class="[^"]*"/gi, '')
        .replace(/\s*style="[^"]*"/gi, '');
      return `<a${cleanAttrs} class="cms-link">${text}</a>`;
    });

    // ── STEP 4: Strip Word junk — orphaned mso spans, empty spans ──
    html = html.replace(/<span\b[^>]*(mso-|font-family|color:)[^>]*>([\s\S]*?)<\/span>/gi, '$2');
    html = html.replace(/<span[^>]*>\s*<\/span>/gi, '');
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    html = html.replace(/<\/?(o|w|m):[^>]*>/gi, '');

    return html;
  };

  const finalHtml = processHtml(content);

  return (
    <>
      <style>{`
        /* ── CMS Article Heading Styles ── */
        .cms-article-body .cms-heading {
          font-family: 'Outfit', sans-serif;
          color: #000000 !important;
          font-weight: 900 !important;
          text-decoration: none !important;
          border: none !important;
          outline: none !important;
          background: none !important;
          line-height: 1.25;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .dark .cms-article-body .cms-heading {
          color: #ffffff !important;
        }
        .cms-article-body .cms-h1 { font-size: 2rem; }
        .cms-article-body .cms-h2 { font-size: 1.5rem; }
        .cms-article-body .cms-h3 { font-size: 1.25rem; }
        .cms-article-body .cms-h4 { font-size: 1.1rem; }

        /* ── CMS Link Styles ── */
        .cms-article-body .cms-link {
          color: #f94a00 !important;
          text-decoration: underline;
          font-weight: 600;
          transition: color 0.15s;
        }
        .cms-article-body .cms-link:hover {
          color: #c22b00 !important;
        }

        /* ── Paragraph & List Styles ── */
        .cms-article-body p {
          line-height: 1.8;
          margin-bottom: 1rem;
          color: #374151;
        }
        .dark .cms-article-body p { color: #d1d5db; }

        .cms-article-body ul,
        .cms-article-body ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
          line-height: 1.8;
          color: #374151;
        }
        .dark .cms-article-body ul,
        .dark .cms-article-body ol { color: #d1d5db; }
        .cms-article-body ul { list-style-type: disc; }
        .cms-article-body ol { list-style-type: decimal; }

        /* ── Blockquote ── */
        .cms-article-body blockquote {
          border-left: 4px solid #f94a00;
          padding: 12px 16px;
          background: rgba(249, 74, 0, 0.05);
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: #374151;
          margin: 1.25rem 0;
        }
        .dark .cms-article-body blockquote { color: #d1d5db; }

        /* ── Inline Code & Code Block ── */
        .cms-article-body code {
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 0.875rem;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          color: #dc2626;
        }
        .dark .cms-article-body code { background: #1f2937; color: #fca5a5; }
        .cms-article-body pre {
          background: #111827;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 10px;
          overflow-x: auto;
          margin: 1rem 0;
          font-size: 0.875rem;
        }

        /* ── Table ── */
        .cms-article-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.25rem 0;
          font-size: 0.9rem;
        }
        .cms-article-body th {
          background: #f9fafb;
          color: #111827;
          font-weight: 700;
          padding: 10px 14px;
          text-align: left;
          border: 1px solid #e5e7eb;
        }
        .dark .cms-article-body th { background: #131316; color: #f9fafb; border-color: #242429; }
        .cms-article-body td {
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          color: #374151;
        }
        .dark .cms-article-body td { border-color: #242429; color: #d1d5db; }

        /* ── Strong & Em ── */
        .cms-article-body strong { font-weight: 700; color: inherit; }
        .cms-article-body em { font-style: italic; }

        /* ── Quill ql-editor rendered output ── */
        .cms-article-body .ql-editor { padding: 0; }
      `}</style>
      <div
        className={`cms-article-body max-w-none text-base leading-relaxed space-y-2 ${className}`}
        dangerouslySetInnerHTML={{ __html: finalHtml }}
      />
    </>
  );
};
