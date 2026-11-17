"""Optional Blender CPU render adapter for procedural 3D title videos."""
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

SCRIPT = Path(__file__).with_name("blender_title_scene.py")


def blender_binary():
    configured = os.getenv("BLENDER_BIN", "blender")
    found = shutil.which(configured)
    if found:
        return found
    candidate = Path(configured)
    if candidate.is_file():
        return str(candidate)
    return None


def render_title(title: str, style: str, duration: int, output_path: Path) -> None:
    binary = blender_binary()
    if not binary:
        raise RuntimeError("Blender executable not found. Install Blender or set BLENDER_BIN.")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="ars-blender-") as temp_dir:
        log_path = Path(temp_dir) / "blender.log"
        command = [
            binary, "-b", "--factory-startup", "--python-exit-code", "1",
            "--python", str(SCRIPT), "--", title, style, str(duration), str(output_path),
        ]
        with log_path.open("w", encoding="utf-8", errors="replace") as log:
            result = subprocess.run(command, stdout=log, stderr=subprocess.STDOUT,
                                    timeout=900, check=False)
        if result.returncode != 0 or not output_path.is_file():
            tail = log_path.read_text(encoding="utf-8", errors="replace")[-3000:]
            raise RuntimeError(f"Blender render failed (exit {result.returncode}). Log tail: {tail}")
