import { useMemo, useState } from 'react';

const groups = [
  { name: 'AI Tools', tools: [
    ['Text to Image','Generate images from a text description.'],['Text to Video','Generate video from a text description.'],
    ['Image to Image','Edit an image with an AI model.'],['Multi Images to Image','Edit using one main image and reference images.'],
    ['Image to Video','Animate an uploaded image.'],['Image to Prompt','Describe an uploaded image as a prompt.'],
    ['Image to Text','Extract text with OCR.'],['Background Remover','Remove an image background.']
  ]},
  { name: 'Portrait Style Generators', tools: [
    ['Hairstyle Changer','Try a hairstyle or hair color.'],['Image Style Transfer','Apply an art style to an image.'],
    ['Pet Portrait','Create a stylized pet portrait.'],['Headshot Generator','Create a professional portrait.'],['Anime Portrait','Apply an anime portrait style.']
  ]},
  { name: 'Image Generation Templates', tools: [
    'Zodiac Card Generator','Tattoo Generator','Tarot Card Generator','Relaxing Image Generator','Pixel Art Generator',
    'Pixar Disney Art Generator','Pencil Drawing Art','NFT Art Generator','Miniature World Generator','Mecha Suit Generator',
    'Loli Art Generator','Logo Generator','Illustration Generator','Happy Image Generator','Graffiti Generator',
    'Game Assets Generator','Food Generator','Fashion Sketch Generator','Fantasy Map Generator','Cyberpunk Fashion Generator',
    'Clip Art Generator','Clay Art Generator','Blacklight Art Generator','Anime Art Generator','Album Cover Maker',
    'Watercolor Generator','Wallpaper Generator','Glass Art Generator','Car Generator','Action Figure Generator',
    'Furry AI Art Generator','Random DND Character Generator'
  ].map(name => [name, 'Use this style preset with a connected image model.'])
  },
  { name: 'Image Tools', tools: [
    ['Image Invert','Invert image colors in your browser.','browser'],['Image Grayscale','Convert image to grayscale.','browser'],
    ['Image Black White','Convert image to high-contrast black and white.','browser'],['Image Flip','Flip image horizontally or vertically.','browser'],
    ['Image Blur','Apply a blur in your browser.','browser'],['Face Blur','Blur faces using detection.','service'],
    ['Image Resizer','Resize and export an image.','browser'],['Image HSL','Adjust hue, saturation and lightness.','browser'],
    ['Image Splitter','Split an image into a grid.','browser'],['Image Outline','Create a simple edge outline.','browser'],
    ['Background Blur','Blur the background with subject detection.','service'],['Color Palette','Extract a small palette from an image.','browser'],
    ['Image Combiner','Combine two images side by side.','browser']
  ]},
  { name: 'File Compressors', tools: [
    ['Video Compressor','Compress a video with quality control.','service'],['PDF Compressor','Reduce PDF file size.','service'],
    ['Word Compressor','Reduce Word document size.','service'],['GIF Compressor','Optimize a GIF.','service'],['PPT Compressor','Reduce PowerPoint file size.','service']
  ]},
  { name: 'Emoji Tools', tools: [
    ['Emoji Copy','Browse and copy emojis.','text'],['Kawaii Face','Copy a cute kaomoji.','text'],
    ['Cool Symbols','Copy decorative symbols.','text'],['Face Text','Copy text faces.','text'],['Fancy Font','Convert text to Unicode styles.','text']
  ]}
].map(group => ({...group, tools: group.tools.map(([name, description, kind='ai']) => ({name, description, kind}))}));

const emojis = ['😀','😎','😂','🥰','🔥','✨','🙏','🎬','🎥','🌟','❤️','👍','🚀','🎨','🕉️','🦁'];
const faces = ['(｡♥‿♥｡)','(づ｡◕‿‿◕｡)づ','(ง •̀_•́)ง','(╯°□°）╯︵ ┻━┻','(づ￣ ³￣)づ','(•̀ᴗ•́)و','(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧'];
const symbols = ['✦','✧','★','☆','♛','♕','❖','◆','◇','➤','➜','☯','☮','∞','✓','♡'];
const facesText = [':)',';-)','^_^','-_-','T_T','<3','xD','o_O','(¬‿¬)'];
const fancyMap = { a:'𝒶',b:'𝒷',c:'𝒸',d:'𝒹',e:'ℯ',f:'𝒻',g:'ℊ',h:'𝒽',i:'𝒾',j:'𝒿',k:'𝓀',l:'𝓁',m:'𝓂',n:'𝓃',o:'ℴ',p:'𝓅',q:'𝓆',r:'𝓇',s:'𝓈',t:'𝓉',u:'𝓊',v:'𝓋',w:'𝓌',x:'𝓍',y:'𝓎',z:'𝓏' };

