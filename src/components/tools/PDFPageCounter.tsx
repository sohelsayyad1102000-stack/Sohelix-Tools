import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Hash, 
  Info, 
  Calendar, 
  User, 
  HardDrive,
  RefreshCcw,
  CheckCircle2
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { formatBytes } from '../../lib/utils';

// Use the local worker from pdfjs-dist
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFPageCounterProps {
  tool: any;
}

interface PDFMetadata {
  pages: number;
  size: number;
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
}

export const PDFPageCounter: React.FC<PDFPageCounterProps> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PDFMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      await analyzePdf(selectedFile);
    }
  };

  const analyzePdf = async (selectedFile: File) => {
    setIsLoading(true);
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
      const pdfDoc = await loadingTask.promise;
      const info = await pdfDoc.getMetadata();
      
      setMetadata({
        pages: pdfDoc.numPages,
        size: selectedFile.size,
        title: (info.info as any).Title,
        author: (info.info as any).Author,
        creator: (info.info as any).Creator,
        producer: (info.info as any).Producer,
        creationDate: (info.info as any).CreationDate,
      });
    } catch (err) {
      setError('Failed to analyze PDF. Please try another file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <div className="p-8">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500"
            >
              <Upload className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload PDF to count pages</h3>
              <p className="mt-2 text-sm text-gray-500">Instant results, no upload required</p>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <RefreshCcw className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-sm font-bold text-gray-500">Analyzing Document...</p>
            </div>
          ) : metadata ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{file.name}</h3>
                    <p className="text-sm text-gray-500">Analysis Complete</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setFile(null); setMetadata(null); }}
                  className="text-sm font-bold text-blue-600 hover:underline"
                >
                  Check another file
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl bg-blue-50 p-6 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                  <div className="flex items-center gap-3 text-blue-600 mb-2">
                    <Hash className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Total Pages</span>
                  </div>
                  <p className="text-4xl font-black text-blue-900 dark:text-blue-100">{metadata.pages}</p>
                </div>
                
                <div className="rounded-2xl bg-green-50 p-6 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50">
                  <div className="flex items-center gap-3 text-green-600 mb-2">
                    <HardDrive className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">File Size</span>
                  </div>
                  <p className="text-4xl font-black text-green-900 dark:text-green-100">{formatBytes(metadata.size)}</p>
                </div>

                <div className="rounded-2xl bg-purple-50 p-6 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50">
                  <div className="flex items-center gap-3 text-purple-600 mb-2">
                    <Info className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">PDF Version</span>
                  </div>
                  <p className="text-4xl font-black text-purple-900 dark:text-purple-100">1.7</p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  Document Metadata
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Title</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{metadata.title || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Author</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{metadata.author || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Creation Date</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{metadata.creationDate || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Settings2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Producer</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{metadata.producer || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : error && (
            <div className="text-center py-12">
              <p className="text-red-600 font-bold">{error}</p>
              <button onClick={() => setFile(null)} className="mt-4 text-blue-600 underline">Try again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Settings2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
);
