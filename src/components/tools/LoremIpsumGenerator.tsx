import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Copy, RefreshCcw, CheckCircle2, Code, Download } from 'lucide-react';
import { cn } from '../../lib/utils';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
  'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis',
  'aute', 'irure', 'reprehenderit', 'in', 'voluptate', 'velit', 'esse', 'cillum',
  'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non',
  'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

export const LoremIpsumGenerator: React.FC = () => {
  const [count, setCount] = useLocalStorage('lorem-count', 5);
  const [type, setType] = useLocalStorage<'words' | 'sentences' | 'paragraphs'>('lorem-type', 'paragraphs');
  const [startWithLorem, setStartWithLorem] = useLocalStorage('lorem-start', true);
  const [htmlFormat, setHtmlFormat] = useLocalStorage('lorem-html', false);
  
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const generateWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];

  const generateSentence = (isFirst: boolean = false) => {
    const length = Math.floor(Math.random() * 10) + 5; // 5 to 15 words
    let sentence = [];
    for (let i = 0; i < length; i++) {
      sentence.push(generateWord());
    }
    if (isFirst && startWithLorem) {
      sentence[0] = 'lorem';
      sentence[1] = 'ipsum';
      sentence[2] = 'dolor';
      sentence[3] = 'sit';
      sentence[4] = 'amet';
    }
    sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
    return sentence.join(' ') + '.';
  };

  const generateParagraph = (isFirst: boolean = false) => {
    const length = Math.floor(Math.random() * 4) + 3; // 3 to 7 sentences
    let paragraph = [];
    for (let i = 0; i < length; i++) {
      paragraph.push(generateSentence(isFirst && i === 0));
    }
    return paragraph.join(' ');
  };

  const generateText = () => {
    let result = [];
    const numCount = Math.max(1, Math.min(1000, Number(count)));

    if (type === 'words') {
      for (let i = 0; i < numCount; i++) {
        if (i === 0 && startWithLorem) {
          result.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
          i += 4;
        } else {
          result.push(generateWord());
        }
      }
      setGeneratedText(result.join(' '));
    } else if (type === 'sentences') {
      for (let i = 0; i < numCount; i++) {
        result.push(generateSentence(i === 0));
      }
      setGeneratedText(result.join(' '));
    } else if (type === 'paragraphs') {
      for (let i = 0; i < numCount; i++) {
        const p = generateParagraph(i === 0);
        result.push(htmlFormat ? `<p>${p}</p>` : p);
      }
      setGeneratedText(result.join(htmlFormat ? '\n' : '\n\n'));
    }
  };

  useEffect(() => {
    generateText();
  }, [count, type, startWithLorem, htmlFormat]);

  const handleCopy = async () => {
    if (!generatedText) return;
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    if (!generatedText) return;
    const blob = new Blob([generatedText], { type: htmlFormat ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = htmlFormat ? 'lorem-ipsum.html' : 'lorem-ipsum.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Paragraphs / Sentences / Words
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-24 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="words">Words</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col justify-center space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Start with "Lorem ipsum dolor sit amet"</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={htmlFormat}
                onChange={(e) => setHtmlFormat(e.target.checked)}
                disabled={type !== 'paragraphs'}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
              />
              <span className={cn("text-sm font-medium text-gray-900 dark:text-gray-300", type !== 'paragraphs' && "opacity-50")}>
                Wrap in &lt;p&gt; tags (Paragraphs only)
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Generated Text</h3>
          <div className="flex gap-2">
            <button
              onClick={generateText}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              Regenerate
            </button>
            <button
              onClick={handleCopy}
              disabled={!generatedText}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              disabled={!generatedText}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
        <textarea
          value={generatedText}
          readOnly
          className="w-full h-96 p-4 bg-transparent border-0 focus:ring-0 resize-y text-gray-900 dark:text-white placeholder-gray-400"
        />
      </div>
    </div>
  );
};
