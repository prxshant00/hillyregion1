import React, { useEffect, useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Radio,
  Layers
} from 'lucide-react';

interface CAPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CAPModal: React.FC<CAPModalProps> = ({ isOpen, onClose }) => {
  const [activeFormat, setActiveFormat] = useState<'xml' | 'json'>('xml');
  const [capXml, setCapXml] = useState<string>('');
  const [capJson, setCapJson] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCap = async () => {
      setLoading(true);
      try {
        const [resXml, resJson] = await Promise.all([
          fetch('/api/v1/alerts/cap.xml'),
          fetch('/api/v1/alerts/cap.json')
        ]);
        if (resXml.ok) {
          const xml = await resXml.text();
          setCapXml(xml);
        }
        if (resJson.ok) {
          const json = await resJson.json();
          setCapJson(JSON.stringify(json, null, 2));
        }
      } catch (err) {
        console.error('Failed to load CAP feeds:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCap();
  }, [isOpen]);

  const handleCopy = () => {
    const textToCopy = activeFormat === 'xml' ? capXml : capJson;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = activeFormat === 'xml' ? capXml : capJson;
    const mime = activeFormat === 'xml' ? 'application/xml' : 'application/json';
    const ext = activeFormat === 'xml' ? 'xml' : 'json';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CAP-India-Alert-${new Date().toISOString().slice(0, 10)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-tactical-surface border border-tactical-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-tactical-border flex items-center justify-between bg-tactical-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>NDMA CAP-India Emergency Alert Feed</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>OASIS CAP v1.2 COMPLIANT</span>
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Standardized machine-readable broadcast format for SACHET portal & State Emergency Operation Centres
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-tactical-border flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Format Tabs */}
          <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700">
            <button
              onClick={() => setActiveFormat('xml')}
              className={`px-3 py-1 rounded font-mono text-xs font-semibold transition-all ${
                activeFormat === 'xml'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              XML (Standard OASIS)
            </button>
            <button
              onClick={() => setActiveFormat('json')}
              className={`px-3 py-1 rounded font-mono text-xs font-semibold transition-all ${
                activeFormat === 'json'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              JSON (REST API)
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Payload!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .{activeFormat}</span>
            </button>

            <a
              href={`/api/v1/alerts/cap.${activeFormat}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center space-x-1.5 font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Endpoint</span>
            </a>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-slate-300">
          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading standardized alert payload...</div>
          ) : (
            <pre className="whitespace-pre-wrap leading-relaxed overflow-x-auto text-[11px] text-emerald-400/90 font-mono selection:bg-amber-500/30">
              {activeFormat === 'xml' ? capXml : capJson}
            </pre>
          )}
        </div>

        {/* Interoperability Info Footer */}
        <div className="p-4 border-t border-tactical-border bg-tactical-card flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Integrates with: NDMA SACHET, Himachal SEOC, CWC Flood Forecasting Network</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors"
          >
            Close Feed
          </button>
        </div>
      </div>
    </div>
  );
};
