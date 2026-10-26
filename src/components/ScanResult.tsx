import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScanResultData } from '../types/scam';
import {
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Bookmark,
  Copy,
  Check,
  Shield,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  Globe,
  Lock,
  Server,
  Zap,
} from 'lucide-react';

interface ScanResultProps {
  result: ScanResultData;
  onReset: () => void;
  onSaveToHistory: (result: ScanResultData) => void;
}

export const ScanResult: React.FC<ScanResultProps> = ({
  result,
  onReset,
  onSaveToHistory,
}) => {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUrlDetails, setShowUrlDetails] = useState(false);

  const isCritical = result.riskLevel === 'critical' || result.riskLevel === 'CRITICAL_RISK';
  const isHigh = result.riskLevel === 'high' || result.riskLevel === 'HIGH_RISK';
  const isSuspicious = result.riskLevel === 'suspicious' || result.riskLevel === 'SUSPICIOUS';
  const isLow = result.riskLevel === 'low';
  const isSafe = result.riskLevel === 'safe' || result.riskLevel === 'NO_KNOWN_THREAT';
  const isUnknown = result.riskLevel === 'UNKNOWN';

  // Score circle calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = result.riskScore !== null ? circumference - (result.riskScore / 100) * circumference : circumference;

  const getTheme = () => {
    if (isCritical) return {
      badgeBg: 'bg-red-50', badgeBorder: 'border-red-200', badgeText: 'text-red-700',
      badgeDot: 'bg-red-600', circleStroke: '#DC2626',
      cardBg: 'from-red-50/50 via-white/80 to-white/90', borderColor: 'border-red-200/80',
      accentShadow: 'shadow-red-500/10', iconBg: 'bg-red-100 text-red-600',
    };
    if (isHigh) return {
      badgeBg: 'bg-orange-50', badgeBorder: 'border-orange-200', badgeText: 'text-orange-700',
      badgeDot: 'bg-orange-500', circleStroke: '#EA580C',
      cardBg: 'from-orange-50/40 via-white/80 to-white/90', borderColor: 'border-orange-200/80',
      accentShadow: 'shadow-orange-500/10', iconBg: 'bg-orange-100 text-orange-600',
    };
    if (isSuspicious) return {
      badgeBg: 'bg-amber-50', badgeBorder: 'border-amber-200', badgeText: 'text-amber-700',
      badgeDot: 'bg-amber-500', circleStroke: '#D97706',
      cardBg: 'from-amber-50/40 via-white/80 to-white/90', borderColor: 'border-amber-200/80',
      accentShadow: 'shadow-amber-500/10', iconBg: 'bg-amber-100 text-amber-600',
    };
    if (isLow) return {
      badgeBg: 'bg-yellow-50', badgeBorder: 'border-yellow-200', badgeText: 'text-yellow-700',
      badgeDot: 'bg-yellow-500', circleStroke: '#CA8A04',
      cardBg: 'from-yellow-50/30 via-white/80 to-white/90', borderColor: 'border-yellow-200/80',
      accentShadow: 'shadow-yellow-500/10', iconBg: 'bg-yellow-100 text-yellow-600',
    };
    if (isUnknown) return {
      badgeBg: 'bg-slate-100', badgeBorder: 'border-slate-300', badgeText: 'text-slate-700',
      badgeDot: 'bg-slate-500', circleStroke: '#94A3B8',
      cardBg: 'from-slate-50/50 via-white/80 to-white/90', borderColor: 'border-slate-200/80',
      accentShadow: 'shadow-slate-500/10', iconBg: 'bg-slate-100 text-slate-600',
    };
    // Safe
    return {
      badgeBg: 'bg-emerald-50', badgeBorder: 'border-emerald-200', badgeText: 'text-emerald-700',
      badgeDot: 'bg-emerald-500', circleStroke: '#10B981',
      cardBg: 'from-emerald-50/40 via-white/80 to-white/90', borderColor: 'border-emerald-200/80',
      accentShadow: 'shadow-emerald-500/10', iconBg: 'bg-emerald-100 text-emerald-600',
    };
  };

  const theme = getTheme();

  const getRiskIcon = () => {
    if (isCritical || isHigh) return <AlertOctagon className="w-5 h-5 stroke-[2.2]" />;
    if (isSuspicious) return <AlertTriangle className="w-5 h-5 stroke-[2.2]" />;
    if (isLow) return <ShieldAlert className="w-5 h-5 stroke-[2.2]" />;
    if (isUnknown) return <Info className="w-5 h-5 stroke-[2.2]" />;
    return <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />;
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-red-50 text-red-600';
      case 'medium': return 'bg-amber-50 text-amber-600';
      case 'low': return 'bg-blue-50 text-blue-600';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const handleCopyReport = () => {
    const recs = result.recommendations?.join('\n• ') || result.recommendation;
    const text = `ScamLens Report — ${result.statusLabel} (${result.riskScore}/100)\nTarget: ${result.target}\nSummary: ${result.summary}\nSignals: ${result.detectedSignals.map((s) => s.title).join(', ')}\nRecommendations:\n• ${recs}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSaveToHistory(result);
    setSaved(true);
  };

  const urlDetails = result.sourceDetails?.urlAnalysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-b ${theme.cardBg} backdrop-blur-xl border ${theme.borderColor} shadow-xl ${theme.accentShadow} transition-all duration-300`}
    >
      {/* Analysis Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-wider uppercase">
            Heuristic Analysis
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {result.analyzedAt}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-colors ${
              saved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved' : 'Save Result'}</span>
          </button>
        </div>
      </div>

      {/* Target Preview */}
      <div className="mt-6 p-3.5 rounded-2xl bg-white/70 border border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-slate-400 font-semibold uppercase text-[10px] shrink-0">
            Target Scanned:
          </span>
          <span className="font-mono text-slate-800 truncate font-medium">
            {result.subject ? `Subject: "${result.subject}" — ` : ''}
            {result.target}
          </span>
        </div>
        <span className="text-slate-500 capitalize shrink-0 font-medium">
          Type: <strong className="text-slate-800">{result.type}</strong>
        </span>
      </div>

      {/* Main Score & Status Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Circular Score Gauge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/80 border border-white shadow-sm"
        >
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} className="stroke-slate-100" strokeWidth="9" fill="transparent" />
              <motion.circle
                cx="50" cy="50" r={radius}
                stroke={theme.circleStroke} strokeWidth="9"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="round" fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
                {result.riskScore !== null ? result.riskScore : '--'}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder}`}>
              <span className={`w-2 h-2 rounded-full ${theme.badgeDot}`} />
              {result.statusLabel}
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Risk Score</p>
          </div>

          {/* Categories */}
          {result.categories && result.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1 justify-center">
              {result.categories.filter(c => c !== 'No Threat Detected' && c !== 'Critical Risk').slice(0, 2).map((cat, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right: Summary & Recommendations */}
        <div className="md:col-span-8 flex flex-col gap-4">
          {/* AI Summary */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="rounded-2xl p-5 bg-white/80 border border-white shadow-xs"
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                {getRiskIcon()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-tight">Summary</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                  {result.summary}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Technical Signals */}
          {result.sourceDetails && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {result.sourceDetails.domainAge && (
                <div className="p-3 rounded-xl bg-white/60 border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold">Domain Age</span>
                  <span className="font-semibold text-slate-800 text-[11px] block truncate">{result.sourceDetails.domainAge}</span>
                </div>
              )}
              {result.sourceDetails.sslStatus && (
                <div className="p-3 rounded-xl bg-white/60 border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold">SSL / TLS</span>
                  <span className="font-semibold text-slate-800 text-[11px] truncate block">{result.sourceDetails.sslStatus}</span>
                </div>
              )}
              <div className="p-3 rounded-xl bg-white/60 border border-slate-100 text-xs col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block font-semibold">Urgency Triggers</span>
                <span className="font-semibold text-slate-800 text-[11px]">
                  {result.sourceDetails.urgencyMarkers ?? 0} detected
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* URL Analysis Details (URL scans only) */}
      {urlDetails && result.type === 'url' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-6"
        >
          <button
            onClick={() => setShowUrlDetails(!showUrlDetails)}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors mb-3"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>URL & Domain Analysis</span>
            {showUrlDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showUrlDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-white/80 border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold flex items-center gap-1"><Lock className="w-3 h-3"/>HTTPS</span>
                  <span className={`font-semibold text-[11px] ${urlDetails.httpsEnabled ? 'text-emerald-700' : 'text-red-600'}`}>
                    {urlDetails.httpsLabel || (urlDetails.httpsEnabled ? 'Enabled' : 'Not Available')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold">Redirects</span>
                  <span className={`font-semibold text-[11px] ${urlDetails.redirectsDetected ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {urlDetails.redirectsDetected === undefined ? 'Not available' : urlDetails.redirectsDetected ? 'Detected' : 'None detected'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold flex items-center gap-1"><Server className="w-3 h-3"/>Server</span>
                  <span className="font-semibold text-slate-800 text-[11px] block truncate">{result.sourceDetails?.serverLocation || 'Not available'}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold">Brand Similarity</span>
                  <span className="font-semibold text-slate-800 text-[11px] block truncate">{urlDetails.brandSimilarity || 'Not available'}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold">Reputation</span>
                  <span className="font-semibold text-slate-800 text-[11px] block truncate">{urlDetails.reputation || 'Not available'}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold">Content Signals</span>
                  <span className="font-semibold text-slate-800 text-[11px] block truncate">{urlDetails.contentSignals || 'Not available'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Detected Signals Section */}
      <div className="mt-8">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-slate-400" />
          <span>Detected Signals</span>
          <span className="text-slate-400 font-normal">({result.detectedSignals.length})</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.detectedSignals.map((signal, idx) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.06, duration: 0.3 }}
              className="p-4 rounded-2xl bg-white/80 border border-slate-100 hover:border-slate-200 transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-xs font-bold text-slate-900">{signal.title}</h5>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${getSeverityStyle(signal.severity)}`}>
                  {signal.severity}
                </span>
              </div>
              {signal.category && (
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{signal.category}</span>
              )}
              <p className="text-xs text-slate-500 mt-1.5 leading-normal font-normal">
                {signal.description}
              </p>
              {signal.evidence && (
                <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-mono leading-snug">{signal.evidence}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {(result.recommendations?.length > 0 || result.recommendation) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-8 rounded-2xl p-5 bg-white/80 border border-white shadow-xs"
        >
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Recommended Actions</span>
          </h4>
          <ul className="space-y-2">
            {(result.recommendations?.length > 0
              ? result.recommendations
              : [result.recommendation]
            ).map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Sources & Transparency */}
      {result.sources && result.sources.length > 0 && (
        <div className="mt-8 rounded-2xl p-5 bg-slate-50 border border-slate-100">
           <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
             Analysis Sources
           </h4>
           <div className="space-y-2">
             {result.sources.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <span className={`w-2 h-2 rounded-full ${s.status === 'checked' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="font-semibold text-slate-700">{s.name}</span>
                  <span className="text-slate-500">— {s.status === 'checked' ? 'Checked just now' : 'Analysis unavailable'}</span>
                </div>
             ))}
           </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="mt-8 pt-6 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500 font-medium">
          Reference ID: <code className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">{result.id.slice(0, 14)}</code>
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Scan Another</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
