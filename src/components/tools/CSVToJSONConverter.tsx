import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { 
  FileJson, 
  RefreshCcw, 
  Copy, 
  CheckCircle2, 
  Download, 
  Upload,
  Trash2,
  Table as TableIcon,
  Code,
  AlertCircle
} from 'lucide-react';
import { cn, formatBytes } from '../../lib/utils';
import { motion } from 'motion/react';

export const CSVToJSONConverter: React.FC = () => {
  const [csvData, setCsvData] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'json' | 'table'>('json');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConvert = (input: string) => {
    setCsvData(input);
    if (!input.trim()) {
      setJsonData('');
      setParsedData([]);
      setError(null);
      return;
    }

    Papa.parse(input, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error at line ${results.errors[0].row}: ${results.errors[0].message}`);
          setJsonData('');
          setParsedData([]);
        } else {
          setJsonData(JSON.stringify(results.data, null, 2));
          setParsedData(results.data);
          setError(null);
        }
      },
      error: (err) => {
        setError(err.message);
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleConvert(text);
    };
    reader.readAsText(file);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJSON = () => {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tryExample = () => {
    const example = `id,name,email,role
1,John Doe,john@example.com,Admin
2,Jane Smith,jane@example.com,User
3,Bob Johnson,bob@example.com,Editor`;
    handleConvert(example);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              CSV Input
            </h3>
            <div className="flex gap-4">
              <button 
                onClick={tryExample}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Try Example
              </button>
              <button 
                onClick={() => handleConvert('')}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div 
            className="relative group"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => handleConvert(ev.target?.result as string);
                reader.readAsText(file);
              }
            }}
          >
            <textarea 
              value={csvData}
              onChange={(e) => handleConvert(e.target.value)}
              placeholder="Paste your CSV here or drag and drop a file..."
              rows={15}
              className="block w-full rounded-3xl border-gray-200 bg-white px-6 py-6 text-sm font-mono focus:border-blue-500 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 shadow-sm transition-all group-hover:shadow-md"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 transition-all"
            >
              <Upload className="h-4 w-4" />
              Upload CSV
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">JSON Output</h3>
              <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                <button 
                  onClick={() => setViewMode('json')}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    viewMode === 'json' ? "bg-white shadow-sm text-blue-600 dark:bg-gray-700" : "text-gray-500"
                  )}
                >
                  <Code className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('table')}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    viewMode === 'table' ? "bg-white shadow-sm text-blue-600 dark:bg-gray-700" : "text-gray-500"
                  )}
                >
                  <TableIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                disabled={!jsonData}
                onClick={copyToClipboard}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
              >
                {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-400" />}
              </button>
              <button 
                disabled={!jsonData}
                onClick={downloadJSON}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
              >
                <Download className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="relative h-[348px] rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 overflow-hidden shadow-inner">
            {error ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Parsing Error</h4>
                <p className="text-sm text-red-600 mt-2">{error}</p>
              </div>
            ) : !jsonData ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-gray-400">
                <FileJson className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm italic">Converted JSON will appear here...</p>
              </div>
            ) : viewMode === 'json' ? (
              <pre className="h-full p-6 text-xs font-mono text-blue-600 dark:text-blue-400 overflow-auto">
                {jsonData}
              </pre>
            ) : (
              <div className="h-full overflow-auto p-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      {Object.keys(parsedData[0] || {}).map(key => (
                        <th key={key} className="px-4 py-2 border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 50).map((row, i) => (
                      <tr key={i} className="hover:bg-white dark:hover:bg-gray-900 transition-colors">
                        {Object.values(row).map((val: any, vi) => (
                          <td key={vi} className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 50 && (
                  <p className="text-center text-[10px] text-gray-400 mt-4">Showing first 50 rows only</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      {jsonData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Rows Detected</p>
            <p className="text-2xl font-black text-blue-600">{parsedData.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Columns</p>
            <p className="text-2xl font-black text-blue-600">{Object.keys(parsedData[0] || {}).length}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Output Size</p>
            <p className="text-2xl font-black text-blue-600">{formatBytes(jsonData.length)}</p>
          </div>
        </div>
      )}
    </div>
  );
};
