import { useState } from 'react';
import AccessForm from '../components/AccessForm';
import { verifyAccessCode } from '../services/api';
import { loadPixelAvatar } from '../utils/pixelateImage';
import { useEffect } from 'react';

export default function LandingPage({ onConnect }) {
  const [accessCode, setAccessCode] = useState('');
  const [status, setStatus] = useState('IDLE');
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    loadPixelAvatar().then(setAvatar).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    const code = accessCode.trim();
    if (!code) return;

    setStatus('CONNECTING');

    const result = await verifyAccessCode(code);

    if (result.offline) {
      setStatus('SERVER OFFLINE');
      return;
    }

    if (!result.success) {
      setStatus('INVALID CODE');
      return;
    }

    setStatus('CONNECTED');
    onConnect({ accessCode: code, role: result.role });
  };

  return (
    <div className="page landing-page">
      <div className="landing-bg-grid" aria-hidden="true" />

      <div className="landing-content landing-enter">
        <div className="landing-avatar-ring">
          {avatar && (
            <img
              className="landing-avatar"
              src={avatar}
              alt="DoodhVaala"
              draggable="false"
            />
          )}
          <span className="landing-avatar-pulse" aria-hidden="true" />
        </div>

        <h1 className="landing-title">DoodhVaala</h1>
        <p className="landing-subtitle">LIVE TRACKER</p>

        <div className="landing-divider">
          <span className="landing-divider-line" />
          <span className="landing-divider-dot" />
          <span className="landing-divider-line" />
        </div>

        <AccessForm
          accessCode={accessCode}
          onAccessCodeChange={(value) => {
            setAccessCode(value);
            if (status !== 'IDLE' && status !== 'CONNECTING') {
              setStatus('IDLE');
            }
          }}
          onSubmit={handleSubmit}
          disabled={status === 'CONNECTING'}
          status={status}
        />

        <p className="landing-hint">Enter your access code to begin tracking</p>
      </div>

      <div className="landing-footer">
        <span className="landing-footer-text">DOODHVAALA TRACKER v1.0</span>
      </div>
    </div>
  );
}
