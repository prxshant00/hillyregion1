import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Printer, ShieldAlert, FileSpreadsheet } from 'lucide-react';
import { SitRepData } from '../types';

interface SitRepModalProps {
  isOpen: boolean;
  onClose: () => void;
  sitrep: SitRepData | null;
}

export const SitRepModal: React.FC<SitRepModalProps> = ({ isOpen, onClose, sitrep }) => {
  const { t } = useTranslation();

  if (!isOpen || !sitrep) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sitrep, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${sitrep.sitrep_number}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sitrep-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-tactical-surface border border-tactical-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:w-full print:border-none print:shadow-none">
        {/* Header */}
        <div className="p-5 border-b border-tactical-border flex items-center justify-between bg-tactical-card print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 id="sitrep-title" className="font-display font-bold text-lg text-white">
                Tactical Situation Report (SITREP)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {sitrep.sitrep_number} • {sitrep.reporting_agency}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportJSON}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition-all"
              title="Export Raw JSON"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs flex items-center gap-1.5 transition-all"
              title="Print Official SITREP"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print SITREP</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 overflow-y-auto space-y-5 print:p-0 print:text-black font-mono text-xs leading-relaxed">
          {/* Official Document Banner */}
          <div className="border-b-2 border-slate-700 pb-3 flex justify-between items-start">
            <div>
              <div className="font-bold text-base uppercase tracking-wider text-white print:text-black">
                NATIONAL DISASTER RESPONSE FORCE (NDRF) / HIMACHAL PRADESH SDMA
              </div>
              <div className="text-xs text-slate-400 print:text-gray-600">
                Early Warning Operations Command • {sitrep.operation_codename}
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400 print:text-gray-600">
              <div>Ref: <strong>{sitrep.sitrep_number}</strong></div>
              <div>Generated: {new Date(sitrep.timestamp).toLocaleString()}</div>
            </div>
          </div>

          {/* KPI Matrix Table */}
          <div>
            <div className="font-bold text-xs uppercase text-cyan-300 print:text-black mb-2">
              1. REGIONAL THREAT STATUS & SUMMARY
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-tactical-card p-3 rounded-lg border border-tactical-border print:border-gray-400">
                <span className="text-slate-400 text-[10px]">TOTAL WARDS MONITORED</span>
                <div className="text-xl font-bold text-white print:text-black">{sitrep.summary_statistics.total_monitored_wards}</div>
              </div>
              <div className="bg-red-950/40 p-3 rounded-lg border border-red-800/80 print:border-gray-400">
                <span className="text-red-300 text-[10px]">CRITICAL / WARNING WARDS</span>
                <div className="text-xl font-bold text-red-400 print:text-red-700">{sitrep.summary_statistics.critical_warning_count}</div>
              </div>
              <div className="bg-cyan-950/40 p-3 rounded-lg border border-cyan-800/80 print:border-gray-400">
                <span className="text-cyan-300 text-[10px]">AVG WARNING LEAD TIME</span>
                <div className="text-xl font-bold text-cyan-400 print:text-black">3.8 hrs</div>
              </div>
              <div className="bg-tactical-card p-3 rounded-lg border border-tactical-border print:border-gray-400">
                <span className="text-slate-400 text-[10px]">ACTIVE IOT GAUGES</span>
                <div className="text-xl font-bold text-emerald-400 print:text-black">4 Nodes</div>
              </div>
            </div>
          </div>

          {/* Critical Wards Roster */}
          <div>
            <div className="font-bold text-xs uppercase text-amber-300 print:text-black mb-2">
              2. HIGH RISK WARDS REQUIRING IMMEDIATE EARLY WARNING / MONITORING
            </div>
            <div className="border border-tactical-border rounded-lg overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-900 border-b border-tactical-border text-slate-400">
                  <tr>
                    <th className="p-2.5">Ward / Tehsil</th>
                    <th className="p-2.5">District</th>
                    <th className="p-2.5">Risk Score</th>
                    <th className="p-2.5">Alert Level</th>
                    <th className="p-2.5">Est. Lead Time</th>
                    <th className="p-2.5">24h Rain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sitrep.critical_wards_details.map(w => (
                    <tr key={w.ward_id} className="hover:bg-slate-800/50">
                      <td className="p-2.5 font-bold text-white print:text-black">{w.ward_name} ({w.ward_id})</td>
                      <td className="p-2.5 text-slate-300">{w.district}</td>
                      <td className="p-2.5 font-bold text-red-400">{w.risk_score.toFixed(1)}/100</td>
                      <td className="p-2.5 font-bold uppercase text-red-300">{w.alert_level}</td>
                      <td className="p-2.5 text-cyan-300 font-bold">{w.lead_time_hours.toFixed(1)} hrs</td>
                      <td className="p-2.5 text-slate-200">{w.rainfall_current_24h.toFixed(1)} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Action Directives */}
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="font-bold text-xs uppercase text-cyan-300 print:text-black">
              3. NDRF DEPLOYMENT DIRECTIVES & CONTACTS
            </div>
            <p className="text-slate-300 leading-relaxed">
              1. 14th Bn NDRF quick-reaction teams to stage rubberized rescue boats and winch systems near Beas / Parbati confluence.<br/>
              2. District Emergency Operations Centers (DEOCs) to broadcast Hindi/English siren and SMS directives to all registered phone numbers in Thunag, Manikaran, and Khaniyara.<br/>
              3. Emergency Toll-Free Helpline: <strong>1077 (District EOC)</strong> / <strong>112 (National Unified Helpline)</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-tactical-border bg-tactical-card flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
