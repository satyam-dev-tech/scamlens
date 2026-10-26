/**
 * ScamLens AI Provider Abstraction
 *
 * This module defines the contract for any AI analysis provider.
 * The application is not tightly coupled to any single AI service.
 *
 * To add a new provider (e.g., OpenAI, Anthropic):
 *   1. Create a class that implements `AIProvider`
 *   2. Export it from this module
 *   3. Update `createAIProvider()` to return your implementation
 */

import { ScanType, DetectedSignal, RiskLevel, RiskLabel } from '../types/scam';

// ─── AI Provider Contract ─────────────────────────────────────────────────────

/** Raw structured response returned by any AI provider */
export interface AIAnalysisResult {
  riskScore: number | null;
  riskLevel: RiskLevel;
  statusLabel?: RiskLabel;
  summary: string;
  categories: string[];
  findings: DetectedSignal[];
  recommendations: string[];
  confidence?: 'high' | 'medium' | 'low';
  sources?: { name: string; status: string; result?: string }[];
}

/** The AI provider interface that all implementations must satisfy */
export interface AIProvider {
  analyzeUrl(url: string): Promise<AIAnalysisResult>;
  analyzeMessage(message: string): Promise<AIAnalysisResult>;
  analyzeEmail(subject: string, body: string, sender?: string): Promise<AIAnalysisResult>;
  analyzeText(text: string): Promise<AIAnalysisResult>;
}

// ─── Request/Response Validation ─────────────────────────────────────────────

/** Validate that a result from the AI provider has the required structure */
export function validateAIResult(result: unknown): result is AIAnalysisResult {
  if (!result || typeof result !== 'object') return false;
  const r = result as Record<string, unknown>;
  return (
    (typeof r.riskScore === 'number' && r.riskScore >= 0 && r.riskScore <= 100) || r.riskScore === null
  ) && (
    typeof r.summary === 'string' &&
    Array.isArray(r.findings) &&
    Array.isArray(r.recommendations)
  );
}

// ─── Mock/Heuristic Provider ──────────────────────────────────────────────────
// Used during development when no real AI API key is configured.
// This provider implements deterministic heuristic analysis.

import { generateMockScanResult } from '../data/mockData';
import { analyzeMessageContent, MessageAnalysisResult } from './messageScamAnalyzer';

export class HeuristicProvider implements AIProvider {
  async analyzeUrl(url: string): Promise<AIAnalysisResult> {
    try {
      const res = await fetch('/api/scans/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to scan URL');
      }
      
      const scan = data.scan;
      return {
        riskScore: scan.riskScore,
        riskLevel: scan.riskLevel,
        statusLabel: scan.riskLevel === 'NO_KNOWN_THREAT' ? 'No Known Threat' :
                     scan.riskLevel === 'HIGH_RISK' ? 'High Risk' :
                     scan.riskLevel === 'CRITICAL_RISK' ? 'Critical Risk' :
                     scan.riskLevel === 'SUSPICIOUS' ? 'Suspicious' : 'Unknown',
        summary: scan.summary,
        categories: scan.findings?.map((f: any) => f.type) || [],
        findings: scan.findings?.map((f: any, idx: number) => ({
          id: `finding-${f.source || 'sys'}-${f.type || idx}`,
          title: (f.source ? f.source + ': ' : '') + (f.type || 'Indicator detected'),
          description: f.description || 'Threat pattern detected',
          severity: f.severity || 'medium',
          category: f.type || 'Threat Intelligence',
        })) || [],
        recommendations: scan.recommendations || [],
        confidence: scan.confidence,
        sources: scan.sources || [],
      };
    } catch (err) {
      console.error("URL scan failed, using fallback:", err);
      const result = generateMockScanResult('url', url);
      return this._toAIResult(result);
    }
  }

  async analyzeMessage(message: string): Promise<AIAnalysisResult> {
    try {
      const res = await fetch('/api/scans/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type: 'message' })
      });
      const data = await res.json();
      if (data.success && data.scan) {
        return this._formatMessageScan(data.scan);
      }
    } catch {
      // Fallback to local deterministic analyzer if backend is unreachable
    }
    const localScan = analyzeMessageContent(message, { type: 'message' });
    return this._formatMessageScan(localScan);
  }

  async analyzeEmail(subject: string, body: string): Promise<AIAnalysisResult> {
    try {
      const res = await fetch('/api/scans/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: body, type: 'email', subject })
      });
      const data = await res.json();
      if (data.success && data.scan) {
        return this._formatMessageScan(data.scan);
      }
    } catch {
      // Fallback to local deterministic analyzer
    }
    const localScan = analyzeMessageContent(body, { type: 'email', subject });
    return this._formatMessageScan(localScan);
  }

  async analyzeText(text: string): Promise<AIAnalysisResult> {
    try {
      const res = await fetch('/api/scans/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, type: 'text' })
      });
      const data = await res.json();
      if (data.success && data.scan) {
        return this._formatMessageScan(data.scan);
      }
    } catch {
      // Fallback to local deterministic analyzer
    }
    const localScan = analyzeMessageContent(text, { type: 'text' });
    return this._formatMessageScan(localScan);
  }

  private _formatMessageScan(scan: MessageAnalysisResult | any): AIAnalysisResult {
    return {
      riskScore: scan.riskScore,
      riskLevel: scan.riskLevel,
      statusLabel: scan.statusLabel,
      summary: scan.summary,
      categories: scan.categories || [],
      findings: scan.findings || [],
      recommendations: scan.recommendations || [],
      confidence: scan.confidence || 'high',
      sources: scan.sources || [],
    };
  }

  private _toAIResult(r: ReturnType<typeof generateMockScanResult>): AIAnalysisResult {
    return {
      riskScore: r.riskScore,
      riskLevel: r.riskLevel,
      statusLabel: r.statusLabel,
      summary: r.summary,
      categories: r.categories,
      findings: r.detectedSignals,
      recommendations: r.recommendations,
      confidence: r.confidence,
      sources: r.sources,
    };
  }
}

// ─── Gemini Provider ──────────────────────────────────────────────────────────
// Activated when VITE_GEMINI_API_KEY is set in the environment.
// The actual implementation will be added in Phase 8.

export class GeminiProvider implements AIProvider {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeUrl(_url: string): Promise<AIAnalysisResult> {
    throw new Error('GeminiProvider.analyzeUrl not yet implemented. Use HeuristicProvider for now.');
  }

  async analyzeMessage(_message: string): Promise<AIAnalysisResult> {
    throw new Error('GeminiProvider.analyzeMessage not yet implemented.');
  }

  async analyzeEmail(_subject: string, _body: string): Promise<AIAnalysisResult> {
    throw new Error('GeminiProvider.analyzeEmail not yet implemented.');
  }

  async analyzeText(_text: string): Promise<AIAnalysisResult> {
    throw new Error('GeminiProvider.analyzeText not yet implemented.');
  }
}

// ─── Provider Factory ─────────────────────────────────────────────────────────

/**
 * Returns the appropriate AI provider based on environment configuration.
 * - If VITE_GEMINI_API_KEY is set → GeminiProvider (Phase 8)
 * - Otherwise → HeuristicProvider (development / offline mode)
 */
export function createAIProvider(): AIProvider {
  const geminiKey = import.meta.env?.VITE_GEMINI_API_KEY as string | undefined;
  if (geminiKey) {
    return new GeminiProvider(geminiKey);
  }
  // Default: use the local heuristic engine (no API key required)
  return new HeuristicProvider();
}

/** Singleton provider instance */
let _provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!_provider) {
    _provider = createAIProvider();
  }
  return _provider;
}
