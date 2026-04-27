import React, { useState, useCallback } from 'react';
import { Shuffle, Copy, CheckCircle2, RotateCcw, List, Hash, Binary } from 'lucide-react';
import { cn } from '../../lib/utils';

export const RandomNumberGenerator: React.FC = () => {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [count, setCount] = useState<number>(1);
  const [results, setResults] = useState<number[]>([]);
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRandom = useCallback(() => {
    setIsGenerating(true);
    
    // Small delay for visual feedback
    setTimeout(() => {
      const newResults: number[] = [];
      const range = max - min + 1;

      if (!allowDuplicates && range < count) {
        // Fallback or alert if unique numbers impossible
        setCount(range);
      }

      const effectiveCount = !allowDuplicates && range < count ? range : count;

      while (newResults.length < effectiveCount) {
        const rand = Math.floor(Math.random() * range) + min;
        if (allowDuplicates || !newResults.includes(rand)) {
          newResults.push(rand);
        }
      }

      setResults(newResults);
      setIsGenerating(false);
    }, 300);
  }, [min, max, count, allowDuplicates]);

  const handleCopy = async () => {
    if (results.length === 0) return;
    try {
      await navigator.clipboard.writeText(results.join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy results:', err);
    }
  };

  const handleReset = () => {
    setMin(1);
    setMax(100);
    setCount(1);
    setResults([]);
    setAllowDuplicates(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum</label>
                <input
                  type="number"
                  value={min}
                  onChange={(e) => setMin(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum</label>
                <input
                  type="number"
                  value={max}
                  onChange={(e) => setMax(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Count</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={count}
                  onChange={(e) => setCount(Math.min(1000, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="duplicates"
                  checked={allowDuplicates}
                  onChange={(e) => setAllowDuplicates(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <label htmlFor="duplicates" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Allow duplicates
                </label>
              </div>

              <button
                onClick={generateRandom}
                disabled={isGenerating}
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2",
                  isGenerating ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30"
                )}
              >
                <Shuffle className={cn("h-5 w-5", isGenerating && "animate-spin")} />
                {isGenerating ? 'Generating...' : 'Generate Numbers'}
              </button>

              <button
                onClick={handleReset}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Settings
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <List className="h-5 w-5 text-blue-600" />
                Results
              </h3>
              {results.length > 0 && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy All'}
                </button>
              )}
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {results.map((num, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-xl font-black text-blue-700 dark:text-blue-400 animate-in fade-in zoom-in duration-300"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {num}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                <div className="h-16 w-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
                  <Hash className="h-8 w-8 text-gray-300" />
                </div>
                <h4 className="text-gray-900 dark:text-white font-bold">No numbers generated yet</h4>
                <p className="text-gray-500 text-sm mt-2">Adjust the settings and click generate to see random results here.</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Total Sum</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{results.reduce((a, b) => a + b, 0)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Average</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{(results.reduce((a, b) => a + b, 0) / results.length).toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Binary className="h-5 w-5 text-blue-600" />
            Randomness Method
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            This tool generates numbers using the standard <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-blue-600">Math.random()</code> API, which is deterministic but highly distributed. It's suitable for games, lotteries, and general decision making.
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3">Usage Tips</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc list-inside">
            <li>Use a wide range for higher entropy.</li>
            <li>Enable "Unique" to avoid repeating numbers.</li>
            <li>Generate up to 1000 numbers in a single click.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
