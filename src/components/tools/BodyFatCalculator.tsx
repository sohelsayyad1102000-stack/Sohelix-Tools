import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  Info, 
  Copy, 
  Check, 
  Calculator, 
  Printer,
  ArrowRight,
  User,
  Share2,
  TrendingUp,
  Flame,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { CalculatorInput } from '../CalculatorInput';

interface BodyFatCalculatorProps {
  tool: any;
}

export const BodyFatCalculator: React.FC<BodyFatCalculatorProps> = ({ tool }) => {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(25);
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(175);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(9);
  const [neck, setNeck] = useState<number>(38);
  const [waist, setWaist] = useState<number>(85);
  const [hip, setHip] = useState<number>(95);
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    let h = 0, n = 0, w = 0, hp = 0;

    if (unit === 'metric') {
      h = height;
      n = neck;
      w = waist;
      hp = hip;
    } else {
      h = (heightFt * 12 + heightIn) * 2.54;
      n = neck * 2.54;
      w = waist * 2.54;
      hp = hip * 2.54;
    }

    if (h <= 0 || n <= 0 || w <= 0 || (gender === 'female' && hp <= 0)) return null;

    let bodyFat = 0;
    if (gender === 'male') {
      // US Navy Method for Men
      bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    } else {
      // US Navy Method for Women
      bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(w + hp - n) + 0.22100 * Math.log10(h)) - 450;
    }

    const fatMass = (weight * bodyFat) / 100;
    const leanMass = weight - fatMass;

    let category = '';
    let color = '';
    if (gender === 'male') {
      if (bodyFat < 6) { category = 'Essential Fat'; color = 'text-blue-500'; }
      else if (bodyFat < 14) { category = 'Athletes'; color = 'text-green-500'; }
      else if (bodyFat < 18) { category = 'Fitness'; color = 'text-green-600'; }
      else if (bodyFat < 25) { category = 'Average'; color = 'text-yellow-500'; }
      else { category = 'Obese'; color = 'text-red-500'; }
    } else {
      if (bodyFat < 14) { category = 'Essential Fat'; color = 'text-blue-500'; }
      else if (bodyFat < 21) { category = 'Athletes'; color = 'text-green-500'; }
      else if (bodyFat < 25) { category = 'Fitness'; color = 'text-green-600'; }
      else if (bodyFat < 32) { category = 'Average'; color = 'text-yellow-500'; }
      else { category = 'Obese'; color = 'text-red-500'; }
    }

    return {
      bodyFat: Number(bodyFat.toFixed(1)),
      fatMass: Number(fatMass.toFixed(1)),
      leanMass: Number(leanMass.toFixed(1)),
      category,
      color
    };
  }, [height, heightFt, heightIn, neck, waist, hip, unit, gender, weight]);

  const handleCopy = () => {
    if (!results) return;
    const text = `Body Fat Report:
Body Fat: ${results.bodyFat}% (${results.category})
Fat Mass: ${results.fatMass} kg
Lean Mass: ${results.leanMass} kg`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm font-bold">
          <Flame className="h-4 w-4" />
          Health Tools
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">Body Fat Calculator Online Free</motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Estimate your body fat percentage using the US Navy Method based on body measurements.</motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xl dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Measurements
              </h3>
              <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                <button onClick={() => setUnit('metric')} className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", unit === 'metric' ? "bg-white shadow-sm text-purple-600 dark:bg-gray-700 dark:text-purple-400" : "text-gray-500")}>Metric</button>
                <button onClick={() => setUnit('imperial')} className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-all", unit === 'imperial' ? "bg-white shadow-sm text-purple-600 dark:bg-gray-700 dark:text-purple-400" : "text-gray-500")}>Imperial</button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><User className="h-4 w-4" /> Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
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

              <CalculatorInput label={`Neck (${unit === 'metric' ? 'cm' : 'in'})`} value={neck} onChange={setNeck} min={10} max={100} step={0.1} />
              <CalculatorInput label={`Waist (${unit === 'metric' ? 'cm' : 'in'})`} value={waist} onChange={setWaist} min={30} max={250} step={0.1} />
              {gender === 'female' && (
                <CalculatorInput label={`Hip (${unit === 'metric' ? 'cm' : 'in'})`} value={hip} onChange={setHip} min={30} max={250} step={0.1} />
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xl dark:bg-gray-900 dark:border-gray-800 min-h-[500px] flex flex-col">
            {results ? (
              <div className="space-y-8 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Body Fat Result</h3>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 transition-colors">{copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}</button>
                    <button onClick={() => window.print()} className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 transition-colors"><Printer className="h-5 w-5" /></button>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center py-4">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
                    <h2 className="text-8xl font-black text-gray-900 dark:text-white tabular-nums">{results.bodyFat}</h2>
                    <div className="absolute -top-4 -right-8 px-4 py-1 rounded-full text-xs font-black text-white shadow-lg bg-purple-600">% Fat</div>
                  </motion.div>
                  <p className={cn("mt-4 text-lg font-bold", results.color)}>{results.category}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-bold text-gray-500 uppercase">Fat Mass</span>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{results.fatMass} <span className="text-sm font-normal text-gray-500">kg</span></p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-bold text-gray-500 uppercase">Lean Mass</span>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{results.leanMass} <span className="text-sm font-normal text-gray-500">kg</span></p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100 dark:bg-purple-900/10 dark:border-purple-900/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-bold text-purple-900 dark:text-purple-400">US Navy Method</span>
                  </div>
                  <p className="text-xs text-purple-800/70 dark:text-purple-400/70 leading-relaxed">
                    The US Navy Method uses body measurements to estimate body fat percentage. It is a widely used and relatively accurate non-invasive method.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                <Calculator className="h-16 w-16 mb-4 opacity-10" />
                <p className="font-bold">Enter your measurements to calculate your body fat %</p>
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
            { name: 'BMR Calculator', icon: 'Activity', color: 'bg-blue-50 text-blue-600', slug: 'bmr-calculator' },
            { name: 'Ideal Weight', icon: 'Scale', color: 'bg-green-50 text-green-600', slug: 'ideal-weight-calculator' },
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
