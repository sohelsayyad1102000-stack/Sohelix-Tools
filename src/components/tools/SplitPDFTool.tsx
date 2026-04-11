import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  Settings2, 
  FileText, 
  RefreshCcw,
  Scissors,
  File,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { PDFDocument } from 'pdf-lib';
import { cn, formatBytes } from '../../lib/utils';
import { PDFPreview } from '../PDFPreview';

interface SplitPDFToolProps {
  tool: any;
}

export const SplitPDFTool: React.FC<SplitPDFToolProps> = ({ tool }) => {
  const [pdfFile, setPdfFile] = useState<{ file: File, pageCount: number, data: Uint8Array } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitPdfData, setSplitPdfData] = useState<Uint8Array | null>(null);
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('before');
  const [error, setError] = useState<string | null>(null);
  
  // Settings
  const [fromPage, setFromPage] = useState<number>(1);
  const [toPage, setToPage] = useState<number>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Please upload a valid PDF file.');
        return;
      }
      
      setError(null);
      setIsProcessing(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);
        const pdf = await PDFDocument.load(pdfData);
        const count = pdf.getPageCount();
        
        setPdfFile({
          file,
          pageCount: count,
          data: pdfData
        });
        setFromPage(1);
        setToPage(count);
        setSplitPdfData(null);
        setActiveTab('before');
      } catch (err) {
        console.error('PDF Load Error:', err);
        setError('Failed to load PDF file.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const splitPDF = async () => {
    if (!pdfFile) return;
    
    if (fromPage < 1 || toPage > pdfFile.pageCount || fromPage > toPage) {
      setError('Invalid page range.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const pdf = await PDFDocument.load(pdfFile.data);
      const newPdf = await PDFDocument.create();
      
      const pageIndices = [];
      for (let i = fromPage - 1; i < toPage; i++) {
        pageIndices.push(i);
      }
      
      const copiedPages = await newPdf.copyPages(pdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      setSplitPdfData(pdfBytes);
      setActiveTab('after');
    } catch (err) {
      console.error('PDF Split Error:', err);
      setError('An error occurred while splitting the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (!splitPdfData) return;
    const blob = new Blob([splitPdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `split_${pdfFile?.file.name || 'document'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setPdfFile(null);
    setSplitPdfData(null);
    setError(null);
    setActiveTab('before');
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
              Original PDF
            </button>
            <button
              onClick={() => setActiveTab('after')}
              disabled={!splitPdfData}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'after' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700",
                !splitPdfData && "opacity-50 cursor-not-allowed"
              )}
            >
              Extracted Pages
            </button>
          </div>

          <div className="flex-1">
            {activeTab === 'before' ? (
              !pdfFile ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-96 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <Upload className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload PDF to split</h3>
                  <p className="mt-2 text-sm text-gray-500">Drag and drop or click to browse</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="application/pdf" 
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{pdfFile.file.name}</h3>
                        <p className="text-xs text-gray-500">{formatBytes(pdfFile.file.size)} • {pdfFile.pageCount} pages</p>
                      </div>
                    </div>
                    <button 
                      onClick={reset}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Change File
                    </button>
                  </div>
                  
                  <PDFPreview data={pdfFile.data} className="h-full min-h-[400px]" />
                </div>
              )
            ) : (
              <PDFPreview data={splitPdfData} className="h-full min-h-[500px]" />
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Settings */}
      <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30">
        <div className="flex items-center gap-2 mb-6">
          <Scissors className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white">Split Options</h3>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">From Page</label>
              <input 
                type="number" 
                min="1" 
                max={pdfFile?.pageCount || 1}
                value={fromPage}
                onChange={(e) => setFromPage(Number(e.target.value))}
                className="w-full rounded-xl border-gray-200 bg-white p-3 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">To Page</label>
              <input 
                type="number" 
                min={fromPage} 
                max={pdfFile?.pageCount || 1}
                value={toPage}
                onChange={(e) => setToPage(Number(e.target.value))}
                className="w-full rounded-xl border-gray-200 bg-white p-3 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              disabled={!pdfFile || isProcessing}
              onClick={splitPDF}
              className={cn(
                "w-full rounded-xl py-4 font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2",
                !pdfFile || isProcessing 
                  ? "bg-gray-300 cursor-not-allowed dark:bg-gray-700" 
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
              )}
            >
              {isProcessing ? (
                <>
                  <RefreshCcw className="h-5 w-5 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Scissors className="h-5 w-5" />
                  Extract Pages
                </>
              )}
            </button>

            {splitPdfData && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={downloadPDF}
                className="mt-4 w-full rounded-xl bg-green-600 py-4 font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Download Extracted PDF
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
