import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Loader2, 
  Languages, 
  CheckCircle2, 
  FileVideo, 
  ImageIcon,
  Sparkles
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import FileSaver from 'file-saver';
import { cn } from '../../lib/utils';
import { cleanOCRText } from '../../lib/ocr-utils';
import { motion } from 'motion/react';

const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect (Try English)' },
  { code: 'mixed', name: 'Mixed Mode (English + Hindi)' },
  { code: 'eng', name: 'English' },
  { code: 'hin', name: 'Hindi' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
];

export const ImageToWordTool: React.FC<{ tool: any }> = ({ tool }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [language, setLanguage] = useState('auto');
  const [useCleanup, setUseCleanup] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    const imageFiles = selectedFiles.filter(f => f.type && f.type.startsWith('image/')) as File[];
    
    if (imageFiles.length > 0) {
      setFiles(prev => [...prev, ...imageFiles]);
      setPreviews(prev => [...prev, ...imageFiles.map(f => URL.createObjectURL(f as File))]);
      setError(null);
    } else if (selectedFiles.length > 0) {
      setError('Please upload valid image files (JPG, PNG, WebP).');
    }
  };

  const processToWord = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      setStatus('Initializing converter...');
      
      const performOCR = async (l: string) => {
        const worker = await createWorker(l);
        const imagesResults: { text: string; confidence: number }[] = [];
        
        for (let i = 0; i < files.length; i++) {
          setStatus(`Processing image ${i + 1} of ${files.length}...`);
          const { data: { text, confidence } } = await worker.recognize(files[i]);
          imagesResults.push({ text, confidence });
          setProgress(Math.round(((i + 1) / files.length) * 100));
        }
        await worker.terminate();
        return imagesResults;
      };

      let langToUse = language === 'auto' ? 'eng' : (language === 'mixed' ? 'eng+hin' : language);
      let results = await performOCR(langToUse);

      // Auto-detect retry logic
      if (language === 'auto') {
        const avgConfidence = results.reduce((acc, r) => acc + r.confidence, 0) / results.length;
        if (avgConfidence < 60) {
          setStatus('Low confidence, retrying with English + Hindi...');
          results = await performOCR('eng+hin');
        }
      }

      const paragraphs: Paragraph[] = [];

      for (const res of results) {
        const textToUse = useCleanup ? cleanOCRText(res.text) : res.text;
        const lines = textToUse.split('\n');
        
        lines.forEach(line => {
          if (line.trim()) {
            paragraphs.push(
              new Paragraph({
                children: [new TextRun({ text: line.trim(), size: 24 })],
                spacing: { before: 200, after: 200 }
              })
            );
          }
        });
      }

      setStatus('Packing document...');
      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs,
        }],
      });

      const blob = await Packer.toBlob(doc);
      FileSaver.saveAs(blob, `sohelix_images_to_word.docx`);
      setStatus('Conversion complete!');
    } catch (err) {
      console.error(err);
      setError('Failed to convert images to Word. Ensure the text in the images is clear.');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <div className="p-8 text-left">
          {files.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileChange({ target: { files: e.dataTransfer.files } } as any);
              }}
              className="group flex h-80 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 dark:bg-gray-800">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Convert Images to Word (.docx)</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Drag & drop images here or click to browse</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-sans">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{files.length} Images Selected</h4>
                    <p className="text-xs text-gray-500">Ready to convert to professional docx</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none min-w-[150px]">
                        <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-600 dark:text-white appearance-none"
                        >
                            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={useCleanup} 
                          onChange={(e) => setUseCleanup(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Cleanup</span>
                      </label>
                    </div>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                        title="Add more"
                    >
                        <Upload className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={() => { setFiles([]); setPreviews([]); }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-sans"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {previews.map((preview, i) => (
                  <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 transition-all hover:ring-2 hover:ring-blue-500/50">
                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                    <button 
                      onClick={() => removeFile(i)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-700 scale-90"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {!isProcessing && (
                <button
                  onClick={processToWord}
                  className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
                >
                  <FileText className="h-5 w-5" />
                  Convert to Microsoft Word (.docx)
                </button>
              )}

              {isProcessing && (
                <div className="space-y-4 py-8">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                    <div className="text-center font-sans">
                        <p className="font-bold text-gray-900 dark:text-white">{status}</p>
                        <p className="text-sm text-gray-500 italic mt-1">This might take a few moments depending on image count and text complexity.</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-3 text-sm font-sans">
                  <CheckCircle2 className="h-4 w-4 text-red-500 rotate-180" />
                  <span className="font-medium">{error}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pro Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div className="p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
          <h4 className="font-bold text-blue-900 dark:text-blue-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Better Accuracy
          </h4>
          <p className="text-sm text-blue-800/70 dark:text-blue-400/70 leading-relaxed font-sans">
            Ensure your images have high resolution and even lighting. Blurry or dark photos may result in lower text extraction quality.
          </p>
        </div>
        <div className="p-6 rounded-3xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
          <h4 className="font-bold text-purple-900 dark:text-purple-400 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Bulk Conversion
          </h4>
          <p className="text-sm text-purple-800/70 dark:text-purple-400/70 leading-relaxed font-sans">
            You can upload multiple images at once. The tool will merge all extracted text into a single cohesive Word document.
          </p>
        </div>
      </div>
    </div>
  );
};
