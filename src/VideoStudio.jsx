import { useState } from 'react';

const tools = [
  { id: 'voice', title: 'Voice to Video', accept: 'audio/*', description: 'Upload spoken audio for a talking-character workflow.' },
  { id: 'sound', title: 'Sound to Video', accept: 'audio/*', description: 'Upload music or sound to generate visuals.' },
  { id: 'image', title: 'Image to Video', accept: 'image/*', description: 'Upload a still image to animate it.' },
  { id: 'video', title: 'Video to Video', accept: 'video/mp4,video/webm,video/quicktime', description: 'Experimental AI frame-by-frame restyling. Motion may flicker; original audio is not preserved.' },
];

export default function VideoStudio() {
  const [mode, setMode] = useState('image');
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const selected = tools.find((tool) => tool.id === mode);
  const apiUrl = (import.meta.env.VITE_VIDEO_API_URL || '').replace(/\/$/, '');

  async function generate(event) {
    event.preventDefault();
    setVideoUrl('');
    if (!file) { setStatus('Please choose a file.'); return; }
    if (!apiUrl) { setStatus('AI backend not connected. Set VITE_VIDEO_API_URL to a running GPU API endpoint.'); return; }
    const data = new FormData();
    data.append('file', file);
    data.append('prompt', prompt);
    setBusy(true);
    setStatus('Submitting generation request...');
    try {
      const response = await fetch(`${apiUrl}/api/generate/${mode}`, { method: 'POST', body: data });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.detail || `API error ${response.status}`);
      if (!body.video_url) throw new Error('Backend did not return a video URL.');
      setVideoUrl(new URL(body.video_url, apiUrl).href);
      setStatus('Video ready.');
    } catch (error) {
      setStatus(`Generation unavailable: ${error.message}`);
    } finally { setBusy(false); }
  }

  return (
    <section id="ai-video-studio" style={{ padding: '64px 5%', background: '#101827', color: '#fff' }}>
      <div style={{ maxWidth: 900, margin: 'auto' }}>
        <p style={{ color: '#93c5fd', fontWeight: 700 }}>AR's AI · GPU generation</p>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', marginBottom: 12 }}>AI Video Studio</h2>
        <p style={{ color: '#cbd5e1' }}>Choose a workflow. Real generation requires a configured backend and available models/GPU.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '24px 0' }}>
          {tools.map((tool) => <button key={tool.id} type="button" onClick={() => { setMode(tool.id); setFile(null); setVideoUrl(''); setStatus(''); }} style={{ border: '1px solid #64748b', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', background: mode === tool.id ? '#2563eb' : '#1e293b', color: '#fff' }}>{tool.title}</button>)}
        </div>
        <form onSubmit={generate} style={{ background: '#1e293b', borderRadius: 16, padding: 24, display: 'grid', gap: 16 }}>
          <h3>{selected.title}</h3>
          <p style={{ color: '#cbd5e1' }}>{selected.description}</p>
          <label>Source file
            <input key={mode} type="file" accept={selected.accept} onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: 'block', marginTop: 8, width: '100%' }} />
          </label>
          <label>Video prompt (optional)
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} placeholder="Describe the scene, character, and camera motion" style={{ display: 'block', marginTop: 8, width: '100%', padding: 12, borderRadius: 8, color: '#111' }} />
          </label>
          <button type="submit" disabled={busy || !file} style={{ padding: 14, borderRadius: 9, background: '#2563eb', color: '#fff', border: 0, cursor: 'pointer', opacity: busy || !file ? 0.6 : 1 }}>{busy ? 'Generating...' : 'Generate video'}</button>
          <p role="status" aria-live="polite" style={{ color: '#fbbf24' }}>{status || (!apiUrl ? 'Backend not configured — generation disabled until connected.' : 'Backend URL configured; availability not verified.')}</p>
          {videoUrl && <div><video src={videoUrl} controls style={{ maxWidth: '100%', width: 600 }} /><p><a href={videoUrl} download style={{ color: '#93c5fd' }}>Download video</a></p></div>}
        </form>
      </div>
    </section>
  );
}
