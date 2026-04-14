import React, { useState, useMemo } from 'react';
import { Home, Car, Calculator, Info, Download, RefreshCcw, Calendar, TrendingDown, Copy, Check, Table, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn, downloadCSV } from '../../lib/utils';
import { CalculatorInput } from '../CalculatorInput';
import { getCurrencySymbol, formatCurrency } from '../../lib/finance';

interface AdvancedLoanCalculatorProps {
  tool: any;
}

export const AdvancedLoanCalculator: React.FC<AdvancedLoanCalculatorProps> = ({ tool }) => {
  const [loanType, setLoanType] = useState<'home' | 'car' | 'personal'>('home');
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
  const [currency, setCurrency] = useState('INR');
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const p = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenureUnit === 'years' ? loanTenure * 12 : loanTenure;

    if (r === 0) {
      const emi = p / n;
      return {
        emi: Math.round(emi),
        totalInterest: 0,
        totalPayment: p,
        interestPercentage: "0.0",
        schedule: []
      };
    }

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;

    const schedule = [];
    let balance = p;
    for (let i = 1; i <= n; i++) {
      const interest = balance * r;
      const principal = emi - interest;
      balance -= principal;
      if (i % 12 === 0 || i === n) {
        schedule.push({
          period: i / 12,
          principal: Math.round(principal * 12),
          interest: Math.round(interest * 12),
          balance: Math.max(0, Math.round(balance))
        });
      }
    }

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      interestPercentage: ((totalInterest / totalPayment) * 100).toFixed(1),
      schedule
    };
  }, [loanAmount, interestRate, loanTenure, tenureUnit]);

  const pieData = [
    { name: 'Principal Amount', value: loanAmount },
    { name: 'Total Interest', value: results.totalInterest }
  ];

  const COLORS = ['#3B82F6', '#EF4444'];

  const handleExportCSV = () => {
    const data = results.schedule.map(row => ({
      Year: row.period,
      'Principal Paid': row.principal,
      'Interest Paid': row.interest,
      'Remaining Balance': row.balance
    }));
    downloadCSV(data, `loan_amortization_${loanTenure}${tenureUnit[0]}.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `Loan Calculation Results (${currency}):
Monthly EMI: ${formatCurrency(results.emi, currency)}
Total Interest: ${formatCurrency(results.totalInterest, currency)}
Total Payment: ${formatCurrency(results.totalPayment, currency)}
Loan Amount: ${formatCurrency(loanAmount, currency)} at ${interestRate}% for ${loanTenure} ${tenureUnit}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Calculator className="h-8 w-8 text-blue-600" />
          {tool.title || 'Advanced Loan Calculator'}
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
        <h1 className="text-2xl font-black text-gray-900">{tool.title || 'Loan Calculator'} Report</h1>
        <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Loan Type Tabs */}
      <nav className="flex justify-center no-print">
        <div className="inline-flex rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">
          {[
            { id: 'home', label: 'Home Loan', icon: Home },
            { id: 'car', label: 'Car Loan', icon: Car },
            { id: 'personal', label: 'Personal Loan', icon: Calculator }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setLoanType(type.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
                loanType === type.id ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <type.icon className="h-4 w-4" />
              {type.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inputs Section */}
        <section className="lg:col-span-1 space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Info className="h-5 w-5 text-blue-600 no-print" />
            Loan Details
          </h2>

          <div className="space-y-6">
            <CalculatorInput
              label="Loan Amount"
              value={loanAmount}
              onChange={setLoanAmount}
              min={loanType === 'home' ? 1000000 : 100000}
              max={loanType === 'home' ? 100000000 : 10000000}
              step={loanType === 'home' ? 100000 : 50000}
              prefix={getCurrencySymbol(currency)}
            />

            <CalculatorInput
              label="Interest Rate (p.a)"
              value={interestRate}
              onChange={setInterestRate}
              min={1}
              max={25}
              step={0.1}
              suffix="%"
            />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loan Tenure</label>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 no-print">
                  <button 
                    onClick={() => {
                      setTenureUnit('years');
                      setLoanTenure(Math.min(loanTenure, 30));
                    }}
                    className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md", tenureUnit === 'years' ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-500")}
                  >Yr</button>
                  <button 
                    onClick={() => {
                      setTenureUnit('months');
                      setLoanTenure(Math.min(loanTenure, 360));
                    }}
                    className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md", tenureUnit === 'months' ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-500")}
                  >Mo</button>
                </div>
              </div>
              
              <CalculatorInput
                label=""
                value={loanTenure}
                onChange={setLoanTenure}
                min={1}
                max={tenureUnit === 'years' ? 30 : 360}
                step={1}
                suffix={tenureUnit === 'years' ? 'Yr' : 'Mo'}
              />
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10 print:bg-blue-50 print:border-blue-200"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Monthly EMI</p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(results.emi, currency)}</p>
            </motion.div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 print:border-gray-200">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Total Interest</p>
              <p className="text-2xl font-black text-red-600 dark:text-red-400">{formatCurrency(results.totalInterest, currency)}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 print:border-gray-200">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Total Payment</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(results.totalPayment, currency)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900 h-[350px] print:shadow-none print:border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Breakup of Total Payment</h3>
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
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Loan Amortization (Yearly)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results.schedule}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `${getCurrencySymbol(currency)}${(value / 100000).toFixed(1)}L`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  <Legend />
                  <Bar dataKey="principal" name="Principal" stackId="a" fill="#3B82F6" />
                  <Bar dataKey="interest" name="Interest" stackId="a" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>

      {/* Amortization Table Section */}
      <section className="rounded-3xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-900 shadow-lg print:shadow-none print:border-gray-200">
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Table className="h-5 w-5 text-blue-600 no-print" />
            Yearly Amortization Schedule
          </h2>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md active:scale-95 no-print"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 uppercase text-xs font-bold tracking-widest">
              <tr>
                <th className="px-8 py-5">Year</th>
                <th className="px-8 py-5">Principal Paid</th>
                <th className="px-8 py-5">Interest Paid</th>
                <th className="px-8 py-5">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {results.schedule.map((row) => (
                <tr key={row.period} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-8 py-5 font-bold text-gray-900 dark:text-white">Year {row.period}</td>
                  <td className="px-8 py-5 text-blue-600 dark:text-blue-400">{formatCurrency(row.principal, currency)}</td>
                  <td className="px-8 py-5 text-red-600 dark:text-red-400">{formatCurrency(row.interest, currency)}</td>
                  <td className="px-8 py-5 font-mono text-gray-600 dark:text-gray-400">{formatCurrency(row.balance, currency)}</td>
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
