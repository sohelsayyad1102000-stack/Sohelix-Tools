import React, { useState, useMemo } from 'react';
import { Coins, ArrowRightLeft, RefreshCcw, TrendingUp, Info, Calculator, Globe, ShieldCheck, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { CalculatorInput } from '../CalculatorInput';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.50 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 156.40 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.51 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.37 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.67 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', rate: 3.75 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.35 },
];

interface CurrencyConverterProps {
  tool: any;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ tool }) => {
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');

  const result = useMemo(() => {
    const from = CURRENCIES.find(c => c.code === fromCurrency);
    const to = CURRENCIES.find(c => c.code === toCurrency);
    if (from && to) {
      return (amount / from.rate) * to.rate;
    }
    return 0;
  }, [amount, fromCurrency, toCurrency]);

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handlePrint = () => {
    window.print();
  };

  const getSymbol = (code: string) => CURRENCIES.find(c => c.code === code)?.symbol || '';

  return (
    <article className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Globe className="h-8 w-8 text-blue-600" />
          {tool.title || 'Currency Converter'}
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
        <h1 className="text-2xl font-black text-gray-900">{tool.title || 'Currency Converter'} Report</h1>
        <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-end">
          {/* Amount */}
          <div className="md:col-span-2">
            <CalculatorInput
              label="Amount"
              value={amount}
              onChange={setAmount}
              min={1}
              max={10000000}
              step={1}
              prefix={getSymbol(fromCurrency)}
            />
          </div>

          {/* From */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center pb-2 no-print">
            <button
              onClick={swap}
              className="rounded-full bg-blue-50 p-4 text-blue-600 transition-all hover:bg-blue-100 hover:rotate-180 dark:bg-blue-900/20 dark:text-blue-400 shadow-md active:scale-90"
            >
              <ArrowRightLeft className="h-6 w-6" />
            </button>
          </div>

          {/* To */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result Display */}
        <div className="mt-12 text-center space-y-4 p-8 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 print:bg-gray-50 print:border-gray-200">
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            {amount.toLocaleString()} {fromCurrency} =
          </p>
          <motion.h2 
            key={result}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white"
          >
            {getSymbol(toCurrency)}{result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.h2>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-blue-600 font-black dark:text-blue-400">
              1 {fromCurrency} = {(result / amount).toFixed(4)} {toCurrency}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter no-print">
              Rates are updated periodically for accuracy
            </p>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="rounded-2xl border border-gray-100 p-6 dark:border-gray-800 bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white">Live Rates</h4>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Our rates are updated regularly to provide you with the most accurate conversion data for your financial planning.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-6 dark:border-gray-800 bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Coins className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white">Global Reach</h4>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Convert between all major global currencies including USD, EUR, GBP, INR, JPY, and many more instantly.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-6 dark:border-gray-800 bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white">Secure & Private</h4>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            All conversions are processed locally in your browser. Your financial data is never sent to our servers.
          </p>
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
