import React, { useState } from 'react';
import { Scanner } from '../components/Scanner';
import { ScanResultData, ScanType } from '../types/scam';
import { ShieldCheck, Info, Sparkles, AlertCircle, History, Bookmark } from 'lucide-react';
import { SCAN_EXAMPLES } from '../data/mockData';
import { NavItemKey } from '../components/Sidebar';

interface ScanPageProps {
  onSaveToHistory: (result: ScanResultData) => void;
  onSelectTab: (tab: NavItemKey) => void;
}

export const ScanPage: React.FC<ScanPageProps> = ({
  onSaveToHistory,
  onSelectTab,
}) => {
  const [selectedType, setSelectedType] = useState<ScanType>('url');

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/50">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Threat Scanner Workbench
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Simulate and inspect URLs, phishing SMS, spoofed emails, and deceptive social engineering scripts.
          </p>
        </div>

        <button
          onClick={() => onSelectTab('history')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors shrink-0"
        >
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>View Scan History</span>
        </button>
      </div>

      {/* Main Scanner Container */}
      <Scanner
        initialType={selectedType}
        onSaveToHistory={onSaveToHistory}
      />

      {/* Inspection Methodology Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel-card">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mb-3">
            01
          </div>
          <h4 className="text-xs font-bold text-slate-900">Domain Reputation & WHOIS</h4>
          <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
            Checks domain registration date, registrar provenance, SSL certificate validity, and known hosting telemetry.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel-card">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs mb-3">
            02
          </div>
          <h4 className="text-xs font-bold text-slate-900">Psychological Urgency Heuristics</h4>
          <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
            Detects coercive pressure keywords, counterfeit law enforcement claims, and artificial expiration deadlines.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel-card">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs mb-3">
            03
          </div>
          <h4 className="text-xs font-bold text-slate-900">Credential & Payment Traps</h4>
          <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
            Flags unauthorized requests for banking credentials, OTPs, SSNs, credit card verification, or wire transfers.
          </p>
        </div>
      </div>
    </div>
  );
};
