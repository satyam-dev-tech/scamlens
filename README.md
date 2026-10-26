<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# ScamLens - AI Fraud & Scam Detection

ScamLens helps you see the scam before it sees you. Analyze suspicious websites, messages, emails, and text with deterministic contextual heuristics, threat intelligence, and explainable evidence.

## Features

- **Website / URL Scanner**: Checks against threat intelligence feeds (PhishTank, URLhaus) and structural URL heuristics.
- **Message & SMS Fraud Detection**: Detects OTP harvesting, brand impersonation, deceptive lookalike domains, coercive threats, fake delivery fee traps, and emergency extortion.
- **False-Positive Prevention**: Contextually distinguishes authentic OTP dispatches, genuine courier tracking updates, legitimate security notices, and routine conversational language.
- **Evidence-Based & Deterministic**: Zero arbitrary guesswork or fabricated findings—every risk score is backed by exact extracted evidence and actionable recommendations.

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the regression test suite:
   ```bash
   npm test
   ```

3. Start the application:
   ```bash
   npm run server   # Starts backend API on port 3001
   npm run dev      # Starts Vite dev server on port 3000
   ```
