import { ImageResponse } from 'next/og';

export const size = {
  width: 64,
  height: 64,
};

export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '16px',
          border: '1.5px solid rgba(255, 68, 126, 0.4)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 900,
          letterSpacing: '-1px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#ffffff', fontSize: 20 }}>FIN</span>
          <span style={{ color: '#ff447e', fontSize: 20 }}>2U</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
