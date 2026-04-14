import React, { useState, useRef, useEffect } from 'react';
import { Upload, Copy, Check, RefreshCcw, Pipette } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const ImageColorPicker: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setPickedColor(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const getColorAtPosition = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, isClick: boolean) => {
    if (!image || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = imageRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const rect = img.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Scale coordinates to natural image size
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const actualX = Math.floor(x * scaleX);
    const actualY = Math.floor(y * scaleY);

    const pixel = ctx.getImageData(actualX, actualY, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

    if (isClick) {
      setPickedColor(hex);
    } else {
      setHoverColor(hex);
    }
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(null), 2000);
  };

  const reset = () => {
    setImage(null);
    setPickedColor(null);
    setHoverColor(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Area */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all",
              image ? "border-transparent cursor-crosshair" : "aspect-video flex flex-col items-center justify-center border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50"
            )}
            onClick={(e) => {
              if (!image) fileInputRef.current?.click();
              else getColorAtPosition(e, true);
            }}
            onMouseMove={(e) => image && getColorAtPosition(e, false)}
          >
            {image ? (
              <img 
                ref={imageRef}
                src={image} 
                alt="Picker Source" 
                className="h-full w-full object-contain pointer-events-none" 
              />
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800">
                  <Pipette className="h-8 w-8 text-blue-600" />
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

        {/* Picker Info Area */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Color Info</h3>
            
            <div className="space-y-8">
              {/* Hover Color */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Hovering</p>
                <div className="flex items-center gap-4">
                  <div 
                    className="h-12 w-12 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner"
                    style={{ backgroundColor: hoverColor || 'transparent' }}
                  />
                  <div className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                    {hoverColor || '#------'}
                  </div>
                </div>
              </div>

              {/* Picked Color */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Selected Color</p>
                <div className="flex items-center gap-4">
                  <div 
                    className="h-20 w-20 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner"
                    style={{ backgroundColor: pickedColor || 'transparent' }}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                      {pickedColor || '#------'}
                    </div>
                    {pickedColor && (
                      <button
                        onClick={() => copyToClipboard(pickedColor)}
                        className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy HEX
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {!image && (
              <div className="mt-8 text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-500">Upload an image and click anywhere to pick a color.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
