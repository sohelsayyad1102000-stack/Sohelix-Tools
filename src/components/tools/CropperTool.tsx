import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Upload, 
  Download, 
  RefreshCcw, 
  Settings2, 
  Crop, 
  Image as ImageIcon, 
  AlertCircle,
  RotateCw,
  ZoomIn,
  Square,
  Circle,
  Undo2,
  Maximize2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatBytes } from '../../lib/utils';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface CropperToolProps {
  tool: any;
}

const ASPECT_RATIOS = [
  { label: 'Free', value: NaN },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: 'Passport', value: 35 / 45 }, // Standard 35mm x 45mm
];

const SIZE_PRESETS = [
  { label: 'Instagram Post', width: 1080, height: 1080 },
  { label: 'Instagram Story', width: 1080, height: 1920 },
  { label: 'YouTube Thumb', width: 1280, height: 720 },
  { label: 'Facebook Post', width: 1200, height: 630 },
  { label: 'Twitter Post', width: 1200, height: 675 },
  { label: 'Passport (3.5x4.5cm)', width: 413, height: 531 }, // 300 DPI
];

export const CropperTool: React.FC<CropperToolProps> = ({ tool }) => {
  const location = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string; size: number; preview: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cropper settings
  const cropperRef = useRef<ReactCropperElement>(null);
  const [aspectRatio, setAspectRatio] = useLocalStorage<number>('cropper-aspect-ratio', NaN);
  const [cropShape, setCropShape] = useLocalStorage<'rectangle' | 'circle'>('cropper-shape', 'rectangle');
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(0);
  const [cropData, setCropData] = useState<{ width: number; height: number; x: number; y: number } | null>(null);
  
  const [customWidth, setCustomWidth] = useLocalStorage<number | ''>('cropper-custom-width', '');
  const [customHeight, setCustomHeight] = useLocalStorage<number | ''>('cropper-custom-height', '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle programmatic paths
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('circle')) {
      setCropShape('circle');
      setAspectRatio(1);
    } else if (path.includes('square')) {
      setAspectRatio(1);
      setCropShape('rectangle');
    } else if (path.includes('16x9')) {
      setAspectRatio(16 / 9);
      setCropShape('rectangle');
    } else if (path.includes('passport')) {
      setAspectRatio(35 / 45);
      setCropShape('rectangle');
    }
  }, [location.pathname]);

  // cleanup on unmount or before creating new preview
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

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
      setRotation(0);
      setZoom(0);
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
      setRotation(0);
      setZoom(0);
    }
  };

  const clearAll = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setCropData(null);
    setRotation(0);
    setZoom(0);
  };

  const onCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const data = cropper.getData(true);
      setCropData({
        width: data.width,
        height: data.height,
        x: data.x,
        y: data.y
      });
    }
  };

  const handleRotate = (value: number) => {
    setRotation(value);
    cropperRef.current?.cropper.rotateTo(value);
  };

  const handleZoom = (value: number) => {
    setZoom(value);
    // Cropper zoom is relative, so we need to calculate the difference or use zoomTo
    // zoomTo(1) is original size. We'll map 0-100 to 1-3
    const zoomLevel = 1 + (value / 50);
    cropperRef.current?.cropper.zoomTo(zoomLevel);
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
      let canvas = cropper.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      if (!canvas) {
        throw new Error('Could not crop image');
      }

      // Handle Circle Crop
      if (cropShape === 'circle') {
        const circleCanvas = document.createElement('canvas');
        const ctx = circleCanvas.getContext('2d');
        const size = Math.min(canvas.width, canvas.height);
        
        circleCanvas.width = size;
        circleCanvas.height = size;
        
        if (ctx) {
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(canvas, (canvas.width - size) / 2, (canvas.height - size) / 2, size, size, 0, 0, size, size);
          canvas = circleCanvas;
        }
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const ext = file.type.split('/')[1] || 'jpg';
          setResult({
            blob,
            name: `${file.name.split('.')[0]}_cropped.${ext}`,
            size: blob.size,
            preview: canvas.toDataURL(file.type)
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
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Main Area */}
        <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800 flex flex-col">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/jpeg, image/png, image/webp, image/heic" 
            onChange={handleFileChange}
          />
          {!preview ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-1 min-h-[500px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl transition-transform group-hover:scale-110 dark:bg-gray-800">
                <Crop className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">Select an image to crop</h3>
              <p className="mt-3 text-gray-500 dark:text-gray-400">Drag & drop or click to browse (JPG, PNG, WebP, HEIC)</p>
              <button className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">
                Select Image
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <Crop className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Adjust Crop Area</h3>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Change Image
                  </button>
                  <button 
                    onClick={clearAll}
                    className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700"
                  >
                    <Undo2 className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
              )}

              <div className={cn(
                "flex-1 min-h-[500px] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden relative border border-gray-200 dark:border-gray-700",
                cropShape === 'circle' && "cropper-circle-mask"
              )}>
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
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-full text-sm font-bold font-mono backdrop-blur-md shadow-2xl pointer-events-none border border-white/10">
                    {cropData.width} × {cropData.height} px
                  </div>
                )}
              </div>

              {/* Bottom Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <RotateCw className="h-4 w-4" />
                      Rotate
                    </label>
                    <span className="text-xs font-mono text-blue-600">{rotation}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={rotation}
                    onChange={(e) => handleRotate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-gray-700"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <ZoomIn className="h-4 w-4" />
                      Zoom
                    </label>
                    <span className="text-xs font-mono text-blue-600">{zoom}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={zoom}
                    onChange={(e) => handleZoom(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Settings */}
        <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <Settings2 className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Crop Options</h3>
          </div>

          <div className="space-y-8 flex-1">
            {/* Crop Shape */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Crop Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCropShape('rectangle')}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all border",
                    cropShape === 'rectangle'
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  )}
                >
                  <Square className="h-4 w-4" />
                  Rectangle
                </button>
                <button
                  onClick={() => {
                    setCropShape('circle');
                    setAspectRatio(1);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all border",
                    cropShape === 'circle'
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  )}
                >
                  <Circle className="h-4 w-4" />
                  Circle
                </button>
              </div>
            </div>

            {/* Aspect Ratios */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.label}
                    disabled={cropShape === 'circle' && ratio.value !== 1 && !Number.isNaN(ratio.value)}
                    onClick={() => setAspectRatio(ratio.value)}
                    className={cn(
                      "rounded-xl py-2.5 text-xs font-bold transition-all border",
                      (Number.isNaN(aspectRatio) && Number.isNaN(ratio.value)) || aspectRatio === ratio.value
                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700",
                      cropShape === 'circle' && ratio.value !== 1 && !Number.isNaN(ratio.value) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Sizes */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Popular Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {SIZE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPresetSize(preset.width, preset.height)}
                    className="rounded-xl py-2.5 px-2 text-[10px] font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Size */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Custom Target (px)</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={customWidth} 
                  onChange={(e) => setCustomWidth(e.target.value ? Number(e.target.value) : '')}
                  placeholder="W"
                  className="block w-full rounded-xl border-gray-200 bg-white px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <input 
                  type="number" 
                  value={customHeight} 
                  onChange={(e) => setCustomHeight(e.target.value ? Number(e.target.value) : '')}
                  placeholder="H"
                  className="block w-full rounded-xl border-gray-200 bg-white px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button
                  onClick={applyCustomSize}
                  disabled={!customWidth || !customHeight}
                  className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <button
              disabled={!file || isProcessing}
              onClick={processImage}
              className={cn(
                "w-full rounded-2xl py-5 font-black text-lg text-white shadow-xl transition-all flex items-center justify-center gap-3",
                !file || isProcessing 
                  ? "bg-gray-300 cursor-not-allowed dark:bg-gray-700" 
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/40 hover:-translate-y-1"
              )}
            >
              {isProcessing ? (
                <>
                  <RefreshCcw className="h-6 w-6 animate-spin" />
                  Cropping...
                </>
              ) : (
                <>
                  <Crop className="h-6 w-6" />
                  Crop Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3 aspect-square rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700 flex items-center justify-center p-4">
              <img 
                src={result.preview} 
                alt="Cropped Preview" 
                className={cn(
                  "max-w-full max-h-full object-contain shadow-lg",
                  cropShape === 'circle' && "rounded-full"
                )}
              />
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Image Cropped Successfully!</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Your image has been cropped with precision and is ready for download.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Dimensions</span>
                  <span className="text-lg font-black text-gray-900 dark:text-white">{cropData?.width} × {cropData?.height} px</span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">File Size</span>
                  <span className="text-lg font-black text-gray-900 dark:text-white">{formatBytes(result.size)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={downloadResult}
                  className="flex-1 rounded-2xl bg-green-600 py-4 font-black text-white shadow-xl shadow-green-500/30 transition-all hover:bg-green-700 hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <Download className="h-6 w-6" />
                  Download Image
                </button>
                <button
                  onClick={clearAll}
                  className="flex-1 rounded-2xl bg-gray-100 py-4 font-black text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="h-5 w-5" />
                  Crop Another
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Circle Crop CSS Mask */}
      <style dangerouslySetInnerHTML={{ __html: `
        .cropper-circle-mask .cropper-view-box,
        .cropper-circle-mask .cropper-face {
          border-radius: 50%;
        }
        .cropper-circle-mask .cropper-view-box {
          outline: none;
          box-shadow: 0 0 0 1px #39f;
        }
      `}} />
    </div>
  );
};
