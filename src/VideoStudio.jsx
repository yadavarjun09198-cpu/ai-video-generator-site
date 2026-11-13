import { useEffect, useMemo, useRef, useState } from 'react';

const tools = [
  { id: 'voice', title: 'Voice to Video', accept: 'audio/*', description: 'Upload spoken audio for a talking-character workflow.' },
  { id: 'sound', title: 'Sound to Video', accept: 'audio/*', description: 'Upload music or sound to generate visuals.' },
  { id: 'image', title: 'Image to Video', accept: 'image/*', description: 'Upload a still image to animate it.' },
  { id: 'video', title: 'Video to Video', accept: 'video/mp4,video/webm,video/quicktime', description: 'Restyle a clip with an AI model.' },
];

const templates = [
  { id: 'cinematic', name: 'Cinematic', ratio: '16:9', prompt: 'Cinematic lighting, slow camera push-in, dramatic atmosphere' },
  { id: 'shorts', name: 'YouTube Shorts', ratio: '9:16', prompt: 'Vertical 9:16 composition, bold opening, fast visual pacing' },
  { id: 'devotional', name: 'Devotional', ratio: '16:9', prompt: 'Respectful devotional visuals, warm golden light, calm camera motion' },
  { id: 'travel', name: 'Travel', ratio: '16:9', prompt: 'Vivid travel film, natural light, smooth establishing shots' },
];

