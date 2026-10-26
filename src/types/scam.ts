// ─── Scan Input Types ─────────────────────────────────────────────────────────
export type ScanType = 'url' | 'message' | 'email' | 'text';

export type RiskLevel = 'safe' | 'low' | 'suspicious' | 'high' | 'critical' | 'NO_KNOWN_THREAT' | 'SUSPICIOUS' | 'HIGH_RISK' | 'CRITICAL_RISK' | 'UNKNOWN';

export type RiskLabel = 'Safe' | 'Low Risk' | 'Suspicious' | 'High Risk' | 'Critical Risk' | 'No Known Threat' | 'Unknown';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

// ─── Individual Signal / Finding ──────────────────────────────────────────────
export interface DetectedSignal {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  /** Optional: raw evidence excerpt or extracted data that triggered this finding */
  evidence?: string;
  /** Optional: category tag for this finding */
  category?: string;
}

// ─── URL/Domain Analysis Details ──────────────────────────────────────────────
export interface UrlAnalysisDetails {
  domain?: string;
  httpsEnabled?: boolean;
  httpsLabel?: string;
  redirectsDetected?: boolean;
  domainAge?: string;
  sslStatus?: string;
  serverLocation?: string;
  brandSimilarity?: string;
  reputation?: string;
  contentSignals?: string;
}

// ─── Source / Technical Details (for any scan type) ──────────────────────────
export interface SourceDetails {
  domainAge?: string;
  sslStatus?: string;
  serverLocation?: string;
  senderAddress?: string;
  urgencyMarkers?: number;
  urlAnalysis?: UrlAnalysisDetails;
}

// ─── Full Scan Result ──────────────────────────────────────────────────────────
export interface ScanResultData {
  id: string;
  type: ScanType;
  target: string;
  subject?: string;

  // Risk assessment
  riskLevel: RiskLevel;
  riskScore: number | null; // 0–100 or null if unavailable
  statusLabel?: RiskLabel;
  confidence?: 'high' | 'medium' | 'low';
  sources?: { name: string; status: string; result?: string }[];

  // Analysis content
  summary: string;
  categories: string[];
  detectedSignals: DetectedSignal[];

  /** Structured list of actionable recommendations */
  recommendations: string[];

  /** Legacy single-string recommendation for backward compatibility */
  recommendation: string;

  // Meta
  analyzedAt: string;
  sourceDetails?: SourceDetails;
}

// ─── Scan History Entry ────────────────────────────────────────────────────────
export interface HistoryItem {
  id: string;
  target: string;
  type: 'Website' | 'Message' | 'Email' | 'Text';
  risk: RiskLabel;
  score: number | null;
  date: string;
  signalsCount: number;
}

// ─── Risk Thresholds ───────────────────────────────────────────────────────────
export const RISK_THRESHOLDS = {
  safe: { min: 0, max: 19 },
  low: { min: 20, max: 39 },
  suspicious: { min: 40, max: 59 },
  high: { min: 60, max: 79 },
  critical: { min: 80, max: 100 },
} as const;

/** Derive RiskLevel from a numeric score */
export function getRiskLevel(score: number): RiskLevel {
  if (score <= 19) return 'safe';
  if (score <= 39) return 'low';
  if (score <= 59) return 'suspicious';
  if (score <= 79) return 'high';
  return 'critical';
}

/** Derive RiskLabel from a numeric score */
export function getRiskLabel(score: number): RiskLabel {
  if (score <= 19) return 'Safe';
  if (score <= 39) return 'Low Risk';
  if (score <= 59) return 'Suspicious';
  if (score <= 79) return 'High Risk';
  return 'Critical Risk';
}
