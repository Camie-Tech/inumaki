import { ImageResponse } from 'next/og';

// Generated 1200x630 (1.91:1) social card. Dark #0b0f14 background matches the
// site theme-color, and the tagline renders the value prop in every preview.
export const alt = 'Inumaki - free local voice-to-text dictation app for Windows';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: '#0b0f14',
          padding: '90px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* ambient cyan glow */}
        <div
          style={{
            position: 'absolute',
            top: '-220px',
            left: '260px',
            width: '900px',
            height: '640px',
            display: 'flex',
            background:
              'radial-gradient(closest-side, rgba(0,174,239,0.32), rgba(11,15,20,0))',
          }}
        />
        {/* hairline top accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            display: 'flex',
            background: 'linear-gradient(to right, #00aeef, #42caff, rgba(11,15,20,0))',
          }}
        />
        <div
          style={{
            display: 'flex',
            color: '#7fdcff',
            fontSize: '26px',
            letterSpacing: '10px',
            marginBottom: '26px',
          }}
        >
          CAMIE TECH
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: '128px',
            fontWeight: 800,
            letterSpacing: '8px',
            color: '#42caff',
            lineHeight: 1,
          }}
        >
          INUMAKI
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: '30px',
            fontSize: '54px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.12,
            maxWidth: '1010px',
          }}
        >
          Press a key. Speak. Paste clean text anywhere.
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: '44px',
            fontSize: '30px',
            color: '#9fb3c8',
            letterSpacing: '2px',
          }}
        >
          Free · Open source · Local · Windows · whisper.cpp
        </div>
      </div>
    ),
    { ...size },
  );
}
