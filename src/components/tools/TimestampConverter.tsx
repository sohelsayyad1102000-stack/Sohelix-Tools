import React, { useState, useEffect } from 'react';
import { Clock, Copy, Check, RefreshCcw, Calendar, ArrowRightLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const TimestampConverter: React.FC = () => {
  const [timestamp, setTimestamp] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [humanDate, setHumanDate] = useState<string>('');
  const [unit, setUnit] = useState<'s' | 'ms'>('s');
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    updateHumanDate(timestamp, unit, timezone);
  }, [timestamp, unit, timezone]);

  const updateHumanDate = (ts: string, u: 's' | 'ms', tz: string) => {
    try {
      const val = parseInt(ts);
      if (isNaN(val)) {
        setHumanDate('Invalid Timestamp');
        return;
      }
      const date = new Date(u === 's' ? val * 1000 : val);
      setHumanDate(date.toLocaleString('en-US', { timeZone: tz }));
    } catch (e) {
      setHumanDate('Invalid Timestamp');
    }
  };

  const handleHumanDateChange = (val: string) => {
    try {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        const ts = unit === 's' ? Math.floor(date.getTime() / 1000) : date.getTime();
        setTimestamp(ts.toString());
      }
    } catch (e) {}
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const setNow = () => {
    const now = Date.now();
    setTimestamp(unit === 's' ? Math.floor(now / 1000).toString() : now.toString());
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Timestamp to Date */}
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">Unix Timestamp</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Timestamp Value</label>
              <div className="relative">
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 font-mono text-lg focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button
                  onClick={() => copyToClipboard(timestamp, 'ts')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {copied === 'ts' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 's' | 'ms')}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="s">Seconds (s)</option>
                  <option value="ms">Milliseconds (ms)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={setNow}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  Set to Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date to Timestamp */}
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">Human Readable Date</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Date String</label>
              <div className="relative">
                <input
                  type="text"
                  value={humanDate}
                  onChange={(e) => {
                    setHumanDate(e.target.value);
                    handleHumanDateChange(e.target.value);
                  }}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-lg focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button
                  onClick={() => copyToClipboard(humanDate, 'date')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {copied === 'date' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {Intl.supportedValuesOf('timeZone').map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="rounded-2xl bg-blue-50 p-6 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
        <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-4">Quick Reference</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">1 Minute</p>
            <p className="font-mono text-sm text-blue-900 dark:text-blue-200">60 seconds</p>
          </div>
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">1 Hour</p>
            <p className="font-mono text-sm text-blue-900 dark:text-blue-200">3,600 seconds</p>
          </div>
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">1 Day</p>
            <p className="font-mono text-sm text-blue-900 dark:text-blue-200">86,400 seconds</p>
          </div>
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">1 Week</p>
            <p className="font-mono text-sm text-blue-900 dark:text-blue-200">604,800 seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
};
