import React, { useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TOOLS } from '../constants/tools';
import { SEO } from '../components/SEO';
import { cn, formatBytes } from '../lib/utils';
import * as Icons from 'lucide-react';
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
  MousePointer2
} from 'lucide-react';
import { motion } from 'motion/react';
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
import { CompressorTool } from '../components/tools/CompressorTool';
import { CropperTool } from '../components/tools/CropperTool';
import { QRCodeGenerator } from '../components/tools/QRCodeGenerator';
import { FaviconGenerator } from '../components/tools/FaviconGenerator';
import { AgeCalculator } from '../components/tools/AgeCalculator';
import { ImageToPDFTool } from '../components/tools/ImageToPDFTool';
import { MergePDFTool } from '../components/tools/MergePDFTool';
import { SplitPDFTool } from '../components/tools/SplitPDFTool';
import { PDFToPNGTool } from '../components/tools/PDFToPNGTool';
import { PDFToJPGTool } from '../components/tools/PDFToJPGTool';
import { PDFReaderTool } from '../components/tools/PDFReaderTool';
import { PDFPageCounter } from '../components/tools/PDFPageCounter';
import { PDFPageRotator } from '../components/tools/PDFPageRotator';
import { BMICalculator } from '../components/tools/BMICalculator';
import { InterestCalculator } from '../components/tools/InterestCalculator';
import { EMICalculator } from '../components/tools/EMICalculator';
import { MetaTagGenerator } from '../components/tools/MetaTagGenerator';
import { RobotsTxtGenerator } from '../components/tools/RobotsTxtGenerator';
import { SitemapGenerator } from '../components/tools/SitemapGenerator';
import { SlugGenerator } from '../components/tools/SlugGenerator';
import { SerpPreview } from '../components/tools/SerpPreview';
import { WordCounter } from '../components/tools/WordCounter';
import { CaseConverter } from '../components/tools/CaseConverter';
import { LineSorter } from '../components/tools/LineSorter';
import { WhitespaceRemover } from '../components/tools/WhitespaceRemover';
import { LoremIpsumGenerator } from '../components/tools/LoremIpsumGenerator';
import { TextToHex } from '../components/tools/TextToHex';
import { HexToText } from '../components/tools/HexToText';
import { ColorPaletteGenerator } from '../components/tools/ColorPaletteGenerator';
import { ImageColorPicker } from '../components/tools/ImageColorPicker';
import { WebPToJPG } from '../components/tools/WebPToJPG';
import { TimestampConverter } from '../components/tools/TimestampConverter';
import { JSONFormatter } from '../components/tools/JSONFormatter';
import { Base64Converter } from '../components/tools/Base64Converter';
import { CurrencyConverter } from '../components/tools/CurrencyConverter';
import { CurrencyDenomination } from '../components/tools/CurrencyDenomination';
import { SIPCalculator } from '../components/tools/SIPCalculator';
import { AdvancedLoanCalculator } from '../components/tools/AdvancedLoanCalculator';
import { PercentageCalculator } from '../components/tools/PercentageCalculator';
import { InflationCalculator } from '../components/tools/InflationCalculator';
import { UUIDGenerator } from '../components/tools/UUIDGenerator';
import { RegexTester } from '../components/tools/RegexTester';
import { URLEncoderDecoder } from '../components/tools/URLEncoderDecoder';
import { CSVToJSONConverter } from '../components/tools/CSVToJSONConverter';
import { JSONToCSVConverter } from '../components/tools/JSONToCSVConverter';
import { HTMLMinifier } from '../components/tools/HTMLMinifier';
import { CSSMinifier } from '../components/tools/CSSMinifier';
import { ResizeImageTool } from '../components/tools/ResizeImageTool';
import { JSMinifier } from '../components/tools/JSMinifier';
import { ColorConverter } from '../components/tools/ColorConverter';
import { JpgToPngConverter } from '../components/tools/JpgToPngConverter';
import { WebPConverter } from '../components/tools/WebPConverter';
import { CalorieCalculator } from '../components/tools/CalorieCalculator';
import { BMRCalculator } from '../components/tools/BMRCalculator';
import { IdealWeightCalculator } from '../components/tools/IdealWeightCalculator';
import { BodyFatCalculator } from '../components/tools/BodyFatCalculator';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToolHistory } from '../hooks/useToolHistory';

