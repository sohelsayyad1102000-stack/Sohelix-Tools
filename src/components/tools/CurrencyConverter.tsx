import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Coins, ArrowRightLeft, Globe, ShieldCheck, Printer,
  TrendingUp, TrendingDown, RefreshCcw, Calculator, Clock, Banknote,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { cn } from '../../lib/utils';
import { CalculatorInput } from '../CalculatorInput';
import { ClientOnly } from '../ClientOnly';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',          symbol: '$'   },
  { code: 'INR', name: 'Indian Rupee',        symbol: '₹'   },
  { code: 'EUR', name: 'Euro',               symbol: '€'   },
  { code: 'GBP', name: 'British Pound',       symbol: '£'   },
  { code: 'JPY', name: 'Japanese Yen',        symbol: '¥'   },
  { code: 'AUD', name: 'Australian Dollar',   symbol: 'A$'  },
  { code: 'CAD', name: 'Canadian Dollar',     symbol: 'C$'  },
  { code: 'AED', name: 'UAE Dirham',          symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal',         symbol: '﷼'   },
  { code: 'SGD', name: 'Singapore Dollar',    symbol: 'S$'  },
];

const LIVE_RATES_URL = 'https://open.er-api.com/v6/latest/USD';

const FRANKFURTER_SUPPORTED = new Set([
  'USD','EUR','GBP','JPY','AUD','CAD','SGD','INR','CHF','NZD',
  'SEK','NOK','DKK','HKD','CNY','KRW','MXN','BRL','ZAR',
  'THB','IDR','MYR','PHP','TRY','PLN','RON','CZK','HUF','ILS',
]);

const POPULAR_PAIRS = [
  { from: 'USD', to: 'INR' },
  { from: 'INR', to: 'USD' },
  { from: 'EUR', to: 'INR' },
  { from: 'GBP', to: 'INR' },
  { from: 'USD', to: 'EUR' },
  { from: 'AED', to: 'INR' },
];

type TrendRange = '7D' | '1M' | '1Y';

function getDateRange(range: TrendRange) {
  const end = new Date();
  const start = new Date();
  if (range === '7D')  start.setDate(end.getDate() - 7);
  else if (range === '1M') start.setDate(end.getDate() - 30);
  else start.setFullYear(end.getFullYear() - 1);
  return {
    start: start.toISOString().slice(0, 10),
    end:   end.toISOString().slice(0, 10),
  };
}

