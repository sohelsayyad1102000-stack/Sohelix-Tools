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
  ArrowRightLeft,
  Scissors,
  FileSearch,
  CheckCircle2,
  TrendingUp,
  Percent,
  Mandi
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
        isBlog ? "bg-gradient-to-br from-[#10B981] to-[#059669]" : // Green for blog
        isCategory ? "bg-gradient-to-br from-[#6366F1] to-[#4338CA]" : // Indigo for categories
        "bg-gradient-to-br from-[#2563EB] to-[#4F46E5]" // Blue for tools
      )}
      id={`og-${slug}`}
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full -mr-64 -mt-64 blur-3xl opacity-60" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-white/[0.02] rotate-12 blur-2xl" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-24">
        {/* Entity Type Badge */}
        <div className="mb-6 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xl font-bold uppercase tracking-widest opacity-80">
          {type}
        </div>

        <div className="mb-10 p-10 bg-white/10 backdrop-blur-2xl rounded-[48px] border border-white/20 shadow-2xl">
          <Icon className="w-24 h-24 text-white" />
        </div>
        
        <h1 className={cn(
          "font-black leading-tight mb-8 tracking-tight drop-shadow-2xl",
          title.length > 20 ? "text-[110px]" : "text-[140px]"
        )}>
          {title}
        </h1>
        
        <p className="text-5xl font-semibold text-white max-w-4xl leading-tight opacity-95">
          {subtitle}
        </p>
      </div>

      {/* Brand Footer Section */}
      <div className="absolute bottom-0 w-full bg-black/10 backdrop-blur-md py-10 px-20 flex items-center justify-between border-t border-white/5">
        <div className="flex flex-col items-start">
          <span className="text-4xl font-black tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className={cn(
                "text-2xl font-black",
                isBlog ? "text-[#059669]" : isCategory ? "text-[#4338CA]" : "text-[#2563EB]"
              )}>S</span>
            </div>
            SOHELIX
          </span>
          <span className="text-xl font-medium text-blue-100/60 mt-1 uppercase tracking-[0.3em]">
            Smart Tools. Zero Friction.
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <span className="text-2xl font-bold px-6 py-2 bg-white/10 rounded-full border border-white/10">
            {isBlog ? 'Read More' : isCategory ? 'Browse Tools' : 'Free To Use'}
          </span>
          <span className="text-2xl font-bold px-6 py-2 bg-white/10 rounded-full border border-white/10">No Login</span>
          <span className="text-2xl font-bold px-6 py-2 bg-white/10 rounded-full border border-white/10">Instant</span>
        </div>
      </div>
    </div>
  );
};

const OG_TEMPLATES: OGCardProps[] = [
  // --- TOOLS ---
  { slug: 'bmi-calculator', title: 'BMI Calculator', subtitle: 'Reach your health goals with instant BMI calculation', icon: Calculator, type: 'tool' },
  { slug: 'emi-calculator', title: 'EMI Calculator', subtitle: 'Plan your loans smarter with precise monthly updates', icon: Percent, type: 'tool' },
  { slug: 'compress-image', title: 'Image Compressor', subtitle: 'Speed up your website with ultra-fast image optimization', icon: Maximize2, type: 'tool' },
  { slug: 'webp-converter', title: 'WebP Converter', subtitle: 'Boost performance with lightweight WebP conversion', icon: ArrowRightLeft, type: 'tool' },
  
  // --- CATEGORIES ---
  { slug: 'image-tools', title: 'Image Tools', subtitle: 'Unlock professional photo editing directly in your browser', icon: Image, type: 'category' },
  { slug: 'finance-tools', title: 'Finance Tools', subtitle: 'Master your money with our collection of smart calculators', icon: TrendingUp, type: 'category' },
  
  // --- BLOG ---
  { slug: 'bmi-guide', title: 'The BMI Guide', subtitle: 'Everything you need to know about tracking your health', icon: FileSearch, type: 'blog' },
  { slug: 'inflation-guide', title: 'Inflation 101', subtitle: 'Protect your purchasing power in an ever-changing economy', icon: TrendingUp, type: 'blog' },
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
