import { useState } from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === '0101') {
      onEnter();
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-start px-16">
      <div>
        <h1 className="text-white text-4xl font-light tracking-wide">
          <span className="text-yellow-500">&gt;_</span> Flux
        </h1>
        <form onSubmit={handleSubmit} className="mt-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-transparent border-b border-zinc-800 text-zinc-700 text-xs outline-none w-20 focus:border-zinc-700 focus:text-zinc-600 transition-colors"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
