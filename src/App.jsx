import { useState } from 'react';
import VideoStudio from './VideoStudio.jsx';
import EarnCredits from './EarnCredits.jsx';
import AdPlacements from './AdPlacements.jsx';

const modes = [
  { id: 'image', icon: '▧', title: 'Image to Video', label: 'Bring a still image to life', from: 'Landscape image', to: 'Cinematic motion', a: 'landscape', b: 'motion', accent: 'violet' },
  { id: 'video', icon: '▣', title: 'Video to Video', label: 'Transform an existing clip', from: 'Original footage', to: 'New visual style', a: 'footage', b: 'anime', accent: 'purple' },
  { id: 'text', icon: '✧', title: 'Text to Video', label: 'Describe a scene to create', from: 'A majestic dragon flying through a stormy sky...', to: 'AI video concept', a: 'prompt', b: 'dragon', accent: 'pink' },
  { id: 'sound', icon: '◉', title: 'Sound to Video', label: 'Turn sound into visuals', from: 'Audio waveform', to: 'Music visuals', a: 'wave', b: 'concert', accent: 'cyan' },
];

export default function App() {
  const [selected, setSelected] = useState('image');
  const [notice, setNotice] = useState('');
  function openMode(mode) {
    setSelected(mode);
    if (mode === 'text') {
      setNotice('Text-to-video needs a model and API connection. You can prepare a prompt, but generation is not available yet.');
      return;
    }
    setNotice('');
    document.getElementById('ai-video-studio')?.scrollIntoView({ behavior: 'smooth' });
  }
  return (
    <div className="ar-site">
      <header className="ar-header">
        <a className="ar-logo" href="#home" aria-label="AR's AI home"><span className="ar-logo-icon">✦</span><span>AR's <strong>AI Studio</strong></span></a>
        <nav className="ar-nav" aria-label="Main navigation">
          <a href="#home" className="ar-nav-active">Generate</a>
          <a href="#ai-video-studio">AI Tools</a>
          <a href="#earn-credits">Earn Credits</a>
          <a href="#about">About</a>
        </nav>
        <span className="ar-free-label">✦ Free-first AI studio</span>
      </header>

      <main id="home">
        <section className="ar-intro">
          <div className="ar-intro-heading">
            <span className="ar-kicker"><span className="ar-pulse" /> CREATE WITHOUT LIMITS · EXPLORE AI</span>
            <h1>What would you like to <span>create today?</span></h1>
            <p>AI Video Generator Suite — turn your images, clips, ideas and sounds into cinematic stories.</p>
          </div>
          <div className="ar-intro-side"><span className="ar-beta">● GPU connection pending</span><span>Choose a workflow below</span></div>
        </section>

        <section className="ar-tools" aria-label="AI video creation modes">
          {modes.map((mode) => (
            <button className={'ar-tool ar-tool-' + mode.accent + (selected === mode.id ? ' ar-selected' : '')} key={mode.id} onClick={() => openMode(mode.id)} type="button">
              <span className="ar-tool-heading"><span className="ar-mode-icon">{mode.icon}</span><span><strong>{mode.title}</strong><small>{mode.label}</small></span><span className="ar-tool-chevron">↗</span></span>
              <span className="ar-visual-row">
                <span className={'ar-visual ar-' + mode.a}>
                  {mode.a === 'prompt' ? <span>A majestic dragon flying through a stormy sky...</span> : mode.a === 'wave' ? <span className="ar-wave-bars">▂▅▃▇▄▆▂▇▅▃▆▂▇</span> : <span className="ar-scene-label">{mode.from}</span>}
                </span>
                <span className="ar-arrow">→</span>
                <span className={'ar-visual ar-' + mode.b}><span className="ar-play">▶</span><span className="ar-scene-label">{mode.to}</span></span>
              </span>
              <span className="ar-tool-footer"><span>{mode.id === 'text' || mode.id === 'sound' ? 'Model not connected' : 'Open generator'}</span><span className="ar-footer-arrow">→</span></span>
            </button>
          ))}
        </section>
        {notice && <p className="ar-notice" role="status">{notice}</p>}
        <section className="ar-bottom-note" id="about">
          <div><strong>✦ One studio. Endless ideas.</strong><p>Make your next story, cinematic clip or creative experiment in AR's AI.</p></div>
          <a href="#ai-video-studio">Explore video studio <span>↗</span></a>
        </section>
        <AdPlacements format="banner" />
        <VideoStudio />
        <AdPlacements format="native" />
        <EarnCredits />
      </main>
      <footer className="ar-footer"><span>✦ AR's AI Studio</span><span>Independent AI video creation project · Generation depends on connected providers</span></footer>
    </div>
  );
}
