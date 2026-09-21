import React, { useState } from 'react';
import { Waves } from 'lucide-react';

interface StationNode {
  wardId: string;
  stationName: string;
  river: string;
  elevationM: number;
  distanceKm: number;
  stageCm: number;
  dangerStageCm: number;
  flowVelocityMs: number;
  etaHours: number;
  alertLevel: 'NORMAL' | 'ADVISORY' | 'WATCH' | 'WARNING';
}

interface TopographicElevationRibbonProps {
  selectedWardId: string;
  onSelectWard: (wardId: string) => void;
}

const RIVER_CORRIDORS: Record<string, StationNode[]> = {
  Beas: [
    {
      wardId: 'HP-KLU-04',
      stationName: 'Manali Headwaters',
      river: 'Beas Mainstem',
      elevationM: 2050,
      distanceKm: 0,
      stageCm: 140,
      dangerStageCm: 250,
      flowVelocityMs: 5.6,
      etaHours: 0.0,
      alertLevel: 'ADVISORY'
    },
    {
      wardId: 'HP-KLU-01',
      stationName: 'Kullu Valley',
      river: 'Beas Mainstem',
      elevationM: 1220,
      distanceKm: 41,
      stageCm: 210,
      dangerStageCm: 320,
      flowVelocityMs: 4.9,
      etaHours: 1.1,
      alertLevel: 'ADVISORY'
    },
    {
      wardId: 'HP-KLU-03',
      stationName: 'Bhuntar Confluence',
      river: 'Beas Mainstem',
      elevationM: 1080,
      distanceKm: 52,
      stageCm: 265,
      dangerStageCm: 350,
      flowVelocityMs: 4.7,
      etaHours: 1.6,
      alertLevel: 'WATCH'
    },
    {
      wardId: 'HP-MND-03',
      stationName: 'Larji Dam Confluence',
      river: 'Beas Mainstem',
      elevationM: 950,
      distanceKm: 78,
      stageCm: 310,
      dangerStageCm: 380,
      flowVelocityMs: 4.4,
      etaHours: 2.3,
      alertLevel: 'WATCH'
    },
    {
      wardId: 'HP-MND-04',
      stationName: 'Pandoh Dam Gauge',
      river: 'Beas Mainstem',
      elevationM: 850,
      distanceKm: 98,
      stageCm: 395,
      dangerStageCm: 420,
      flowVelocityMs: 4.2,
      etaHours: 2.9,
      alertLevel: 'WARNING'
    },
    {
      wardId: 'HP-MND-01',
      stationName: 'Mandi Sadar',
      river: 'Beas Mainstem',
      elevationM: 760,
      distanceKm: 118,
      stageCm: 380,
      dangerStageCm: 450,
      flowVelocityMs: 3.8,
      etaHours: 3.5,
      alertLevel: 'WATCH'
    },
    {
      wardId: 'HP-MND-05',
      stationName: 'Dharampur Terminal',
      river: 'Beas Mainstem',
      elevationM: 680,
      distanceKm: 142,
      stageCm: 290,
      dangerStageCm: 400,
      flowVelocityMs: 3.5,
      etaHours: 4.2,
      alertLevel: 'ADVISORY'
    }
  ],
  Parbati: [
    {
      wardId: 'HP-KLU-02',
      stationName: 'Manikaran Gorge',
      river: 'Parbati Tributary',
      elevationM: 1760,
      distanceKm: 0,
      stageCm: 285,
      dangerStageCm: 320,
      flowVelocityMs: 5.8,
      etaHours: 0.0,
      alertLevel: 'WARNING'
    },
    {
      wardId: 'HP-KLU-05',
      stationName: 'Kasol Basin',
      river: 'Parbati Tributary',
      elevationM: 1580,
      distanceKm: 12,
      stageCm: 240,
      dangerStageCm: 300,
      flowVelocityMs: 5.1,
      etaHours: 0.4,
      alertLevel: 'WATCH'
    },
    {
      wardId: 'HP-KLU-03',
      stationName: 'Bhuntar Junction',
      river: 'Parbati Confluence',
      elevationM: 1080,
      distanceKm: 34,
      stageCm: 265,
      dangerStageCm: 350,
      flowVelocityMs: 4.5,
      etaHours: 1.2,
      alertLevel: 'WATCH'
    }
  ]
};

