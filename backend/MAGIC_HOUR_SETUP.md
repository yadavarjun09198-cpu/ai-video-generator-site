# Magic Hour API integration — staged, NOT verified working

Official endpoints: `POST /v1/image-to-video` and `POST /v1/video-to-video`. The backend uses the official Python SDK's `generate()` helper to upload, create, poll and download. Reference: https://docs.magichour.ai and https://github.com/magichourhq/magic-hour-python .

## Status
- Existing React frontend design: unchanged.
- Image-to-video: optional Magic Hour backend adapter connected, NOT inference-tested.
- Video-to-video: initial adapter exists, but NOT activated (request schema needs testing).
- Voice/sound: not integrated.
- Public deployment: NOT configured. GitHub Pages cannot run FastAPI.
- No API key committed, no API request/credits spent by this change.

## Costs
Official pricing: https://magichour.ai/pricing . The published free account allowance is 400 signup credits and up to seven claims of 100 daily credits. API and web share account credits. Free allowances and model restrictions can change. Check account-specific balance via the authenticated `GET /v1/account` endpoint BEFORE generation. Creating a job can spend credits.

## Setup for private backend test
1. Create your own key at https://magichour.ai/developer . **Never paste the key into GitHub, chat, Vite .env or browser code.**
2. Deploy the Python backend privately, set these as SERVER environment variables:
```env
MAGIC_HOUR_API_KEY=your_secret_value
MAGIC_HOUR_ENABLE_GENERATION=0
ALLOWED_ORIGINS=https://yadavarjun09198-cpu.github.io
```
3. Install `pip install -r requirements.txt` and run `uvicorn main:app --host 127.0.0.1 --port 8000`. With `ENABLE_GENERATION=0` no Magic Hour credits are spent. Validate SDK compatibility, request schema and credit balance.
4. ONLY after you explicitly approve a credit-consuming test, set `MAGIC_HOUR_ENABLE_GENERATION=1` on the private server and send a small image request to `POST /api/generate/image`. The adapter requests 3s at 480p with ltx-2.3; actual SDK/model compatibility is not yet verified.
5. Only after successful real MP4 output, secure the backend (auth, quotas, timeouts, storage cleanup and cost limits), deploy public HTTPS, then set `VITE_VIDEO_API_URL` during frontend build.

WARNING: Never expose this unauthenticated API publicly with a billable Magic Hour key. The existing FastAPI endpoint is a prototype, not safe for unrestricted public traffic.
