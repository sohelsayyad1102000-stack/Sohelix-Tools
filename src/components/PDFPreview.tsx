import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

// Use the local worker from pdfjs-dist
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFPreviewProps {
  data: Uint8Array | ArrayBuffer | string | null;
  maxPages?: number;
  className?: string;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ data, maxPages = 3, className }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const pdfDocRef = useRef<any>(null);

  useEffect(() => {
    if (!data) return;

    const loadPDF = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ensure data is in the right format for getDocument
        // We slice the buffer to prevent detachment issues if the same data is reused
        const pdfData = data instanceof Uint8Array 
          ? new Uint8Array(data.buffer.slice(0)) 
          : new Uint8Array((data as ArrayBuffer).slice(0));

        const loadingTask = pdfjsLib.getDocument({ 
          data: pdfData,
          cMapUrl: 'https://unpkg.com/pdfjs-dist@5.6.205/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@5.6.205/standard_fonts/',
          disableFontFace: false,
        });
        
        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf;
        setNumPages(Math.min(pdf.numPages, maxPages));
        setCurrentPage(1);
        renderPage(pdf, 1, scale);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF preview. The file might be corrupted or invalid.');
      } finally {
        setLoading(false);
      }
    };

    loadPDF();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [data, maxPages]);

  useEffect(() => {
    if (!pdfDocRef.current || numPages === 0) return;
    renderPage(pdfDocRef.current, currentPage, scale);
  }, [currentPage, scale]);

  const renderPage = async (pdf: any, pageNum: number, currentScale: number) => {
    if (!canvasRef.current) return;

    // Cancel previous render task
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: currentScale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      // Set canvas dimensions
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.height = viewport.height * pixelRatio;
      canvas.width = viewport.width * pixelRatio;
      canvas.style.height = `${viewport.height}px`;
      canvas.style.width = `${viewport.width}px`;

      context.scale(pixelRatio, pixelRatio);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
    } catch (err: any) {
      if (err.name === 'RenderingCancelledException') return;
      console.error('Error rendering page:', err);
    }
  };

  if (!data) return null;

  return (
    <div className={cn("flex flex-col items-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700", className)}>
      <div className="flex flex-wrap items-center justify-between w-full gap-4 mb-6">
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1 || loading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold min-w-[80px] text-center">
            {currentPage} / {numPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages))}
            disabled={currentPage >= numPages || loading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
            title="Next Page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(prev => Math.min(prev + 0.2, 2.0))}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-auto flex justify-center bg-gray-200 dark:bg-gray-900 rounded-xl shadow-inner min-h-[500px] border border-gray-300 dark:border-gray-800">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rendering PDF...</p>
          </div>
        )}
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500 p-12 text-center max-w-md">
            <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="font-bold mb-2">Preview Error</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : (
          <div className="p-8">
            <canvas ref={canvasRef} className="max-w-full h-auto shadow-2xl bg-white" />
          </div>
        )}
      </div>
      
      {!error && numPages > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-3 py-1.5 rounded-full">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Showing first {numPages} pages for preview performance</span>
        </div>
      )}
    </div>
  );
};
