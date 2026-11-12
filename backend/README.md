# AR's AI — GPU backend foundation

This is a **working API skeleton, not an AI inference server**. Voice-to-video, sound-to-video, and image-to-video return HTTP 503 until compatible GPU model adapters are implemented and configured. No video is fabricated.

## Local setup

```bash
cd backend
python -m venv .venv
# Activate the environment, then:
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

Visit http://127.0.0.1:8000/docs and http://127.0.0.1:8000/api/capabilities.

## Frontend

Set `VITE_VIDEO_API_URL` to a **public HTTPS** backend endpoint at build time, and rebuild the Vite app. The frontend makes multipart POST requests to `/api/generate/voice`, `/api/generate/sound`, and `/api/generate/image`. On success an adapter must return `{"video_url": "/api/videos/<id>"}` and implement secure video delivery.

For local development, set `ALLOWED_ORIGINS=http://localhost:3000` (adjust for the actual Vite port). For production, set it to the exact GitHub Pages origin.

## Required before production

Implement compatible, separately tested GPU model adapters for each mode; validate and limit uploads, add authentication, request queues, timeouts, rate limits, persistent storage, safe download URLs, content checks, and monitoring. Google Colab free sessions are temporary and cannot be treated as a permanent public backend. GitHub Pages only hosts static frontend files.
