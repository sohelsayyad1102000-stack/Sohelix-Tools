import React, { useState, useRef } from 'react';
import { Upload, Download, RefreshCcw, FileImage, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatBytes } from '../../lib/utils';

interface ConversionResult {
  originalName: string;
  originalSize: number;
  newName: string;
  newSize: number;
  blob: Blob;
  preview: string;
}

export const WebPToJPG: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [quality, setQuality] = useState(0.9);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((f: File) => f.type === 'image/webp' || f.name.endsWith('.webp'));
      setFiles(prev => [...prev, ...newFiles]);
      setResults([]);
    }
  };

  const convertToJpg = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const newResults: ConversionResult[] = [];

    try {
      for (const file of files) {
        const result = await processFile(file);
        newResults.push(result);
      }
      setResults(newResults);
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processFile = (file: File): Promise<ConversionResult> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Fill white background (JPG doesn't support transparency)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve({
              originalName: file.name,
              originalSize: file.size,
              newName: file.name.replace(/\.webp$/i, '.jpg'),
              newSize: blob.size,
              blob: blob,
              preview: URL.createObjectURL(blob)
            });
          } else {
            reject(new Error('Blob conversion failed'));
          }
        }, 'image/jpeg', quality);
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  };

  const downloadFile = (result: ConversionResult) => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.newName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFiles([]);
    setResults([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResults([]);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload & Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFiles = Array.from(e.dataTransfer.files).filter((f: File) => f.type === 'image/webp' || f.name.endsWith('.webp'));
              setFiles(prev => [...prev, ...droppedFiles]);
              setResults([]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="group flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 dark:bg-gray-800">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Select WebP images</h3>
            <p className="mt-1 text-sm text-gray-500">or drag and drop here</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/webp"
              multiple
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Queue ({files.length})</h3>
                <button onClick={reset} className="text-xs font-bold text-red-600 hover:underline">Clear All</button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileImage className="h-5 w-5 shrink-0 text-gray-400" />
                      <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">{file.name}</span>
                      <span className="text-xs text-gray-400">{formatBytes(file.size)}</span>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Conversion Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span>JPG Quality</span>
                  <span className="font-bold text-blue-600">{Math.round(quality * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="mt-2 w-full accent-blue-600"
                />
              </div>

              <button
                disabled={files.length === 0 || isProcessing}
                onClick={convertToJpg}
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
                    Converting...
                  </>
                ) : (
                  <>
                    Convert to JPG
                  </>
                )}
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="rounded-2xl bg-green-50 p-6 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-bold">Conversion Complete!</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-500">
                {results.length} images converted successfully.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {results.map((result, i) => (
              <div key={i} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img src={result.preview} alt="Result" className="h-full w-full object-contain" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="overflow-hidden">
                      <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">{result.newName}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatBytes(result.originalSize)} → <span className="font-bold text-blue-600">{formatBytes(result.newSize)}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => downloadFile(result)}
                      className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
