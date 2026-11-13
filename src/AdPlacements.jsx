/** Ad placement shells only. Never load an unapproved network or reward clicks. */
export default function AdPlacements({ format = 'banner' }) {
  const isNative = format === 'native';
  return (
    <aside aria-label={isNative ? 'Native advertisement placement' : 'Banner advertisement placement'}
      style={{ maxWidth: 900, margin: '24px auto', padding: '0 5%' }}>
      <div style={{ background: '#f1f5f9', border: '1px dashed #94a3b8', borderRadius: 12,
        padding: isNative ? '30px 20px' : '18px 20px', textAlign: 'center', color: '#475569' }}>
        <strong style={{ display: 'block', marginBottom: 5 }}>Advertisement</strong>
        <span style={{ fontSize: 13 }}>{isNative ? 'Native ad slot' : 'Banner ad slot'} — provider not connected</span>
      </div>
    </aside>
  );
}
