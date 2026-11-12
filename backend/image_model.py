"""Lazy CogVideoX 5B image-to-video adapter. Requires a real CUDA GPU."""
import os
import threading
from pathlib import Path

_MODEL = None
_LOCK = threading.Lock()
MODEL_ID = os.getenv("I2V_MODEL_ID", "THUDM/CogVideoX-5b-I2V")


def gpu_ready():
    try:
        import torch
        return bool(torch.cuda.is_available())
    except (ImportError, RuntimeError):
        return False


def generate_image_video(image_path: Path, output_path: Path, prompt: str):
    if not gpu_ready():
        raise RuntimeError("CUDA GPU is unavailable")
    import torch
    from PIL import Image, ImageOps
    from diffusers import CogVideoXImageToVideoPipeline
    from diffusers.utils import export_to_video

    global _MODEL
    with _LOCK:  # Avoid simultaneous large inference jobs on one T4.
        if _MODEL is None:
            _MODEL = CogVideoXImageToVideoPipeline.from_pretrained(
                MODEL_ID, torch_dtype=torch.float16
            )
            _MODEL.enable_sequential_cpu_offload()
            _MODEL.vae.enable_tiling()
            _MODEL.vae.enable_slicing()

        with Image.open(image_path) as source:
            image = ImageOps.exif_transpose(source).convert("RGB")
            # CogVideoX 5B I2V baseline; 720 x 480.
            image = ImageOps.fit(image, (720, 480), method=Image.Resampling.LANCZOS)

        frames = _MODEL(
            prompt=prompt or "Cinematic realistic gentle motion, steady camera, natural lighting.",
            image=image,
            num_videos_per_prompt=1,
            num_inference_steps=50,
            num_frames=49,
            guidance_scale=6,
            generator=torch.Generator(device="cpu").manual_seed(42),
        ).frames[0]
        export_to_video(frames, str(output_path), fps=8)
    if not output_path.is_file() or output_path.stat().st_size == 0:
        raise RuntimeError("Model returned no video file")
    return output_path
