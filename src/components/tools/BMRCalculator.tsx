import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  Info, 
  Copy, 
  Check, 
  Calculator, 
  Printer,
  ArrowRight,
  Activity,
  User,
  Share2,
  Zap,
  Flame
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { CalculatorInput } from '../CalculatorInput';

interface BMRCalculatorProps {
  tool: any;
}

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9
};

export const BMRCalculator: React.FC<BMRCalculatorProps> = ({ tool }) => {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(175);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(9);
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    let weightKg = 0;
    let heightCm = 0;

    if (unit === 'metric') {
      weightKg = Number(weight);
      heightCm = Number(height);
    } else {
      weightKg = Number(weight) * 0.453592;
      heightCm = (Number(heightFt || 0) * 12 + Number(heightIn || 0)) * 2.54;
    }

    if (heightCm <= 0 || weightKg <= 0 || age <= 0) return null;

    // Mifflin-St Jeor Equation
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;

    return {
      bmr: Math.round(bmr),
      maintenance: {
        sedentary: Math.round(bmr * ACTIVITY_FACTORS.sedentary),
        light: Math.round(bmr * ACTIVITY_FACTORS.light),
        moderate: Math.round(bmr * ACTIVITY_FACTORS.moderate),
        active: Math.round(bmr * ACTIVITY_FACTORS.active),
        veryActive: Math.round(bmr * ACTIVITY_FACTORS.veryActive)
      }
    };
  }, [weight, height, heightFt, heightIn, unit, gender, age]);

  const handleCopy = () => {
    if (!results) return;
    const text = `BMR Report:
BMR: ${results.bmr} kcal
Sedentary: ${results.maintenance.sedentary} kcal
Moderate: ${results.maintenance.moderate} kcal
Active: ${results.maintenance.active} kcal`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold">
          <Flame className="h-4 w-4" />
          Health Tools
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">BMR Calculator Online Free</motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Calculate your Basal Metabolic Rate (BMR) to understand how many calories your body burns at rest.</motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xl dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Your Stats
              </h3>
              <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                <button onClick={() => setUnit('metric')} className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", unit === 'metric' ? "bg-white shadow-sm text-blue-600 dark:bg-gray-700 dark:text-blue-400" : "text-gray-500")}>Metric</button>
                <button onClick={() => setUnit('imperial')} className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", unit === 'imperial' ? "bg-white shadow-sm text-blue-600 dark:bg-gray-700 dark:text-blue-400" : "text-gray-500")}>Imperial</button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><User className="h-4 w-4" /> Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <CalculatorInput label="Age" value={age} onChange={setAge} min={1} max={120} />
              </div>

              <CalculatorInput label={`Weight (${unit === 'metric' ? 'kg' : 'lbs'})`} value={weight} onChange={setWeight} min={1} max={500} step={0.1} />

              {unit === 'metric' ? (
                <CalculatorInput label="Height (cm)" value={height} onChange={setHeight} min={50} max={300} step={1} />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <CalculatorInput label="Height (ft)" value={heightFt} onChange={setHeightFt} min={1} max={10} step={1} />
                  <CalculatorInput label="Height (in)" value={heightIn} onChange={setHeightIn} min={0} max={11} step={1} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xl dark:bg-gray-900 dark:border-gray-800 min-h-[500px] flex flex-col">
            {results ? (
              <div className="space-y-8 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your BMR Result</h3>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 transition-colors">{copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}</button>
                    <button onClick={() => window.print()} className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 transition-colors"><Printer className="h-5 w-5" /></button>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center py-4">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
                    <h2 className="text-8xl font-black text-gray-900 dark:text-white tabular-nums">{results.bmr}</h2>
                    <div className="absolute -top-4 -right-8 px-4 py-1 rounded-full text-xs font-black text-white shadow-lg bg-blue-600">kcal / Day</div>
                  </motion.div>
                  <p className="mt-4 text-lg font-bold text-gray-500 dark:text-gray-400">Basal Metabolic Rate</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Maintenance Calories</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: 'Sedentary', value: results.maintenance.sedentary, color: 'bg-gray-500' },
                      { label: 'Lightly Active', value: results.maintenance.light, color: 'bg-blue-400' },
                      { label: 'Moderately Active', value: results.maintenance.moderate, color: 'bg-blue-500' },
                      { label: 'Very Active', value: results.maintenance.active, color: 'bg-blue-600' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-2 w-2 rounded-full", item.color)} />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{item.label}</span>
                        </div>
                        <span className="font-black text-gray-900 dark:text-white">{item.value} kcal</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                <Calculator className="h-16 w-16 mb-4 opacity-10" />
                <p className="font-bold">Enter your details to calculate your BMR</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Related Health Tools</h2>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'BMI Calculator', icon: 'Scale', color: 'bg-blue-50 text-blue-600', slug: 'bmi-calculator' },
            { name: 'Calorie Calculator', icon: 'Zap', color: 'bg-orange-50 text-orange-600', slug: 'calorie-calculator' },
            { name: 'Ideal Weight', icon: 'Scale', color: 'bg-green-50 text-green-600', slug: 'ideal-weight-calculator' },
            { name: 'Body Fat %', icon: 'TrendingUp', color: 'bg-purple-50 text-purple-600', slug: 'body-fat-calculator' },
          ].map((item) => (
            <a key={item.slug} href={`/tools/${item.slug}`} className="group p-6 rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 dark:bg-gray-900 dark:border-gray-800">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", item.color)}><Calculator className="h-6 w-6" /></div>
              <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{item.name}</h4>
              <p className="text-xs text-gray-500 mt-1">Calculate your {item.name.toLowerCase()} instantly.</p>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
};
