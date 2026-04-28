import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  Ruler, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Calculator, 
  Printer,
  ArrowRight,
  Heart,
  Activity,
  User,
  Share2,
  TrendingUp,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { CalculatorInput } from './CalculatorInput';

interface BMICalculatorProps {
  tool: any;
}

export const BMICalculator: React.FC<BMICalculatorProps> = ({ tool }) => {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(175);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(9);
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
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

    if (heightM <= 0 || weightKg <= 0) return null;

    const bmiValue = weightKg / (heightM * heightM);
    const bmi = Number(bmiValue.toFixed(1));
    
    let category = '';
    let color = '';
    let bgColor = '';
    let description = '';
    let healthStatus = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-blue-500';
      bgColor = 'bg-blue-500';
      description = 'You are in the underweight range. Consider consulting a healthcare provider about potential nutritional needs.';
      healthStatus = 'Consider gaining weight';
    } else if (bmi < 25) {
      category = 'Normal';
      color = 'text-green-500';
      bgColor = 'bg-green-500';
      description = 'You are in a healthy weight range. Maintaining this range reduces risks of weight-related health issues.';
      healthStatus = 'You are in a healthy range';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'text-yellow-500';
      bgColor = 'bg-yellow-500';
      description = 'You are in the overweight range. A balanced diet and regular physical activity are recommended.';
      healthStatus = 'Consider maintaining weight';
    } else {
      category = 'Obese';
      color = 'text-red-500';
      bgColor = 'bg-red-500';
      description = 'You are in the obese range. It is highly recommended to consult a healthcare provider for a personalized health plan.';
      healthStatus = 'Consider weight management';
    }

    // Ideal Weight (Devine Formula)
    let idealWeight = 0;
    const heightInches = heightM / 0.0254;
    const baseHeight = 60; // 5 feet
    if (heightInches > baseHeight) {
      const extraInches = heightInches - baseHeight;
      if (gender === 'male') {
        idealWeight = 50 + (2.3 * extraInches);
      } else {
        idealWeight = 45.5 + (2.3 * extraInches);
      }
    } else {
      idealWeight = gender === 'male' ? 50 : 45.5;
    }

    // BMI Prime
    const bmiPrime = Number((bmi / 25).toFixed(2));

    // Healthy Weight Range (BMI 18.5 - 25)
    const minHealthyWeight = 18.5 * (heightM * heightM);
    const maxHealthyWeight = 25 * (heightM * heightM);

    return { 
      bmi, 
      category, 
      color, 
      bgColor,
      description, 
      healthStatus,
      idealWeight: Number(idealWeight.toFixed(1)),
      bmiPrime,
      healthyRange: {
        min: Number(minHealthyWeight.toFixed(1)),
        max: Number(maxHealthyWeight.toFixed(1))
      }
    };
  }, [weight, height, heightFt, heightIn, unit, gender]);

  const handleCopy = () => {
    if (!results) return;
    const text = `BMI Report:
BMI: ${results.bmi} (${results.category})
Weight: ${weight} ${unit === 'metric' ? 'kg' : 'lbs'}
Height: ${unit === 'metric' ? height + ' cm' : heightFt + ' ft ' + heightIn + ' in'}
Ideal Weight: ${results.idealWeight} kg
Healthy Range: ${results.healthyRange.min} - ${results.healthyRange.max} kg`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGaugePosition = (bmi: number) => {
    const min = 15;
    const max = 40;
    const percentage = ((bmi - min) / (max - min)) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  return (
    <article className="max-w-5xl mx-auto space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xl dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-600" />
                Your Stats
              </h3>
              <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                <button
                  onClick={() => setUnit('metric')}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    unit === 'metric' ? "bg-white shadow-sm text-blue-600 dark:bg-gray-700 dark:text-blue-400" : "text-gray-500"
                  )}
                >
                  Metric
                </button>
                <button
                  onClick={() => setUnit('imperial')}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    unit === 'imperial' ? "bg-white shadow-sm text-blue-600 dark:bg-gray-700 dark:text-blue-400" : "text-gray-500"
                  )}
                >
                  Imperial
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="h-4 w-4" /> Gender
                  </label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <CalculatorInput
                  label="Age"
                  value={age}
                  onChange={setAge}
                  min={2}
                  max={120}
                />
              </div>

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

            <div className="mt-8 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
              <div className="flex gap-3">
                <Zap className="h-5 w-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800/70 dark:text-blue-400/70 leading-relaxed font-medium">
                  Results update instantly as you change values. No need to click calculate!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Result Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xl dark:bg-gray-900 dark:border-gray-800 min-h-[500px] flex flex-col">
            {results ? (
              <div className="space-y-8 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Result</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCopy}
                      className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 transition-colors"
                    >
                      {copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 transition-colors"
                    >
                      <Printer className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center py-4">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                  >
                    <h2 className="text-8xl font-black text-gray-900 dark:text-white tabular-nums">
                      {results.bmi}
                    </h2>
                    <div className={cn(
                      "absolute -top-4 -right-8 px-4 py-1 rounded-full text-xs font-black text-white shadow-lg",
                      results.bgColor
                    )}>
                      {results.category}
                    </div>
                  </motion.div>
                  <p className="mt-4 text-lg font-bold text-gray-500 dark:text-gray-400">
                    {results.healthStatus}
                  </p>
                </div>

                {/* BMI Gauge */}
                <div className="space-y-4">
                  <div className="relative h-4 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex shadow-inner">
                    <div className="h-full bg-blue-400" style={{ width: '14%' }} title="Underweight"></div>
                    <div className="h-full bg-green-400" style={{ width: '26%' }} title="Normal"></div>
                    <div className="h-full bg-yellow-400" style={{ width: '20%' }} title="Overweight"></div>
                    <div className="h-full bg-red-400" style={{ width: '40%' }} title="Obese"></div>
                    
                    {/* Indicator */}
                    <motion.div 
                      className="absolute top-0 h-full w-1 bg-gray-900 dark:bg-white shadow-lg z-10"
                      initial={{ left: '0%' }}
                      animate={{ left: `${getGaugePosition(results.bmi)}%` }}
                      transition={{ type: 'spring', stiffness: 50 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>15</span>
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>40+</span>
                  </div>
                </div>

                {/* Health Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-xs font-bold text-gray-500 uppercase">Ideal Weight</span>
                    </div>
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                      {results.idealWeight} <span className="text-sm font-normal text-gray-500">kg</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">Based on Devine formula</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-bold text-gray-500 uppercase">Healthy Range</span>
                    </div>
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                      {results.healthyRange.min} - {results.healthyRange.max} <span className="text-sm font-normal text-gray-500">kg</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">For your height</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-purple-500" />
                      <span className="text-xs font-bold text-gray-500 uppercase">BMI Prime</span>
                    </div>
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                      {results.bmiPrime}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">Ratio to upper limit (25.0)</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-bold text-gray-500 uppercase">Daily Calories</span>
                    </div>
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                      {Math.round(results.idealWeight * 30)} <span className="text-sm font-normal text-gray-500">kcal</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">Estimated maintenance</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
                  <p className="text-xs text-blue-800/70 dark:text-blue-400/70 leading-relaxed italic">
                    "{results.description}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                <Calculator className="h-16 w-16 mb-4 opacity-10" />
                <p className="font-bold">Enter your weight and height to see your BMI analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Tools Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Related Health Tools</h2>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Calorie Calculator', icon: 'Zap', color: 'bg-orange-50 text-orange-600', slug: 'calorie-calculator' },
            { name: 'BMR Calculator', icon: 'Activity', color: 'bg-blue-50 text-blue-600', slug: 'bmr-calculator' },
            { name: 'Ideal Weight', icon: 'Scale', color: 'bg-green-50 text-green-600', slug: 'ideal-weight-calculator' },
            { name: 'Body Fat %', icon: 'TrendingUp', color: 'bg-purple-50 text-purple-600', slug: 'body-fat-calculator' },
          ].map((item) => (
            <Link 
              key={item.slug}
              to={`/tools/${item.slug}`}
              className="group p-6 rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 dark:bg-gray-900 dark:border-gray-800"
            >
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", item.color)}>
                <Calculator className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{item.name}</h4>
              <p className="text-xs text-gray-500 mt-1">Calculate your {item.name.toLowerCase()} instantly.</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      {tool.faqs && tool.faqs.length > 0 && (
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">BMI Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tool.faqs.map((faq: any, index: number) => (
              <article key={index} className="p-8 rounded-3xl bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {faq.question}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
