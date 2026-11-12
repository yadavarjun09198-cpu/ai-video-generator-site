# AR's AI: experimental CogVideoX image-to-video on Colab T4

**Not tested on a live T4 in this repository.** CogVideoX 5B I2V is a genuine model; the existing CogVideoX 2B text-to-video model is NOT an I2V model. Free Colab sessions and T4 memory/time limits can interrupt inference.

1. In Google Colab select Runtime > Change runtime type > T4 GPU.
2. Clone the repository, install dependencies, and start the backend (example cells):

```python
!git clone https://github.com/yadavarjun09198-cpu/ai-video-generator-site.git
%cd ai-video-generator-site/backend
!pip install -r requirements-gpu.txt
!nvidia-smi
```

```python
import os
os.environ["ENABLE_IMAGE_MODEL"] = "1"
os.environ["ALLOWED_ORIGINS"] = "https://yadavarjun09198-cpu.github.io"
# Run the API only for private/local testing first.
import subprocess
server = subprocess.Popen(["uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"])
```

3. Upload an image to Colab and test **locally** with a POST request, e.g.:

```python
import requests
with open("/content/test.png", "rb") as image:
    response = requests.post(
        "http://127.0.0.1:8000/api/generate/image",
        files={"file": ("test.png", image, "image/png")},
        data={"prompt": "Gentle natural movement, steady cinematic camera."},
        timeout=3600,
    )
print(response.status_code, response.text[:1000])
```

If successful, GET `http://127.0.0.1:8000` + returned `video_url` to retrieve the MP4. Large model downloads, RAM/VRAM, and CPU offload can take substantial time. A T4 may still fail.

**Do not expose this development API publicly:** it has no authentication, per-user isolation, or rate limits beyond one active GPU job. Public website integration needs an authenticated HTTPS GPU deployment and a rebuild with `VITE_VIDEO_API_URL` set to that URL. GitHub Pages cannot run Python/GPU code. Video files are temporary and are lost on Colab restart.
