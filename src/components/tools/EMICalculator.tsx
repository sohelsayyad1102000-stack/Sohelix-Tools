import React, { useState, useMemo } from 'react';
import { CreditCard, Percent, Calendar, Calculator, PieChart as PieChartIcon, DollarSign, Download, Copy, Check, RotateCcw, Info, TrendingUp, Printer } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CalculatorInput } from '../CalculatorInput';
import { getCurrencySymbol, formatCurrency } from '../../lib/finance';

interface EMICalculatorProps {
  tool: any;
}

export const EMICalculator: React.FC<EMICalculatorProps> = ({ tool }) => {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
  const [currency, setCurrency] = useState('INR');
  const [copied, setCopied] = useState(false);

  const { emi, totalInterest, totalPayment } = useMemo(() => {
    const P = Number(loanAmount);
    const r = Number(interestRate) / (12 * 100);
    const n = tenureUnit === 'years' ? Number(tenure) * 12 : Number(tenure);

    if (r === 0) {
      return {
        emi: P / n,
        totalInterest: 0,
        totalPayment: P
      };
    }

    const emiValue = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = emiValue * n;
    
    return {
      emi: emiValue,
      totalInterest: totalPay - P,
      totalPayment: totalPay
    };
  }, [loanAmount, interestRate, tenure, tenureUnit]);

  const getResultText = () => {
    return `EMI Calculation Results:
Loan Amount: ${formatCurrency(loanAmount, currency)}
Interest Rate: ${interestRate}%
Tenure: ${tenure} ${tenureUnit}

Monthly EMI: ${formatCurrency(emi, currency)}
Total Interest: ${formatCurrency(totalInterest, currency)}
Total Payment: ${formatCurrency(totalPayment, currency)}`;
  };

  const copyResults = () => {
    navigator.clipboard.writeText(getResultText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadResults = () => {
    const blob = new Blob([getResultText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emi_calculation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setLoanAmount(1000000);
    setInterestRate(8.5);
    setTenure(20);
    setTenureUnit('years');
  };

  const pieData = [
    { name: 'Principal', value: Number(loanAmount) || 0 },
    { name: 'Interest', value: totalInterest || 0 }
  ];
  const COLORS = ['#2563eb', '#93c5fd'];

  return (
    <article className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-blue-600" />
          {tool.title || 'EMI Calculator'}
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
            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            title="Print"
          >
            <Printer className="h-5 w-5" />
          </button>
          <button
            onClick={reset}
            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            title="Reset"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-black text-gray-900">{tool.title || 'EMI Calculator'} Report</h1>
        <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-1 space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none">
          <CalculatorInput
            label="Loan Amount"
            value={loanAmount}
            onChange={setLoanAmount}
            min={1000}
            max={100000000}
            step={1000}
            prefix={getCurrencySymbol(currency)}
          />

          <CalculatorInput
            label="Interest Rate"
            value={interestRate}
            onChange={setInterestRate}
            min={0.1}
            max={50}
            step={0.1}
            suffix="%"
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Loan Tenure</label>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shadow-inner no-print">
                <button 
                  onClick={() => setTenureUnit('years')}
                  className={cn("px-4 py-1.5 text-xs font-black rounded-lg transition-all", tenureUnit === 'years' ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-400")}
                >Years</button>
                <button 
                  onClick={() => setTenureUnit('months')}
                  className={cn("px-4 py-1.5 text-xs font-black rounded-lg transition-all", tenureUnit === 'months' ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-400")}
                >Months</button>
              </div>
            </div>
            
            <CalculatorInput
              label=""
              value={tenure}
              onChange={setTenure}
              min={1}
              max={tenureUnit === 'years' ? 50 : 600}
              step={1}
              suffix={tenureUnit}
            />
          </div>
        </section>

        <section className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl relative overflow-hidden print:bg-blue-600">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-4">Monthly EMI</p>
                  <h2 className="text-5xl font-black mb-8">{formatCurrency(emi, currency)}</h2>
                  
                  <div className="space-y-4 border-t border-white/20 pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase opacity-70">Total Interest</span>
                      <span className="text-xl font-black">{formatCurrency(totalInterest, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase opacity-70">Total Payment</span>
                      <span className="text-xl font-black">{formatCurrency(totalPayment, currency)}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl no-print" />
                <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-blue-400/20 blur-2xl no-print" />
              </div>

              <div className="flex gap-4 no-print">
                <button
                  onClick={copyResults}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gray-100 py-4 text-sm font-black text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all active:scale-95"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  {copied ? 'Copied!' : 'Copy Results'}
                </button>
                <button
                  onClick={downloadResults}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  <Download className="h-5 w-5" />
                  Download
                </button>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl print:shadow-none print:border-gray-200">
              <div className="flex items-center gap-3 mb-8">
                <PieChartIcon className="h-5 w-5 text-blue-600 no-print" />
                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">Payment Breakup</h4>
              </div>
              
              <div className="h-48 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => formatCurrency(value, currency)} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 print:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)] print:shadow-none"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Principal</span>
                  </div>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{Math.round((loanAmount / totalPayment) * 100) || 0}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 print:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.5)] print:shadow-none"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Interest</span>
                  </div>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{Math.round((totalInterest / totalPayment) * 100) || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Info Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-sm print:border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl no-print">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white">What is EMI?</h4>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Equated Monthly Installment (EMI) is a fixed payment amount made by a borrower to a lender at a specified date each calendar month.
          </p>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-sm print:border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl no-print">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white">Smart Tip</h4>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Increasing your EMI or making part-payments can significantly reduce your total interest and loan tenure over time.
          </p>
        </div>
        <div className="p-6 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 print:bg-blue-600 print:shadow-none">
          <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">EMI Formula</p>
          <p className="text-sm font-mono font-bold leading-relaxed">
            E = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)
          </p>
          <p className="text-[10px] mt-4 opacity-70 italic">
            Where P=Principal, r=Monthly Interest, n=Months
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
