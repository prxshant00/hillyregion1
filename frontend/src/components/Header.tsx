import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  Activity,
  FileText,
  Globe,
  Radio,
  Search,
  Volume2,
  VolumeX,
  FileSpreadsheet,
  Send,
  Waves,
  Rss,
  Eye,
  Type,
  HelpCircle,
  Download
} from 'lucide-react';
import { alertBroadcaster } from '../utils/audioAlert';

interface HeaderProps {
  onOpenModelCard: () => void;
  onOpenValidation: () => void;
  onOpenSitRep: () => void;
  onOpenSearch: () => void;
  onOpenSensors: () => void;
  onOpenAlertsAudit: () => void;
  onOpenRiverCascade: () => void;
  onOpenCAP: () => void;
  onOpenExport: () => void;
  activeSensorsCount: number;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  textScale: 'normal' | 'large' | 'xlarge';
  onCycleTextScale: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenModelCard,
  onOpenValidation,
  onOpenSitRep,
  onOpenSearch,
  onOpenSensors,
  onOpenAlertsAudit,
  onOpenRiverCascade,
  onOpenCAP,
  onOpenExport,
  activeSensorsCount,
  isHighContrast,
  onToggleHighContrast,
  textScale,
  onCycleTextScale,
  onOpenShortcuts
}) => {
  const { t, i18n } = useTranslation();
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleToggleAudio = () => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    if (nextState) {
      alertBroadcaster.playAlertChime('warning');
      const msg = i18n.language === 'hi'
        ? 'ध्वनि चेतावनी प्रणाली सक्रिय है।'
        : 'Audio emergency alert broadcaster enabled.';
      alertBroadcaster.speakDirective(msg, i18n.language as 'en' | 'hi');
    }
  };

  return (
    <header
      role="banner"
      className="border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50 px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Brand & Emblem */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex-shrink-0">
            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
                {t('app_title')}
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm">
                  SIH26192 • NDRF
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md font-sans">
              {t('app_subtitle')}
            </p>
          </div>
        </div>

        {/* Tactical Command Action Clusters */}
        <div className="flex items-center flex-wrap gap-2.5" role="toolbar" aria-label="System Actions and Operations">
          {/* CLUSTER 1: Streams & Hydrology */}
          <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
            {/* Quick Ward Search */}
            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-200 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[34px]"
              aria-label="Quick Ward Search (Shortcut Ctrl+K)"
              title="Search Wards & Basins (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span className="hidden sm:inline font-sans">Search</span>
              <kbd className="hidden sm:inline text-[9px] px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400">Ctrl+K</kbd>
            </button>

            {/* IoT Telemetry Nodes */}
            <button
              onClick={onOpenSensors}
              className="flex items-center space-x-1.5 bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-800/80 px-2.5 py-1.5 rounded-lg text-xs font-mono text-cyan-300 transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)] focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[34px]"
              title="Inspect LoRaWAN Ultrasonic River Gauges"
              aria-label={`Open IoT Sensors Modal, ${activeSensorsCount} Nodes Active`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" aria-hidden="true" />
              <span>{activeSensorsCount} IoT</span>
            </button>

            {/* River Cascades */}
            <button
              onClick={onOpenRiverCascade}
              className="flex items-center space-x-1.5 bg-slate-800/60 hover:bg-slate-700/80 text-cyan-300 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[34px]"
              title="Inspect Upstream-to-Downstream River Routing"
              aria-label="Open River Cascade Routing Modal"
            >
              <Waves className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span className="hidden md:inline">Cascades</span>
            </button>

            {/* NDMA CAP Feed */}
            <button
              onClick={onOpenCAP}
              className="flex items-center space-x-1.5 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/70 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[34px]"
              title="Open NDMA CAP-India OASIS XML Feed"
              aria-label="Open Common Alerting Protocol Modal"
            >
              <Rss className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span className="hidden md:inline">CAP</span>
            </button>
          </div>

          {/* CLUSTER 2: Operations & Reporting */}
          <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
            {/* SITREP Situation Report */}
            <button
              onClick={onOpenSitRep}
              className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[34px]"
              aria-label="Generate Official Situation Report SITREP (Shortcut Alt+S)"
              title="Official NDRF Situation Report (Alt+S)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>SITREP</span>
            </button>

            {/* Open Data Export */}
            <button
              onClick={onOpenExport}
              className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[34px]"
              title="Export Spatial GeoJSON, Tabular CSV, and NDMA CAP XML"
              aria-label="Export Data and Intelligence"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Alert Dispatch Log */}
            <button
              onClick={onOpenAlertsAudit}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[34px]"
              aria-label="Open Alert Dispatch History Log"
              title="Verifiable SMS Dispatch Audit Log"
            >
              <Send className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
            </button>

            {/* 2025 Ground Truth */}
            <button
              onClick={onOpenValidation}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-amber-400 border border-slate-700 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[34px]"
              aria-label="Open 2025 Ground Truth Validation Events"
              title="2025 Ground Truth Holdout Verification"
            >
              <Activity className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            {/* Model Card */}
            <button
              onClick={onOpenModelCard}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-cyan-300 border border-slate-700 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[34px]"
              aria-label="View AI/ML Physics Model Card"
              title="View AI/ML Model Card & Benchmark Transparency"
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* CLUSTER 3: Accessibility & Utility Controls */}
          <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
            {/* Audio Siren / Voice Directive Toggle */}
            <button
              onClick={handleToggleAudio}
              className={`p-2 rounded-lg border transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[34px] ${
                audioEnabled
                  ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_12px_#f59e0b]'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={audioEnabled ? "Audio Siren & Voice Active (Alt+V)" : "Enable Audio Siren & Voice (Alt+V)"}
              aria-label={audioEnabled ? "Disable Audio Siren and Voice Broadcast" : "Enable Audio Siren and Voice Broadcast"}
              aria-pressed={audioEnabled}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" aria-hidden="true" /> : <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>

            {/* High Contrast Mode Toggle */}
            <button
              onClick={onToggleHighContrast}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[34px] flex items-center space-x-1 ${
                isHighContrast
                  ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Toggle High-Contrast Sunlight / Low-Vision Mode (Alt+C)"
              aria-label={isHighContrast ? "Disable High-Contrast Mode" : "Enable High-Contrast Sunlight Mode"}
              aria-pressed={isHighContrast}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden xl:inline">{isHighContrast ? 'Contrast ON' : 'Contrast'}</span>
            </button>

            {/* Font Size Scaling */}
            <button
              onClick={onCycleTextScale}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[34px] flex items-center space-x-1"
              title={`Cycle Text Scaling: Standard -> Large -> X-Large (Alt+T). Currently ${textScale.toUpperCase()}`}
              aria-label={`Cycle Text Scaling. Current size is ${textScale}.`}
            >
              <Type className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span className="font-bold">{textScale === 'normal' ? '100%' : textScale === 'large' ? '115%' : '130%'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[34px] flex items-center space-x-1"
              aria-label={`Change language, currently ${i18n.language === 'en' ? 'English' : 'Hindi'}`}
              title="Toggle English / हिन्दी"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span className="font-bold">{i18n.language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Keyboard Shortcuts Guide */}
            <button
              onClick={onOpenShortcuts}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[34px]"
              title="Keyboard Shortcuts & Accessibility Guide (Press ?)"
              aria-label="Open Keyboard Shortcuts and Accessibility Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
