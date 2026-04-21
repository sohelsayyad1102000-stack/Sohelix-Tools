import React, { useState } from 'react';
import { ImageIcon, Download, Copy, Trash2, Code, FileImage, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Base64ToImageTool: React.FC<{ tool: any }> = ({ tool }) => {
  const [base64String, setBase64String] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFormat, setImageFormat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = (input: string) => {
    setBase64String(input);
    setError(null);
    setImagePreview(null);
    setImageFormat(null);

    if (!input.trim()) return;

    try {
      // Clean the input (remove whitespace, newlines)
      const cleanedInput = input.trim().replace(/\s/g, '');
      
      // Check if it already has the data URI prefix
      let finalString = cleanedInput;
      let format = 'unknown';

      if (cleanedInput.startsWith('data:image/')) {
        const match = cleanedInput.match(/^data:image\/([a-zA-Z+]+);base64,/);
        if (match) {
          format = match[1];
        }
      } else {
        // Try to detect format and add prefix if missing
        // This is a simple detection, can be improved
        if (cleanedInput.startsWith('iVBORw0KGgo')) format = 'png';
        else if (cleanedInput.startsWith('/9j/')) format = 'jpeg';
        else if (cleanedInput.startsWith('PHN2Zy')) format = 'svg+xml';
        else if (cleanedInput.startsWith('R0lGODlh')) format = 'gif';
        else if (cleanedInput.startsWith('UklGR')) format = 'webp';

        finalString = `data:image/${format};base64,${cleanedInput}`;
      }

      // Validate by trying to create an image
      const img = new Image();
      img.onload = () => {
        setImagePreview(finalString);
        setImageFormat(format.toUpperCase());
        setError(null);
      };
      img.onerror = () => {
        setError('Invalid Base64 string. Please ensure you pasted a valid image-encoded string.');
      };
      img.src = finalString;

    } catch (err) {
      setError('Could not decode string. Please check the format.');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleDecode(text);
    } catch (err) {
      setError('Could not access clipboard. Please paste manually.');
    }
  };

  const downloadImage = () => {
    if (imagePreview) {
      const a = document.createElement('a');
      a.href = imagePreview;
      a.download = `sohelix_decoded_image.${imageFormat?.toLowerCase() === 'svg+xml' ? 'svg' : imageFormat?.toLowerCase() || 'png'}`;
      a.click();
    }
  };

  const clearAll = () => {
    setBase64String('');
    setImagePreview(null);
    setImageFormat(null);
    setError(null);
  };

  return (
    <div className="space-y-8 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Area */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paste Base64 String</label>
                <div className="flex gap-2">
                    <button 
                        onClick={handlePaste}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                        <Copy className="h-3 w-3" />
                        Paste
                    </button>
                    <button 
                        onClick={clearAll}
                        className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                    >
                        <Trash2 className="h-3 w-3" />
                        Clear
                    </button>
                </div>
            </div>
            <div className="relative group">
                <textarea 
                    value={base64String}
                    onChange={(e) => handleDecode(e.target.value)}
                    className="w-full h-[400px] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-mono text-gray-600 dark:text-gray-400 outline-none focus:ring-2 focus:ring-blue-600 resize-none transition-all custom-scrollbar overflow-x-hidden"
                    placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                />
                <div className="absolute top-4 right-4 pointer-events-none opacity-20 dark:opacity-10">
                    <Code className="h-10 w-10 text-gray-400" />
                </div>
            </div>
            
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm animate-shake">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>

        {/* Preview Area */}
        <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Image Preview</label>
            <div className="relative h-[400px] flex flex-col items-center justify-center rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 overflow-hidden group">
                <AnimatePresence mode="wait">
                    {imagePreview ? (
                        <motion.div 
                            key="preview"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full h-full p-8 flex flex-col items-center justify-center"
                        >
                            <img src={imagePreview} alt="Decoded" className="max-w-full max-h-[250px] object-contain shadow-2xl rounded-lg" />
                            
                            <div className="mt-8 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ring-1 ring-inset ring-green-600/20">
                                        <CheckCircle className="h-3 w-3" />
                                        Decoded Successfully
                                    </span>
                                    {imageFormat && (
                                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest ring-1 ring-inset ring-blue-600/20">
                                            {imageFormat}
                                        </span>
                                    )}
                                </div>
                                <button 
                                    onClick={downloadImage}
                                    className="px-10 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3"
                                >
                                    <Download className="h-5 w-5" />
                                    Download Image
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center text-center px-12"
                        >
                            <div className="h-20 w-20 rounded-3xl bg-white dark:bg-gray-800 flex items-center justify-center mb-6 shadow-xl shadow-gray-200/50 dark:shadow-none transition-transform group-hover:scale-105">
                                <FileImage className="h-10 w-10 text-gray-200 dark:text-gray-700" />
                            </div>
                            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-[200px] leading-relaxed">
                                Decoded image will appear here instantly as soon as you paste the string.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-6 rounded-3xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex gap-4">
                <RefreshCcw className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-500">Auto-Detection</p>
                    <p className="text-xs text-amber-800/70 dark:text-amber-500/70 leading-relaxed font-sans">
                        Our tool automatically detects common image formats (PNG, JPG, SVG, etc.) even if the data URI prefix is missing.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
