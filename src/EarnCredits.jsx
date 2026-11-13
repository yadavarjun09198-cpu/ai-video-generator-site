import { useState } from 'react';

export default function EarnCredits() {
  const [message, setMessage] = useState('');
  return (
    <section id="earn-credits" style={{ padding: '52px 5%', background: '#0b1220', color: '#fff' }}>
      <div style={{ maxWidth: 900, margin: 'auto', background: '#1e293b', padding: 24, borderRadius: 16, border: '1px solid #334155' }}>
        <p style={{ color: '#93c5fd', fontWeight: 700 }}>AR's AI · Rewards</p>
        <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.3rem)', margin: '10px 0' }}>Earn Credits</h2>
        <p style={{ color: '#cbd5e1' }}>Earn AI video credits through verified rewarded ads when a supported ad provider is connected.</p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', margin: '20px 0' }}>
          <div style={{ background: '#0f172a', padding: 16, borderRadius: 12, minWidth: 160 }}>
            <small style={{ color: '#94a3b8' }}>Credit balance</small>
            <div style={{ fontSize: 24, fontWeight: 700 }}>Not connected</div>
          </div>
          <div style={{ background: '#0f172a', padding: 16, borderRadius: 12, flex: 1, minWidth: 190 }}>
            <small style={{ color: '#94a3b8' }}>Rewarded ad</small>
            <div style={{ fontWeight: 700 }}>Provider setup required</div>
          </div>
        </div>
        <div aria-label="Rewarded advertisement placement" style={{ border: '1px dashed #64748b', borderRadius: 12, padding: 24, textAlign: 'center', color: '#cbd5e1' }}>
          Rewarded Ad Placement — no live ad connected
        </div>
        <button type="button" disabled style={{ background: '#475569', color: '#fff', border: 0, padding: '12px 20px', borderRadius: 9, marginTop: 16, cursor: 'not-allowed' }}>
          Watch Ad &amp; Earn Credits (Coming Soon)
        </button>
        <p role="status" style={{ color: '#fbbf24', marginTop: 12 }}>{message || 'Credits will only be awarded after server-side verification of a completed rewarded ad. No credits can be earned yet.'}</p>
      </div>
    </section>
  );
}
