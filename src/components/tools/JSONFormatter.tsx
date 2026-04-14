import React, { useState, useEffect } from 'react';
import { Code, Copy, Check, RefreshCcw, Trash2, AlignLeft, Minimize2, Maximize2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const JSONFormatter: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);

  const formatJSON = (beautify: boolean) => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const formatted = beautify 
        ? JSON.stringify(parsed, null, indent)
        : JSON.stringify(parsed);
      setOutput(formatted);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Input JSON</h3>
            <button onClick={clear} className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste your JSON here... e.g. {"name": "Sohelix", "type": "Tools"}'
            className="h-[400px] w-full rounded-2xl border-gray-200 bg-white p-4 font-mono text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        {/* Output Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Formatted Output</h3>
            {output && (
              <button onClick={copyToClipboard} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy Result'}
              </button>
            )}
          </div>
          <div className="relative h-[400px] w-full rounded-2xl border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 overflow-hidden">
            {error ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-red-600">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p className="font-bold">Invalid JSON</p>
                <p className="mt-2 text-xs font-mono">{error}</p>
              </div>
            ) : output ? (
              <pre className="h-full w-full overflow-auto p-4 font-mono text-sm text-gray-800 dark:text-gray-200">
                {output}
              </pre>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <p className="text-sm italic">Formatted JSON will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2 mr-4">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Indentation:</label>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="rounded-lg border-gray-200 bg-gray-50 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
            <option value={8}>8 Spaces</option>
          </select>
        </div>

        <button
          onClick={() => formatJSON(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700"
        >
          <Maximize2 className="h-4 w-4" />
          Beautify JSON
        </button>

        <button
          onClick={() => formatJSON(false)}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <Minimize2 className="h-4 w-4" />
          Minify JSON
        </button>
      </div>
    </div>
  );
};
