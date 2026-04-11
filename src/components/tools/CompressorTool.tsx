import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, RefreshCcw, Trash2, Settings2, FileImage, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatBytes } from '../../lib/utils';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

interface CompressorToolProps {
  tool: any;
}

const CompareModal = ({ originalUrl, compressedUrl, onClose }: { originalUrl: string, compressedUrl: string, onClose: () => void }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Before vs After Comparison</h3>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <div 
            ref={containerRef}
            className="relative h-[60vh] w-full cursor-ew-resize select-none overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            {/* Original Image (Bottom) */}
            <img src={originalUrl} alt="Original" className="absolute inset-0 h-full w-full object-contain" />
            
            {/* Compressed Image (Top, clipped) */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img src={compressedUrl} alt="Compressed" className="absolute inset-0 h-full w-full object-contain" />
            </div>

            {/* Slider Line */}
            <div 
              className="absolute bottom-0 top-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
                <div className="flex gap-1">
                  <div className="h-3 w-0.5 bg-gray-400"></div>
                  <div className="h-3 w-0.5 bg-gray-400"></div>
                </div>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              Compressed
            </div>
            <div className="absolute bottom-4 right-4 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              Original
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CompressorTool: React.FC<CompressorToolProps> = ({ tool }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ blob: Blob; name: string; size: number; originalSize: number; format: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [comparingIndex, setComparingIndex] = useState<number | null>(null);

  // Settings
  const [mode, setMode] = useState<'quality' | 'targetSize'>('quality');
  const [quality, setQuality] = useState(85);
  const [targetSizeKB, setTargetSizeKB] = useState<number | ''>('');
  
  const [resize, setResize] = useState(false);
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [maintainRatio, setMaintainRatio] = useState(true);
  
  const [autoDownload, setAutoDownload] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.type.startsWith('image/'));
    if (validFiles.length !== newFiles.length) {
      setError('Some files were ignored because they are not images.');
    } else {
      setError(null);
    }
    
    setFiles(prev => [...prev, ...validFiles]);
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setResults([]);
    setSuccess(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setResults([]);
  };

  const clearAll = () => {
    setFiles([]);
    setPreviews([]);
    setResults([]);
    setError(null);
    setSuccess(null);
  };

  const processImages = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setProgress(0);
    const newResults: typeof results = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        let options: any = {
          useWebWorker: true,
          initialQuality: mode === 'quality' ? quality / 100 : undefined,
          maxSizeMB: mode === 'targetSize' && targetSizeKB ? Number(targetSizeKB) / 1024 : undefined,
        };

        if (resize && (width || height)) {
          options.maxWidthOrHeight = Math.max(Number(width) || 0, Number(height) || 0);
        }

        const compressedFile = await imageCompression(file, options);
        
        newResults.push({
          blob: compressedFile,
          name: `${file.name.split('.')[0]}_compressed.${compressedFile.type.split('/')[1] || 'jpg'}`,
          size: compressedFile.size,
          originalSize: file.size,
          format: compressedFile.type.split('/')[1]?.toUpperCase() || 'JPG'
        });
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      
      setResults(newResults);
      setSuccess(`Successfully compressed ${files.length} image${files.length > 1 ? 's' : ''}!`);
      
      if (autoDownload) {
        downloadAll(newResults);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during compression. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSingle = (result: typeof results[0]) => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = async (res = results) => {
    if (res.length === 1) {
      downloadSingle(res[0]);
      return;
    }

    const zip = new JSZip();
    res.forEach(result => {
      zip.file(result.name, result.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sohelix_compressed_images.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
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
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Supports JPG, PNG, WebP</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept="image/jpeg, image/png, image/webp" 
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
                  onClick={clearAll}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-h-[500px] overflow-y-auto pr-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                    <img src={previews[i]} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatBytes(file.size)}
                      {results[i] && (
                        <span className="text-green-600 dark:text-green-400 font-medium ml-2">
                          → {formatBytes(results[i].size)} (-{Math.round((1 - results[i].size / file.size) * 100)}%)
                        </span>
                      )}
                    </p>
                  </div>
                  {results[i] ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setComparingIndex(i)}
                        className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                        title="Compare Before/After"
                      >
                        <FileImage className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => downloadSingle(results[i])}
                        className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => removeFile(i)}
                      className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {comparingIndex !== null && results[comparingIndex] && (
        <CompareModal 
          originalUrl={previews[comparingIndex]} 
          compressedUrl={URL.createObjectURL(results[comparingIndex].blob)} 
          onClose={() => setComparingIndex(null)} 
        />
      )}

      {/* Sidebar Settings */}
      <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white">Compression Settings</h3>
        </div>

        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex rounded-lg bg-gray-200 p-1 dark:bg-gray-700">
            <button
              onClick={() => setMode('quality')}
              className={cn(
                "flex-1 rounded-md py-1.5 text-sm font-medium transition-all",
                mode === 'quality' ? "bg-white text-gray-900 shadow dark:bg-gray-800 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              Quality
            </button>
            <button
              onClick={() => setMode('targetSize')}
              className={cn(
                "flex-1 rounded-md py-1.5 text-sm font-medium transition-all",
                mode === 'targetSize' ? "bg-white text-gray-900 shadow dark:bg-gray-800 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              Target Size
            </button>
          </div>

          {mode === 'quality' ? (
            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quality</label>
                <span className="text-sm font-bold text-blue-600">{quality}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                step="1" 
                value={quality} 
                onChange={(e) => setQuality(Number(e.target.value))}
                className="mt-2 w-full accent-blue-600"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Size (KB)</label>
              <input 
                type="number" 
                value={targetSizeKB} 
                onChange={(e) => setTargetSizeKB(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g., 500"
                className="mt-1 block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          )}

          <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <input 
                type="checkbox" 
                id="resize" 
                checked={resize} 
                onChange={(e) => setResize(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="resize" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Resize Image (Optional)
              </label>
            </div>
            
            {resize && (
              <div className="space-y-4 pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Max Width</label>
                    <input 
                      type="number" 
                      value={width} 
                      onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Auto"
                      className="mt-1 block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Max Height</label>
                    <input 
                      type="number" 
                      value={height} 
                      onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Auto"
                      className="mt-1 block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
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
                Compressing... {progress}%
              </>
            ) : (
              <>
                Compress {files.length > 0 ? files.length : ''} Images
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
                {results.length > 1 ? 'Download All (ZIP)' : 'Download Image'}
              </button>
              <div className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <p>Total Original: {formatBytes(results.reduce((acc, r) => acc + r.originalSize, 0))}</p>
                <p className="font-bold">Total New: {formatBytes(results.reduce((acc, r) => acc + r.size, 0))}</p>
                <p className="text-xs mt-1">Saved {Math.round((1 - results.reduce((acc, r) => acc + r.size, 0) / results.reduce((acc, r) => acc + r.originalSize, 0)) * 100)}%</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
