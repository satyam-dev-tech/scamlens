import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Layers,
  Bell,
  Lock,
  User,
  LogOut,
  Check,
  Shield,
  Smartphone,
  EyeOff,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [glassIntensity, setGlassIntensity] = useState<'low' | 'medium' | 'high'>('medium');

  // Notification toggles
  const [scanNotifications, setScanNotifications] = useState(true);
  const [threatAlerts, setThreatAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Privacy toggles
  const [localHistoryLogging, setLocalHistoryLogging] = useState(true);
  const [anonymizeScans, setAnonymizeScans] = useState(true);

  // Toast confirmation
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Toast popup */}
      {savedMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-slate-200/50">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Settings & Preferences
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
          Customize your Liquid Glass visual density, heuristic alert levels, and local privacy rules.
        </p>
      </div>

      {/* 1. Appearance Section */}
      <div className="rounded-3xl p-6 glass-panel-card space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Appearance & Glassmorphism</h3>
            <p className="text-[11px] text-slate-500">
              Configure interface themes and backdrop blur translucency.
            </p>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Interface Theme</h4>
            <p className="text-xs text-slate-500">Select preferred daytime or low-light mode.</p>
          </div>
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100">
            <button
              onClick={() => {
                setThemeMode('light');
                triggerToast('Light mode active');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                themeMode === 'light'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => {
                setThemeMode('dark');
                triggerToast('Dark mode preview set');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                themeMode === 'dark'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-blue-600" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Glass Intensity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Liquid Glass Intensity</h4>
            <p className="text-xs text-slate-500">
              Adjust frosted backdrop refraction and blur depth.
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100">
            {(['low', 'medium', 'high'] as const).map((level) => (
              <button
                key={level}
                onClick={() => {
                  setGlassIntensity(level);
                  triggerToast(`Glass intensity updated to ${level}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  glassIntensity === level
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Notifications Section */}
      <div className="rounded-3xl p-6 glass-panel-card space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Bell className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Notifications & Alerts</h3>
            <p className="text-[11px] text-slate-500">
              Control threat reporting feeds and automated analysis prompts.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800">Scan Completion Alerts</h4>
              <p className="text-slate-500">Receive in-app status when multi-stage heuristic analysis settles.</p>
            </div>
            <button
              onClick={() => {
                setScanNotifications(!scanNotifications);
                triggerToast(scanNotifications ? 'Scan alerts disabled' : 'Scan alerts enabled');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                scanNotifications ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  scanNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800">High-Risk Security Bulletins</h4>
              <p className="text-slate-500">Instant warnings when an analyzed domain is associated with active malware campaigns.</p>
            </div>
            <button
              onClick={() => {
                setThreatAlerts(!threatAlerts);
                triggerToast(threatAlerts ? 'Threat bulletins disabled' : 'Threat bulletins enabled');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                threatAlerts ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  threatAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800">Weekly Threat Digest</h4>
              <p className="text-slate-500">Curated breakdown of trending deceptive scams and phishing vectors.</p>
            </div>
            <button
              onClick={() => {
                setWeeklyDigest(!weeklyDigest);
                triggerToast(weeklyDigest ? 'Weekly digest disabled' : 'Weekly digest enabled');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                weeklyDigest ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  weeklyDigest ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Privacy & Data Section */}
      <div className="rounded-3xl p-6 glass-panel-card space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Lock className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Privacy & Data Governance</h3>
            <p className="text-[11px] text-slate-500">
              Manage client-side persistence and zero-telemetry preferences.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800">Local Scan History Logging</h4>
              <p className="text-slate-500">Preserve evaluated items in browser memory for convenient reference.</p>
            </div>
            <button
              onClick={() => {
                setLocalHistoryLogging(!localHistoryLogging);
                triggerToast('History preference saved');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                localHistoryLogging ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  localHistoryLogging ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800">Anonymize Scanned Identifiers</h4>
              <p className="text-slate-500">Automatically strip personal names and phone prefixes before evaluation.</p>
            </div>
            <button
              onClick={() => {
                setAnonymizeScans(!anonymizeScans);
                triggerToast('Anonymization preference saved');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                anonymizeScans ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  anonymizeScans ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Account Section */}
      <div className="rounded-3xl p-6 glass-panel-card space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <User className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">User Profile & Session</h3>
            <p className="text-[11px] text-slate-500">
              Active ScamLens operator credentials and local session management.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/70 border border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-bold text-base shadow-sm">
              SC
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Satyam Chandra</h4>
              <p className="text-xs text-slate-500">chandrasatyam013@gmail.com</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                Operator Verified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerToast('Profile details updated')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={() => triggerToast('Session terminated')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
