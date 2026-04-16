import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  Settings2, 
  FileImage,
  RefreshCcw,
  CheckCircle2
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn, formatBytes } from '../../lib/utils';

// Use the local worker from pdfjs-dist
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFToJPGToolProps {
  tool: any;
}

interface PagePreview {
  pageNumber: number;
  url: string;
}

export const PDFToJPGTool: React.FC<PDFToJPGToolProps> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [previews, setPreviews] = useState<PagePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Settings
  const [scale, setScale] = useState(2);
  const [jpgQuality, setJpgQuality] = useState(0.85);
  const [pageRange, setPageRange] = useState('all');
  const [customRange, setCustomRange] = useState('');
  const [isRenderingPreviews, setIsRenderingPreviews] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      await loadPdf(selectedFile);
    }
  };

  const loadPdf = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setPreviews([]);
    setIsRenderingPreviews(true);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer.slice(0),
        cMapUrl: 'https://unpkg.com/pdfjs-dist@5.6.205/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@5.6.205/standard_fonts/',
        disableFontFace: false,
      });
      const pdfDoc = await loadingTask.promise;
      setPdf(pdfDoc);
      
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
          url: canvas.toDataURL('image/jpeg', 0.7)
        });
      }
      setPreviews(initialPreviews);
    } catch (err) {
      setError('Failed to load PDF.');
    } finally {
      setIsRenderingPreviews(false);
    }
  };

  const convertToJPG = async () => {
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

      for (let i = 0; i < pagesToConvert.length; i++) {
        const pageNum = pagesToConvert[i];
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context!, viewport, canvas }).promise;
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', jpgQuality));
        
        if (blob) zip.file(`page_${pageNum}.jpg`, blob);
        setProgress(Math.round(((i + 1) / pagesToConvert.length) * 100));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${file.name.replace('.pdf', '')}_images.zip`);
    } catch (err: any) {
      setError(err.message || 'Error during conversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group flex h-96 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500"
            >
              <Upload className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select PDF for JPG conversion</h3>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileImage className="h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{file.name}</h3>
                    <p className="text-xs text-gray-500">{formatBytes(file.size)} • {pdf?.numPages} pages</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setPdf(null); }} className="text-gray-400 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {previews.map((p) => (
                  <div key={p.pageNumber} className="aspect-[3/4] rounded-lg border border-gray-200 overflow-hidden">
                    <img src={p.url} className="h-full w-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30">
          <div className="flex items-center gap-2 mb-6">
            <Settings2 className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">JPG Settings</h3>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">JPG Quality: {Math.round(jpgQuality * 100)}%</label>
              <input 
                type="range" min="0.1" max="1" step="0.05" value={jpgQuality} 
                onChange={(e) => setJpgQuality(Number(e.target.value))}
                className="w-full accent-blue-600 mt-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resolution</label>
              <select value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full mt-1 rounded-lg border-gray-200 p-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                <option value={1}>72 DPI</option>
                <option value={2}>150 DPI</option>
                <option value={3}>300 DPI</option>
              </select>
            </div>
            <button
              disabled={!file || isProcessing}
              onClick={convertToJPG}
              className={cn(
                "w-full rounded-xl py-4 font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2",
                !file || isProcessing ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {isProcessing ? <RefreshCcw className="animate-spin" /> : <Download />}
              Convert to JPG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
