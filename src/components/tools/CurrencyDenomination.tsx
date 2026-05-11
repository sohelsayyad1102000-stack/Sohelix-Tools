import React, { useState, useEffect, useMemo } from 'react';
import { Banknote, Plus, Minus, RefreshCcw, Download, Copy, Check, Calculator, Table, Info, PieChart as PieChartIcon, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { getCurrencySymbol, formatCurrency } from '../../lib/finance';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Denomination {
  value: number;
  notes: number;
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
    setDenominations(preset.map(v => ({ value: v, notes: 0 })));
  }, [currency]);

  const updateNotes = (index: number, count: number) => {
    const newDenoms = [...denominations];
    newDenoms[index].notes = Math.max(0, count);
    setDenominations(newDenoms);
  };

  const totals = useMemo(() => {
    return denominations.reduce((acc, d) => {
      const subtotal = d.notes * d.value;
      const isNote = d.value >= 10;
      
      return {
        amount: acc.amount + subtotal,
        notesCount: acc.notesCount + (isNote ? d.notes : 0),
        coinsCount: acc.coinsCount + (!isNote ? d.notes : 0)
      };
    }, { amount: 0, notesCount: 0, coinsCount: 0 });
  }, [denominations]);

  const chartData = useMemo(() => {
    return denominations
      .filter(d => d.notes > 0)
      .map(d => ({
        name: `${getCurrencySymbol(currency)}${d.value}`,
        value: d.notes * d.value
      }));
  }, [denominations, currency]);

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8', '#1e40af', '#1e3a8a'];

  const downloadCSV = () => {
    const headers = ['Denomination', 'Notes', `Amount (${currency})`].join(',');
    const rows = denominations
      .filter(d => d.notes > 0)
      .map(d => [
        d.value,
        d.notes,
        d.notes * d.value
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
    setDenominations(denominations.map(d => ({ ...d, notes: 0 })));
  };

  const copyBreakdown = () => {
    const breakdown = denominations
      .filter(d => d.notes > 0)
      .map(d => {
        return `${d.value} x ${d.notes} = ${formatIndianCurrency(d.notes * d.value, currency)}`;
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
          {/* Mobile and Tablet View: Card-based Layout */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {denominations.map((d, i) => (
              <div 
                key={d.value} 
                className={cn(
                  "p-5 rounded-2xl border transition-all duration-300",
                  d.notes > 0 
                    ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800" 
                    : "bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-16 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 font-black text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm">
                    {d.value}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</p>
                    <p className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {formatIndianCurrency(d.notes * d.value, currency)}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Notes</label>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => updateNotes(i, d.notes - 1)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-blue-600"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={d.notes || ''}
                      onChange={(e) => updateNotes(i, parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full rounded-xl border-gray-200 bg-gray-50 dark:bg-gray-800/50 px-2 py-2 text-center font-bold focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:text-white transition-all"
                    />
                    <button 
                      onClick={() => updateNotes(i, d.notes + 1)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-blue-600"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Full Table Layout */}
          <div className="hidden lg:block overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 relative">
            <div className="overflow-x-auto max-h-[800px] custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 shadow-sm">
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-gray-500">Denomination</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-gray-500 text-center">Notes Count</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-gray-500 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {denominations.map((d, i) => (
                    <tr key={d.value} className={cn(
                      "group transition-all duration-200",
                      d.notes > 0 ? "bg-blue-50/20 dark:bg-blue-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/20"
                    )}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3 text-gray-900 dark:text-white font-black text-lg">
                          <div className="h-10 w-16 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:scale-110 transition-transform">
                            {d.value}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3 print:hidden">
                          <button 
                            onClick={() => updateNotes(i, d.notes - 1)}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            value={d.notes || ''}
                            onChange={(e) => updateNotes(i, parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="w-24 rounded-xl border-gray-200 bg-gray-50 px-4 py-2.5 text-center font-bold text-lg focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white transition-all shadow-inner"
                          />
                          <button 
                            onClick={() => updateNotes(i, d.notes + 1)}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="hidden print:block text-center font-bold text-lg">{d.notes}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={cn(
                          "font-mono font-black text-xl transition-colors",
                          d.notes > 0 ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                        )}>
                          {formatIndianCurrency(d.notes * d.value, currency)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                Enter the count for each note or coin to calculate the total amount instantly.
              </p>
            </section>
          </div>
        </aside>
      </div>

      {/* SEO Content */}
      <section className="prose prose-blue dark:prose-invert max-w-none print:hidden">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How to Use the Cash Counting Calculator</h2>
        <p>This tool is designed for retail owners, bankers, and anyone who needs to count large amounts of cash quickly and accurately. Simply enter the number of pieces for each denomination.</p>
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
