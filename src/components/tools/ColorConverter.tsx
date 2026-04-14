import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  RefreshCcw, 
  Copy, 
  CheckCircle2, 
  ArrowRightLeft,
  Zap,
  History
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const ColorConverter: React.FC = () => {
  const [hex, setHex] = useState('#2563EB');
  const [rgb, setRgb] = useState('rgb(37, 99, 235)');
  const [hsl, setHsl] = useState('hsl(221, 83%, 53%)');
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('color-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const handleHexChange = (val: string) => {
    setHex(val);
    const rgbObj = hexToRgb(val);
    if (rgbObj) {
      const rgbStr = `rgb(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b})`;
      setRgb(rgbStr);
      const hslObj = rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b);
      setHsl(`hsl(${hslObj.h}, ${hslObj.s}%, ${hslObj.l}%)`);
      saveToHistory(val);
    }
  };

  const saveToHistory = (val: string) => {
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val)) return;
    const newHistory = [val, ...history.filter(h => h !== val)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('color-history', JSON.stringify(newHistory));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Area */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-900 dark:text-white">HEX Color Code</label>
              <div className="relative">
                <input 
                  type="text"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="block w-full rounded-2xl border-gray-200 bg-gray-50 px-6 py-4 font-mono text-xl font-bold text-blue-600 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400"
                />
                <div 
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl border-2 border-white shadow-sm dark:border-gray-700"
                  style={{ backgroundColor: hex }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Recent Colors</h4>
              <div className="flex flex-wrap gap-3">
                {history.map((h, i) => (
                  <button 
                    key={i}
                    onClick={() => handleHexChange(h)}
                    className="w-10 h-10 rounded-xl border-2 border-white shadow-sm hover:scale-110 transition-transform dark:border-gray-700"
                    style={{ backgroundColor: h }}
                    title={h}
                  />
                ))}
                {history.length === 0 && <p className="text-xs text-gray-400 italic">No recent colors</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Results */}
        <div className="space-y-4">
          {[
            { label: 'HEX', value: hex },
            { label: 'RGB', value: rgb },
            { label: 'HSL', value: hsl }
          ].map((item) => (
            <div key={item.label} className="group rounded-3xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between hover:border-blue-200 transition-all">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                <code className="text-lg font-mono font-bold text-gray-900 dark:text-white">{item.value}</code>
              </div>
              <button 
                onClick={() => copyToClipboard(item.value, item.label)}
                className="p-3 rounded-2xl bg-gray-50 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600 transition-all dark:bg-gray-800 dark:hover:bg-blue-900/20"
              >
                {copied === item.label ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          ))}

          <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-500/20 flex items-center gap-6">
            <div className="flex-1">
              <h4 className="text-xl font-bold mb-2">Color Preview</h4>
              <p className="text-blue-100 text-sm">See how your color looks in a larger area.</p>
            </div>
            <div 
              className="w-24 h-24 rounded-3xl border-4 border-white/20 shadow-lg"
              style={{ backgroundColor: hex }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
