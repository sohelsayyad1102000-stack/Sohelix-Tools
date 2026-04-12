import React, { useState, useEffect } from 'react';
import { CreditCard, Percent, Calendar, Calculator, PieChart as PieChartIcon, DollarSign, Download, Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface EMICalculatorProps {
  tool: any;
}

export const EMICalculator: React.FC<EMICalculatorProps> = ({ tool }) => {
  const [loanAmount, setLoanAmount] = useState<number | ''>(100000);
  const [interestRate, setInterestRate] = useState<number | ''>(8.5);
  const [tenure, setTenure] = useState<number | ''>(5);
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
  
  const [emi, setEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const calculateEMI = () => {
    if (!loanAmount || !interestRate || !tenure) return;

    const P = Number(loanAmount);
    const r = Number(interestRate) / (12 * 100); // monthly interest rate
    const n = tenureUnit === 'years' ? Number(tenure) * 12 : Number(tenure); // total number of months

    // EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
    const emiValue = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    setEmi(emiValue);
    const totalPay = emiValue * n;
    setTotalPayment(totalPay);
    setTotalInterest(totalPay - P);
  };

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, tenure, tenureUnit]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getResultText = () => {
    return `EMI Calculation Results:
Loan Amount: ${formatCurrency(Number(loanAmount))}
Interest Rate: ${interestRate}%
Tenure: ${tenure} ${tenureUnit}

Monthly EMI: ${formatCurrency(emi)}
Total Interest: ${formatCurrency(totalInterest)}
Total Payment: ${formatCurrency(totalPayment)}`;
  };

  const copyResults = () => {
    navigator.clipboard.writeText(getResultText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const pieData = [
    { name: 'Principal', value: Number(loanAmount) || 0 },
    { name: 'Interest', value: totalInterest || 0 }
  ];
  const COLORS = ['#2563eb', '#93c5fd'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
      {/* Main Area */}
      <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            EMI Calculator
          </h3>
          <div className="flex gap-2">
            <button
              onClick={copyResults}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={downloadResults}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Loan Amount
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 text-lg focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Percent className="h-4 w-4 text-blue-600" />
                Interest Rate (Annual %)
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 text-lg focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Loan Tenure
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value ? Number(e.target.value) : '')}
                  className="flex-1 rounded-xl border-gray-200 bg-gray-50 p-4 text-lg focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <select
                  value={tenureUnit}
                  onChange={(e) => setTenureUnit(e.target.value as 'years' | 'months')}
                  className="w-32 rounded-xl border-gray-200 bg-gray-50 p-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white appearance-none"
                >
                  <option value="years">Years</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-8 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/30">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">Monthly EMI</p>
              <h2 className="text-5xl font-black mb-6">{formatCurrency(emi)}</h2>
              
              <div className="space-y-4 border-t border-white/20 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">Total Interest</span>
                  <span className="text-lg font-bold">{formatCurrency(totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-80">Total Payment</span>
                  <span className="text-lg font-bold">{formatCurrency(totalPayment)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <PieChartIcon className="h-5 w-5 text-blue-600" />
                <h4 className="font-bold text-gray-900 dark:text-white">Breakup of Total Payment</h4>
              </div>
              
              <div className="flex gap-6 items-center">
                <div className="h-32 w-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">Principal</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round((Number(loanAmount) / totalPayment) * 100) || 0}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-300 dark:bg-blue-900"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">Interest</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round((totalInterest / totalPayment) * 100) || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Info */}
      <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30">
        <h3 className="font-bold text-gray-900 dark:text-white mb-6">EMI Details</h3>
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">What is EMI?</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Equated Monthly Installment is a fixed payment amount made by a borrower to a lender at a specified date each calendar month.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">EMI Formula</p>
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400">
              E = P × r × (1+r)^n / ((1+r)^n - 1)
            </p>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 text-center">
            <p className="text-xs text-green-800 dark:text-green-200">
              <strong>Tip:</strong> Increasing your EMI or making part-payments can significantly reduce your total interest and loan tenure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
