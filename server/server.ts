import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { normalizeAndValidateUrl } from './utils/urlNormalizer.js';
import { checkPhishTank } from './services/threatIntelligence/phishtankService.js';
import { checkUrlhaus } from './services/threatIntelligence/urlhausService.js';
import { analyzeLocalHeuristics } from './services/heuristicAnalyzer.js';
import { evaluateRisk } from './services/riskEngine.js';
import { analyzeMessageContent } from '../src/services/messageScamAnalyzer.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/scans/url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const { isValid, normalizedUrl, error } = normalizeAndValidateUrl(url);
    
    if (!isValid || !normalizedUrl) {
       return res.status(400).json({ success: false, error: error || 'Invalid URL' });
    }

    // Run threat intel checks concurrently
    const [phishtankResult, urlhausResult, heuristicResult] = await Promise.all([
      checkPhishTank(normalizedUrl),
      checkUrlhaus(normalizedUrl),
      Promise.resolve(analyzeLocalHeuristics(normalizedUrl))
    ]);

    if (!phishtankResult.checked) console.error('[PhishTank Error]', phishtankResult.error);
    if (!urlhausResult.checked) console.error('[URLhaus Error]', urlhausResult.error);
    if (!heuristicResult.checked) console.error('[Heuristic Error] Local heuristics failed.');

    const riskEvaluation = evaluateRisk(phishtankResult, urlhausResult, heuristicResult);

    // AI summary generation - explanation layer based ONLY on findings
    let summary = '';
    let recommendations: string[] = [];

    if (riskEvaluation.riskLevel === 'NO_KNOWN_THREAT') {
      summary = 'No known threat was found in the checked threat-intelligence sources.';
      recommendations = [
        'No known threat was identified by the checked sources.',
        'Continue to use normal caution when entering sensitive information.'
      ];
    } else if (riskEvaluation.riskLevel === 'HIGH_RISK') {
      summary = `PhishTank identified this URL as a phishing threat.`;
      recommendations = [
        'Do not enter credentials.',
        'Do not enter OTPs.',
        'Do not make payments.',
        'Do not download files.'
      ];
    } else if (riskEvaluation.riskLevel === 'CRITICAL_RISK') {
      summary = `URLhaus identified this URL as associated with malware distribution.`;
      recommendations = [
        'Do not download any files from this site.',
        'Do not visit this site.',
        'Run a malware scan if you previously downloaded files.'
      ];
    } else if (riskEvaluation.riskLevel === 'UNKNOWN') {
       summary = 'Analysis Unavailable. ScamLens could not reach sufficient threat-intelligence sources.';
       recommendations = ['Please try again later.'];
    } else {
       summary = 'ScamLens found multiple suspicious signals that deserve caution, but no confirmed threat was found.';
       recommendations = ['Exercise caution.', 'Verify the sender or source of the link.'];
    }

    const responsePayload = {
      success: true,
      scan: {
        url: normalizedUrl,
        riskLevel: riskEvaluation.riskLevel,
        riskScore: riskEvaluation.riskScore,
        confidence: riskEvaluation.confidence,
        summary: summary,
        sources: [
          {
            name: 'PhishTank',
            status: phishtankResult.checked ? 'checked' : 'error',
            result: phishtankResult.checked 
              ? (phishtankResult.isThreat ? 'match' : 'no_match') 
              : 'unavailable'
          },
          {
            name: 'URLhaus',
            status: urlhausResult.checked ? 'checked' : 'error',
            result: urlhausResult.checked 
              ? (urlhausResult.isThreat ? 'match' : 'no_match') 
              : 'unavailable'
          },
          {
            name: 'Local Heuristics',
            status: heuristicResult.checked ? 'checked' : 'error',
            result: heuristicResult.signals.length > 0 ? 'signals_found' : 'no_significant_signals'
          }
        ],
        findings: riskEvaluation.reasons,
        recommendations: recommendations
      }
    };

    res.json(responsePayload);

  } catch (error) {
    console.error('Error processing URL scan:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/scans/message', async (req, res) => {
  try {
    const { message, type = 'message', subject } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    const scan = analyzeMessageContent(message, { type, subject });

    res.json({
      success: true,
      scan: {
        target: message,
        subject,
        riskLevel: scan.riskLevel,
        riskScore: scan.riskScore,
        statusLabel: scan.statusLabel,
        confidence: scan.confidence,
        summary: scan.summary,
        categories: scan.categories,
        sources: scan.sources,
        findings: scan.findings,
        recommendations: scan.recommendations,
        sourceDetails: scan.sourceDetails,
      }
    });
  } catch (error) {
    console.error('Error processing message scan:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
