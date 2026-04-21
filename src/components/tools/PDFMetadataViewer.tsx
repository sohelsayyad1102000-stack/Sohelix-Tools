import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, Copy, Trash2, Shield, Lock, Unlock, Calendar, User, Info, FileCode } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { formatBytes, cn } from '../../lib/utils';
import { motion } from 'motion/react';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFMetadata {
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  pageCount: number;
  fileSize: number;
  pdfVersion: string;
  isEncrypted: boolean;
  metadata?: any;
}

export const PDFMetadataViewer: React.FC<{ tool: any }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PDFMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setMetadata(null);
      setError(null);
      setIsProcessing(true);

      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const info = await pdf.getMetadata();

        const formatDate = (dateStr: any) => {
          if (!dateStr) return 'N/A';
          // PDF dates often look like D:20231024120000Z
          if (typeof dateStr === 'string' && dateStr.startsWith('D:')) {
            const year = dateStr.substring(2, 6);
            const month = dateStr.substring(6, 8);
            const day = dateStr.substring(8, 10);
            return `${year}-${month}-${day}`;
          }
          return new Date(dateStr).toLocaleDateString();
        };

        setMetadata({
          title: (info.info as any)?.Title || 'None',
          author: (info.info as any)?.Author || 'None',
          creator: (info.info as any)?.Creator || 'None',
          producer: (info.info as any)?.Producer || 'None',
          creationDate: formatDate((info.info as any)?.CreationDate),
          modificationDate: formatDate((info.info as any)?.ModDate),
          pageCount: pdf.numPages,
          fileSize: selectedFile.size,
          pdfVersion: (info.info as any)?.PDFFormatVersion || 'Unknown',
          isEncrypted: (pdf as any).isEncrypted || false,
          metadata: (info.metadata as any)?.getAll?.() || {}
        });
      } catch (err) {
        console.error(err);
        setError('Failed to extract metadata. The PDF might be corrupted.');
      } finally {
        setIsProcessing(false);
      }
    } else if (selectedFile) {
      setError('Please upload a valid PDF file.');
    }
  };

  const copyAsJSON = () => {
    if (metadata) {
      navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    }
  };

  const downloadJSON = () => {
    if (metadata) {
      const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file?.name.replace('.pdf', '')}_metadata.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <div className="p-8 text-left">
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
              <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white text-center">View PDF Metadata</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">Upload PDF to see title, author, creation date, and more</p>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{file.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setFile(null); setMetadata(null); }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center gap-3 py-10">
                  <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="font-bold text-gray-700 dark:text-gray-300">Reading Metadata...</span>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400">
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {metadata && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <MetadataItem icon={Info} label="Title" value={metadata.title} />
                    <MetadataItem icon={User} label="Author" value={metadata.author} />
                    <MetadataItem icon={Settings} label="Creator" value={metadata.creator} />
                    <MetadataItem icon={Calendar} label="Created" value={metadata.creationDate} />
                    <MetadataItem icon={Calendar} label="Modified" value={metadata.modificationDate} />
                    <MetadataItem icon={FileText} label="Page Count" value={metadata.pageCount} />
                    <MetadataItem icon={FileCode} label="PDF Version" value={metadata.pdfVersion} />
                    <MetadataItem icon={metadata.isEncrypted ? Lock : Unlock} label="Security" value={metadata.isEncrypted ? 'Encrypted' : 'No Encryption'} color={metadata.isEncrypted ? 'red' : 'green'} />
                    <MetadataItem icon={Shield} label="Size" value={formatBytes(metadata.fileSize)} />
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <button 
                      onClick={copyAsJSON}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm"
                    >
                      <Copy className="h-4 w-4" />
                      Copy JSON
                    </button>
                    <button 
                      onClick={downloadJSON}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all text-sm"
                    >
                      <Download className="h-4 w-4" />
                      Download JSON
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetadataItem = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: any, color?: string }) => (
  <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 transition-all">
    <div className="flex items-center gap-2 mb-2">
      <Icon className={cn("h-4 w-4", color === 'red' ? 'text-red-500' : color === 'green' ? 'text-green-500' : 'text-blue-600')} />
      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{value || 'N/A'}</p>
  </div>
);

const Settings = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
