import React, { useState } from 'react';
import { Sliders, Zap, RotateCcw } from 'lucide-react';

interface SimulationSandboxProps {
  onApplySimulation: (simRain24h: number, simRain72h: number) => void;
  onReset: () => void;
}

export const SimulationSandbox: React.FC<SimulationSandboxProps> = ({
  onApplySimulation,
  onReset
}) => {
  const [rain24h, setRain24h] = useState<number>(120);
  const [rain72h, setRain72h] = useState<number>(180);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    onApplySimulation(rain24h, rain72h);
    setTimeout(() => setIsSimulating(false), 600);
  };

  const handlePresetCloudburst = () => {
    setRain24h(195);
    setRain72h(260);
    onApplySimulation(195, 260);
  };

  const handlePresetDry = () => {
    setRain24h(10);
    setRain72h(25);
    onApplySimulation(10, 25);
  };

  return (
    <div className="bg-tactical-surface border border-tactical-border rounded-xl p-4 shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-tactical-border pb-2.5">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="font-display font-bold text-sm text-white">
            Hydrological Cloudburst Simulation Sandbox
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
          Interactive What-If Engine
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
        {/* 24h Rain Slider */}
        <div className="space-y-1.5 bg-tactical-card p-3 rounded-lg border border-tactical-border">
          <div className="flex justify-between text-slate-300">
            <span>24h Cloudburst Rainfall:</span>
            <strong className="text-cyan-400 text-sm">{rain24h} mm</strong>
          </div>
          <input
            type="range"
            min="0"
            max="250"
            step="5"
            value={rain24h}
            onChange={(e) => setRain24h(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
            aria-label="Simulated 24-hour rainfall in millimeters"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 mm (Dry)</span>
            <span>100 mm (Heavy)</span>
            <span className="text-red-400 font-bold">250 mm (Extreme Cloudburst)</span>
          </div>
        </div>

        {/* 72h Rain Slider */}
        <div className="space-y-1.5 bg-tactical-card p-3 rounded-lg border border-tactical-border">
          <div className="flex justify-between text-slate-300">
            <span>72h Antecedent Saturation:</span>
            <strong className="text-blue-400 text-sm">{rain72h} mm</strong>
          </div>
          <input
            type="range"
            min="0"
            max="350"
            step="10"
            value={rain72h}
            onChange={(e) => setRain72h(Number(e.target.value))}
            className="w-full accent-blue-400 cursor-pointer"
            aria-label="Simulated 72-hour antecedent rainfall in millimeters"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 mm (Normal)</span>
            <span>150 mm (Saturated)</span>
            <span className="text-purple-400 font-bold">350 mm (Super-Saturated)</span>
          </div>
        </div>
      </div>

      {/* Preset Buttons & Apply Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePresetCloudburst}
            className="px-2.5 py-1.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 flex items-center gap-1 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Preset: Cloudburst (195mm)</span>
          </button>
          <button
            onClick={handlePresetDry}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            <span>Preset: Dry Monsoon (10mm)</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            title="Reset Simulation to Live Feeds"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-black font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Computing Hydro-Model...' : 'Apply Simulation across Map'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
