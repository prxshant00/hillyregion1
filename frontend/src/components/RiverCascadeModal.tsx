import React, { useEffect, useState } from 'react';
import {
  X,
  Waves,
  ArrowDownRight,
  Clock,
  Compass,
  Zap,
  Activity,
  ChevronRight
} from 'lucide-react';

interface RiverNode {
  node_id: string;
  ward_id: string;
  name: string;
  river: string;
  elevation_m: number;
  distance_from_source_km: number;
  channel_slope: number;
  travel_time_hours_from_source: number;
  downstream_node_id?: string;
}

interface RiverBasin {
  river: string;
  node_count: number;
  headwater_elevation_m: number;
  terminal_elevation_m: number;
  total_drop_m: number;
  nodes: RiverNode[];
}

interface CascadeDownstreamItem {
  node_id: string;
  ward_id: string;
  ward_name: string;
  distance_from_origin_km: number;
  estimated_surge_arrival_hours: number;
  projected_peak_stage_m: number;
  threat_severity: string;
}

interface CascadeResult {
  origin_ward_id: string;
  origin_ward_name: string;
  river: string;
  surge_stage_m: number;
  downstream_cascade: CascadeDownstreamItem[];
  downstream_wards_at_risk_count: number;
}

interface RiverCascadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWard?: (wardId: string) => void;
}

