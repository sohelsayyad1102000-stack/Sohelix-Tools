import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Globe, ArrowRightLeft, RefreshCcw, TrendingUp, Coins,
  ShieldCheck, Printer, AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ClientOnly } from '../ClientOnly';

/* ─── Currency list ─────────────────────────────────────────────────────── */
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',          symbol: '$'  },
  { code: 'EUR', name: 'Euro',                symbol: '€'  },
  { code: 'GBP', name: 'British Pound',       symbol: '£'  },
  { code: 'INR', name: 'Indian Rupee',        symbol: '₹'  },
  { code: 'JPY', name: 'Japanese Yen',        symbol: '¥'  },
  { code: 'CAD', name: 'Canadian Dollar',     symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar',   symbol: 'A$' },
  { code: 'SGD', name: 'Singapore Dollar',    symbol: 'S$' },
  { code: 'CHF', name: 'Swiss Franc',         symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan',        symbol: '¥'  },
  { code: 'AED', name: 'UAE Dirham',          symbol: 'د.إ'},
  { code: 'SAR', name: 'Saudi Riyal',         symbol: '﷼'  },
  { code: 'MXN', name: 'Mexican Peso',        symbol: '$'  },
  { code: 'BRL', name: 'Brazilian Real',      symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand',  symbol: 'R'  },
  { code: 'SEK', name: 'Swedish Krona',       symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone',     symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone',        symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar',  symbol: 'NZ$'},
  { code: 'KRW', name: 'South Korean Won',    symbol: '₩'  },
];

/* Frankfurter supports everything except AED and SAR */
const CHART_SUPPORTED = new Set(
  CURRENCIES.map(c => c.code).filter(c => c !== 'AED' && c !== 'SAR')
);

const POPULAR_PAIRS = [
  ['USD', 'EUR'], ['USD', 'GBP'], ['USD', 'INR'],
  ['USD', 'JPY'], ['EUR', 'GBP'], ['GBP', 'INR'],
];

type TrendRange = '7D' | '1M' | '1Y';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function isoDate(d: Date) { return d.toISOString().slice(0, 10); }

function dateRange(range: TrendRange): { start: string; end: string } {
  const end   = new Date();
  const start = new Date(end);
  if (range === '7D')  start.setDate(end.getDate() - 7);
  if (range === '1M')  start.setMonth(end.getMonth() - 1);
  if (range === '1Y')  start.setFullYear(end.getFullYear() - 1);
  return { start: isoDate(start), end: isoDate(end) };
}

function fmtDate(dateStr: string, range: TrendRange) {
  const d = new Date(dateStr + 'T00:00:00');
  if (range === '7D') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (range === '1M') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

const FRANKFURTER = 'https://api.frankfurter.dev/v1';

/* ─── Custom tooltip ──────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-base font-black text-blue-600">{Number(payload[0].value).toFixed(4)}</p>
    </div>
  );
};

/* ─── Component ──────────────────────────────────────────────────────────── */
interface Props { tool: any; }

export const CurrencyConverter: React.FC<Props> = ({ tool }) => {
  /* Converter state */
  const [amount, setAmount]           = useState(100);
  const [fromCurrency, setFrom]       = useState('USD');
  const [toCurrency, setTo]           = useState('INR');

  /* Live rates */
  const [allRates, setAllRates]       = useState<Record<string, number> | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /* Trend chart */
  const [trendData, setTrendData]     = useState<{ date: string; rate: number }[]>([]);
  const [trendRange, setTrendRange]   = useState<TrendRange>('7D');
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError]   = useState(false);
  const trendCache = useRef<Map<string, { date: string; rate: number }[]>>(new Map());

  /* ── Live rates fetch ─────────────────────────────────────────────────── */
  const fetchRates = useCallback(async () => {
    setRatesLoading(true);
    setRatesError(false);
    try {
      const res  = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.result !== 'success' || !data.rates) throw new Error('Bad response');
      setAllRates(data.rates);
      setLastUpdated(new Date());
    } catch {
      setRatesError(true);
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  /* ── Conversion result ────────────────────────────────────────────────── */
  const { result, rate } = useMemo(() => {
    if (!allRates) return { result: 0, rate: 0 };
    const fromRate = allRates[fromCurrency] ?? 1;
    const toRate   = allRates[toCurrency]   ?? 1;
    const r        = toRate / fromRate;
    return { result: amount * r, rate: r };
  }, [amount, fromCurrency, toCurrency, allRates]);

  /* ── Historical chart fetch ───────────────────────────────────────────── */
  const fetchTrend = useCallback(async (from: string, to: string, range: TrendRange) => {
    /* unsupported pair → hide chart, no error */
    if (!CHART_SUPPORTED.has(from) || !CHART_SUPPORTED.has(to)) {
      setTrendData([]); setTrendLoading(false); setTrendError(false);
      return;
    }
    if (from === to) {
      setTrendData([{ date: isoDate(new Date()), rate: 1 }]);
      setTrendLoading(false); setTrendError(false);
      return;
    }

    const key = `${from}-${to}-${range}`;
    if (trendCache.current.has(key)) {
      setTrendData(trendCache.current.get(key)!);
      setTrendLoading(false); setTrendError(false);
      return;
    }

    setTrendLoading(true);
    setTrendError(false);
    setTrendData([]);

    try {
      const { start, end } = dateRange(range);
      const url = `${FRANKFURTER}/${start}..${end}?from=${from}&to=${to}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data?.rates || Object.keys(data.rates).length === 0) throw new Error('Empty');

      const points = Object.entries(data.rates)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, rates]: [string, any]) => ({
          date,
          rate: Math.round((rates[to] ?? 0) * 10000) / 10000,
        }))
        .filter(p => p.rate > 0);

      trendCache.current.set(key, points);
      setTrendData(points);
    } catch {
      setTrendError(true);
      setTrendData([]);
    } finally {
      setTrendLoading(false);
    }
  }, []);

  useEffect(() => {
    setTrendLoading(true);
    setTrendError(false);
    setTrendData([]);
    fetchTrend(fromCurrency, toCurrency, trendRange);
  }, [fromCurrency, toCurrency, trendRange, fetchTrend]);

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  const swap = () => { setFrom(toCurrency); setTo(fromCurrency); };
  const sym  = (code: string) => CURRENCIES.find(c => c.code === code)?.symbol ?? '';
  const name = (code: string) => CURRENCIES.find(c => c.code === code)?.name   ?? code;
  const isChartPair = CHART_SUPPORTED.has(fromCurrency) && CHART_SUPPORTED.has(toCurrency);

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <article className="space-y-8">

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Globe className="h-8 w-8 text-blue-600" />
          Real-Time Currency Converter
        </h1>
        <div className="flex items-center gap-3">
          {/* Live rates badge */}
          <ClientOnly>
            {ratesLoading ? (
              <span className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-bold text-gray-400">
                <RefreshCcw className="h-3.5 w-3.5 animate-spin" /> Loading…
              </span>
            ) : ratesError ? (
              <span className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 text-xs font-bold text-red-500">
                <AlertCircle className="h-3.5 w-3.5" /> Rate error
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 text-xs font-bold text-green-600 dark:text-green-400">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Live Rates
                {lastUpdated && (
                  <span className="ml-1 text-gray-400">
                    {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </span>
            )}
          </ClientOnly>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </header>

      {/* API error banner */}
      {ratesError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 px-5 py-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400 font-medium flex-1">
            Could not load live exchange rates. Check your connection.
          </p>
          <button
            onClick={fetchRates}
            className="flex items-center gap-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 px-3 py-1.5 text-xs font-bold text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Converter card */}
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-end">

          {/* Amount */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-gray-400">{sym(fromCurrency)}</span>
              <input
                type="number"
                value={amount}
                min={1}
                max={10_000_000}
                onChange={e => setAmount(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-4 text-lg font-black text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400 shadow-sm"
              />
            </div>
            <input
              type="range"
              value={amount}
              min={1}
              max={10_000_000}
              step={100}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-bold">
              <span>$1</span><span>$10,000,000</span>
            </div>
          </div>

          {/* From */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">From</label>
            <select
              value={fromCurrency}
              onChange={e => setFrom(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} – {c.name}</option>
              ))}
            </select>
          </div>

          {/* Swap */}
          <div className="flex justify-center pb-2 no-print">
            <button
              onClick={swap}
              aria-label="Swap currencies"
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
              onChange={e => setTo(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} – {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        <div className="mt-10 text-center space-y-3 p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/30 print:bg-gray-50 print:border-gray-200">
          <ClientOnly>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              {amount.toLocaleString()} {fromCurrency} =
            </p>
          </ClientOnly>
          <motion.h2
            key={`${result}-${toCurrency}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white"
          >
            <ClientOnly fallback={<span>—</span>}>
              {ratesLoading
                ? <RefreshCcw className="inline h-10 w-10 animate-spin text-blue-400" />
                : `${sym(toCurrency)}${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              }
            </ClientOnly>
          </motion.h2>
          <ClientOnly>
            {!ratesLoading && !ratesError && allRates && (
              <p className="text-sm text-blue-600 font-black dark:text-blue-400">
                1 {fromCurrency} = {rate.toFixed(6)} {toCurrency}
              </p>
            )}
          </ClientOnly>
        </div>

        {/* Popular pairs */}
        <div className="mt-6 no-print">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Popular pairs</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_PAIRS.map(([f, t]) => (
              <button
                key={`${f}-${t}`}
                onClick={() => { setFrom(f); setTo(t); }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                  fromCurrency === f && toCurrency === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {f}/{t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trend Chart ──────────────────────────────────────────────── */}
      {isChartPair && (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                {fromCurrency} → {toCurrency} Historical Rate
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Powered by Frankfurter / European Central Bank</p>
            </div>
            <div className="flex gap-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
              {(['7D', '1M', '1Y'] as TrendRange[]).map(r => (
                <button
                  key={r}
                  onClick={() => setTrendRange(r)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-colors ${
                    trendRange === r
                      ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <ClientOnly fallback={
            <div className="h-56 rounded-2xl bg-gray-50 dark:bg-gray-800 animate-pulse" />
          }>
            {trendLoading ? (
              <div className="h-56 flex items-center justify-center">
                <RefreshCcw className="h-6 w-6 text-blue-400 animate-spin" />
              </div>
            ) : trendError ? (
              <div className="h-56 flex flex-col items-center justify-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <p className="text-sm text-red-500 dark:text-red-400 font-medium text-center">
                  Could not load historical data. Check your connection.
                </p>
                <button
                  onClick={() => fetchTrend(fromCurrency, toCurrency, trendRange)}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <RefreshCcw className="h-3.5 w-3.5" /> Retry
                </button>
              </div>
            ) : trendData.length > 1 ? (
              <ResponsiveContainer width="100%" height={224}>
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} />
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
                    width={58}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#trendGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              /* Shouldn't normally be reached — shows spinner to avoid empty flash */
              <div className="h-56 flex items-center justify-center">
                <RefreshCcw className="h-6 w-6 text-blue-400 animate-spin" />
              </div>
            )}
          </ClientOnly>
        </section>
      )}

      {/* Info cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        {[
          {
            icon: <TrendingUp className="h-5 w-5 text-green-600" />,
            bg: 'bg-green-50 dark:bg-green-900/20',
            title: 'Live Exchange Rates',
            body: 'Rates are pulled in real-time from the open.er-api.com API, refreshed every page load.',
          },
          {
            icon: <Coins className="h-5 w-5 text-blue-600" />,
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            title: '20 Major Currencies',
            body: 'Convert between USD, EUR, GBP, INR, JPY, AED, CAD, AUD, SGD, CNY and more.',
          },
          {
            icon: <ShieldCheck className="h-5 w-5 text-amber-600" />,
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            title: 'Private & Secure',
            body: 'Conversions happen entirely in your browser. No data is sent to our servers.',
          },
        ].map(({ icon, bg, title, body }) => (
          <div key={title} className="rounded-2xl border border-gray-100 p-6 dark:border-gray-800 bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      {/* FAQ */}
      {tool.faqs && tool.faqs.length > 0 && (
        <section className="space-y-6 no-print">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tool.faqs.map((faq: any, i: number) => (
              <article key={i} className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
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
