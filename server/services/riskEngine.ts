import { ProviderResult } from './threatIntelligence/phishtankService.js';
import { HeuristicResult } from './heuristicAnalyzer.js';

export type RiskLevel = 'NO_KNOWN_THREAT' | 'SUSPICIOUS' | 'HIGH_RISK' | 'CRITICAL_RISK' | 'UNKNOWN';
export type Confidence = 'high' | 'medium' | 'low';

export interface Reason {
  source: string;
  type?: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}

export interface RiskEngineResult {
  riskLevel: RiskLevel;
  riskScore: number | null;
  confidence: Confidence;
  reasons: Reason[];
}

export function evaluateRisk(
  phishtankResult: ProviderResult,
  urlhausResult: ProviderResult,
  heuristicResult: HeuristicResult
): RiskEngineResult {
  const reasons: Reason[] = [];

  // Track if we had at least one successful external check
  const anyExternalCheckSucceeded = phishtankResult.checked || urlhausResult.checked;

  // 1. Known Malware (URLhaus)
  if (urlhausResult.checked && urlhausResult.isThreat) {
    urlhausResult.threatTypes.forEach(type => {
      reasons.push({
        source: 'URLhaus',
        type: type,
        severity: 'critical',
        description: 'URL matched a known malicious URL in URLhaus'
      });
    });

    return {
      riskLevel: 'CRITICAL_RISK',
      riskScore: 98,
      confidence: 'high',
      reasons
    };
  }

  // 2. Verified Phishing (PhishTank)
  if (phishtankResult.checked && phishtankResult.isThreat) {
    phishtankResult.threatTypes.forEach(type => {
      reasons.push({
        source: 'PhishTank',
        type: type,
        severity: 'high',
        description: 'URL matched a phishing entry in PhishTank'
      });
    });

    return {
      riskLevel: 'HIGH_RISK',
      riskScore: 90,
      confidence: 'high',
      reasons
    };
  }

  // Add heuristic signals as reasons if present
  if (heuristicResult.checked && heuristicResult.signals.length > 0) {
    heuristicResult.signals.forEach(signal => {
      reasons.push({
        source: 'Local Heuristics',
        type: signal.id,
        severity: 'medium',
        description: signal.description
      });
    });
  }

  // 3. Suspicious (Multiple heuristics)
  if (heuristicResult.checked && heuristicResult.signals.length >= 2) {
    // If we have multiple suspicious signals, we can score it.
    // Base score 40 + 10 for each signal up to 60.
    const score = Math.min(40 + (heuristicResult.signals.length * 10), 60);
    return {
      riskLevel: 'SUSPICIOUS',
      riskScore: score,
      confidence: anyExternalCheckSucceeded ? 'medium' : 'low',
      reasons
    };
  }

  // 4. Unknown (No external checks succeeded and not enough heuristics)
  if (!anyExternalCheckSucceeded) {
    // Both failed
    reasons.push({
      source: 'System',
      severity: 'info',
      description: 'Unable to perform enough reliable analysis.'
    });
    return {
      riskLevel: 'UNKNOWN',
      riskScore: null,
      confidence: 'low',
      reasons
    };
  }

  // 5. No Known Threat
  return {
    riskLevel: 'NO_KNOWN_THREAT',
    riskScore: null,
    confidence: 'medium',
    reasons
  };
}
