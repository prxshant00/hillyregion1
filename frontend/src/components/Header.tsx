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
  Download,
  Menu,
  X,
  Bot
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
  onOpenAgentTriage: () => void;
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
  onOpenShortcuts,
  onOpenAgentTriage
}) => {
  const { t, i18n } = useTranslation();
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

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

  const handleMobileAction = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      role="banner"
      className="border-b border-[#2d3744] bg-[#161b22] sticky top-0 z-50 px-3 sm:px-4 py-2 shadow-md transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Tactical Emblem */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-[#212934] border border-[#2d3744] flex items-center justify-center text-[#0284c7] flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-[#0284c7]" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-bold text-base sm:text-lg tracking-tight text-[#e6edf3] flex items-center gap-2">
                {t('app_title')}
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#212934] text-slate-300 border border-[#2d3744]">
                  NDRF • HP CORRIDOR
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs md:max-w-md font-sans">
              {t('app_subtitle')}
            </p>
          </div>
        </div>

        {/* Desktop Action Clusters (Visible on lg+ screens) */}
        <div className="hidden lg:flex items-center gap-2" role="toolbar" aria-label="System Actions and Operations">
          {/* CLUSTER 1: Streams & Hydrology */}
          <div className="flex items-center space-x-1 bg-[#1c232d] border border-[#2d3744] p-1 rounded">
            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-1.5 bg-[#212934] hover:bg-[#2d3744] border border-[#2d3744] px-2.5 py-1 rounded text-xs font-mono text-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px]"
              aria-label="Quick Ward Search (Shortcut Ctrl+K)"
              title="Search Wards & Basins (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#0284c7]" aria-hidden="true" />
              <span className="font-sans">Search</span>
              <kbd className="text-[9px] px-1 py-0.2 rounded bg-[#161b22] border border-[#2d3744] text-slate-400">Ctrl+K</kbd>
            </button>

            <button
              onClick={onOpenSensors}
              className="flex items-center space-x-1.5 bg-[#212934] hover:bg-[#2d3744] border border-[#2d3744] px-2.5 py-1 rounded text-xs font-mono text-[#0284c7] transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px]"
              title="Inspect LoRaWAN Ultrasonic River Gauges"
              aria-label={`Open IoT Sensors Modal, ${activeSensorsCount} Nodes Active`}
            >
              <Radio className="w-3.5 h-3.5 text-[#0284c7]" aria-hidden="true" />
              <span>{activeSensorsCount} IoT</span>
            </button>

            <button
              onClick={onOpenRiverCascade}
              className="flex items-center space-x-1.5 bg-[#212934] hover:bg-[#2d3744] border border-[#2d3744] text-slate-200 px-2.5 py-1 rounded text-xs font-mono transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px]"
              title="Inspect Upstream-to-Downstream River Routing"
              aria-label="Open River Cascade Routing Modal"
            >
              <Waves className="w-3.5 h-3.5 text-[#0284c7]" aria-hidden="true" />
              <span>Cascades</span>
            </button>

            <button
              onClick={onOpenCAP}
              className="flex items-center space-x-1.5 bg-[#212934] hover:bg-[#2d3744] border border-[#2d3744] text-[#b45309] px-2.5 py-1 rounded text-xs font-mono transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px]"
              title="Open NDMA CAP-India OASIS XML Feed"
              aria-label="Open Common Alerting Protocol Modal"
            >
              <Rss className="w-3.5 h-3.5 text-[#b45309]" aria-hidden="true" />
              <span>CAP Feed</span>
            </button>
          </div>

          {/* CLUSTER 2: Operations & Reporting */}
          <div className="flex items-center space-x-1 bg-[#1c232d] border border-[#2d3744] p-1 rounded">
            <button
              onClick={onOpenSitRep}
              className="flex items-center space-x-1.5 bg-[#212934] hover:bg-[#2d3744] text-slate-200 border border-[#2d3744] px-2.5 py-1 rounded text-xs font-mono transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px]"
              aria-label="Generate Official Situation Report SITREP (Shortcut Alt+S)"
              title="Official NDRF Situation Report (Alt+S)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
              <span>SITREP</span>
            </button>

            <button
              onClick={onOpenExport}
              className="flex items-center space-x-1.5 bg-[#212934] hover:bg-[#2d3744] text-slate-200 border border-[#2d3744] px-2.5 py-1 rounded text-xs font-mono transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px]"
              title="Export Spatial GeoJSON, Tabular CSV, and NDMA CAP XML"
              aria-label="Export Data and Intelligence"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
              <span>Export</span>
            </button>

            <button
              onClick={onOpenAgentTriage}
              className="flex items-center space-x-1.5 bg-[#212934] hover:bg-[#2d3744] text-[#0284c7] border border-[#0284c7]/40 px-2.5 py-1 rounded text-xs font-mono transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px] shadow-sm"
              title="Open Autonomous Multi-Agent Triage Pipeline (HITL Safety Gate)"
              aria-label="Open Autonomous AI Agents Triage Modal"
            >
              <Bot className="w-3.5 h-3.5 text-[#0284c7]" aria-hidden="true" />
              <span>AI Triage</span>
            </button>

            <button
              onClick={onOpenAlertsAudit}
              className="p-1.5 rounded bg-[#212934] hover:bg-[#2d3744] text-slate-200 border border-[#2d3744] transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px]"
              aria-label="Open Alert Dispatch History Log"
              title="Verifiable SMS Dispatch Audit Log"
            >
              <Send className="w-3.5 h-3.5 text-[#dc2626]" aria-hidden="true" />
            </button>

            <button
              onClick={onOpenValidation}
              className="p-1.5 rounded bg-[#212934] hover:bg-[#2d3744] text-slate-200 border border-[#2d3744] transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px]"
              aria-label="Open 2025 Ground Truth Validation Events"
              title="2025 Ground Truth Holdout Verification"
            >
              <Activity className="w-3.5 h-3.5 text-[#b45309]" aria-hidden="true" />
            </button>

            <button
              onClick={onOpenModelCard}
              className="p-1.5 rounded bg-[#212934] hover:bg-[#2d3744] text-slate-200 border border-[#2d3744] transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px]"
              aria-label="View AI/ML Physics Model Card"
              title="View AI/ML Model Card & Benchmark Transparency"
            >
              <FileText className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
            </button>
          </div>

          {/* CLUSTER 3: Accessibility & Utility Controls */}
          <div className="flex items-center space-x-1 bg-[#1c232d] border border-[#2d3744] p-1 rounded">
            <button
              onClick={handleToggleAudio}
              className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px] flex items-center space-x-1.5 ${
                audioEnabled
                  ? 'bg-[#b45309] border-[#b45309] text-white'
                  : 'bg-[#212934] hover:bg-[#2d3744] border-[#2d3744] text-slate-400 hover:text-white'
              }`}
              title={audioEnabled ? "Audio Siren & Voice Active (Alt+V)" : "Enable Audio Siren & Voice (Alt+V)"}
              aria-label={audioEnabled ? "Disable Audio Siren and Voice Broadcast" : "Enable Audio Siren and Voice Broadcast"}
              aria-pressed={audioEnabled}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-white" aria-hidden="true" /> : <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>{audioEnabled ? 'Audio Active' : 'Mute'}</span>
            </button>

            <button
              onClick={onToggleHighContrast}
              className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px] flex items-center space-x-1 ${
                isHighContrast
                  ? 'bg-white text-black font-bold border-white'
                  : 'bg-[#212934] hover:bg-[#2d3744] text-slate-300 border-[#2d3744]'
              }`}
              title="Toggle High-Contrast Sunlight / Low-Vision Mode (Alt+C)"
              aria-label={isHighContrast ? "Disable High-Contrast Mode" : "Enable High-Contrast Sunlight Mode"}
              aria-pressed={isHighContrast}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden xl:inline">{isHighContrast ? 'Contrast ON' : 'Contrast'}</span>
            </button>

            <button
              onClick={onCycleTextScale}
              className="px-2.5 py-1 rounded text-xs font-mono bg-[#212934] hover:bg-[#2d3744] text-slate-200 border border-[#2d3744] transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px] flex items-center space-x-1"
              title={`Cycle Text Scaling: Standard -> Large -> X-Large (Alt+T). Currently ${textScale.toUpperCase()}`}
              aria-label={`Cycle Text Scaling. Current size is ${textScale}.`}
            >
              <Type className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span className="font-bold">{textScale === 'normal' ? '100%' : textScale === 'large' ? '115%' : '130%'}</span>
            </button>

            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded text-xs font-mono bg-[#212934] hover:bg-[#2d3744] text-slate-200 border border-[#2d3744] transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px] flex items-center space-x-1"
              aria-label={`Change language, currently ${i18n.language === 'en' ? 'English' : 'Hindi'}`}
              title="Toggle English / हिन्दी"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span className="font-bold">{i18n.language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            <button
              onClick={onOpenShortcuts}
              className="p-1.5 rounded bg-[#212934] hover:bg-[#2d3744] text-slate-300 border border-[#2d3744] transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[32px]"
              title="Keyboard Shortcuts & Accessibility Guide (Press ?)"
              aria-label="Open Keyboard Shortcuts and Accessibility Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mobile Action Controls (< lg screens) */}
        <div className="flex lg:hidden items-center space-x-1.5">
          <button
            onClick={onOpenSearch}
            className="p-2 rounded bg-[#212934] border border-[#2d3744] text-[#0284c7] min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7]"
            aria-label="Quick Search Wards (Ctrl+K)"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            onClick={handleToggleAudio}
            className={`p-2 rounded border min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] ${
              audioEnabled
                ? 'bg-[#b45309] border-[#b45309] text-white'
                : 'bg-[#212934] border-[#2d3744] text-slate-400'
            }`}
            aria-label={audioEnabled ? "Disable Audio Siren" : "Enable Audio Siren"}
            aria-pressed={audioEnabled}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-white" aria-hidden="true" /> : <VolumeX className="w-4 h-4" aria-hidden="true" />}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-[#212934] hover:bg-[#2d3744] border border-[#2d3744] text-[#e6edf3] min-h-[40px] text-xs font-mono font-bold transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7]"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle Operations and Features Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-[#dc2626]" aria-hidden="true" /> : <Menu className="w-4 h-4 text-slate-300" aria-hidden="true" />}
            <span className="text-xs uppercase">{isMobileMenuOpen ? 'Close' : 'Ops'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Operations Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 pt-2 border-t border-[#2d3744] space-y-2.5 animate-fadeIn">
          {/* Section 1: Hydrology & Real-time Streams */}
          <div>
            <p className="text-[10px] font-mono uppercase text-slate-400 mb-1 px-1">
              Live Hydrology & Streams
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleMobileAction(onOpenSensors)}
                className="flex items-center space-x-2 p-2 rounded bg-[#212934] border border-[#2d3744] text-[#0284c7] text-xs font-mono min-h-[40px] active:bg-[#2d3744]"
              >
                <Radio className="w-4 h-4 text-[#0284c7] flex-shrink-0" />
                <span className="truncate">{activeSensorsCount} IoT Nodes</span>
              </button>

              <button
                onClick={() => handleMobileAction(onOpenRiverCascade)}
                className="flex items-center space-x-2 p-2 rounded bg-[#212934] border border-[#2d3744] text-slate-200 text-xs font-mono min-h-[40px] active:bg-[#2d3744]"
              >
                <Waves className="w-4 h-4 text-[#0284c7] flex-shrink-0" />
                <span className="truncate">River Cascades</span>
              </button>

              <button
                onClick={() => handleMobileAction(onOpenCAP)}
                className="flex items-center space-x-2 p-2 rounded bg-[#212934] border border-[#2d3744] text-[#b45309] text-xs font-mono min-h-[40px] active:bg-[#2d3744] col-span-2"
              >
                <Rss className="w-4 h-4 text-[#b45309] flex-shrink-0" />
                <span>NDMA CAP-India Alert Feed</span>
              </button>
            </div>
          </div>

          {/* Section 2: Command Operations & Reporting */}
          <div>
            <p className="text-[10px] font-mono uppercase text-slate-400 mb-1 px-1">
              Operations & Reporting
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleMobileAction(onOpenSitRep)}
                className="flex items-center space-x-2 p-2 rounded bg-[#212934] border border-[#2d3744] text-slate-200 text-xs font-mono min-h-[40px] active:bg-[#2d3744]"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <span>NDRF SITREP</span>
              </button>

              <button
                onClick={() => handleMobileAction(onOpenExport)}
                className="flex items-center space-x-2 p-2 rounded bg-[#212934] border border-[#2d3744] text-slate-200 text-xs font-mono min-h-[40px] active:bg-[#2d3744]"
              >
                <Download className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <span>Open Data Export</span>
              </button>

              <button
                onClick={() => handleMobileAction(onOpenAlertsAudit)}
                className="flex items-center space-x-2 p-2 rounded bg-[#212934] border border-[#2d3744] text-slate-200 text-xs font-mono min-h-[40px] active:bg-[#2d3744]"
              >
                <Send className="w-4 h-4 text-[#dc2626] flex-shrink-0" />
                <span>Alert Audit Log</span>
              </button>

              <button
                onClick={() => handleMobileAction(onOpenAgentTriage)}
                className="flex items-center space-x-2 p-2 rounded bg-[#212934] border border-[#0284c7]/50 text-[#0284c7] text-xs font-mono min-h-[40px] active:bg-[#2d3744] col-span-2"
              >
                <Bot className="w-4 h-4 text-[#0284c7] flex-shrink-0" />
                <span>Autonomous AI Agent Triage (HITL)</span>
              </button>

              <button
                onClick={() => handleMobileAction(onOpenValidation)}
                className="flex items-center space-x-2 p-2 rounded bg-[#212934] border border-[#2d3744] text-[#b45309] text-xs font-mono min-h-[40px] active:bg-[#2d3744]"
              >
                <Activity className="w-4 h-4 text-[#b45309] flex-shrink-0" />
                <span>2025 Holdout</span>
              </button>

              <button
                onClick={() => handleMobileAction(onOpenModelCard)}
                className="flex items-center space-x-2 p-2 rounded bg-[#212934] border border-[#2d3744] text-slate-200 text-xs font-mono min-h-[40px] active:bg-[#2d3744] col-span-2"
              >
                <FileText className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <span>AI/ML Physics Model Card</span>
              </button>
            </div>
          </div>

          {/* Section 3: Accessibility & Preferences */}
          <div>
            <p className="text-[10px] font-mono uppercase text-slate-400 mb-1 px-1">
              Accessibility & Settings
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={onToggleHighContrast}
                className={`flex items-center space-x-2 p-2 rounded border text-xs font-mono min-h-[40px] transition-colors ${
                  isHighContrast
                    ? 'bg-white text-black font-bold border-white'
                    : 'bg-[#212934] border-[#2d3744] text-slate-300'
                }`}
              >
                <Eye className="w-4 h-4 flex-shrink-0" />
                <span>Contrast: {isHighContrast ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={onCycleTextScale}
                className="flex items-center space-x-2 p-2 rounded bg-[#212934] border border-[#2d3744] text-slate-300 text-xs font-mono min-h-[40px]"
              >
                <Type className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Size: {textScale === 'normal' ? '100%' : textScale === 'large' ? '115%' : '130%'}</span>
              </button>

              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 p-2 rounded bg-[#212934] border border-[#2d3744] text-slate-300 text-xs font-mono min-h-[40px]"
              >
                <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Lang: {i18n.language === 'en' ? 'हिन्दी' : 'EN'}</span>
              </button>

              <button
                onClick={() => handleMobileAction(onOpenShortcuts)}
                className="flex items-center space-x-2 p-2 rounded bg-[#212934] border border-[#2d3744] text-slate-300 text-xs font-mono min-h-[40px]"
              >
                <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Key Shortcuts</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
