import React, { useState, useEffect } from 'react';
import { v4 as uuidv4, v1 as uuidv1, v3 as uuidv3, v5 as uuidv5 } from 'uuid';
import { 
  Copy, 
  RefreshCcw, 
  Download, 
  CheckCircle2, 
  Settings2, 
  History,
  Trash2,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Default DNS namespace

export const UUIDGenerator: React.FC = () => {
  const [quantity, setQuantity] = useState(5);
  const [version, setVersion] = useState<4 | 1 | 3 | 5>(4);
  const [uuids, setUuids] = useState<string[]>([]);
  const [history, setHistory] = useState<string[][]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    generateUUIDs();
    const savedHistory = localStorage.getItem('uuid-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const generateUUIDs = () => {
    const newUuids: string[] = [];
    for (let i = 0; i < quantity; i++) {
      if (version === 4) newUuids.push(uuidv4());
      else if (version === 1) newUuids.push(uuidv1());
      else if (version === 3) newUuids.push(uuidv3('sohelix', NAMESPACE));
      else if (version === 5) newUuids.push(uuidv5('sohelix', NAMESPACE));
    }
    setUuids(newUuids);
    
    const updatedHistory = [newUuids, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('uuid-history', JSON.stringify(updatedHistory));
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyOne = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Configuration */}
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
              <Settings2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generator Settings</h3>
              <p className="text-sm text-gray-500">Customize your UUID generation</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity</label>
              <input 
                type="number" 
                min="1" 
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="block w-24 rounded-xl border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Version</label>
              <select 
                value={version}
                onChange={(e) => setVersion(parseInt(e.target.value) as any)}
                className="block w-32 rounded-xl border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
              >
                <option value={4}>v4 (Random)</option>
                <option value={1}>v1 (Time)</option>
                <option value={3}>v3 (MD5)</option>
                <option value={5}>v5 (SHA-1)</option>
              </select>
            </div>

            <button 
              onClick={generateUUIDs}
              className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
            >
              <RefreshCcw className="h-4 w-4" />
              Regenerate
            </button>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Generated UUIDs
              <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {uuids.length} results
              </span>
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={copyAll}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied All' : 'Copy All'}
              </button>
              <button 
                onClick={downloadTxt}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export TXT
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {uuids.map((uuid, index) => (
                <div key={index} className="group flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <code className="text-sm font-mono text-blue-600 dark:text-blue-400">{uuid}</code>
                  <button 
                    onClick={() => copyOne(uuid, index)}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 transition-all"
                  >
                    {copiedIndex === index ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <History className="h-5 w-5 text-gray-400" />
              Recent
            </h3>
            <button 
              onClick={() => { setHistory([]); localStorage.removeItem('uuid-history'); }}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Clear
            </button>
          </div>

          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-12 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-400">No recent activity</p>
              </div>
            ) : (
              history.map((batch, i) => (
                <button 
                  key={i}
                  onClick={() => setUuids(batch)}
                  className="w-full text-left p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all dark:bg-gray-900 dark:border-gray-800 dark:hover:border-blue-900"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Batch {history.length - i}</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">{batch.length} IDs</span>
                  </div>
                  <p className="text-xs font-mono text-gray-500 truncate">{batch[0]}...</p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-500/20">
          <Zap className="h-8 w-8 mb-4 opacity-80" />
          <h4 className="text-xl font-bold mb-2">Pro Tip: Version 4</h4>
          <p className="text-blue-100 text-sm leading-relaxed">
            UUID v4 is the most commonly used version. It is generated using random numbers, providing a extremely low probability of collision, making it perfect for database keys and unique identifiers.
          </p>
        </div>
        <div className="rounded-3xl bg-gray-900 p-8 text-white shadow-xl">
          <History className="h-8 w-8 mb-4 opacity-80 text-blue-400" />
          <h4 className="text-xl font-bold mb-2">Local History</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your generated UUIDs are saved locally in your browser. You can quickly access previous batches without regenerating, ensuring you don't lose important identifiers during your session.
          </p>
        </div>
      </div>
    </div>
  );
};
