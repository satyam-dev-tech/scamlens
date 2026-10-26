import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Link as LinkIcon,
  MessageSquare,
  Mail,
  FileText,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { ScanResultData, ScanType } from '../types/scam';
import { SCAN_EXAMPLES } from '../data/mockData';
import { ScanResult } from './ScanResult';
import { getAIProvider } from '../services/aiProvider';

interface ScannerProps {
  initialType?: ScanType;
  onScanComplete?: (result: ScanResultData) => void;
  onSaveToHistory: (result: ScanResultData) => void;
}

// Scan steps with labels for the animated progress
const SCAN_STEPS = [
  { label: 'Parsing input payload & headers' },
  { label: 'Checking domain & URL structure' },
  { label: 'Running linguistic & urgency heuristics' },
  { label: 'Synthesizing risk score' },
];

export const Scanner: React.FC<ScannerProps> = ({
  initialType = 'url',
  onScanComplete,
  onSaveToHistory,
}) => {
  const [activeTab, setActiveTab] = useState<ScanType>(initialType);

  // Input states
  const [urlInput, setUrlInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [textInput, setTextInput] = useState('');

  // Scanning & Result states
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [currentResult, setCurrentResult] = useState<ScanResultData | null>(null);

  const handleRunScan = () => {
    let target = '';
    let subject: string | undefined;

    if (activeTab === 'url') {
      target = urlInput.trim() || 'https://amazon-offer-rewards.cc/claim';
      if (!urlInput) setUrlInput(target);
    } else if (activeTab === 'message') {
      target =
        messageInput.trim() ||
        'URGENT! Your Chase account has been locked due to suspicious activity. Verify identity immediately at https://chase-secure-auth.top/unlock';
      if (!messageInput) setMessageInput(target);
    } else if (activeTab === 'email') {
      subject =
        emailSubject.trim() ||
        'Security Alert: Unauthorized sign-in attempt on Microsoft Account';
      target =
        emailContent.trim() ||
        'We detected a login attempt from Moscow, Russia. If this was not you, click here to verify credentials immediately: http://account-security-office365.online';
      if (!emailSubject) setEmailSubject(subject);
      if (!emailContent) setEmailContent(target);
    } else {
      target =
        textInput.trim() ||
        'Remote Data Entry Associate Opportunity: $45/hr paid weekly. Submit SSN and bank details to complete onboarding.';
      if (!textInput) setTextInput(target);
    }

    setIsScanning(true);
    setScanStepIndex(0);

    const stepInterval = setInterval(() => {
      setScanStepIndex((prev) => {
        if (prev < SCAN_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    setTimeout(async () => {
      clearInterval(stepInterval);
      setScanStepIndex(SCAN_STEPS.length - 1);
      
      try {
        const provider = getAIProvider();
        let resultData: any;
        
        if (activeTab === 'url') {
           resultData = await provider.analyzeUrl(target);
        } else if (activeTab === 'message') {
           resultData = await provider.analyzeMessage(target);
        } else if (activeTab === 'email') {
           resultData = await provider.analyzeEmail(subject || 'No Subject', target);
        } else {
           resultData = await provider.analyzeText(target);
        }

        const res: ScanResultData = {
          id: 'res-' + Date.now(),
          type: activeTab,
          target: target,
          subject: subject,
          riskLevel: resultData.riskLevel,
          riskScore: resultData.riskScore,
          statusLabel: resultData.statusLabel,
          summary: resultData.summary,
          categories: resultData.categories,
          detectedSignals: resultData.findings,
          recommendations: resultData.recommendations,
          recommendation: resultData.recommendations?.[0] || 'Be careful.',
          analyzedAt: 'Just now',
          confidence: resultData.confidence,
          sources: resultData.sources
        };
        
        setCurrentResult(res);
        if (onScanComplete) onScanComplete(res);
      } catch (err) {
        console.error("Scan error", err);
      } finally {
        setIsScanning(false);
      }
    }, 1900);
  };

  const handleReset = () => {
    setCurrentResult(null);
  };

  const handleSelectExample = (ex: { value: string; subject?: string }) => {
    if (activeTab === 'url') setUrlInput(ex.value);
    else if (activeTab === 'message') setMessageInput(ex.value);
    else if (activeTab === 'email') {
      setEmailSubject(ex.subject || 'Suspicious Notification');
      setEmailContent(ex.value);
    } else setTextInput(ex.value);
  };

  if (currentResult) {
    return (
      <ScanResult
        result={currentResult}
        onReset={handleReset}
        onSaveToHistory={onSaveToHistory}
      />
    );
  }

  const tabs: { key: ScanType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'url', label: 'Website / URL', icon: LinkIcon },
    { key: 'message', label: 'Message / SMS', icon: MessageSquare },
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'text', label: 'Text / Content', icon: FileText },
  ];

  return (
    <div className="relative rounded-3xl p-6 sm:p-8 glass-panel-card shadow-xl border border-white/90">
      {/* Subtle glow accent */}
      <div className="absolute top-0 right-1/4 w-72 h-32 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Scan for Scams
            </h3>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-700 text-[10px] font-bold uppercase tracking-wide">
              AI-Powered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Paste a website link, message, or email to check for potential fraud.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/80 backdrop-blur-md overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentResult(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scanning Animation */}
      <AnimatePresence mode="wait">
        {isScanning ? (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="py-14 flex flex-col items-center justify-center text-center"
          >
            {/* Animated Radar */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-blue-400/40"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full border border-blue-500/30"
              />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Loader2 className="w-8 h-8 animate-spin stroke-[2.2]" />
              </div>
            </div>

            <h4 className="text-base font-bold text-slate-900 tracking-tight">
              Analyzing with ScamLens...
            </h4>

            {/* Step List */}
            <div className="mt-5 space-y-2 text-left w-full max-w-xs">
              {SCAN_STEPS.map((step, idx) => {
                const done = idx < scanStepIndex;
                const active = idx === scanStepIndex;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: idx <= scanStepIndex ? 1 : 0.3, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-2.5"
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : active ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={`text-xs font-medium ${done ? 'text-slate-600' : active ? 'text-blue-700 font-semibold' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Step progress bar */}
            <div className="flex items-center gap-1.5 mt-6">
              {SCAN_STEPS.map((_, idx) => (
                <motion.span
                  key={idx}
                  animate={{
                    width: idx <= scanStepIndex ? 24 : 8,
                    backgroundColor: idx <= scanStepIndex ? '#2563EB' : '#E2E8F0',
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-1.5 rounded-full"
                  style={{ width: idx <= scanStepIndex ? 24 : 8 }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-6"
          >
            {/* TAB 1: WEBSITE / URL */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-2xl bg-white/90 border border-slate-200 shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all">
                  <div className="flex items-center flex-1 pl-3 pr-2">
                    <LinkIcon className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Enter website URL (e.g. https://example.com)"
                      className="w-full py-2.5 text-sm bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleRunScan()}
                    />
                  </div>
                  <button
                    onClick={handleRunScan}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <span>Scan Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-slate-400 font-medium">Try an example:</span>
                  {SCAN_EXAMPLES.url.map((ex, i) => (
                    <button key={i} onClick={() => handleSelectExample(ex)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/80 text-[11px] font-medium transition-colors shadow-2xs">
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: MESSAGE / SMS */}
            {activeTab === 'message' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/90 border border-slate-200 p-2 shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all">
                  <textarea rows={4} value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Paste a suspicious message here... (e.g. URGENT! Your account will be suspended. Verify immediately.)"
                    className="w-full p-2.5 text-sm bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none resize-none" />
                  <div className="flex justify-between items-center pt-2 px-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">Supports SMS, WhatsApp, Telegram, and chat messages</span>
                    <button onClick={handleRunScan}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer">
                      <span>Analyze Message</span><ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-slate-400 font-medium">Try an example:</span>
                  {SCAN_EXAMPLES.message.map((ex, i) => (
                    <button key={i} onClick={() => handleSelectExample(ex)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/80 text-[11px] font-medium transition-colors shadow-2xs">
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: EMAIL */}
            {activeTab === 'email' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/90 border border-slate-200 p-3 shadow-xs space-y-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all">
                  <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject (e.g. Action Required: Account Compromise)"
                    className="w-full px-2.5 py-2 text-sm bg-slate-50/60 rounded-xl border border-slate-200/60 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white" />
                  <textarea rows={4} value={emailContent} onChange={(e) => setEmailContent(e.target.value)}
                    placeholder="Paste email content here... (e.g. sender info, body copy, and suspicious instructions)"
                    className="w-full p-2.5 text-sm bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none resize-none" />
                  <div className="flex justify-between items-center pt-2 px-1 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">Analyzes sender spoofing, invoice fraud, and deceptive links</span>
                    <button onClick={handleRunScan}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer">
                      <span>Analyze Email</span><ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-slate-400 font-medium">Try an example:</span>
                  {SCAN_EXAMPLES.email.map((ex, i) => (
                    <button key={i} onClick={() => handleSelectExample(ex)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/80 text-[11px] font-medium transition-colors shadow-2xs">
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: TEXT / CONTENT */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/90 border border-slate-200 p-2 shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all">
                  <textarea rows={4} value={textInput} onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste suspicious text here... (e.g. job offers, crypto investment pitches, social media ads)"
                    className="w-full p-2.5 text-sm bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none resize-none" />
                  <div className="flex justify-between items-center pt-2 px-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">Evaluates social engineering, advance-fee fraud, and credential harvesting</span>
                    <button onClick={handleRunScan}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer">
                      <span>Analyze Text</span><ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-slate-400 font-medium">Try an example:</span>
                  {SCAN_EXAMPLES.text.map((ex, i) => (
                    <button key={i} onClick={() => handleSelectExample(ex)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/80 text-[11px] font-medium transition-colors shadow-2xs">
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
