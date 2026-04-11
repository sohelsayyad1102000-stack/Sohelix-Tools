import React, { useState, useRef } from 'react';
import { Upload, Download, RefreshCcw, Layout, Image as ImageIcon, AlertCircle, CheckCircle2, FileArchive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatBytes } from '../../lib/utils';
import JSZip from 'jszip';

interface FaviconGeneratorProps {
  tool: any;
}

const FAVICON_SIZES = [
  { size: 16, label: '16x16', name: 'favicon-16x16.png' },
  { size: 32, label: '32x32', name: 'favicon-32x32.png' },
  { size: 48, label: '48x48', name: 'favicon-48x48.png' },
  { size: 64, label: '64x64', name: 'favicon-64x64.png' },
  { size: 180, label: '180x180', name: 'apple-touch-icon.png' },
];

export const FaviconGenerator: React.FC<FaviconGeneratorProps> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedIcons, setGeneratedIcons] = useState<{ blob: Blob; url: string; size: number; label: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setGeneratedIcons([]);
    setSuccess(null);
    setError(null);
  };

  const generateFavicons = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const icons = await Promise.all(FAVICON_SIZES.map(async (preset) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context not found');

        canvas.width = preset.size;
        canvas.height = preset.size;

        // Use high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, preset.size, preset.size);

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });

        return {
          blob,
          url: URL.createObjectURL(blob),
          size: preset.size,
          label: preset.label,
          name: preset.name
        };
      }));

      setGeneratedIcons(icons);
      setSuccess('All favicon sizes generated successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to generate favicons. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadZip = async () => {
    if (generatedIcons.length === 0) return;
    
    const zip = new JSZip();
    generatedIcons.forEach(icon => {
      zip.file(icon.name, icon.blob);
    });

    // Add a simple instructions file
    zip.file('instructions.txt', `Sohelix Favicon Generator\n\nTo use these favicons, add the following to your HTML <head>:\n\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">`);

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sohelix_favicons.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setFile(null);
    setPreview(null);
    setGeneratedIcons([]);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
      {/* Main Area */}
      <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800">
        {!preview ? (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group flex h-96 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 dark:bg-gray-800">
              <Layout className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Upload image for Favicon</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Supports PNG, JPG, WebP, SVG</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Original Image</h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Change Image
                </button>
                <button 
                  onClick={clearAll}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex justify-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <img src={preview} alt="Original" className="max-h-64 rounded-lg shadow-lg" />
            </div>

            {generatedIcons.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generated Sizes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {generatedIcons.map((icon, i) => (
                    <div key={i} className="flex flex-col items-center p-4 rounded-xl border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700">
                      <div className="flex-1 flex items-center justify-center mb-3">
                        <img 
                          src={icon.url} 
                          alt={icon.label} 
                          style={{ width: icon.size, height: icon.size }}
                          className="shadow-sm"
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-500">{icon.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Settings */}
      <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <ImageIcon className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white">Favicon Settings</h3>
        </div>

        <div className="space-y-6 flex-1">
          <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2">Included Sizes:</h4>
            <ul className="text-xs space-y-1 text-blue-600 dark:text-blue-300">
              <li>• 16x16 (Classic browser icon)</li>
              <li>• 32x32 (Taskbar icon)</li>
              <li>• 48x48 (Desktop icon)</li>
              <li>• 64x64 (High-res icon)</li>
              <li>• 180x180 (Apple Touch Icon)</li>
            </ul>
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

          <button
            disabled={!file || isProcessing}
            onClick={generateFavicons}
            className={cn(
              "w-full rounded-xl py-4 font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2",
              !file || isProcessing 
                ? "bg-gray-300 cursor-not-allowed dark:bg-gray-700" 
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
            )}
          >
            {isProcessing ? (
              <>
                <RefreshCcw className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Layout className="h-5 w-5" />
                Generate All Sizes
              </>
            )}
          </button>

          {generatedIcons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <button
                onClick={downloadZip}
                className="w-full rounded-xl bg-green-600 py-4 font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <FileArchive className="h-5 w-5" />
                Download All (ZIP)
              </button>
            </motion.div>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 leading-relaxed">
            All processing happens locally. Your images are never uploaded to any server.
          </p>
        </div>
      </div>
    </div>
  );
};
