# Experimental Video-to-Video on Google Colab T4

This is **frame-wise Stable Diffusion 1.5 img2img**, not a temporally trained video model. It can flicker, changes frame geometry to 512x512, limits output to 24 sampled frames at up to 4 fps (~6 seconds), and **does not preserve audio**. GPU inference has not been tested in this repository.

## Setup

1. In Colab choose Runtime > Change runtime type > T4 GPU.
2. Run:

```python
!git clone https://github.com/yadavarjun09198-cpu/ai-video-generator-site.git
%cd ai-video-generator-site/backend
!pip install -r requirements-gpu.txt
!nvidia-smi
```

3. Start the API for **local-only** testing:

```python
import os, subprocess
os.environ["ENABLE_VIDEO_MODEL"] = "1"
server = subprocess.Popen(["uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"])
```

4. Upload a short MP4 to `/content/test.mp4` and test:

```python
import requests
with open("/content/test.mp4", "rb") as f:
    result = requests.post("http://127.0.0.1:8000/api/generate/video",
        files={"file": ("test.mp4", f, "video/mp4")},
        data={"prompt": "Beautiful hand-painted fantasy animation, detailed lighting"},
        timeout=3600)
print(result.status_code, result.text[:1000])
```

Only a successful response with a real downloadable MP4 confirms it worked. Model access, GPU RAM, decoder, and dependency compatibility may cause errors. No public deployment is configured. The API lacks authentication and must not be exposed to the internet as-is.
