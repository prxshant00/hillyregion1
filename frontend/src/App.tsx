import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from './components/Header';
import { MapChoropleth } from './components/MapChoropleth';
import { WardDetailPanel } from './components/WardDetailPanel';
import { TimeSeriesChart } from './components/TimeSeriesChart';
import { ValidationEventsModal } from './components/ValidationEventsModal';
import { ModelCardModal } from './components/ModelCardModal';
import { SitRepModal } from './components/SitRepModal';
import { SearchPalette } from './components/SearchPalette';
import { SimulationSandbox } from './components/SimulationSandbox';
import { DigitalTwinControls } from './components/DigitalTwinControls';
import { IoTSensorsModal } from './components/IoTSensorsModal';
import { AlertsAuditModal } from './components/AlertsAuditModal';
import { RiverCascadeModal } from './components/RiverCascadeModal';
import { CAPModal } from './components/CAPModal';
import { ExportDataModal } from './components/ExportDataModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { alertBroadcaster } from './utils/audioAlert';
import { useLiveTelemetry } from './hooks/useLiveTelemetry';
import { DIGITAL_TWIN_STEPS, applyDigitalTwinStep } from './services/digitalTwinSimulator';
import {
  WardRisk,
  ValidationEvent,
  ModelInfo,
  TimeSeriesPoint,
  SitRepData,
  SensorNode
} from './types';
import { Filter, RefreshCw, SlidersHorizontal, Volume2, Clock, ChevronLeft } from 'lucide-react';

