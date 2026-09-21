import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Clock,
  CloudRain,
  Mountain,
  Layers,
  Send,
  Radio,
  CheckCircle2,
  Info,
  Volume2,
  Activity,
  Gauge
} from 'lucide-react';
import { WardRisk } from '../types';
import { alertBroadcaster } from '../utils/audioAlert';

interface WardDetailProps {
  ward: WardRisk | null;
  onTriggerAlert: (wardId: string) => Promise<boolean>;
  onSimulateSurge: (wardId: string) => void;
  onSelectSector?: (wardId: string) => void;
}

export const WardDetailPanel: React.FC<WardDetailProps> = ({
  ward,
  onTriggerAlert,
  onSimulateSurge,
  onSelectSector
}) => {
  const { t, i18n } = useTranslation();
  const [isSending, setIsSending] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [surgeSimulated, setSurgeSimulated] = useState(false);

  if (!ward) {
    return (
      <div
        role="region"
        aria-label="Ward Details Empty State"
        className="tactical-chassis p-5 flex flex-col justify-between h-[580px] bg-[#1c232d] border border-[#2d3744] text-left"
      >
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#2d3744] pb-2.5">
            <Info className="w-4 h-4 text-[#0284c7]" />
            <h3 className="font-display font-bold text-sm text-[#e6edf3]">
              Station Ledger :: Inactive Selection
            </h3>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            No hydrological monitoring ward is currently active in the inspector. To initiate telemetry and risk triage:
          </p>
          <ol className="text-xs text-slate-400 font-mono space-y-2 list-decimal list-inside pl-1">
            <li>Select any polygon on the GIS map on the left.</li>
            <li>Use the Search palette (<kbd className="text-[10px] px-1 py-0.5 rounded bg-[#161b22] border border-[#2d3744] text-slate-300">Ctrl+K</kbd>) to search by tehsil name.</li>
            <li>Or load an active mountain catchment sector below:</li>
          </ol>
        </div>

        {/* Quick Sector Selector Buttons for immediate triage */}
        <div className="space-y-1.5 pt-4 border-t border-[#2d3744]">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Priority Catchment Corridors:
          </span>
          <div className="grid grid-cols-1 gap-1.5 font-mono text-xs">
            <button
              onClick={() => onSelectSector?.('HP-MND-02')}
              className="px-2.5 py-1.5 rounded bg-[#212934] hover:bg-[#2d3744] border border-[#2d3744] text-left text-slate-200 flex justify-between items-center transition-colors"
            >
              <span>HP-MND-02: Thunag (Seraj Basin)</span>
              <span className="text-[10px] text-[#dc2626] font-bold">82.4% Risk</span>
            </button>
            <button
              onClick={() => onSelectSector?.('HP-MND-01')}
              className="px-2.5 py-1.5 rounded bg-[#212934] hover:bg-[#2d3744] border border-[#2d3744] text-left text-slate-200 flex justify-between items-center transition-colors"
            >
              <span>HP-MND-01: Mandi Sadar (Beas)</span>
              <span className="text-[10px] text-[#b45309] font-bold">58.0% Risk</span>
            </button>
            <button
              onClick={() => onSelectSector?.('HP-KLU-02')}
              className="px-2.5 py-1.5 rounded bg-[#212934] hover:bg-[#2d3744] border border-[#2d3744] text-left text-slate-200 flex justify-between items-center transition-colors"
            >
              <span>HP-KLU-02: Manikaran (Parbati)</span>
              <span className="text-[10px] text-[#dc2626] font-bold">76.8% Risk</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDispatch = async () => {
    setIsSending(true);

    // Trigger local acoustic siren and voice alert
    alertBroadcaster.playAlertChime('warning');
    const voiceText = i18n.language === 'hi'
      ? `सावधान। ${ward.ward_name} के लिए आकस्मिक बाढ़ की आपातकालीन चेतावनी जारी की गई है। नदी तटों और जलभराव क्षेत्रों से तुरंत दूर रहें।`
      : `Emergency warning for ${ward.ward_name}. Critical flash flood risk. Avoid riverside corridors and stay alert immediately.`;
    alertBroadcaster.speakDirective(voiceText, i18n.language as 'en' | 'hi');

    const success = await onTriggerAlert(ward.ward_id);
    setIsSending(false);
    if (success) {
      setAlertSent(true);
      setTimeout(() => setAlertSent(false), 6000);
    }
  };

  const handleSimulateSurgeClick = () => {
    onSimulateSurge(ward.ward_id);
    setSurgeSimulated(true);
    setTimeout(() => setSurgeSimulated(false), 4000);
  };

  const isBreached = ward.rainfall_current_24h >= 103.0;

  return (
    <div
      role="region"
      aria-label={`Detailed analysis for ${ward.ward_name}`}
      className="tactical-chassis p-4 flex flex-col h-full overflow-y-auto space-y-3.5 bg-[#1c232d] border border-[#2d3744] rounded text-left"
    >
      {/* Header Info */}
      <div className="flex items-start justify-between border-b border-[#2d3744] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#212934] text-slate-300 border border-[#2d3744] font-bold">
              {ward.ward_id}
            </span>
            <span className="text-xs text-slate-400 font-mono">{ward.district_name} District</span>
          </div>
          <h2 className="font-display font-bold text-lg text-[#e6edf3] mt-1 tracking-tight">
            {ward.ward_name}
          </h2>
        </div>

        {/* Alert Severity Badge */}
        <div
          className="px-2.5 py-1 rounded font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5 border border-black/30"
          style={{ backgroundColor: ward.alert_color }}
          role="status"
          aria-label={`Current threat level: ${ward.alert_level}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{ward.alert_level}</span>
        </div>
      </div>

      {/* Main Metric Blocks: Risk Score & Actionable Lead Time */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Composite Risk Score */}
        <div className="bg-[#212934] border border-[#2d3744] p-3 rounded">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-[#0284c7]" />
              {t('risk_score')}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">0-100</span>
          </div>
          <div className="text-2xl font-mono font-black mt-1 text-[#e6edf3] flex items-baseline gap-1">
            <span style={{ color: ward.alert_color }}>{ward.risk_score.toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <div
            className="w-full bg-[#161b22] h-1.5 rounded mt-2 overflow-hidden border border-[#2d3744]"
            role="progressbar"
            aria-valuenow={ward.risk_score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Composite risk index: ${ward.risk_score.toFixed(1)} out of 100`}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(5, ward.risk_score))}%`,
                backgroundColor: ward.alert_color
              }}
            />
          </div>
        </div>

        {/* Actionable Lead Time */}
        <div className="bg-[#212934] border border-[#2d3744] p-3 rounded">
          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>{t('lead_time')}</span>
          </div>
          <div className="text-2xl font-mono font-black mt-1 text-[#e6edf3]">
            {ward.lead_time_hours.toFixed(1)}{' '}
            <span className="text-xs text-slate-400 font-normal">{t('hours')}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono truncate">
            Hydrological crest window
          </p>
        </div>
      </div>

      {/* Hydro-Meteorological Attributes Strip */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="bg-[#212934] p-2 rounded border border-[#2d3744]">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <CloudRain className="w-3 h-3 text-[#0284c7]" />
            <span>24h Rain</span>
          </div>
          <div className="font-bold text-[#e6edf3] mt-0.5">{ward.rainfall_current_24h.toFixed(1)} mm</div>
        </div>

        <div className="bg-[#212934] p-2 rounded border border-[#2d3744]">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <Mountain className="w-3 h-3 text-[#b45309]" />
            <span>Slope</span>
          </div>
          <div className="font-bold text-[#e6edf3] mt-0.5">{ward.features_summary?.slope_deg || 28}°</div>
        </div>

        <div className="bg-[#212934] p-2 rounded border border-[#2d3744]">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-300" />
            <span>Elevation</span>
          </div>
          <div className="font-bold text-[#e6edf3] mt-0.5">{ward.features_summary?.elevation_m || 1200} m</div>
        </div>
      </div>

      {/* 8-Factor Explainable AI Breakdown */}
      {ward.factor_contributions && ward.factor_contributions.length > 0 && (
        <div className="border border-[#2d3744] bg-[#212934] rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#e6edf3] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#0284c7]" />
              {t('factor_contributions')}
            </span>
            <span className="text-[10px] font-mono text-slate-300 px-1.5 py-0.2 rounded bg-[#161b22] border border-[#2d3744]">
              8-Factor Model
            </span>
          </div>

          <div className="space-y-1.5">
            {ward.factor_contributions.slice(0, 5).map((fc) => (
              <div key={fc.factor_name} className="text-xs">
                <div className="flex justify-between text-[11px] font-mono mb-0.5">
                  <span className="text-slate-300 font-sans">{fc.display_name}</span>
                  <span className={fc.is_aggravating ? 'text-[#dc2626] font-bold' : 'text-slate-400'}>
                    +{fc.impact_points.toFixed(1)} pts
                  </span>
                </div>
                <div className="w-full bg-[#161b22] h-1.5 rounded overflow-hidden border border-[#2d3744]">
                  <div
                    className={`h-full transition-all duration-300 ${
                      fc.is_aggravating ? 'bg-[#dc2626]' : 'bg-[#0284c7]'
                    }`}
                    style={{ width: `${Math.min(100, fc.impact_points * 2.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live IoT Sensor Telemetry HUD */}
      {ward.live_sensor_telemetry && (
        <div className="border border-[#2d3744] bg-[#212934] rounded p-3">
          <div className="flex items-center justify-between mb-2 text-xs font-mono text-slate-200">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#0284c7]" />
              <span className="font-bold">{ward.live_sensor_telemetry.node_id}</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#161b22] text-slate-300 border border-[#2d3744]">
              868.1 MHz LoRa
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#161b22] p-2 rounded border border-[#2d3744]">
              <span className="text-[10px] text-slate-400 block">RIVER STAGE (SONAR)</span>
              <div className="text-base font-bold text-[#e6edf3] mt-0.5">
                {ward.live_sensor_telemetry.water_level_cm.toFixed(1)} cm
              </div>
            </div>
            <div className="bg-[#161b22] p-2 rounded border border-[#2d3744]">
              <span className="text-[10px] text-slate-400 block">SLOPE TILT ANGLE</span>
              <div className="text-base font-bold text-[#b45309] mt-0.5">
                {ward.live_sensor_telemetry.tilt_angle_deg?.toFixed(1) || '1.1'}°
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Physical Hydrological Threshold (Intensity-Duration Curve) */}
      <div className="bg-[#212934] p-2.5 rounded border border-[#2d3744] text-[11px] font-mono space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] text-slate-300 font-bold uppercase">CWC / GSI I-D Formula</span>
          <span className="text-[10px] text-slate-400">I = 14.82·D⁻⁰·³⁹</span>
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <div className="text-slate-300">
            Current Rate: <strong className="text-[#e6edf3]">{(ward.rainfall_current_24h / 24).toFixed(2)} mm/h</strong>
            <span className="text-slate-400 text-[10px] ml-1">(Limit: 4.29)</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isBreached
                ? 'bg-[#dc2626]/20 text-[#dc2626] border-[#dc2626]'
                : 'bg-[#15803d]/20 text-[#15803d] border-[#15803d]'
            }`}
          >
            {isBreached ? 'BREACHED' : 'NOMINAL'}
          </span>
        </div>
      </div>

      {/* Operational Actions */}
      <div className="pt-1 space-y-2 font-sans">
        <button
          onClick={() => {
            const text = i18n.language === 'hi'
              ? `वार्ड ${ward.ward_name} के लिए स्थिति रिपोर्ट। वर्तमान जोखिम स्कोर ${ward.risk_score.toFixed(0)} है। 24 घंटे की वर्षा ${ward.rainfall_current_24h.toFixed(0)} मिलीमीटर है। अनुमानित लीड टाइम ${ward.lead_time_hours.toFixed(1)} घंटे।`
              : `Situation briefing for ${ward.ward_name}. Current composite risk index is ${ward.risk_score.toFixed(0)} out of 100. Current 24 hour rainfall is ${ward.rainfall_current_24h.toFixed(0)} millimeters. Actionable lead time is ${ward.lead_time_hours.toFixed(1)} hours.`;
            alertBroadcaster.speakDirective(text, i18n.language as 'en' | 'hi');
          }}
          className="w-full py-2 px-3 rounded bg-[#212934] hover:bg-[#2d3744] text-slate-200 border border-[#2d3744] text-xs flex items-center justify-center space-x-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[36px]"
          aria-label="Broadcast tactical voice briefing for this ward"
        >
          <Volume2 className="w-3.5 h-3.5 text-[#0284c7]" aria-hidden="true" />
          <span className="font-mono text-xs">Broadcast Voice Briefing</span>
        </button>

        <button
          onClick={handleDispatch}
          disabled={isSending}
          className="w-full py-2 px-3 rounded bg-[#dc2626] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white font-semibold text-xs flex items-center justify-center space-x-2 border border-[#dc2626] transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-white min-h-[38px]"
          aria-label="Dispatch Emergency Warning Directive"
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="font-mono">{isSending ? 'Dispatching...' : 'Dispatch Warning Directive'}</span>
        </button>

        <button
          onClick={handleSimulateSurgeClick}
          className="w-full py-1.5 px-3 rounded bg-[#212934] hover:bg-[#2d3744] text-slate-300 border border-[#2d3744] text-xs font-mono flex items-center justify-center space-x-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7] min-h-[34px]"
          aria-label="Simulate IoT ultrasonic surge spike for this ward"
        >
          <span>{surgeSimulated ? 'Surge Injected (+85cm)' : 'Simulate IoT Surge Spike'}</span>
        </button>

        <div aria-live="polite">
          {alertSent && (
            <div className="flex items-center space-x-2 bg-[#212934] border border-[#15803d] text-[#e6edf3] p-2 rounded text-xs font-mono animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#15803d]" aria-hidden="true" />
              <span>Directive Dispatched to NDRF and District EOC</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
