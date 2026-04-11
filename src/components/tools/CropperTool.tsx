import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCcw, Settings2, Crop, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatBytes } from '../../lib/utils';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';

interface CropperToolProps {
  tool: any;
}

const ASPECT_RATIOS = [
  { label: 'Free', value: NaN },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:4', value: 3 / 4 },
  { label: '9:16', value: 9 / 16 },
];

const SIZE_PRESETS = [
  { label: '800 × 600', width: 800, height: 600 },
  { label: '1280 × 720', width: 1280, height: 720 },
  { label: '1920 × 1080', width: 1920, height: 1080 },
  { label: '1080 × 1080', width: 1080, height: 1080 },
  { label: '1200 × 630', width: 1200, height: 630 },
  { label: '1200 × 675', width: 1200, height: 675 },
];

export const CropperTool: React.FC<CropperToolProps> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cropper settings
  const cropperRef = useRef<ReactCropperElement>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(NaN);
  const [cropData, setCropData] = useState<{ width: number; height: number; x: number; y: number } | null>(null);
  
  const [customWidth, setCustomWidth] = useState<number | ''>('');
  const [customHeight, setCustomHeight] = useState<number | ''>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const clearAll = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setCropData(null);
  };

  const onCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const data = cropper.getData(true); // true = rounded values
      setCropData({
        width: data.width,
        height: data.height,
        x: data.x,
        y: data.y
      });
    }
  };

  const applyPresetSize = (w: number, h: number) => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.setData({ width: w, height: h });
      setAspectRatio(w / h);
    }
  };

  const applyCustomSize = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper && customWidth && customHeight) {
      cropper.setData({ width: Number(customWidth), height: Number(customHeight) });
      setAspectRatio(Number(customWidth) / Number(customHeight));
    }
  };

  const processImage = async () => {
    if (!file || !cropperRef.current) return;
    setIsProcessing(true);
    setError(null);

    try {
      const cropper = cropperRef.current.cropper;
      const canvas = cropper.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      if (!canvas) {
        throw new Error('Could not crop image');
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const ext = file.type.split('/')[1] || 'jpg';
          setResult({
            blob,
            name: `${file.name.split('.')[0]}_cropped.${ext}`,
            size: blob.size
          });
        } else {
          setError('Failed to create image blob.');
        }
        setIsProcessing(false);
      }, file.type, 1);
      
    } catch (err) {
      console.error(err);
      setError('An error occurred while cropping. Please try again.');
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
      {/* Main Area */}
      <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800 flex flex-col">
        {!preview ? (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group flex flex-1 min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 dark:bg-gray-800">
              <Crop className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Select an image to crop</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Supports JPG, PNG, WebP</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg, image/png, image/webp" 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Crop Image</h3>
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
                  Reset
                </button>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="flex-1 min-h-[400px] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden relative">
              <Cropper
                src={preview}
                style={{ height: '100%', width: '100%' }}
                aspectRatio={aspectRatio}
                guides={true}
                ref={cropperRef}
                crop={onCrop}
                viewMode={1}
                dragMode="move"
                background={false}
                responsive={true}
                autoCropArea={0.8}
                checkOrientation={false}
              />
              
              {/* Live Crop Size Display */}
              {cropData && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-mono backdrop-blur-sm shadow-lg pointer-events-none">
                  Crop: {cropData.width} × {cropData.height} px
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Settings */}
      <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white">Crop Settings</h3>
        </div>

        <div className="space-y-8 flex-1">
          {/* Aspect Ratios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.label}
                  onClick={() => setAspectRatio(ratio.value)}
                  className={cn(
                    "rounded-lg py-2 text-sm font-medium transition-all border",
                    (Number.isNaN(aspectRatio) && Number.isNaN(ratio.value)) || aspectRatio === ratio.value
                      ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preset Sizes</label>
            <div className="grid grid-cols-2 gap-2">
              {SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPresetSize(preset.width, preset.height)}
                  className="rounded-lg py-2 px-1 text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Custom Size (px)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={customWidth} 
                onChange={(e) => setCustomWidth(e.target.value ? Number(e.target.value) : '')}
                placeholder="Width"
                className="block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <input 
                type="number" 
                value={customHeight} 
                onChange={(e) => setCustomHeight(e.target.value ? Number(e.target.value) : '')}
                placeholder="Height"
                className="block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={applyCustomSize}
                disabled={!customWidth || !customHeight}
                className="rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button
            disabled={!file || isProcessing}
            onClick={processImage}
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
                Cropping...
              </>
            ) : (
              <>
                <Crop className="h-5 w-5" />
                Crop Image
              </>
            )}
          </button>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <button
                onClick={downloadResult}
                className="w-full rounded-xl bg-green-600 py-4 font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Download Cropped Image
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
