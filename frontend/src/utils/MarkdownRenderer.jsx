import React from 'react';

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  // Split content by lines
  const lines = content.split('\n');
  const elements = [];
  let currentList = null;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Headers
    if (trimmedLine.startsWith('### ')) {
      elements.push(<h3 key={index} className="md-h3">{parseInline(trimmedLine.substring(4))}</h3>);
      currentList = null;
    } else if (trimmedLine.startsWith('## ')) {
      elements.push(<h2 key={index} className="md-h2">{parseInline(trimmedLine.substring(3))}</h2>);
      currentList = null;
    } else if (trimmedLine.startsWith('# ')) {
      elements.push(<h1 key={index} className="md-h1">{parseInline(trimmedLine.substring(2))}</h1>);
      currentList = null;
    }
    // Lists
    else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      elements.push(<li key={index} className="md-li">{parseInline(trimmedLine.substring(2))}</li>);
    } else if (/^\d+\. /.test(trimmedLine)) {
      elements.push(<li key={index} className="md-li-num">{parseInline(trimmedLine.replace(/^\d+\. /, ''))}</li>);
    }
    // Empty Line
    else if (trimmedLine === '') {
      elements.push(<div key={index} className="md-br"></div>);
      currentList = null;
    }
    // Paragraph
    else {
      elements.push(<p key={index} className="md-p">{parseInline(line)}</p>);
      currentList = null;
    }
  });

  return <div className="markdown-body">{elements}</div>;
};

const parseInline = (text) => {
  if (typeof text !== 'string') return text;

  // This handles bold **text** and highlights/colors if needed
  // We'll use a simple array mapping to handle multiple inline formats
  let parts = [text];

  // Bold **text**
  parts = flatten(parts.map(part => {
    if (typeof part !== 'string') return part;
    const subParts = part.split(/(\*\*.*?\*\*)/g);
    return subParts.map((sub, i) => {
      if (sub.startsWith('**') && sub.endsWith('**')) {
        return <strong key={i}>{sub.substring(2, sub.length - 2)}</strong>;
      }
      return sub;
    });
  }));

  return parts;
};

const flatten = (arr) => {
  return arr.reduce((acc, val) => acc.concat(val), []);
};

export default MarkdownRenderer;
