import React, { useState, useMemo } from 'react';
import { TrendingUp, PieChart as PieIcon, Info, RefreshCcw, Download, Calendar, Copy, Check, Table, Calculator, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn, downloadCSV } from '../../lib/utils';
import { CalculatorInput } from '../CalculatorInput';
import { getCurrencySymbol, formatCurrency } from '../../lib/finance';

interface SIPCalculatorProps {
  tool: any;
}

export const SIPCalculator: React.FC<SIPCalculatorProps> = ({ tool }) => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);
  const [stepUp, setStepUp] = useState(0); // Annual step up percentage
  const [inflation, setInflation] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [copied, setCopied] = useState(false);

  const handleExportCSV = () => {
    const data = results.yearlyData.map(row => ({
      Year: row.year,
      'Invested Amount': row.invested,
      'Estimated Returns': row.returns,
      'Total Value': row.value
    }));
    downloadCSV(data, `sip_calculation_${timePeriod}y.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `SIP Calculation Results (${currency}):
Total Invested: ${formatCurrency(results.totalInvested, currency)}
Estimated Returns: ${formatCurrency(results.estimatedReturns, currency)}
Total Value: ${formatCurrency(results.totalValue, currency)}
Inflation Adjusted Value: ${formatCurrency(results.inflationAdjustedValue, currency)}
Period: ${timePeriod} years at ${expectedReturn}% return`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const results = useMemo(() => {
    let totalInvested = 0;
    let currentValue = 0;
    const monthlyRate = expectedReturn / 12 / 100;
    const months = timePeriod * 12;
    const yearlyData = [];

    let currentMonthly = monthlyInvestment;

    for (let m = 1; m <= months; m++) {
      totalInvested += currentMonthly;
      currentValue = (currentValue + currentMonthly) * (1 + monthlyRate);

      if (m % 12 === 0) {
        yearlyData.push({
          year: m / 12,
          invested: Math.round(totalInvested),
          value: Math.round(currentValue),
          returns: Math.round(currentValue - totalInvested)
        });
        // Apply annual step up
        currentMonthly = currentMonthly * (1 + stepUp / 100);
      }
    }

    const inflationAdjustedValue = currentValue / Math.pow(1 + (inflation / 100), timePeriod);

    return {
      totalInvested: Math.round(totalInvested),
      estimatedReturns: Math.round(currentValue - totalInvested),
      totalValue: Math.round(currentValue),
      inflationAdjustedValue: Math.round(inflationAdjustedValue),
      yearlyData
    };
  }, [monthlyInvestment, expectedReturn, timePeriod, stepUp, inflation]);

  const pieData = [
    { name: 'Invested Amount', value: results.totalInvested },
    { name: 'Estimated Returns', value: results.estimatedReturns }
  ];

  const COLORS = ['#3B82F6', '#10B981'];

  return (
    <article className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Calculator className="h-8 w-8 text-blue-600" />
          {tool.title || 'SIP Calculator'}
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
        <h1 className="text-2xl font-black text-gray-900">{tool.title || 'SIP Calculator'} Report</h1>
        <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inputs Section */}
        <section className="lg:col-span-1 space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <RefreshCcw className="h-5 w-5 text-blue-600 no-print" />
            Investment Parameters
          </h2>
          
          <div className="space-y-6">
            <CalculatorInput
              label="Monthly Investment"
              value={monthlyInvestment}
              onChange={setMonthlyInvestment}
              min={500}
              max={1000000}
              step={500}
              prefix={getCurrencySymbol(currency)}
            />

            <CalculatorInput
              label="Expected Return (p.a)"
              value={expectedReturn}
              onChange={setExpectedReturn}
              min={1}
              max={30}
              step={0.1}
              suffix="%"
            />

            <CalculatorInput
              label="Time Period (Years)"
              value={timePeriod}
              onChange={setTimePeriod}
              min={1}
              max={40}
              step={1}
              suffix="y"
            />

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-6">
              <CalculatorInput
                label="Annual Step-up"
                value={stepUp}
                onChange={setStepUp}
                min={0}
                max={50}
                step={1}
                suffix="%"
              />
              
              <CalculatorInput
                label="Inflation Rate"
                value={inflation}
                onChange={setInflation}
                min={0}
                max={20}
                step={0.1}
                suffix="%"
              />
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="lg:col-span-2 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 print:border-gray-200">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Invested Amount</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(results.totalInvested, currency)}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 print:border-gray-200">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Estimated Returns</p>
              <p className="text-2xl font-black text-green-600 dark:text-green-400">{formatCurrency(results.estimatedReturns, currency)}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10 print:bg-blue-50 print:border-blue-200">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Total Value</p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(results.totalValue, currency)}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900 h-[350px] print:shadow-none print:border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Investment Breakdown</h3>
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
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                  <YAxis tickFormatter={(value) => `${getCurrencySymbol(currency)}${(value / 100000).toFixed(1)}L`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  <Area type="monotone" dataKey="value" stroke="#3B82F6" fillOpacity={1} fill="url(#colorValue)" />
                  <Area type="monotone" dataKey="invested" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inflation Note */}
          {inflation > 0 && (
            <div className="rounded-2xl bg-amber-50 p-6 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex gap-4 print:bg-amber-50 print:border-amber-200">
              <Info className="h-6 w-6 text-amber-600 shrink-0 no-print" />
              <div>
                <h4 className="font-bold text-amber-900 dark:text-amber-300">Inflation Adjusted Value</h4>
                <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">
                  Due to {inflation}% inflation, your {formatCurrency(results.totalValue, currency)} will have the purchasing power of 
                  <span className="font-bold ml-1">{formatCurrency(results.inflationAdjustedValue, currency)}</span> in today's money.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Yearly Breakdown Table Section */}
      <section className="rounded-3xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-900 print:border-gray-200">
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
                <th className="px-6 py-4">Invested Amount</th>
                <th className="px-6 py-4">Estimated Returns</th>
                <th className="px-6 py-4">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {results.yearlyData.map((data) => (
                <tr key={data.year} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">Year {data.year}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatCurrency(data.invested, currency)}</td>
                  <td className="px-6 py-4 text-green-600 dark:text-green-400">{formatCurrency(data.returns, currency)}</td>
                  <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{formatCurrency(data.value, currency)}</td>
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
