import React, { useState, useEffect } from 'react';
import { Landmark, Percent, Calendar, RefreshCcw, TrendingUp, DollarSign, Download, Copy, Check, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface InterestCalculatorProps {
  tool: any;
}

export const InterestCalculator: React.FC<InterestCalculatorProps> = ({ tool }) => {
  const [principal, setPrincipal] = useLocalStorage<number | ''>('interest-principal', 10000);
  const [rate, setRate] = useLocalStorage<number | ''>('interest-rate', 5);
  const [time, setTime] = useLocalStorage<number | ''>('interest-time', 5);
  const [frequency, setFrequency] = useLocalStorage<number>('interest-frequency', 1); // 1 = Annually, 4 = Quarterly, 12 = Monthly, 365 = Daily
  
  const [simpleInterest, setSimpleInterest] = useState<number>(0);
  const [compoundInterest, setCompoundInterest] = useState<number>(0);
  const [totalSimple, setTotalSimple] = useState<number>(0);
  const [totalCompound, setTotalCompound] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    if (!principal || !rate || !time) {
      setSimpleInterest(0);
      setCompoundInterest(0);
      setTotalSimple(0);
      setTotalCompound(0);
      setChartData([]);
      return;
    }

    const P = Number(principal);
    const R = Number(rate);
    const T = Number(time);
    const n = Number(frequency);

    // Simple Interest: SI = (P * R * T) / 100
    const si = (P * R * T) / 100;
    setSimpleInterest(si);
    setTotalSimple(P + si);

    // Compound Interest: A = P(1 + r/n)^(nt)
    const r = R / 100;
    const amount = P * Math.pow((1 + r / n), (n * T));
    const ci = amount - P;
    setCompoundInterest(ci);
    setTotalCompound(amount);

    // Generate chart data
    const data = [];
    for (let year = 0; year <= T; year++) {
      const yearSimple = P + (P * R * year) / 100;
      const yearCompound = P * Math.pow((1 + r / n), (n * year));
      data.push({
        year: `Year ${year}`,
        simple: Math.round(yearSimple),
        compound: Math.round(yearCompound),
        principal: P
      });
    }
    setChartData(data);
  };

  useEffect(() => {
    calculate();
  }, [principal, rate, time, frequency]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const copyResults = () => {
    const text = `Interest Calculation Results:
Principal: ${formatCurrency(Number(principal))}
Rate: ${rate}%
Time: ${time} Years

Compound Interest:
Total Amount: ${formatCurrency(totalCompound)}
Interest Earned: ${formatCurrency(compoundInterest)}

Simple Interest:
Total Amount: ${formatCurrency(totalSimple)}
Interest Earned: ${formatCurrency(simpleInterest)}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResults = () => {
    const text = `Interest Calculation Results:
Principal: ${formatCurrency(Number(principal))}
Rate: ${rate}%
Time: ${time} Years

Compound Interest:
Total Amount: ${formatCurrency(totalCompound)}
Interest Earned: ${formatCurrency(compoundInterest)}

Simple Interest:
Total Amount: ${formatCurrency(totalSimple)}
Interest Earned: ${formatCurrency(simpleInterest)}

Yearly Breakdown:
${chartData.map(d => `${d.year}: Simple = ${formatCurrency(d.simple)}, Compound = ${formatCurrency(d.compound)}`).join('\n')}`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interest_calculation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setPrincipal('');
    setRate('');
    setTime('');
    setFrequency(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
      {/* Main Area */}
      <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Landmark className="h-6 w-6 text-blue-600" />
            Interest Calculator
          </h3>
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              title="Reset Calculator"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            {totalCompound > 0 && (
              <>
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
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Principal Amount
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 text-lg focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Percent className="h-4 w-4 text-blue-600" />
                Annual Interest Rate (%)
              </label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 text-lg focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Time (Years)
                </label>
                <input
                  type="number"
                  value={time}
                  onChange={(e) => setTime(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 text-lg focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4 text-blue-600" />
                  Compounding
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 text-lg focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white appearance-none"
                >
                  <option value={1}>Annually</option>
                  <option value={4}>Quarterly</option>
                  <option value={12}>Monthly</option>
                  <option value={365}>Daily</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">Compound Interest Result</p>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(totalCompound)}</h2>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Interest Earned</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(compoundInterest)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600/20" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Simple Interest Result</p>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Amount:</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(totalSimple)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Interest Earned:</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(simpleInterest)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="mt-8 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSimple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="compound" name="Compound" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCompound)" />
                <Area type="monotone" dataKey="simple" name="Simple" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorSimple)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Sidebar Info */}
      <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30">
        <h3 className="font-bold text-gray-900 dark:text-white mb-6">How it works</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Simple Interest</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Calculated only on the principal amount. 
              <br />
              <strong>Formula:</strong> SI = (P × R × T) / 100
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Compound Interest</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Calculated on the principal amount and also on the accumulated interest of previous periods.
              <br />
              <strong>Formula:</strong> A = P(1 + r/n)^(nt)
            </p>
          </div>
          
          <div className="mt-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
            <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
              <strong>Tip:</strong> The more frequent the compounding, the higher the interest earned.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
