import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFPreviewProps {
  data: Uint8Array | string | null;
  maxPages?: number;
  className?: string;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ data, maxPages = 5, className }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    if (!data) return;

    const loadPDF = async () => {
      setLoading(true);
      setError(null);
      try {
        const loadingTask = pdfjsLib.getDocument(data);
        const pdf = await loadingTask.promise;
        setNumPages(Math.min(pdf.numPages, maxPages));
        setCurrentPage(1);
        renderPage(pdf, 1, scale);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF preview');
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [data, maxPages]);

  useEffect(() => {
    if (!data || numPages === 0) return;

    const updatePage = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(data);
        const pdf = await loadingTask.promise;
        renderPage(pdf, currentPage, scale);
      } catch (err) {
        console.error('Error updating page:', err);
      }
    };

    updatePage();
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

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
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
    <div className={cn("flex flex-col items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-4", className)}>
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium">
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages))}
            disabled={currentPage >= numPages}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(prev => Math.min(prev + 0.2, 2.0))}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-auto flex justify-center bg-white dark:bg-gray-900 rounded-lg shadow-inner min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}
        {error ? (
          <div className="flex items-center justify-center h-full text-red-500 p-8 text-center">
            {error}
          </div>
        ) : (
          <canvas ref={canvasRef} className="max-w-full h-auto shadow-lg my-4" />
        )}
      </div>
      
      {numPages < (maxPages === 5 ? 6 : maxPages) && numPages > 0 && (
        <p className="mt-2 text-xs text-gray-500">Showing first {numPages} pages for preview</p>
      )}
    </div>
  );
};
