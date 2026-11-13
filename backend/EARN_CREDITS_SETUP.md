# Earn Credits — rewarded ads integration plan

The React UI includes an Earn Credits section and a **disabled** rewarded-ad placement. It does not display a real advertisement, fabricate balance, or award credits.

Before enabling:
1. Select a rewarded-ad provider that explicitly supports **rewarded web ads**, incentivized viewing, and the website's traffic/location. Ordinary display ads, AdSense clicks, or forced ad interaction must **never** be rewarded.
2. Get approval and follow provider policies. Obtain provider-specific placement identifiers; do not commit secrets.
3. Add user authentication and a server-side credits ledger (e.g., PostgreSQL). Never trust client-reported ad completion.
4. Verify each ad completion server-side via provider-signed callback/SSV or documented equivalent, with signature, nonce, replay protection, expiry and per-user limits. Credit exactly once per verified event.
5. Require server-side balance validation and atomic debit before initiating billable video generation; enforce daily cost budgets and refunds on failed jobs.
6. Add clear reward rates, ad disclosure, consent/privacy handling, abuse prevention, and support.
7. Test provider callbacks and full generation lifecycle before enabling the button.

GitHub Pages is static and cannot host the secure reward verification service. Current backend lacks auth/ledger. Therefore the earn button is intentionally disabled. No ad account or paid campaign has been connected or activated.
