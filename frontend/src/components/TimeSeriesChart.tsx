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
    <div className="tactical-chassis p-4 bg-[#1c232d] border border-[#2d3744] rounded space-y-3 text-left">
      {/* Header & Series Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#2d3744] pb-2.5">
        <div>
          <h3 className="font-display font-bold text-base text-[#e6edf3] flex items-center gap-2">
            {t('rainfall_chart_title')}
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#212934] text-slate-300 border border-[#2d3744]">
              48h Hydrograph
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Catchment: <strong className="text-[#e6edf3]">{wardName}</strong> • Discharge & Rainfall Runoff
          </p>
        </div>

        {/* Action Controls: Table View & Series Toggles */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs font-mono">
          {/* Rainfall Toggle */}
          <button
            onClick={() => setShowRainfall(!showRainfall)}
            className={`px-2 py-1 rounded border transition-colors flex items-center space-x-1.5 ${
              showRainfall
                ? 'bg-[#212934] border-[#0284c7] text-[#0284c7]'
                : 'bg-[#161b22] border-[#2d3744] text-slate-500 line-through'
            }`}
            aria-pressed={showRainfall}
            aria-label="Toggle Rainfall Series"
          >
            <span className="w-2 h-2 rounded-sm bg-[#0284c7]" />
            <span>Rain (mm)</span>
          </button>

          {/* Risk Score Toggle */}
          <button
            onClick={() => setShowRiskScore(!showRiskScore)}
            className={`px-2 py-1 rounded border transition-colors flex items-center space-x-1.5 ${
              showRiskScore
                ? 'bg-[#212934] border-[#b45309] text-[#b45309]'
                : 'bg-[#161b22] border-[#2d3744] text-slate-500 line-through'
            }`}
            aria-pressed={showRiskScore}
            aria-label="Toggle Risk Score Series"
          >
            <span className="w-2 h-2 rounded-full bg-[#b45309]" />
            <span>Risk Index</span>
          </button>

          {/* River Level Toggle */}
          <button
            onClick={() => setShowRiverLevel(!showRiverLevel)}
            className={`px-2 py-1 rounded border transition-colors flex items-center space-x-1.5 ${
              showRiverLevel
                ? 'bg-[#212934] border-[#38bdf8] text-[#38bdf8]'
                : 'bg-[#161b22] border-[#2d3744] text-slate-500 line-through'
            }`}
            aria-pressed={showRiverLevel}
            aria-label="Toggle River Stage Series"
          >
            <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
            <span>River (cm)</span>
          </button>

          {/* Accessible Table Alternative */}
          <button
            onClick={() => setShowTable(!showTable)}
            className="px-2 py-1 rounded bg-[#212934] hover:bg-[#2d3744] text-slate-300 border border-[#2d3744] flex items-center space-x-1 transition-colors"
            aria-expanded={showTable}
            aria-label="Toggle Data Table Alternative for Screen Readers"
            title="Accessible Tabular View"
          >
            <Table className="w-3.5 h-3.5 text-slate-400" />
            <span>{showTable ? 'Chart View' : 'Table View'}</span>
          </button>
        </div>
      </div>

      {/* Accessible Table View Alternative (WCAG 1.3.1) */}
      {showTable ? (
        <div className="overflow-x-auto max-h-[260px] rounded border border-[#2d3744] font-mono text-xs animate-fadeIn">
          <table className="w-full text-left border-collapse" aria-label={`Hydrograph Data for ${wardName}`}>
            <thead className="bg-[#161b22] text-slate-400 sticky top-0 border-b border-[#2d3744]">
              <tr>
                <th className="p-2">Time</th>
                <th className="p-2 text-[#0284c7]">Rainfall (mm)</th>
                <th className="p-2 text-[#b45309]">Risk Index (0-100)</th>
                <th className="p-2 text-[#38bdf8]">River Stage (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d3744] bg-[#1c232d]">
              {points.map((p, idx) => (
                <tr key={idx} className="hover:bg-[#212934] transition-colors">
                  <td className="p-2 text-slate-300">{p.timestamp}</td>
                  <td className="p-2 font-bold text-[#e6edf3]">{p.rainfall_mm.toFixed(1)}</td>
                  <td className="p-2 font-bold text-[#b45309]">{p.risk_score.toFixed(1)}</td>
                  <td className="p-2 text-[#38bdf8]">{p.water_level_cm ? `${p.water_level_cm.toFixed(1)} cm` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Recharts Visual Composed Hydrograph */
        <div className="w-full h-[260px]" role="img" aria-label={`Hydrograph chart for ${wardName}`}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3744" vertical={false} />
              <XAxis
                dataKey="timestamp"
                stroke="#8b949e"
                fontSize={11}
                tickLine={false}
                minTickGap={24}
                fontFamily="JetBrains Mono"
              />
              <YAxis
                yAxisId="left"
                stroke="#8b949e"
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
                fontFamily="JetBrains Mono"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#38bdf8"
                fontSize={11}
                tickLine={false}
                domain={[0, 500]}
                fontFamily="JetBrains Mono"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161b22',
                  borderColor: '#2d3744',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#e6edf3',
                  fontFamily: 'JetBrains Mono',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
                }}
              />
              {showRainfall && (
                <Bar
                  yAxisId="left"
                  dataKey="rainfall_mm"
                  name="Rainfall (mm)"
                  fill="#0284c7"
                  opacity={0.7}
                  radius={[2, 2, 0, 0]}
                />
              )}
              {showRiskScore && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="risk_score"
                  name="Risk Score"
                  stroke="#b45309"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#b45309', stroke: '#e6edf3' }}
                />
              )}
              {showRiverLevel && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="water_level_cm"
                  name="River Level (cm)"
                  stroke="#38bdf8"
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
