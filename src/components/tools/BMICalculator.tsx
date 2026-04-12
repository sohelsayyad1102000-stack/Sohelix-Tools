import React, { useState, useEffect } from 'react';
import { Scale, Ruler, Info, AlertCircle, CheckCircle2, Download, Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BMICalculatorProps {
  tool: any;
}

export const BMICalculator: React.FC<BMICalculatorProps> = ({ tool }) => {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [heightFt, setHeightFt] = useState<number | ''>('');
  const [heightIn, setHeightIn] = useState<number | ''>('');
  
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const calculateBMI = () => {
    let weightKg = 0;
    let heightM = 0;

    if (unit === 'metric') {
      if (!weight || !height) return;
      weightKg = Number(weight);
      heightM = Number(height) / 100;
    } else {
      if (!weight || !heightFt || !heightIn) return;
      weightKg = Number(weight) * 0.453592;
      heightM = (Number(heightFt) * 12 + Number(heightIn)) * 0.0254;
    }

    if (heightM > 0) {
      const bmiValue = weightKg / (heightM * heightM);
      setBmi(Number(bmiValue.toFixed(1)));
      
      if (bmiValue < 18.5) {
        setCategory('Underweight');
        setColor('text-blue-500');
      } else if (bmiValue < 25) {
        setCategory('Normal weight');
        setColor('text-green-500');
      } else if (bmiValue < 30) {
        setCategory('Overweight');
        setColor('text-yellow-500');
      } else {
        setCategory('Obese');
        setColor('text-red-500');
      }
    }
  };

  useEffect(() => {
    calculateBMI();
  }, [weight, height, heightFt, heightIn, unit]);

  const getResultText = () => {
    let text = `BMI Calculation Results:\n`;
    if (unit === 'metric') {
      text += `Weight: ${weight} kg\nHeight: ${height} cm\n`;
    } else {
      text += `Weight: ${weight} lbs\nHeight: ${heightFt} ft ${heightIn} in\n`;
    }
    text += `\nBMI: ${bmi}\nCategory: ${category}`;
    return text;
  };

  const copyResults = () => {
    if (!bmi) return;
    navigator.clipboard.writeText(getResultText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResults = () => {
    if (!bmi) return;
    const blob = new Blob([getResultText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bmi_calculation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
      {/* Main Area */}
      <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Body Mass Index Calculator</h3>
          <div className="flex gap-4">
            {bmi && (
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
            )}
            <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <button
                onClick={() => setUnit('metric')}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  unit === 'metric' ? "bg-white shadow-sm text-blue-600 dark:bg-gray-700 dark:text-blue-400" : "text-gray-500"
                )}
              >
                Metric
              </button>
              <button
                onClick={() => setUnit('imperial')}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  unit === 'imperial' ? "bg-white shadow-sm text-blue-600 dark:bg-gray-700 dark:text-blue-400" : "text-gray-500"
                )}
              >
                Imperial
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Scale className="h-4 w-4 text-blue-600" />
                Weight ({unit === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                placeholder={unit === 'metric' ? 'e.g. 70' : 'e.g. 154'}
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 text-lg focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {unit === 'metric' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-blue-600" />
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 175"
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 text-lg focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Height (ft)</label>
                  <input
                    type="number"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value ? Number(e.target.value) : '')}
                    placeholder="5"
                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 text-lg focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Height (in)</label>
                  <input
                    type="number"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value ? Number(e.target.value) : '')}
                    placeholder="9"
                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 text-lg focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
            {bmi ? (
              <div className="text-center">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Your BMI</p>
                <h2 className="text-6xl font-black text-gray-900 dark:text-white mb-2">{bmi}</h2>
                <p className={cn("text-xl font-bold", color)}>{category}</p>
                
                <div className="mt-8 w-full max-w-xs space-y-2">
                  <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex">
                    <div className="h-full bg-blue-400" style={{ width: '18.5%' }}></div>
                    <div className="h-full bg-green-400" style={{ width: '6.5%' }}></div>
                    <div className="h-full bg-yellow-400" style={{ width: '5%' }}></div>
                    <div className="h-full bg-red-400" style={{ width: '70%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Info className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Enter your details to calculate BMI</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Healthy BMI Range
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            A healthy BMI for most adults is between <strong>18.5 and 24.9</strong>. 
            BMI is a useful measure of overweight and obesity, but it is not a direct measure of body fat. 
            It is calculated from your height and weight.
          </p>
        </div>
      </div>

      {/* Sidebar Info */}
      <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30">
        <h3 className="font-bold text-gray-900 dark:text-white mb-6">BMI Categories</h3>
        <div className="space-y-4">
          {[
            { range: '< 18.5', label: 'Underweight', color: 'bg-blue-500' },
            { range: '18.5 - 24.9', label: 'Normal', color: 'bg-green-500' },
            { range: '25.0 - 29.9', label: 'Overweight', color: 'bg-yellow-500' },
            { range: '30.0 +', label: 'Obese', color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className={cn("h-3 w-3 rounded-full", item.color)}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
              </div>
              <span className="text-xs font-bold text-gray-500">{item.range}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/50">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
            <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
              <strong>Note:</strong> BMI does not account for muscle mass, bone density, overall body composition, and racial and sex differences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
