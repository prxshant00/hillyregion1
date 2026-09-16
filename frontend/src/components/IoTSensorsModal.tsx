import React, { useState } from 'react';
import {
  X,
  Radio,
  Activity,
  BatteryCharging,
  Gauge,
  Compass,
  Zap,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Waves
} from 'lucide-react';
import { SensorNode } from '../types';

interface IoTSensorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sensors: SensorNode[];
  onSelectWard: (wardId: string) => void;
  onSimulateSurge: (wardId: string) => Promise<void>;
  onRefreshSensors: () => Promise<void>;
}

export const IoTSensorsModal: React.FC<IoTSensorsModalProps> = ({
  isOpen,
  onClose,
  sensors,
  onSelectWard,
  onSimulateSurge,
  onRefreshSensors
}) => {
  const [pingingNodeId, setPingingNodeId] = useState<string | null>(null);
  const [simulatingNodeId, setSimulatingNodeId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePing = async (nodeId: string) => {
    setPingingNodeId(nodeId);
    try {
      const res = await fetch(`/api/v1/sensors/${nodeId}/ping`, { method: 'POST' });
      if (res.ok) {
        setFeedbackMsg(`Telemetry ACK received from ${nodeId}. Status: 100% Nominal.`);
        await onRefreshSensors();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPingingNodeId(null);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleSurgeSim = async (node: SensorNode) => {
    setSimulatingNodeId(node.node_id);
    try {
      await onSimulateSurge(node.ward_id);
      setFeedbackMsg(`Simulated river surge triggered on ${node.river_name} (${node.node_id}). Alert updated!`);
      await onRefreshSensors();
    } catch (e) {
      console.error(e);
    } finally {
      setSimulatingNodeId(null);
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="iot-sensors-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-tactical-surface border border-tactical-border rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-tactical-border flex items-center justify-between bg-tactical-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 id="iot-sensors-title" className="font-display font-bold text-lg text-white">
                IoT Field Sensor Stream Network
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Real-Time Ultrasonic Water-Level Sonar & Accelerometer Tilt Nodes (Mandi, Kullu, Kangra)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close IoT Sensors Modal"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Feedback Notification */}
        {feedbackMsg && (
          <div className="bg-cyan-950/90 border-b border-cyan-700 px-5 py-2.5 flex items-center gap-2 text-xs font-mono text-cyan-300 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Sub-Header Banner */}
        <div className="px-5 py-3 border-b border-tactical-border bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-slate-400">Active Nodes:</span>{' '}
              <strong className="text-cyan-400">{sensors.length} Stations</strong>
            </div>
            <div>
              <span className="text-slate-400">Ingestion Protocol:</span>{' '}
              <strong className="text-emerald-400">ESP32 HTTP/LoRaWAN Gateway</strong>
            </div>
          </div>
          <button
            onClick={onRefreshSensors}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all text-[11px]"
          >
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* Sensor Grid */}
        <div className="p-5 overflow-y-auto space-y-4">
          {sensors.map((node) => {
            const isSurge = node.status === 'SURGE_WARNING' || node.water_level_cm > 400;
            const waterPct = Math.min(100, Math.round((node.water_level_cm / 500) * 100));

            return (
              <div
                key={node.node_id}
                className={`bg-tactical-card border rounded-xl p-4 transition-all ${
                  isSurge
                    ? 'border-red-600/80 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'border-tactical-border hover:border-cyan-600/60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Station Identity */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {node.node_id}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isSurge ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {isSurge ? 'Surge Danger' : 'Online / Nominal'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {node.district_name} District
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base flex items-center gap-2">
                      <span>{node.node_name}</span>
                    </h4>

                    <div className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5 text-cyan-400" />
                      <span>River Catchment: <strong>{node.river_name}</strong></span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">Assigned: {node.ward_name} ({node.ward_id})</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handlePing(node.node_id)}
                      disabled={pingingNodeId === node.node_id}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-all"
                      title="Send telemetry ping request"
                    >
                      <Activity className={`w-3.5 h-3.5 text-cyan-400 ${pingingNodeId === node.node_id ? 'animate-spin' : ''}`} />
                      <span>{pingingNodeId === node.node_id ? 'Pinging...' : 'Ping Node'}</span>
                    </button>

                    <button
                      onClick={() => handleSurgeSim(node)}
                      disabled={simulatingNodeId === node.node_id}
                      className="px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700 text-xs font-mono flex items-center gap-1.5 transition-all"
                      title="Simulate flash surge at this river gauge"
                    >
                      <Zap className="w-3.5 h-3.5 text-red-400" />
                      <span>{simulatingNodeId === node.node_id ? 'Simulating...' : 'Simulate Surge'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectWard(node.ward_id);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-mono flex items-center gap-1 transition-all"
                      title="Inspect ward on tactical map"
                    >
                      <span>View Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Telemetry Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80 font-mono text-xs">
                  {/* Sonar Stage */}
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-cyan-400" />
                      <span>River Stage (Sonar)</span>
                    </div>
                    <div className="text-base font-bold text-white mt-1 flex items-baseline gap-1">
                      <span className={isSurge ? 'text-red-400 font-black' : 'text-cyan-300'}>
                        {node.water_level_cm.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">cm</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full ${isSurge ? 'bg-red-500' : 'bg-cyan-400'}`}
                        style={{ width: `${waterPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Rate of Rise */}
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Activity className="w-3 h-3 text-amber-400" />
                      <span>Rate of Rise</span>
                    </div>
                    <div className="text-base font-bold text-white mt-1 flex items-baseline gap-1">
                      <span className={node.water_level_rate_cm_per_hr > 30 ? 'text-red-400' : 'text-amber-300'}>
                        +{node.water_level_rate_cm_per_hr.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">cm/hr</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 truncate">
                      {node.water_level_rate_cm_per_hr > 30 ? 'Torrential Surge Rate' : 'Moderate Inflow'}
                    </div>
                  </div>

                  {/* Slope Tilt */}
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Compass className="w-3 h-3 text-purple-400" />
                      <span>Sensor Tilt Angle</span>
                    </div>
                    <div className="text-base font-bold text-purple-300 mt-1 flex items-baseline gap-1">
                      <span>{node.tilt_angle_deg.toFixed(1)}°</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 truncate">
                      {node.tilt_angle_deg > 5.0 ? 'Subsurface Shear Warning' : 'Stable Bedrock Mount'}
                    </div>
                  </div>

                  {/* Battery & Health */}
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px] flex items-center gap-1">
                      <BatteryCharging className="w-3 h-3 text-emerald-400" />
                      <span>Battery / Solar</span>
                    </div>
                    <div className="text-base font-bold text-emerald-400 mt-1 flex items-baseline gap-1">
                      <span>{node.battery_level_pct.toFixed(0)}%</span>
                      <span className="text-[10px] text-emerald-300/80 font-normal">Solar Charged</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 truncate">
                      Last ping: {new Date(node.last_ping).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
