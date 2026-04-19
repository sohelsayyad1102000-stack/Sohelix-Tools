import React, { useState, useEffect, useMemo } from 'react';
import { Banknote, Plus, Minus, RefreshCcw, Download, Copy, Check, Calculator, Table, Info, PieChart as PieChartIcon, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { getCurrencySymbol, formatCurrency } from '../../lib/finance';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Denomination {
  value: number;
  notes: number;
  loose: number;
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

const formatIndianCurrency = (value: number, currency: string) => {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }
  return formatCurrency(value, currency);
};

export const CurrencyDenomination: React.FC<CurrencyDenominationProps> = ({ tool }) => {
  const [currency, setCurrency] = useState('INR');
  const [denominations, setDenominations] = useState<Denomination[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const preset = CURRENCY_PRESETS[currency] || CURRENCY_PRESETS['INR'];
    setDenominations(preset.map(v => ({ value: v, notes: 0, loose: 0 })));
  }, [currency]);

  const updateNotes = (index: number, count: number) => {
    const newDenoms = [...denominations];
    newDenoms[index].notes = Math.max(0, count);
    setDenominations(newDenoms);
  };

  const updateLoose = (index: number, count: number) => {
    const newDenoms = [...denominations];
    newDenoms[index].loose = Math.max(0, count);
    setDenominations(newDenoms);
  };

  const totals = useMemo(() => {
    return denominations.reduce((acc, d) => {
      const subtotal = (d.notes + d.loose) * d.value;
      const isNote = d.value >= 10;
      
      return {
        amount: acc.amount + subtotal,
        notesCount: acc.notesCount + (isNote ? (d.notes + d.loose) : 0),
        coinsCount: acc.coinsCount + (!isNote ? (d.notes + d.loose) : 0)
      };
    }, { amount: 0, notesCount: 0, coinsCount: 0 });
  }, [denominations]);

  const chartData = useMemo(() => {
    return denominations
      .filter(d => (d.notes + d.loose) > 0)
      .map(d => ({
        name: `${getCurrencySymbol(currency)}${d.value}`,
        value: (d.notes + d.loose) * d.value
      }));
  }, [denominations, currency]);

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8', '#1e40af', '#1e3a8a'];

  const downloadCSV = () => {
    const headers = ['Denomination', 'Notes', 'Loose', `Amount (${currency})`].join(',');
    const rows = denominations
      .filter(d => (d.notes + d.loose) > 0)
      .map(d => [
        d.value,
        d.notes,
        d.loose,
        (d.notes + d.loose) * d.value
      ].join(','));
    
    const csvContent = [
      headers,
      ...rows,
      '',
      `Total Notes,${totals.notesCount},,`,
      `Total Coins,${totals.coinsCount},,`,
      `Total Amount,${totals.amount},,`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sohelix_cash_count_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setDenominations(denominations.map(d => ({ ...d, notes: 0, loose: 0 })));
  };

  const copyBreakdown = () => {
    const breakdown = denominations
      .filter(d => (d.notes + d.loose) > 0)
      .map(d => {
        const countText = d.notes > 0 && d.loose > 0 
          ? `(${d.notes} notes + ${d.loose} loose)` 
          : `${d.notes + d.loose}`;
        return `${d.value} x ${countText} = ${formatIndianCurrency((d.notes + d.loose) * d.value, currency)}`;
      })
      .join('\n');
    
    const text = `Currency: ${currency}
Total Amount: ${formatIndianCurrency(totals.amount, currency)}
Total Notes: ${totals.notesCount}
Total Coins: ${totals.coinsCount}

Breakdown:
${breakdown}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Banknote className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            {tool.title || 'Currency Denomination'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-xl border-gray-200 bg-white px-4 py-2 font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none"
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
        <h1 className="text-3xl font-black mb-2">{tool.title || 'Cash Denomination Report'}</h1>
        <p className="text-gray-500">Generated on {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Calculator Section */}
        <section className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500">Denomination</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500 text-center">Notes</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500 text-center">Loose</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {denominations.map((d, i) => (
                  <tr key={d.value} className={cn(
                    "group transition-colors",
                    (d.notes + d.loose) > 0 ? "bg-blue-50/20 dark:bg-blue-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/20"
                  )}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 font-black text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                          {d.value}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 print:hidden">
                        <input
                          type="number"
                          value={d.notes || ''}
                          onChange={(e) => updateNotes(i, parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-20 rounded-xl border-gray-200 bg-gray-50 px-3 py-2 text-center font-bold focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="hidden print:block text-center font-bold">{d.notes}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 print:hidden">
                        <input
                          type="number"
                          value={d.loose || ''}
                          onChange={(e) => updateLoose(i, parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-20 rounded-xl border-gray-200 bg-gray-50 px-3 py-2 text-center font-bold focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="hidden print:block text-center font-bold">{d.loose}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono font-bold text-gray-900 dark:text-white">
                        {formatIndianCurrency((d.notes + d.loose) * d.value, currency)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Summary Sidebar Section */}
        <aside className="space-y-6">
          <div className="sticky top-8 space-y-6">
            <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none print:p-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Summary
              </h2>
              
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Total Amount</p>
                  <p className="text-4xl font-black">
                    {formatIndianCurrency(totals.amount, currency)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Notes Count</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{totals.notesCount}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Coins Count</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{totals.coinsCount}</p>
                  </div>
                </div>

                {chartData.length > 0 && (
                  <div className="h-60 w-full pt-6 border-t border-gray-100 dark:border-gray-800 print:hidden">
                    <div className="flex items-center gap-2 mb-4">
                      <PieChartIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Distribution</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatIndianCurrency(value, currency)}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="space-y-3 pt-6 print:hidden">
                  <button
                    onClick={copyBreakdown}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 font-bold text-white transition-all hover:bg-black dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white active:scale-[0.98]"
                  >
                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    {copied ? 'Copied!' : 'Copy Breakdown'}
                  </button>
                  <button
                    onClick={downloadCSV}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-4 font-bold text-gray-600 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 active:scale-[0.98]"
                  >
                    <Download className="h-5 w-5" />
                    Download CSV
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-4 font-bold text-gray-600 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 active:scale-[0.98]"
                  >
                    <Printer className="h-5 w-5" />
                    Print / Save PDF
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-amber-50 p-6 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 print:hidden">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-2">
                <Info className="h-5 w-5" />
                <span className="font-bold">Pro Tip</span>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-500 leading-relaxed">
                "Notes" are for full packets/counts, while "Loose" is for individual bills or coins. Both are added together.
              </p>
            </section>
          </div>
        </aside>
      </div>

      {/* SEO Content */}
      <section className="prose prose-blue dark:prose-invert max-w-none print:hidden">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How to Use the Cash Counting Calculator</h2>
        <p>This tool is designed for retail owners, bankers, and anyone who needs to count large amounts of cash quickly and accurately. Simply enter the number of <strong>Notes</strong> and <strong>Loose</strong> pieces for each denomination.</p>
        <ul className="list-disc leading-relaxed">
          <li><strong>Real-time calculation:</strong> As you type, the total amount and count update instantly.</li>
          <li><strong>Denomination Specific totals:</strong> See the subtotal for each currency bill.</li>
          <li><strong>PDF & Print Export:</strong> Once finished, you can print a professional breakdown or save it as a PDF for your records.</li>
          <li><strong>Privacy First:</strong> No data is ever uploaded to a server. Everything happens locally in your browser.</li>
        </ul>
      </section>

      {/* FAQ Section */}
      {tool.faqs && tool.faqs.length > 0 && (
        <section className="space-y-6 print:hidden border-t border-gray-100 dark:border-gray-800 pt-12">
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
