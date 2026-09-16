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
  Info
} from 'lucide-react';
import { WardRisk } from '../types';
import { alertBroadcaster } from '../utils/audioAlert';

interface WardDetailProps {
  ward: WardRisk | null;
  onTriggerAlert: (wardId: string) => Promise<boolean>;
  onSimulateSurge: (wardId: string) => void;
}

export const WardDetailPanel: React.FC<WardDetailProps> = ({
  ward,
  onTriggerAlert,
  onSimulateSurge
}) => {
  const { t, i18n } = useTranslation();
  const [isSending, setIsSending] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  if (!ward) {
    return (
      <div
        role="region"
        aria-label="Ward Details"
        className="bg-tactical-surface border border-tactical-border rounded-xl p-6 flex flex-col items-center justify-center text-center h-[540px]"
      >
        <Info className="w-10 h-10 text-slate-500 mb-3" />
        <h3 className="font-semibold text-slate-300">{t('ward_details')}</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Select any ward or tehsil polygon on the tactical choropleth map to inspect granular risk factors.
        </p>
      </div>
    );
  }

  const handleDispatch = async () => {
    setIsSending(true);

    // Trigger local acoustic siren and voice alert
    alertBroadcaster.playAlertChime('warning');
    const voiceText = i18n.language === 'hi'
      ? `सावधान। ${ward.ward_name} के लिए आकस्मिक बाढ़ की आपातकालीन चेतावनी जारी की गई है। तुरंत सुरक्षित आश्रय की ओर जाएं।`
      : `Emergency warning for ${ward.ward_name}. Critical flash flood risk. Move to high ground shelter immediately.`;
    alertBroadcaster.speakDirective(voiceText, i18n.language as 'en' | 'hi');

    const success = await onTriggerAlert(ward.ward_id);
    setIsSending(false);
    if (success) {
      setAlertSent(true);
      setTimeout(() => setAlertSent(false), 6000);
    }
  };

  return (
    <div
      role="region"
      aria-label={`Detailed analysis for ${ward.ward_name}`}
      className="bg-tactical-surface border border-tactical-border rounded-xl p-5 flex flex-col h-full overflow-y-auto space-y-4 shadow-xl"
    >
      {/* Header Info */}
      <div className="flex items-start justify-between border-b border-tactical-border pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              {ward.ward_id}
            </span>
            <span className="text-xs text-slate-400 font-mono">{ward.district_name} District</span>
          </div>
          <h2 className="font-display font-bold text-lg text-white mt-1">
            {ward.ward_name}
          </h2>
        </div>

        {/* Alert Badge */}
        <div
          className="px-3 py-1.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider text-white shadow-md flex items-center space-x-1.5"
          style={{ backgroundColor: ward.alert_color }}
          role="status"
          aria-label={`Alert level: ${ward.alert_level}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{ward.alert_level}</span>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Risk Score */}
        <div className="bg-tactical-card border border-tactical-border p-3 rounded-lg">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>{t('risk_score')}</span>
            <span className="text-[10px] text-slate-500">Scale 0-100</span>
          </div>
          <div className="text-2xl font-mono font-bold mt-1 text-white flex items-baseline gap-1">
            <span style={{ color: ward.alert_color }}>{ward.risk_score.toFixed(1)}</span>
            <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${ward.risk_score}%`,
                backgroundColor: ward.alert_color
              }}
            />
          </div>
        </div>

        {/* Lead Time */}
        <div className="bg-tactical-card border border-tactical-border p-3 rounded-lg">
          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{t('lead_time')}</span>
          </div>
          <div className="text-2xl font-mono font-bold mt-1 text-cyan-300">
            {ward.lead_time_hours.toFixed(1)}{' '}
            <span className="text-xs text-slate-400 font-normal">{t('hours')}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 truncate">
            Hydrological crest window
          </p>
        </div>
      </div>

      {/* Hydro-Meteorological Attributes */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <CloudRain className="w-3 h-3 text-blue-400" />
            <span>24h Rain</span>
          </div>
          <div className="font-bold text-slate-100 mt-0.5">{ward.rainfall_current_24h.toFixed(1)} mm</div>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <Mountain className="w-3 h-3 text-amber-400" />
            <span>Slope</span>
          </div>
          <div className="font-bold text-slate-100 mt-0.5">{ward.features_summary?.slope_deg || 28}°</div>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <Layers className="w-3 h-3 text-purple-400" />
            <span>Elevation</span>
          </div>
          <div className="font-bold text-slate-100 mt-0.5">{ward.features_summary?.elevation_m || 1200} m</div>
        </div>
      </div>


      {/* 8-Factor Explainability Breakdown */}
      {ward.factor_contributions && ward.factor_contributions.length > 0 && (
        <div className="border border-tactical-border bg-slate-900/40 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-slate-300">
              {t('factor_contributions')}
            </span>
            <span className="text-[10px] font-mono text-cyan-400">Explainable AI</span>
          </div>

          <div className="space-y-1.5">
            {ward.factor_contributions.slice(0, 5).map((fc) => (
              <div key={fc.factor_name} className="text-xs">
                <div className="flex justify-between text-[11px] font-mono mb-0.5">
                  <span className="text-slate-300">{fc.display_name}</span>
                  <span className={fc.is_aggravating ? 'text-red-400 font-bold' : 'text-slate-400'}>
                    +{fc.impact_points.toFixed(1)} pts
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      fc.is_aggravating ? 'bg-red-500' : 'bg-cyan-500'
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
        <div className="border border-cyan-800/60 bg-cyan-950/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2 text-xs font-mono text-cyan-300">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>IoT Sonar Node: {ward.live_sensor_telemetry.node_id}</span>
            </span>
            <span className="text-[10px] text-cyan-400/80">Stream Active</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-900/80 p-2 rounded">
              <span className="text-[10px] text-slate-400">River Stage (Sonar)</span>
              <div className="text-sm font-bold text-cyan-200 mt-0.5">
                {ward.live_sensor_telemetry.water_level_cm.toFixed(1)} cm
              </div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded">
              <span className="text-[10px] text-slate-400">Slope Tilt Angle</span>
              <div className="text-sm font-bold text-amber-300 mt-0.5">
                {ward.live_sensor_telemetry.tilt_angle_deg?.toFixed(1) || '1.1'}°
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operational Actions */}
      <div className="pt-2 space-y-2">
        <button
          onClick={handleDispatch}
          disabled={isSending}
          className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-400"
          aria-label="Dispatch Emergency SMS & Audio Warning Directive"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSending ? 'Dispatching Directive...' : t('trigger_alert_btn')}</span>
        </button>

        <button
          onClick={() => onSimulateSurge(ward.ward_id)}
          className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center justify-center space-x-1.5 transition-all focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <span>⚡ {t('sim_surge')}</span>
        </button>

        <div aria-live="polite">
          {alertSent && (
            <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-700 text-emerald-300 p-2.5 rounded-lg text-xs font-mono animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{t('alert_sent_success')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
