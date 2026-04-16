import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Search, 
  Moon, 
  Sun, 
  Layout, 
  Sidebar,
  X,
  RefreshCcw,
  FileText
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import { cn, formatBytes } from '../../lib/utils';

// Use the local worker from pdfjs-dist
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFReaderToolProps {
  tool: any;
}

export const PDFReaderTool: React.FC<PDFReaderToolProps> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [viewMode, setViewMode] = useState<'single' | 'scroll'>('single');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPdf = async (selectedFile: File) => {
    setIsLoading(true);
    setFile(selectedFile);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer.slice(0),
        cMapUrl: 'https://unpkg.com/pdfjs-dist@5.6.205/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@5.6.205/standard_fonts/',
        disableFontFace: false, // Ensure font face is NOT disabled
      });
      const pdfDoc = await loadingTask.promise;
      setPdf(pdfDoc);
      setNumPages(pdfDoc.numPages);
      setCurrentPage(1);
      
      // Generate thumbnails
      const thumbs: string[] = [];
      const thumbCount = Math.min(pdfDoc.numPages, 20); // Limit thumbnails for performance
      for (let i = 1; i <= thumbCount; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: canvas.getContext('2d')!, viewport, canvas }).promise;
        thumbs.push(canvas.toDataURL());
      }
      setThumbnails(thumbs);
    } catch (err) {
      console.error('Error loading PDF:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdf || !canvasRef.current) return;
    
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')!;
    
    // Set canvas dimensions
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.height = viewport.height * pixelRatio;
    canvas.width = viewport.width * pixelRatio;
    canvas.style.height = `${viewport.height}px`;
    canvas.style.width = `${viewport.width}px`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    
    await page.render(renderContext).promise;

    // Render text layer for better font compatibility and selection
    if (textLayerRef.current) {
      textLayerRef.current.innerHTML = '';
      textLayerRef.current.style.height = `${viewport.height}px`;
      textLayerRef.current.style.width = `${viewport.width}px`;
      
      const textContent = await page.getTextContent();
      const textLayer = new pdfjsLib.TextLayer({
        textContentSource: textContent,
        container: textLayerRef.current,
        viewport: viewport,
      });
      await textLayer.render();
    }
  }, [pdf, scale]);

  useEffect(() => {
    if (pdf && viewMode === 'single') {
      renderPage(currentPage);
    }
  }, [pdf, currentPage, scale, viewMode, renderPage]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div ref={containerRef} className={cn(
      "flex flex-col h-[800px] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900",
      isDarkMode && "dark"
    )}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            <Sidebar className="h-5 w-5" />
          </button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <input 
              type="number" 
              value={currentPage}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 1 && val <= numPages) setCurrentPage(val);
              }}
              className="w-12 text-center text-sm font-bold bg-gray-50 dark:bg-gray-800 rounded border-none focus:ring-2 focus:ring-blue-600"
            />
            <span className="text-sm text-gray-500">/ {numPages}</span>
            <button 
              disabled={currentPage >= numPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button onClick={handleZoomOut} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded shadow-sm"><ZoomOut className="h-4 w-4" /></button>
            <span className="px-3 text-xs font-bold">{Math.round(scale * 100)}%</span>
            <button onClick={handleZoomIn} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded shadow-sm"><ZoomIn className="h-4 w-4" /></button>
          </div>
          <button onClick={toggleFullscreen} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Maximize2 className="h-5 w-5" /></button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button 
            onClick={() => { setFile(null); setPdf(null); }}
            className="p-2 rounded-lg hover:bg-red-50 text-red-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden bg-gray-100 dark:bg-gray-950">
        {/* Sidebar */}
        {showSidebar && pdf && (
          <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Thumbnails</h4>
            <div className="grid grid-cols-1 gap-4">
              {thumbnails.map((url, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "relative aspect-[3/4] rounded-lg border-2 overflow-hidden transition-all",
                    currentPage === i + 1 ? "border-blue-600 shadow-lg" : "border-transparent hover:border-gray-300"
                  )}
                >
                  <img src={url} className="h-full w-full object-cover" />
                  <div className="absolute bottom-1 right-1 bg-black/50 text-[10px] text-white px-1 rounded">{i + 1}</div>
                </button>
              ))}
              {numPages > 20 && (
                <div className="text-center text-xs text-gray-500 py-4">More thumbnails hidden for performance</div>
              )}
            </div>
          </div>
        )}

        {/* Viewer Area */}
        <div className="flex-1 overflow-auto p-8 flex justify-center items-start scroll-smooth">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="m-auto flex h-96 w-full max-w-xl cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-500"
            >
              <Upload className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Open PDF to Read</h3>
              <p className="mt-2 text-sm text-gray-500">Drag and drop or click to browse</p>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={(e) => e.target.files?.[0] && loadPdf(e.target.files[0])} />
            </div>
          ) : isLoading ? (
            <div className="m-auto flex flex-col items-center gap-4">
              <RefreshCcw className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-sm font-bold text-gray-500">Loading Document...</p>
            </div>
          ) : (
            <div className="relative shadow-2xl bg-white dark:bg-white/5">
              <canvas ref={canvasRef} className="max-w-full h-auto" />
              <div 
                ref={textLayerRef} 
                className="textLayer absolute top-0 left-0 origin-top-left" 
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      {file && (
        <div className="px-6 py-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between text-[10px] font-medium text-gray-500">
          <div className="flex items-center gap-4">
            <span>{file.name}</span>
            <span>{formatBytes(file.size)}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>PDF Version: {pdf?.fingerprint?.slice(0, 8)}</span>
            <span>Page {currentPage} of {numPages}</span>
          </div>
        </div>
      )}
    </div>
  );
};
