import React, { useState, useRef } from 'react';
import { Upload, Copy, Check, RefreshCcw, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const ColorPaletteGenerator: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [palette, setPalette] = useState<{ hex: string; rgb: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        extractPalette(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractPalette = (imageSrc: string) => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colorMap: Record<string, number> = {};

      // Sample pixels
      for (let i = 0; i < imageData.length; i += 40) { // Sample every 10th pixel
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        
        // Quantize colors slightly to group similar shades
        const qr = Math.round(r / 10) * 10;
        const qg = Math.round(g / 10) * 10;
        const qb = Math.round(b / 10) * 10;
        
        const hex = rgbToHex(qr, qg, qb);
        colorMap[hex] = (colorMap[hex] || 0) + 1;
      }

      const sortedColors = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([hex]) => ({
          hex,
          rgb: hexToRgb(hex)
        }));

      setPalette(sortedColors);
      setIsProcessing(false);
    };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const reset = () => {
    setImage(null);
    setPalette([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all",
              image ? "border-transparent" : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50"
            )}
          >
            {image ? (
              <img src={image} alt="Uploaded" className="h-full w-full rounded-2xl object-contain" />
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">Click to upload image</p>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          
          {image && (
            <button
              onClick={reset}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset Image
            </button>
          )}
        </div>

        {/* Palette Area */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Extracted Palette</h3>
            {palette.length > 0 && (
              <button
                onClick={() => {
                  const text = palette.map(p => `${p.hex} (${p.rgb})`).join('\n');
                  copyToClipboard(text, -1);
                }}
                className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
              >
                <Copy className="h-4 w-4" />
                Copy All
              </button>
            )}
          </div>

          {isProcessing ? (
            <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
              <RefreshCcw className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Extracting colors...</p>
            </div>
          ) : palette.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {palette.map((color, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative"
                >
                  <div
                    className="aspect-square rounded-2xl shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="mt-3 space-y-1">
                    <button
                      onClick={() => copyToClipboard(color.hex, i)}
                      className="flex w-full items-center justify-between text-xs font-mono font-bold text-gray-900 dark:text-white hover:text-blue-600"
                    >
                      {color.hex}
                      {copiedIndex === i ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                    <p className="text-[10px] text-gray-500">{color.rgb}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
              <p className="text-sm text-gray-400">Upload an image to see the palette</p>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
