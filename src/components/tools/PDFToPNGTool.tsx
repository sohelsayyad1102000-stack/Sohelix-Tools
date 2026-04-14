import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  Settings2, 
  FileImage,
  RefreshCcw,
  X,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  List,
  Maximize2,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn, formatBytes } from '../../lib/utils';

// Use the local worker from pdfjs-dist
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFToPNGToolProps {
  tool: any;
}

interface PagePreview {
  pageNumber: number;
  url: string;
  width: number;
  height: number;
}

export const PDFToPNGTool: React.FC<PDFToPNGToolProps> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [previews, setPreviews] = useState<PagePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Settings
  const [scale, setScale] = useState(2); // Quality scale
  const [pageRange, setPageRange] = useState('all'); // 'all' or 'range'
  const [customRange, setCustomRange] = useState('');
  const [isRenderingPreviews, setIsRenderingPreviews] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      await loadPdf(selectedFile);
    } else if (selectedFile) {
      setError('Please select a valid PDF file.');
    }
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      await loadPdf(droppedFile);
    } else if (droppedFile) {
      setError('Please select a valid PDF file.');
    }
  };

  const loadPdf = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setPreviews([]);
    setIsRenderingPreviews(true);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      setPdf(pdfDoc);
      
      // Render first 3 pages for preview
      const numPages = Math.min(pdfDoc.numPages, 3);
      const initialPreviews: PagePreview[] = [];
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context!, viewport, canvas }).promise;
        initialPreviews.push({
          pageNumber: i,
          url: canvas.toDataURL('image/png'),
          width: viewport.width,
          height: viewport.height
        });
      }
      setPreviews(initialPreviews);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Failed to load PDF. The file might be corrupted or password protected.');
    } finally {
      setIsRenderingPreviews(false);
    }
  };

  const convertToPNG = async () => {
    if (!pdf || !file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const zip = new JSZip();
      const pagesToConvert: number[] = [];
      
      if (pageRange === 'all') {
        for (let i = 1; i <= pdf.numPages; i++) pagesToConvert.push(i);
      } else {
        const parts = customRange.split(',').map(p => p.trim());
        for (const part of parts) {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= pdf.numPages) pagesToConvert.push(i);
            }
          } else {
            const num = Number(part);
            if (num >= 1 && num <= pdf.numPages) pagesToConvert.push(num);
          }
        }
      }

      if (pagesToConvert.length === 0) {
        throw new Error('No valid pages selected for conversion.');
      }

      for (let i = 0; i < pagesToConvert.length; i++) {
        const pageNum = pagesToConvert[i];
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context!, viewport, canvas }).promise;
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        
        if (blob) {
          zip.file(`page_${pageNum}.png`, blob);
        }
        
        setProgress(Math.round(((i + 1) / pagesToConvert.length) * 100));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${file.name.replace('.pdf', '')}_images.zip`);
    } catch (err: any) {
      console.error('Error converting PDF:', err);
      setError(err.message || 'An error occurred during conversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPdf(null);
    setPreviews([]);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Main Area */}
        <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800">
          {!file ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group flex h-96 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 dark:bg-gray-800">
                <Upload className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Select PDF or drag & drop here</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Max file size: 15MB</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf" 
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20">
                    <FileImage className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{file.name}</h3>
                    <p className="text-xs text-gray-500">{formatBytes(file.size)} • {pdf?.numPages} pages</p>
                  </div>
                </div>
                <button 
                  onClick={reset}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {previews.map((preview) => (
                  <div key={preview.pageNumber} className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <img src={preview.url} alt={`Page ${preview.pageNumber}`} className="h-full w-full object-contain" />
                    <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-[10px] font-bold text-white">
                      Page {preview.pageNumber}
                    </div>
                  </div>
                ))}
                {pdf && pdf.numPages > 3 && (
                  <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <p className="text-sm font-medium text-gray-500">+{pdf.numPages - 3} more pages</p>
                  </div>
                )}
                {isRenderingPreviews && (
                  <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                    <RefreshCcw className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Settings */}
        <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30">
          <div className="flex items-center gap-2 mb-6">
            <Settings2 className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">Conversion Settings</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resolution (Quality)</label>
              <select 
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value={1}>72 DPI (Low)</option>
                <option value={2}>150 DPI (Medium)</option>
                <option value={3}>300 DPI (High)</option>
                <option value={4}>600 DPI (Ultra)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Page Range</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPageRange('all')}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-xs font-bold transition-all",
                    pageRange === 'all' 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                  )}
                >
                  All Pages
                </button>
                <button 
                  onClick={() => setPageRange('range')}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-xs font-bold transition-all",
                    pageRange === 'range' 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                  )}
                >
                  Custom Range
                </button>
              </div>
              {pageRange === 'range' && (
                <input 
                  type="text" 
                  placeholder="e.g. 1-5, 8, 11-13"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value)}
                  className="mt-2 block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              )}
            </div>

            <button
              disabled={!file || isProcessing}
              onClick={convertToPNG}
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
                  Converting... {progress}%
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Convert to PNG
                </>
              )}
            </button>

            {progress === 100 && !isProcessing && (
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Conversion Complete!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
