import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, ChevronDown, Menu, Check } from 'lucide-react';
import { NavItemKey } from './Sidebar';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  onSearchQuery?: (q: string) => void;
  onSelectTab: (tab: NavItemKey) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
  onSearchQuery,
  onSelectTab,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'New Phishing Threat Pattern Added',
      time: '12m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Scan completed: amazon-security-alert.cc flagged',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Heuristic database updated to v2026.10',
      time: '4h ago',
      unread: false,
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      if (onSearchQuery) onSearchQuery(searchValue);
      onSelectTab('scan');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/40 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/80 lg:hidden border border-slate-200/50"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Large Glass Search Field */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search scams, websites or learn..."
              className="w-full pl-10 pr-12 py-2 text-sm bg-white/75 hover:bg-white focus:bg-white backdrop-blur-md border border-slate-200/60 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all shadow-2xs"
            />
            {searchValue && (
              <button
                type="submit"
                className="absolute right-2 px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium transition-colors"
              >
                Scan
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Right: Actions, Theme, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white/80 border border-transparent hover:border-slate-200/60 transition-all"
        >
          {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white/80 border border-transparent hover:border-slate-200/60 transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel-card p-3 shadow-xl border border-white/90 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[11px] text-blue-600 font-medium cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="divide-y divide-slate-100/80 mt-1">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-800 line-clamp-1">{item.title}</p>
                      {item.unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 ml-1.5" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/80 border border-transparent hover:border-slate-200/60 transition-all focus:outline-none"
          >
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-white">
              SC
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                Satyam Chandra
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Security Analyst</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl glass-panel-card p-2 shadow-xl border border-white/90 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Satyam Chandra</p>
                <p className="text-[11px] text-slate-500 truncate">chandrasatyam013@gmail.com</p>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => {
                    onSelectTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50/60 hover:text-blue-600 rounded-lg transition-colors"
                >
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    onSelectTab('history');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50/60 hover:text-blue-600 rounded-lg transition-colors"
                >
                  My Scan Activity
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
