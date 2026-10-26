import React, { useState } from 'react';
import { HistoryItem } from '../types/scam';
import {
  Clock,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  X,
} from 'lucide-react';
import { NavItemKey } from '../components/Sidebar';

interface HistoryPageProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onSelectTab: (tab: NavItemKey) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  onClearHistory,
  onSelectTab,
}) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const filterOptions = ['All', 'Website', 'Message', 'Email', 'Text'];

  const filteredHistory = history.filter((item) => {
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesSearch =
      item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.risk.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getRiskBadge = (risk: HistoryItem['risk']) => {
    switch (risk) {
      case 'Critical Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            Critical Risk
          </span>
        );
      case 'High Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            High Risk
          </span>
        );
      case 'Suspicious':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Suspicious
          </span>
        );
      case 'Low Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            Low Risk
          </span>
        );
      case 'No Known Threat':
      case 'Safe':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {risk}
          </span>
        );
      case 'Unknown':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Unknown
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/50">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Scan History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Local log of recent threat evaluations, risk indices, and signal reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          )}
          <button
            onClick={() => onSelectTab('scan')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <span>+ New Scan</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Filters */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 backdrop-blur-md overflow-x-auto scrollbar-none">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilterType(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === opt
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Search inside history */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search targets or risk..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* History Table / Card Container */}
      <div className="rounded-2xl glass-panel-card border border-white/90 shadow-sm overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="py-16 text-center">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">No scan records found</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? 'Try adjusting your search filter or clear query.'
                : 'Scanned links, messages, and emails will automatically be stored here.'}
            </p>
            <button
              onClick={() => onSelectTab('scan')}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Run First Scan
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Target Scanned</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs sm:max-w-sm truncate">
                      {item.target}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getRiskBadge(item.risk)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 tabular-nums">
                      {item.score}/100
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">{item.date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Item Modal Detail Inspector */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel-card p-6 shadow-2xl border border-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Historical Scan Record</span>
                <span className="text-[10px] text-slate-400">· {selectedItem.date}</span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Target</span>
                <p className="text-xs font-mono text-slate-800 mt-1 p-2 rounded-xl bg-slate-50 border border-slate-100 break-all">
                  {selectedItem.target}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Classification</span>
                  <div className="mt-1">{getRiskBadge(selectedItem.risk)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Risk Score</span>
                  <span className="text-sm font-mono font-bold text-slate-900 mt-1 block">
                    {selectedItem.score !== null ? `${selectedItem.score} / 100` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs">
                <h5 className="font-bold text-blue-900">Heuristic Signals Logged</h5>
                <p className="text-blue-700 mt-1">
                  This record captured {selectedItem.signalsCount} threat indicators including domain age flags, pressure wording, and deceptive redirect URLs.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Mock audit record</span>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
