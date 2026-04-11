import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling, {
  DrawType,
  TypeNumber,
  Mode,
  ErrorCorrectionLevel,
  DotType,
  CornerSquareType,
  CornerDotType,
  Options
} from 'qr-code-styling';
import { 
  QrCode, 
  Download, 
  Settings2, 
  Link as LinkIcon, 
  Type, 
  Mail, 
  Phone, 
  Wifi, 
  MessageSquare, 
  MapPin,
  Upload,
  Trash2,
  History,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface QRCodeGeneratorProps {
  tool: any;
}

type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'sms' | 'whatsapp' | 'location';

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ tool }) => {
  const [type, setType] = useState<QRType>('url');
  const [data, setData] = useState('');
  const [qrOptions, setQrOptions] = useState<Options>({
    width: 300,
    height: 300,
    type: 'svg' as DrawType,
    data: '',
    image: '',
    margin: 10,
    qrOptions: {
      typeNumber: 0 as TypeNumber,
      mode: 'Byte' as Mode,
      errorCorrectionLevel: 'Q' as ErrorCorrectionLevel
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 10,
      crossOrigin: 'anonymous',
    },
    dotsOptions: {
      color: '#2563eb',
      type: 'rounded' as DotType
    },
    backgroundOptions: {
      color: '#ffffff',
    },
    cornersSquareOptions: {
      color: '#2563eb',
      type: 'extra-rounded' as CornerSquareType,
    },
    cornersDotOptions: {
      color: '#2563eb',
      type: 'dot' as CornerDotType,
    }
  });

  const [logo, setLogo] = useState<string | null>(null);
  const [isBulk, setIsBulk] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [recentQRs, setRecentQRs] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    qrCode.current = new QRCodeStyling(qrOptions);
    if (qrRef.current) {
      qrCode.current.append(qrRef.current);
    }
    
    // Load recent QRs
    const saved = localStorage.getItem('recent_qrs');
    if (saved) setRecentQRs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({
        ...qrOptions,
        data: data || 'https://sohelix.com'
      });
    }
  }, [qrOptions, data]);

  const handleTypeChange = (newType: QRType) => {
    setType(newType);
    setData('');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoUrl = event.target?.result as string;
        setLogo(logoUrl);
        setQrOptions(prev => ({ ...prev, image: logoUrl }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setQrOptions(prev => ({ ...prev, image: '' }));
  };

  const downloadQR = (ext: 'png' | 'svg' | 'jpg') => {
    if (qrCode.current) {
      qrCode.current.download({ name: 'sohelix_qr', extension: ext });
      
      // Save to recent
      const newRecent = [{
        id: Date.now(),
        type,
        data,
        timestamp: new Date().toISOString()
      }, ...recentQRs].slice(0, 10);
      
      setRecentQRs(newRecent);
      localStorage.setItem('recent_qrs', JSON.stringify(newRecent));
    }
  };

  const renderInput = () => {
    switch (type) {
      case 'url':
        return (
          <input
            type="url"
            placeholder="https://example.com"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full rounded-xl border-gray-200 bg-white p-4 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        );
      case 'text':
        return (
          <textarea
            placeholder="Enter your text here..."
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full h-32 rounded-xl border-gray-200 bg-white p-4 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        );
      case 'email':
        return (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              onChange={(e) => setData(`mailto:${e.target.value}`)}
              className="w-full rounded-xl border-gray-200 bg-white p-4 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        );
      case 'phone':
        return (
          <input
            type="tel"
            placeholder="+1 234 567 890"
            onChange={(e) => setData(`tel:${e.target.value}`)}
            className="w-full rounded-xl border-gray-200 bg-white p-4 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        );
      case 'wifi':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Network Name (SSID)"
              id="ssid"
              className="w-full rounded-xl border-gray-200 bg-white p-4 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="password"
              placeholder="Password"
              id="password"
              className="w-full rounded-xl border-gray-200 bg-white p-4 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button 
              onClick={() => {
                const ssid = (document.getElementById('ssid') as HTMLInputElement).value;
                const pass = (document.getElementById('password') as HTMLInputElement).value;
                setData(`WIFI:S:${ssid};T:WPA;P:${pass};;`);
              }}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Generate WiFi QR
            </button>
          </div>
        );
      default:
        return (
          <input
            type="text"
            placeholder="Enter data..."
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full rounded-xl border-gray-200 bg-white p-4 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
      {/* Main Area */}
      <div className="col-span-2 p-8 border-r border-gray-100 dark:border-gray-800">
        <div className="flex flex-col h-full space-y-8">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'url', icon: LinkIcon, label: 'URL' },
              { id: 'text', icon: Type, label: 'Text' },
              { id: 'email', icon: Mail, label: 'Email' },
              { id: 'phone', icon: Phone, label: 'Phone' },
              { id: 'wifi', icon: Wifi, label: 'WiFi' },
              { id: 'sms', icon: MessageSquare, label: 'SMS' },
              { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp' },
              { id: 'location', icon: MapPin, label: 'Location' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTypeChange(tab.id as QRType)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                  type === tab.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                {type} Information
              </h3>
              <button 
                onClick={() => setIsBulk(!isBulk)}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                {isBulk ? 'Single Mode' : 'Bulk Mode'}
              </button>
            </div>

            {isBulk ? (
              <div className="space-y-4">
                <textarea
                  placeholder="Paste multiple URLs (one per line)..."
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  className="w-full h-48 rounded-xl border-gray-200 bg-white p-4 text-sm focus:ring-2 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <p className="text-xs text-gray-500">Each line will generate a separate QR code in a ZIP file.</p>
              </div>
            ) : (
              renderInput()
            )}
          </div>

          {/* Preview Area */}
          <div className="flex flex-col items-center justify-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div ref={qrRef} className="bg-white p-4 rounded-2xl shadow-xl" />
            <p className="mt-4 text-sm text-gray-500">Live Preview</p>
          </div>
        </div>
      </div>

      {/* Sidebar Settings */}
      <div className="bg-gray-50/50 p-8 dark:bg-gray-800/30 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white">Style Options</h3>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          {/* Colors */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Dots Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={qrOptions.dotsOptions?.color}
                  onChange={(e) => setQrOptions(prev => ({ 
                    ...prev, 
                    dotsOptions: { ...prev.dotsOptions, color: e.target.value },
                    cornersSquareOptions: { ...prev.cornersSquareOptions, color: e.target.value },
                    cornersDotOptions: { ...prev.cornersDotOptions, color: e.target.value }
                  }))}
                  className="h-10 w-10 rounded-lg cursor-pointer border-none bg-transparent"
                />
                <input 
                  type="text" 
                  value={qrOptions.dotsOptions?.color}
                  onChange={(e) => setQrOptions(prev => ({ ...prev, dotsOptions: { ...prev.dotsOptions, color: e.target.value } }))}
                  className="flex-1 rounded-lg border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Background</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={qrOptions.backgroundOptions?.color}
                  onChange={(e) => setQrOptions(prev => ({ ...prev, backgroundOptions: { ...prev.backgroundOptions, color: e.target.value } }))}
                  className="h-10 w-10 rounded-lg cursor-pointer border-none bg-transparent"
                />
                <button 
                  onClick={() => setQrOptions(prev => ({ ...prev, backgroundOptions: { color: 'transparent' } }))}
                  className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  Transparent
                </button>
              </div>
            </div>
          </div>

          {/* Styles */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Dot Style</label>
              <select 
                value={qrOptions.dotsOptions?.type}
                onChange={(e) => setQrOptions(prev => ({ ...prev, dotsOptions: { ...prev.dotsOptions, type: e.target.value as DotType } }))}
                className="w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="square">Square</option>
                <option value="dots">Dots</option>
                <option value="rounded">Rounded</option>
                <option value="extra-rounded">Extra Rounded</option>
                <option value="classy">Classy</option>
                <option value="classy-rounded">Classy Rounded</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Corner Style</label>
              <select 
                value={qrOptions.cornersSquareOptions?.type}
                onChange={(e) => setQrOptions(prev => ({ ...prev, cornersSquareOptions: { ...prev.cornersSquareOptions, type: e.target.value as CornerSquareType } }))}
                className="w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="square">Square</option>
                <option value="dot">Dot</option>
                <option value="extra-rounded">Extra Rounded</option>
              </select>
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Logo (Optional)</label>
            {logo ? (
              <div className="relative inline-block">
                <img src={logo} alt="Logo" className="h-20 w-20 rounded-xl object-contain border border-gray-200 dark:border-gray-700" />
                <button 
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow-lg"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => document.getElementById('logo-upload')?.click()}
                className="flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800"
              >
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="mt-1 text-[10px] text-gray-500">Upload Logo</span>
                <input 
                  type="file" 
                  id="logo-upload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleLogoUpload}
                />
              </div>
            )}
          </div>

          {/* Size */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">QR Size: {qrOptions.width}px</label>
            <input 
              type="range" 
              min="200" 
              max="1000" 
              step="50" 
              value={qrOptions.width}
              onChange={(e) => setQrOptions(prev => ({ ...prev, width: Number(e.target.value), height: Number(e.target.value) }))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => downloadQR('png')}
              className="rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700"
            >
              PNG
            </button>
            <button
              onClick={() => downloadQR('svg')}
              className="rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700"
            >
              SVG
            </button>
            <button
              onClick={() => downloadQR('jpg')}
              className="rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700"
            >
              JPG
            </button>
          </div>

          {recentQRs.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3 text-gray-500">
                <History className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Recent</span>
              </div>
              <div className="space-y-2">
                {recentQRs.map((qr) => (
                  <div key={qr.id} className="flex items-center justify-between rounded-lg bg-white p-2 text-xs border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <span className="truncate max-w-[150px]">{qr.data}</span>
                    <button 
                      onClick={() => setData(qr.data)}
                      className="text-blue-600 hover:underline"
                    >
                      Reuse
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
