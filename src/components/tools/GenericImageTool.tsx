import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  RefreshCcw, 
  Settings2, 
  FileImage, 
  ShieldCheck,
  Zap,
  CheckCircle2,
  X,
  Loader2,
  Trash2,
  DownloadCloud,
  FileCode,
  Image as ImageIcon,
  RotateCw,
  Droplets,
  Stamp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatBytes } from '../../lib/utils';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

interface GenericImageToolProps {
  tool: any;
}

interface FileItem {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  result?: {
    blob?: Blob;
    base64?: string;
    url?: string;
    size?: number;
    name: string;
  };
  error?: string;
}

export const GenericImageTool: React.FC<GenericImageToolProps> = ({ tool }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Settings
  const [quality, setQuality] = useState(90);
  const [rotation, setRotation] = useState(90);
  const [blurAmount, setBlurAmount] = useState(5);
  const [watermarkText, setWatermarkText] = useState('SOHELIX.COM');
  const [autoProcess, setAutoProcess] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoProcess && files.length > 0 && files.some(f => f.status === 'idle')) {
      processAll();
    }
  }, [files, autoProcess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setError('Please select valid image files');
      return;
    }

    const fileItems: FileItem[] = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      status: 'idle'
    }));

    setFiles(prev => [...prev, ...fileItems].slice(0, 20));
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

  const processAll = async () => {
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

        const result = await processSingleImage(item.file);
        updatedFiles[i] = { 
          ...item, 
          status: 'completed', 
          result 
        };
        setFiles([...updatedFiles]);
      } catch (err) {
        console.error(err);
        updatedFiles[i] = { 
          ...item, 
          status: 'error', 
          error: 'Processing failed' 
        };
        setFiles([...updatedFiles]);
      }
      setProgress(Math.round(((i + 1) / updatedFiles.length) * 100));
    }

    setIsProcessing(false);
  };

  const processSingleImage = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (tool.id === 'image-to-base64') {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            base64: reader.result as string,
            name: file.name + ".txt",
            size: (reader.result as string).length
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (tool.id === 'image-rotate') {
          if (rotation === 90 || rotation === 270) {
            canvas.width = height;
            canvas.height = width;
          } else {
            canvas.width = width;
            canvas.height = height;
          }
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context failed'));
          return;
        }

        if (tool.id === 'image-rotate') {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(img, -width / 2, -height / 2);
        } else {
          if (tool.id === 'blur-image') {
            ctx.filter = `blur(${blurAmount}px)`;
          }
          ctx.drawImage(img, 0, 0);
          
          if (tool.id === 'image-watermark') {
            ctx.filter = 'none';
            ctx.font = `${Math.max(20, width / 20)}px sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'center';
            ctx.fillText(watermarkText, width / 2, height / 2);
          }
        }

        const mimeType = tool.id === 'png-to-jpg' ? 'image/jpeg' : 'image/png';
        const extension = tool.id === 'png-to-jpg' ? '.jpg' : '.png';

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve({
              blob,
              url,
              size: blob.size,
              name: file.name.replace(/\.[^/.]+$/, "") + extension
            });
          } else {
            reject(new Error('Blob creation failed'));
          }
        }, mimeType, quality / 100);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const downloadSingle = (item: FileItem) => {
    if (item.result) {
      if (item.result.blob) {
        FileSaver.saveAs(item.result.blob, item.result.name);
      } else if (item.result.base64) {
        const blob = new Blob([item.result.base64], { type: 'text/plain' });
        FileSaver.saveAs(blob, item.result.name);
      }
    }
  };

  const copyToBase64 = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
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
        if (f.result.blob) {
          zip.file(f.result.name, f.result.blob);
        } else if (f.result.base64) {
          zip.file(f.result.name, f.result.base64);
        }
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    FileSaver.saveAs(content, `${tool.id}_results.zip`);
  };

  const getToolIcon = () => {
    switch (tool.id) {
      case 'image-to-base64': return <FileCode className="h-12 w-12 text-blue-600" />;
      case 'image-rotate': return <RotateCw className="h-12 w-12 text-blue-600" />;
      case 'blur-image': return <Droplets className="h-12 w-12 text-blue-600" />;
      case 'image-watermark': return <Stamp className="h-12 w-12 text-blue-600" />;
      default: return <ImageIcon className="h-12 w-12 text-blue-600" />;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
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
                {getToolIcon()}
              </div>
              <h3 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">Drop images here</h3>
              <p className="mt-3 text-gray-500 dark:text-gray-400">or click to browse from your device</p>
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
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
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
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar max-h-[500px]">
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
                            <span className="text-xs font-bold text-gray-400">Ready</span>
                          )}
                          {item.status === 'processing' && (
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Processing...
                            </div>
                          )}
                          {item.status === 'completed' && item.result && (
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Done
                              </span>
                              {item.result.size && (
                                <span className="text-xs font-mono text-gray-400">→ {formatBytes(item.result.size)}</span>
                              )}
                              {tool.id === 'image-to-base64' && (
                                <button 
                                  onClick={() => copyToBase64(item.result?.base64 || '')}
                                  className="text-[10px] font-bold text-blue-600 hover:underline"
                                >
                                  Copy BASE64
                                </button>
                              )}
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
                            title="Download Result"
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
                    <span>Processing images...</span>
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
          <div className="flex items-center gap-2 mb-8">
            <Settings2 className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tool Settings</h3>
          </div>

          <div className="space-y-8 flex-1">
            {/* Contextual Settings */}
            {tool.id === 'image-rotate' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Rotation Angle</label>
                <div className="grid grid-cols-2 gap-2">
                  {[90, 180, 270].map(angle => (
                    <button
                      key={angle}
                      onClick={() => { setRotation(angle); if(autoProcess) processAll(); }}
                      className={cn(
                        "rounded-xl py-2 px-3 text-xs font-bold transition-all border",
                        rotation === angle 
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                      )}
                    >
                      {angle}° Clockwise
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tool.id === 'blur-image' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Blur Intensity</label>
                  <span className="text-xs font-mono text-blue-600 font-bold">{blurAmount}px</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={blurAmount}
                  onChange={(e) => { setBlurAmount(Number(e.target.value)); if(autoProcess) processAll(); }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-gray-700"
                />
              </div>
            )}

            {tool.id === 'image-watermark' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Watermark Text</label>
                <input 
                  type="text"
                  value={watermarkText}
                  onChange={(e) => { setWatermarkText(e.target.value); if(autoProcess) processAll(); }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                  placeholder="Enter text..."
                />
              </div>
            )}

            {tool.id === 'png-to-jpg' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">JPG Quality</label>
                  <span className="text-xs font-mono text-blue-600 font-bold">{quality}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-gray-700"
                />
              </div>
            )}

            {/* Auto Process Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Auto Process</span>
                <span className="text-[10px] text-gray-400">Apply changes instantly</span>
              </div>
              <button
                onClick={() => setAutoProcess(!autoProcess)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                  autoProcess ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    autoProcess ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            {/* Info Box */}
            <div className="rounded-2xl bg-blue-50/50 p-4 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-400">100% Client-Side</h4>
                  <p className="mt-1 text-[10px] text-blue-800/70 dark:text-blue-400/70 leading-relaxed">
                    Processing happens on your device. Your data never leaves your browser.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <button
              disabled={files.length === 0 || isProcessing}
              onClick={processAll}
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
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-6 w-6" />
                  {tool.id === 'image-rotate' ? 'Rotate Image' : 
                   tool.id === 'blur-image' ? 'Blur Image' : 
                   tool.id === 'image-watermark' ? 'Add Watermark' :
                   tool.id === 'png-to-jpg' ? 'Convert to JPG' :
                   'Process Image'}
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
  );
};
