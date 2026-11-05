import React from 'react';

/**
 * Pure React Markdown renderer for LLM synthesis answers (/ask and /lore-ask).
 * Safely renders headings, bullet/numbered lists, blockquotes, tables, code blocks,
 * bold/italic text, inline code, and resolves any residual [S1]/[S2] source tags
 * to their actual anime titles without dangerouslySetInnerHTML.
 */
export function MarkdownContent({ content, sources = [], variant = 'emerald', className = '' }) {
  if (!content || typeof content !== 'string') return null;

  const badgeClass =
    variant === 'rose'
      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';

  const bulletColor =
    variant === 'rose'
      ? 'text-rose-500 dark:text-rose-400'
      : 'text-emerald-500 dark:text-emerald-400';

  // Map S1, S2, ... to work titles if sources array is available
  const refToTitle = {};
  if (Array.isArray(sources)) {
    sources.forEach((s, idx) => {
      const refKey = (s?.ref || `S${idx + 1}`).toUpperCase();
      if (s?.title) {
        refToTitle[refKey] = s.title;
      }
    });
  }

  const resolveCitationRefs = (rawCite) => {
    const inner = rawCite.replace(/^(\(\[|\[)/, '').replace(/(\]\)|\])$/, '');
    const rangeOrRef = /S?(\d+)\s*[-–—]\s*S?(\d+)|S(\d+)/gi;
    const titles = [];
    let m;
    while ((m = rangeOrRef.exec(inner)) !== null) {
      if (m[1] && m[2]) {
        const start = parseInt(m[1], 10);
        const end = parseInt(m[2], 10);
        for (let n = start; n <= end && n - start <= 50; n++) {
          const t = refToTitle[`S${n}`];
          if (t && !titles.includes(t)) titles.push(t);
        }
      } else if (m[3]) {
        const t = refToTitle[`S${m[3]}`];
        if (t && !titles.includes(t)) titles.push(t);
      }
    }
    return titles;
  };

  // Pre-clean any residual ([S1, S2]) or [S4–S8] into anime titles (or strip if already named on the same line)
  const replaceResidualSCitations = (rawText) => {
    const citeRegex = /\(\s*\[\s*S\d+(?:\s*(?:,|[-–—])\s*S?\d+)*\s*\]\s*\)|\[\s*S\d+(?:\s*(?:,|[-–—])\s*S?\d+)*\s*\]/g;
    return rawText.replace(citeRegex, (match, offset, fullStr) => {
      const titles = resolveCitationRefs(match);
      if (titles.length === 0) return '';
      const lineStart = fullStr.lastIndexOf('\n', offset);
      const preceding = fullStr.slice(Math.max(0, lineStart === -1 ? offset - 160 : lineStart), offset).toLowerCase();
      const unmentioned = titles.filter((t) => !preceding.includes(t.toLowerCase()));
      if (unmentioned.length === 0) return '';
      return `[${unmentioned.join(', ')}]`;
    });
  };

  const parseInline = (text, keyPrefix = 'in') => {
    if (!text) return null;

    const inlineRegex =
      /(`[^`\n]+`|\*\*\*[^*\n]+\*\*\*|\*\*[^*\n]+\*\*|\*(?!\s)[^*\n]+(?<!\s)\*|\[[^\]\n]{2,80}\])/g;

    const parts = text.split(inlineRegex);
    return parts.map((part, idx) => {
      if (!part) return null;
      const key = `${keyPrefix}-${idx}`;

      // 1. Inline code
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code
            key={key}
            className="px-1.5 py-0.5 rounded-md bg-zinc-200/75 dark:bg-zinc-800/90 font-mono text-xs text-zinc-900 dark:text-zinc-100"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // 2. Bold + Italic
      if (part.startsWith('***') && part.endsWith('***') && part.length > 6) {
        return (
          <strong key={key} className="font-semibold italic text-zinc-950 dark:text-white">
            {parseInline(part.slice(3, -3), key)}
          </strong>
        );
      }

      // 3. Bold
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={key} className="font-semibold text-zinc-950 dark:text-white">
            {parseInline(part.slice(2, -2), key)}
          </strong>
        );
      }

      // 4. Italic
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={key} className="italic text-zinc-900 dark:text-zinc-100">
            {parseInline(part.slice(1, -1), key)}
          </em>
        );
      }

      // 5. Bracketed anime/episode citation badge
      if (part.startsWith('[') && part.endsWith(']') && part.length > 2) {
        return (
          <span
            key={key}
            className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md text-[11px] font-mono font-medium border align-baseline ${badgeClass}`}
          >
            {part.slice(1, -1)}
          </span>
        );
      }

      return part.replace(/\*\*/g, '');
    });
  };

  // Pre-normalize inline headings, inline bullet lists, and residual S1/S2 tags
  const normalized = replaceResidualSCitations(content)
    .replace(/\r\n/g, '\n')
    .replace(/([^\n])\s+(#{1,4}\s+)/g, '$1\n\n$2')
    .replace(/([.!?:)\]*])\s+-\s+(?=\*\*|\*|[A-Z])/g, '$1\n- ')
    .replace(/[ \t]+\./g, '.');

  const rawLines = normalized.split('\n');
  const blocks = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Fenced code block ```
    if (trimmed.startsWith('```')) {
      const codeLines = [];
      i += 1;
      while (i < rawLines.length && !rawLines[i].trim().startsWith('```')) {
        codeLines.push(rawLines[i]);
        i += 1;
      }
      i += 1; // skip closing ```
      blocks.push(
        <pre
          key={`code-${i}`}
          className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto my-2"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push(
        <hr
          key={`hr-${i}`}
          className="border-t border-zinc-200/80 dark:border-zinc-800/80 my-3"
        />
      );
      i += 1;
      continue;
    }

    // Markdown Table (| Col 1 | Col 2 |)
    if (trimmed.startsWith('|') && trimmed.includes('|', 1)) {
      const tableLines = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith('|')) {
        tableLines.push(rawLines[i].trim());
        i += 1;
      }
      const parseRow = (rowStr) =>
        rowStr
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());

      const rows = tableLines
        .filter((r) => !/^\|?[\s\-:|]+\|?$/.test(r))
        .map(parseRow);

      if (rows.length > 0) {
        const header = rows[0];
        const bodyRows = rows.slice(1);
        blocks.push(
          <div key={`tbl-${i}`} className="overflow-x-auto my-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-100/80 dark:bg-zinc-900/80 border-b border-zinc-200/80 dark:border-zinc-800/80">
                  {header.map((cell, cIdx) => (
                    <th key={cIdx} className="py-2 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {parseInline(cell, `th-${i}-${cIdx}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="bg-white/40 dark:bg-zinc-950/30">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {parseInline(cell, `td-${i}-${rIdx}-${cIdx}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Headings (#, ##, ###, ####)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].replace(/\*\*/g, '').trim();
      const sizeClass =
        level === 1
          ? 'text-base sm:text-lg font-bold mt-4 mb-1.5'
          : level === 2
          ? 'text-sm sm:text-base font-bold mt-3.5 mb-1.5'
          : 'text-xs sm:text-sm font-bold mt-3 mb-1 uppercase tracking-wide';
      blocks.push(
        <h4
          key={`h-${i}`}
          className={`font-sans text-zinc-900 dark:text-zinc-100 ${sizeClass}`}
        >
          {parseInline(headingText, `h-${i}`)}
        </h4>
      );
      i += 1;
      continue;
    }

    // Unordered list (- , * , • )
    if (/^([-*•])\s+/.test(trimmed)) {
      const items = [];
      while (i < rawLines.length && /^([-*•])\s+/.test(rawLines[i].trim())) {
        const rawLine = rawLines[i];
        const indent = (rawLine.match(/^\s*/) || [''])[0].length;
        const itemText = rawLine.trim().replace(/^([-*•])\s+/, '');
        items.push({ text: itemText, nested: indent >= 2 });
        i += 1;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="space-y-1.5 my-2 pl-1">
          {items.map((item, idx) => (
            <li
              key={idx}
              className={`flex items-start gap-2.5 text-sm leading-relaxed ${item.nested ? 'ml-4 text-xs sm:text-sm' : ''}`}
            >
              <span
                className={`mt-1.5 rounded-full shrink-0 ${
                  item.nested
                    ? 'w-1 h-1 border border-current opacity-75'
                    : `w-1.5 h-1.5 bg-current ${bulletColor}`
                }`}
              />
              <span className="flex-1 min-w-0">{parseInline(item.text, `ul-${i}-${idx}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list (1. , 2. )
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < rawLines.length && /^\d+\.\s+/.test(rawLines[i].trim())) {
        const match = rawLines[i].trim().match(/^(\d+)\.\s+(.*)$/);
        if (match) {
          items.push({ num: match[1], text: match[2] });
        }
        i += 1;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="space-y-1.5 my-2 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm leading-relaxed">
              <span className={`font-mono text-xs font-bold mt-0.5 shrink-0 ${bulletColor}`}>
                {item.num}.
              </span>
              <span className="flex-1 min-w-0">{parseInline(item.text, `ol-${i}-${idx}`)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Blockquote (> )
    if (trimmed.startsWith('>')) {
      const quoteLines = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith('>')) {
        quoteLines.push(rawLines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push(
        <blockquote
          key={`bq-${i}`}
          className="pl-3.5 border-l-2 border-zinc-300 dark:border-zinc-700 italic text-zinc-700 dark:text-zinc-300 my-2 space-y-1"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className="text-sm leading-relaxed">
              {parseInline(ql, `bq-${i}-${qIdx}`)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Standard Paragraph (collect consecutive non-special lines)
    const paraLines = [];
    while (
      i < rawLines.length &&
      rawLines[i].trim() !== '' &&
      !rawLines[i].trim().startsWith('```') &&
      !rawLines[i].trim().startsWith('|') &&
      !/^(#{1,4})\s+/.test(rawLines[i].trim()) &&
      !/^([-*•])\s+/.test(rawLines[i].trim()) &&
      !/^\d+\.\s+/.test(rawLines[i].trim()) &&
      !rawLines[i].trim().startsWith('>') &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(rawLines[i].trim())
    ) {
      paraLines.push(rawLines[i].trim());
      i += 1;
    }
    blocks.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed">
        {parseInline(paraLines.join(' '), `p-${i}`)}
      </p>
    );
  }

  return (
    <div className={`text-sm text-zinc-800 dark:text-zinc-200 font-sans space-y-2.5 ${className}`}>
      {blocks}
    </div>
  );
}