export const App: React.FC = () => {
  const { t } = useTranslation();

  // Core State
  const [wards, setWards] = useState<WardRisk[]>([]);
  const [baselineWards, setBaselineWards] = useState<WardRisk[]>([]);
  const [baselineSensors, setBaselineSensors] = useState<SensorNode[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedWardId, setSelectedWardId] = useState<string>('HP-MND-02'); // Default: Thunag (Seraj Basin)
  const [selectedWardDetail, setSelectedWardDetail] = useState<WardRisk | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [historyPoints, setHistoryPoints] = useState<TimeSeriesPoint[]>([]);
  const [validationEvents, setValidationEvents] = useState<ValidationEvent[]>([]);
  const [sitrep, setSitrep] = useState<SitRepData | null>(null);
  const [sensors, setSensors] = useState<SensorNode[]>([]);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);

  // Responsive Mobile Tab Controller ('all' | 'map' | 'ward' | 'hydrograph')
  const [mobileTab, setMobileTab] = useState<'all' | 'map' | 'ward' | 'hydrograph'>('all');

  // Modals & Panels State
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isModelCardOpen, setIsModelCardOpen] = useState(false);
  const [isSitRepOpen, setIsSitRepOpen] = useState(false);
  const [isSensorsOpen, setIsSensorsOpen] = useState(false);
  const [isAlertsAuditOpen, setIsAlertsAuditOpen] = useState(false);
  const [isRiverCascadeOpen, setIsRiverCascadeOpen] = useState(false);
  const [isCAPOpen, setIsCAPOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [showDigitalTwin, setShowDigitalTwin] = useState(false);
  const [twinStepIndex, setTwinStepIndex] = useState(0);
  const [isSimulatingTwin, setIsSimulatingTwin] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live SSE Telemetry Stream Hook
  const { isConnected: isSSEConnected, streamingSensors } = useLiveTelemetry(sensors);
  const activeSensors = isSimulatingTwin ? sensors : (streamingSensors.length > 0 ? streamingSensors : sensors);

  // Accessibility States
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('floodsight_high_contrast') === 'true';
  });
  const [textScale, setTextScale] = useState<'normal' | 'large' | 'xlarge'>(() => {
    return (localStorage.getItem('floodsight_text_scale') as 'normal' | 'large' | 'xlarge') || 'normal';
  });
  const [activeCaption, setActiveCaption] = useState<string | null>(null);

  // Apply High-Contrast Mode
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', isHighContrast);
    localStorage.setItem('floodsight_high_contrast', String(isHighContrast));
  }, [isHighContrast]);

  // Apply Text Scaling
  useEffect(() => {
    document.documentElement.classList.remove('text-scale-large', 'text-scale-xlarge');
    if (textScale === 'large') {
      document.documentElement.classList.add('text-scale-large');
    } else if (textScale === 'xlarge') {
      document.documentElement.classList.add('text-scale-xlarge');
    }
    localStorage.setItem('floodsight_text_scale', textScale);
  }, [textScale]);

  // Subscribe to voice alert broadcasts for Live Closed Captions
  useEffect(() => {
    const unsubscribe = alertBroadcaster.onCaptionChange((text) => {
      setActiveCaption(text);
    });
    return unsubscribe;
  }, []);

  const handleCycleTextScale = () => {
    setTextScale(prev => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xlarge';
      return 'normal';
    });
  };

  const handleToggleHighContrast = () => {
    setIsHighContrast(prev => !prev);
  };

  // Global Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsHighContrast(prev => !prev);
      } else if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleCycleTextScale();
      } else if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsSitRepOpen(prev => !prev);
      } else if (e.key === '?' && !isInput) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      } else if (!isInput && e.key >= '1' && e.key <= '4') {
        const dists = ['All', 'Mandi', 'Kullu', 'Kangra'];
        const idx = parseInt(e.key, 10) - 1;
        if (dists[idx]) {
          setSelectedDistrict(dists[idx]);
        }
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsValidationOpen(false);
        setIsModelCardOpen(false);
        setIsSitRepOpen(false);
        setIsSensorsOpen(false);
        setIsAlertsAuditOpen(false);
        setIsRiverCascadeOpen(false);
        setIsCAPOpen(false);
        setIsExportOpen(false);
        setIsShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Wards summaries
        const wardsRes = await fetch('/api/v1/risk/all');
        const wardsData = await wardsRes.json();
        setWards(wardsData);
        setBaselineWards(wardsData);

        // GeoJSON boundaries
        const geoRes = await fetch('/api/v1/wards/geojson');
        const geoData = await geoRes.json();
        setGeoJsonData(geoData);

        // Validation events
        const eventsRes = await fetch('/api/v1/events/validation');
        const eventsData = await eventsRes.json();
        setValidationEvents(eventsData);

        // SitRep
        const sitrepRes = await fetch('/api/v1/sitrep');
        if (sitrepRes.ok) {
          const sitrepData = await sitrepRes.json();
          setSitrep(sitrepData);
        }

        // Sensors Telemetry Stream
        const sensorsRes = await fetch('/api/v1/sensors');
        if (sensorsRes.ok) {
          const sensorsData = await sensorsRes.json();
          setSensors(sensorsData);
          setBaselineSensors(sensorsData);
        }

        // Model Card Info
        const modelRes = await fetch('/api/v1/model/info');
        const modelData = await modelRes.json();
        setModelInfo(modelData);
      } catch (err) {
        console.error('Failed to initialize dashboard data:', err);
      }
    };

    fetchData();
  }, []);

  // 2. Fetch Detailed Ward and Time-series on Selection
  useEffect(() => {
    if (!selectedWardId) return;

    const fetchWardDetails = async () => {
      try {
        const detailRes = await fetch(`/api/v1/risk/${selectedWardId}`);
        if (detailRes.ok) {
          const detail = await detailRes.json();
          setSelectedWardDetail(detail);
        }

        const histRes = await fetch(`/api/v1/history/${selectedWardId}?hours=48`);
        if (histRes.ok) {
          const hist = await histRes.json();
          setHistoryPoints(hist.points);
        }
      } catch (err) {
        console.error('Failed to fetch ward detail/history:', err);
      }
    };

    fetchWardDetails();
  }, [selectedWardId]);

  // Handle Manual Data Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const wardsRes = await fetch('/api/v1/risk/all');
      const wardsData = await wardsRes.json();
      setWards(wardsData);
      setBaselineWards(wardsData);

      if (selectedWardId) {
        const detailRes = await fetch(`/api/v1/risk/${selectedWardId}`);
        if (detailRes.ok) {
          const detail = await detailRes.json();
          setSelectedWardDetail(detail);
        }
      }

      const sitrepRes = await fetch('/api/v1/sitrep');
      if (sitrepRes.ok) {
        const sitrepData = await sitrepRes.json();
        setSitrep(sitrepData);
      }

      const sensorsRes = await fetch('/api/v1/sensors');
      if (sensorsRes.ok) {
        const sensorsData = await sensorsRes.json();
        setSensors(sensorsData);
        setBaselineSensors(sensorsData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 4D Digital Twin Simulation Step Change Handler
  const handleTwinStepChange = (index: number) => {
    setTwinStepIndex(index);
    setIsSimulatingTwin(true);
    const baseWards = baselineWards.length > 0 ? baselineWards : wards;
    const baseSensors = baselineSensors.length > 0 ? baselineSensors : sensors;
    const step = DIGITAL_TWIN_STEPS[index];
    const { updatedWards, updatedSensors } = applyDigitalTwinStep(baseWards, step, baseSensors);
    setWards(updatedWards);
    setSensors(updatedSensors);

    if (selectedWardId) {
      const matched = updatedWards.find(w => w.ward_id === selectedWardId);
      if (matched) setSelectedWardDetail(matched);
    }
  };

  // Reset Digital Twin to Real-time Ingestion
  const handleResetDigitalTwin = async () => {
    setIsSimulatingTwin(false);
    setTwinStepIndex(0);
    if (baselineWards.length > 0) {
      setWards(baselineWards);
    }
    if (baselineSensors.length > 0) {
      setSensors(baselineSensors);
    }
    await handleRefresh();
  };

  // Trigger Emergency Alert
  const handleTriggerAlert = async (wardId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/v1/alerts/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ward_id: wardId })
      });
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Simulate Cloudburst Surge for testing
  const handleSimulateSurge = async (wardId: string) => {
    try {
      await fetch('/api/v1/ingest/sensor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_id: `ESP32-DEMO-${wardId}`,
          ward_id: wardId,
          source: 'sensor',
          water_level_cm: 475.0,
          water_level_rate_cm_per_hr: 52.0,
          tilt_angle_deg: 8.2,
          battery_level_pct: 90.0
        })
      });
      await handleRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Apply What-If Simulation Sandbox across all wards
  const handleApplySimulation = (simRain24h: number, simRain72h: number) => {
    setWards((prevWards) =>
      prevWards.map((w) => {
        const slopeFactor = w.latitude ? 1.1 : 1.0;
        const simulatedScore = Math.min(
          100.0,
          Math.max(
            15.0,
            (simRain24h / 180.0) * 65.0 + (simRain72h / 250.0) * 35.0 * slopeFactor
          )
        );

        let alert_level: 'NORMAL' | 'ADVISORY' | 'WATCH' | 'WARNING' = 'NORMAL';
        let alert_color = '#10b981';

        if (simulatedScore >= 80) {
          alert_level = 'WARNING';
          alert_color = '#ef4444';
        } else if (simulatedScore >= 60) {
          alert_level = 'WATCH';
          alert_color = '#f97316';
        } else if (simulatedScore >= 40) {
          alert_level = 'ADVISORY';
          alert_color = '#eab308';
        }

        return {
          ...w,
          risk_score: Number(simulatedScore.toFixed(1)),
          alert_level,
          alert_color,
          rainfall_current_24h: simRain24h,
          rainfall_antecedent_72h: simRain72h,
          lead_time_hours: simulatedScore > 75 ? 2.5 : 8.0
        };
      })
    );

    if (selectedWardDetail) {
      setSelectedWardDetail((prev) =>
        prev
          ? {
              ...prev,
              risk_score: simRain24h > 150 ? 95.5 : 45.0,
              alert_level: simRain24h > 150 ? 'WARNING' : 'ADVISORY',
              alert_color: simRain24h > 150 ? '#ef4444' : '#eab308',
              rainfall_current_24h: simRain24h,
              rainfall_antecedent_72h: simRain72h
            }
          : null
      );
    }
  };

  // Filtered wards by district
  const filteredWards = selectedDistrict === 'All'
    ? wards
    : wards.filter(w => w.district_name.toLowerCase() === selectedDistrict.toLowerCase());

  // Top KPIs
  const totalWards = wards.length;
  const criticalCount = wards.filter(w => w.alert_level === 'WARNING' || w.alert_level === 'WATCH').length;
  const meanScore = wards.length > 0
    ? (wards.reduce((acc, w) => acc + w.risk_score, 0) / wards.length).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-tactical-bg text-slate-100 flex flex-col font-sans">
      {/* Accessible Skip Link (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-amber-400 focus:text-slate-950 focus:font-bold focus:rounded-lg focus:shadow-2xl focus:ring-4 focus:ring-amber-500 focus:outline-none text-sm transition-all"
      >
        Skip to main emergency dashboard
      </a>

      {/* Closed Captions Banner for Spoken Voice Directive (WCAG 1.2.2) */}
      {activeCaption && (
        <aside
          aria-live="assertive"
          aria-atomic="true"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-[92%] bg-black/95 border-2 border-amber-400 rounded-xl px-5 py-3 shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center gap-3 backdrop-blur-md animate-fadeIn"
          role="status"
        >
          <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Volume2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold">
              Emergency Voice Broadcast (Closed Caption)
            </p>
            <p className="text-white font-medium text-sm sm:text-base leading-snug">
              {activeCaption}
            </p>
          </div>
          <button
            onClick={() => setActiveCaption(null)}
            className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
            aria-label="Dismiss closed caption"
          >
            Dismiss
          </button>
        </aside>
      )}

      {/* Tactical App Header */}
      <Header
        onOpenModelCard={() => setIsModelCardOpen(true)}
        onOpenValidation={() => setIsValidationOpen(true)}
        onOpenSitRep={() => setIsSitRepOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSensors={() => setIsSensorsOpen(true)}
        onOpenAlertsAudit={() => setIsAlertsAuditOpen(true)}
        onOpenRiverCascade={() => setIsRiverCascadeOpen(true)}
        onOpenCAP={() => setIsCAPOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        activeSensorsCount={activeSensors.length || 4}
        isHighContrast={isHighContrast}
        onToggleHighContrast={handleToggleHighContrast}
        textScale={textScale}
        onCycleTextScale={handleCycleTextScale}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-5 focus:outline-none" role="main">
        {/* KPI Strip & District Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-tactical-surface border border-tactical-border rounded-xl p-4 shadow-md">
          {/* District Filter Buttons */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 lg:pb-0" role="tablist" aria-label="District Filter">
            <Filter className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" aria-hidden="true" />
            {['All', 'Mandi', 'Kullu', 'Kangra'].map((dist, idx) => (
              <button
                key={dist}
                role="tab"
                aria-selected={selectedDistrict === dist}
                onClick={() => setSelectedDistrict(dist)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  selectedDistrict === dist
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-tactical-card hover:bg-slate-700 text-slate-300 border border-tactical-border'
                }`}
                aria-label={`Filter by ${dist} District (Press ${idx + 1})`}
              >
                {dist === 'All' ? t('all_districts') : `${dist} District`}
                <span className="sr-only">, shortcut key {idx + 1}</span>
              </button>
            ))}
          </div>

          {/* KPI Metrics & Simulation Toggles */}
          <div className="flex items-center flex-wrap gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Monitored</span>
              <strong className="text-sm text-white">{totalWards} Units</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Warning/Watch</span>
              <strong className="text-sm text-red-400 font-bold">{criticalCount} Active</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Mean Risk</span>
              <strong className="text-sm text-amber-300">{meanScore} / 100</strong>
            </div>

            {/* SSE Live Telemetry Feed Badge */}
            <div className="flex items-center space-x-1.5 text-[10px] font-mono px-2 py-1.5 rounded bg-slate-900 border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${isSSEConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-slate-300 hidden sm:inline">{isSSEConnected ? 'SSE Live Stream' : 'Telemetry Feed'}</span>
            </div>

            {/* 4D Digital Twin Time-Lapse Toggle */}
            <button
              onClick={() => {
                setShowDigitalTwin(!showDigitalTwin);
                if (showSandbox) setShowSandbox(false);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-mono focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                showDigitalTwin
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-tactical-card border-tactical-border text-slate-300 hover:bg-slate-700'
              }`}
              aria-expanded={showDigitalTwin}
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>4D Digital Twin</span>
            </button>

            {/* Sandbox Simulation Toggle */}
            <button
              onClick={() => {
                setShowSandbox(!showSandbox);
                if (showDigitalTwin) setShowDigitalTwin(false);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-mono focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                showSandbox
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'bg-tactical-card border-tactical-border text-slate-300 hover:bg-slate-700'
              }`}
              aria-expanded={showSandbox}
              aria-controls="simulation-sandbox-panel"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Simulate Cloudburst</span>
              <span className="sm:hidden">Simulate</span>
            </button>

            {/* Refresh Feeds */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-tactical-card border border-tactical-border hover:bg-slate-700 text-slate-300 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
              title="Refresh Ingestion Feeds"
              aria-label="Refresh Satellite and Ingestion Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 4D Digital Twin Simulator Controls (Collapsible) */}
        {showDigitalTwin && (
          <div className="animate-fadeIn">
            <DigitalTwinControls
              currentStepIndex={twinStepIndex}
              onStepChange={handleTwinStepChange}
              onResetToLive={handleResetDigitalTwin}
              isSimulating={isSimulatingTwin}
            />
          </div>
        )}

        {/* Simulation Sandbox (Collapsible) */}
        {showSandbox && (
          <div id="simulation-sandbox-panel" className="animate-fadeIn">
            <SimulationSandbox
              onApplySimulation={handleApplySimulation}
              onReset={handleRefresh}
            />
          </div>
        )}

        {/* Mobile Segmented View Switcher (Visible on < lg screens) */}
        <div className="lg:hidden flex items-center justify-between p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto text-xs font-mono shadow-md gap-1">
          <button
            onClick={() => setMobileTab('all')}
            className={`flex-1 py-2 px-2 rounded-lg text-center transition-all min-h-[40px] whitespace-nowrap font-medium ${
              mobileTab === 'all'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Views
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-2 px-2 rounded-lg text-center transition-all min-h-[40px] whitespace-nowrap font-medium ${
              mobileTab === 'map'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🗺️ Map
          </button>
          <button
            onClick={() => setMobileTab('ward')}
            className={`flex-1 py-2 px-2 rounded-lg text-center transition-all min-h-[40px] whitespace-nowrap font-medium flex items-center justify-center space-x-1 ${
              mobileTab === 'ward'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚡ Intel</span>
            {selectedWardDetail && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />
            )}
          </button>
          <button
            onClick={() => setMobileTab('hydrograph')}
            className={`flex-1 py-2 px-2 rounded-lg text-center transition-all min-h-[40px] whitespace-nowrap font-medium ${
              mobileTab === 'hydrograph'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 Charts
          </button>
        </div>

        {/* Tactical Map and Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Choropleth Map with Satellite Imagery (Left 7 Cols) */}
          <div className={`lg:col-span-7 ${mobileTab === 'all' || mobileTab === 'map' ? 'block' : 'hidden lg:block'} space-y-3`}>
            <MapChoropleth
              wards={filteredWards}
              selectedWard={selectedWardDetail}
              onSelectWard={(wardId) => setSelectedWardId(wardId)}
              validationEvents={validationEvents}
              geoJsonData={geoJsonData}
              sensors={activeSensors}
            />

            {/* Mobile Map Active Ward Banner */}
            {selectedWardDetail && mobileTab === 'map' && (
              <div className="lg:hidden bg-slate-900/95 border border-cyan-500/50 p-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 animate-fadeIn">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedWardDetail.alert_color }} />
                    <span>{selectedWardDetail.ward_name}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Risk: <strong className="text-amber-400">{selectedWardDetail.risk_score.toFixed(0)}/100</strong> • Lead Time: <strong className="text-cyan-400">{selectedWardDetail.lead_time_hours}h</strong>
                  </div>
                </div>
                <button
                  onClick={() => setMobileTab('ward')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono min-h-[38px] whitespace-nowrap shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                >
                  Open Intel →
                </button>
              </div>
            )}
          </div>

          {/* Granular Ward Detail & Explainability (Right 5 Cols) */}
          <div className={`lg:col-span-5 ${mobileTab === 'all' || mobileTab === 'ward' ? 'block' : 'hidden lg:block'} space-y-3`}>
            {/* Mobile Back Button when in dedicated ward view */}
            {mobileTab === 'ward' && (
              <div className="lg:hidden flex items-center justify-between pb-1">
                <button
                  onClick={() => setMobileTab('map')}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-300 text-xs font-mono border border-slate-700 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Map View</span>
                </button>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {selectedWardDetail?.district_name} District
                </span>
              </div>
            )}

            <WardDetailPanel
              ward={selectedWardDetail}
              onTriggerAlert={handleTriggerAlert}
              onSimulateSurge={handleSimulateSurge}
            />
          </div>
        </div>

        {/* Time-Series Dynamic Hydrograph */}
        <div className={mobileTab === 'all' || mobileTab === 'hydrograph' ? 'block' : 'hidden lg:block'}>
          {mobileTab === 'hydrograph' && (
            <div className="lg:hidden flex items-center justify-between pb-2">
              <button
                onClick={() => setMobileTab('map')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-300 text-xs font-mono border border-slate-700 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Map View</span>
              </button>
            </div>
          )}

          <TimeSeriesChart
            points={historyPoints}
            wardName={selectedWardDetail?.ward_name || 'Selected Ward'}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-tactical-border py-4 px-6 text-center text-xs font-mono text-slate-500 bg-tactical-surface/50">
        FloodSight SIH26192 • Ministry of Home Affairs / NDRF Early Warning Initiative • Satellite Imagery powered by Esri World Imagery (0 API Cost).
      </footer>

      {/* Modals & Dialogs */}
      <ValidationEventsModal
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
        events={validationEvents}
        onSelectWard={(wardId) => setSelectedWardId(wardId)}
      />

      <ModelCardModal
        isOpen={isModelCardOpen}
        onClose={() => setIsModelCardOpen(false)}
        modelInfo={modelInfo}
      />

      <SitRepModal
        isOpen={isSitRepOpen}
        onClose={() => setIsSitRepOpen(false)}
        sitrep={sitrep}
      />

      <IoTSensorsModal
        isOpen={isSensorsOpen}
        onClose={() => setIsSensorsOpen(false)}
        sensors={activeSensors}
        onSelectWard={(wardId) => setSelectedWardId(wardId)}
        onSimulateSurge={handleSimulateSurge}
        onRefreshSensors={handleRefresh}
      />

      <AlertsAuditModal
        isOpen={isAlertsAuditOpen}
        onClose={() => setIsAlertsAuditOpen(false)}
      />

      <RiverCascadeModal
        isOpen={isRiverCascadeOpen}
        onClose={() => setIsRiverCascadeOpen(false)}
        onSelectWard={(wardId) => setSelectedWardId(wardId)}
      />

      <CAPModal
        isOpen={isCAPOpen}
        onClose={() => setIsCAPOpen(false)}
      />

      <ExportDataModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        wards={wards}
        geoJsonData={geoJsonData}
      />

      <SearchPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        wards={wards}
        onSelectWard={(wardId) => setSelectedWardId(wardId)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
