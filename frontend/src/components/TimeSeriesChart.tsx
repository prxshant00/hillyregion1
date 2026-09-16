import React from 'react';
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

interface ChartProps {
  points: TimeSeriesPoint[];
  wardName: string;
}

export const TimeSeriesChart: React.FC<ChartProps> = ({ points, wardName }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-tactical-surface border border-tactical-border rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-display font-semibold text-base text-white">
            {t('rainfall_chart_title')}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Ward: <strong className="text-cyan-400">{wardName}</strong> • Real-time Hydrograph
          </p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
            <span className="text-slate-300">Rainfall (mm)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-300">Risk Score (0-100)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-slate-300">{t('river_level')} (cm)</span>
          </div>
        </div>
      </div>

      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="timestamp"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              minTickGap={20}
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
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#f8fafc'
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="rainfall_mm"
              name="Rainfall (mm)"
              fill="#06b6d4"
              opacity={0.6}
              radius={[2, 2, 0, 0]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="risk_score"
              name="Risk Score"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#f59e0b' }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="water_level_cm"
              name="River Gauge (cm)"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
