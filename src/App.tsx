import React, { useState } from 'react';
import { Sidebar, NavItemKey } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { HomePage } from './pages/HomePage';
import { ScanPage } from './pages/ScanPage';
import { HistoryPage } from './pages/HistoryPage';
import { SafetyTipsPage } from './pages/SafetyTipsPage';
import { SettingsPage } from './pages/SettingsPage';
import { MOCK_HISTORY } from './data/mockData';
import { HistoryItem, ScanResultData, getRiskLabel } from './types/scam';
import { Home, Search, Clock, ShieldCheck, Settings, Shield } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavItemKey>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(MOCK_HISTORY);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveToHistory = (result: ScanResultData) => {
    const typeLabel: HistoryItem['type'] =
      result.type === 'url' ? 'Website'
      : result.type === 'message' ? 'Message'
      : result.type === 'email' ? 'Email'
      : 'Text';

    const newItem: HistoryItem = {
      id: 'hist-' + Date.now(),
      target: result.target,
      type: typeLabel,
      risk: result.statusLabel || 'Unknown',
      score: result.riskScore,
      date: 'Just now',
      signalsCount: result.detectedSignals.length,
    };

    setHistory((prev) => [newItem, ...prev]);
    showToast(`Saved "${result.target.slice(0, 28)}" to Scan History`);
  };

  const handleClearHistory = () => {
    setHistory([]);
    showToast('Scan history cleared');
  };

  const mobileNavItems = [
    { key: 'home' as NavItemKey, label: 'Home', icon: Home },
    { key: 'scan' as NavItemKey, label: 'Scan', icon: Search },
    { key: 'history' as NavItemKey, label: 'History', icon: Clock },
    { key: 'safety' as NavItemKey, label: 'Safety', icon: ShieldCheck },
    { key: 'settings' as NavItemKey, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FC] bg-mesh text-[#0F172A] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fixed Desktop Sidebar & Mobile Drawer */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area (offset by 256px sidebar on desktop) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all duration-300">
        {/* Topbar */}
        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSelectTab={setCurrentTab}
          onSearchQuery={(q) => {
            setCurrentTab('scan');
          }}
        />

        {/* Content Viewport with max width constraint */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-12">
          {currentTab === 'home' && (
            <HomePage
              onSelectTab={setCurrentTab}
              onSaveToHistory={handleSaveToHistory}
            />
          )}

          {currentTab === 'scan' && (
            <ScanPage
              onSelectTab={setCurrentTab}
              onSaveToHistory={handleSaveToHistory}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage
              history={history}
              onClearHistory={handleClearHistory}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'safety' && <SafetyTipsPage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>

        {/* Desktop & Tablet Minimal Footer */}
        <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-700">
              Scam<span className="text-blue-600">Lens</span>
            </span>
            <span>· See the scam before it sees you.</span>
          </div>

          <p className="text-[11px] text-slate-400">
            ScamLens · AI-Powered Scam Detection Platform
          </p>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar (Below 1024px) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-panel border-t border-slate-200/60 py-1.5 px-4 flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setCurrentTab(item.key);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
