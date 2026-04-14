import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Copy, RefreshCcw, CheckCircle2, Download, ArrowDownAZ, ArrowUpZA, Shuffle, AlignLeft, Undo2, Redo2, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DiffViewer } from '../ui/DiffViewer';

export const LineSorter: React.FC = () => {
  const [text, setText] = useLocalStorage('line-sorter-text', '');
  const [copied, setCopied] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useLocalStorage('line-sorter-dedupe', false);
  const [ignoreCase, setIgnoreCase] = useLocalStorage('line-sorter-ignore-case', true);
  const [trimLines, setTrimLines] = useLocalStorage('line-sorter-trim', true);
  const [removeEmpty, setRemoveEmpty] = useLocalStorage('line-sorter-empty', true);
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
    a.download = 'sorted-lines.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setText('');
  };

  const processLines = (lines: string[]) => {
    let processed = [...lines];
    if (trimLines) processed = processed.map(l => l.trim());
    if (removeEmpty) processed = processed.filter(l => l.length > 0);
    if (removeDuplicates) {
      if (ignoreCase) {
        const seen = new Set();
        processed = processed.filter(l => {
          const lower = l.toLowerCase();
          if (seen.has(lower)) return false;
          seen.add(lower);
          return true;
        });
      } else {
        processed = [...new Set(processed)];
      }
    }
    return processed;
  };

  const sortAZ = () => {
    let lines = processLines(text.split('\n'));
    lines.sort((a, b) => {
      if (ignoreCase) return a.toLowerCase().localeCompare(b.toLowerCase());
      return a.localeCompare(b);
    });
    setText(lines.join('\n'));
  };

  const sortZA = () => {
    let lines = processLines(text.split('\n'));
    lines.sort((a, b) => {
      if (ignoreCase) return b.toLowerCase().localeCompare(a.toLowerCase());
      return b.localeCompare(a);
    });
    setText(lines.join('\n'));
  };

  const sortByLength = () => {
    let lines = processLines(text.split('\n'));
    lines.sort((a, b) => a.length - b.length);
    setText(lines.join('\n'));
  };

  const randomize = () => {
    let lines = processLines(text.split('\n'));
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    setText(lines.join('\n'));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={sortAZ} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">
                <ArrowDownAZ className="h-4 w-4" /> A-Z
              </button>
              <button onClick={sortZA} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">
                <ArrowUpZA className="h-4 w-4" /> Z-A
              </button>
              <button onClick={sortByLength} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">
                <AlignLeft className="h-4 w-4" /> By Length
              </button>
              <button onClick={randomize} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">
                <Shuffle className="h-4 w-4" /> Randomize
              </button>
            </div>
            <div className="flex gap-2">
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
                type="lines"
              />
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your list here, one item per line..."
              className="w-full h-96 p-4 bg-transparent border-0 focus:ring-0 resize-y text-gray-900 dark:text-white placeholder-gray-400"
            />
          )}
          
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
            <span>Lines: {text ? text.split('\n').length : 0}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Options</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Remove duplicates</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Ignore case</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={trimLines}
                onChange={(e) => setTrimLines(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Trim lines</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={removeEmpty}
                onChange={(e) => setRemoveEmpty(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Remove empty lines</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
