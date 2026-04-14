import React, { useState, useMemo } from 'react';
import { Percent, RefreshCcw, Copy, Check, Calculator, Info, TrendingUp, TrendingDown, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { CalculatorInput } from '../CalculatorInput';

interface PercentageCalculatorProps {
  tool: any;
}

export const PercentageCalculator: React.FC<PercentageCalculatorProps> = ({ tool }) => {
  // Scenario 1: What is X% of Y?
  const [s1X, setS1X] = useState<number>(10);
  const [s1Y, setS1Y] = useState<number>(100);

  // Scenario 2: X is what % of Y?
  const [s2X, setS2X] = useState<number>(20);
  const [s2Y, setS2Y] = useState<number>(200);

  // Scenario 3: % increase/decrease from X to Y
  const [s3X, setS3X] = useState<number>(100);
  const [s3Y, setS3Y] = useState<number>(150);

  const [copied, setCopied] = useState<string | null>(null);

  const s1Result = useMemo(() => (s1X / 100) * s1Y, [s1X, s1Y]);
  const s2Result = useMemo(() => (s2X / s2Y) * 100, [s2X, s2Y]);
  const s3Result = useMemo(() => ((s3Y - s3X) / s3X) * 100, [s3X, s3Y]);

  const copy = (val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <article className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Percent className="h-8 w-8 text-blue-600" />
          {tool.title || 'Percentage Calculator'}
        </h1>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
      </header>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-black text-gray-900">{tool.title || 'Percentage Calculator'} Report</h1>
        <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Scenario 1 */}
        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600 no-print" />
            What is X% of Y?
          </h2>
          <div className="space-y-6">
            <CalculatorInput
              label="X (%)"
              value={s1X}
              onChange={setS1X}
              min={0}
              max={1000}
              step={0.1}
              suffix="%"
            />
            <CalculatorInput
              label="Y (Value)"
              value={s1Y}
              onChange={setS1Y}
              min={0}
              max={100000000}
              step={1}
            />
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Result</p>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 print:bg-blue-50 print:border-blue-200">
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{s1Result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <button 
                  onClick={() => copy(s1Result.toString(), 's1')} 
                  className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors text-gray-400 hover:text-blue-600 no-print"
                >
                  {copied === 's1' ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Scenario 2 */}
        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600 no-print" />
            X is what % of Y?
          </h2>
          <div className="space-y-6">
            <CalculatorInput
              label="X (Value)"
              value={s2X}
              onChange={setS2X}
              min={0}
              max={100000000}
              step={1}
            />
            <CalculatorInput
              label="Y (Total)"
              value={s2Y}
              onChange={setS2Y}
              min={1}
              max={100000000}
              step={1}
            />
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Result</p>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 print:bg-blue-50 print:border-blue-200">
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{s2Result.toFixed(2)}%</p>
                <button 
                  onClick={() => copy(s2Result.toFixed(2) + '%', 's2')} 
                  className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors text-gray-400 hover:text-blue-600 no-print"
                >
                  {copied === 's2' ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Scenario 3 */}
        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900 md:col-span-2 print:shadow-none print:border-none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600 no-print" />
            Percentage Increase/Decrease
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="space-y-6">
              <CalculatorInput
                label="Original Value (X)"
                value={s3X}
                onChange={setS3X}
                min={1}
                max={100000000}
                step={1}
              />
              <CalculatorInput
                label="New Value (Y)"
                value={s3Y}
                onChange={setS3Y}
                min={0}
                max={100000000}
                step={1}
              />
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className={cn(
                "flex h-32 w-32 items-center justify-center rounded-full border-8 font-black text-2xl shadow-xl transition-all",
                s3Result >= 0 
                  ? "border-green-100 bg-green-50 text-green-600 dark:border-green-900/30 dark:bg-green-900/20 print:border-green-200 print:bg-green-50" 
                  : "border-red-100 bg-red-50 text-red-600 dark:border-red-900/30 dark:bg-red-900/20 print:border-red-200 print:bg-red-50"
              )}>
                {s3Result >= 0 ? '+' : ''}{s3Result.toFixed(1)}%
              </div>
              <div className="flex items-center gap-2">
                {s3Result >= 0 ? <TrendingUp className="h-5 w-5 text-green-600 no-print" /> : <TrendingDown className="h-5 w-5 text-red-600 no-print" />}
                <span className={cn("font-bold", s3Result >= 0 ? "text-green-600" : "text-red-600")}>
                  {s3Result >= 0 ? 'Growth' : 'Decline'}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 print:bg-gray-50 print:border-gray-200">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Analysis</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {s3Result >= 0 ? 'Increase' : 'Decrease'} of {Math.abs(s3Result).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                The value {s3Result >= 0 ? 'grew' : 'fell'} by <span className="font-bold text-gray-900 dark:text-white">{(s3Y - s3X).toLocaleString()}</span> units.
              </p>
              <button 
                onClick={() => copy(`${s3Result.toFixed(2)}%`, 's3')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm no-print"
              >
                {copied === 's3' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                Copy Result
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Formula Guide */}
      <section className="rounded-3xl bg-gray-50 p-8 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 no-print">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Percentage Formulas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Percentage of Value</p>
            <p className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">(X / 100) × Y</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Percentage of Total</p>
            <p className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">(X / Y) × 100</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Percentage Change</p>
            <p className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">((New - Old) / Old) × 100</p>
          </div>
        </div>
      </section>

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
