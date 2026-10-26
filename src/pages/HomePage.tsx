import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { Scanner } from '../components/Scanner';
import { FeatureCard } from '../components/FeatureCard';
import { ScanResultData, ScanType } from '../types/scam';
import { ShieldCheck, AlertCircle, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import { NavItemKey } from '../components/Sidebar';

interface HomePageProps {
  onSelectTab: (tab: NavItemKey) => void;
  onSaveToHistory: (result: ScanResultData) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectTab,
  onSaveToHistory,
}) => {
  const [scannerType, setScannerType] = useState<ScanType>('url');

  const handleFeatureClick = (type: 'url' | 'message' | 'email' | 'analysis') => {
    if (type === 'analysis') {
      onSelectTab('scan');
    } else {
      setScannerType(type);
      const scannerEl = document.getElementById('main-scanner-section');
      if (scannerEl) {
        scannerEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Main Scanner Section */}
      <section id="main-scanner-section" className="scroll-mt-24">
        <Scanner
          key={scannerType}
          initialType={scannerType}
          onSaveToHistory={onSaveToHistory}
        />
      </section>

      {/* 3. Feature Cards (4 Glass Cards) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Multimodal Threat Analysis
            </h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Targeted heuristic inspection engines tailored for every digital vector.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('safety')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>Learn red flags</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            type="url"
            title="Website Scanner"
            description="Detect suspicious, typo-squatted, and fake corporate websites."
            onClick={() => handleFeatureClick('url')}
          />
          <FeatureCard
            type="message"
            title="Message Analyzer"
            description="Check SMS, WhatsApp, Telegram, and social messages for extortion."
            onClick={() => handleFeatureClick('message')}
          />
          <FeatureCard
            type="email"
            title="Email Checker"
            description="Analyze suspicious emails, fake invoices, and deceptive links."
            onClick={() => handleFeatureClick('email')}
          />
          <FeatureCard
            type="analysis"
            title="Real-time Analysis"
            description="Get detailed risk reports, domain indicators, and safety tips."
            onClick={() => handleFeatureClick('analysis')}
          />
        </div>
      </section>

      {/* 4. Live Scam Trends Banner */}
      <section className="rounded-2xl p-5 glass-panel-card border border-white/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Trending Threat Pattern (This Week)</h4>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                Postal parcel redelivery fee scams (SMS) spiking by +38% across North America.
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('safety')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            Review Protective Checklist →
          </button>
        </div>
      </section>
    </div>
  );
};
