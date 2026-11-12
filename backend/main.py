"""AR's AI API: explicit GPU model adapters; never returns fake generated videos."""
import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(title="AR's AI Video API", version="0.1.0")
origins = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "").split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST"], allow_headers=["*"])

OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", tempfile.gettempdir())) / "ars_ai_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
MAX_BYTES = 20 * 1024 * 1024
ALLOWED_TYPES = {"voice": ("audio/",), "sound": ("audio/",), "image": ("image/",)}


class Status(BaseModel):
    available: bool
    reason: str


@app.get("/api/health")
def health():
    return {"status": "online", "gpu_generation": False, "reason": "No model adapters are installed or configured."}


@app.get("/api/capabilities")
def capabilities():
    return {name: Status(available=False, reason="GPU model adapter not configured.").model_dump() for name in ALLOWED_TYPES}


@app.post("/api/generate/{mode}")
async def generate(mode: str, file: UploadFile = File(...), prompt: str = Form("")):
    if mode not in ALLOWED_TYPES:
        raise HTTPException(404, "Unknown generation mode.")
    if not file.content_type or not file.content_type.startswith(ALLOWED_TYPES[mode]):
        raise HTTPException(415, "Unsupported source file type.")
    if len(prompt) > 2000:
        raise HTTPException(422, "Prompt must be 2000 characters or fewer.")
    # Reject unavailable inference before accepting/retaining uploads.
    raise HTTPException(
        status_code=503,
        detail=f"{mode} AI generation is not available: compatible GPU model adapter is not configured.",
    )
