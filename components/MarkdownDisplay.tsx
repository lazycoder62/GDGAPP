import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import "./markdownDisplay.css";

interface MarkdownDisplayProps {
  content: string;
  className?: string;
}

const MarkdownDisplay = ({ content, className }: MarkdownDisplayProps) => {
  return (
    <div className={`markdown-body text-[#aaaaaa] ${className || ''}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownDisplay;