export default function ToolsLibrary() {
  const [query, setQuery] = useState('');
  const [groupName, setGroupName] = useState('All tools');
  const [active, setActive] = useState(null);
  const [image, setImage] = useState(null);
  const [secondImage, setSecondImage] = useState(null);
  const [result, setResult] = useState('');
  const [downloads, setDownloads] = useState([]);
  const [status, setStatus] = useState('');
  const [prompt, setPrompt] = useState('');
  const [copyText, setCopyText] = useState('');
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(100);
  const [grid, setGrid] = useState(2);

  const visible = useMemo(() => groups.filter(g => groupName === 'All tools' || g.name === groupName)
    .flatMap(g => g.tools.map(t => ({...t, group:g.name})))
    .filter(t => !query || (t.name+' '+t.description).toLowerCase().includes(query.toLowerCase())), [groupName, query]);

  function choose(tool) {
    setActive(tool); setStatus(''); setResult(''); setDownloads([]);
  }
  function chooseImage(event, second=false) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setStatus('Image file select karein.'); return; }
    const url = URL.createObjectURL(file);
    if (second) setSecondImage(url); else setImage(url);
    setResult(''); setDownloads([]); setStatus('');
  }
  function downloadData(data, filename) {
    const link = document.createElement('a'); link.href = data; link.download = filename; link.click();
  }
  function imageCanvas(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = im.naturalWidth; canvas.height = im.naturalHeight;
        canvas.getContext('2d').drawImage(im, 0, 0);
        resolve(canvas);
      };
      im.onerror = reject; im.src = src;
    });
  }
  async function runBrowserTool() {
    if (!image) { setStatus('Pehle image upload karein.'); return; }
    try {
      const canvas = await imageCanvas(image);
      const ctx = canvas.getContext('2d', {willReadFrequently:true});
      const name = active.name;
      if (name === 'Image Flip') {
        const flipped = document.createElement('canvas'); flipped.width=canvas.width; flipped.height=canvas.height;
        const c=flipped.getContext('2d'); c.translate(canvas.width,0); c.scale(-1,1); c.drawImage(canvas,0,0);
        canvas.width=flipped.width; canvas.height=flipped.height; ctx.drawImage(flipped,0,0);
      } else if (name === 'Image Black White' || name === 'Image Outline') {
        const data=ctx.getImageData(0,0,canvas.width,canvas.height), src=data.data;
        if (name === 'Image Black White') {
          for(let i=0;i<src.length;i+=4){const y=.299*src[i]+.587*src[i+1]+.114*src[i+2],v=y>128?255:0;src[i]=src[i+1]=src[i+2]=v;}
        } else {
          const w=canvas.width,h=canvas.height, gray=new Uint8ClampedArray(w*h);
          for(let i=0;i<w*h;i++){const p=i*4;gray[i]=.299*src[p]+.587*src[p+1]+.114*src[p+2];}
          const out=new Uint8ClampedArray(src.length);
          for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;const edge=Math.min(255,Math.abs(gray[i-1]-gray[i+1])+Math.abs(gray[i-w]-gray[i+w]));const p=i*4,v=255-edge;out[p]=out[p+1]=out[p+2]=v;out[p+3]=255;}
          data.data.set(out);
        }
        ctx.putImageData(data,0,0);
      } else if (name === 'Image Invert' || name === 'Image Grayscale') {
        const d=ctx.getImageData(0,0,canvas.width,canvas.height), p=d.data;
        for(let i=0;i<p.length;i+=4){if(name==='Image Invert'){p[i]=255-p[i];p[i+1]=255-p[i+1];p[i+2]=255-p[i+2];}else{const y=.299*p[i]+.587*p[i+1]+.114*p[i+2];p[i]=p[i+1]=p[i+2]=y;}}
        ctx.putImageData(d,0,0);
      } else if (name === 'Image Blur') {
        const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;
        const c=copy.getContext('2d');c.filter='blur(5px)';c.drawImage(canvas,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(copy,0,0);
      } else if (name === 'Image HSL') {
        const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;
        const c=copy.getContext('2d');c.filter=`hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${lightness}%)`;c.drawImage(canvas,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(copy,0,0);
      } else if (name === 'Image Resizer') {
        const w=Number(promptWidth)||canvas.width, h=Number(promptHeight)||canvas.height;
        const resized=document.createElement('canvas');resized.width=Math.min(4096,w);resized.height=Math.min(4096,h);
        resized.getContext('2d').drawImage(canvas,0,0,resized.width,resized.height);
        setResult(resized.toDataURL('image/jpeg',.9));setStatus('Image resized.');return;
      } else if (name === 'Image Splitter') {
        const n=Number(grid), pieces=[];
        for(let row=0;row<n;row++)for(let col=0;col<n;col++){
          const x=Math.floor(col*canvas.width/n),y=Math.floor(row*canvas.height/n),w=Math.ceil(canvas.width/n),h=Math.ceil(canvas.height/n);
          const piece=document.createElement('canvas');piece.width=w;piece.height=h;
          piece.getContext('2d').drawImage(canvas,x,y,w,h,0,0,w,h);
          pieces.push({url:piece.toDataURL('image/png'),name:`image-${row+1}-${col+1}.png`});
        }
        setDownloads(pieces);setResult(pieces[0]?.url||'');setStatus(`${pieces.length} image pieces ready.`);return;
      } else if (name === 'Image Combiner') {
        if (!secondImage) { setStatus('Doosri image bhi upload karein.'); return; }
        const other=await imageCanvas(secondImage), joined=document.createElement('canvas');
        joined.width=canvas.width+other.width;joined.height=Math.max(canvas.height,other.height);
        const jc=joined.getContext('2d');jc.drawImage(canvas,0,0);jc.drawImage(other,canvas.width,0);
        setResult(joined.toDataURL('image/png'));setStatus('Images combined side by side.');return;
      } else if (name === 'Color Palette') {
        const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data, counts=new Map();
        for(let i=0;i<pixels.length;i+=Math.max(4,Math.floor(pixels.length/6000/4)*4)){const color=[pixels[i],pixels[i+1],pixels[i+2]].map(v=>Math.round(v/32)*32);const key='#'+color.map(v=>Math.min(255,v).toString(16).padStart(2,'0')).join('');counts.set(key,(counts.get(key)||0)+1);}
        const palette=[...counts].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([color])=>color);
        setDownloads(palette.map(color=>({name:color,url:color})));setResult('');setStatus('Palette ready. Click a color to copy.');return;
      }
      const data=canvas.toDataURL('image/png');setResult(data);setStatus('Done. Preview aur download ready.');
    } catch { setStatus('Image process nahi ho saki. Doosri image try karein.'); }
  }

  async function runTool() {
    if (active?.kind === 'browser') return runBrowserTool();
    if (active?.kind === 'text') { try { await navigator.clipboard.writeText(copyText); setStatus('Copied!'); } catch { setStatus('Text select karke copy karein.'); } return; }
    if (active?.kind === 'ai') { setStatus('Is AI tool ko chalane ke liye compatible model/API backend connect karna hoga. Abhi generation connected nahi hai.'); return; }
    setStatus('Is feature ke liye abhi dedicated processor connect nahi hai.');
  }

  function renderUtility() {
    if (!active) return null;
    if (active.kind === 'text') {
      const outputs = active.name==='Emoji Copy'?emojis:active.name==='Kawaii Face'?faces:active.name==='Cool Symbols'?symbols:active.name==='Face Text'?facesText:[...copyText].map(ch=>fancyMap[ch.toLowerCase()]||ch).join('');
      return <div className="tal-util">
        {active.name==='Fancy Font' && <label>Text<input value={copyText} onChange={e=>setCopyText(e.target.value)} placeholder="Apna text likhein"/></label>}
        <div className="tal-chips">{outputs.map((value,i)=><button type="button" key={i} onClick={async()=>{try{await navigator.clipboard.writeText(value);setStatus('Copied: '+value)}catch{setStatus(value)}}}>{value}</button>)}</div>
      </div>;
    }
    if (active.kind === 'service') return <div className="tal-api-note">Is tool ko chalane ke liye dedicated processor/library aur backend route chahiye. Yeh abhi connect nahi hai.</div>;
    if (active.kind !== 'browser') return <div className="tal-api-note">Yeh AI feature abhi connect nahi hai. Isse chalane ke liye provider API ya local model, backend endpoint aur zaroori credentials chahiye.</div>;
    return <div className="tal-util">
      <label>Main image<input type="file" accept="image/*" onChange={e=>chooseImage(e)}/></label>
      {image && <img className="tal-upload-preview" src={image} alt="Uploaded preview"/>}
      {active.name==='Image Combiner' && <label>Second image<input type="file" accept="image/*" onChange={e=>chooseImage(e,true)}/></label>}
      {active.name==='Image Resizer' && <div className="tal-inline"><label>Width<input type="number" min="1" max="4096" value={promptWidth} onChange={e=>setPromptWidth(e.target.value)}/></label><label>Height<input type="number" min="1" max="4096" value={promptHeight} onChange={e=>setPromptHeight(e.target.value)}/></label></div>}
      {active.name==='Image HSL' && <div className="tal-inline"><label>Hue<input type="range" min="-180" max="180" value={hue} onChange={e=>setHue(e.target.value)}/></label><label>Saturation<input type="range" min="0" max="250" value={saturation} onChange={e=>setSaturation(e.target.value)}/></label><label>Lightness<input type="range" min="40" max="180" value={lightness} onChange={e=>setLightness(e.target.value)}/></label></div>}
      {active.name==='Image Splitter' && <label>Grid<select value={grid} onChange={e=>setGrid(e.target.value)}><option value="2">2 × 2</option><option value="3">3 × 3</option><option value="4">4 × 4</option></select></label>}
      <button type="button" className="tal-run" onClick={runTool}>Run {active.name}</button>
      {result && <div className="tal-output"><img src={result} alt="Processed result"/><button type="button" onClick={()=>downloadData(result,active.name.toLowerCase().replaceAll(' ','-')+'.png')}>Download result</button></div>}
      {downloads.length>0 && <div className={active.name==='Color Palette'?'tal-palette':'tal-output-grid'}>{downloads.map(item=>active.name==='Color Palette'?<button title="Copy color" key={item.name} style={{background:item.name}} onClick={async()=>{await navigator.clipboard.writeText(item.name);setStatus('Copied '+item.name)}}/>:<div key={item.name}><img src={item.url} alt={item.name}/><button onClick={()=>downloadData(item.url,item.name)}>Download {item.name}</button></div>)}</div>}
    </div>;
  }

  const [promptWidth, setPromptWidth] = useState(1280);
  const [promptHeight, setPromptHeight] = useState(720);
  return <section id="tools-library" className="tal-wrap">
    <header className="tal-header"><div><span>AR'S AI · TOOL LIBRARY</span><h2>Creative tools, all in one place</h2><p>AI tools need a connected model. Browser tools process files on your device.</p></div><input className="tal-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tools..."/></header>
    <nav className="tal-categories"><button className={groupName==='All tools'?'active':''} onClick={()=>setGroupName('All tools')}>All tools</button>{groups.map(g=><button key={g.name} className={groupName===g.name?'active':''} onClick={()=>setGroupName(g.name)}>{g.name}</button>)}</nav>
    <div className="tal-layout">
      <div className="tal-grid">{visible.map(tool=><button type="button" key={tool.name} onClick={()=>choose(tool)} className={'tal-card'+(active?.name===tool.name?' active':'')}><span>{tool.kind==='browser'?'🖼️':tool.kind==='text'?'✦':'✧'}</span><strong>{tool.name}</strong><small>{tool.description}</small><em>{tool.kind==='browser'?'Runs in browser':tool.kind==='text'?'Copy tool':tool.kind==='service'?'Processor needed':'Model required'}</em></button>)}</div>
      <aside className="tal-workspace">{active?<><div className="tal-work-title"><div><small>{active.group}</small><h3>{active.name}</h3><p>{active.description}</p></div><button type="button" onClick={()=>{setActive(null);setStatus('')}} aria-label="Close tool">×</button></div>{renderUtility()}<p role="status" className="tal-status">{status}</p></>:<div className="tal-empty"><b>Tool workspace</b><p>Upar se koi tool chunein. Browser tools yahin run honge.</p></div>}</aside>
    </div>
  </section>;
}
