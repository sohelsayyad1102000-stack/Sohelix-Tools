import React, { useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TOOLS } from '../constants/tools';
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
  FileImage
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
  memeImage,
  cropImage
} from '../lib/image-processing';
import { CompressorTool } from '../components/tools/CompressorTool';
import { CropperTool } from '../components/tools/CropperTool';

export const ToolPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const tool = TOOLS.find(t => t.slug === slug);
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ blob: Blob | string; name: string; size: number; originalSize: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Tool specific settings
  const [quality, setQuality] = useState(0.8);
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [watermarkText, setWatermarkText] = useState('Sohelix');
  const [topText, setTopText] = useState('TOP TEXT');
  const [bottomText, setBottomText] = useState('BOTTOM TEXT');
  const [rotationAngle, setRotationAngle] = useState(90);
  const [blurAmount, setBlurAmount] = useState(5);
  const [autoDownload, setAutoDownload] = useState(false);
  
  // Crop settings
  const [cropX, setCropX] = useState(10);
  const [cropY, setCropY] = useState(10);
  const [cropWidth, setCropWidth] = useState(80);
  const [cropHeight, setCropHeight] = useState(80);

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
        } else if (tool.id === 'meme-generator') {
          processedBlob = await memeImage(file, topText, bottomText);
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

  const downloadAll = (res = results) => {
    res.forEach(result => {
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
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setResults([]);
  };

  if (!tool) return <div className="p-12 text-center">Tool not found</div>;

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
    "@type": "WebApplication",
    "name": tool.name,
    "description": tool.description,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SEO
        title={tool.seo.title}
        description={tool.seo.description}
        keywords={tool.seo.keywords}
        schema={[faqSchema, webAppSchema]}
      />

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-blue-600">Home</Link>
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
        </div>
      </section>

      {/* Tool Interface */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        {tool.id === 'compress-image' ? (
          <CompressorTool tool={tool} />
        ) : tool.id === 'crop-image' ? (
          <CropperTool tool={tool} />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              
              {/* Main Area */}
              <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800">
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
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFileChange}
                    />
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

                  {tool.id === 'meme-generator' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Top Text</label>
                        <input 
                          type="text" 
                          value={topText} 
                          onChange={(e) => setTopText(e.target.value)}
                          className="mt-1 block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bottom Text</label>
                        <input 
                          type="text" 
                          value={bottomText} 
                          onChange={(e) => setBottomText(e.target.value)}
                          className="mt-1 block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
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
        <div className="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How to use {tool.name}</h2>
            <ol className="mt-6 space-y-4 text-gray-600 dark:text-gray-400">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30">1</span>
                <span>Select the images you want to process from your device or drag and drop them into the tool area.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30">2</span>
                <span>Adjust the settings in the sidebar to your preference (e.g., quality level or dimensions).</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30">3</span>
                <span>Click the "Process" button to start the client-side processing.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30">4</span>
                <span>Once finished, click the "Download" button to save your optimized images.</span>
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Key Features</h2>
            <ul className="mt-6 space-y-4">
              {tool.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        {tool.faqs.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
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

        {/* Related Tools Section */}
        {relatedTools.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Related Tools</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTools.map(rt => (
                <Link 
                  key={rt.id} 
                  to={`/tools/${rt.slug}`}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <FileImage className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">{rt.name}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{rt.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Long Content Section */}
        <div className="mt-24 rounded-3xl bg-blue-600 p-12 text-white">
          <h2 className="text-3xl font-bold">More about {tool.name}</h2>
          <div 
            className="mt-6 text-lg leading-relaxed text-blue-50 opacity-90"
            dangerouslySetInnerHTML={{ __html: tool.longContent }}
          />
          <div className="mt-10 flex flex-wrap gap-4">
            {tool.useCases.map((useCase, i) => (
              <span key={i} className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
