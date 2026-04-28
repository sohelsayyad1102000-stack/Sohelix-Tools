import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, RefreshCcw, Trash2, Settings2, FileImage, AlertCircle, CheckCircle2, X, Maximize2, Move, RotateCw, ZoomIn } from 'lucide-react';
import FileSaver from 'file-saver';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatBytes } from '../../lib/utils';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Link } from 'react-router-dom';
import { processImageWithAll as processWithWorker } from '../../lib/image-processing';

interface ResizeImageToolProps {
  tool: any;
}

type Unit = 'px' | 'cm' | 'mm' | 'inch';

const DPI = 96;

const unitToPx = (value: number, unit: Unit): number => {
  switch (unit) {
    case 'cm': return Math.round((value / 2.54) * DPI);
    case 'mm': return Math.round((value / 25.4) * DPI);
    case 'inch': return Math.round(value * DPI);
    default: return value;
  }
};

const pxToUnit = (px: number, unit: Unit): number => {
  switch (unit) {
    case 'cm': return Number(((px / DPI) * 2.54).toFixed(2));
    case 'mm': return Number(((px / DPI) * 25.4).toFixed(2));
    case 'inch': return Number((px / DPI).toFixed(2));
    default: return px;
  }
};

export const ResizeImageTool: React.FC<ResizeImageToolProps> = ({ tool }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ blob: Blob; name: string; size: number; originalSize: number; width: number; height: number; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Settings
  const [unit, setUnit] = useLocalStorage<Unit>('resizer-unit', 'px');
  const [width, setWidth] = useLocalStorage<number | ''>('resizer-width', '');
  const [height, setHeight] = useLocalStorage<number | ''>('resizer-height', '');
  const [maintainRatio, setMaintainRatio] = useLocalStorage('resizer-maintain-ratio', true);
  const [format, setFormat] = useLocalStorage<'original' | 'jpg' | 'png' | 'webp'>('resizer-format', 'original');
  const [compress, setCompress] = useLocalStorage('resizer-compress', false);
  const [targetSizeKB, setTargetSizeKB] = useLocalStorage<number | ''>('resizer-target-size', '');
  const [autoDownload, setAutoDownload] = useLocalStorage('resizer-auto-download', false);
  const [rotation, setRotation] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('100x100')) { setWidth(100); setHeight(100); setUnit('px'); }
    else if (path.includes('600x600')) { setWidth(600); setHeight(600); setUnit('px'); }
    else if (path.includes('instagram')) { setWidth(1080); setHeight(1080); setUnit('px'); }
    else if (path.includes('passport')) { setWidth(3.5); setHeight(4.5); setUnit('cm'); }
    else if (path.includes('in-cm')) { setUnit('cm'); }
    else if (path.includes('in-mm')) { setUnit('mm'); }
    else if (path.includes('in-inch')) { setUnit('inch'); }

    const params = new URLSearchParams(window.location.search);
    const w = params.get('w');
    const h = params.get('h');
    const u = params.get('u') as Unit;
    const t = params.get('target');

    if (w) setWidth(Number(w));
    if (h) setHeight(Number(h));
    if (u && ['px', 'cm', 'mm', 'inch'].includes(u)) setUnit(u);
    if (t) {
      setCompress(true);
      setTargetSizeKB(Number(t));
    }
  }, []);

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
      results.forEach(res => URL.revokeObjectURL(res.url));
    };
  }, [previews, results]);

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

    // Auto-fill dimensions from first file if empty
    if (validFiles.length > 0 && !width && !height) {
      const img = new Image();
      const tempUrl = URL.createObjectURL(validFiles[0]);
      img.src = tempUrl;
      img.onload = () => {
        setWidth(pxToUnit(img.width, unit));
        setHeight(pxToUnit(img.height, unit));
        URL.revokeObjectURL(tempUrl);
      };
      img.onerror = () => URL.revokeObjectURL(tempUrl);
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setResults([]);
  };

  const clearAll = () => {
    previews.forEach(url => URL.revokeObjectURL(url));
    results.forEach(res => URL.revokeObjectURL(res.url));
    setFiles([]);
    setPreviews([]);
    setResults([]);
    setError(null);
    setSuccess(null);
    setRotation(0);
  };

  const processImages = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    const newResults: any[] = [];

    try {
      const targetWidthPx = width ? unitToPx(Number(width), unit) : undefined;
      const targetHeightPx = height ? unitToPx(Number(height), unit) : undefined;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Use Web Worker for processing
        const outFormat = format === 'original' ? file.type : `image/${format === 'jpg' ? 'jpeg' : format}`;
        const resizedBlob = await processWithWorker(file, {
          w: targetWidthPx,
          h: targetHeightPx,
          angle: rotation,
          format: outFormat,
          quality: 0.95
        } as any);

        // 2. Optional Compression
        let finalBlob = resizedBlob;
        if (compress && targetSizeKB) {
          const options = {
            maxSizeMB: Number(targetSizeKB) / 1024,
            useWebWorker: true,
          };
          finalBlob = await imageCompression(new File([resizedBlob], file.name, { type: resizedBlob.type }), options);
        }

        const ext = finalBlob.type.split('/')[1].replace('jpeg', 'jpg');
        newResults.push({
          blob: finalBlob,
          url: URL.createObjectURL(finalBlob),
          name: `${file.name.split('.')[0]}_resized.${ext}`,
          size: finalBlob.size,
          originalSize: file.size,
          width: targetWidthPx || 0,
          height: targetHeightPx || 0
        });

        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setResults(newResults);
      setSuccess(`Successfully resized ${files.length} image${files.length > 1 ? 's' : ''}!`);
      
      if (autoDownload) {
        downloadAll(newResults);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during processing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async (res = results) => {
    if (res.length === 1) {
      const result = res[0];
      const a = document.createElement('a');
      a.href = result.url;
      a.download = result.name;
      a.click();
    } else {
      const zip = new JSZip();
      res.forEach(r => zip.file(r.name, r.blob));
      const content = await zip.generateAsync({ type: 'blob' });
      FileSaver.saveAs(content, 'resized_images_sohelix.zip');
    }
  };

  return (
    <div className="space-y-12">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          
          {/* Main Upload Area */}
          <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange}
            />
            
            <AnimatePresence mode="wait">
              {files.length === 0 ? (
                <motion.div 
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex h-64 sm:h-96 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 dark:bg-gray-800">
                    <Upload className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Select images or drag & drop here</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Supports JPG, PNG, WebP, SVG • Multiple files allowed</p>
                </motion.div>
              ) : results.length > 0 ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Resized Results ({results.length})</h3>
                    <button 
                      onClick={clearAll}
                      className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Resize Another Image
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {results.map((res, i) => (
                      <div key={i} className="flex flex-col rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                        <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700 mb-4">
                          <img src={res.url} alt={res.name} className="h-full w-full object-contain" />
                        </div>
                        <div className="flex flex-col gap-1 mb-4">
                          <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{res.name}</span>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatBytes(res.originalSize)} → <span className="text-green-600 font-bold">{formatBytes(res.size)}</span></span>
                            <span>{Math.round(unitToPx(Number(width), unit))}x{Math.round(unitToPx(Number(height), unit))} px</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = res.url;
                            a.download = res.name;
                            a.click();
                          }}
                          className="w-full rounded-lg bg-white py-2 text-sm font-bold text-blue-600 border border-blue-100 hover:bg-blue-50 transition-all dark:bg-gray-800 dark:border-gray-700"
                        >
                          Download Image
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="files"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Selected Images ({files.length})</h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
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
                  
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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

                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-blue-600">Resizing your images...</span>
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

                  {success && (
                    <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                      {success}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Settings */}
          <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30">
            <div className="flex items-center gap-2 mb-6">
              <Settings2 className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 dark:text-white">Resize Settings</h3>
            </div>

            <div className="space-y-6">
              {/* Unit Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit</label>
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {(['px', 'cm', 'mm', 'inch'] as Unit[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
                        unit === u ? "bg-white text-blue-600 shadow dark:bg-gray-700 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      )}
                    >
                      {u.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Width ({unit})</label>
                  <input 
                    type="number" 
                    value={width} 
                    onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Auto"
                    className="block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Height ({unit})</label>
                  <input 
                    type="number" 
                    value={height} 
                    onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Auto"
                    className="block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="ratio" 
                  checked={maintainRatio} 
                  onChange={(e) => setMaintainRatio(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <label htmlFor="ratio" className="text-sm text-gray-700 dark:text-gray-300">
                  Maintain aspect ratio
                </label>
              </div>

              {/* Rotation */}
              <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rotation</label>
                <div className="flex gap-2">
                  {[0, 90, 180, 270].map((angle) => (
                    <button
                      key={angle}
                      onClick={() => setRotation(angle)}
                      className={cn(
                        "flex-1 py-2 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1",
                        rotation === angle 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                      )}
                    >
                      <RotateCw className={cn("h-4 w-4", angle === 90 && "rotate-90", angle === 180 && "rotate-180", angle === 270 && "rotate-270")} />
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>

              {/* Compression */}
              <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <input 
                    type="checkbox" 
                    id="compress" 
                    checked={compress} 
                    onChange={(e) => setCompress(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="compress" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Compress to specific size
                  </label>
                </div>
                {compress && (
                  <div className="pl-6">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Target Size (KB)</label>
                    <input 
                      type="number" 
                      value={targetSizeKB} 
                      onChange={(e) => setTargetSizeKB(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 200"
                      className="block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Format */}
              <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {['original', 'jpg', 'png', 'webp'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f as any)}
                      className={cn(
                        "rounded-lg py-2 text-xs font-bold uppercase transition-all border",
                        format === f 
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20" 
                          : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                      )}
                    >
                      {f}
                    </button>
                  ))}
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
                    Resizing... {progress}%
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-5 w-5" />
                    Resize {files.length > 0 ? files.length : ''} Image{files.length > 1 ? 's' : ''}
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
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Internal Linking Section (SEO Engine) */}
      <div className="space-y-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Resize by Popular Sizes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { label: '100x100', path: '/resize-image-to-100x100' },
              { label: '600x600', path: '/resize-image-to-600x600' },
              { label: 'Instagram', path: '/resize-image-for-instagram' },
              { label: 'Passport Size', path: '/resize-image-for-passport' },
              { label: '2x2 Inch', w: 2, h: 2, u: 'inch' },
              { label: '4x6 Inch', w: 4, h: 6, u: 'inch' },
              { label: 'YouTube', w: 1280, h: 720 },
              { label: 'Facebook', w: 1200, h: 630 },
              { label: 'Twitter', w: 1200, h: 675 },
              { label: 'A4 Size', w: 21, h: 29.7, u: 'cm' },
            ].map((item, i) => (
              <Link
                key={i}
                to={item.path || `/tools/resize-image?w=${item.w}&h=${item.h}${item.u ? `&u=${item.u}` : ''}`}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all group dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-blue-900/20"
              >
                <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600">{item.label}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Quick Resize</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Resize by Specific Units</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Resize in CM', path: '/resize-image-in-cm' },
              { label: 'Resize in MM', path: '/resize-image-in-mm' },
              { label: 'Resize in Inch', path: '/resize-image-in-inch' },
              { label: 'Resize in Pixels', u: 'px' },
            ].map((item, i) => (
              <Link
                key={i}
                to={item.path || `/tools/resize-image?u=${item.u}`}
                className="flex flex-col items-center justify-center p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all group dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-blue-900/20"
              >
                <span className="text-lg font-black text-gray-900 dark:text-white group-hover:text-blue-600">{item.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Professional Units</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
