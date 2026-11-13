"""Opt-in Gradio Space bridge. Never assumes arbitrary Spaces share an API schema."""
import os
import shutil
from pathlib import Path
from urllib.parse import urlparse


def configured(mode):
    return bool(os.getenv(f"HF_{mode.upper()}_SPACE", "").strip() and os.getenv(f"HF_{mode.upper()}_API_NAME", "").startswith("/"))


def generate_hf_video(mode: str, input_path: Path, output_path: Path, prompt: str):
    from gradio_client import Client, handle_file
    space = os.environ[f"HF_{mode.upper()}_SPACE"].strip()
    endpoint = os.environ[f"HF_{mode.upper()}_API_NAME"].strip()
    if not endpoint.startswith("/"):
        raise ValueError("Invalid Gradio API endpoint")
    # Only explicit owner/space identifiers; no user-supplied endpoints or arbitrary URLs.
    if len(space.split("/")) != 2 or not all(part.replace("-", "").replace("_", "").isalnum() for part in space.split("/")):
        raise ValueError("HF Space must be owner/space-name")
    token = os.getenv("HF_TOKEN") or None
    client = Client(space, token=token)
    # Requires the selected Space's API to accept (file, prompt) IN THIS ORDER.
    result = client.predict(handle_file(str(input_path)), prompt, api_name=endpoint)
    if isinstance(result, dict):
        result = result.get("video") or result.get("path") or result.get("value")
    if isinstance(result, (list, tuple)) and result:
        result = result[0]
    if isinstance(result, dict):
        result = result.get("video") or result.get("path") or result.get("value")
    if not isinstance(result, str):
        raise ValueError("Space did not return a downloadable video file")
    # Gradio client downloads file results to local cache; reject URL/path tricks.
    candidate = Path(result)
    if urlparse(result).scheme or not candidate.is_file() or candidate.suffix.lower() != ".mp4":
        raise ValueError("Space response is not a local MP4 file")
    if candidate.stat().st_size == 0:
        raise ValueError("Space returned empty MP4")
    shutil.copyfile(candidate, output_path)
