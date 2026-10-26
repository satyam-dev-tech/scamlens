import { HistoryItem, ScanResultData, ScanType, getRiskLevel, getRiskLabel } from '../types/scam';
import { analyzeMessageContent } from '../services/messageScamAnalyzer';

// ─── Mock History ─────────────────────────────────────────────────────────────

export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: 'hist-1',
    target: 'amazon-security-alert.cc',
    type: 'Website',
    risk: 'Critical Risk',
    score: 94,
    date: 'Today, 10:24 AM',
    signalsCount: 5,
  },
  {
    id: 'hist-2',
    target: 'URGENT! Your account will be suspended. Verify immediately...',
    type: 'Message',
    risk: 'High Risk',
    score: 72,
    date: 'Yesterday, 3:45 PM',
    signalsCount: 3,
  },
  {
    id: 'hist-3',
    target: 'billing-receipt@official.stripe.com',
    type: 'Email',
    risk: 'Safe',
    score: 8,
    date: 'Sep 28, 2:10 PM',
    signalsCount: 0,
  },
  {
    id: 'hist-4',
    target: 'netflix-payment-update.top',
    type: 'Website',
    risk: 'Critical Risk',
    score: 91,
    date: 'Sep 25, 11:15 AM',
    signalsCount: 4,
  },
  {
    id: 'hist-5',
    target: 'Congratulations! You won a $1,000 Walmart gift card. Claim now...',
    type: 'Text',
    risk: 'Critical Risk',
    score: 88,
    date: 'Sep 22, 6:02 PM',
    signalsCount: 3,
  },
  {
    id: 'hist-6',
    target: 'USPS Notice: Your package requires $1.85 redelivery fee...',
    type: 'Message',
    risk: 'Suspicious',
    score: 54,
    date: 'Sep 20, 9:30 AM',
    signalsCount: 2,
  },
];

// ─── Scan Examples ────────────────────────────────────────────────────────────

export interface ScanExample {
  label: string;
  type: ScanType;
  value: string;
  subject?: string;
}

export const SCAN_EXAMPLES: Record<ScanType, ScanExample[]> = {
  url: [
    {
      label: 'amazon-offer.com',
      type: 'url',
      value: 'https://amazon-offer-rewards.cc/claim',
    },
    {
      label: 'Win iPhone! Click now!',
      type: 'url',
      value: 'https://win-iphone16-spin-wheel.xyz/prize',
    },
    {
      label: 'Your account will be blocked...',
      type: 'url',
      value: 'https://bankofamerica-verify-session.net/login',
    },
    {
      label: 'github.com (Safe example)',
      type: 'url',
      value: 'https://github.com',
    },
  ],
  message: [
    {
      label: 'Bank Account Suspension',
      type: 'message',
      value: 'URGENT! Your Chase account has been locked due to suspicious activity. Verify identity immediately at https://chase-secure-auth.top/unlock or your account will be permanently closed.',
    },
    {
      label: 'Parcel Delivery Fee',
      type: 'message',
      value: 'USPS Notice: Your package could not be delivered due to an incorrect postal address. Please pay $1.85 redelivery charge at usps-redelivery-hub.info.',
    },
    {
      label: 'Emergency Family Member',
      type: 'message',
      value: "Hi Dad, I dropped my phone into water and this is my friend's phone. I urgently need $350 for train ticket back home. Can you Venmo or Zelle to this number right away?",
    },
  ],
  email: [
    {
      label: 'Unusual Microsoft Login',
      type: 'email',
      subject: 'Security Alert: Unauthorized sign-in attempt on Microsoft Account',
      value: 'We detected a login attempt from Moscow, Russia (IP: 185.220.101.4). If this was not you, your account has been compromised. Click below to review account permissions and reset password immediately: http://account-security-office365.online',
    },
    {
      label: 'Geek Squad Renewal Invoice',
      type: 'email',
      subject: 'Invoice #GS-99824: Geek Squad Total Tech Care Auto-Debited $499.00',
      value: 'Thank you for your renewal. An automatic charge of $499.00 has been debited from your checking account. If you believe this is an error or did not authorize this purchase, call our toll-free fraud department immediately at +1-888-555-0193 to cancel within 24 hours.',
    },
    {
      label: 'Legitimate Stripe Receipt',
      type: 'email',
      subject: 'Your receipt from Cloud Services Inc (#1983-2011)',
      value: 'Hi, thank you for your payment of $15.00 for your monthly subscription. You can review your invoices and billing information anytime at your official dashboard at https://stripe.com.',
    },
  ],
  text: [
    {
      label: 'Remote Job Offer Scam',
      type: 'text',
      value: 'Remote Data Entry Associate Opportunity: Flexible hours, $45/hr paid weekly. No prior experience required. Equipment provided. To complete onboarding, submit your full name, date of birth, SSN, and banking routing details.',
    },
    {
      label: 'Crypto Investment Opportunity',
      type: 'text',
      value: 'Exclusive invitation: Guaranteed 350% weekly returns on automated AI crypto arbitrage trading. Limited to 20 accredited investors today. Deposit 0.1 BTC to activate your bot.',
    },
    {
      label: 'Safe meeting agenda notes',
      type: 'text',
      value: 'Quarterly planning meeting notes: Review product roadmap, finalize mobile design prototypes, and schedule team retrospective for Thursday at 2:00 PM EST.',
    },
  ],
};

