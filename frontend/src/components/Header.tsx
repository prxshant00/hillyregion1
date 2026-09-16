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
  Rss
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
  activeSensorsCount: number;
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
  activeSensorsCount
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
      className="border-b border-tactical-border bg-tactical-surface/95 backdrop-blur-md sticky top-0 z-50 px-4 py-2.5"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-2">
                {t('app_title')}
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-700">
                  SIH26192 • NDRF
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md">
              {t('app_subtitle')}
            </p>
          </div>
        </div>

        {/* Live Telemetry & Control Actions */}
        <div className="flex items-center flex-wrap gap-2" role="toolbar" aria-label="System Actions">
          {/* Active Sensor Nodes Trigger */}
          <button
            onClick={onOpenSensors}
            className="flex items-center space-x-1.5 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/80 px-2.5 py-1.5 rounded-lg text-xs font-mono text-cyan-300 transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)]"
            title="Open IoT Sonar & River Gauge Network"
            aria-label="Open IoT Sensors Modal"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{activeSensorsCount} IoT Nodes</span>
          </button>

          {/* Quick Ward Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 bg-tactical-bg hover:bg-slate-800 border border-tactical-border px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Quick Ward Search (Shortcut Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Search Wards</span>
            <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">Ctrl+K</kbd>
          </button>


          {/* River Cascade Routing Button */}
          <button
            onClick={onOpenRiverCascade}
            className="flex items-center space-x-1.5 bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-800/80 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-[0_0_8px_rgba(6,182,212,0.15)]"
            title="Inspect Upstream-to-Downstream River Routing"
            aria-label="Open River Cascade Inspector"
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">River Cascades</span>
          </button>

          {/* NDMA CAP Feed Button */}
          <button
            onClick={onOpenCAP}
            className="flex items-center space-x-1.5 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/70 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            title="Open NDMA CAP-India OASIS XML Feed"
            aria-label="Open Common Alerting Protocol Modal"
          >
            <Rss className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">CAP Feed</span>
          </button>

          {/* SITREP Situation Report Button */}
          <button
            onClick={onOpenSitRep}
            className="flex items-center space-x-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            aria-label="Generate Official Situation Report SITREP"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">NDRF SITREP</span>
            <span className="lg:hidden">SITREP</span>
          </button>

          {/* Alert Dispatch Log Button */}
          <button
            onClick={onOpenAlertsAudit}
            className="flex items-center space-x-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            aria-label="Open Alert Dispatch History Log"
            title="Verifiable SMS Dispatch Audit Log"
          >
            <Send className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden xl:inline">Alert Log</span>
          </button>

          {/* Audio Warning Siren Toggle */}
          <button
            onClick={handleToggleAudio}
            className={`p-1.5 rounded-lg border transition-all ${
              audioEnabled
                ? 'bg-amber-950/80 border-amber-600 text-amber-300 shadow-[0_0_10px_#f59e0b]'
                : 'bg-tactical-bg border-tactical-border text-slate-400 hover:text-white'
            }`}
            title={audioEnabled ? "Audio Siren & Voice Broadcast Active" : "Enable Audio Siren & Voice Broadcast"}
            aria-label={audioEnabled ? "Disable Audio Siren" : "Enable Audio Siren"}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* 2025 Ground Truth Button */}
          <button
            onClick={onOpenValidation}
            className="flex items-center space-x-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">2025 Ground Truth</span>
          </button>

          {/* Model Card Button */}
          <button
            onClick={onOpenModelCard}
            className="flex items-center space-x-1.5 bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/80 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('view_model_card')}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 bg-tactical-bg hover:bg-tactical-card border border-tactical-border px-3 py-1.5 rounded-lg text-xs font-mono text-slate-200 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label={`Change language, currently ${i18n.language === 'en' ? 'English' : 'Hindi'}`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">{i18n.language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