export const TopographicElevationRibbon: React.FC<TopographicElevationRibbonProps> = ({
  selectedWardId,
  onSelectWard
}) => {
  const [activeRiver, setActiveRiver] = useState<'Beas' | 'Parbati'>('Beas');
  const stations = RIVER_CORRIDORS[activeRiver];

  const maxElev = stations[0].elevationM;
  const minElev = stations[stations.length - 1].elevationM;
  const totalDrop = maxElev - minElev;

  return (
    <div className="tactical-chassis p-4 bg-[#1c232d] border border-[#2d3744] rounded space-y-3.5 text-left">
      {/* Header & River Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2d3744] pb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-[#212934] border border-[#2d3744] flex items-center justify-center text-[#0284c7]">
            <Waves className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-[#e6edf3] flex items-center gap-2">
              Topographic Catchment Cross-Section
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#212934] text-slate-300 border border-[#2d3744]">
                Gravity Gradient: {maxElev}m &rarr; {minElev}m MSL
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Upstream-to-downstream hydraulic surge routing • Click any station to inspect ward
            </p>
          </div>
        </div>

        {/* River Basin Switcher */}
        <div className="flex items-center space-x-1 font-mono text-xs">
          <button
            onClick={() => setActiveRiver('Beas')}
            className={`px-2.5 py-1 rounded border transition-colors ${
              activeRiver === 'Beas'
                ? 'bg-[#212934] border-[#0284c7] text-[#0284c7] font-bold'
                : 'bg-[#161b22] border-[#2d3744] text-slate-400 hover:text-slate-200'
            }`}
          >
            Beas Mainstem (7 Stns)
          </button>
          <button
            onClick={() => setActiveRiver('Parbati')}
            className={`px-2.5 py-1 rounded border transition-colors ${
              activeRiver === 'Parbati'
                ? 'bg-[#212934] border-[#0284c7] text-[#0284c7] font-bold'
                : 'bg-[#161b22] border-[#2d3744] text-slate-400 hover:text-slate-200'
            }`}
          >
            Parbati Gorge (3 Stns)
          </button>
        </div>
      </div>

      {/* SVG Hydraulic Cross-Section Diagram */}
      <div className="relative w-full bg-[#161b22] border border-[#2d3744] rounded p-3 overflow-x-auto">
        <div className="min-w-[680px]">
          {/* Elevation Scale Bar */}
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-1 px-1">
            <span>High Glacier Pass ({maxElev}m)</span>
            <span>Channel Slope: {(totalDrop / (stations[stations.length - 1].distanceKm || 1)).toFixed(1)} m/km</span>
            <span>Gorge Outlet ({minElev}m)</span>
          </div>

          {/* Interactive Profile Line */}
          <div className="grid grid-cols-7 gap-1 relative pt-2 pb-4">
            {stations.map((stn, index) => {
              const isSelected = selectedWardId === stn.wardId;
              const dropPercent = Math.round(((maxElev - stn.elevationM) / (totalDrop || 1)) * 100);

              const alertColor =
                stn.alertLevel === 'WARNING'
                  ? '#dc2626'
                  : stn.alertLevel === 'WATCH'
                  ? '#ea580c'
                  : stn.alertLevel === 'ADVISORY'
                  ? '#b45309'
                  : '#15803d';

              return (
                <button
                  key={stn.wardId + index}
                  onClick={() => onSelectWard(stn.wardId)}
                  className={`group relative text-left p-2 rounded transition-colors border ${
                    isSelected
                      ? 'bg-[#212934] border-[#0284c7] ring-1 ring-[#0284c7]'
                      : 'bg-[#1c232d] hover:bg-[#212934] border-[#2d3744]'
                  }`}
                  aria-label={`Select station ${stn.stationName}`}
                >
                  {/* Top Station Badge */}
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="text-slate-400 font-bold">{stn.elevationM}m</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: alertColor }}
                      title={`Alert status: ${stn.alertLevel}`}
                    />
                  </div>

                  {/* Station Name */}
                  <div className="text-xs font-bold text-[#e6edf3] truncate font-sans group-hover:text-[#0284c7] transition-colors">
                    {stn.stationName}
                  </div>

                  {/* Stage vs Danger */}
                  <div className="text-[11px] font-mono text-slate-300 mt-1 flex items-baseline justify-between">
                    <span>Stage:</span>
                    <span className="font-bold text-white">{stn.stageCm} cm</span>
                  </div>

                  {/* Surge Velocity & ETA */}
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex justify-between">
                    <span>{stn.flowVelocityMs} m/s</span>
                    <span className="text-[#0284c7]">+{stn.etaHours}h ETA</span>
                  </div>

                  {/* Elevation Drop Graphic Bar */}
                  <div className="w-full bg-[#161b22] h-1 rounded mt-2 overflow-hidden">
                    <div
                      className="h-full bg-[#0284c7] opacity-80"
                      style={{ width: `${Math.max(15, 100 - dropPercent)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Telemetry Metrics Strip */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#2d3744] text-xs font-mono">
            <div className="bg-[#1c232d] p-1.5 rounded border border-[#2d3744]">
              <span className="text-[10px] text-slate-400 block">TOTAL CHANNEL DROP</span>
              <span className="font-bold text-[#e6edf3]">{totalDrop} m MSL</span>
            </div>
            <div className="bg-[#1c232d] p-1.5 rounded border border-[#2d3744]">
              <span className="text-[10px] text-slate-400 block">SURGE VELOCITY (MANNING)</span>
              <span className="font-bold text-[#0284c7]">4.8 m/s (17.3 km/h)</span>
            </div>
            <div className="bg-[#1c232d] p-1.5 rounded border border-[#2d3744]">
              <span className="text-[10px] text-slate-400 block">CREST ARRIVAL WINDOW</span>
              <span className="font-bold text-[#b45309]">1h 42m Downstream</span>
            </div>
            <div className="bg-[#1c232d] p-1.5 rounded border border-[#2d3744]">
              <span className="text-[10px] text-slate-400 block">SONAR HARDWARE TELEMETRY</span>
              <span className="font-bold text-[#15803d]">5 Nodes Synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
