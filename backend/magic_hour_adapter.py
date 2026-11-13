"""Magic Hour hosted generation adapter. Opt-in: calls spend account credits."""
import os
import shutil
from pathlib import Path


def configured():
    return os.getenv("MAGIC_HOUR_ENABLE_GENERATION") == "1" and bool(os.getenv("MAGIC_HOUR_API_KEY"))


def generate_magic_video(mode: str, input_path: Path, output_path: Path, prompt: str):
    if not configured():
        raise RuntimeError("Magic Hour not explicitly enabled")
    from magic_hour import Client
    client = Client(token=os.environ["MAGIC_HOUR_API_KEY"])
    common = dict(
        name="ARs AI test",
        wait_for_completion=True,
        download_outputs=True,
        download_directory=str(output_path.parent),
    )
    if mode == "image":
        response = client.v1.image_to_video.generate(
            assets={"image_file_path": str(input_path)},
            end_seconds=3.0,
            model="ltx-2.3",
            resolution="480p",
            style={"prompt": prompt or "Natural cinematic movement"},
            **common,
        )
    elif mode == "video":
        response = client.v1.video_to_video.generate(
            assets={"video_source": "file", "video_file_path": str(input_path)},
            start_seconds=0.0,
            end_seconds=3.0,
            fps_resolution="half",
            style={"art_style": "minecraft", "prompt": prompt or "Cinematic scene", "prompt_type": "default", "model": "default", "version": "default"},
            **common,
        )
    else:
        raise ValueError("Unsupported Magic Hour mode")
    paths = getattr(response, "downloaded_paths", None) or []
    if getattr(response, "status", None) != "complete" or not paths:
        raise RuntimeError("Magic Hour did not return a completed downloaded video")
    candidate = Path(paths[0])
    if not candidate.is_file() or candidate.suffix.lower() != ".mp4" or candidate.stat().st_size == 0:
        raise RuntimeError("Magic Hour output is not a valid MP4 path")
    if candidate.resolve() != output_path.resolve():
        shutil.copyfile(candidate, output_path)