const filters = [
  { id: 'none', name: 'Original', css: 'none' },
  { id: 'warm', name: 'Warm', css: 'sepia(.28) saturate(1.2)' },
  { id: 'cool', name: 'Cool', css: 'saturate(.9) hue-rotate(12deg)' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(.4) contrast(.9) saturate(.8)' },
  { id: 'mono', name: 'B&W', css: 'grayscale(1)' },
];

const soundtracks = [
  { id: 'ambient', name: 'Original Ambient', notes: [220, 330, 440], wave: 'sine' },
  { id: 'cinematic', name: 'Original Cinematic Pulse', notes: [110, 164.81, 220], wave: 'triangle' },
  { id: 'devotional', name: 'Original Calm Chimes', notes: [261.63, 329.63, 392], wave: 'sine' },
];

export default function VideoStudio({ initialMode = 'image' }) {
  const [mode, setMode] = useState(initialMode);
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [templateId, setTemplateId] = useState('cinematic');
  const [filterId, setFilterId] = useState('none');
  const [overlayText, setOverlayText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(28);
  const [soundtrackId, setSoundtrackId] = useState('ambient');
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const soundTimer = useRef(null);
  const soundNodes = useRef([]);
  const selected = tools.find((tool) => tool.id === mode);
  const template = templates.find((item) => item.id === templateId);
  const filter = filters.find((item) => item.id === filterId);
  const soundtrack = soundtracks.find((item) => item.id === soundtrackId);
  const apiUrl = (import.meta.env.VITE_VIDEO_API_URL || '').replace(/\/$/, '');
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : '', [file]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => {
    if (['image','video','sound','voice'].includes(initialMode)) {
      setMode(initialMode); setFile(null); setVideoUrl(''); setStatus('');
    }
  }, [initialMode]);
  useEffect(() => () => stopSound(), []);

  function stopSound() {
    if (soundTimer.current) window.clearTimeout(soundTimer.current);
    soundNodes.current.forEach((node) => { try { node.stop(); } catch {} });
    soundNodes.current = [];
    soundTimer.current = null;
    setSoundPlaying(false);
  }

  async function previewSound() {
    if (soundPlaying) { stopSound(); return; }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) { setStatus('Sound preview is not supported by this browser.'); return; }
    const context = new AudioContextClass();
    await context.resume();
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.3);
    master.gain.setTargetAtTime(0.0001, context.currentTime + 6.5, 0.8);
    master.connect(context.destination);
    const nodes = soundtrack.notes.map((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = soundtrack.wave;
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 0 ? 0.26 : 0.14;
      oscillator.connect(gain); gain.connect(master);
      oscillator.start();
      oscillator.stop(context.currentTime + 8);
      return oscillator;
    });
    soundNodes.current = nodes;
    setSoundPlaying(true);
    soundTimer.current = window.setTimeout(() => {
      soundNodes.current = [];
      soundTimer.current = null;
      setSoundPlaying(false);
      context.close();
    }, 8200);
  }

  function chooseTemplate(id) {
    setTemplateId(id);
    const chosen = templates.find((item) => item.id === id);
    setPrompt((current) => current ? current : chosen.prompt);
  }

  async function generate(event) {
    event.preventDefault();
    setVideoUrl('');
    if (!file) { setStatus('Please choose a source file.'); return; }
    if (!apiUrl) { setStatus('AI backend not connected. Set VITE_VIDEO_API_URL to a running GPU API endpoint.'); return; }
    const data = new FormData();
    data.append('file', file);
    data.append('prompt', prompt);
    data.append('template', templateId);
    data.append('aspect_ratio', template.ratio);
    data.append('filter', filterId);
    data.append('overlay_text', overlayText);
    data.append('overlay_text_color', textColor);
    data.append('overlay_text_size', String(textSize));
    data.append('soundtrack', soundtrackId);
    setBusy(true);
    setStatus('Submitting generation request...');
    try {
      const response = await fetch(apiUrl + '/api/generate/' + mode, { method: 'POST', body: data });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.detail || 'API error ' + response.status);
      if (!body.video_url) throw new Error('Backend did not return a video URL.');
      setVideoUrl(new URL(body.video_url, apiUrl).href);
      setStatus('Video ready.');
    } catch (error) {
      setStatus('Generation unavailable: ' + error.message);
    } finally { setBusy(false); }
  }

  return (
    <section id="ai-video-studio" className="studio-wrap">
      <div className="studio-inner">
        <p className="studio-eyebrow">AR'S AI · CREATION STUDIO</p>
        <h2 className="studio-title">AI Video Studio</h2>
        <p className="studio-lead">Pick a workflow, style your video, add title text and choose an original sound bed.</p>
        <div className="studio-mode-row">
          {tools.map((tool) => <button key={tool.id} type="button" onClick={() => { setMode(tool.id); setFile(null); setVideoUrl(''); setStatus(''); }} className={'studio-mode' + (mode === tool.id ? ' active' : '')}>{tool.title}</button>)}
        </div>

        <form onSubmit={generate} className="studio-card">
          <div className="studio-section">
            <h3>1. Choose a template</h3>
            <div className="studio-template-row">
              {templates.map((item) => <button key={item.id} type="button" onClick={() => chooseTemplate(item.id)} className={'studio-template' + (templateId === item.id ? ' active' : '')}><strong>{item.name}</strong><small>{item.ratio} · Start with a prompt</small></button>)}
            </div>
          </div>

          <div className="studio-grid">
            <label className="studio-field">Source file
              <input key={mode} type="file" accept={selected.accept} onChange={(event) => { setFile(event.target.files?.[0] || null); setVideoUrl(''); }} />
              <small>{selected.description}</small>
            </label>
            <label className="studio-field">Video prompt
              <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={4} placeholder="Describe the scene, character and camera motion" />
            </label>
          </div>

          <div className="studio-section">
            <h3>2. Pick a filter</h3>
            <div className="studio-filter-row">
              {filters.map((item) => <button key={item.id} type="button" onClick={() => setFilterId(item.id)} className={'studio-filter' + (filterId === item.id ? ' active' : '')}><span style={{ filter: item.css }} />{item.name}</button>)}
            </div>
          </div>

          <div className="studio-grid studio-edit-grid">
            <div className="studio-field">
              <h3>3. Edit title text</h3>
              <label>Text to show on video
                <input value={overlayText} onChange={(event) => setOverlayText(event.target.value)} maxLength={80} placeholder="Add a title or caption" />
              </label>
              <div className="studio-text-options">
                <label>Text size <input type="range" min="16" max="56" value={textSize} onChange={(event) => setTextSize(Number(event.target.value))} /></label>
                <label>Text color <input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} /></label>
              </div>
            </div>
            <div className="studio-field">
              <h3>4. Copyright-free sound</h3>
              <label>Original soundtrack
                <select value={soundtrackId} onChange={(event) => setSoundtrackId(event.target.value)}>
                  {soundtracks.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <button type="button" className="studio-sound-button" onClick={previewSound}>{soundPlaying ? 'Stop preview' : '▶ Preview original sound'}</button>
              <small>These short sound beds are synthesized in your browser for this project; no third-party music track is used.</small>
            </div>
          </div>

          {file && <div className="studio-preview">
            <div className="studio-preview-media" style={{ aspectRatio: template.ratio.replace(':', ' / ') }}>
              {file.type.startsWith('video/') ? <video src={previewUrl} controls style={{ filter: filter.css }} /> : file.type.startsWith('image/') ? <img src={previewUrl} alt="Uploaded source preview" style={{ filter: filter.css }} /> : <div className="studio-audio-source">Audio source selected</div>}
              {overlayText && <span className="studio-overlay-text" style={{ color: textColor, fontSize: textSize }}>{overlayText}</span>}
            </div>
            <span>Preview · {template.name} · {filter.name}</span>
          </div>}

          <button type="submit" disabled={busy || !file} className="studio-generate">{busy ? 'Generating...' : 'Generate video'}</button>
          <p role="status" aria-live="polite" className="studio-status">{status || (!apiUrl ? 'Connect a GPU backend to generate and render the final video.' : 'Backend URL configured; generation availability depends on the connected service.')}</p>
          {videoUrl && <div className="studio-result"><video src={videoUrl} controls /><p><a href={videoUrl} download>Download video</a></p></div>}
        </form>
      </div>
    </section>
  );
}
