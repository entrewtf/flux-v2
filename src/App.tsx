import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (!showDashboard) {
    return <LandingPage onEnter={() => setShowDashboard(true)} />;
  }

  return <Dashboard />;
}

export default App;
