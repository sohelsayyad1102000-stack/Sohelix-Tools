import React, { useState, useMemo } from 'react';
import { Banknote, RefreshCcw, Copy, Check, Printer, FileDown, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'motion/react';
import { cn, downloadCSV } from '../../lib/utils';
import { ClientOnly } from '../ClientOnly';

interface CurrencyDenominationProps {
  tool: any;
}

interface DenomRow {
  value: number;
  label: string;
  isNote: boolean;
  bundles: number;
  loose: number;
}

const INITIAL_DENOMS: DenomRow[] = [
  { value: 500, label: '₹500', isNote: true,  bundles: 0, loose: 0 },
  { value: 200, label: '₹200', isNote: true,  bundles: 0, loose: 0 },
  { value: 100, label: '₹100', isNote: true,  bundles: 0, loose: 0 },
  { value: 50,  label: '₹50',  isNote: true,  bundles: 0, loose: 0 },
  { value: 20,  label: '₹20',  isNote: true,  bundles: 0, loose: 0 },
  { value: 10,  label: '₹10',  isNote: true,  bundles: 0, loose: 0 },
  { value: 5,   label: '₹5',   isNote: false, bundles: 0, loose: 0 },
  { value: 2,   label: '₹2',   isNote: false, bundles: 0, loose: 0 },
  { value: 1,   label: '₹1',   isNote: false, bundles: 0, loose: 0 },
];

const CHART_COLORS = [
  '#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#6366F1', '#14B8A6',
];

function formatIndian(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigitWords(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
}

function numberToWords(total: number): string {
  if (total === 0) return 'Zero Rupees Only';
  let n = Math.floor(total);
  const parts: string[] = [];

  const crore = Math.floor(n / 10_000_000);
  n %= 10_000_000;
  const lakh = Math.floor(n / 100_000);
  n %= 100_000;
  const thousand = Math.floor(n / 1_000);
  n %= 1_000;
  const hundred = Math.floor(n / 100);
  n %= 100;

  if (crore)   parts.push(twoDigitWords(crore) + ' Crore');
  if (lakh)    parts.push(twoDigitWords(lakh) + ' Lakh');
  if (thousand) parts.push(twoDigitWords(thousand) + ' Thousand');
  if (hundred)  parts.push(ONES[hundred] + ' Hundred');
  if (n)        parts.push(twoDigitWords(n));

  return parts.join(' ') + ' Rupees Only';
}

export const CurrencyDenomination: React.FC<CurrencyDenominationProps> = ({ tool }) => {
  const [rows, setRows] = useState<DenomRow[]>(INITIAL_DENOMS);
  const [copied, setCopied] = useState(false);

  const update = (index: number, field: 'bundles' | 'loose', raw: string) => {
    const val = Math.max(0, parseInt(raw) || 0);
    setRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: val } : r));
  };

  const reset = () => setRows(INITIAL_DENOMS.map(r => ({ ...r, bundles: 0, loose: 0 })));

  const calc = useMemo(() => {
    const withSubtotal = rows.map(r => ({
      ...r,
      count: r.bundles * 100 + r.loose,
      subtotal: (r.bundles * 100 + r.loose) * r.value,
    }));

    const totalNotes  = withSubtotal.filter(r => r.isNote).reduce((a, r) => a + r.count, 0);
    const totalCoins  = withSubtotal.filter(r => !r.isNote).reduce((a, r) => a + r.count, 0);
    const totalAmount = withSubtotal.reduce((a, r) => a + r.subtotal, 0);

    const pieData = withSubtotal
      .filter(r => r.subtotal > 0)
      .map(r => ({ name: r.label, value: r.subtotal }));

    return { withSubtotal, totalNotes, totalCoins, totalAmount, pieData };
  }, [rows]);

  const handleCopy = () => {
    const lines = calc.withSubtotal
      .filter(r => r.subtotal > 0)
      .map(r => `${r.label.padEnd(5)}  Bundles: ${r.bundles}  Loose: ${r.loose}  Subtotal: ${formatIndian(r.subtotal)}`);

    const text = [
      'Currency Denomination Breakdown',
      '================================',
      ...lines,
      '--------------------------------',
      `Total Notes (₹10+): ${calc.totalNotes}`,
      `Total Coins (₹5-):  ${calc.totalCoins}`,
      `Total Amount:       ${formatIndian(calc.totalAmount)}`,
      `In Words:           ${numberToWords(calc.totalAmount)}`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCSV = () => {
    const data = calc.withSubtotal.map(r => ({
      Denomination: r.label,
      'Bundles (×100)': r.bundles,
      Loose: r.loose,
      'Total Count': r.count,
      'Subtotal (₹)': r.subtotal,
    }));
    data.push({
      Denomination: 'TOTAL',
      'Bundles (×100)': '' as any,
      Loose: '' as any,
      'Total Count': calc.totalNotes + calc.totalCoins,
      'Subtotal (₹)': calc.totalAmount,
    });
    downloadCSV(data, 'currency_denomination.csv');
  };

  const handlePrint = () => window.print();

  return (
    <article className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Banknote className="h-8 w-8 text-blue-600" />
          {tool.title || 'Currency Denomination Calculator'}
        </h1>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 transition-colors self-start sm:self-auto"
        >
          <RefreshCcw className="h-4 w-4" />
          Reset
        </button>
      </header>

      {/* Print-only header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold">Currency Denomination Breakdown</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* === LEFT: Table === */}
        <section className="xl:col-span-2 space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-bold text-gray-600 dark:text-gray-300 w-24">Denomination</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-600 dark:text-gray-300">
                    Bundles <span className="text-xs font-normal text-gray-400">(×100)</span>
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-gray-600 dark:text-gray-300">Loose</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {/* Notes section */}
                <tr>
                  <td colSpan={4} className="px-4 py-2 bg-blue-50/60 dark:bg-blue-900/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Notes</span>
                  </td>
                </tr>
                {rows.map((row, i) => {
                  if (!row.isNote) return null;
                  const sub = calc.withSubtotal[i].subtotal;
                  return (
                    <tr key={row.value} className={cn('transition-colors', sub > 0 && 'bg-blue-50/30 dark:bg-blue-900/5')}>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 px-3 py-1 font-black text-blue-700 dark:text-blue-300 text-sm min-w-[52px]">
                          {row.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          value={row.bundles || ''}
                          onChange={e => update(i, 'bundles', e.target.value)}
                          placeholder="0"
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-center font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none no-print"
                        />
                        <span className="hidden print:block text-center font-bold">{row.bundles}</span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          value={row.loose || ''}
                          onChange={e => update(i, 'loose', e.target.value)}
                          placeholder="0"
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-center font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none no-print"
                        />
                        <span className="hidden print:block text-center font-bold">{row.loose}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                        {sub > 0 ? formatIndian(sub) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>
                    </tr>
                  );
                })}

                {/* Coins section */}
                <tr>
                  <td colSpan={4} className="px-4 py-2 bg-amber-50/60 dark:bg-amber-900/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Coins</span>
                  </td>
                </tr>
                {rows.map((row, i) => {
                  if (row.isNote) return null;
                  const sub = calc.withSubtotal[i].subtotal;
                  return (
                    <tr key={row.value} className={cn('transition-colors', sub > 0 && 'bg-amber-50/30 dark:bg-amber-900/5')}>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 px-3 py-1 font-black text-amber-700 dark:text-amber-300 text-sm min-w-[52px]">
                          {row.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          value={row.bundles || ''}
                          onChange={e => update(i, 'bundles', e.target.value)}
                          placeholder="0"
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-center font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none no-print"
                        />
                        <span className="hidden print:block text-center font-bold">{row.bundles}</span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          value={row.loose || ''}
                          onChange={e => update(i, 'loose', e.target.value)}
                          placeholder="0"
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-center font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none no-print"
                        />
                        <span className="hidden print:block text-center font-bold">{row.loose}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                        {sub > 0 ? formatIndian(sub) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Amount in Words */}
          <motion.div
            layout
            className="rounded-2xl border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/10 p-5"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400 mb-1">Amount in Words</p>
            <p className="text-base font-bold text-green-900 dark:text-green-300 leading-relaxed">
              {numberToWords(calc.totalAmount)}
            </p>
          </motion.div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-3 no-print">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-gray-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-black dark:hover:bg-gray-600 transition-colors active:scale-95"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:scale-95"
            >
              <Printer className="h-4 w-4" />
              Print / PDF
            </button>
            <button
              onClick={handleCSV}
              className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:scale-95"
            >
              <FileDown className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </section>

        {/* === RIGHT: Summary + Chart === */}
        <aside className="space-y-6">
          <div className="sticky top-8 space-y-6">
            {/* Summary card */}
            <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Summary</h2>

              <div className="space-y-4">
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                  <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                    {formatIndian(calc.totalAmount)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Notes (₹10+)</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{calc.totalNotes.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Coins (₹5−)</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{calc.totalCoins.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Pie Chart */}
            <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg no-print">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-blue-600" />
                Distribution
              </h2>
              {calc.pieData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-600 text-sm">
                  <PieChartIcon className="h-10 w-10 mb-2 opacity-30" />
                  Enter counts above to see chart
                </div>
              ) : (
                <ClientOnly>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={calc.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {calc.pieData.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [formatIndian(value), 'Amount']}
                        contentStyle={{
                          borderRadius: '0.75rem',
                          border: 'none',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(val) => <span className="text-xs text-gray-600 dark:text-gray-400">{val}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ClientOnly>
              )}
            </section>
          </div>
        </aside>
      </div>

      {/* FAQ Section */}
      {tool.faqs && tool.faqs.length > 0 && (
        <section className="space-y-6 no-print">
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
