import React, { useState, useRef, useEffect } from 'react';
import { Upload, ImageIcon, Download, Copy, Trash2, Loader2, Languages, Hash, CheckCircle2, Sparkles } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { cn } from '../../lib/utils';
import { cleanOCRText } from '../../lib/ocr-utils';
import { motion, AnimatePresence } from 'motion/react';

const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect (Try English)' },
  { code: 'mixed', name: 'Mixed Mode (English + Hindi)' },
  { code: 'eng', name: 'English' },
  { code: 'hin', name: 'Hindi' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'ita', name: 'Italian' },
  { code: 'por', name: 'Portuguese' },
  { code: 'rus', name: 'Russian' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'jpn', name: 'Japanese' },
];

export const ImageToTextOCR: React.FC<{ tool: any }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [originalResult, setOriginalResult] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [language, setLanguage] = useState('auto');
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useCleanup, setUseCleanup] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<any>(null);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setOriginalResult(null);
      setConfidence(null);
      setDetectedLang(null);
      setError(null);
    } else if (selectedFile) {
      setError('Please upload a valid image file.');
    }
  };

  const processOCR = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setDetectedLang(null);

    try {
      setStatus('Initializing OCR engine...');
      
      let langToUse = language === 'auto' ? 'eng' : (language === 'mixed' ? 'eng+hin' : language);
      
      const performOCR = async (l: string) => {
        if (workerRef.current) {
          await workerRef.current.terminate();
        }
        workerRef.current = await createWorker(l, 1, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
              setStatus(`Recognizing text (${l})...`);
            } else {
              setStatus(m.status.charAt(0).toUpperCase() + m.status.slice(1).replace(/_/g, ' '));
            }
          },
        });
        const { data } = await workerRef.current.recognize(file);
        return data;
      };

      let resultData = await performOCR(langToUse);

      // Auto-detect retry logic
      if (language === 'auto' && resultData.confidence < 60) {
        setStatus('Low confidence detected, retrying with English + Hindi...');
        const retryData = await performOCR('eng+hin');
        if (retryData.confidence > resultData.confidence) {
          resultData = retryData;
          setDetectedLang('English + Hindi (Auto)');
        } else {
          setDetectedLang('English (Auto)');
        }
      } else if (language === 'auto') {
        setDetectedLang('English (Auto)');
      } else {
        setDetectedLang(LANGUAGES.find(l => l.code === language)?.name || language);
      }

      setOriginalResult(resultData.text);
      setResult(useCleanup ? cleanOCRText(resultData.text) : resultData.text);
      setConfidence(Math.round(resultData.confidence));
    } catch (err) {
      console.error(err);
      setError('Failed to process image. Make sure the text is clear and readable.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = showOriginal ? originalResult : result;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
    }
  };

  const downloadTxt = () => {
    const textToDownload = showOriginal ? originalResult : result;
    if (textToDownload) {
      const blob = new Blob([textToDownload], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file?.name.split('.')[0]}_ocr_${useCleanup ? 'cleaned' : 'original'}.txt`;
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
                if (droppedFile?.type.startsWith('image/')) {
                  handleFileChange({ target: { files: e.dataTransfer.files } } as any);
                }
              }}
              className="group flex h-80 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 dark:bg-gray-800">
                <Upload className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Upload Image for OCR</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Drag & drop or click to browse</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Preview */}
                <div className="lg:w-1/2 space-y-4">
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                    <img src={preview!} alt="Preview" className="h-full w-full object-contain" />
                    <button 
                      onClick={() => { setFile(null); setPreview(null); setResult(null); setOriginalResult(null); }}
                      className="absolute top-4 right-4 p-2 rounded-full bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-end gap-4">
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">OCR Language</label>
                        <div className="relative">
                          <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <select 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-600 outline-none dark:text-white appearance-none"
                          >
                            {LANGUAGES.map(lang => (
                              <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {!isProcessing && !result && (
                        <button
                          onClick={processOCR}
                          className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                        >
                          Start OCR
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-6 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative inline-flex items-center">
                          <input 
                            type="checkbox" 
                            checked={useCleanup} 
                            onChange={(e) => {
                              setUseCleanup(e.target.checked);
                              if (originalResult) {
                                setResult(e.target.checked ? cleanOCRText(originalResult) : originalResult);
                              }
                            }}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Clean Text (Recommended)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Result Area */}
                <div className="lg:w-1/2 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Extracted Text</label>
                    {result && (
                      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button 
                          onClick={() => setShowOriginal(false)}
                          className={cn(
                            "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                            !showOriginal ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500"
                          )}
                        >
                          Cleaned
                        </button>
                        <button 
                          onClick={() => setShowOriginal(true)}
                          className={cn(
                            "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                            showOriginal ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500"
                          )}
                        >
                          Original
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="relative h-[400px] lg:h-full min-h-[300px]">
                    {isProcessing ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                        <div className="text-center px-6">
                          <p className="font-bold text-gray-900 dark:text-white">{status}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{progress}% completed</p>
                        </div>
                        <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    ) : result ? (
                      <div className="h-full flex flex-col">
                        <textarea 
                          value={showOriginal ? originalResult || '' : result}
                          onChange={(e) => {
                            if (showOriginal) setOriginalResult(e.target.value);
                            else setResult(e.target.value);
                          }}
                          className="flex-1 w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-600 resize-none font-sans leading-relaxed"
                          placeholder="Detected text will appear here..."
                        />
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                              <Hash className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Confidence: {confidence}%</span>
                            </div>
                            {detectedLang && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                                <Languages className="h-3.5 w-3.5 text-blue-500" />
                                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">{detectedLang}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button 
                              onClick={copyToClipboard}
                              className="flex-1 sm:flex-none p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                              title="Copy to clipboard"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={downloadTxt}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                            >
                              <Download className="h-4 w-4" />
                              <span className="text-sm">Download .txt</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/30 dark:bg-gray-800/30">
                        <Sparkles className="h-8 w-8 text-gray-200 dark:text-gray-700 mb-4" />
                        <p className="text-sm text-gray-400 dark:text-gray-500 px-8 text-center leading-relaxed">
                          The extracted text will appear here once you click "Start OCR". Features <strong>Smart Cleanup</strong> and <strong>Multi-Language</strong> support.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-red-500 rotate-180" />
                  <span className="font-medium text-sm">{error}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
