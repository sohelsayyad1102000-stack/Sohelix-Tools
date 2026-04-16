import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  RotateCw, 
  Trash2, 
  Download, 
  Settings2, 
  RefreshCcw,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { cn, formatBytes } from '../../lib/utils';

// Use the local worker from pdfjs-dist
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFPageRotatorProps {
  tool: any;
}

interface PageRotation {
  pageNumber: number;
  rotation: number; // 0, 90, 180, 270
  previewUrl: string;
}

export const PDFPageRotator: React.FC<PDFPageRotatorProps> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PageRotation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Global settings
  const [globalRotation, setGlobalRotation] = useState(90);
  const [applyTo, setApplyTo] = useState<'all' | 'range' | 'individual'>('all');
  const [customRange, setCustomRange] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      await loadPdf(selectedFile);
    }
  };

  const loadPdf = async (selectedFile: File) => {
    setIsProcessing(true);
    setError(null);
    setFile(selectedFile);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer.slice(0),
        cMapUrl: 'https://unpkg.com/pdfjs-dist@5.6.205/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@5.6.205/standard_fonts/',
        disableFontFace: false,
      });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      
      const newPages: PageRotation[] = [];
      const renderCount = Math.min(pdf.numPages, 12); // Limit previews for performance
      
      for (let i = 1; i <= renderCount; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: canvas.getContext('2d')!, viewport, canvas }).promise;
        
        newPages.push({
          pageNumber: i,
          rotation: 0,
          previewUrl: canvas.toDataURL()
        });
      }
      setPages(newPages);
    } catch (err) {
      setError('Failed to load PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const rotatePage = (index: number) => {
    setPages(prev => prev.map((p, i) => 
      i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p
    ));
  };

  const rotateAll = () => {
    setPages(prev => prev.map(p => ({ ...p, rotation: (p.rotation + 90) % 360 })));
    setGlobalRotation(prev => (prev + 90) % 360);
  };

  const savePdf = async () => {
    if (!file) return;
    setIsSaving(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfLibDoc = await PDFDocument.load(arrayBuffer);
      const pdfPages = pdfLibDoc.getPages();

      if (applyTo === 'all') {
        pdfPages.forEach(page => {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + globalRotation) % 360));
        });
      } else if (applyTo === 'range') {
        const parts = customRange.split(',').map(p => p.trim());
        const targetPages = new Set<number>();
        parts.forEach(part => {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            for (let i = start; i <= end; i++) targetPages.add(i);
          } else {
            targetPages.add(Number(part));
          }
        });
        targetPages.forEach(pageNum => {
          if (pageNum >= 1 && pageNum <= pdfPages.length) {
            const page = pdfPages[pageNum - 1];
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees((currentRotation + globalRotation) % 360));
          }
        });
      } else {
        // Individual rotations from preview state
        pages.forEach(p => {
          if (p.rotation !== 0) {
            const page = pdfPages[p.pageNumber - 1];
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees((currentRotation + p.rotation) % 360));
          }
        });
      }

      const pdfBytes = await pdfLibDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_rotated.pdf`;
      a.click();
    } catch (err) {
      console.error(err);
      setError('Failed to save rotated PDF.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Main Area */}
        <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group flex h-96 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500"
            >
              <Upload className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload PDF to rotate pages</h3>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
            </div>
          ) : isProcessing ? (
            <div className="flex h-96 items-center justify-center">
              <RefreshCcw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{file.name}</h3>
                    <p className="text-xs text-gray-500">{pdfDoc?.numPages} pages • {formatBytes(file.size)}</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setPages([]); }} className="text-gray-400 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2">
                {pages.map((p, i) => (
                  <div key={p.pageNumber} className="group relative aspect-[3/4] rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                    <div 
                      className="h-full w-full transition-transform duration-300 flex items-center justify-center"
                      style={{ transform: `rotate(${p.rotation}deg)` }}
                    >
                      <img src={p.previewUrl} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => rotatePage(i)}
                        className="p-2 rounded-full bg-white text-blue-600 shadow-lg hover:scale-110 transition-transform"
                      >
                        <RotateCw className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-[10px] text-white px-2 py-0.5 rounded">
                      Page {p.pageNumber}
                    </div>
                  </div>
                ))}
                {pdfDoc && pdfDoc.numPages > 12 && (
                  <div className="flex aspect-[3/4] items-center justify-center rounded-xl border border-dashed border-gray-200 text-xs text-gray-500 text-center p-4">
                    Previews limited to first 12 pages. Rotation settings will still apply to all pages.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30">
          <div className="flex items-center gap-2 mb-6">
            <Settings2 className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">Rotation Settings</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apply To</label>
              <div className="space-y-2">
                {['all', 'range', 'individual'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setApplyTo(mode as any)}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      applyTo === mode 
                        ? "bg-blue-600 text-white shadow-lg" 
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                    )}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {applyTo === 'range' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Page Range</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1-5, 8, 10-12"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            )}

            {(applyTo === 'all' || applyTo === 'range') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rotation Angle</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[90, 180, 270].map(angle => (
                    <button
                      key={angle}
                      onClick={() => setGlobalRotation(angle)}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold border transition-all",
                        globalRotation === angle 
                          ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800" 
                          : "bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700"
                      )}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              disabled={!file || isSaving}
              onClick={savePdf}
              className={cn(
                "w-full rounded-xl py-4 font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2",
                !file || isSaving ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {isSaving ? <RefreshCcw className="animate-spin" /> : <Download />}
              Save & Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
