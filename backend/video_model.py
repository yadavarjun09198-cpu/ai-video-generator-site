"""Experimental frame-wise Stable Diffusion video stylization; not temporally consistent."""
import os
import threading
from pathlib import Path

_LOCK = threading.Lock()
_PIPE = None
MODEL_ID = os.getenv("V2V_MODEL_ID", "runwayml/stable-diffusion-v1-5")


def generate_video_video(input_path: Path, output_path: Path, prompt: str):
    import cv2
    import torch
    from PIL import Image
    from diffusers import StableDiffusionImg2ImgPipeline
    if not torch.cuda.is_available():
        raise RuntimeError("CUDA GPU unavailable")
    global _PIPE
    with _LOCK:
        if _PIPE is None:
            _PIPE = StableDiffusionImg2ImgPipeline.from_pretrained(
                MODEL_ID, torch_dtype=torch.float16, safety_checker=None,
                requires_safety_checker=False,
            )
            _PIPE.enable_model_cpu_offload()
            _PIPE.enable_attention_slicing()
        capture = cv2.VideoCapture(str(input_path))
        if not capture.isOpened():
            raise ValueError("Video decoder could not open uploaded file")
        fps = capture.get(cv2.CAP_PROP_FPS) or 8
        frames_total = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        # Limit decoding and GPU time: maximum 24 frames sampled at up to 4 fps.
        stride = max(1, round(fps / 4))
        writer = cv2.VideoWriter(str(output_path), cv2.VideoWriter_fourcc(*"mp4v"), min(4, fps), (512, 512))
        if not writer.isOpened():
            capture.release()
            raise RuntimeError("MP4 encoder unavailable")
        processed = 0
        index = 0
        try:
            while processed < 24:
                ok, frame = capture.read()
                if not ok:
                    break
                if index % stride:
                    index += 1
                    continue
                index += 1
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image = Image.fromarray(rgb).resize((512, 512))
                result = _PIPE(
                    prompt=prompt or "Cinematic detailed film look",
                    image=image, strength=0.35, guidance_scale=6,
                    num_inference_steps=20,
                    generator=torch.Generator(device="cpu").manual_seed(42 + processed),
                ).images[0]
                writer.write(cv2.cvtColor(__import__("numpy").array(result), cv2.COLOR_RGB2BGR))
                processed += 1
        finally:
            writer.release()
            capture.release()
        if processed == 0 or not output_path.exists() or output_path.stat().st_size == 0:
            raise RuntimeError("No video frames processed")
    return output_path
