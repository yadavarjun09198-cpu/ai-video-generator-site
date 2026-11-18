import { useState } from 'react';

const styles = {
  cosmic: 'Cosmic blue',
  gold: 'Royal gold',
  emerald: 'Emerald glow',
};

export default function BlenderStudio() {
  const [title, setTitle] = useState('AR Studio');
  const [style, setStyle] = useState('cosmic');
  const [duration, setDuration] = useState(5);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const apiUrl = (import.meta.env.VITE_VIDEO_API_URL || '').replace(/\/$/, '');

  async function generate(event) {
    event.preventDefault();
    setVideoUrl('');
    if (!apiUrl) {
      setStatus('Backend URL set nahi hai. Pehle backend ko Windows PC par chalayen; setup guide neeche di gayi hai.');
      return;
    }
    setBusy(true);
    setStatus('Blender 3D scene render kar raha hai. CPU par ismein kuch samay lag sakta hai...');
    try {
      const response = await fetch(apiUrl + '/api/generate/blender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, style, duration_seconds: Number(duration) }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.detail || 'API error ' + response.status);
      setVideoUrl(new URL(body.video_url, apiUrl).href);
      setStatus('Aapka 3D MP4 video taiyar hai.');
    } catch (error) {
      setStatus('Video nahi bana: ' + error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="blender-3d-studio" className="blender-studio">
      <div className="blender-studio-card">
        <p className="blender-kicker">REAL 3D · BLENDER</p>
        <h2>3D Animation Studio</h2>
        <p className="blender-copy">3D title, animated objects, studio lighting aur MP4 rendering. Blender backend aapke computer par chalta hai; GPU zaroori nahi, lekin CPU render dheema ho sakta hai.</p>
        <form onSubmit={generate}>
          <label>Video mein dikhne wala title
            <input value={title} onChange={event => setTitle(event.target.value)} maxLength={64} required />
          </label>
          <div className="blender-fields">
            <label>Scene style
              <select value={style} onChange={event => setStyle(event.target.value)}>
                {Object.entries(styles).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
              </select>
            </label>
            <label>Duration
              <select value={duration} onChange={event => setDuration(event.target.value)}>
                <option value="5">5 seconds</option><option value="8">8 seconds</option>
              </select>
            </label>
          </div>
          <button className="blender-generate" type="submit" disabled={busy}>{busy ? 'Rendering 3D video…' : 'Create 3D MP4'}</button>
        </form>
        <p role="status" aria-live="polite" className="blender-status">{status || 'This creates a procedural 3D title animation, not an AI-generated model from any arbitrary prompt.'}</p>
        {videoUrl && <div className="blender-result"><video src={videoUrl} controls /><a href={videoUrl} download="ars-ai-3d-title.mp4">Download MP4</a></div>}
        <details className="blender-help">
          <summary>Windows setup steps</summary>
          <ol>
            <li>Install Blender from blender.org and note where Blender.exe is installed.</li>
            <li>Run the AR’s AI backend from the repository’s <code>backend</code> folder.</li>
            <li>Set <code>BLENDER_BIN</code> to Blender.exe and set <code>VITE_VIDEO_API_URL</code> to the backend address.</li>
            <li>Open the website locally; keep the backend window running while rendering.</li>
          </ol>
          <a href="https://github.com/yadavarjun09198-cpu/ai-video-generator-site/blob/main/backend/BLENDER_3D_SETUP_HI.md" target="_blank" rel="noreferrer">Open complete Hindi setup guide ↗</a>
        </details>
      </div>
    </section>
  );
}