export const ToolPage: React.FC<{ slug?: string }> = ({ slug: propSlug }) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = propSlug || paramSlug;
  const tool = TOOLS.find(t => t.slug === slug);
  const { addToHistory } = useToolHistory();

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
    return TOOLS.filter(t => t.id !== tool.id && t.category === tool.category).slice(0, 4);
  }, [tool]);

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
          <Icons.Calculator className="h-10 w-10 text-gray-400" />
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
    "url": `https://sohelix.com/tools/${tool.slug}`,
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
        "item": "https://sohelix.com"
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
        "item": `https://sohelix.com/tools/${tool.slug}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SEO
        title={tool.seo.title}
        description={tool.seo.description}
        keywords={tool.seo.keywords}
        ogImage={tool.seo.ogImage}
        schema={[faqSchema, webAppSchema, webPageSchema, breadcrumbSchema]}
      />

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/categories/${tool.category}`} className="hover:text-blue-600 capitalize">{tool.category.replace('-', ' ')}</Link>
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
        ) : tool.id === 'interest-calculator' ? (
          <InterestCalculator tool={tool} />
        ) : tool.id === 'emi-calculator' ? (
          <EMICalculator tool={tool} />
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
        ) : tool.id === 'sip-calculator' ? (
          <SIPCalculator tool={tool} />
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
        ) : (
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              
              {/* Main Area */}
              <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
                {files.length === 0 ? (
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex h-96 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 dark:bg-gray-800">
                      <Upload className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Select images or drag & drop here</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Supports JPG, PNG, WebP, SVG</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Selected Images ({files.length})</h3>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          Add More
                        </button>
                        <button 
                          onClick={() => { setFiles([]); setPreviews([]); setResults([]); }}
                          className="text-sm font-medium text-red-600 hover:underline"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 max-h-[500px] overflow-y-auto pr-2">
                      {previews.map((url, i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                          <img src={url} alt="Preview" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="text-xs font-bold text-white uppercase mb-2">{formatBytes(files[i].size)}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                              className="rounded-full bg-red-600 p-2 text-white hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Settings */}
              <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30">
                <div className="flex items-center gap-2 mb-6">
                  <Settings2 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Settings</h3>
                </div>

                <div className="space-y-6">
                  {tool.id === 'resize-image' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Width (px)</label>
                        <input 
                          type="number" 
                          value={width} 
                          onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : '')}
                          placeholder="Auto"
                          className="mt-1 block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height (px)</label>
                        <input 
                          type="number" 
                          value={height} 
                          onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                          placeholder="Auto"
                          className="mt-1 block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button onClick={() => { setWidth(1920); setHeight(1080); }} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">1080p (1920x1080)</button>
                        <button onClick={() => { setWidth(1280); setHeight(720); }} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">720p (1280x720)</button>
                        <button onClick={() => { setWidth(1080); setHeight(1080); }} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">Instagram Post (1080x1080)</button>
                        <button onClick={() => { setWidth(1080); setHeight(1350); }} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">Instagram Portrait (1080x1350)</button>
                        <button onClick={() => { setWidth(1080); setHeight(1920); }} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">Instagram Story (1080x1920)</button>
                        <button onClick={() => { setWidth(1200); setHeight(630); }} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">Facebook Post (1200x630)</button>
                        <button onClick={() => { setWidth(1200); setHeight(675); }} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">Twitter Post (1200x675)</button>
                      </div>
                    </div>
                  )}

                  {tool.id === 'image-watermark' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Watermark Text</label>
                      <input 
                        type="text" 
                        value={watermarkText} 
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  )}

                  {tool.id === 'image-rotate' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rotation Angle: {rotationAngle}°</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="360" 
                        step="90" 
                        value={rotationAngle} 
                        onChange={(e) => setRotationAngle(Number(e.target.value))}
                        className="mt-2 w-full accent-blue-600"
                      />
                    </div>
                  )}

                  {tool.id === 'blur-image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blur Amount: {blurAmount}px</label>
                      <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        step="1" 
                        value={blurAmount} 
                        onChange={(e) => setBlurAmount(Number(e.target.value))}
                        className="mt-2 w-full accent-blue-600"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="autoDownload" 
                      checked={autoDownload} 
                      onChange={(e) => setAutoDownload(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <label htmlFor="autoDownload" className="text-sm text-gray-700 dark:text-gray-300">
                      Auto-download when done
                    </label>
                  </div>

                  <button
                    disabled={files.length === 0 || isProcessing}
                    onClick={processImages}
                    className={cn(
                      "w-full rounded-xl py-4 font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2",
                      files.length === 0 || isProcessing 
                        ? "bg-gray-300 cursor-not-allowed dark:bg-gray-700" 
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCcw className="h-5 w-5 animate-spin" />
                        Processing... {progress}%
                      </>
                    ) : (
                      <>
                        Process {files.length > 0 ? files.length : ''} Images
                      </>
                    )}
                  </button>

                  {results.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-3"
                    >
                      <button
                        onClick={() => downloadAll()}
                        className="w-full rounded-xl bg-green-600 py-4 font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Download className="h-5 w-5" />
                        Download All
                      </button>
                      <div className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        <p>Original: {formatBytes(results.reduce((acc, r) => acc + r.originalSize, 0))}</p>
                        <p className="font-bold">New size: {formatBytes(results.reduce((acc, r) => acc + r.size, 0))}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
                  <Icons.Zap className="h-5 w-5 text-yellow-500" />
                  Popular Tools
                </h3>
                <div className="space-y-3">
                  {TOOLS.filter(t => t.id !== tool.id).slice(0, 6).map(t => (
                    <Link 
                      key={t.id} 
                      to={`/tools/${t.slug}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className="h-8 w-8 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        {React.createElement((Icons as any)[t.icon] || Icons.FileImage, { className: "h-4 w-4" })}
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
                  to="/contact" 
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
                const IconComponent = (Icons as any)[rt.icon] || Icons.FileImage;
                return (
                  <Link 
                    key={rt.id} 
                    to={`/tools/${rt.slug}`}
                    className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                      <IconComponent className="h-5 w-5" />
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
                  to={`/tools/compress-image?target=${size}`}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all group dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-blue-900/20"
                >
                  <span className="text-lg font-black text-gray-900 dark:text-white group-hover:text-blue-600">To {size}KB</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Optimize for web</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
