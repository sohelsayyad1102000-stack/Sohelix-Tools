import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  Settings2, 
  FileText, 
  GripVertical,
  RefreshCcw,
  X,
  Layout,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { jsPDF } from 'jspdf';
import { cn, formatBytes } from '../../lib/utils';
import { PDFPreview } from '../PDFPreview';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface ImageToPDFToolProps {
  tool: any;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

const SortableImageItem = ({ item, onRemove }: { item: ImageFile, onRemove: (id: string) => void, [key: string]: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 shadow-sm"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
        <img src={item.preview} alt="Preview" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.file.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(item.file.size)}</p>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ImageToPDFTool: React.FC<ImageToPDFToolProps> = ({ tool }) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('before');
  
  // Settings
  const [pageSize, setPageSize] = useLocalStorage<'a4' | 'letter' | 'original'>('img2pdf-pagesize', 'a4');
  const [orientation, setOrientation] = useLocalStorage<'p' | 'l'>('img2pdf-orientation', 'p');
  const [margin, setMargin] = useLocalStorage('img2pdf-margin', 10);
  const [quality, setQuality] = useState(0.8);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const newImages = files
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file)
      }));
    
    setImages(prev => [...prev, ...newImages]);
    setPdfData(null);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // Revoke URL to prevent memory leaks
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
    setPdfData(null);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setPdfData(null);
    }
  };

  const generatePDF = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    
    try {
      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: pageSize === 'original' ? 'a4' : pageSize
      });

      for (let i = 0; i < images.length; i++) {
        if (i > 0) doc.addPage();
        
        const img = images[i];
        const imgData = await getImageData(img.preview);
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        const availableWidth = pageWidth - (margin * 2);
        const availableHeight = pageHeight - (margin * 2);
        
        const ratio = Math.min(availableWidth / imgData.width, availableHeight / imgData.height);
        const finalWidth = imgData.width * ratio;
        const finalHeight = imgData.height * ratio;
        
        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;
        
        doc.addImage(img.preview, 'JPEG', x, y, finalWidth, finalHeight, undefined, 'FAST');
      }

      const pdfOutput = doc.output('arraybuffer');
      setPdfData(new Uint8Array(pdfOutput));
      setActiveTab('after');
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getImageData = (url: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = url;
    });
  };

  const downloadPDF = () => {
    if (!pdfData) return;
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sohelix_images.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
      {/* Main Area */}
      <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800">
        <div className="flex flex-col h-full">
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('before')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'before' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Before (Images)
            </button>
            <button
              onClick={() => setActiveTab('after')}
              disabled={!pdfData}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'after' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700",
                !pdfData && "opacity-50 cursor-not-allowed"
              )}
            >
              After (PDF Preview)
            </button>
          </div>

          <div className="flex-1">
            {activeTab === 'before' ? (
              images.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-96 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <Upload className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload images to convert</h3>
                  <p className="mt-2 text-sm text-gray-500">Drag and drop or click to browse</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white">Images ({images.length})</h3>
                    <button 
                      onClick={() => setImages([])}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={images.map(i => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2">
                        {images.map((img) => (
                          <SortableImageItem key={img.id} item={img} onRemove={removeImage} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all text-sm font-medium"
                  >
                    + Add More Images
                  </button>
                </div>
              )
            ) : (
              <PDFPreview data={pdfData} className="h-full min-h-[500px]" />
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Settings */}
      <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white">PDF Settings</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Page Size</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'a4', label: 'A4' },
                { id: 'letter', label: 'Letter' },
                { id: 'original', label: 'Auto' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setPageSize(s.id as any)}
                  className={cn(
                    "py-2 rounded-lg text-xs font-medium border transition-all",
                    pageSize === s.id 
                      ? "bg-blue-600 text-white border-blue-600" 
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Orientation</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOrientation('p')}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border transition-all",
                  orientation === 'p' 
                    ? "bg-blue-600 text-white border-blue-600" 
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                )}
              >
                <Layout className="h-4 w-4" />
                Portrait
              </button>
              <button
                onClick={() => setOrientation('l')}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border transition-all",
                  orientation === 'l' 
                    ? "bg-blue-600 text-white border-blue-600" 
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                )}
              >
                <Layout className="h-4 w-4 rotate-90" />
                Landscape
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Margin: {margin}mm</label>
            <input 
              type="range" 
              min="0" 
              max="50" 
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              disabled={images.length === 0 || isProcessing}
              onClick={generatePDF}
              className={cn(
                "w-full rounded-xl py-4 font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2",
                images.length === 0 || isProcessing 
                  ? "bg-gray-300 cursor-not-allowed dark:bg-gray-700" 
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
              )}
            >
              {isProcessing ? (
                <>
                  <RefreshCcw className="h-5 w-5 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  Convert to PDF
                </>
              )}
            </button>

            {pdfData && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={downloadPDF}
                className="mt-4 w-full rounded-xl bg-green-600 py-4 font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Download PDF
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
