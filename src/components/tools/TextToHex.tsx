import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Copy, RefreshCcw, CheckCircle2, Download } from 'lucide-react';

export const TextToHex: React.FC = () => {
  const [text, setText] = useLocalStorage('text-to-hex-input', '');
  const [hex, setHex] = useState('');
  const [copied, setCopied] = useState(false);
  const [addSpaces, setAddSpaces] = useLocalStorage('text-to-hex-spaces', true);

  useEffect(() => {
    if (!text) {
      setHex('');
      return;
    }
    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(text);
      let hexString = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(addSpaces ? ' ' : '');
      setHex(hexString.toUpperCase());
    } catch (e) {
      setHex('Error encoding text');
    }
  }, [text, addSpaces]);

  const handleCopy = async () => {
    if (!hex) return;
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    if (!hex) return;
    const blob = new Blob([hex], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hex-output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Input Text</h3>
            <button
              onClick={handleClear}
              disabled={!text}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              Clear
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full h-64 lg:h-96 p-4 bg-transparent border-0 focus:ring-0 resize-y text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hex Output</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!hex}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!hex}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
          <textarea
            value={hex}
            readOnly
            placeholder="Hexadecimal output will appear here..."
            className="w-full h-64 lg:h-96 p-4 bg-transparent border-0 focus:ring-0 resize-y text-gray-900 dark:text-white placeholder-gray-400 font-mono text-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Options</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={addSpaces}
            onChange={(e) => setAddSpaces(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Add spaces between bytes</span>
        </label>
      </div>
    </div>
  );
};
