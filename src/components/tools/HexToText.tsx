import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Copy, RefreshCcw, CheckCircle2, Download, AlertCircle } from 'lucide-react';

export const HexToText: React.FC = () => {
  const [hex, setHex] = useLocalStorage('hex-to-text-input', '');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hex) {
      setText('');
      setError(null);
      return;
    }

    try {
      // Clean the hex string: remove spaces, commas, 0x, and newlines
      const cleanedHex = hex.replace(/0x/g, '').replace(/[\s,]/g, '');
      
      if (cleanedHex.length % 2 !== 0) {
        setError('Invalid hex string length. Must be an even number of characters.');
        setText('');
        return;
      }

      if (!/^[0-9A-Fa-f]*$/.test(cleanedHex)) {
        setError('Invalid characters in hex string.');
        setText('');
        return;
      }

      const bytes = new Uint8Array(cleanedHex.length / 2);
      for (let i = 0; i < cleanedHex.length; i += 2) {
        bytes[i / 2] = parseInt(cleanedHex.substring(i, i + 2), 16);
      }

      const decoder = new TextDecoder('utf-8', { fatal: true });
      const decodedText = decoder.decode(bytes);
      
      setText(decodedText);
      setError(null);
    } catch (e) {
      setError('Failed to decode hex string. It may not be valid UTF-8.');
      setText('');
    }
  }, [hex]);

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
    a.download = 'decoded-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setHex('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hex Input</h3>
            <button
              onClick={handleClear}
              disabled={!hex}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              Clear
            </button>
          </div>
          <textarea
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            placeholder="Paste your hexadecimal string here (e.g., 48 65 6C 6C 6F)..."
            className="w-full h-64 lg:h-96 p-4 bg-transparent border-0 focus:ring-0 resize-y text-gray-900 dark:text-white placeholder-gray-400 font-mono text-sm"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Text Output</h3>
            <div className="flex gap-2">
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
            </div>
          </div>
          <div className="relative flex-1">
            <textarea
              value={text}
              readOnly
              placeholder="Decoded text will appear here..."
              className="w-full h-64 lg:h-96 p-4 bg-transparent border-0 focus:ring-0 resize-y text-gray-900 dark:text-white placeholder-gray-400"
            />
            {error && (
              <div className="absolute bottom-4 left-4 right-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-200 dark:border-red-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
