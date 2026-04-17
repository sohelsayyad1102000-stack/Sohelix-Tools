import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, PieChart as PieIcon, Info, Download, RefreshCcw, Calendar, Copy, Check, Table, RotateCcw, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn, downloadCSV } from '../../lib/utils';
import { CalculatorInput } from '../CalculatorInput';
import { getCurrencySymbol, formatCurrency } from '../../lib/finance';
import { ClientOnly } from '../ClientOnly';

interface InterestCalculatorProps {
  tool: any;
}

export const InterestCalculator: React.FC<InterestCalculatorProps> = ({ tool }) => {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(8);
  const [time, setTime] = useState(5);
  const [frequency, setFrequency] = useState(12); // Monthly by default
  const [currency, setCurrency] = useState('INR');
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const P = Number(principal);
    const R = Number(rate);
    const T = Number(time);
    const n = Number(frequency);

    const si = (P * R * T) / 100;
    const r = R / 100;
    const amount = P * Math.pow((1 + r / n), (n * T));
    const ci = amount - P;

    const yearlyData = [];
    for (let year = 1; year <= T; year++) {
      const yearSimple = P + (P * R * year) / 100;
      const yearCompound = P * Math.pow((1 + r / n), (n * year));
      yearlyData.push({
        year: year,
        simple: Math.round(yearSimple),
        compound: Math.round(yearCompound),
        simpleInterest: Math.round(yearSimple - P),
        compoundInterest: Math.round(yearCompound - P)
      });
    }

    return {
      simpleInterest: Math.round(si),
      compoundInterest: Math.round(ci),
      totalSimple: Math.round(P + si),
      totalCompound: Math.round(amount),
      yearlyData
    };
  }, [principal, rate, time, frequency]);

  const pieData = [
    { name: 'Principal Amount', value: principal },
    { name: 'Compound Interest', value: results.compoundInterest }
  ];

  const COLORS = ['#3B82F6', '#10B981'];

  const handleExportCSV = () => {
    const data = results.yearlyData.map(row => ({
      Year: row.year,
      'Simple Interest Value': row.simple,
      'Compound Interest Value': row.compound,
      'Simple Interest Earned': row.simpleInterest,
      'Compound Interest Earned': row.compoundInterest
    }));
    downloadCSV(data, `interest_calculation_${time}y.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `Interest Calculation Results (${currency}):
Principal: ${formatCurrency(principal, currency)}
Compound Interest: ${formatCurrency(results.compoundInterest, currency)}
Total Compound Amount: ${formatCurrency(results.totalCompound, currency)}
Simple Interest: ${formatCurrency(results.simpleInterest, currency)}
Total Simple Amount: ${formatCurrency(results.totalSimple, currency)}
Rate: ${rate}% for ${time} years`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Calculator className="h-8 w-8 text-blue-600" />
          {tool.title || 'Interest Calculator'}
        </h1>
        <div className="flex items-center gap-3">
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-xl border-gray-200 bg-white px-4 py-2 font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
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
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-black text-gray-900">{tool.title || 'Interest Calculator'} Report</h1>
        <ClientOnly>
          <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
        </ClientOnly>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inputs Section */}
        <section className="lg:col-span-1 space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-blue-600 no-print" />
            Investment Details
          </h2>

          <div className="space-y-6">
            <CalculatorInput
              label="Principal Amount"
              value={principal}
              onChange={setPrincipal}
              min={1000}
              max={10000000}
              step={1000}
              prefix={getCurrencySymbol(currency)}
            />

            <CalculatorInput
              label="Annual Interest Rate"
              value={rate}
              onChange={setRate}
              min={1}
              max={50}
              step={0.1}
              suffix="%"
            />

            <CalculatorInput
              label="Time Period (Years)"
              value={time}
              onChange={setTime}
              min={1}
              max={50}
              step={1}
              suffix="y"
            />

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 text-blue-600 no-print" />
                Compounding Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full rounded-xl border-gray-200 bg-gray-50 py-2 px-4 font-bold text-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400"
              >
                <option value={1}>Annually</option>
                <option value={4}>Quarterly</option>
                <option value={12}>Monthly</option>
                <option value={365}>Daily</option>
              </select>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 print:bg-blue-50 print:border-blue-200">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">Compound Interest Result</p>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(results.totalCompound, currency)}</h2>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Interest Earned</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(results.compoundInterest, currency)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600/20 no-print" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 print:bg-gray-50 print:border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Simple Interest Result</p>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(results.totalSimple, currency)}</h2>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Interest Earned</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(results.simpleInterest, currency)}</p>
                  </div>
                  <Calculator className="h-8 w-8 text-gray-400/20 no-print" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900 h-[350px] print:shadow-none print:border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Compound Growth Breakdown</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900 h-[350px] print:shadow-none print:border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Growth Projection</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.yearlyData}>
                  <defs>
                    <linearGradient id="colorCompound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `${getCurrencySymbol(currency)}${(value / 100000).toFixed(1)}L`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  <Legend />
                  <Area type="monotone" dataKey="compound" name="Compound" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCompound)" />
                  <Area type="monotone" dataKey="simple" name="Simple" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>

      {/* Yearly Breakdown Table Section */}
      <section className="rounded-3xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-gray-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Table className="h-5 w-5 text-blue-600 no-print" />
            Yearly Growth Breakdown
          </h2>
          <button 
            onClick={handleExportCSV}
            className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-2 no-print"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Year</th>
                <th className="px-6 py-4">Simple Value</th>
                <th className="px-6 py-4">Compound Value</th>
                <th className="px-6 py-4">Compound Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {results.yearlyData.map((data) => (
                <tr key={data.year} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">Year {data.year}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatCurrency(data.simple, currency)}</td>
                  <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{formatCurrency(data.compound, currency)}</td>
                  <td className="px-6 py-4 text-green-600 dark:text-green-400">{formatCurrency(data.compoundInterest, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
