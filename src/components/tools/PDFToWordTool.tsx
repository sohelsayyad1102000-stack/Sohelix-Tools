import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  FileType,
  RefreshCcw,
  Sparkles,
  Files,
  Languages
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { createWorker } from 'tesseract.js';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import FileSaver from 'file-saver';
import { cn, formatBytes } from '../../lib/utils';
import { cleanOCRText } from '../../lib/ocr-utils';
import { motion, AnimatePresence } from 'motion/react';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const OCR_LANGUAGES = [
  { code: 'auto', name: 'Auto Detect (Try English)' },
  { code: 'mixed', name: 'Mixed Mode (English + Hindi)' },
  { code: 'eng', name: 'English' },
  { code: 'hin', name: 'Hindi' },
];

interface PDFToWordToolProps {
  tool: any;
}

interface FileStatus {
  file: File;
  id: string;
  progress: number;
  status: 'idle' | 'processing' | 'ocr' | 'converting' | 'completed' | 'error';
  pages: number;
  text: string;
  error?: string;
  isScanned?: boolean;
}

export const PDFToWordTool: React.FC<PDFToWordToolProps> = ({ tool }) => {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');
  const [ocrLanguage, setOcrLanguage] = useState('auto');
  const [useCleanup, setUseCleanup] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileStatus[] = Array.from(selectedFiles)
      .filter(f => f.type === 'application/pdf')
      .map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: 'idle',
        pages: 0,
        text: '',
      }));

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const reset = () => {
    setFiles([]);
    setIsProcessing(false);
    setActiveTab('upload');
  };

  const processPDFs = async () => {
    setIsProcessing(true);
    setActiveTab('results');

    for (const fileStatus of files) {
      if (fileStatus.status === 'completed') continue;

      try {
        updateFileStatus(fileStatus.id, { status: 'processing', progress: 10 });
        
        const arrayBuffer = await fileStatus.file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        updateFileStatus(fileStatus.id, { pages: pdf.numPages });
        
        let fullText = '';
        let isScanned = false;

        // Try extracting text using PDF.js first
        let totalTextLength = 0;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          totalTextLength += pageText.trim().length;
          fullText += pageText + '\n\n';
          
          updateFileStatus(fileStatus.id, { 
            progress: Math.round(10 + (i / pdf.numPages) * 30) 
          });
        }

        // Detect if scanned PDF (very little text extracted relative to page count)
        if (totalTextLength < pdf.numPages * 20) {
          isScanned = true;
          updateFileStatus(fileStatus.id, { isScanned: true, status: 'ocr' });
          
          // Re-init fullText for OCR
          fullText = ''; 
          
          const performOCR = async (l: string) => {
            const worker = await createWorker(l);
            let ocrResults = '';
            let totalConfidence = 0;
            
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 2 });
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d')!;
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              
              await page.render({ canvasContext: context, viewport, canvas }).promise;
              const imageData = canvas.toDataURL('image/png');
              
              const { data: { text, confidence } } = await worker.recognize(imageData);
              ocrResults += text + '\n\n';
              totalConfidence += confidence;
              
              updateFileStatus(fileStatus.id, { 
                progress: Math.round(40 + (i / pdf.numPages) * 50) 
              });
            }
            await worker.terminate();
            return { text: ocrResults, avgConfidence: totalConfidence / pdf.numPages };
          };

          let langToUse = ocrLanguage === 'auto' ? 'eng' : (ocrLanguage === 'mixed' ? 'eng+hin' : ocrLanguage);
          let ocrData = await performOCR(langToUse);

          if (ocrLanguage === 'auto' && ocrData.avgConfidence < 60) {
            updateFileStatus(fileStatus.id, { progress: 40 });
            ocrData = await performOCR('eng+hin');
          }
          
          fullText = ocrData.text;
        }

        if (useCleanup) {
          fullText = cleanOCRText(fullText);
        }

        updateFileStatus(fileStatus.id, { status: 'converting', progress: 95, text: fullText });

        // Generate DOCX
        const doc = new Document({
          sections: [{
            properties: {},
            children: fullText.split('\n').map(line => {
              if (line.trim().length === 0) return new Paragraph({ children: [] });
              return new Paragraph({
                children: [new TextRun(line)],
              });
            }),
          }],
        });

        const blob = await Packer.toBlob(doc);
        const fileName = `${fileStatus.file.name.replace('.pdf', '')}.docx`;
        // Store the blob for later or download?
        // Let's just finish and mark completed. We can download on demand or now.
        
        updateFileStatus(fileStatus.id, { status: 'completed', progress: 100 });
      } catch (err) {
        console.error(err);
        updateFileStatus(fileStatus.id, { status: 'error', error: 'Failed to process PDF' });
      }
    }
    setIsProcessing(false);
  };

  const updateFileStatus = (id: string, updates: Partial<FileStatus>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const downloadDocx = async (fileStatus: FileStatus) => {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: fileStatus.text.split('\n').map(line => {
            if (line.trim().length === 0) return new Paragraph({ children: [] });
            return new Paragraph({
              children: [new TextRun(line)],
            });
          }),
        }],
      });

      const blob = await Packer.toBlob(doc);
      FileSaver.saveAs(blob, `sohelix_${fileStatus.file.name.replace('.pdf', '')}.docx`);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadTxt = (fileStatus: FileStatus) => {
    const blob = new Blob([fileStatus.text], { type: 'text/plain' });
    FileSaver.saveAs(blob, `sohelix_${fileStatus.file.name.replace('.pdf', '')}.txt`);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 transition-all duration-300">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          <button 
            onClick={() => setActiveTab('upload')}
            className={cn(
              "flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all",
              activeTab === 'upload' ? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/20" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <Upload className="h-4 w-4" />
            Upload & Configure
          </button>
          <button 
            disabled={files.length === 0}
            onClick={() => setActiveTab('results')}
            className={cn(
              "flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all",
              activeTab === 'results' ? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/20" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            Conversion Results
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'upload' ? (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {!isProcessing && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileSelect(e.dataTransfer.files);
                    }}
                    className="group flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 dark:bg-gray-800">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Batch Upload PDFs</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Drag & drop multiple PDFs or click to browse</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" multiple onChange={(e) => handleFileSelect(e.target.files)} />
                  </div>
                )}

                {files.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Files className="h-5 w-5 text-blue-600" />
                        Selected Files ({files.length})
                      </h4>
                      {!isProcessing && (
                        <button onClick={reset} className="text-xs text-red-500 hover:underline font-medium">Remove All</button>
                      )}
                    </div>

                    {!isProcessing && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">OCR Language (For Scanned PDFs)</label>
                          <div className="relative">
                            <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select 
                              value={ocrLanguage}
                              onChange={(e) => setOcrLanguage(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-600 outline-none dark:text-white appearance-none"
                            >
                              {OCR_LANGUAGES.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex items-end pb-1 px-2">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative inline-flex items-center">
                              <input 
                                type="checkbox" 
                                checked={useCleanup} 
                                onChange={(e) => setUseCleanup(e.target.checked)}
                                className="sr-only peer" 
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Smart Cleanup</span>
                          </label>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {files.map((f) => (
                        <div key={f.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <div className="text-left overflow-hidden">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.file.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(f.file.size)}</p>
                            </div>
                          </div>
                          {!isProcessing && (
                            <button onClick={() => removeFile(f.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {!isProcessing && (
                      <button
                        onClick={processPDFs}
                        className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group"
                      >
                        <RefreshCcw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                        Start Batch Conversion
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  {files.map((f) => (
                    <div key={f.id} className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center",
                            f.status === 'completed' ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                          )}>
                            {f.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : f.status === 'error' ? (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                            )}
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{f.file.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {f.status.replace('-', ' ')} {f.status !== 'idle' && f.status !== 'completed' && f.status !== 'error' && `(${f.progress}%)`}
                              {f.isScanned && <span className="ml-2 text-amber-600 font-bold flex items-center gap-1 inline-flex"><Sparkles className="h-3 w-3" /> Scanned PDF Detected</span>}
                            </p>
                          </div>
                        </div>

                        {f.status === 'completed' && (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button 
                              onClick={() => copyText(f.text)}
                              className="flex-1 sm:flex-none p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all tooltip"
                              title="Copy Text"
                            >
                              <Copy className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => downloadTxt(f)}
                              className="flex-1 sm:flex-none p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                              title="Download TXT"
                            >
                              <FileType className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => downloadDocx(f)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all text-sm"
                            >
                              <Download className="h-4 w-4" />
                              DOCX
                            </button>
                          </div>
                        )}
                        
                        {f.status === 'error' && (
                          <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
                            <AlertCircle className="h-4 w-4" />
                            {f.error}
                          </div>
                        )}
                      </div>

                      {f.status !== 'completed' && f.status !== 'error' && f.status !== 'idle' && (
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-300" 
                            style={{ width: `${f.progress}%` }}
                          />
                        </div>
                      )}

                      {f.status === 'completed' && (
                        <div className="mt-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                          <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            PREVIEW EXTRACTED CONTENT
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 text-left">
                            {f.text}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!isProcessing && (
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="w-full py-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Convert More Files
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-4 py-4 px-6 rounded-2xl bg-green-50/50 dark:bg-green-900/10 border border-green-100/50 dark:border-green-900/20">
        <div className="flex -space-x-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <img src={`https://picsum.photos/seed/user${i}/32/32`} alt="User" referrerPolicy="no-referrer" />
            </div>
          ))}
        </div>
        <p className="text-sm text-green-800 dark:text-green-400 font-medium">
          <strong>100% Secure:</strong> Files are processed locally in your browser. Nothing is ever uploaded to our servers.
        </p>
      </div>
    </div>
  );
};
