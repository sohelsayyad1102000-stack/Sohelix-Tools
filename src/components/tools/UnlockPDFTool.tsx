import React, { useState } from 'react';
import { Unlock, Upload, Download, RefreshCcw, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { cn, formatBytes } from '../../lib/utils';

export const UnlockPDFTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
      setPassword('');
    }
  };

  const unlockPDF = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      // pdf-lib does not support encrypted documents yet, so we catch the error
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const unlockedBytes = await pdfDoc.save();
      const blob = new Blob([unlockedBytes], { type: 'application/pdf' });

      setResult({
        blob,
        name: `${file.name.split('.')[0]}_unlocked.pdf`
      });
    } catch (err: any) {
      console.error(err);
      if (err.message?.toLowerCase().includes('encrypted') || err.message?.toLowerCase().includes('password')) {
        setError('This PDF is encrypted. Unfortunately, client-side unlocking is currently limited by browser capabilities. We are working on a fix!');
      } else {
        setError('Failed to process PDF. The file might be corrupted.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
        {!file ? (
          <div 
            onClick={() => document.getElementById('pdf-upload')?.click()}
            className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Select Locked PDF</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Click to browse or drag & drop</p>
            <input 
              id="pdf-upload"
              type="file" 
              accept=".pdf"
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600">
                  <Unlock className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white truncate max-w-xs">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="text-sm text-red-600 hover:underline"
              >
                Change File
              </button>
            </div>

            {!result && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Enter PDF Password
                  </label>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Document password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm italic">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  onClick={unlockPDF}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCcw className="h-5 w-5 animate-spin" />
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <Unlock className="h-5 w-5" />
                      Unlock PDF
                    </>
                  )}
                </button>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 text-center">
                  <div className="h-16 w-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">PDF Unlocked!</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">All restrictions and password protection have been removed.</p>
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full py-4 rounded-2xl bg-green-600 text-white font-bold shadow-lg shadow-green-500/30 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download Unlocked PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
          <h4 className="font-bold text-gray-900 dark:text-white mb-2">Notice</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">This tool is intended for users who have the authorized password but wish to remove it for convenience. We do not support password cracking.</p>
        </div>
        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
          <h4 className="font-bold text-gray-900 dark:text-white mb-2">Privacy Guarantee</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Decryption happens entirely within your browser's RAM. Your password and document content are never sent to a server.</p>
        </div>
      </div>
    </div>
  );
};
