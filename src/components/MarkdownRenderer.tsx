import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Parse lines into tokens
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let blockIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block delimiters
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Closing code block
        const codeText = codeBuffer.join('\n');
        const currentIndex = blockIndex++;
        blocks.push(
          <div key={`code-${currentIndex}`} className="my-4 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900 text-slate-100 shadow-sm text-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/50 text-xs text-slate-400 font-mono">
              <span>{codeLanguage || 'code'}</span>
              <button
                onClick={() => copyToClipboard(codeText, currentIndex)}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-700/50 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Copy code"
              >
                {copiedIndex === currentIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-emerald-300">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLanguage = '';
      } else {
        // Opening code block
        inCodeBlock = true;
        codeLanguage = line.trim().replace(/^```/, '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***') {
      blocks.push(<hr key={`hr-${blockIndex++}`} className="my-6 border-slate-200" />);
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${blockIndex++}`} className="text-base sm:text-lg font-bold text-slate-900 mt-5 mb-2 flex items-center gap-2">
          {renderInline(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${blockIndex++}`} className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-3 pb-1 border-b border-slate-100">
          {renderInline(line.replace('## ', ''))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={`h1-${blockIndex++}`} className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-6 mb-3">
          {renderInline(line.replace('# ', ''))}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      blocks.push(
        <blockquote key={`bq-${blockIndex++}`} className="my-3 pl-4 border-l-4 border-indigo-500 italic text-slate-600 bg-indigo-50/40 py-1.5 rounded-r">
          {renderInline(line.replace('> ', ''))}
        </blockquote>
      );
      continue;
    }

    // Unordered List item
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().replace(/^[-*]\s+/, '');
      blocks.push(
        <div key={`li-${blockIndex++}`} className="flex items-start gap-2.5 my-1.5 text-slate-700 leading-relaxed text-sm sm:text-base">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
          <span>{renderInline(text)}</span>
        </div>
      );
      continue;
    }

    // Numbered List item
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      blocks.push(
        <div key={`num-${blockIndex++}`} className="flex items-start gap-2.5 my-2 text-slate-700 leading-relaxed text-sm sm:text-base">
          <span className="font-semibold text-indigo-600 shrink-0 w-5">{numMatch[1]}.</span>
          <span>{renderInline(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      blocks.push(<div key={`sp-${blockIndex++}`} className="h-2" />);
      continue;
    }

    // Standard paragraph
    blocks.push(
      <p key={`p-${blockIndex++}`} className="my-2 text-slate-700 leading-relaxed text-sm sm:text-base">
        {renderInline(line)}
      </p>
    );
  }

  // Fallback if code block was unclosed
  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push(
      <pre key="unclosed-code" className="p-4 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto">
        <code>{codeBuffer.join('\n')}</code>
      </pre>
    );
  }

  return <div className={`space-y-1 ${className}`}>{blocks}</div>;
};

// Helper for inline formatting: bold, italic, inline code
function renderInline(text: string): React.ReactNode {
  // Regex to match **bold**, *italic*, and `code`
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={idx} className="italic text-slate-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-indigo-700 font-mono text-xs font-medium"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
