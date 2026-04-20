import React from 'react';
import { 
  Calculator, 
  Image, 
  FileText, 
  Maximize2, 
  RotateCcw, 
  LayoutGrid, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  ArrowRightLeft,
  Scissors,
  FileSearch,
  CheckCircle2,
  TrendingUp,
  Percent
} from 'lucide-react';
import { cn } from '../lib/utils';

interface OGCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  slug: string;
  type?: 'tool' | 'category' | 'blog';
}

const OGCard: React.FC<OGCardProps> = ({ title, subtitle, icon: Icon, slug, type = 'tool' }) => {
  const isBlog = type === 'blog';
  const isCategory = type === 'category';

  return (
    <div 
      className={cn(
        "relative w-[1200px] h-[630px] overflow-hidden flex flex-col items-center justify-center text-white font-sans",
        "bg-[#020617]" // Clean dark background
      )}
      id={`og-${slug}`}
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full -mr-64 -mt-64 blur-3xl opacity-60" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full -ml-32 -mb-32 blur-3xl opacity-60" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-24">
        {/* Branding */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 text-3xl font-black tracking-[0.2em] opacity-40">
          SOHELIX.COM
        </div>

        <h1 className={cn(
          "font-black leading-tight mb-6 tracking-tight drop-shadow-2xl",
          title.length > 20 ? "text-[110px]" : "text-[140px]"
        )}>
          {title}
        </h1>
        
        <p className="text-4xl font-medium text-gray-300 max-w-4xl leading-tight mb-12">
          {subtitle}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-4 bg-blue-600 px-10 py-5 rounded-2xl shadow-xl shadow-blue-600/20 text-4xl font-bold">
          Try it now <ArrowRight className="w-10 h-10" />
        </div>
      </div>
    </div>
  );
};

const OG_TEMPLATES: OGCardProps[] = [
  { slug: 'home', title: 'Sohelix Tools', subtitle: '60+ Professional browser tools for fast & secure daily tasks', icon: Zap, type: 'tool' },
  { slug: 'bmi-calculator', title: 'BMI Calculator', subtitle: 'Reach your health goals with instant BMI calculation', icon: Calculator, type: 'tool' },
  { slug: 'qr-code-generator', title: 'QR Code Generator', subtitle: 'Create professional custom QR codes with logos instantly', icon: Zap, type: 'tool' },
  { slug: 'advanced-loan-calculator', title: 'Advanced Loan Calculator', subtitle: 'EMI, Interest & Amortization in seconds', icon: Calculator, type: 'tool' },
  { slug: 'default', title: 'Sohelix Tools', subtitle: 'Smart Tools. Zero Friction. Processing 100% in Browser.', icon: Zap, type: 'tool' },
];

export const OGPreview: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">OG Image Gallery</h1>
        <p className="text-gray-600 dark:text-gray-400 overflow-hidden">
          Preview of the generated social media preview images for Sohelix tools.
          To save these, you can screenshot the desired template or use a headless browser.
        </p>
      </div>

      <div className="flex flex-col gap-32 items-center">
        {OG_TEMPLATES.map((tpl) => (
          <div key={tpl.slug} className="group relative">
            <div className="mb-4 flex items-center justify-between px-4">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{tpl.slug}.png</span>
              <button 
                onClick={() => {
                  const el = document.getElementById(`og-${tpl.slug}`);
                  if (el) {
                    // Logic for saving could go here if html-to-image was installed
                    alert('Template ready for capture. Use a screenshot tool or browser printer.');
                  }
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Ready for Capture
              </button>
            </div>
            <div className="scale-[0.5] origin-top-left -mb-[315px] shadow-2xl rounded-[40px] overflow-hidden">
              <OGCard {...tpl} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
