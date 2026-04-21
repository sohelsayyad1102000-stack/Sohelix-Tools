import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, Copy, Search, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFPageResult {
  pageNumber: number;
  text: string;
}

export const PDFToTextTool: React.FC<{ tool: any }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<PDFPageResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageRange, setPageRange] = useState({ start: 1, end: 0 });
  const [totalPages, setTotalPages] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResults([]);
      setError(null);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setTotalPages(pdf.numPages);
        setPageRange({ start: 1, end: pdf.numPages });
      } catch (err) {
        setError('Could not read PDF info. Please try another file.');
      }
    } else if (selectedFile) {
      setError('Please upload a valid PDF file.');
    }
  };

  const processPDF = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    const pageResults: PDFPageResult[] = [];

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const start = Math.max(1, pageRange.start);
      const end = Math.min(pdf.numPages, pageRange.end || pdf.numPages);

      for (let i = start; i <= end; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        pageResults.push({
          pageNumber: i,
          text: text.trim()
        });
        
        setProgress(Math.round(((i - start + 1) / (end - start + 1)) * 100));
      }
      
      setResults(pageResults);
    } catch (err) {
      console.error(err);
      setError('Failed to extract text from PDF. The file might be encrypted or corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyAll = () => {
    const allText = results.map(r => `--- Page ${r.pageNumber} ---\n${r.text}`).join('\n\n');
    navigator.clipboard.writeText(allText);
  };

  const copyPage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadTxt = () => {
    const allText = results.map(r => `--- Page ${r.pageNumber} ---\n${r.text}`).join('\n\n');
    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace('.pdf', '')}_extracted_text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredResults = results.filter(r => 
    r.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <div className="p-8">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile?.type === 'application/pdf') {
                  handleFileChange({ target: { files: e.dataTransfer.files } } as any);
                }
              }}
              className="group flex h-80 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 dark:bg-gray-800">
                <Upload className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Upload PDF to Extract Text</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Drag & drop or click to browse</p>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{file.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} Pages</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                    <input 
                      type="number" 
                      min="1" 
                      max={totalPages}
                      value={pageRange.start}
                      onChange={(e) => setPageRange(prev => ({ ...prev, start: parseInt(e.target.value) }))}
                      className="w-16 px-2 py-1 text-sm bg-transparent focus:outline-none dark:text-white"
                    />
                    <span className="text-gray-400">to</span>
                    <input 
                      type="number" 
                      min="1" 
                      max={totalPages}
                      value={pageRange.end}
                      onChange={(e) => setPageRange(prev => ({ ...prev, end: parseInt(e.target.value) }))}
                      className="w-16 px-2 py-1 text-sm bg-transparent focus:outline-none dark:text-white"
                    />
                  </div>
                  
                  <button 
                    onClick={() => { setFile(null); setResults([]); }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {!isProcessing && results.length === 0 && (
                <button
                  onClick={processPDF}
                  className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                >
                  Extract Text Now
                </button>
              )}

              {isProcessing && (
                <div className="space-y-4 py-8">
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    <span className="font-bold text-gray-700 dark:text-gray-300">Extracting Text... {progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-3">
                  <span className="font-medium">{error}</span>
                </div>
              )}
            </div>
          )}

          {results.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6 pt-8 border-t border-gray-100 dark:border-gray-800"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search in extracted text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={copyAll}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    <Copy className="h-4 w-4" />
                    Copy All
                  </button>
                  <button 
                    onClick={downloadTxt}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Download .txt
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {filteredResults.map((result) => (
                    <motion.div 
                      key={result.pageNumber}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 hover:border-blue-200 dark:hover:border-blue-900 transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                          Page {result.pageNumber}
                        </span>
                        <button 
                          onClick={() => copyPage(result.text)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                        {result.text}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredResults.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No results found for "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
