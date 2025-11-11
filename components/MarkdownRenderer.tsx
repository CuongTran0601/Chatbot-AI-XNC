
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderLine = (line: string, index: number) => {
    // Bold and Italic
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Headings (e.g., I., II., 1.)
    if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.\s/.test(line) || /^\d+\.\s/.test(line)) {
      return <h3 key={index} className="text-lg font-semibold mt-4 mb-2" dangerouslySetInnerHTML={{ __html: line }} />;
    }

    // Unordered list items
    if (/^-\s/.test(line) || /^\*\s/.test(line)) {
      return <li key={index} className="ml-5 list-disc" dangerouslySetInnerHTML={{ __html: line.substring(2) }} />;
    }

    // Default paragraph
    return <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: line }} />;
  };

  const lines = content.split('\n').filter(line => line.trim() !== '');

  return (
    <div>
      {lines.map((line, index) => renderLine(line, index))}
    </div>
  );
};

export default MarkdownRenderer;