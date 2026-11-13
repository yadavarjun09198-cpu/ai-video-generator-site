# AR's AI — ₹100/month GPU budget (staged integration)

## Chosen first path
Use an existing Hugging Face ZeroGPU Gradio Space for image-to-video **only after confirming its exact API contract**. ZeroGPU is quota-limited; it is not an unlimited free public backend. No Space, GPU, or API call has been successfully tested yet.

Official references:
- https://huggingface.co/docs/hub/spaces-zerogpu
- https://huggingface.co/docs/hub/spaces-api-endpoints
- https://huggingface.co/pricing

## Changes made
- `backend/main.py` prefers configured Hugging Face Space over paid Magic Hour for image-to-video.
- `ALLOW_PAID_GENERATION=0` (default) prevents Magic Hour calls even if a Magic Hour key and provider enable flag are present.
- Existing React/Vite frontend design unchanged.
- No provider key, paid billing or GPU instance has been activated.

## Required server-only configuration
```env
ALLOW_PAID_GENERATION=0
MAGIC_HOUR_ENABLE_GENERATION=0
ENABLE_IMAGE_MODEL=0
ENABLE_VIDEO_MODEL=0
HF_IMAGE_SPACE=
HF_IMAGE_API_NAME=
HF_TOKEN=
ALLOWED_ORIGINS=https://yadavarjun09198-cpu.github.io
```
Leave HF_IMAGE_SPACE and HF_IMAGE_API_NAME blank until a real Space's 'Use via API' documentation is inspected. The existing adapter expects (uploaded file, prompt) and local MP4 output; many Spaces use different schemas.

## Safety and remaining work
1. Select a compatible ZeroGPU video Space and inspect the actual Gradio API schema.
2. Test the API with a small image under the user's own account/quota.
3. Deploy a secure HTTPS FastAPI service (GitHub Pages cannot host Python), add auth and daily rate limits.
4. Connect `VITE_VIDEO_API_URL` only after a real video MP4 is generated and retrieved.
5. For future paid generation, implement **provider-side hard spend caps or prepaid-only credits** before enabling any billable route. An environment flag is **not** a ₹100 spending cap. Public unauthenticated endpoints must never be enabled with billable credentials.

Do not mark the integration 'Working' before an end-to-end test.
