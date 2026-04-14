import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Copy, RefreshCcw, CheckCircle2, Download, Undo2, Redo2, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DiffViewer } from '../ui/DiffViewer';

export const CaseConverter: React.FC = () => {
  const [text, setText] = useLocalStorage('case-converter-text', '');
  const [copied, setCopied] = useState(false);
  const [showChanges, setShowChanges] = useState(false);

  // Undo/Redo state
  const [history, setHistory] = useState<string[]>([text]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    
    if (text !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(text);
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [text]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      setHistoryIndex(historyIndex - 1);
      setText(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      setHistoryIndex(historyIndex + 1);
      setText(history[historyIndex + 1]);
    }
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setText('');
  };

  const toSentenceCase = (str: string) => {
    return str.replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase());
  };

  const toTitleCase = (str: string) => {
    const minorWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'in', 'of'];
    return str.replace(/\w\S*/g, (txt, offset) => {
      if (offset !== 0 && minorWords.includes(txt.toLowerCase())) {
        return txt.toLowerCase();
      }
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  const toAlternatingCase = (str: string) => {
    return str.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
  };

  const toToggleCase = (str: string) => {
    return str.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
  };

  const convertCase = (type: string) => {
    switch (type) {
      case 'upper':
        setText(text.toUpperCase());
        break;
      case 'lower':
        setText(text.toLowerCase());
        break;
      case 'sentence':
        setText(toSentenceCase(text.toLowerCase()));
        break;
      case 'title':
        setText(toTitleCase(text));
        break;
      case 'capitalize':
        setText(text.replace(/\b\w/g, c => c.toUpperCase()));
        break;
      case 'alternating':
        setText(toAlternatingCase(text));
        break;
      case 'toggle':
        setText(toToggleCase(text));
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => convertCase('sentence')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">Sentence case</button>
            <button onClick={() => convertCase('lower')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">lowercase</button>
            <button onClick={() => convertCase('upper')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">UPPERCASE</button>
            <button onClick={() => convertCase('capitalize')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">Capitalize Each Word</button>
            <button onClick={() => convertCase('title')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">Title Case</button>
            <button onClick={() => convertCase('alternating')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">aLtErNaTiNg cAsE</button>
            <button onClick={() => convertCase('toggle')} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">tOGGLE cASE</button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center"></div>
            <button
              onClick={() => setShowChanges(!showChanges)}
              disabled={historyIndex === 0}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
                showChanges 
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" 
                  : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
              title="Show Changes"
            >
              {showChanges ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              Diff
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center"></div>
            <button
              onClick={handleCopy}
              disabled={!text}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              disabled={!text}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              onClick={handleClear}
              disabled={!text}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
        
        {showChanges && historyIndex > 0 ? (
          <div className="w-full h-96 p-4 bg-gray-50 dark:bg-gray-900/50 border-0 overflow-y-auto">
            <DiffViewer 
              original={history[historyIndex - 1]} 
              modified={text} 
              type="chars"
            />
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here to convert case..."
            className="w-full h-96 p-4 bg-transparent border-0 focus:ring-0 resize-y text-gray-900 dark:text-white placeholder-gray-400"
          />
        )}
        
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
          <span>Characters: {text.length}</span>
          <span>Words: {text.trim() ? text.trim().split(/\s+/).length : 0}</span>
        </div>
      </div>
    </div>
  );
};
