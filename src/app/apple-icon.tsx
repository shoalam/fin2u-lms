import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #041c53 0%, #0a276e 100%)',
          borderRadius: '40px',
          border: '4px solid rgba(255, 68, 126, 0.5)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 900,
          letterSpacing: '-2px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#ffffff', fontSize: 56 }}>FIN</span>
          <span style={{ color: '#ff447e', fontSize: 56 }}>2U</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
