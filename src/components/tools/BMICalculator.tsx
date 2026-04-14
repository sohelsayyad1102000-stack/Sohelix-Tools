import React, { useState, useMemo } from 'react';
import { Scale, Ruler, Info, AlertCircle, CheckCircle2, Download, Copy, Check, RotateCcw, Calculator, Printer } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CalculatorInput } from '../CalculatorInput';

interface BMICalculatorProps {
  tool: any;
}

export const BMICalculator: React.FC<BMICalculatorProps> = ({ tool }) => {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(9);
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    let weightKg = 0;
    let heightM = 0;

    if (unit === 'metric') {
      weightKg = Number(weight);
      heightM = Number(height) / 100;
    } else {
      weightKg = Number(weight) * 0.453592;
      heightM = (Number(heightFt || 0) * 12 + Number(heightIn || 0)) * 0.0254;
    }

    if (heightM <= 0) return null;

    const bmiValue = weightKg / (heightM * heightM);
    const bmi = Number(bmiValue.toFixed(1));
    
    let category = '';
    let color = '';
    let description = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-blue-500';
      description = 'You are in the underweight range. Consider consulting a healthcare provider.';
    } else if (bmi < 25) {
      category = 'Normal weight';
      color = 'text-green-500';
      description = 'You are in the healthy weight range. Maintain your current lifestyle!';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'text-yellow-500';
      description = 'You are in the overweight range. A balanced diet and exercise may help.';
    } else {
      category = 'Obese';
      color = 'text-red-500';
      description = 'You are in the obese range. It is recommended to consult a healthcare provider.';
    }

    return { bmi, category, color, description };
  }, [weight, height, heightFt, heightIn, unit]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!results) return;
    const text = `BMI Calculation Results:
Weight: ${weight} ${unit === 'metric' ? 'kg' : 'lbs'}
Height: ${unit === 'metric' ? height + ' cm' : heightFt + ' ft ' + heightIn + ' in'}
BMI: ${results.bmi}
Category: ${results.category}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Calculator className="h-8 w-8 text-blue-600" />
          {tool.title || 'BMI Calculator'}
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setUnit('metric')}
              className={cn(
                "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                unit === 'metric' ? "bg-white shadow-sm text-blue-600 dark:bg-gray-700 dark:text-blue-400" : "text-gray-500"
              )}
            >
              Metric
            </button>
            <button
              onClick={() => setUnit('imperial')}
              className={cn(
                "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                unit === 'imperial' ? "bg-white shadow-sm text-blue-600 dark:bg-gray-700 dark:text-blue-400" : "text-gray-500"
              )}
            >
              Imperial
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
        <h1 className="text-2xl font-black text-gray-900">{tool.title || 'BMI Calculator'} Report</h1>
        <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inputs Section */}
        <section className="lg:col-span-1 space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900 print:shadow-none print:border-none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <Scale className="h-5 w-5 text-blue-600 no-print" />
            Your Measurements
          </h2>

          <div className="space-y-6">
            <CalculatorInput
              label={`Weight (${unit === 'metric' ? 'kg' : 'lbs'})`}
              value={weight}
              onChange={setWeight}
              min={1}
              max={500}
              step={0.1}
            />

            {unit === 'metric' ? (
              <CalculatorInput
                label="Height (cm)"
                value={height}
                onChange={setHeight}
                min={50}
                max={300}
                step={1}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <CalculatorInput
                  label="Height (ft)"
                  value={heightFt}
                  onChange={setHeightFt}
                  min={1}
                  max={10}
                  step={1}
                />
                <CalculatorInput
                  label="Height (in)"
                  value={heightIn}
                  onChange={setHeightIn}
                  min={0}
                  max={11}
                  step={1}
                />
              </div>
            )}
          </div>
        </section>

        {/* Results Section */}
        <section className="lg:col-span-2 space-y-8">
          <div className="p-8 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 flex flex-col items-center justify-center text-center min-h-[300px] print:bg-blue-50 print:border-blue-200">
            {results ? (
              <div className="space-y-6 w-full max-w-md">
                <div>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Your Body Mass Index</p>
                  <h2 className="text-7xl font-black text-gray-900 dark:text-white">{results.bmi}</h2>
                  <p className={cn("text-2xl font-black mt-2", results.color)}>{results.category}</p>
                </div>

                <div className="w-full space-y-3">
                  <div className="h-4 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex shadow-inner">
                    <div className="h-full bg-blue-400" style={{ width: '18.5%' }} title="Underweight"></div>
                    <div className="h-full bg-green-400" style={{ width: '6.5%' }} title="Normal"></div>
                    <div className="h-full bg-yellow-400" style={{ width: '5%' }} title="Overweight"></div>
                    <div className="h-full bg-red-400" style={{ width: '70%' }} title="Obese"></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {results.description}
                </p>
              </div>
            ) : (
              <div className="text-gray-400">
                <Info className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="font-bold">Enter your details to calculate BMI</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-sm print:border-gray-200">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 no-print" />
                BMI Categories
              </h3>
              <div className="space-y-3">
                {[
                  { range: '< 18.5', label: 'Underweight', color: 'bg-blue-500' },
                  { range: '18.5 - 24.9', label: 'Normal', color: 'bg-green-500' },
                  { range: '25.0 - 29.9', label: 'Overweight', color: 'bg-yellow-500' },
                  { range: '30.0 +', label: 'Obese', color: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", item.color)}></div>
                      <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{item.range}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 print:bg-amber-50 print:border-amber-200">
              <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 no-print" />
                Important Note
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                BMI is a screening tool, not a diagnostic one. It doesn't account for muscle mass, bone density, or body composition. Athletes may have a high BMI due to muscle mass.
              </p>
            </div>
          </div>
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
