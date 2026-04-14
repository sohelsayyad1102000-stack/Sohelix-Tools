import React from 'react';
import { diffChars, diffWords, diffLines } from 'diff';
import { cn } from '../../lib/utils';

interface DiffViewerProps {
  original: string;
  modified: string;
  type?: 'chars' | 'words' | 'lines';
  className?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  original,
  modified,
  type = 'chars',
  className
}) => {
  const getDiff = () => {
    switch (type) {
      case 'words':
        return diffWords(original, modified);
      case 'lines':
        return diffLines(original, modified);
      case 'chars':
      default:
        return diffChars(original, modified);
    }
  };

  const diffs = getDiff();

  return (
    <div className={cn("font-mono text-sm whitespace-pre-wrap break-words", className)}>
      {diffs.map((part, index) => {
        if (part.added) {
          return (
            <span key={index} className="bg-green-200 dark:bg-green-900/50 text-green-900 dark:text-green-100">
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span key={index} className="bg-red-200 dark:bg-red-900/50 text-red-900 dark:text-red-100 line-through opacity-70">
              {part.value}
            </span>
          );
        }
        return <span key={index} className="text-gray-900 dark:text-gray-100">{part.value}</span>;
      })}
    </div>
  );
};