function fmtDate(dateStr: string, range: TrendRange) {
  const d = new Date(dateStr + 'T00:00:00');
  if (range === '1Y') return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface CurrencyConverterProps { tool: any; }

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ tool }) => {
  const [amount, setAmount]             = useState(100);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency]     = useState('INR');
  const [allRates, setAllRates]         = useState<Record<string, number> | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [apiError, setApiError]         = useState<string | null>(null);
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null);
  const [trendData, setTrendData]       = useState<{ date: string; rate: number }[]>([]);
  const [trendRange, setTrendRange]     = useState<TrendRange>('7D');
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError]     = useState(false);

  const trendCache = useRef<Map<string, { date: string; rate: number }[]>>(new Map());

  const isChartPair = FRANKFURTER_SUPPORTED.has(fromCurrency) && FRANKFURTER_SUPPORTED.has(toCurrency);

  // Compute live exchange rate from fetched rates table (all relative to USD)
  const exchangeRate = useMemo(() => {
    if (!allRates) return null;
    const fromRate = allRates[fromCurrency] ?? null;
    const toRate   = allRates[toCurrency]   ?? null;
    if (fromRate === null || toRate === null) return null;
    return toRate / fromRate;
  }, [allRates, fromCurrency, toCurrency]);

  const result = exchangeRate !== null ? Math.round(amount * exchangeRate * 10000) / 10000 : null;

  // Fetch all live rates once on mount (open.er-api.com — free, no auth, CORS-enabled)
  const fetchAllRates = useCallback(async () => {
    setRatesLoading(true);
    setApiError(null);
    try {
      const res  = await fetch(LIVE_RATES_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.result !== 'success' || !data?.rates) {
        throw new Error(data?.error_type ?? 'Invalid API response');
      }
      setAllRates(data.rates as Record<string, number>);
      setLastUpdated(new Date());
    } catch (err: any) {
      setApiError('Live rates unavailable. Please try again later.');
      setAllRates(null);
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllRates(); }, [fetchAllRates]);

  const fetchTrend = useCallback(async (from: string, to: string, range: TrendRange) => {
    if (!FRANKFURTER_SUPPORTED.has(from) || !FRANKFURTER_SUPPORTED.has(to)) {
      setTrendData([]); setTrendLoading(false); setTrendError(false); return;
    }
    if (from === to) {
      setTrendData([{ date: new Date().toISOString().slice(0, 10), rate: 1 }]);
      setTrendLoading(false); setTrendError(false); return;
    }
    const cacheKey = `${from}-${to}-${range}`;
    if (trendCache.current.has(cacheKey)) {
      setTrendData(trendCache.current.get(cacheKey)!);
      setTrendLoading(false); setTrendError(false); return;
    }
    setTrendLoading(true);
    setTrendError(false);
    setTrendData([]);
    try {
      const { start, end } = getDateRange(range);
      const frankfurterBase = import.meta.env.DEV
        ? '/api/frankfurter'
        : 'https://api.frankfurter.app';
      const res = await fetch(
        `${frankfurterBase}/${start}..${end}?from=${from}&to=${to}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data?.rates || Object.keys(data.rates).length === 0) {
        throw new Error('Empty response');
      }
      const points = Object.entries(data.rates)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, rates]: [string, any]) => ({
          date,
          rate: Math.round((rates[to] ?? 0) * 10000) / 10000,
        }))
        .filter(p => p.rate > 0);
      trendCache.current.set(cacheKey, points);
      setTrendData(points);
    } catch {
      setTrendData([]);
      setTrendError(true);
    } finally {
      setTrendLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrend(fromCurrency, toCurrency, trendRange); }, [fromCurrency, toCurrency, trendRange, fetchTrend]);

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getSymbol = (code: string) => CURRENCIES.find(c => c.code === code)?.symbol ?? '';
  const getName   = (code: string) => CURRENCIES.find(c => c.code === code)?.name   ?? code;

  const trendDirection = useMemo(() => {
    if (trendData.length < 2) return 'neutral';
    const d = trendData[trendData.length - 1].rate - trendData[0].rate;
    return d > 0 ? 'up' : d < 0 ? 'down' : 'neutral';
  }, [trendData]);

  const trendPercent = useMemo(() => {
    if (trendData.length < 2) return 0;
    const first = trendData[0].rate;
    const last  = trendData[trendData.length - 1].rate;
    return Math.round(((last - first) / first) * 10000) / 100;
  }, [trendData]);

  const getPairRate = (from: string, to: string): string => {
    if (!allRates) return '…';
    const fRate = allRates[from];
    const tRate = allRates[to];
    if (!fRate || !tRate) return '—';
    const r = tRate / fRate;
    return r >= 10 ? r.toFixed(2) : r.toFixed(4);
  };

  const fmtRate = (r: number) => r >= 10 ? r.toFixed(2) : r.toFixed(4);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-lg text-sm">
        <p className="font-bold text-gray-600 dark:text-gray-300">{fmtDate(label, trendRange)}</p>
        <p className="text-blue-600 dark:text-blue-400 font-mono font-bold">
          1 {fromCurrency} = {payload[0]?.value} {toCurrency}
        </p>
      </div>
    );
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the current ${fromCurrency} to ${toCurrency} exchange rate?`,
        acceptedAnswer: { '@type': 'Answer', text: `The current rate is approximately 1 ${fromCurrency} = ${exchangeRate !== null ? fmtRate(exchangeRate) : '—'} ${toCurrency}.` },
      },
      {
        '@type': 'Question',
        name: 'Why do currency exchange rates change?',
        acceptedAnswer: { '@type': 'Answer', text: 'Exchange rates fluctuate due to economic indicators, interest rates, inflation, geopolitical events, and supply/demand in the foreign exchange market.' },
      },
      {
        '@type': 'Question',
        name: 'What is the best time to exchange currency?',
        acceptedAnswer: { '@type': 'Answer', text: 'Currency markets are most active during weekday business hours, especially during the London–New York market overlap (1 PM–5 PM GMT).' },
      },
      {
        '@type': 'Question',
        name: 'How accurate is this currency converter?',
        acceptedAnswer: { '@type': 'Answer', text: 'We use live data from the Frankfurter API (ECB-sourced), updated daily. For large transactions, confirm rates with your bank.' },
      },
    ],
  };

  const toolSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Real-Time Currency Converter',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    url: 'https://sohelix.com/tools/currency-converter',
    description: 'Free online currency converter with live ECB exchange rates and historical trend charts.',
  };

  const allFaqs = [
    ...(tool.faqs || []),
    {
      question: `What is the current ${fromCurrency} to ${toCurrency} exchange rate?`,
      answer: `The current rate is approximately 1 ${fromCurrency} = ${getSymbol(toCurrency)}${exchangeRate !== null ? fmtRate(exchangeRate) : '—'} ${toCurrency}. Rates are sourced live via ExchangeRate-API.`,
    },
    {
      question: 'Why do currency exchange rates change?',
      answer: 'Exchange rates are influenced by central bank policies, inflation, interest rates, trade balances, and global economic/geopolitical events. They fluctuate continuously during trading hours.',
    },
    {
      question: 'What is the best time to exchange currency?',
      answer: 'Weekday hours during the London–New York overlap (roughly 1 PM–5 PM GMT) offer the highest liquidity and typically more competitive rates.',
    },
    {
      question: 'How accurate is this currency converter?',
      answer: 'Our converter uses live ECB-sourced rates from Frankfurter API, updated daily. For large or time-sensitive financial transactions, always confirm rates with your bank or broker.',
    },
  ];

  return (
    <article className="space-y-8">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(toolSchema)}</script>
      </Helmet>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Globe className="h-8 w-8 text-blue-600" />
          {tool.title || 'Currency Converter'}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <ClientOnly>
            <div className="flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-green-700 dark:text-green-400">Live Rates</span>
              {lastUpdated && (
                <span className="text-[10px] text-green-600 dark:text-green-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </ClientOnly>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-black text-gray-900">{tool.title || 'Currency Converter'} Report</h1>
        <ClientOnly>
          <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
        </ClientOnly>
      </div>

      {/* Converter Card */}
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-end">
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

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">From</label>
            <select
              value={fromCurrency}
              onChange={e => setFromCurrency(e.target.value)}
              className="w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
            >
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
            </select>
          </div>

          <div className="flex justify-center pb-2 no-print">
            <button
              onClick={swap}
              className="rounded-full bg-blue-50 p-4 text-blue-600 transition-all hover:bg-blue-100 hover:rotate-180 dark:bg-blue-900/20 dark:text-blue-400 shadow-md active:scale-90"
            >
              <ArrowRightLeft className="h-6 w-6" />
            </button>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">To</label>
            <select
              value={toCurrency}
              onChange={e => setToCurrency(e.target.value)}
              className="w-full rounded-2xl border-gray-200 bg-gray-50 px-4 py-4 text-lg font-bold focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
            >
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
            </select>
          </div>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 px-5 py-4">
            <span className="text-red-500 dark:text-red-400 font-bold text-sm">⚠ {apiError}</span>
            <button
              onClick={fetchAllRates}
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 px-3 py-1.5 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Result */}
        <div className="mt-8 text-center space-y-4 p-8 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 print:bg-gray-50 print:border-gray-200">
          <ClientOnly>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              {amount.toLocaleString()} {fromCurrency} =
            </p>
          </ClientOnly>
          <motion.h2
            key={String(result)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white"
          >
            <ClientOnly fallback={<span className="animate-pulse text-gray-400">…</span>}>
              {ratesLoading
                ? <span className="animate-pulse text-gray-400">…</span>
                : result !== null
                  ? `${getSymbol(toCurrency)}${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : <span className="text-red-400 text-4xl">Rate unavailable</span>
              }
            </ClientOnly>
          </motion.h2>
          <div className="flex flex-col items-center gap-1">
            <ClientOnly>
              {exchangeRate !== null && (
                <p className="text-sm text-blue-600 font-black dark:text-blue-400">
                  1 {fromCurrency} = {fmtRate(exchangeRate)} {toCurrency}
                </p>
              )}
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter no-print">
                {allRates && !apiError ? '✓ Live rate via ExchangeRate-API' : ''}
              </p>
            </ClientOnly>
          </div>
        </div>
      </section>

      {/* Trend Chart */}
      {isChartPair && (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                {fromCurrency}/{toCurrency} Rate Trend
              </h2>
              {trendData.length >= 2 && (
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                  trendDirection === 'up'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : trendDirection === 'down'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                )}>
                  {trendDirection === 'up'   && <TrendingUp className="h-3 w-3" />}
                  {trendDirection === 'down' && <TrendingDown className="h-3 w-3" />}
                  {trendDirection !== 'neutral'
                    ? `${trendPercent > 0 ? '+' : ''}${trendPercent}%`
                    : 'Flat'}
                </span>
              )}
            </div>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              {(['7D', '1M', '1Y'] as TrendRange[]).map(r => (
                <button
                  key={r}
                  onClick={() => setTrendRange(r)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-bold transition-all',
                    trendRange === r
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <ClientOnly fallback={<div className="h-52 bg-gray-50 dark:bg-gray-800 rounded-2xl animate-pulse" />}>
            {trendLoading ? (
              <div className="h-52 flex items-center justify-center">
                <RefreshCcw className="h-6 w-6 text-gray-400 animate-spin" />
              </div>
            ) : trendError ? (
              <div className="h-52 flex flex-col items-center justify-center gap-3">
                <p className="text-sm text-red-400 dark:text-red-500 font-medium">
                  Could not load historical data. Check your connection and try again.
                </p>
                <button
                  onClick={() => fetchTrend(fromCurrency, toCurrency, trendRange)}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <RefreshCcw className="h-3.5 w-3.5" /> Retry
                </button>
              </div>
            ) : trendData.length > 1 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ccGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={d => fmtDate(d, trendRange)}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#ccGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center">
                <RefreshCcw className="h-6 w-6 text-gray-400 animate-spin" />
              </div>
            )}
          </ClientOnly>
        </section>
      )}

      {/* Popular Currency Pairs */}
      <section className="no-print">
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4">Popular Currency Pairs</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {POPULAR_PAIRS.map(pair => {
            const isActive = fromCurrency === pair.from && toCurrency === pair.to;
            return (
              <button
                key={`${pair.from}-${pair.to}`}
                onClick={() => { setFromCurrency(pair.from); setToCurrency(pair.to); }}
                className={cn(
                  'rounded-2xl border p-4 text-left transition-all hover:shadow-md',
                  isActive
                    ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                    : 'border-gray-200 bg-white hover:border-blue-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700'
                )}
              >
                <p className="font-black text-gray-900 dark:text-white text-sm">{pair.from} → {pair.to}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-1">
                  1 {pair.from} = {getSymbol(pair.to)}{getPairRate(pair.from, pair.to)}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Info Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        {[
          {
            icon: <TrendingUp className="h-5 w-5 text-green-600" />,
            bg: 'bg-green-50 dark:bg-green-900/20',
            title: 'Live Rates',
            text: 'Rates sourced daily from the European Central Bank via Frankfurter API for maximum accuracy.',
          },
          {
            icon: <Coins className="h-5 w-5 text-blue-600" />,
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            title: 'Global Reach',
            text: 'Convert between all major currencies — USD, EUR, GBP, INR, JPY, and more.',
          },
          {
            icon: <ShieldCheck className="h-5 w-5 text-amber-600" />,
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            title: 'Secure & Private',
            text: 'All conversions run in your browser. Your financial data is never stored or sent to any server.',
          },
        ].map(card => (
          <div key={card.title} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('p-2 rounded-lg', card.bg)}>{card.icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white">{card.title}</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{card.text}</p>
          </div>
        ))}
      </section>

      {/* SEO Content Block */}
      <section className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 space-y-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          {fromCurrency} to {toCurrency} Exchange Rate Today
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          The current <strong>{getName(fromCurrency)} ({fromCurrency})</strong> to{' '}
          <strong>{getName(toCurrency)} ({toCurrency})</strong> exchange rate is{' '}
          {exchangeRate !== null
            ? <><strong>{fmtRate(exchangeRate)}</strong>. This means{' '}
                <strong>1 {fromCurrency} = {getSymbol(toCurrency)}{fmtRate(exchangeRate)} {toCurrency}</strong> today.</>
            : <span>currently loading…</span>
          }
          {isChartPair && exchangeRate !== null && trendData.length >= 2 && trendDirection !== 'neutral' && (
            <> Over the past {trendRange === '7D' ? '7 days' : trendRange === '1M' ? '30 days' : 'year'}, the rate has{' '}
              {trendDirection === 'up' ? 'increased' : 'decreased'} by{' '}
              <strong>{Math.abs(trendPercent)}%</strong>.</>
          )}
        </p>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {fromCurrency} to {toCurrency} — Common Conversions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 10, 100, 1000].map(n => (
            <div key={n} className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 text-center">
              <p className="text-xs text-gray-500 font-bold">{getSymbol(fromCurrency)}{n.toLocaleString()} {fromCurrency}</p>
              <p className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1">
                {exchangeRate !== null
                  ? `${getSymbol(toCurrency)}${(n * exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '—'
                }
              </p>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          About {fromCurrency}/{toCurrency}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          The {fromCurrency}/{toCurrency} pair shows how many {getName(toCurrency)}s buy one {getName(fromCurrency)}.
          Exchange rates move continuously based on central bank decisions, inflation data, trade flows,
          and investor sentiment. Our converter fetches live rates from ExchangeRate-API so you always work with
          accurate, up-to-date figures. Use the trend chart above to spot recent direction and decide
          when to convert.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="space-y-6 no-print">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allFaqs.map((faq: any, i: number) => (
            <article key={i} className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-6 no-print">
        <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-4">Related Finance Tools</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/tools/emi-calculator"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
          >
            <Calculator className="h-4 w-4" /> EMI Calculator
          </Link>
          <Link
            to="/tools/percentage-calculator"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
          >
            <span className="font-mono font-black">%</span> Percentage Calculator
          </Link>
          <Link
            to="/tools/currency-denomination"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
          >
            <Banknote className="h-4 w-4" /> Denomination Calculator
          </Link>
        </div>
      </section>
    </article>
  );
};
