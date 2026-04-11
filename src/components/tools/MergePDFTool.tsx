import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  Settings2, 
  FileText, 
  GripVertical,
  RefreshCcw,
  Combine,
  File
} from 'lucide-react';
import { motion } from 'motion/react';
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
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { cn, formatBytes } from '../../lib/utils';
import { PDFPreview } from '../PDFPreview';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface MergePDFToolProps {
  tool: any;
}

interface PDFFile {
  id: string;
  file: File;
  pageCount: number;
  preview?: string;
}

const SortablePDFItem = ({ item, onRemove }: { item: PDFFile, onRemove: (id: string) => void, [key: string]: any }) => {
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
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
        {item.preview ? (
          <img src={item.preview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <FileText className="h-8 w-8 text-blue-600" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.file.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatBytes(item.file.size)} • {item.pageCount} pages
        </p>
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

export const MergePDFTool: React.FC<MergePDFToolProps> = ({ tool }) => {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdfData, setMergedPdfData] = useState<Uint8Array | null>(null);
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('before');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = async (files: File[]) => {
    const validFiles = files.filter(f => f.type === 'application/pdf');
    
    const newPdfs: PDFFile[] = [];
    for (const file of validFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Generate thumbnail for first page
      let preview = '';
      try {
        const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
        const pdfDoc = await loadingTask.promise;
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await (page as any).render({ canvasContext: context!, viewport }).promise;
        preview = canvas.toDataURL();
      } catch (err) {
        console.error('Thumbnail generation error:', err);
      }

      newPdfs.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        pageCount: pdf.getPageCount(),
        preview
      });
    }
    
    setPdfFiles(prev => [...prev, ...newPdfs]);
    setMergedPdfData(null);
  };

  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(p => p.id !== id));
    setMergedPdfData(null);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setPdfFiles((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setMergedPdfData(null);
    }
  };

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) return;
    setIsProcessing(true);
    
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      setMergedPdfData(pdfBytes);
      setActiveTab('after');
    } catch (err) {
      console.error('PDF Merge Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (!mergedPdfData) return;
    const blob = new Blob([mergedPdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sohelix_merged.pdf';
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
              Before (Files)
            </button>
            <button
              onClick={() => setActiveTab('after')}
              disabled={!mergedPdfData}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'after' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700",
                !mergedPdfData && "opacity-50 cursor-not-allowed"
              )}
            >
              After (Merged PDF)
            </button>
          </div>

          <div className="flex-1">
            {activeTab === 'before' ? (
              pdfFiles.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-96 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <Upload className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload PDFs to merge</h3>
                  <p className="mt-2 text-sm text-gray-500">Drag and drop or click to browse</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept="application/pdf" 
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white">PDF Files ({pdfFiles.length})</h3>
                    <button 
                      onClick={() => setPdfFiles([])}
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
                      items={pdfFiles.map(i => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2">
                        {pdfFiles.map((pdf) => (
                          <SortablePDFItem key={pdf.id} item={pdf} onRemove={removeFile} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all text-sm font-medium"
                  >
                    + Add More PDF Files
                  </button>
                </div>
              )
            ) : (
              <PDFPreview data={mergedPdfData} className="h-full min-h-[500px]" />
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Settings */}
      <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30">
        <div className="flex items-center gap-2 mb-6">
          <Combine className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white">Merge Options</h3>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Drag and drop files to reorder them. The files will be combined in the order they appear in the list.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              disabled={pdfFiles.length < 2 || isProcessing}
              onClick={mergePDFs}
              className={cn(
                "w-full rounded-xl py-4 font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2",
                pdfFiles.length < 2 || isProcessing 
                  ? "bg-gray-300 cursor-not-allowed dark:bg-gray-700" 
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
              )}
            >
              {isProcessing ? (
                <>
                  <RefreshCcw className="h-5 w-5 animate-spin" />
                  Merging PDFs...
                </>
              ) : (
                <>
                  <Combine className="h-5 w-5" />
                  Merge PDFs
                </>
              )}
            </button>

            {mergedPdfData && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={downloadPDF}
                className="mt-4 w-full rounded-xl bg-green-600 py-4 font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Download Merged PDF
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
