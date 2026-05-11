import React, { useState, useEffect, useMemo } from 'react';
import { Banknote, Plus, Minus, RefreshCcw, Download, Copy, Check, Calculator, Table, Info, PieChart as PieChartIcon, Printer, Languages, IndianRupee, DollarSign, Euro, PoundSterling } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { getCurrencySymbol, formatCurrency } from '../../lib/finance';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { convertNumberToIndianWords, convertNumberToInternationalWords } from '../../lib/numberToWords';

interface Denomination {
  value: number;
  notes: number;
}

interface CurrencyDenominationProps {
  tool: any;
}

const CURRENCY_PRESETS: Record<string, number[]> = {
  'INR': [500, 200, 100, 50, 20, 10, 5, 2, 1],
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

  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const amountInWords = useMemo(() => {
    if (totals.amount === 0) return '';
    if (currency === 'INR') return convertNumberToIndianWords(totals.amount);
    
    const currencyNames: Record<string, string> = {
      'USD': 'Dollars',
      'EUR': 'Euros',
      'GBP': 'Pounds'
    };
    return convertNumberToInternationalWords(totals.amount, currencyNames[currency] || 'Units');
  }, [totals.amount, currency]);

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
Amount in Words: ${amountInWords}
Total Notes: ${totals.notesCount}
Total Coins: ${totals.coinsCount}

Breakdown:
${breakdown}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 ring-1 ring-white/20">
              <Banknote className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                {tool.title || 'Cash Counter'}
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Professional currency denomination & tracking</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-transparent pl-4 pr-10 py-2.5 font-bold text-gray-900 dark:text-white outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors appearance-none relative"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m19 9-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
          >
            <option value="INR">INR (₹) Indian Rupee</option>
            <option value="USD">USD ($) US Dollar</option>
            <option value="EUR">EUR (€) Euro</option>
            <option value="GBP">GBP (£) British Pound</option>
          </select>
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-800" />
          <button 
            onClick={reset} 
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 transition-all active:scale-95"
          >
            <RefreshCcw className="h-4 w-4" />
            Clear
          </button>
        </div>
      </header>

      {/* Print-only Header */}
      <div className="hidden print:block text-center mb-10 pb-10 border-b-2 border-gray-100">
        <h1 className="text-4xl font-black mb-4 text-gray-900">{tool.title || 'Cash Denomination Report'}</h1>
        <div className="flex justify-center gap-8 text-sm text-gray-500 font-medium">
          <span>Date: {new Date().toLocaleDateString()}</span>
          <span>Time: {new Date().toLocaleTimeString()}</span>
          <span>Currency: {currency}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Input Section */}
        <section className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              Denominations Breakdown
            </h2>
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span className="hidden sm:block">Quantity</span>
              <span className="hidden sm:block text-right min-w-[100px]">Subtotal</span>
            </div>
          </div>

          <div className="space-y-3">
            {denominations.map((d, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                key={d.value} 
                className={cn(
                  "group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-[24px] border transition-all duration-300",
                  d.notes > 0 
                    ? "bg-blue-50/40 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800 shadow-sm" 
                    : "bg-white border-gray-100 dark:bg-gray-950 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-none"
                )}
              >
                {/* Visual indicator for focus/active */}
                {d.notes > 0 && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 dark:bg-blue-500" />
                )}

                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className={cn(
                    "h-12 w-20 flex items-center justify-center rounded-xl font-black text-xl transition-all duration-300",
                    d.notes > 0 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                  )}>
                    {d.value}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Note</p>
                    <p className="font-bold text-gray-900 dark:text-white capitalize">
                      {d.value >= 10 ? 'Banknote' : 'Coin'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-1 sm:justify-end items-center gap-6">
                  <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-2xl p-1.5 border border-gray-200 dark:border-gray-800 ring-offset-2 focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                    <button 
                      onClick={() => updateNotes(i, d.notes - 1)}
                      className="p-2.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 transition-all active:scale-90"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={d.notes || ''}
                      onChange={(e) => updateNotes(i, parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-20 sm:w-24 bg-transparent text-center font-black text-xl text-gray-900 dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700"
                    />
                    <button 
                      onClick={() => updateNotes(i, d.notes + 1)}
                      className="p-2.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 transition-all active:scale-90"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="min-w-[120px] text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5 sm:hidden">Amount</p>
                    <p className={cn(
                      "font-mono font-black text-xl transition-all duration-300",
                      d.notes > 0 ? "text-blue-600 dark:text-blue-400 scale-105" : "text-gray-300 dark:text-gray-700"
                    )}>
                      {formatIndianCurrency(d.notes * d.value, currency)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Premium Sticky Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-8 space-y-8">
          <section className="relative overflow-hidden rounded-[32px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl dark:shadow-none p-8 print:border-none print:shadow-none">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl" />

            <div className="relative space-y-8">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Summary</h2>
                </div>
                {totals.amount > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                  />
                )}
              </header>
              
              <div className="space-y-8">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Balance</p>
                  <div className="relative">
                    <motion.p 
                      key={totals.amount}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tighter"
                    >
                      {formatIndianCurrency(totals.amount, currency)}
                    </motion.p>
                  </div>
                </div>

                {amountInWords && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {currency === 'INR' ? <IndianRupee className="h-4 w-4 text-blue-600 dark:text-blue-400" /> : 
                       currency === 'USD' ? <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" /> :
                       currency === 'EUR' ? <Euro className="h-4 w-4 text-blue-600 dark:text-blue-400" /> :
                       currency === 'GBP' ? <PoundSterling className="h-4 w-4 text-blue-600 dark:text-blue-400" /> :
                       <Languages className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Total in Words</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                      {amountInWords}
                    </p>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 transition-colors">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Notes</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{totals.notesCount}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 transition-colors">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Coins</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{totals.coinsCount}</p>
                  </div>
                </div>

                {chartData.length > 0 && (
                  <div className="pt-8 border-t border-gray-100 dark:border-gray-800 print:hidden">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <PieChartIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Distribution</span>
                      </div>
                    </div>
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={8}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {chartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]} 
                                className="focus:outline-none"
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => formatIndianCurrency(value, currency)}
                            contentStyle={{ 
                              borderRadius: '24px', 
                              border: 'none', 
                              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                              padding: '12px 20px',
                              fontWeight: '900',
                              fontSize: '14px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-4 print:hidden">
                  <button
                    onClick={copyBreakdown}
                    disabled={totals.amount === 0}
                    className="relative group w-full overflow-hidden rounded-2xl bg-gray-900 dark:bg-white py-4 font-black text-white dark:text-gray-900 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center justify-center gap-2">
                      {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
                      {copied ? 'Copied to Clipboard' : 'Copy Breakdown'}
                    </span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={downloadCSV}
                      disabled={totals.amount === 0}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-800 py-3.5 font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                      <Download className="h-5 w-5" />
                      CSV
                    </button>
                    <button
                      onClick={() => window.print()}
                      disabled={totals.amount === 0}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-800 py-3.5 font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                      <Printer className="h-5 w-5" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100/50 dark:border-blue-900/50 print:hidden"
          >
            <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400 mb-4">
              <div className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm leading-none">
                <Info className="h-5 w-5" />
              </div>
              <span className="font-black uppercase tracking-widest text-xs">Security & Privacy</span>
            </div>
            <p className="text-sm text-blue-600/80 dark:text-blue-400/80 leading-relaxed font-medium">
              We never store your cash data. All calculations happen instantly on your device and are cleared as soon as you refresh or reset.
            </p>
          </motion.section>
        </aside>
      </div>

      {/* Modern Content Section */}
      <section className="mt-12 space-y-16 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white text-lg">1</span>
              Why use Sohelix Cash Counter?
            </h2>
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Error Prevention</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Avoid mathematical errors during manual cash counting. Our system provides instant verification.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Professional Records</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Export your count to PDF or CSV to keep structured records for bank deposits or audits.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white text-lg">2</span>
              Key Features
            </h2>
            <ul className="space-y-4">
              {[
                "Multi-currency support (INR, USD, EUR, GBP)",
                "Real-time denomination breakdown",
                "Visual distribution pie chart",
                "Sticky summary for large lists",
                "Mobile-optimized touch controls",
                "Privacy-focused offline counting"
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-600 dark:text-gray-300 font-medium bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        {tool.faqs && tool.faqs.length > 0 && (
          <div className="space-y-8 pt-16 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Need Help?</h2>
              <p className="text-gray-500 dark:text-gray-400">Frequently asked questions about our cash counter</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tool.faqs.map((faq: any, index: number) => (
                <motion.article 
                  whileHover={{ y: -5 }}
                  key={index} 
                  className="p-8 rounded-3xl bg-white border border-gray-100 dark:bg-gray-950 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="font-black text-gray-900 dark:text-white mb-3 text-lg leading-tight">{faq.question}</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
                </motion.article>
              ))}
            </div>
          </div>
        )}
      </section>
    </article>
  );
};