export const RiverCascadeModal: React.FC<RiverCascadeModalProps> = ({
  isOpen,
  onClose,
  onSelectWard
}) => {
  const [basins, setBasins] = useState<RiverBasin[]>([]);
  const [selectedRiver, setSelectedRiver] = useState<string>('Beas');
  const [selectedOriginWard, setSelectedOriginWard] = useState<string>('HP-KLU-04');
  const [cascadeData, setCascadeData] = useState<CascadeResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchNetworks = async () => {
      try {
        const res = await fetch('/api/v1/catchment/networks');
        if (res.ok) {
          const data = await res.json();
          setBasins(data);
        }
      } catch (err) {
        console.error('Failed to fetch catchment networks:', err);
      }
    };
    fetchNetworks();
  }, [isOpen]);

  const activeBasin = basins.find(b => b.river === selectedRiver) || basins[0];

  useEffect(() => {
    if (!isOpen || !activeBasin) return;
    const fetchCascade = async () => {
      setLoading(true);
      try {
        const wardId = selectedOriginWard || activeBasin.nodes[0].ward_id;
        const res = await fetch(`/api/v1/catchment/cascade/${wardId}?surge_stage_m=4.2`);
        if (res.ok) {
          const data = await res.json();
          setCascadeData(data);
        }
      } catch (err) {
        console.error('Failed to fetch cascade impact:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCascade();
  }, [isOpen, selectedRiver, selectedOriginWard, activeBasin]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-tactical-surface border border-tactical-border rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-tactical-border flex items-center justify-between bg-tactical-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>Hydrological Catchment Routing & River Cascade</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  MANNING'S EQUATION
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Upstream-to-downstream floodwave propagation delays across Himachal steep-gradient valleys
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

        {/* River Basin Tabs */}
        <div className="px-6 pt-4 border-b border-tactical-border bg-slate-900/50 flex space-x-3">
          {basins.map(b => (
            <button
              key={b.river}
              onClick={() => {
                setSelectedRiver(b.river);
                if (b.nodes.length > 0) setSelectedOriginWard(b.nodes[0].ward_id);
              }}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all flex items-center space-x-2 border-b-2 ${
                selectedRiver === b.river
                  ? 'border-cyan-400 text-cyan-300 bg-tactical-card'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span>{b.river} Catchment</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {b.node_count} Nodes
              </span>
            </button>
          ))}
        </div>

        {/* Basin Profile Banner */}
        {activeBasin && (
          <div className="px-6 py-3 bg-slate-900/80 border-b border-tactical-border flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center space-x-4">
              <span className="text-slate-400">
                Headwater: <strong className="text-slate-200">{activeBasin.headwater_elevation_m}m</strong>
              </span>
              <ArrowDownRight className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">
                Terminal: <strong className="text-slate-200">{activeBasin.terminal_elevation_m}m</strong>
              </span>
              <span className="text-cyan-400 font-mono">
                Total Vertical Drop: <strong>{activeBasin.total_drop_m}m</strong>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Kinematic Wave celerity: ~4.2 - 6.8 m/s in narrow mountain gorge
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* River Topological Nodes */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
              <span>RIVER PROFILE: SELECT UPSTREAM SURGE ORIGIN</span>
              <span className="text-[11px] font-mono text-cyan-400">
                Click any upstream ward to recalculate downstream surge arrival ETAs
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {activeBasin?.nodes.map((node, idx) => {
                const isOrigin = selectedOriginWard === node.ward_id;
                return (
                  <button
                    key={node.node_id}
                    onClick={() => setSelectedOriginWard(node.ward_id)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                      isOrigin
                        ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-900/20'
                        : 'border-tactical-border bg-tactical-card hover:border-slate-600 hover:bg-slate-850'
                    }`}
                  >
                    {isOrigin && (
                      <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-bl">
                        ORIGIN
                      </div>
                    )}
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 mb-1">
                      <span>STEP {idx + 1}</span>
                      <span>•</span>
                      <span>{node.node_id}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 mb-2 truncate">
                      {node.name}
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Elevation:</span>
                        <strong className="text-slate-200">{node.elevation_m}m</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance:</span>
                        <span className="text-slate-300">{node.distance_from_source_km} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Slope:</span>
                        <span className="text-cyan-300 font-mono">{(node.channel_slope * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Downstream Cascade Impact Results */}
          <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
                  Downstream Surge Propagation Timeline (Origin: {cascadeData?.origin_ward_name})
                </h4>
              </div>
              <span className="text-xs font-mono text-cyan-400">
                {cascadeData?.downstream_wards_at_risk_count} Downstream Wards Threatened
              </span>
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Calculating hydraulic flow routing...</div>
            ) : cascadeData && cascadeData.downstream_cascade.length > 0 ? (
              <div className="space-y-3">
                {cascadeData.downstream_cascade.map((item, index) => (
                  <div
                    key={item.node_id}
                    className="p-3 rounded-lg border border-tactical-border bg-slate-900/70 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[11px]">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100">{item.ward_name}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.distance_from_origin_km} km downstream along {selectedRiver} River
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase">Estimated Surge Arrival (ETA)</div>
                        <div className="font-mono font-bold text-sm text-amber-300 flex items-center justify-end space-x-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>+{item.estimated_surge_arrival_hours} hrs</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase">Projected Peak Stage</div>
                        <div className="font-mono font-bold text-sm text-cyan-300">
                          {item.projected_peak_stage_m} m
                        </div>
                      </div>

                      <div>
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            item.threat_severity === 'HIGH'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.threat_severity} RISK
                        </span>
                      </div>

                      {onSelectWard && (
                        <button
                          onClick={() => {
                            onSelectWard(item.ward_id);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1 transition-colors"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                Selected node is at the terminal end of the catchment; no further downstream wards in this sub-basin.
              </div>
            )}
          </div>

          {/* Hydrological Manning's Callout */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Scientific Routing Model: Manning's Kinematic Wave</span>
            </div>
            <p className="leading-relaxed">
              Velocity of floodwave propagation is calculated as{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                v = (1/n) * R^(2/3) * S^(1/2)
              </code>
              , where roughness coefficient{' '}
              <code className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">n = 0.045</code> (boulder-strewn
              Himalayan riverbeds) and hydraulic radius{' '}
              <code className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">R ≈ 3.5m</code>. This models
              the real surge transmission window giving downstream tehsils 1.5 to 5.6 hours of life-saving lead time.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-tactical-border bg-tactical-card flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Covers 11 connected gauging points along Beas, Parbati, and Tirthan rivers</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
