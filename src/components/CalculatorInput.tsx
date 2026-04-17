import React from 'react';
import { cn } from '../lib/utils';
import { ClientOnly } from './ClientOnly';

interface CalculatorInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  id?: string;
}

export const CalculatorInput: React.FC<CalculatorInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  className,
  id
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(0); // Allow empty temporarily or set to 0
      return;
    }
    const numVal = Number(val);
    if (!isNaN(numVal)) {
      onChange(numVal);
    }
  };

  const handleBlur = () => {
    // Clamp value on blur
    const clamped = Math.min(Math.max(value, min), max);
    onChange(clamped);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-gray-500 dark:text-gray-400 font-bold">
              {prefix}
            </span>
          )}
          <input
            id={inputId}
            type="number"
            value={value === 0 && min > 0 ? '' : value}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={cn(
              "w-full sm:w-32 rounded-xl border-gray-200 bg-gray-50 py-2 font-bold text-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400 text-right",
              prefix ? "pl-8" : "pl-3",
              suffix ? "pr-8" : "pr-3"
            )}
            placeholder={min.toString()}
          />
          {suffix && (
            <span className="absolute right-3 text-gray-500 dark:text-gray-400 font-medium">
              {suffix}
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value > max ? max : value < min ? min : value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-gray-700"
      />
      <div className="flex justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wider">
        <ClientOnly fallback={<span>{prefix}{min}{!prefix && suffix}</span>}>
          <span>{prefix}{min.toLocaleString()}{!prefix && suffix}</span>
        </ClientOnly>
        <ClientOnly fallback={<span>{prefix}{max}{!prefix && suffix}</span>}>
          <span>{prefix}{max.toLocaleString()}{!prefix && suffix}</span>
        </ClientOnly>
      </div>
    </div>
  );
};
