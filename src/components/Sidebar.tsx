import React from 'react';
import { Home, Search, Clock, ShieldCheck, Settings, Shield, X } from 'lucide-react';

export type NavItemKey = 'home' | 'scan' | 'history' | 'safety' | 'settings';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    { key: 'home' as NavItemKey, label: 'Home', icon: Home },
    { key: 'scan' as NavItemKey, label: 'Scan', icon: Search },
    { key: 'history' as NavItemKey, label: 'History', icon: Clock },
    { key: 'safety' as NavItemKey, label: 'Safety Tips', icon: ShieldCheck },
    { key: 'settings' as NavItemKey, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel border-r border-slate-200/50 flex flex-col justify-between p-5 transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                onSelectTab('home');
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              {/* Logo Mark: Shield + Lens */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <div className="relative">
                  <Shield className="w-5 h-5 stroke-[2.2]" />
                  <Search className="w-2.5 h-2.5 absolute top-1.5 left-1.5 stroke-[2.5]" />
                </div>
              </div>

              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Scam<span className="text-blue-600">Lens</span>
                </span>
                <p className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">
                  Fraud Detection
                </p>
              </div>
            </button>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 lg:hidden"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = currentTab === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onSelectTab(item.key);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-blue-50 text-blue-600 shadow-xs border border-blue-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isSelected ? 'text-blue-600 stroke-[2.2]' : 'text-slate-400 group-hover:text-slate-600 stroke-[1.8]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Security Card */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/80 via-blue-50/50 to-white/60 border border-white/80 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <Shield className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 tracking-tight">Stay Safe Online</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Detect scams before they reach you.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('safety')}
            className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-white hover:bg-blue-50 text-blue-600 border border-blue-200/50 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs"
          >
            Read Guidelines →
          </button>
        </div>
      </aside>
    </>
  );
};
