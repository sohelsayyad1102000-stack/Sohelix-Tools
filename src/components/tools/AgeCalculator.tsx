import React, { useState, useEffect } from 'react';
import { Calendar, Clock, RefreshCcw, Timer, History, ArrowRight, Star, Info, Calculator, Download, Copy, Check, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface AgeCalculatorProps {
  tool: any;
}

interface AgeResult {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  nextBirthday: {
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export const AgeCalculator: React.FC<AgeCalculatorProps> = ({ tool }) => {
  const [dob, setDob] = useState('2000-01-01');
  const [tob, setTob] = useState('00:00');
  const [result, setResult] = useState<AgeResult | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!dob) return;

    const calculate = () => {
      const birthDate = new Date(`${dob}T${tob || '00:00'}`);
      const now = new Date();

      if (birthDate > now) return;

      // Basic Age
      let years = now.getFullYear() - birthDate.getFullYear();
      let months = now.getMonth() - birthDate.getMonth();
      let days = now.getDate() - birthDate.getDate();

      if (days < 0) {
        months--;
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      // Time components
      const diffMs = now.getTime() - birthDate.getTime();
      const totalSeconds = Math.floor(diffMs / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalDays = Math.floor(totalHours / 24);
      const totalWeeks = Math.floor(totalDays / 7);

      const hours = now.getHours() - birthDate.getHours();
      const minutes = now.getMinutes() - birthDate.getMinutes();
      const seconds = now.getSeconds() - birthDate.getSeconds();

      // Next Birthday
      let nextBday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      if (nextBday < now) {
        nextBday.setFullYear(now.getFullYear() + 1);
      }
      const nextDiffMs = nextBday.getTime() - now.getTime();
      const nextTotalSec = Math.floor(nextDiffMs / 1000);
      
      const nextMonths = Math.floor(nextTotalSec / (30 * 24 * 3600));
      const nextDays = Math.floor((nextTotalSec % (30 * 24 * 3600)) / (24 * 3600));
      const nextHours = Math.floor((nextTotalSec % (24 * 3600)) / 3600);
      const nextMinutes = Math.floor((nextTotalSec % 3600) / 60);
      const nextSeconds = nextTotalSec % 60;

      setResult({
        years, months, days,
        hours: hours < 0 ? hours + 24 : hours,
        minutes: minutes < 0 ? minutes + 60 : minutes,
        seconds: seconds < 0 ? seconds + 60 : seconds,
        totalDays, totalWeeks, totalHours, totalMinutes, totalSeconds,
        nextBirthday: {
          months: nextMonths,
          days: nextDays,
          hours: nextHours,
          minutes: nextMinutes,
          seconds: nextSeconds
        }
      });
    };

    calculate();
    let interval: any;
    if (isLive) {
      interval = setInterval(calculate, 1000);
    }
    return () => clearInterval(interval);
  }, [dob, tob, isLive]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Age Calculation Results:
Date of Birth: ${dob} ${tob}
Current Age: ${result.years} Years, ${result.months} Months, ${result.days} Days
Total Days: ${result.totalDays.toLocaleString()}
Next Birthday In: ${result.nextBirthday.months} Months, ${result.nextBirthday.days} Days`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Calculator className="h-8 w-8 text-blue-600" />
          {tool.title || 'Age Calculator'}
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsLive(!isLive)}
              className={cn(
                "px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2",
                isLive ? "bg-white shadow-sm text-blue-600 dark:bg-gray-700 dark:text-blue-400" : "text-gray-500"
              )}
            >
              <RefreshCcw className={cn("h-4 w-4", isLive && "animate-spin")} />
              Live
            </button>
          </div>
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
        <h1 className="text-2xl font-black text-gray-900">{tool.title || 'Age Calculator'} Report</h1>
        <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inputs Section */}
        <section className="lg:col-span-1 space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-blue-600 no-print" />
            Birth Details
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-600 no-print" />
                <input 
                  type="date" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 pl-12 pr-4 py-4 font-bold focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Time of Birth (Optional)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-600 no-print" />
                <input 
                  type="time" 
                  value={tob}
                  onChange={(e) => setTob(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 pl-12 pr-4 py-4 font-bold focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="lg:col-span-2 space-y-8">
          {result ? (
            <div className="space-y-8">
              {/* Primary Result Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-2xl print:bg-blue-600 print:text-white">
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-8">Your Current Age</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-5xl md:text-7xl font-black mb-2">{result.years}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Years</div>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl md:text-7xl font-black mb-2">{result.months}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Months</div>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl md:text-7xl font-black mb-2">{result.days}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Days</div>
                    </div>
                  </div>
                  <div className="mt-10 flex justify-center gap-8 text-sm font-black font-mono opacity-90 bg-white/10 py-3 rounded-2xl backdrop-blur-sm print:bg-blue-500">
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4 no-print" /> {result.hours}h</span>
                    <span>{result.minutes}m</span>
                    <span>{result.seconds}s</span>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse no-print" />
                <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl no-print" />
              </div>

              {/* Detailed Breakdown Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Months', value: (result.years * 12 + result.months).toLocaleString() },
                  { label: 'Total Weeks', value: result.totalWeeks.toLocaleString() },
                  { label: 'Total Days', value: result.totalDays.toLocaleString() },
                  { label: 'Total Hours', value: result.totalHours.toLocaleString() },
                  { label: 'Total Minutes', value: result.totalMinutes.toLocaleString() },
                  { label: 'Total Seconds', value: result.totalSeconds.toLocaleString() },
                ].map((item, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow print:border-gray-200">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{item.label}</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Next Birthday Card */}
              <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 print:bg-amber-50 print:border-amber-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest text-xs flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400 no-print" />
                    Next Birthday Countdown
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <p className="text-3xl font-black text-amber-900 dark:text-amber-200">{result.nextBirthday.months}</p>
                    <p className="text-[10px] font-bold text-amber-600 uppercase">Months</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-amber-900 dark:text-amber-200">{result.nextBirthday.days}</p>
                    <p className="text-[10px] font-bold text-amber-600 uppercase">Days</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-amber-900 dark:text-amber-200">{result.nextBirthday.hours}</p>
                    <p className="text-[10px] font-bold text-amber-600 uppercase">Hours</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-amber-900 dark:text-amber-200">{result.nextBirthday.minutes}</p>
                    <p className="text-[10px] font-bold text-amber-600 uppercase">Minutes</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <Timer className="h-16 w-16 text-gray-300 mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enter your birth details</h3>
              <p className="text-sm text-gray-500">We'll calculate your exact age instantly</p>
            </div>
          )}
        </section>
      </div>

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
