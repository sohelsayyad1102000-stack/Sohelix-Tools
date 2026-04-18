import React, { useState, useEffect } from 'react';
import { Banknote, Plus, Minus, RefreshCcw, Download, Copy, Check, Calculator, Table, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { getCurrencySymbol, formatCurrency } from '../../lib/finance';

interface Denomination {
  value: number;
  count: number;
}

interface CurrencyDenominationProps {
  tool: any;
}

const CURRENCY_PRESETS: Record<string, number[]> = {
  'INR': [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  'USD': [100, 50, 20, 10, 5, 2, 1],
  'EUR': [500, 200, 100, 50, 20, 10, 5, 2, 1],
  'GBP': [50, 20, 10, 5, 2, 1]
};

export const CurrencyDenomination: React.FC<CurrencyDenominationProps> = ({ tool }) => {
  const [currency, setCurrency] = useState('INR');
  const [denominations, setDenominations] = useState<Denomination[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const preset = CURRENCY_PRESETS[currency] || CURRENCY_PRESETS['INR'];
    setDenominations(preset.map(v => ({ value: v, count: 0 })));
  }, [currency]);

  const updateTotal = (index: number, count: number) => {
    const newDenoms = [...denominations];
    newDenoms[index].count = Math.max(0, count);
    setDenominations(newDenoms);
  };

  const totalAmount = denominations.reduce((acc, d) => acc + (d.value * d.count), 0);
  const totalNotes = denominations.reduce((acc, d) => acc + d.count, 0);

  const reset = () => {
    setDenominations(denominations.map(d => ({ ...d, count: 0 })));
  };

  const copyBreakdown = () => {
    const breakdown = denominations
      .filter(d => d.count > 0)
      .map(d => `${d.value} x ${d.count} = ${formatCurrency(d.value * d.count, currency)}`)
      .join('\n');
    const text = `Currency: ${currency}\nTotal Amount: ${formatCurrency(totalAmount, currency)}\nTotal Notes: ${totalNotes}\n\nBreakdown:\n${breakdown}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Banknote className="h-8 w-8 text-blue-600" />
          {tool.title || 'Currency Denomination'}
        </h1>
        <div className="flex items-center gap-3">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-xl border-gray-200 bg-white px-4 py-2 font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
          <button 
            onClick={reset} 
            className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </header>

      {/* Print-only Header */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{tool.title || 'Cash Denomination Breakdown'}</h1>
        <p className="text-gray-500">Generated on {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Calculator Section */}
        <section className="lg:col-span-2 space-y-4 print:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {denominations.map((d, i) => (
              <div key={d.value} className={cn(
                "flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all",
                d.count > 0 ? "border-blue-200 bg-blue-50/30 dark:border-blue-900/30" : "opacity-70 grayscale-[0.5]"
              )}>
                <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-blue-50 font-black text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  {d.value}
                </div>
                <div className="flex-1 flex items-center gap-2 print:hidden">
                  <button
                    onClick={() => updateTotal(i, d.count - 1)}
                    className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 active:scale-95 transition-transform"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={d.count || ''}
                    onChange={(e) => updateTotal(i, parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full rounded-lg border-gray-200 bg-gray-50 px-2 py-2 text-center font-bold focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    onClick={() => updateTotal(i, d.count + 1)}
                    className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 active:scale-95 transition-transform"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {/* Print-only count */}
                <div className="hidden print:block flex-1 text-center font-bold">
                  x {d.count}
                </div>
                <div className="w-32 text-right font-mono text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(d.value * d.count, currency)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Summary Sidebar Section */}
        <aside className="space-y-6 print:col-span-3">
          <div className="sticky top-8 space-y-6">
            <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none print:p-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Summary
              </h2>
              
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Total Amount</p>
                  <p className="text-4xl font-black text-blue-600 dark:text-blue-400">
                    {formatCurrency(totalAmount, currency)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Total Notes</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{totalNotes}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Currency</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{currency}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-6 print:hidden">
                  <button
                    onClick={copyBreakdown}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 font-bold text-white transition-all hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 active:scale-[0.98]"
                  >
                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    {copied ? 'Copied!' : 'Copy Breakdown'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-4 font-bold text-gray-600 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 active:scale-[0.98]"
                  >
                    <Download className="h-5 w-5" />
                    Print / Save PDF
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-amber-50 p-6 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 print:hidden">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-2">
                <Info className="h-5 w-5" />
                <span className="font-bold">Usage Tip</span>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-500">
                Use the <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800 shadow-sm">Tab</kbd> key to quickly cycle through denomination inputs.
              </p>
            </section>
          </div>
        </aside>
      </div>

      {/* FAQ Section */}
      {tool.faqs && tool.faqs.length > 0 && (
        <section className="space-y-6 print:hidden">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tool.faqs.map((faq: any, index: number) => (
              <article key={index} className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
