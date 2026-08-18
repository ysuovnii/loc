import { useState } from 'react';
import AccessForm from '../components/AccessForm';
import { verifyAccessCode } from '../services/api';

export default function LandingPage({ onConnect }) {
  const [accessCode, setAccessCode] = useState('');
  const [status, setStatus] = useState('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    const code = accessCode.trim();
    if (!code) return;

    setStatus('CONNECTING');
    setErrorMessage('');

    const result = await verifyAccessCode(code);

    if (result.offline) {
      setStatus('SERVER OFFLINE');
      return;
    }

    if (!result.success) {
      setStatus('INVALID CODE');
      setErrorMessage(result.message === 'No Active Session'
        ? 'NO ACTIVE SESSION'
        : 'INVALID ACCESS CODE');
      return;
    }

    setStatus('CONNECTED');
    onConnect({ accessCode: code, role: result.role });
  };

  return (
    <div className="page landing-page">
      <div className="landing-content">
        <div className="crt-overlay" aria-hidden="true" />
        <header className="landing-header">
          <h1 className="title-main">LOCATION TRACKER</h1>
          <p className="title-sub">Enter your access code to continue.</p>
        </header>
        <AccessForm
          accessCode={accessCode}
          onAccessCodeChange={setAccessCode}
          onSubmit={handleSubmit}
          disabled={status === 'CONNECTING'}
          status={status}
          errorMessage={errorMessage}
        />
        <footer className="landing-footer">
          <span className="terminal-prompt">&gt; SYS.READY</span>
        </footer>
      </div>
    </div>
  );
}
