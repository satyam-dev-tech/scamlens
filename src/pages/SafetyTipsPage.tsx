import React, { useState } from 'react';
import { SAFETY_TIPS } from '../data/mockData';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  HelpCircle,
  Eye,
} from 'lucide-react';

export const SafetyTipsPage: React.FC = () => {
  // Interactive Scam Spotter demo
  const [revealedFlags, setRevealedFlags] = useState<Record<string, boolean>>({});

  const toggleFlag = (flagId: string) => {
    setRevealedFlags((prev) => ({
      ...prev,
      [flagId]: !prev[flagId],
    }));
  };

  const interactiveFlags = [
    {
      id: 'f1',
      phrase: 'URGENT NOTICE:',
      reason: 'Urgency Trap: Forces panic and immediate compliance before thinking.',
    },
    {
      id: 'f2',
      phrase: 'bankofarnenca-verify.net',
      reason: 'Lookalike Domain: Subtle letter replacement ("rn" resembles "m").',
    },
    {
      id: 'f3',
      phrase: 'Provide your 6-digit OTP code',
      reason: 'Credential Theft: Legitimate banks never solicit 2FA passwords over SMS.',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200/50">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-3 border border-blue-200/60">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Cyber Hygiene Academy</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Stay Ahead of Scams
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 max-w-2xl">
          Learn how to recognize psychological traps, domain spoofing, and social engineering patterns before they compromise your data.
        </p>
      </div>

      {/* Interactive Scam Spotter Practice Lab */}
      <div className="rounded-3xl p-6 sm:p-8 glass-panel-card border border-white/90 shadow-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Eye className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Interactive Red-Flag Spotter
              </h3>
              <p className="text-[11px] text-slate-400">
                Click on the highlighted suspect areas in this simulated SMS to reveal why they are dangerous.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            Interactive Test
          </span>
        </div>

        {/* Simulated Phone Message Bubble */}
        <div className="mt-5 p-5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-700">From:</span>
            <span>+1 (800) 912-3841 (Unknown Sender)</span>
          </div>

          <p className="text-sm text-slate-800 leading-relaxed font-sans">
            <button
              onClick={() => toggleFlag('f1')}
              className={`font-bold transition-all px-1 rounded ${
                revealedFlags['f1']
                  ? 'bg-red-100 text-red-700 underline'
                  : 'bg-amber-100/70 text-amber-900 hover:bg-amber-200'
              }`}
            >
              URGENT NOTICE:
            </button>{' '}
            Your checking account has been placed on hold due to unauthorized logins. Log in immediately to verify ownership at{' '}
            <button
              onClick={() => toggleFlag('f2')}
              className={`font-mono text-xs transition-all px-1 rounded ${
                revealedFlags['f2']
                  ? 'bg-red-100 text-red-700 underline font-bold'
                  : 'bg-blue-100/70 text-blue-900 hover:bg-blue-200'
              }`}
            >
              https://bankofarnenca-verify.net
            </button>{' '}
            and{' '}
            <button
              onClick={() => toggleFlag('f3')}
              className={`font-semibold transition-all px-1 rounded ${
                revealedFlags['f3']
                  ? 'bg-red-100 text-red-700 underline'
                  : 'bg-amber-100/70 text-amber-900 hover:bg-amber-200'
              }`}
            >
              Provide your 6-digit OTP code
            </button>{' '}
            to restore normal service.
          </p>
        </div>

        {/* Revealed Insights */}
        <div className="mt-4 max-w-xl mx-auto space-y-2">
          {interactiveFlags.map((flag) =>
            revealedFlags[flag.id] ? (
              <div
                key={flag.id}
                className="p-3 rounded-xl bg-red-50/70 border border-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
              >
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-900 font-bold">{flag.phrase}</strong>
                  <p className="text-red-700 mt-0.5">{flag.reason}</p>
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Core Safety Guidelines Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Core Protective Guidelines
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SAFETY_TIPS.map((tip, idx) => (
            <div
              key={tip.id}
              className="p-6 rounded-2xl glass-panel-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="font-semibold text-blue-600 uppercase text-[10px] tracking-wider">
                    {tip.category}
                  </span>
                  <span className="font-mono text-[11px]">0{idx + 1}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                  {tip.title}
                </h4>
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  {tip.subtitle}
                </p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-normal">
                  {tip.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-600">
                  {tip.actionText}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
