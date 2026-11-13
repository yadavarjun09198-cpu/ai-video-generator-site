# AR's AI — Multi-ad integration (staged)

Current code:
- `src/AdPlacements.jsx`: labeled inactive banner and native placement shells.
- `src/EarnCredits.jsx`: inactive rewarded-ad placeholder, no fake balance.
- `src/App.jsx`: includes both placement shells without rewriting existing sections.

No ad SDK, advertiser account, payout account, tracking script, or provider credentials have been connected. No ads are live and no earnings are generated.

## Next production steps
1. Obtain approval for website traffic and ad formats from appropriate provider(s). Display/native and rewarded may require **different providers**. Verify provider policy for incentivized ads and geographic eligibility.
2. Collect public publisher/placement IDs (not secret keys) and implement each provider's documented integration with consent/privacy disclosures. Never reward ordinary banner/native views or clicks.
3. Host an authenticated backend and persistent database for users and balances. The static GitHub Pages site cannot securely manage money or credits.
4. Verify rewarded completions server-side (signed callback/SSV, anti-replay, idempotency) before issuing credits; cap credits to an affordable AI generation budget.
5. Track earnings in the ad network dashboard; payouts follow the provider's schedule and thresholds, not instant bank transfer.
6. Test actual ad delivery, reward verification, balance debit, failed-generation refund and abuse protections before enabling any Earn Credits button.

Never add secret credentials to React/Vite or GitHub source. Keep rewarded ads opt-in.
