// wavesync_web/src/components/chat/MarkdownRenderer.tsx
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split into paragraphs / blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let isNumberedList = false;

  const flushList = () => {
    if (currentList.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol key={`ol-${elements.length}`} style={{ paddingLeft: 20, margin: '8px 0' }}>
            {currentList.map((item, idx) => (
              <li key={idx} style={{ marginBottom: 4, lineHeight: 1.5 }}>
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} style={{ paddingLeft: 20, margin: '8px 0', listStyleType: 'disc' }}>
            {currentList.map((item, idx) => (
              <li key={idx} style={{ marginBottom: 4, lineHeight: 1.5 }}>
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
      }
      currentList = [];
    }
  };

  const renderInline = (text: string): React.ReactNode => {
    // Process bold (**bold**), code (`code`), italic (*italic*)
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={match.index} style={{ fontWeight: 800, color: 'var(--ink)' }}>
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            style={{
              background: 'rgba(5, 2, 11, 0.08)',
              padding: '2px 6px',
              borderRadius: 4,
              fontSize: '0.85em',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={match.index} style={{ fontStyle: 'italic' }}>
            {token.slice(1, -1)}
          </em>
        );
      }
      lastIndex = match.index + token.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    // Heading 3 or 4: ### Title
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h4
          key={`h4-${i}`}
          style={{
            fontSize: '1.05rem',
            fontWeight: 850,
            margin: '10px 0 6px',
            color: 'var(--ink)',
            lineHeight: 1.3,
          }}
        >
          {renderInline(line.replace(/^###\s+/, ''))}
        </h4>
      );
      continue;
    }

    // Heading 2: ## Title
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h3
          key={`h3-${i}`}
          style={{
            fontSize: '1.15rem',
            fontWeight: 900,
            margin: '12px 0 8px',
            color: 'var(--ink)',
            lineHeight: 1.25,
          }}
        >
          {renderInline(line.replace(/^##\s+/, ''))}
        </h3>
      );
      continue;
    }

    // Bullet list item: - or *
    if (line.startsWith('- ') || line.startsWith('* ')) {
      isNumberedList = false;
      currentList.push(line.substring(2));
      continue;
    }

    // Numbered list item: 1. 2. etc.
    const numberedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numberedMatch) {
      isNumberedList = true;
      currentList.push(numberedMatch[1]);
      continue;
    }

    // Blockquote: > text
    if (line.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${i}`}
          style={{
            borderLeft: '3px solid var(--accent-mint)',
            background: 'rgba(0, 215, 185, 0.08)',
            padding: '6px 12px',
            margin: '8px 0',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.88rem',
            color: 'var(--ink-secondary)',
          }}
        >
          {renderInline(line.replace(/^>\s+/, ''))}
        </blockquote>
      );
      continue;
    }

    flushList();
    elements.push(
      <p key={`p-${i}`} style={{ margin: '6px 0', lineHeight: 1.55 }}>
        {renderInline(line)}
      </p>
    );
  }

  flushList();

  return <div className="chat-markdown-root">{elements}</div>;
};
