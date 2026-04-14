import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  RefreshCcw, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Settings2,
  Code,
  Zap,
  History
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const RegexTester: React.FC = () => {
  const [regex, setRegex] = useState('([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6})');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('Contact us at support@sohelix.com or sales@example.org for more info.');
  const [history, setHistory] = useState<{ regex: string; flags: string }[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('regex-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const results = useMemo(() => {
    if (!regex) return { matches: [], error: null };
    try {
      const re = new RegExp(regex, flags);
      const matches = [];
      let match;
      
      if (flags.includes('g')) {
        while ((match = re.exec(testText)) !== null) {
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          if (match.index === re.lastIndex) re.lastIndex++;
        }
      } else {
        match = re.exec(testText);
        if (match) {
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }
      
      return { matches, error: null };
    } catch (err: any) {
      return { matches: [], error: err.message };
    }
  }, [regex, flags, testText]);

  const saveToHistory = () => {
    if (!regex || results.error) return;
    const newHistory = [{ regex, flags }, ...history.filter(h => h.regex !== regex)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('regex-history', JSON.stringify(newHistory));
  };

  const highlightedText = useMemo(() => {
    if (results.error || !regex || results.matches.length === 0) return testText;
    
    let lastIndex = 0;
    const parts = [];
    
    // Sort matches by index to handle them sequentially
    const sortedMatches = [...results.matches].sort((a, b) => a.index - b.index);
    
    sortedMatches.forEach((match, i) => {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(testText.substring(lastIndex, match.index));
      }
      // Add highlighted match
      parts.push(
        <span 
          key={i} 
          className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded px-0.5 border-b-2 border-blue-500 font-bold"
        >
          {match.text}
        </span>
      );
      lastIndex = match.index + match.text.length;
    });
    
    // Add remaining text
    if (lastIndex < testText.length) {
      parts.push(testText.substring(lastIndex));
    }
    
    return parts;
  }, [testText, results, regex]);

  const toggleFlag = (flag: string) => {
    setFlags(prev => prev.includes(flag) ? prev.replace(flag, '') : prev + flag);
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-900 dark:text-white">Regular Expression</label>
                <div className="flex gap-2">
                  {['g', 'i', 'm', 's', 'u', 'y'].map(f => (
                    <button
                      key={f}
                      onClick={() => toggleFlag(f)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                        flags.includes(f) 
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                      )}
                      title={`Flag: ${f}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-lg">/</span>
                <input 
                  type="text"
                  value={regex}
                  onChange={(e) => setRegex(e.target.value)}
                  onBlur={saveToHistory}
                  placeholder="Enter regex pattern..."
                  className={cn(
                    "block w-full rounded-2xl border-gray-200 bg-gray-50 pl-8 pr-12 py-4 font-mono text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800",
                    results.error && "border-red-300 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-lg">/{flags}</span>
              </div>

              {results.error && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  {results.error}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-900 dark:text-white">Test String</label>
                <button 
                  onClick={() => setTestText('')}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Clear
                </button>
              </div>
              <textarea 
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter text to test against..."
                rows={8}
                className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-6 py-4 font-mono text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Live Preview
                <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {results.matches.length} matches
                </span>
              </h3>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(testText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-400" />}
              </button>
            </div>

            <div className="flex-1 rounded-2xl bg-gray-50 p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap dark:bg-gray-800/50 dark:text-gray-300 border border-gray-100 dark:border-gray-700 overflow-auto max-h-[400px]">
              {highlightedText}
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Match Details</h4>
              <div className="space-y-2 max-h-[200px] overflow-auto pr-2">
                {results.matches.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No matches found</p>
                ) : (
                  results.matches.map((match, i) => (
                    <div key={i} className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Match {i + 1}</span>
                        <span className="text-[10px] font-bold text-gray-400">Index: {match.index}</span>
                      </div>
                      <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{match.text}</p>
                      {match.groups.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-800 flex flex-wrap gap-2">
                          {match.groups.map((g, gi) => (
                            <span key={gi} className="text-[10px] bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                              Group {gi + 1}: {g}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 rounded-3xl bg-gray-900 p-8 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold flex items-center gap-2">
              <History className="h-6 w-6 text-blue-400" />
              Recent Patterns
            </h4>
            <button 
              onClick={() => { setHistory([]); localStorage.removeItem('regex-history'); }}
              className="text-xs font-bold text-red-400 hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm italic col-span-2">Your recent regex patterns will appear here.</p>
            ) : (
              history.map((h, i) => (
                <button 
                  key={i}
                  onClick={() => { setRegex(h.regex); setFlags(h.flags); }}
                  className="text-left p-4 rounded-2xl bg-gray-800 border border-gray-700 hover:border-blue-500 transition-all group"
                >
                  <p className="text-xs font-mono text-blue-400 truncate mb-1">/{h.regex}/{h.flags}</p>
                  <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors">Click to load</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-500/20">
          <Zap className="h-8 w-8 mb-4 opacity-80" />
          <h4 className="text-xl font-bold mb-2">Regex Cheat Sheet</h4>
          <ul className="text-blue-100 text-xs space-y-2">
            <li><code className="bg-blue-700 px-1 rounded">.</code> - Any character</li>
            <li><code className="bg-blue-700 px-1 rounded">\d</code> - Any digit</li>
            <li><code className="bg-blue-700 px-1 rounded">\w</code> - Word character</li>
            <li><code className="bg-blue-700 px-1 rounded">+</code> - 1 or more</li>
            <li><code className="bg-blue-700 px-1 rounded">*</code> - 0 or more</li>
            <li><code className="bg-blue-700 px-1 rounded">?</code> - Optional</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
