import React from 'react';
import { GlassShieldVisual } from './GlassShieldVisual';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onScrollToScanner?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToScanner }) => {
  return (
    <section className="relative pt-6 pb-10 md:pt-10 md:pb-14 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Typography & Narrative */}
        <div className="lg:col-span-7 flex flex-col items-start">
          {/* Small pill / kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 backdrop-blur-md text-blue-600 text-xs font-semibold shadow-xs mb-5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin duration-3000" />
            <span>AI-Powered Scam Detection</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12] text-balance">
            See the scam <br />
            before <span className="text-blue-600">it sees you.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
            Analyze websites, messages, emails and links with AI to detect fraud, phishing and
            online scams. Stay safe, stay informed.
          </p>

          {/* Quick Stats / Trust Markers */}
          <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Instant Heuristic Scoring</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Zero-Storage Privacy Model</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-600 font-bold">100%</span>
              <span>Free Community Shield</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Glass Shield + Lens */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <GlassShieldVisual />
        </div>
      </div>
    </section>
  );
};
