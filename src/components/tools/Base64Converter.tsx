import React, { useState, useEffect } from 'react';
import { Hash, Copy, Check, RefreshCcw, Trash2, ArrowRightLeft, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const Base64Converter: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    process(input);
  }, [input, mode]);

  const process = (val: string) => {
    if (!val.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(val))));
      } else {
        setOutput(decodeURIComponent(escape(atob(val))));
      }
      setError(null);
    } catch (e) {
      setError(mode === 'encode' ? 'Encoding failed' : 'Invalid Base64 string');
      setOutput('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleMode = () => {
    setMode(prev => prev === 'encode' ? 'decode' : 'encode');
    setInput(output);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">
          <button
            onClick={() => setMode('encode')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              mode === 'encode' ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              mode === 'decode' ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Decode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              {mode === 'encode' ? 'Plain Text' : 'Base64 String'}
            </h3>
            <button onClick={() => setInput('')} className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
            className="h-[300px] w-full rounded-2xl border-gray-200 bg-white p-4 font-mono text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              {mode === 'encode' ? 'Base64 Result' : 'Decoded Text'}
            </h3>
            {output && (
              <button onClick={copyToClipboard} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy Result'}
              </button>
            )}
          </div>
          <div className="relative h-[300px] w-full rounded-2xl border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 overflow-hidden">
            {error ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-red-600">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p className="font-bold">Error</p>
                <p className="mt-2 text-xs font-mono">{error}</p>
              </div>
            ) : output ? (
              <pre className="h-full w-full overflow-auto p-4 font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
                {output}
              </pre>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <p className="text-sm italic">Result will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={toggleMode}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowRightLeft className="h-4 w-4" />
          Swap Input & Output
        </button>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <div className="rounded-2xl border border-gray-100 p-6 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white">Text Encoding</h4>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Base64 encoding is commonly used to transmit data that might otherwise be misinterpreted by systems that only handle text. It uses 64 characters (A-Z, a-z, 0-9, +, /) to represent binary data.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-6 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <ImageIcon className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white">Data URIs</h4>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Developers often use Base64 to embed small images directly into HTML or CSS files using Data URIs, reducing the number of HTTP requests needed to load a page.
          </p>
        </div>
      </div>
    </div>
  );
};
