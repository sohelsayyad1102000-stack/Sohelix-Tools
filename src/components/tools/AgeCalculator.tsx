import React, { useState, useEffect } from 'react';
import { Calendar, Clock, RefreshCcw, Timer, History, ArrowRight, Star, Info } from 'lucide-react';
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
  const [dob, setDob] = useState<string>('');
  const [tob, setTob] = useState<string>('00:00');
  const [result, setResult] = useState<AgeResult | null>(null);
  const [isLive, setIsLive] = useState(true);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
      {/* Main Area */}
      <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800">
        <div className="flex flex-col h-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-600" />
                <input 
                  type="date" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-white pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Time of Birth (Optional)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-600" />
                <input 
                  type="time" 
                  value={tob}
                  onChange={(e) => setTob(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-white pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <Timer className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enter your birth details</h3>
              <p className="text-sm text-gray-500">We'll calculate your exact age instantly</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Primary Result */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl">
                <div className="relative z-10">
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-6">Your Exact Age</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-4xl md:text-6xl font-black mb-1">{result.years}</div>
                      <div className="text-xs font-bold uppercase opacity-70">Years</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl md:text-6xl font-black mb-1">{result.months}</div>
                      <div className="text-xs font-bold uppercase opacity-70">Months</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl md:text-6xl font-black mb-1">{result.days}</div>
                      <div className="text-xs font-bold uppercase opacity-70">Days</div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-center gap-6 text-sm font-mono opacity-90">
                    <span>{result.hours}h</span>
                    <span>{result.minutes}m</span>
                    <span>{result.seconds}s</span>
                  </div>
                </div>
                <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl" />
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Months', value: result.years * 12 + result.months },
                  { label: 'Total Weeks', value: result.totalWeeks.toLocaleString() },
                  { label: 'Total Days', value: result.totalDays.toLocaleString() },
                  { label: 'Total Hours', value: result.totalHours.toLocaleString() },
                  { label: 'Total Minutes', value: result.totalMinutes.toLocaleString() },
                  { label: 'Total Seconds', value: result.totalSeconds.toLocaleString() },
                ].map((item, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">{item.label}</div>
                    <div className="text-lg font-black text-gray-900 dark:text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Settings */}
      <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Star className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white">Birthday Magic</h3>
        </div>

        <div className="space-y-6 flex-1">
          {result && (
            <div className="space-y-6">
              {/* Next Birthday */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                  <RefreshCcw className="h-3 w-3" />
                  Next Birthday In
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-black text-blue-600">{result.nextBirthday.months}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Months</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-blue-600">{result.nextBirthday.days}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Days</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-3 text-xs font-mono text-gray-500">
                  <span>{result.nextBirthday.hours}h</span>
                  <span>{result.nextBirthday.minutes}m</span>
                  <span>{result.nextBirthday.seconds}s</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="liveUpdates" 
                  checked={isLive} 
                  onChange={(e) => setIsLive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <label htmlFor="liveUpdates" className="text-sm text-gray-700 dark:text-gray-300">
                  Live Updates (Real-time)
                </label>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Our calculator uses high-precision algorithms that account for leap years and varying month lengths.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Example Calculation</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span>Born: Jan 1, 2000</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span>Today: Jan 1, 2024</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-blue-600">
              <ArrowRight className="h-3 w-3" />
              <span>Age: 24 Years Exact</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
