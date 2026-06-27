import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface">
        <Link to="/" className="text-xl font-bold text-primary">Prompt2SQL</Link>
        <nav className="flex gap-4">
          <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
          <Link to="/chat" className="text-sm font-medium hover:text-primary transition-colors">Chat</Link>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
