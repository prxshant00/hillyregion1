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
        aria-label="Ward Details Empty State"
        className="tactical-glass hud-bracket rounded-xl p-6 flex flex-col items-center justify-center text-center h-[580px]"
      >
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 mb-3.5 shadow-inner">
          <Info className="w-7 h-7 text-cyan-500/70" />
        </div>
        <h3 className="font-display font-bold text-slate-200 text-base">{t('ward_details')}</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed font-sans">
          Select any ward or tehsil polygon on the tactical choropleth map to inspect granular risk factors, hydrological thresholds, and telemetry streams.
        </p>
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

  const isBreached = ward.rainfall_current_24h >= 103.0;

  return (
    <div
      role="region"
      aria-label={`Detailed analysis for ${ward.ward_name}`}
      className="tactical-glass hud-bracket rounded-xl p-5 flex flex-col h-full overflow-y-auto space-y-4 shadow-2xl border border-cyan-500/30"
    >
      {/* Header Info */}
      <div className="flex items-start justify-between border-b border-tactical-border pb-3.5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold">
              {ward.ward_id}
            </span>
            <span className="text-xs text-slate-400 font-mono">{ward.district_name} District</span>
          </div>
          <h2 className="font-display font-bold text-xl text-white mt-1 tracking-tight">
            {ward.ward_name}
          </h2>
        </div>

        {/* Alert Severity Badge */}
        <div
          className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider text-white shadow-lg flex items-center space-x-1.5 border border-white/20"
          style={{ backgroundColor: ward.alert_color }}
          role="status"
          aria-label={`Current threat level: ${ward.alert_level}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{ward.alert_level}</span>
        </div>
      </div>

      {/* Main Metric Cards: Risk Score & Actionable Lead Time */}
      <div className="grid grid-cols-2 gap-3">
        {/* Composite Risk Score */}
        <div className="bg-slate-900/90 border border-tactical-border p-3.5 rounded-xl shadow-inner">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              {t('risk_score')}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">0-100</span>
          </div>
          <div className="text-2xl font-mono font-black mt-1 text-white flex items-baseline gap-1">
            <span style={{ color: ward.alert_color }}>{ward.risk_score.toFixed(1)}</span>
            <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </div>
          <div
            className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden"
            role="progressbar"
            aria-valuenow={ward.risk_score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Composite risk index: ${ward.risk_score.toFixed(1)} out of 100`}
          >
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${Math.min(100, Math.max(5, ward.risk_score))}%`,
                backgroundColor: ward.alert_color
              }}
            />
          </div>
        </div>

        {/* Actionable Lead Time */}
        <div className="bg-slate-900/90 border border-tactical-border p-3.5 rounded-xl shadow-inner">
          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('lead_time')}</span>
          </div>
          <div className="text-2xl font-mono font-black mt-1 text-cyan-300">
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
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <CloudRain className="w-3 h-3 text-blue-400" />
            <span>24h Rain</span>
          </div>
          <div className="font-bold text-slate-100 mt-0.5">{ward.rainfall_current_24h.toFixed(1)} mm</div>
        </div>

        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <Mountain className="w-3 h-3 text-amber-400" />
            <span>Slope</span>
          </div>
          <div className="font-bold text-slate-100 mt-0.5">{ward.features_summary?.slope_deg || 28}°</div>
        </div>

        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          <div className="text-slate-400 text-[10px] flex items-center gap-1">
            <Layers className="w-3 h-3 text-purple-400" />
            <span>Elevation</span>
          </div>
          <div className="font-bold text-slate-100 mt-0.5">{ward.features_summary?.elevation_m || 1200} m</div>
        </div>
      </div>

      {/* 8-Factor Explainable AI Breakdown */}
      {ward.factor_contributions && ward.factor_contributions.length > 0 && (
        <div className="border border-tactical-border bg-slate-900/70 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              {t('factor_contributions')}
            </span>
            <span className="text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
              Explainable AI
            </span>
          </div>

          <div className="space-y-2">
            {ward.factor_contributions.slice(0, 5).map((fc) => (
              <div key={fc.factor_name} className="text-xs">
                <div className="flex justify-between text-[11px] font-mono mb-0.5">
                  <span className="text-slate-300 font-sans">{fc.display_name}</span>
                  <span className={fc.is_aggravating ? 'text-red-400 font-bold' : 'text-slate-400'}>
                    +{fc.impact_points.toFixed(1)} pts
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      fc.is_aggravating ? 'bg-gradient-to-r from-red-500 to-amber-500' : 'bg-cyan-500'
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
        <div className="border border-cyan-800/80 bg-cyan-950/30 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2 text-xs font-mono text-cyan-300">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="font-bold">{ward.live_sensor_telemetry.node_id}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
              LoRa Telemetry Stream
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">RIVER STAGE (SONAR)</span>
              <div className="text-base font-bold text-cyan-200 mt-0.5">
                {ward.live_sensor_telemetry.water_level_cm.toFixed(1)} cm
              </div>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">SLOPE TILT ANGLE</span>
              <div className="text-base font-bold text-amber-300 mt-0.5">
                {ward.live_sensor_telemetry.tilt_angle_deg?.toFixed(1) || '1.1'}°
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Physical Hydrological Threshold (Intensity-Duration Curve) */}
      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1.5 shadow-inner">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] text-slate-200 font-bold uppercase tracking-wide">CWC / GSI Rainfall Threshold</span>
          <span className="text-[10px] text-cyan-400 font-bold">I = 14.82·D⁻⁰·³⁹</span>
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <div className="text-slate-300">
            Current Rate: <strong className="text-white">{(ward.rainfall_current_24h / 24).toFixed(2)} mm/h</strong>
            <span className="text-slate-500 text-[10px] block sm:inline sm:ml-1">(Limit: 4.29 mm/h)</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isBreached
                ? 'bg-red-950 text-red-300 border-red-800 animate-pulse'
                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
            }`}
          >
            {isBreached ? 'THRESHOLD BREACHED' : 'NOMINAL HOLDING'}
          </span>
        </div>
      </div>

      {/* Operational Actions */}
      <div className="pt-2 space-y-2 font-sans">
        <button
          onClick={() => {
            const text = i18n.language === 'hi'
              ? `वार्ड ${ward.ward_name} के लिए स्थिति रिपोर्ट। वर्तमान जोखिम स्कोर ${ward.risk_score.toFixed(0)} है। 24 घंटे की वर्षा ${ward.rainfall_current_24h.toFixed(0)} मिलीमीटर है। अनुमानित लीड टाइम ${ward.lead_time_hours.toFixed(1)} घंटे।`
              : `Situation briefing for ${ward.ward_name}. Current composite risk index is ${ward.risk_score.toFixed(0)} out of 100. Current 24 hour rainfall is ${ward.rainfall_current_24h.toFixed(0)} millimeters. Actionable lead time is ${ward.lead_time_hours.toFixed(1)} hours.`;
            alertBroadcaster.speakDirective(text, i18n.language as 'en' | 'hi');
          }}
          className="w-full py-2.5 px-3 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-800/60 text-xs flex items-center justify-center space-x-2 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[40px]"
          aria-label="Listen to immediate verbal hazard briefing for this ward"
        >
          <Volume2 className="w-4 h-4 text-cyan-400" aria-hidden="true" />
          <span className="font-medium">Listen Tactical Voice Briefing</span>
        </button>

        <button
          onClick={handleDispatch}
          disabled={isSending}
          className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(239,68,68,0.35)] transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-400 min-h-[42px]"
          aria-label="Dispatch Emergency Warning Directive"
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isSending ? 'Dispatching Directive...' : t('trigger_alert_btn')}</span>
        </button>

        <button
          onClick={() => onSimulateSurge(ward.ward_id)}
          className="w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center justify-center space-x-1.5 transition-all focus-visible:ring-2 focus-visible:ring-slate-400 min-h-[36px]"
          aria-label="Simulate IoT ultrasonic surge spike for this ward"
        >
          <span>⚡ {t('sim_surge')}</span>
        </button>

        <div aria-live="polite">
          {alertSent && (
            <div className="flex items-center space-x-2 bg-emerald-950/90 border border-emerald-600 text-emerald-300 p-2.5 rounded-lg text-xs font-mono animate-fadeIn shadow-lg">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" aria-hidden="true" />
              <span>{t('alert_sent_success')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
