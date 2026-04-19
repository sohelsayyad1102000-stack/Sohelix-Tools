import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Coins, ArrowRightLeft, RefreshCcw, TrendingUp, Info, Calculator, Globe, ShieldCheck, Printer, AlertCircle, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { CalculatorInput } from '../CalculatorInput';
import { ClientOnly } from '../ClientOnly';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', supported: true },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', supported: true },
  { code: 'EUR', name: 'Euro', symbol: '€', supported: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', supported: true },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', supported: true },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', supported: true },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', supported: true },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', supported: false },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', supported: false },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', supported: true },
];

interface CurrencyConverterProps {
  tool: any;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ tool }) => {
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Historical Data States
  const [timeRange, setTimeRange] = useState<'7D' | '1M' | '1Y'>('7D');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histError, setHistError] = useState<string | null>(null);
  const cache = useRef<Record<string, any>>({});

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        
        if (data && data.rates) {
          setRates(data.rates);
          setError(null);
        } else {
          throw new Error('Invalid API response structure');
        }
      } catch (err) {
        setError('Unable to fetch live exchange rates. Please try again later.');
        console.error('Currency API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  // Fetch Historical Data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      const fromSupported = CURRENCIES.find(c => c.code === fromCurrency)?.supported;
      const toSupported = CURRENCIES.find(c => c.code === toCurrency)?.supported;

      if (!fromSupported || !toSupported) {
        setHistError(`Trend data unavailable for ${!fromSupported ? fromCurrency : toCurrency}`);
        setHistoricalData([]);
        return;
      }

      if (fromCurrency === toCurrency) {
        setHistError('Please select different currencies to see trends');
        setHistoricalData([]);
        return;
      }

      const cacheKey = `${fromCurrency}-${toCurrency}-${timeRange}`;
      if (cache.current[cacheKey]) {
        setHistoricalData(cache.current[cacheKey]);
        setHistError(null);
        return;
      }

      try {
        setHistLoading(true);
        setHistError(null);

        const end = new Date();
        const start = new Date();
        if (timeRange === '7D') start.setDate(end.getDate() - 7);
        else if (timeRange === '1M') start.setDate(end.getDate() - 30);
        else if (timeRange === '1Y') start.setDate(end.getDate() - 365);

        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        const startDate = formatDate(start);
        const endDate = formatDate(end);

        // Try Frankfurter .dev mirror as it's often more reliable
        const res = await fetch(`https://api.frankfurter.dev/v1/${startDate}..${endDate}?from=${fromCurrency}&to=${toCurrency}`);
        
        if (!res.ok) {
          const resText = await res.text();
          console.error('Trend API Error:', res.status, resText);
          throw new Error('Historical data not available for this pair');
        }

        const data = await res.json();
        
        if (data && data.rates) {
          const transformed = Object.entries(data.rates).map(([date, rateObj]: [string, any]) => ({
            date,
            rate: rateObj[toCurrency]
          }));
          
          if (transformed.length === 0) {
            throw new Error('No historical data found');
          }

          setHistoricalData(transformed);
          cache.current[cacheKey] = transformed;
        } else {
          throw new Error('Invalid trend data format');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Trend service temporarily unavailable';
        setHistError(msg.includes('Failed to fetch') ? 'Connection Error: Try again later' : msg);
        setHistoricalData([]);
      } finally {
        setHistLoading(false);
      }
    };

    fetchHistoricalData();
  }, [fromCurrency, toCurrency, timeRange]);

  const result = useMemo(() => {
    if (loading || error) return 0;
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    
    if (fromRate && toRate) {
      return amount * (toRate / fromRate);
    }
    return 0;
  }, [amount, fromCurrency, toCurrency, rates, loading, error]);

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
        <ClientOnly>
          <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
        </ClientOnly>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30 no-print">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}
        
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
          <ClientOnly>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              {amount.toLocaleString()} {fromCurrency} =
            </p>
          </ClientOnly>
          <motion.h2 
            key={result}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white"
          >
            <ClientOnly fallback={<span>{getSymbol(toCurrency)}0.00</span>}>
              {getSymbol(toCurrency)}{result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </ClientOnly>
          </motion.h2>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-blue-600 font-black dark:text-blue-400">
              1 {fromCurrency} = {loading ? '...' : (result / amount).toFixed(4)} {toCurrency}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter no-print">
              Rates are updated live for accurate conversion
            </p>
          </div>
        </div>
      </section>

      {/* Historical Trend Chart */}
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Rate Trends</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase">{fromCurrency} to {toCurrency}</p>
            </div>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shadow-inner">
            {(['7D', '1M', '1Y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-4 py-1.5 text-xs font-black rounded-lg transition-all",
                  timeRange === range 
                    ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" 
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full min-w-0">
          {histLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <RefreshCcw className="h-8 w-8 text-blue-600 animate-spin opacity-20" />
            </div>
          ) : histError ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <Info className="h-6 w-6 text-gray-400" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{histError}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={historicalData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                  minTickGap={30}
                  tickFormatter={(val) => {
                    const date = new Date(val);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  hide={false}
                  domain={['auto', 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  formatter={(val: number) => [val.toFixed(4), `Rate (${toCurrency})`]}
                />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRate)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
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
