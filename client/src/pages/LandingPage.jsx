import { useState } from 'react';
import AccessForm from '../components/AccessForm';
import { verifyAccessCode } from '../services/api';

export default function LandingPage({ onConnect }) {
  const [accessCode, setAccessCode] = useState('');
  const [status, setStatus] = useState('IDLE');

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
      <div className="landing-bg-glow" aria-hidden="true" />

      <div className="landing-content landing-enter">
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
      </div>
    </div>
  );
}
