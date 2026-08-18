import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import BroadcasterPage from './pages/BroadcasterPage';
import ViewerPage from './pages/ViewerPage';

export default function App() {
  const [session, setSession] = useState(null);

  if (!session) {
    return <LandingPage onConnect={setSession} />;
  }

  if (session.role === 'broadcaster') {
    return <BroadcasterPage accessCode={session.accessCode} />;
  }

  return <ViewerPage accessCode={session.accessCode} />;
}
