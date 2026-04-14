import React, { useState, useEffect } from 'react';
import { 
  Link, 
  RefreshCcw, 
  Copy, 
  CheckCircle2, 
  ArrowRightLeft,
  Download,
  Trash2,
  Zap,
  History
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const URLEncoderDecoder: React.FC = () => {
  const [input, setInput] = useState('https://sohelix.com/search?q=developer tools&category=utilities');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [history, setHistory] = useState<{ input: string; output: string; mode: string }[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('url-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    processURL();
  }, [input, mode]);

  const processURL = () => {
    if (!input) {
      setOutput('');
      return;
    }
    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (err) {
      setOutput('Error: Invalid URL format');
    }
  };

  const saveToHistory = () => {
    if (!input || output.startsWith('Error')) return;
    const newHistory = [{ input, output, mode }, ...history.filter(h => h.input !== input)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('url-history', JSON.stringify(newHistory));
  };

  const copyResult = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `url-${mode}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <button 
            onClick={() => setMode('encode')}
            className={cn(
              "px-8 py-2.5 rounded-xl text-sm font-bold transition-all",
              mode === 'encode' 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Encode
          </button>
          <button 
            onClick={() => setMode('decode')}
            className={cn(
              "px-8 py-2.5 rounded-xl text-sm font-bold transition-all",
              mode === 'decode' 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Decode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Input Text
            </h3>
            <button 
              onClick={() => setInput('')}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="relative group">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onBlur={saveToHistory}
              placeholder={`Enter URL or text to ${mode}...`}
              rows={10}
              className="block w-full rounded-3xl border-gray-200 bg-white px-6 py-6 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 shadow-sm transition-all group-hover:shadow-md"
            />
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Result
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={copyResult}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Copy Result"
              >
                {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-400" />}
              </button>
              <button 
                onClick={downloadResult}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Download Result"
              >
                <Download className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
          <div className="relative group h-full">
            <div className={cn(
              "block w-full h-[244px] rounded-3xl border-gray-200 bg-gray-50 px-6 py-6 text-sm font-mono break-all overflow-auto dark:border-gray-800 dark:bg-gray-950 shadow-inner",
              output.startsWith('Error') ? "text-red-500" : "text-blue-600 dark:text-blue-400"
            )}>
              {output || <span className="text-gray-400 italic">Result will appear here...</span>}
            </div>
          </div>
        </div>
      </div>

      {/* History & Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 rounded-3xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <History className="h-5 w-5 text-gray-400" />
              Recent Activity
            </h4>
            <button 
              onClick={() => { setHistory([]); localStorage.removeItem('url-history'); }}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No recent conversions</p>
            ) : (
              history.map((h, i) => (
                <button 
                  key={i}
                  onClick={() => { setInput(h.input); setMode(h.mode as any); }}
                  className="w-full text-left p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-blue-200 hover:bg-white transition-all dark:bg-gray-800/50 dark:hover:bg-gray-800 group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                      h.mode === 'encode' ? "bg-green-100 text-green-700 dark:bg-green-900/20" : "bg-purple-100 text-purple-700 dark:bg-purple-900/20"
                    )}>
                      {h.mode}
                    </span>
                    <span className="text-[10px] text-gray-400 group-hover:text-blue-500 transition-colors">Click to restore</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{h.input}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-500/20">
          <Zap className="h-8 w-8 mb-4 opacity-80" />
          <h4 className="text-xl font-bold mb-2">Why Encode?</h4>
          <p className="text-blue-100 text-sm leading-relaxed">
            URL encoding converts characters into a format that can be transmitted over the Internet. URLs can only be sent over the Internet using the ASCII character-set. Since URLs often contain characters outside the ASCII set, the URL has to be converted into a valid ASCII format.
          </p>
        </div>
      </div>
    </div>
  );
};
