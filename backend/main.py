"""AR's AI API: optional GPU adapters plus local Blender procedural 3D rendering."""
import asyncio
import os
import tempfile
import uuid
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from image_model import generate_image_video, gpu_ready
from video_model import generate_video_video
from hf_space import configured as hf_configured, generate_hf_video
from magic_hour_adapter import configured as magic_configured, generate_magic_video
from blender_model import blender_binary, render_title

app = FastAPI(title="AR's AI Video API", version="0.3.0")
origins = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "").split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST"], allow_headers=["*"])

OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", tempfile.gettempdir())) / "ars_ai_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
MAX_BYTES = 20 * 1024 * 1024
ENABLED = os.getenv("ENABLE_IMAGE_MODEL", "0") == "1"
VIDEO_ENABLED = os.getenv("ENABLE_VIDEO_MODEL", "0") == "1"
SEMAPHORE = asyncio.Semaphore(1)
BLENDER_SEMAPHORE = asyncio.Semaphore(1)
PAID_GENERATION_ALLOWED = os.getenv("ALLOW_PAID_GENERATION", "0") == "1"


class BlenderRequest(BaseModel):
    title: str = Field(min_length=1, max_length=64)
    style: str = Field(default="cosmic", pattern="^(cosmic|gold|emerald)$")
    duration_seconds: int = Field(default=5, ge=5, le=8)


def image_ready():
    return ENABLED and gpu_ready()


@app.get("/api/health")
def health():
    return {"status": "online", "gpu_generation": image_ready(), "blender": bool(blender_binary()),
            "note": "GPU detection is not a successful inference test."}


@app.get("/api/capabilities")
def capabilities():
    return {
        "voice": {"available": False, "reason": "Voice-to-video model not configured."},
        "sound": {"available": False, "reason": "Sound-to-video model not configured."},
        "video": {"available": (hf_configured("video") or (VIDEO_ENABLED and gpu_ready())), "reason": "Provider configuration detected; generation untested." if VIDEO_ENABLED and gpu_ready() else "Enable video model and attach CUDA GPU."},
        "image": {"available": ((magic_configured() and PAID_GENERATION_ALLOWED) or hf_configured("image") or image_ready()), "reason": "Configuration detected; inference untested." if image_ready() else "Enable image model and attach a CUDA GPU."},
        "blender_3d": {"available": bool(blender_binary()), "reason": "Install Blender and set BLENDER_BIN to enable local 3D rendering."},
    }


@app.get("/api/videos/{video_id}")
def video(video_id: uuid.UUID):
    path = OUTPUT_DIR / f"{video_id}.mp4"
    if not path.is_file():
        raise HTTPException(404, "Video not found or runtime expired.")
    return FileResponse(path, media_type="video/mp4", filename="ars-ai-video.mp4")


@app.post("/api/generate/blender")
async def generate_blender_video(request: BlenderRequest):
    if not blender_binary():
        raise HTTPException(503, "Blender not found. Install Blender and set BLENDER_BIN in the backend environment.")
    if BLENDER_SEMAPHORE.locked():
        raise HTTPException(429, "Blender is already rendering another 3D video. Try again later.")
    video_id = uuid.uuid4()
    output_path = OUTPUT_DIR / f"{video_id}.mp4"
    try:
        async with BLENDER_SEMAPHORE:
            await asyncio.to_thread(render_title, request.title.strip(), request.style,
                                    request.duration_seconds, output_path)
    except Exception as exc:
        output_path.unlink(missing_ok=True)
        message = str(exc)
        if "timed out" in message.lower():
            raise HTTPException(504, "Blender render exceeded the 15-minute limit.") from exc
        # Keep server internals out of a public response; full details remain in backend logs.
        print(f"Blender render error: {message}")
        raise HTTPException(503, "Blender could not render the video. Check the backend terminal log.") from exc
    return {"video_url": f"/api/videos/{video_id}"}


@app.post("/api/generate/{mode}")
async def generate(mode: str, file: UploadFile = File(...), prompt: str = Form("")):
    if mode not in ("voice", "sound", "image", "video"):
        raise HTTPException(404, "Unknown generation mode.")
    if mode not in ("image", "video"):
        raise HTTPException(503, f"{mode} AI model is not configured.")
    if mode == "image" and not (image_ready() or hf_configured("image") or (magic_configured() and PAID_GENERATION_ALLOWED)):
        raise HTTPException(503, "Image-to-video model is disabled or CUDA GPU unavailable.")
    if mode == "video" and not (hf_configured("video") or (VIDEO_ENABLED and gpu_ready())):
        raise HTTPException(503, "Video-to-video model disabled or CUDA GPU unavailable.")
    if mode == "video" and file.content_type not in ("video/mp4", "video/webm", "video/quicktime"):
        raise HTTPException(415, "Use MP4, WebM or MOV.")
    if mode == "image" and file.content_type not in ("image/png", "image/jpeg", "image/webp"):
        raise HTTPException(415, "Use PNG, JPEG or WebP.")
    if len(prompt) > 2000:
        raise HTTPException(422, "Prompt too long.")
    raw = await file.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES:
        raise HTTPException(413, "Image exceeds 20 MB.")
    if not raw:
        raise HTTPException(422, "Empty source file.")
    from PIL import Image, UnidentifiedImageError
    import io
    if mode == "image":
        try:
            with Image.open(io.BytesIO(raw)) as im:
                im.verify()
        except (UnidentifiedImageError, OSError, ValueError):
            raise HTTPException(422, "Invalid image content.")
    if SEMAPHORE.locked():
        raise HTTPException(429, "GPU is busy. Try again later.")
    file_id = uuid.uuid4()
    suffix = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp",
               "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov" }[file.content_type]
    input_path = OUTPUT_DIR / f"{file_id}{suffix}"
    output_path = OUTPUT_DIR / f"{file_id}.mp4"
    try:
        async with SEMAPHORE:
            await asyncio.to_thread(input_path.write_bytes, raw)
            if hf_configured(mode):
                await asyncio.to_thread(generate_hf_video, mode, input_path, output_path, prompt)
            elif mode == "image" and magic_configured() and PAID_GENERATION_ALLOWED:
                await asyncio.to_thread(generate_magic_video, mode, input_path, output_path, prompt)
            else:
                await asyncio.to_thread(generate_image_video if mode == "image" else generate_video_video, input_path, output_path, prompt)
    except Exception as exc:
        output_path.unlink(missing_ok=True)
        raise HTTPException(503, "AI video inference failed; check server logs and GPU memory.") from exc
    finally:
        input_path.unlink(missing_ok=True)
    return {"video_url": f"/api/videos/{file_id}"}
