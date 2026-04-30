import React, { useState, useRef, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { TOOLS } from '../constants/tools';
import { CATEGORY_INFO } from '../constants/categories';
import { SEO } from '../components/SEO';
import { cn, formatBytes } from '../lib/utils';
import { 
  Upload, 
  Download, 
  RefreshCcw, 
  CheckCircle2, 
  ChevronRight,
  Settings2,
  Trash2,
  FileImage,
  Shield,
  Zap,
  Lock,
  MousePointer2,
  Loader2,
  FileText,
  Calculator,
  Zap as ZapIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { DynamicIcon } from '../components/DynamicIcon';
import { 
  compressImage, 
  resizeImage, 
  convertFormat, 
  toBase64, 
  rotateImage, 
  blurImage, 
  watermarkImage, 
  cropImage
} from '../lib/image-processing';

// Heavy Tool Components - Dynamically Imported
const CompressorTool = React.lazy(() => import('../components/tools/CompressorTool').then(m => ({ default: m.CompressorTool })));
const CropperTool = React.lazy(() => import('../components/tools/CropperTool').then(m => ({ default: m.CropperTool })));
const QRCodeGenerator = React.lazy(() => import('../components/tools/QRCodeGenerator').then(m => ({ default: m.QRCodeGenerator })));
const FaviconGenerator = React.lazy(() => import('../components/tools/FaviconGenerator').then(m => ({ default: m.FaviconGenerator })));
const AgeCalculator = React.lazy(() => import('../components/tools/AgeCalculator').then(m => ({ default: m.AgeCalculator })));
const ImageToPDFTool = React.lazy(() => import('../components/tools/ImageToPDFTool').then(m => ({ default: m.ImageToPDFTool })));
const MergePDFTool = React.lazy(() => import('../components/tools/MergePDFTool').then(m => ({ default: m.MergePDFTool })));
const SplitPDFTool = React.lazy(() => import('../components/tools/SplitPDFTool').then(m => ({ default: m.SplitPDFTool })));
const PDFToPNGTool = React.lazy(() => import('../components/tools/PDFToPNGTool').then(m => ({ default: m.PDFToPNGTool })));
const PDFToJPGTool = React.lazy(() => import('../components/tools/PDFToJPGTool').then(m => ({ default: m.PDFToJPGTool })));
const PDFReaderTool = React.lazy(() => import('../components/tools/PDFReaderTool').then(m => ({ default: m.PDFReaderTool })));
const PDFPageCounter = React.lazy(() => import('../components/tools/PDFPageCounter').then(m => ({ default: m.PDFPageCounter })));
const PDFPageRotator = React.lazy(() => import('../components/tools/PDFPageRotator').then(m => ({ default: m.PDFPageRotator })));
const BMICalculator = React.lazy(() => import('../components/BMICalculator').then(m => ({ default: m.BMICalculator })));
const InterestCalculator = React.lazy(() => import('../components/tools/InterestCalculator').then(m => ({ default: m.InterestCalculator })));
const EMICalculator = React.lazy(() => import('../components/tools/EMICalculator').then(m => ({ default: m.EMICalculator })));
const MetaTagGenerator = React.lazy(() => import('../components/tools/MetaTagGenerator').then(m => ({ default: m.MetaTagGenerator })));
const RobotsTxtGenerator = React.lazy(() => import('../components/tools/RobotsTxtGenerator').then(m => ({ default: m.RobotsTxtGenerator })));
const SitemapGenerator = React.lazy(() => import('../components/tools/SitemapGenerator').then(m => ({ default: m.SitemapGenerator })));
const SlugGenerator = React.lazy(() => import('../components/tools/SlugGenerator').then(m => ({ default: m.SlugGenerator })));
const SerpPreview = React.lazy(() => import('../components/tools/SerpPreview').then(m => ({ default: m.SerpPreview })));
const WordCounter = React.lazy(() => import('../components/tools/WordCounter').then(m => ({ default: m.WordCounter })));
const CaseConverter = React.lazy(() => import('../components/tools/CaseConverter').then(m => ({ default: m.CaseConverter })));
const LineSorter = React.lazy(() => import('../components/tools/LineSorter').then(m => ({ default: m.LineSorter })));
const WhitespaceRemover = React.lazy(() => import('../components/tools/WhitespaceRemover').then(m => ({ default: m.WhitespaceRemover })));
const LoremIpsumGenerator = React.lazy(() => import('../components/tools/LoremIpsumGenerator').then(m => ({ default: m.LoremIpsumGenerator })));
const TextToHex = React.lazy(() => import('../components/tools/TextToHex').then(m => ({ default: m.TextToHex })));
const HexToText = React.lazy(() => import('../components/tools/HexToText').then(m => ({ default: m.HexToText })));
const ColorPaletteGenerator = React.lazy(() => import('../components/tools/ColorPaletteGenerator').then(m => ({ default: m.ColorPaletteGenerator })));
const ImageColorPicker = React.lazy(() => import('../components/tools/ImageColorPicker').then(m => ({ default: m.ImageColorPicker })));
const WebPToJPG = React.lazy(() => import('../components/tools/WebPToJPG').then(m => ({ default: m.WebPToJPG })));
const TimestampConverter = React.lazy(() => import('../components/tools/TimestampConverter').then(m => ({ default: m.TimestampConverter })));
const JSONFormatter = React.lazy(() => import('../components/tools/JSONFormatter').then(m => ({ default: m.JSONFormatter })));
const Base64Converter = React.lazy(() => import('../components/tools/Base64Converter').then(m => ({ default: m.Base64Converter })));
const CurrencyConverter = React.lazy(() => import('../components/tools/CurrencyConverter').then(m => ({ default: m.CurrencyConverter })));
const CurrencyDenomination = React.lazy(() => import('../components/tools/CurrencyDenomination').then(m => ({ default: m.CurrencyDenomination })));
const SIPCalculator = React.lazy(() => import('../components/tools/SIPCalculator').then(m => ({ default: m.SIPCalculator })));
const AdvancedLoanCalculator = React.lazy(() => import('../components/tools/AdvancedLoanCalculator').then(m => ({ default: m.AdvancedLoanCalculator })));
const PercentageCalculator = React.lazy(() => import('../components/tools/PercentageCalculator').then(m => ({ default: m.PercentageCalculator })));
const InflationCalculator = React.lazy(() => import('../components/tools/InflationCalculator').then(m => ({ default: m.InflationCalculator })));
const UUIDGenerator = React.lazy(() => import('../components/tools/UUIDGenerator').then(m => ({ default: m.UUIDGenerator })));
const RegexTester = React.lazy(() => import('../components/tools/RegexTester').then(m => ({ default: m.RegexTester })));
const URLEncoderDecoder = React.lazy(() => import('../components/tools/URLEncoderDecoder').then(m => ({ default: m.URLEncoderDecoder })));
const CSVToJSONConverter = React.lazy(() => import('../components/tools/CSVToJSONConverter').then(m => ({ default: m.CSVToJSONConverter })));
const JSONToCSVConverter = React.lazy(() => import('../components/tools/JSONToCSVConverter').then(m => ({ default: m.JSONToCSVConverter })));
const HTMLMinifier = React.lazy(() => import('../components/tools/HTMLMinifier').then(m => ({ default: m.HTMLMinifier })));
const CSSMinifier = React.lazy(() => import('../components/tools/CSSMinifier').then(m => ({ default: m.CSSMinifier })));
const ResizeImageTool = React.lazy(() => import('../components/tools/ResizeImageTool').then(m => ({ default: m.ResizeImageTool })));
const JSMinifier = React.lazy(() => import('../components/tools/JSMinifier').then(m => ({ default: m.JSMinifier })));
const ColorConverter = React.lazy(() => import('../components/tools/ColorConverter').then(m => ({ default: m.ColorConverter })));
const JpgToPngConverter = React.lazy(() => import('../components/tools/JpgToPngConverter').then(m => ({ default: m.JpgToPngConverter })));
const WebPConverter = React.lazy(() => import('../components/tools/WebPConverter').then(m => ({ default: m.WebPConverter })));
const GenericImageTool = React.lazy(() => import('../components/tools/GenericImageTool').then(m => ({ default: m.GenericImageTool })));
const CalorieCalculator = React.lazy(() => import('../components/tools/CalorieCalculator').then(m => ({ default: m.CalorieCalculator })));
const BMRCalculator = React.lazy(() => import('../components/tools/BMRCalculator').then(m => ({ default: m.BMRCalculator })));
const IdealWeightCalculator = React.lazy(() => import('../components/tools/IdealWeightCalculator').then(m => ({ default: m.IdealWeightCalculator })));
const BodyFatCalculator = React.lazy(() => import('../components/tools/BodyFatCalculator').then(m => ({ default: m.BodyFatCalculator })));
const PDFToTextTool = React.lazy(() => import('../components/tools/PDFToTextTool').then(m => ({ default: m.PDFToTextTool })));
const PDFMetadataViewer = React.lazy(() => import('../components/tools/PDFMetadataViewer').then(m => ({ default: m.PDFMetadataViewer })));
const ImageToTextOCR = React.lazy(() => import('../components/tools/ImageToTextOCR').then(m => ({ default: m.ImageToTextOCR })));
const ImageToWordTool = React.lazy(() => import('../components/tools/ImageToWordTool').then(m => ({ default: m.ImageToWordTool })));
const PDFToWordTool = React.lazy(() => import('../components/tools/PDFToWordTool').then(m => ({ default: m.PDFToWordTool })));
const Base64ToImageTool = React.lazy(() => import('../components/tools/Base64ToImageTool').then(m => ({ default: m.Base64ToImageTool })));
const RandomNumberGenerator = React.lazy(() => import('../components/tools/RandomNumberGenerator').then(m => ({ default: m.RandomNumberGenerator })));
const CompressPDFTool = React.lazy(() => import('../components/tools/CompressPDFTool').then(m => ({ default: m.CompressPDFTool })));
const UnlockPDFTool = React.lazy(() => import('../components/tools/UnlockPDFTool').then(m => ({ default: m.UnlockPDFTool })));
const InterestCalculatorVariant = React.lazy(() => import('../components/tools/InterestCalculator').then(m => ({ default: m.InterestCalculator })));
const EMICalculatorVariant = React.lazy(() => import('../components/tools/EMICalculator').then(m => ({ default: m.EMICalculator })));
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToolHistory } from '../hooks/useToolHistory';
import { AnalyticsTracker } from '../components/AnalyticsTracker';

const ToolSkeleton = () => (
  <div className="w-full animate-pulse space-y-8">
    <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 min-h-[500px]">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800 space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-64 bg-gray-100 dark:bg-gray-800/50 rounded-2xl" />
          <div className="h-32 bg-gray-100 dark:bg-gray-800/50 rounded-2xl" />
        </div>
        <div className="p-8 bg-gray-50/50 dark:bg-gray-800/30 space-y-6">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-12 bg-blue-200/50 dark:bg-blue-900/20 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ToolPage: React.FC<{ slug?: string }> = ({ slug: propSlug }) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const slug = propSlug || paramSlug;
  const tool = TOOLS.find(t => t.slug === slug);
  const { addToHistory } = useToolHistory();

  // Determine if this is a canonical tool path or a variant path
  const isCanonicalPath = location.pathname.startsWith('/tools/');
  const isVariantPath = !isCanonicalPath && location.pathname !== '/';

  React.useEffect(() => {
    if (tool) {
      addToHistory({
        id: tool.id,
        name: tool.name,
        slug: tool.slug
      });
    }
  }, [tool, addToHistory]);
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ blob: Blob | string; name: string; size: number; originalSize: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Tool specific settings
  const [quality, setQuality] = useLocalStorage('tool-quality', 0.8);
  const [width, setWidth] = useLocalStorage<number | ''>('tool-width', '');
  const [height, setHeight] = useLocalStorage<number | ''>('tool-height', '');
  const [watermarkText, setWatermarkText] = useLocalStorage('tool-watermark', 'Sohelix');
  const [rotationAngle, setRotationAngle] = useLocalStorage('tool-rotation', 90);
  const [blurAmount, setBlurAmount] = useLocalStorage('tool-blur', 5);
  const [autoDownload, setAutoDownload] = useLocalStorage('tool-autodownload', false);
  
  // Crop settings
  const [cropX, setCropX] = useLocalStorage('tool-cropx', 10);
  const [cropY, setCropY] = useLocalStorage('tool-cropy', 10);
  const [cropWidth, setCropWidth] = useLocalStorage('tool-cropwidth', 80);
  const [cropHeight, setCropHeight] = useLocalStorage('tool-cropheight', 80);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const relatedTools = useMemo(() => {
    if (!tool) return [];
    
    // Explicitly defined related tools
    if (tool.relatedTools && tool.relatedTools.length > 0) {
      const explicitRelated = TOOLS.filter(t => tool.relatedTools?.includes(t.id));
      if (explicitRelated.length > 0) {
        // If we have explicit ones, we can still fill up to 4 with category matches
        const others = TOOLS.filter(t => 
          t.id !== tool.id && 
          t.category === tool.category && 
          !tool.relatedTools?.includes(t.id)
        ).slice(0, 4 - explicitRelated.length);
        return [...explicitRelated, ...others];
      }
    }

    // Fallback to category matches
    return TOOLS.filter(t => t.id !== tool.id && t.category === tool.category).slice(0, 4);
  }, [tool]);

  // cleanup on unmount or file change
  React.useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
      results.forEach(res => {
        if (typeof res.blob !== 'string') {
          // No direct way to clean up here if we don't store URLs, 
          // but we do create URLs in downloadAll.
        }
      });
    };
  }, [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      setFiles(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
      setResults([]);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files) as File[];
      setFiles(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
      setResults([]);
    }
  };

  const processImages = async () => {
    if (!tool || files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    const newResults: { blob: Blob | string; name: string; size: number; originalSize: number }[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let processedBlob: Blob | string;
        let ext = file.type.split('/')[1] || 'jpg';

        if (tool.id === 'compress-image') {
          processedBlob = await compressImage(file, quality);
        } else if (tool.id === 'resize-image') {
          processedBlob = await resizeImage(file, Number(width) || undefined, Number(height) || undefined);
        } else if (tool.id === 'crop-image') {
          processedBlob = await cropImage(file, cropX, cropY, cropWidth, cropHeight);
        } else if (tool.id === 'jpg-to-png') {
          processedBlob = await convertFormat(file, 'image/png');
          ext = 'png';
        } else if (tool.id === 'png-to-jpg') {
          processedBlob = await convertFormat(file, 'image/jpeg', 0.9);
          ext = 'jpg';
        } else if (tool.id === 'webp-converter') {
          processedBlob = await convertFormat(file, 'image/webp', 0.9);
          ext = 'webp';
        } else if (tool.id === 'image-to-base64') {
          processedBlob = await toBase64(file);
          ext = 'txt';
        } else if (tool.id === 'image-rotate') {
          processedBlob = await rotateImage(file, rotationAngle);
        } else if (tool.id === 'blur-image') {
          processedBlob = await blurImage(file, blurAmount);
        } else if (tool.id === 'image-watermark') {
          processedBlob = await watermarkImage(file, watermarkText);
        } else {
          processedBlob = file;
        }

        const isString = typeof processedBlob === 'string';
        const size = isString ? new Blob([processedBlob as string]).size : (processedBlob as Blob).size;

        newResults.push({
          blob: processedBlob,
          name: `${file.name.split('.')[0]}_sohelix.${ext}`,
          size: size,
          originalSize: file.size
        });
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setResults(newResults);
      
      if (autoDownload) {
        downloadAll(newResults);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while processing the images. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async (res = results) => {
    if (res.length === 1) {
      const result = res[0];
      let url: string;
      if (typeof result.blob === 'string') {
        const blob = new Blob([result.blob], { type: 'text/plain' });
        url = URL.createObjectURL(blob);
      } else {
        url = URL.createObjectURL(result.blob);
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = result.name;
      a.click();
      URL.revokeObjectURL(url);
    } else if (res.length > 1) {
      const zip = new JSZip();
      res.forEach(result => {
        if (typeof result.blob === 'string') {
          zip.file(result.name, result.blob);
        } else {
          zip.file(result.name, result.blob);
        }
      });
      const content = await zip.generateAsync({ type: 'blob' });
      FileSaver.saveAs(content, 'sohelix_images.zip');
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setResults([]);
  };

  if (!tool) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="h-20 w-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
          <Calculator className="h-10 w-10 text-gray-400" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Tool Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
          The tool you are looking for might have been moved or renamed. Explore our collection of 60+ professional tools.
        </p>
        <Link 
          to="/"
          className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all"
        >
          Browse All Tools
        </Link>
      </div>
    );
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": tool.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description,
    "applicationCategory": tool.category === 'finance-tools' ? 'FinanceApplication' : 
                          tool.category === 'calculator-tools' ? 'HealthApplication' :
                          tool.category === 'image-tools' ? 'MultimediaApplication' :
                          'UtilityApplication',
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": tool.name,
    "url": `https://sohelix.com/tools/${tool.slug}/`,
    "description": tool.description
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://sohelix.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": "https://sohelix.com/#tools"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tool.name,
        "item": `https://sohelix.com/tools/${tool.slug}/`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SEO
        title={tool.seo?.title}
        description={tool.seo?.description}
        keywords={tool.seo?.keywords}
        slug={tool.slug}
        canonical={`https://sohelix.com/tools/${tool.slug}`}
        noindex={isVariantPath}
        schema={[faqSchema, webAppSchema, webPageSchema, breadcrumbSchema]}
      />
      <AnalyticsTracker toolName={tool.id} />

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/categories/${tool.category}/`} className="hover:text-blue-600">
            {CATEGORY_INFO[tool.category]?.title?.replace('Free ', '').replace(' Online', '') || tool.category.replace('-', ' ')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-900 dark:text-white">{tool.name}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            {tool.title}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {tool.description}
          </p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {['Free', 'Secure', 'No Upload', 'Fast'].map(badge => (
              <span key={badge} className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {badge}
              </span>
            ))}
          </div>

          {/* Trust Badges Section */}
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 border-t border-gray-100 pt-8 dark:border-gray-800">
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-6 w-6 text-green-500" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">100% Private</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Instant Results</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Lock className="h-6 w-6 text-blue-500" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">No Server Upload</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MousePointer2 className="h-6 w-6 text-purple-500" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">No Signup Required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Interface */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <React.Suspense fallback={<ToolSkeleton />}>
          {tool.id === 'compress-image' ? (
            <CompressorTool tool={tool} />
          ) : tool.id === 'resize-image' ? (
            <ResizeImageTool tool={tool} />
          ) : tool.id === 'crop-image' ? (
            <CropperTool tool={tool} />
          ) : tool.id === 'jpg-to-png' ? (
            <JpgToPngConverter tool={tool} />
          ) : tool.id === 'webp-converter' ? (
            <WebPConverter tool={tool} />
          ) : tool.id === 'qr-code-generator' ? (
            <QRCodeGenerator tool={tool} />
          ) : tool.id === 'favicon-generator' ? (
            <FaviconGenerator tool={tool} />
          ) : tool.id === 'age-calculator' ? (
            <AgeCalculator tool={tool} />
          ) : tool.id === 'image-to-pdf' ? (
            <ImageToPDFTool tool={tool} />
          ) : tool.id === 'merge-pdf' ? (
            <MergePDFTool tool={tool} />
          ) : tool.id === 'split-pdf' ? (
            <SplitPDFTool tool={tool} />
          ) : tool.id === 'pdf-to-png' ? (
            <PDFToPNGTool tool={tool} />
          ) : tool.id === 'pdf-to-jpg' ? (
            <PDFToJPGTool tool={tool} />
          ) : tool.id === 'pdf-reader' ? (
            <PDFReaderTool tool={tool} />
          ) : tool.id === 'pdf-page-counter' ? (
            <PDFPageCounter tool={tool} />
          ) : tool.id === 'pdf-page-rotator' ? (
            <PDFPageRotator tool={tool} />
          ) : tool.id === 'bmi-calculator' ? (
            <BMICalculator tool={tool} />
          ) : tool.id === 'calorie-calculator' ? (
            <CalorieCalculator tool={tool} />
          ) : tool.id === 'bmr-calculator' ? (
            <BMRCalculator tool={tool} />
          ) : tool.id === 'ideal-weight-calculator' ? (
            <IdealWeightCalculator tool={tool} />
          ) : tool.id === 'body-fat-calculator' ? (
            <BodyFatCalculator tool={tool} />
          ) : tool.id === 'pdf-to-text' ? (
            <PDFToTextTool tool={tool} />
          ) : tool.id === 'pdf-metadata-viewer' ? (
            <PDFMetadataViewer tool={tool} />
          ) : tool.id === 'image-to-text' ? (
            <ImageToTextOCR tool={tool} />
          ) : tool.id === 'image-to-word' ? (
            <ImageToWordTool tool={tool} />
          ) : tool.id === 'base64-to-image' ? (
            <Base64ToImageTool tool={tool} />
          ) : tool.id === 'pdf-to-word' ? (
            <PDFToWordTool tool={tool} />
          ) : tool.id === 'random-number-generator' ? (
            <RandomNumberGenerator />
          ) : tool.id === 'compress-pdf' ? (
            <CompressPDFTool />
          ) : tool.id === 'unlock-pdf' ? (
            <UnlockPDFTool />
          ) : tool.id === 'meta-tag-generator' ? (
            <MetaTagGenerator />
          ) : tool.id === 'robots-txt-generator' ? (
            <RobotsTxtGenerator />
          ) : tool.id === 'sitemap-generator' ? (
            <SitemapGenerator />
          ) : tool.id === 'slug-generator' ? (
            <SlugGenerator />
          ) : tool.id === 'serp-preview' ? (
            <SerpPreview />
          ) : tool.id === 'word-counter' ? (
            <WordCounter />
          ) : tool.id === 'case-converter' ? (
            <CaseConverter />
          ) : tool.id === 'line-sorter' ? (
            <LineSorter />
          ) : tool.id === 'whitespace-remover' ? (
            <WhitespaceRemover />
          ) : tool.id === 'lorem-ipsum-generator' ? (
            <LoremIpsumGenerator />
          ) : tool.id === 'text-to-hex' ? (
            <TextToHex />
          ) : tool.id === 'hex-to-text' ? (
            <HexToText />
          ) : tool.id === 'color-palette-generator' ? (
            <ColorPaletteGenerator />
          ) : tool.id === 'image-color-picker' ? (
            <ImageColorPicker />
          ) : tool.id === 'webp-to-jpg' ? (
            <WebPToJPG />
          ) : tool.id === 'timestamp-converter' ? (
            <TimestampConverter />
          ) : tool.id === 'json-formatter' ? (
            <JSONFormatter />
          ) : tool.id === 'base64-converter' ? (
            <Base64Converter />
          ) : tool.id === 'currency-converter' ? (
            <CurrencyConverter tool={tool} />
          ) : tool.id === 'currency-denomination' ? (
            <CurrencyDenomination tool={tool} />
          ) : tool.id === 'interest-calculator' ? (
            <InterestCalculatorVariant tool={tool} />
          ) : tool.id === 'sip-calculator' ? (
            <SIPCalculator tool={tool} />
          ) : tool.id === 'emi-calculator' ? (
            <EMICalculatorVariant tool={tool} />
          ) : tool.id === 'advanced-loan-calculator' ? (
            <AdvancedLoanCalculator tool={tool} />
          ) : tool.id === 'percentage-calculator' ? (
            <PercentageCalculator tool={tool} />
          ) : tool.id === 'inflation-calculator' ? (
            <InflationCalculator tool={tool} />
          ) : tool.id === 'uuid-generator' ? (
            <UUIDGenerator />
          ) : tool.id === 'regex-tester' ? (
            <RegexTester />
          ) : tool.id === 'url-encoder-decoder' ? (
            <URLEncoderDecoder />
          ) : tool.id === 'csv-to-json' ? (
            <CSVToJSONConverter />
          ) : tool.id === 'json-to-csv' ? (
            <JSONToCSVConverter />
          ) : tool.id === 'html-minifier' ? (
            <HTMLMinifier />
          ) : tool.id === 'css-minifier' ? (
            <CSSMinifier />
          ) : tool.id === 'js-minifier' ? (
            <JSMinifier />
          ) : tool.id === 'color-converter' ? (
            <ColorConverter />
          ) : ['png-to-jpg', 'image-to-base64', 'image-watermark', 'image-rotate', 'blur-image'].includes(tool.id) ? (
            <GenericImageTool tool={tool} />
          ) : null}
        </React.Suspense>
      </section>

        {/* SEO Content Sections */}
        <section className="mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-3 space-y-16">
              {/* What is */}
              <div className="prose prose-blue dark:prose-invert max-w-none">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What is {tool.name}?</h2>
                <div 
                  className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400"
                  dangerouslySetInnerHTML={{ __html: tool.longContent }}
                />
              </div>

              {/* How to Use */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How to Use {tool.name}</h2>
                <ol className="mt-6 space-y-4 text-gray-600 dark:text-gray-400">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30">1</span>
                    <span>Select the files you want to process from your device or drag and drop them into the tool area.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30">2</span>
                    <span>Adjust the settings to your preference.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30">3</span>
                    <span>Click the "Process" or "Calculate" button to start the client-side processing.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30">4</span>
                    <span>Once finished, view your results or click the "Download" button to save your files.</span>
                  </li>
                </ol>
              </div>

              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* Features */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Features</h2>
                  <ul className="mt-6 space-y-4">
                    {tool.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Benefits & Use Cases</h2>
                  <ul className="mt-6 space-y-4">
                    {tool.benefits.map((benefit, i) => (
                      <li key={`benefit-${i}`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        {benefit}
                      </li>
                    ))}
                    {tool.useCases.map((useCase, i) => (
                      <li key={`usecase-${i}`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        {useCase}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* FAQ Section */}
              {tool.faqs.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                  <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {tool.faqs.map((faq, i) => (
                      <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                        <h3 className="font-bold text-gray-900 dark:text-white">{faq.question}</h3>
                        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ZapIcon className="h-5 w-5 text-yellow-500" />
                  Popular Tools
                </h3>
                <div className="space-y-3">
                  {TOOLS.filter(t => t.id !== tool.id).slice(0, 6).map(t => (
                    <Link 
                      key={t.id} 
                      to={`/tools/${t.slug}/`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className="h-8 w-8 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <DynamicIcon name={t.icon} className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600">{t.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-blue-600 p-6 text-white shadow-lg shadow-blue-500/20">
                <h3 className="text-lg font-bold mb-2">Need Help?</h3>
                <p className="text-sm text-blue-100 mb-4">Our tools are free and secure. If you have any questions, feel free to contact us.</p>
                <Link 
                  to="/contact/" 
                  className="block w-full py-2 text-center bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {/* Related Tools Section */}
        {relatedTools.length > 0 && (
          <div className="mt-24 border-t border-gray-200 pt-16 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Related Tools</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTools.map(rt => {
                return (
                  <Link 
                    key={rt.id} 
                    to={`/tools/${rt.slug}/`}
                    className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                      <DynamicIcon name={rt.icon} className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">{rt.name}</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{rt.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Internal Linking Section for Compress Image */}
        {tool.id === 'compress-image' && (
          <div className="mt-12 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Compress Image to Specific Sizes</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[10, 20, 50, 100].map(size => (
                <Link
                  key={size}
                  to={`/tools/compress-image/?target=${size}`}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all group dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-blue-900/20"
                >
                  <span className="text-lg font-black text-gray-900 dark:text-white group-hover:text-blue-600">To {size}KB</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Optimize for web</span>
                </Link>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};
