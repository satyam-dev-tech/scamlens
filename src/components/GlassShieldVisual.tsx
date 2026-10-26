import React from 'react';
import { Shield, Search, Lock, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';

export const GlassShieldVisual: React.FC = () => {
  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto flex items-center justify-center select-none">
      {/* Soft Blue Atmospheric Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/15 via-sky-400/20 to-indigo-500/10 rounded-full blur-3xl transform scale-90 -z-10" />

      {/* Outer concentric refractive glass rings */}
      <div className="absolute w-[360px] h-[360px] rounded-full border border-blue-400/20 bg-gradient-to-br from-white/40 via-white/10 to-blue-50/20 backdrop-blur-sm -z-10 animate-pulse duration-1000" />
      <div className="absolute w-[300px] h-[300px] rounded-full border border-white/60 bg-white/20 backdrop-blur-md shadow-[0_8px_32px_0_rgba(37,99,235,0.08)] -z-10" />

      {/* Main Glass Shield Core */}
      <div className="relative w-56 h-64 rounded-3xl p-1 bg-gradient-to-b from-white/90 via-white/50 to-blue-50/60 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_rgba(37,99,235,0.14)] flex flex-col items-center justify-center overflow-hidden">
        {/* Specular sheen / glass reflection highlight */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-gradient-to-br from-white/80 via-white/20 to-transparent rounded-full transform -rotate-12 pointer-events-none" />

        {/* Floating Security Emblem */}
        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white transform hover:scale-105 transition-transform duration-300">
          <Shield className="w-12 h-12 stroke-[1.75]" />
          {/* Internal Lock Badge */}
          <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-md border border-blue-100">
            <Lock className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>

        {/* Shield Subtext */}
        <div className="mt-4 text-center">
          <div className="text-xs font-semibold text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Active Guardian</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Real-Time Threat Analysis</p>
        </div>

        {/* Bottom subtle grid line */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
      </div>

      {/* Floating 3D Optical Magnifying Lens */}
      <div className="absolute -bottom-2 -right-2 md:bottom-2 md:right-2 w-36 h-36 rounded-full p-2 bg-gradient-to-tr from-white/90 via-sky-50/60 to-white/70 backdrop-blur-2xl border border-white/90 shadow-[0_16px_36px_rgba(15,23,42,0.12)] flex items-center justify-center transform hover:rotate-6 transition-transform duration-300">
        {/* Inner Lens Glass Rim */}
        <div className="w-full h-full rounded-full border-2 border-blue-400/40 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-transparent to-sky-400/10">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/70 rounded-full blur-xs pointer-events-none" />
          <div className="relative flex items-center justify-center text-blue-600">
            <Search className="w-10 h-10 stroke-[2.2]" />
            <Eye className="w-4 h-4 absolute text-blue-700" />
          </div>
          <span className="text-[10px] font-bold tracking-wider text-blue-800 mt-1 uppercase">Scan Lens</span>
        </div>
      </div>

      {/* Floating Pill Trust Indicators */}
      <div className="absolute top-4 -left-4 sm:-left-6 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-md shadow-blue-500/5 flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-700">99.8% Heuristic Accuracy</span>
      </div>

      <div className="absolute -top-3 right-6 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-white shadow-md shadow-blue-500/5 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-700">Zero-Day Detection</span>
      </div>
    </div>
  );
};
