# AR's AI Blender 3D Animation — Windows Setup (Hindi)

Yeh first Blender integration ek **procedural 3D title animation** banata hai: extruded 3D text, orbiting spheres, cinematic lights aur camera, MP4 output. Yeh arbitrary text prompt se custom 3D character/model nahi banata. Blender free/open-source hai; GPU required nahi, CPU rendering slow ho sakta hai.

## 1. Install Blender

Download Blender for Windows from https://www.blender.org/download/ and install it. Common executable path:

`C:\Program Files\Blender Foundation\Blender 4.5\blender.exe`

Version folder aapke install ke hisaab se alag ho sakta hai.

## 2. Start backend

Windows Terminal / Command Prompt:

```bat
cd path\to\ai-video-generator-site\backend
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
set BLENDER_BIN=C:\Program Files\Blender Foundation\Blender 4.5\blender.exe
set ALLOWED_ORIGINS=http://localhost:5173
uvicorn main:app --host 127.0.0.1 --port 8000
```

Terminal ko chalu rakhein. Check: http://127.0.0.1:8000/api/health

## 3. Start website

Doosre terminal mein repository root par:

```bat
npm install
set VITE_VIDEO_API_URL=http://127.0.0.1:8000
npm run dev
```

Terminal mein diya gaya local URL, usually http://localhost:5173, browser mein kholen. “3D Animation Studio” mein title/style/duration chunein, phir **Create 3D MP4** click karein.

## Notes

- 5-second render is a good first try; 8 seconds takes longer.
- Blender output is 720p-class MP4 at a modest render sample setting. CPU par render duration computer speed ke hisaab se badlegi.
- Browser-only GitHub Pages cannot run Blender. For public online generation, a separate server with Blender installed, persistent storage, authentication, a render queue, and resource limits is needed.
- The Blender script uses Blender's built-in font. Devanagari/Hindi title glyphs may not render correctly unless a Hindi-capable TTF font is configured.