// ─── Risk Engine (Heuristic) ──────────────────────────────────────────────────

/**
 * Deterministic heuristic scan engine.
 * Analyzes content using multi-factor contextual heuristics, link analysis,
 * and genuine scam/threat detection patterns.
 */
export function generateMockScanResult(
  type: ScanType,
  target: string,
  subject?: string
): ScanResultData {
  const analysisType = type === 'url' ? 'text' : type;
  const analysis = analyzeMessageContent(target, { type: analysisType, subject });

  const id = 'res-' + Date.now();
  const analyzedAt = 'Just now';

  return {
    id,
    type,
    target: target.trim(),
    subject,
    riskLevel: analysis.riskLevel,
    riskScore: analysis.riskScore,
    statusLabel: analysis.statusLabel,
    confidence: analysis.confidence,
    sources: analysis.sources,
    summary: analysis.summary,
    categories: analysis.categories,
    detectedSignals: analysis.findings,
    recommendations: analysis.recommendations,
    recommendation: analysis.recommendations[0] || 'Exercise standard digital hygiene.',
    analyzedAt,
    sourceDetails: {
      urgencyMarkers: analysis.sourceDetails?.urgencyMarkers,
      urlAnalysis: {
        httpsEnabled: target.toLowerCase().startsWith('https://'),
        httpsLabel: target.toLowerCase().startsWith('https://') ? 'Enabled' : 'Not Available',
        redirectsDetected: analysis.sourceDetails?.urlAnalysis?.shortenersDetected,
        brandSimilarity: analysis.findings.find(
          (f) => f.category === 'Lookalike Domain' || f.category === 'Brand Impersonation'
        )?.title,
        reputation:
          analysis.riskScore > 60
            ? 'Flagged — suspicious heuristic patterns'
            : 'No adverse threat reports',
        contentSignals: analysis.categories.join(', '),
      },
    },
  };
}

// ─── Safety Center Content ────────────────────────────────────────────────────

export const SAFETY_TIPS = [
  {
    id: 'tip-1',
    title: 'Check the URL Thoroughly',
    subtitle: 'Look for strange domains, subtle typos, and abnormal extensions.',
    description:
      'Phishing domains often swap letters (e.g., "arnazon.com" instead of "amazon.com") or use uncharacteristic top-level domains such as .xyz, .cc, or .top. Always hover over links before clicking.',
    category: 'Website Safety',
    actionText: 'Inspect domain syntax',
  },
  {
    id: 'tip-2',
    title: "Don't Trust Artificial Urgency",
    subtitle: 'Scammers create panic to force impulsive decisions without checking.',
    description:
      'Threats of immediate arrest, account closure within 60 minutes, or lost funds are engineered to override critical thinking. Authentic institutions always offer grace periods and never demand immediate irreversible action.',
    category: 'Psychological Defense',
    actionText: 'Pause before clicking',
  },
  {
    id: 'tip-3',
    title: 'Never Share One-Time Passwords (OTPs)',
    subtitle: 'Legitimate organizations never ask for your 2FA verification code.',
    description:
      'Even if the caller or message claims to be the fraud department, sharing an OTP gives the attacker direct authorization to drain your account or take over your login. Banks, phone carriers, and platforms never need your OTP.',
    category: 'Credential Security',
    actionText: 'Keep OTPs strictly private',
  },
  {
    id: 'tip-4',
    title: 'Verify Independently via Official Channels',
    subtitle: 'Always navigate to official apps or typed URLs directly.',
    description:
      'Never call the phone number provided in a suspicious text or click the embedded reset button. Look up the bank or agency on your physical card or the official website you know and trust.',
    category: 'Identity Verification',
    actionText: 'Use bookmark or official app',
  },
  {
    id: 'tip-5',
    title: "Don't Click Unknown Attachments & Links",
    subtitle: 'Inspect link targets before tapping or downloading files.',
    description:
      'Hover over hyperlinks on desktop or long-press on mobile to inspect the actual destination URL before navigating. Watch out for .zip, .exe, or .html attachments from unknown senders.',
    category: 'Link Hygiene',
    actionText: 'Preview links first',
  },
  {
    id: 'tip-6',
    title: 'Spot Family Emergency Impersonations',
    subtitle: 'AI voice cloning and stolen profiles fake emergency money requests.',
    description:
      'If a "relative" texts from an unfamiliar number claiming to be in an accident or stranded, always call their original phone number or another family member to confirm before sending money.',
    category: 'Social Engineering',
    actionText: 'Call a known trusted contact',
  },
];
