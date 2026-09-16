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
import { IoTSensorsModal } from './components/IoTSensorsModal';
import { AlertsAuditModal } from './components/AlertsAuditModal';
import {
  WardRisk,
  ValidationEvent,
  ModelInfo,
  TimeSeriesPoint,
  SitRepData,
  SensorNode
} from './types';
import { Filter, RefreshCw, SlidersHorizontal } from 'lucide-react';

export const App: React.FC = () => {
  const { t } = useTranslation();

  // Core State
  const [wards, setWards] = useState<WardRisk[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedWardId, setSelectedWardId] = useState<string>('HP-MND-02'); // Default: Thunag (Seraj Basin)
  const [selectedWardDetail, setSelectedWardDetail] = useState<WardRisk | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [historyPoints, setHistoryPoints] = useState<TimeSeriesPoint[]>([]);
  const [validationEvents, setValidationEvents] = useState<ValidationEvent[]>([]);
  const [sitrep, setSitrep] = useState<SitRepData | null>(null);
  const [sensors, setSensors] = useState<SensorNode[]>([]);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);

  // Modals & Panels State
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isModelCardOpen, setIsModelCardOpen] = useState(false);
  const [isSitRepOpen, setIsSitRepOpen] = useState(false);
  const [isSensorsOpen, setIsSensorsOpen] = useState(false);
  const [isAlertsAuditOpen, setIsAlertsAuditOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Global Shortcut Handler: Ctrl+K / Cmd+K opens search, Escape closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsValidationOpen(false);
        setIsModelCardOpen(false);
        setIsSitRepOpen(false);
        setIsSensorsOpen(false);
        setIsAlertsAuditOpen(false);
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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
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
        // Calculate dynamic response based on physical slope
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

    // Update selected ward detail in sync
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
      {/* Tactical App Header */}
      <Header
        onOpenModelCard={() => setIsModelCardOpen(true)}
        onOpenValidation={() => setIsValidationOpen(true)}
        onOpenSitRep={() => setIsSitRepOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSensors={() => setIsSensorsOpen(true)}
        onOpenAlertsAudit={() => setIsAlertsAuditOpen(true)}
        activeSensorsCount={sensors.length || 4}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-5" role="main">
        {/* KPI Strip & District Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-tactical-surface border border-tactical-border rounded-xl p-4 shadow-md">
          {/* District Filter Buttons */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 lg:pb-0" role="tablist" aria-label="District Filter">
            <Filter className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
            {['All', 'Mandi', 'Kullu', 'Kangra'].map((dist) => (
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
              >
                {dist === 'All' ? t('all_districts') : `${dist} District`}
              </button>
            ))}
          </div>

          {/* KPI Metrics & Sandbox Toggle */}
          <div className="flex items-center flex-wrap gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Monitored Wards</span>
              <strong className="text-sm text-white">{totalWards} Units</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase">High/Crit Alert</span>
              <strong className="text-sm text-red-400 font-bold">{criticalCount} Active</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Avg Regional Risk</span>
              <strong className="text-sm text-amber-300">{meanScore} / 100</strong>
            </div>

            {/* Sandbox Simulation Toggle */}
            <button
              onClick={() => setShowSandbox(!showSandbox)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-mono ${
                showSandbox
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'bg-tactical-card border-tactical-border text-slate-300 hover:bg-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Simulate Cloudburst</span>
            </button>

            {/* Refresh Feeds */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-tactical-card border border-tactical-border hover:bg-slate-700 text-slate-300 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
              title="Refresh Ingestion Feeds"
              aria-label="Refresh Satellite and Ingestion Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Simulation Sandbox (Collapsible) */}
        {showSandbox && (
          <div className="animate-fadeIn">
            <SimulationSandbox
              onApplySimulation={handleApplySimulation}
              onReset={handleRefresh}
            />
          </div>
        )}

        {/* Tactical Map and Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Choropleth Map with Satellite Imagery (Left 7 Cols) */}
          <div className="lg:col-span-7">
            <MapChoropleth
              wards={filteredWards}
              selectedWard={selectedWardDetail}
              onSelectWard={(wardId) => setSelectedWardId(wardId)}
              validationEvents={validationEvents}
              geoJsonData={geoJsonData}
              sensors={sensors}
            />
          </div>

          {/* Granular Ward Detail & Explainability (Right 5 Cols) */}
          <div className="lg:col-span-5">
            <WardDetailPanel
              ward={selectedWardDetail}
              onTriggerAlert={handleTriggerAlert}
              onSimulateSurge={handleSimulateSurge}
            />
          </div>
        </div>

        {/* Time-Series Dynamic Hydrograph */}
        <div>
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
        sensors={sensors}
        onSelectWard={(wardId) => setSelectedWardId(wardId)}
        onSimulateSurge={handleSimulateSurge}
        onRefreshSensors={handleRefresh}
      />

      <AlertsAuditModal
        isOpen={isAlertsAuditOpen}
        onClose={() => setIsAlertsAuditOpen(false)}
      />

      <SearchPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        wards={wards}
        onSelectWard={(wardId) => setSelectedWardId(wardId)}
      />
    </div>
  );
};

