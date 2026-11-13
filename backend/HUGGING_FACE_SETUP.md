# Hugging Face Spaces integration (experimental, not live)

The frontend design is unchanged. The FastAPI backend now supports calling a **configured** public or private Gradio Space, with no local GPU. The backend itself must be deployed to a public HTTPS service separately; GitHub Pages cannot run Python.

## Cost and limitations

Using a public ZeroGPU Space can be free but is rate-limited and may be queued or unavailable. Space owners can change or disable their APIs. Paid Spaces have hourly charges. Check https://huggingface.co/docs/hub/spaces-zerogpu and https://huggingface.co/pricing before use.

## Configuration

Set these on the backend server, not in Vite or public GitHub files:

```env
HF_IMAGE_SPACE=owner/space-name
HF_IMAGE_API_NAME=/generate
HF_VIDEO_SPACE=owner/space-name
HF_VIDEO_API_NAME=/generate
# Optional private Space token (never commit):
HF_TOKEN=
ALLOWED_ORIGINS=https://yadavarjun09198-cpu.github.io
```

**Do not copy these placeholder values as-is.** Select a real Space, open its **Use via API** panel, and verify that its endpoint accepts exactly two positional arguments: (uploaded image/video file, text prompt) in that order, and returns an MP4 file. Different schemas require modifying `hf_space.py` to match. The bridge currently supports only this contract. A configured endpoint is NOT proof that it works.

Install `pip install -r requirements.txt` then run `uvicorn main:app --host 127.0.0.1 --port 8000`. The image/video route will use Hugging Face when its respective configuration is present; otherwise it retains the optional local CUDA implementation. Voice and sound remain unimplemented.

## Production prerequisites

Select and test a concrete Space and its API schema, deploy a public HTTPS backend, secure API keys server-side, add authentication, per-user rate limits, request timeouts, queues, moderation, cleanup, and cost controls. Then configure `VITE_VIDEO_API_URL` at Vite build time. No video generation has been verified by this change.
