import { useState } from 'react';
import VideoStudio from './VideoStudio.jsx';
import EarnCredits from './EarnCredits.jsx';
import AdPlacements from './AdPlacements.jsx';

const modes = [
  { id:'image', icon:'▧', title:'Image to Video', desc:'Bring your photos to life with cinematic motion.', from:'landscape', to:'motion', accent:'blue', action:'Choose an image' },
  { id:'video', icon:'▣', title:'Video to Video', desc:'Transform a clip into a whole new visual style.', from:'footage', to:'anime', accent:'purple', action:'Choose a video' },
  { id:'text', icon:'✧', title:'Text to Video', desc:'Turn an imaginative prompt into a video concept.', from:'prompt', to:'dragon', accent:'blue', action:'Explore text prompts' },
  { id:'sound', icon:'◉', title:'Sound to Video', desc:'Visual storytelling powered by your music or voice.', from:'wave', to:'concert', accent:'cyan', action:'Choose an audio file' }
];

export default function App() {
  const [selected,setSelected] = useState('image');
  const [notice,setNotice] = useState('');
  function openMode(mode) {
    setSelected(mode);
    if(mode==='text'){
      setNotice('Text-to-video generation is not connected yet. You can explore the concept, but a compatible GPU model and API are required.');
      return;
    }
    setNotice('');
    document.getElementById('ai-video-studio')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  return (
    <div className="ar-site">
      <header className="ar-header">
        <a href="#home" className="ar-logo" aria-label="AR's AI home"><span className="ar-logo-icon">▶</span><span><strong>AR's AI</strong> <em>Studio</em><small>✦ AI Video Generator Suite</small></span></a>
        <nav className="ar-nav" aria-label="Main navigation">
          <a href="#home" className="ar-nav-active">✧ Generate</a>
          <a href="#ai-video-studio">✿ AI Tools</a>
          <a href="#about">▣ About</a>
          <a href="#earn-credits">◉ Earn Credits</a>
        </nav>
        <span className="ar-free-label">✦ Free-first Studio</span>
      </header>
      <main id="home">
        <section className="ar-intro">
          <div className="ar-intro-heading">
            <span className="ar-kicker">CREATE WITHOUT LIMITS</span>
            <h1>What would you like to <span>create today?</span></h1>
            <p>AI Video Generator Suite</p>
          </div>
          <span className="ar-beta">● GPU connection pending</span>
        </section>
        <section className="ar-tools" aria-label="AI video creation modes">
          {modes.map(m=>(
            <button type="button" key={m.id} className={'ar-tool ar-tool-'+m.accent+(selected===m.id?' ar-selected':'')} onClick={()=>openMode(m.id)}>
              <span className="ar-tool-heading"><span className="ar-mode-icon">{m.icon}</span><span><strong>{m.title}</strong><small>{m.desc}</small></span><span className="ar-tool-chevron">↗</span></span>
              <span className="ar-visual-row">
                <span className={'ar-visual ar-'+m.from}>{m.id==='text'?<span className="ar-prompt-copy">A majestic dragon flying through a stormy sky over ancient ruins...</span>:m.id==='sound'?<span className="ar-wave-bars">▂▅▇▃▆▂▇▅▃▆▂</span>:<span className="ar-preview-label">{m.id==='image'?'PHOTO':'ORIGINAL'}</span>}</span>
                <span className="ar-arrow">➜</span>
                <span className={'ar-visual ar-'+m.to}><span className="ar-play">▶</span><span className="ar-preview-label">PREVIEW</span></span>
              </span>
              <span className="ar-tool-footer"><span>{m.action}</span><span>↗</span></span>
            </button>
          ))}
        </section>
        {notice && <p role="status" className="ar-notice">{notice}</p>}
        <div className="ar-studio-heading" id="about"><div><span>✦ AR'S AI VIDEO STUDIO</span><h2>Your ideas. Your cinematic world.</h2><p>Upload your source, describe your scene, then generate when an AI model is connected.</p></div><a href="#ai-video-studio">Open Studio <b>↗</b></a></div>
        <div className="ar-feature-row"><span><b>✦</b> Cinematic Motion</span><span><b>◇</b> Creative Video Effects</span><span><b>◈</b> AI Animation</span><span><b>⚡</b> GPU Powered (when connected)</span></div>
        <AdPlacements format="banner"/>
        <VideoStudio initialMode={selected === 'text' ? 'image' : selected}/>
        <AdPlacements format="native"/>
        <EarnCredits/>
      </main>
      <footer className="ar-footer"><strong>▶ AR's AI Studio</strong><span>Independent creative project · Video generation depends on available model and GPU providers</span></footer>
    </div>
  );
}
