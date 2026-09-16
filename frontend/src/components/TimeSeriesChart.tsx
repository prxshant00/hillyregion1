import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { TimeSeriesPoint } from '../types';
import { Table } from 'lucide-react';

interface ChartProps {
  points: TimeSeriesPoint[];
  wardName: string;
}

export const TimeSeriesChart: React.FC<ChartProps> = ({ points, wardName }) => {
  const { t } = useTranslation();
  const [showRainfall, setShowRainfall] = useState<boolean>(true);
  const [showRiskScore, setShowRiskScore] = useState<boolean>(true);
  const [showRiverLevel, setShowRiverLevel] = useState<boolean>(true);
  const [showTable, setShowTable] = useState<boolean>(false);

  return (
    <div className="tactical-glass hud-bracket rounded-xl p-5 shadow-2xl border border-cyan-500/20 space-y-4">
      {/* Header & Series Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-tactical-border pb-3">
        <div>
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            {t('rainfall_chart_title')}
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              48h Telemetry
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Catchment: <strong className="text-cyan-400">{wardName}</strong> • Dynamic Hydrograph
          </p>
        </div>

        {/* Action Controls: Table View & Series Toggles */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          {/* Rainfall Toggle */}
          <button
            onClick={() => setShowRainfall(!showRainfall)}
            className={`px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1.5 ${
              showRainfall
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900 border-slate-700 text-slate-500 line-through'
            }`}
            aria-pressed={showRainfall}
            aria-label="Toggle Rainfall Series"
          >
            <span className="w-2 h-2 rounded-sm bg-cyan-400" />
            <span>Rain (mm)</span>
          </button>

          {/* Risk Score Toggle */}
          <button
            onClick={() => setShowRiskScore(!showRiskScore)}
            className={`px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1.5 ${
              showRiskScore
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900 border-slate-700 text-slate-500 line-through'
            }`}
            aria-pressed={showRiskScore}
            aria-label="Toggle Risk Score Series"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Risk Score</span>
          </button>

          {/* River Level Toggle */}
          <button
            onClick={() => setShowRiverLevel(!showRiverLevel)}
            className={`px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1.5 ${
              showRiverLevel
                ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                : 'bg-slate-900 border-slate-700 text-slate-500 line-through'
            }`}
            aria-pressed={showRiverLevel}
            aria-label="Toggle River Stage Series"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>River (cm)</span>
          </button>

          {/* Accessible Table Alternative */}
          <button
            onClick={() => setShowTable(!showTable)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1 transition-all"
            aria-expanded={showTable}
            aria-label="Toggle Data Table Alternative for Screen Readers"
            title="Accessible Tabular View"
          >
            <Table className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showTable ? 'Hide Table' : 'Data Table'}</span>
          </button>
        </div>
      </div>

      {/* Accessible Table View Alternative (WCAG 1.3.1) */}
      {showTable ? (
        <div className="overflow-x-auto max-h-[280px] rounded-lg border border-slate-800 font-mono text-xs animate-fadeIn">
          <table className="w-full text-left border-collapse" aria-label={`Hydrograph Data for ${wardName}`}>
            <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800">
              <tr>
                <th className="p-2.5">Time</th>
                <th className="p-2.5 text-cyan-400">Rainfall (mm)</th>
                <th className="p-2.5 text-amber-400">Risk Score (0-100)</th>
                <th className="p-2.5 text-blue-400">River Stage (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
              {points.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-900/80 transition-colors">
                  <td className="p-2 text-slate-300">{p.timestamp}</td>
                  <td className="p-2 font-bold text-white">{p.rainfall_mm.toFixed(1)}</td>
                  <td className="p-2 font-bold text-amber-300">{p.risk_score.toFixed(1)}</td>
                  <td className="p-2 text-cyan-300">{p.water_level_cm ? `${p.water_level_cm.toFixed(1)} cm` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Recharts Visual Composed Hydrograph */
        <div className="w-full h-[280px]" role="img" aria-label={`Hydrograph chart for ${wardName}`}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="timestamp"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#38bdf8"
                fontSize={11}
                tickLine={false}
                domain={[0, 500]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#38bdf8',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#f8fafc',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.8)'
                }}
              />
              {showRainfall && (
                <Bar
                  yAxisId="left"
                  dataKey="rainfall_mm"
                  name="Rainfall (mm)"
                  fill="#06b6d4"
                  opacity={0.65}
                  radius={[3, 3, 0, 0]}
                />
              )}
              {showRiskScore && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="risk_score"
                  name="Risk Score"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#f59e0b', stroke: '#ffffff' }}
                />
              )}
              {showRiverLevel && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="water_level_cm"
                  name="River Level (cm)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
