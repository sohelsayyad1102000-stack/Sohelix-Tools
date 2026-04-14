import React, { useState, useMemo } from 'react';
import { Activity, RefreshCcw, TrendingUp, Info, DollarSign, Calendar, Calculator, ArrowRight, TrendingDown, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '../../lib/utils';
import { CalculatorInput } from '../CalculatorInput';
import { getCurrencySymbol, formatCurrency } from '../../lib/finance';

interface InflationCalculatorProps {
  tool: any;
}

export const InflationCalculator: React.FC<InflationCalculatorProps> = ({ tool }) => {
  const [amount, setAmount] = useState(100000);
  const [years, setYears] = useState(10);
  const [inflationRate, setInflationRate] = useState(6);
  const [currency, setCurrency] = useState('INR');

  const results = useMemo(() => {
    const futureValue = amount * Math.pow(1 + inflationRate / 100, years);
    const purchasingPower = amount / Math.pow(1 + inflationRate / 100, years);
    
    const chartData = [];
    for (let i = 0; i <= years; i++) {
      chartData.push({
        year: `Year ${i}`,
        futureCost: Math.round(amount * Math.pow(1 + inflationRate / 100, i)),
        purchasingPower: Math.round(amount / Math.pow(1 + inflationRate / 100, i))
      });
    }

    return {
      futureValue: Math.round(futureValue),
      purchasingPower: Math.round(purchasingPower),
      totalIncrease: Math.round(futureValue - amount),
      chartData
    };
  }, [amount, years, inflationRate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <article className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Activity className="h-8 w-8 text-blue-600" />
          {tool.title || 'Inflation Calculator'}
        </h1>
        <div className="flex items-center gap-3">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-none shadow-sm"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-black text-gray-900">{tool.title || 'Inflation Calculator'} Report</h1>
        <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inputs */}
        <section className="lg:col-span-1 space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600 no-print" />
            Parameters
          </h2>

          <div className="space-y-6">
            <CalculatorInput
              label="Initial Amount"
              value={amount}
              onChange={setAmount}
              min={100}
              max={100000000}
              step={100}
              prefix={getCurrencySymbol(currency)}
            />

            <CalculatorInput
              label="Time Period"
              value={years}
              onChange={setYears}
              min={1}
              max={50}
              step={1}
              suffix="Years"
            />

            <CalculatorInput
              label="Avg. Inflation Rate"
              value={inflationRate}
              onChange={setInflationRate}
              min={0.1}
              max={50}
              step={0.1}
              suffix="%"
            />
          </div>
        </section>

        {/* Results */}
        <section className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-8 dark:border-blue-900/30 dark:bg-blue-900/10 relative overflow-hidden print:bg-blue-50 print:border-blue-200">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">Future Cost</p>
              <p className="text-4xl font-black text-blue-600 dark:text-blue-400">
                {formatCurrency(results.futureValue, currency)}
              </p>
              <p className="text-xs text-blue-500/80 mt-4 leading-relaxed font-medium">
                What costs {formatCurrency(amount, currency)} today will cost this much in {years} years.
              </p>
              <TrendingUp className="absolute -right-4 -bottom-4 h-24 w-24 text-blue-600/10 no-print" />
            </div>
            <div className="rounded-3xl border border-red-100 bg-red-50/50 p-8 dark:border-red-900/30 dark:bg-red-900/10 relative overflow-hidden print:bg-red-50 print:border-red-200">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 mb-4">Purchasing Power</p>
              <p className="text-4xl font-black text-red-600 dark:text-red-400">
                {formatCurrency(results.purchasingPower, currency)}
              </p>
              <p className="text-xs text-red-500/80 mt-4 leading-relaxed font-medium">
                Today's {formatCurrency(amount, currency)} will be worth this much in {years} years.
              </p>
              <TrendingDown className="absolute -right-4 -bottom-4 h-24 w-24 text-red-600/10 no-print" />
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900 h-[450px] shadow-xl print:shadow-none print:border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Inflation Impact Projection</h4>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={results.chartData}>
                <defs>
                  <linearGradient id="colorFuture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
                  tickFormatter={(value) => `${getCurrencySymbol(currency)}${value.toLocaleString()}`} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => `${getCurrencySymbol(currency)}${value.toLocaleString()}`} 
                />
                <Legend iconType="circle" />
                <Area name="Future Cost" type="monotone" dataKey="futureCost" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorFuture)" />
                <Area name="Purchasing Power" type="monotone" dataKey="purchasingPower" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorPower)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Educational Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
        <div className="rounded-3xl border border-gray-100 p-8 dark:border-gray-800 bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <span className="no-print"><Info className="h-5 w-5 text-blue-600" /></span>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white">Why Inflation Matters?</h4>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Inflation reduces the "purchasing power" of your money over time. This means that as prices for goods and services rise, each unit of currency buys fewer goods and services than it did before. For long-term financial planning, especially retirement, accounting for inflation is crucial.
          </p>
        </div>
        <div className="rounded-3xl border border-gray-100 p-8 dark:border-gray-800 bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <span className="no-print"><TrendingUp className="h-5 w-5 text-amber-600" /></span>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white">The Rule of 72</h4>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            A quick way to estimate how long it takes for prices to double due to inflation is the Rule of 72. Divide 72 by the annual inflation rate. For example, at 6% inflation, prices will roughly double every 12 years (72 / 6 = 12).
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
