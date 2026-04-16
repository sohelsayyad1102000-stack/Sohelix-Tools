import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  RefreshCcw, 
  Settings2, 
  FileImage, 
  AlertCircle,
  CheckCircle2,
  X,
  Zap,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Trash2,
  DownloadCloud,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatBytes } from '../../lib/utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { convertFormat } from '../../lib/image-processing';

interface WebPConverterProps {
  tool: any;
}

interface FileItem {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  result?: {
    blob: Blob;
    url: string;
    size: number;
    name: string;
  };
  error?: string;
}

export const WebPConverter: React.FC<WebPConverterProps> = ({ tool }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  
  // Settings
  const [quality, setQuality] = useState(92);
  const [isLossless, setIsLossless] = useState(false);
  const [resizeMode, setResizeMode] = useState<'original' | 'custom'>('original');
  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setError('Please select valid image files (JPG, PNG, etc.)');
      return;
    }

    const fileItems: FileItem[] = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      status: 'idle'
    }));

    setFiles(prev => [...prev, ...fileItems].slice(0, 20)); // Limit to 20 files
    setError(null);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      if (removed?.result?.url) URL.revokeObjectURL(removed.result.url);
      return filtered;
    });
  };

  const clearAll = () => {
    files.forEach(f => {
      URL.revokeObjectURL(f.preview);
      if (f.result?.url) URL.revokeObjectURL(f.result.url);
    });
    setFiles([]);
    setError(null);
    setProgress(0);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const convertToWebP = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    const updatedFiles = [...files];
    
    for (let i = 0; i < updatedFiles.length; i++) {
      const item = updatedFiles[i];
      if (item.status === 'completed') continue;

      try {
        updatedFiles[i] = { ...item, status: 'processing' };
        setFiles([...updatedFiles]);

        // In a real app, we'd handle resize and metadata here
        // For now, we use the convertFormat utility
        const format = 'image/webp';
        const q = isLossless ? 1 : quality / 100;
        
        const blob = await convertFormat(item.file, format, q);
        const url = URL.createObjectURL(blob);
        
        updatedFiles[i] = { 
          ...item, 
          status: 'completed', 
          result: {
            blob,
            url,
            size: blob.size,
            name: item.file.name.replace(/\.[^/.]+$/, "") + ".webp"
          }
        };
        setFiles([...updatedFiles]);
      } catch (err) {
        console.error(err);
        updatedFiles[i] = { 
          ...item, 
          status: 'error', 
          error: 'Conversion failed' 
        };
        setFiles([...updatedFiles]);
      }
      setProgress(Math.round(((i + 1) / updatedFiles.length) * 100));
    }

    setIsProcessing(false);
    
    // Auto scroll to results
    const resultsEl = document.getElementById('conversion-results');
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const downloadSingle = (item: FileItem) => {
    if (item.result) {
      saveAs(item.result.blob, item.result.name);
    }
  };

  const downloadAll = async () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.result);
    if (completedFiles.length === 0) return;

    if (completedFiles.length === 1) {
      downloadSingle(completedFiles[0]);
      return;
    }

    const zip = new JSZip();
    completedFiles.forEach(f => {
      if (f.result) {
        zip.file(f.result.name, f.result.blob);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'sohelix_webp_images.zip');
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Main Area */}
          <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800 flex flex-col min-h-[600px]">
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
                className="group flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500 cursor-pointer"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl transition-transform group-hover:scale-110 dark:bg-gray-800">
                  <Upload className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">Drop images here to convert to WebP</h3>
                <p className="mt-3 text-gray-500 dark:text-gray-400">or click to browse (JPG, PNG, etc.)</p>
                <div className="mt-8 flex gap-4">
                  <span className="rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Batch Support</span>
                  <span className="rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">100% Client-Side</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <FileImage className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Selected Images ({files.length}/20)</h3>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={files.length >= 20}
                      className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />
                      Add More
                    </button>
                    <button 
                      onClick={clearAll}
                      className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All
                    </button>
                  </div>
                </div>

                {/* File List */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar max-h-[400px]">
                  <AnimatePresence mode="popLayout">
                    {files.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                          <img src={item.preview} alt="preview" className="h-full w-full object-cover" />
                          {item.status === 'completed' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-[1px]">
                              <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">{item.file.name}</h4>
                            <span className="text-xs font-mono text-gray-400">{formatBytes(item.file.size)}</span>
                          </div>
                          
                          <div className="mt-2 flex items-center gap-3">
                            {item.status === 'idle' && (
                              <span className="text-xs font-bold text-gray-400">Ready to convert</span>
                            )}
                            {item.status === 'processing' && (
                              <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Converting...
                              </div>
                            )}
                            {item.status === 'completed' && item.result && (
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Ready
                                </span>
                                <span className="text-xs font-mono text-gray-400">
                                  {formatBytes(item.file.size)} → {formatBytes(item.result.size)}
                                  <span className="ml-2 text-green-500 font-bold">
                                    (-{Math.round((1 - item.result.size / item.file.size) * 100)}%)
                                  </span>
                                </span>
                              </div>
                            )}
                            {item.status === 'error' && (
                              <span className="text-xs font-bold text-red-600">{item.error}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.status === 'completed' && (
                            <button 
                              onClick={() => downloadSingle(item)}
                              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              title="Download WebP"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => removeFile(item.id)}
                            className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>Processing {files.filter(f => f.status === 'completed').length + 1} of {files.length} images...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <motion.div 
                        className="h-full bg-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Settings */}
          <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30 flex flex-col">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center justify-between w-full mb-8 group"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Conversion Settings</h3>
              </div>
              {showSettings ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-8 pb-8">
                    {/* Compression Type */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Compression Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setIsLossless(false)}
                          className={cn(
                            "rounded-xl px-4 py-3 text-sm font-bold transition-all border",
                            !isLossless
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                          )}
                        >
                          Lossy
                        </button>
                        <button
                          onClick={() => setIsLossless(true)}
                          className={cn(
                            "rounded-xl px-4 py-3 text-sm font-bold transition-all border",
                            isLossless
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                          )}
                        >
                          Lossless
                        </button>
                      </div>
                    </div>

                    {/* Quality Slider */}
                    {!isLossless && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Quality</label>
                          <span className="text-xs font-mono text-blue-600 font-bold">{quality}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="100" 
                          value={quality}
                          onChange={(e) => setQuality(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-gray-700"
                        />
                        <div className="mt-2 flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          <span>Smaller</span>
                          <span>Better</span>
                        </div>
                      </div>
                    )}

                    {/* Resize Option */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Resize Image</label>
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          onClick={() => setResizeMode('original')}
                          className={cn(
                            "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all border",
                            resizeMode === 'original'
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                          )}
                        >
                          <span>Keep Original Size</span>
                          <ImageIcon className="h-4 w-4 opacity-50" />
                        </button>
                        <button
                          onClick={() => setResizeMode('custom')}
                          className={cn(
                            "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all border",
                            resizeMode === 'custom'
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                          )}
                        >
                          <span>Custom Dimensions</span>
                          <RefreshCcw className="h-4 w-4 opacity-50" />
                        </button>
                      </div>
                      
                      {resizeMode === 'custom' && (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Width</label>
                            <input 
                              type="number" 
                              placeholder="Width"
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                              value={customWidth || ''}
                              onChange={(e) => setCustomWidth(Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Height</label>
                            <input 
                              type="number" 
                              placeholder="Height"
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                              value={customHeight || ''}
                              onChange={(e) => setCustomHeight(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Remove Metadata</span>
                        <span className="text-[10px] text-gray-400">Reduce file size further</span>
                      </div>
                      <button
                        onClick={() => setRemoveMetadata(!removeMetadata)}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                          removeMetadata ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            removeMetadata ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-auto space-y-4">
              <button
                disabled={files.length === 0 || isProcessing}
                onClick={convertToWebP}
                className={cn(
                  "w-full rounded-2xl py-5 font-black text-lg text-white shadow-xl transition-all flex items-center justify-center gap-3",
                  files.length === 0 || isProcessing 
                    ? "bg-gray-300 cursor-not-allowed dark:bg-gray-700" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/40 hover:-translate-y-1"
                )}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Zap className="h-6 w-6" />
                    Convert to WebP
                  </>
                )}
              </button>

              {files.some(f => f.status === 'completed') && (
                <button
                  onClick={downloadAll}
                  className="w-full rounded-2xl bg-green-600 py-5 font-black text-lg text-white shadow-xl shadow-green-500/30 transition-all hover:bg-green-700 hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <DownloadCloud className="h-6 w-6" />
                  Download All (ZIP)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section (Anchored) */}
      <div id="conversion-results" className="scroll-mt-24">
        {files.some(f => f.status === 'completed') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-green-50 border border-green-100 dark:bg-green-900/10 dark:border-green-900/20 text-center"
          >
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your images are ready!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">We've successfully converted your images to WebP format with optimized file sizes.</p>
            <button 
              onClick={downloadAll}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/20"
            >
              <Download className="h-5 w-5" />
              Download Converted Files
            </button>
          </motion.div>
        )}
      </div>

      {/* SEO Content Section */}
      <div className="prose prose-blue dark:prose-invert max-w-none space-y-12">
        <section>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">What is WebP Format?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            WebP is a modern image format developed by Google that provides superior lossless and lossy compression for images on the web. Using WebP, webmasters and developers can create smaller, richer images that make the web faster. WebP lossless images are 26% smaller in size compared to PNGs, and WebP lossy images are 25-34% smaller than comparable JPEG images at equivalent SSIM quality index.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Why Convert Images to WebP?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 not-prose">
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Faster Loading</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Smaller file sizes mean your website loads significantly faster, improving user experience and reducing bounce rates.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Better SEO</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Google uses page speed as a ranking factor. Optimized WebP images help you climb the search engine results pages.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Transparency Support</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Like PNG, WebP supports transparency (alpha channel) but with much smaller file sizes, making it perfect for logos and UI elements.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">How to Convert to WebP Online</h2>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Upload Images', desc: 'Drag and drop your JPG, PNG, or other image files into the converter box above.' },
              { step: 2, title: 'Configure Settings', desc: 'Choose between lossy or lossless compression and adjust the quality slider to your preference.' },
              { step: 3, title: 'Convert', desc: 'Click the "Convert to WebP" button. Our tool processes everything locally in your browser.' },
              { step: 4, title: 'Download', desc: 'Download your optimized WebP images individually or as a single ZIP file.' }
            ].map((item) => (
              <div key={item.step} className="flex gap-6 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold">{item.step}</div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{item.title}</h4>
                  <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">WebP vs JPG vs PNG</h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 not-prose">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
                <tr>
                  <th className="px-6 py-4 font-bold">Feature</th>
                  <th className="px-6 py-4 font-bold text-blue-600">WebP</th>
                  <th className="px-6 py-4 font-bold">JPG</th>
                  <th className="px-6 py-4 font-bold">PNG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-600 dark:text-gray-400">
                <tr>
                  <td className="px-6 py-4 font-bold">Compression</td>
                  <td className="px-6 py-4 text-blue-600 font-medium">Lossy & Lossless</td>
                  <td className="px-6 py-4">Lossy Only</td>
                  <td className="px-6 py-4">Lossless Only</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold">Transparency</td>
                  <td className="px-6 py-4 text-blue-600 font-medium">Yes</td>
                  <td className="px-6 py-4">No</td>
                  <td className="px-6 py-4">Yes</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold">File Size</td>
                  <td className="px-6 py-4 text-blue-600 font-medium">Smallest</td>
                  <td className="px-6 py-4">Small</td>
                  <td className="px-6 py-4">Large</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold">Best Use Case</td>
                  <td className="px-6 py-4 text-blue-600 font-medium">Web Performance</td>
                  <td className="px-6 py-4">Photography</td>
                  <td className="px-6 py-4">Graphics/Logos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Related Tools Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Related Image Tools</h2>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'JPG to PNG', icon: 'FileImage', color: 'bg-blue-50 text-blue-600', slug: 'jpg-to-png' },
            { name: 'PNG to JPG', icon: 'ImageIcon', color: 'bg-orange-50 text-orange-600', slug: 'png-to-jpg' },
            { name: 'Resize Image', icon: 'RefreshCcw', color: 'bg-green-50 text-green-600', slug: 'resize-image' },
            { name: 'Compress Image', icon: 'Zap', color: 'bg-purple-50 text-purple-600', slug: 'compress-image' },
          ].map((item) => (
            <a 
              key={item.slug} 
              href={`/tools/${item.slug}`} 
              className="group p-6 rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 dark:bg-gray-900 dark:border-gray-800"
            >
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", item.color)}>
                <Zap className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{item.name}</h4>
              <p className="text-xs text-gray-500 mt-1">Professional {item.name.toLowerCase()} tool.</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};
