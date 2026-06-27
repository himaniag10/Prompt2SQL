import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Database } from 'lucide-react';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary/20">
      <header className="h-20 flex items-center justify-between px-8 absolute top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md border-b border-border/50">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform group-hover:scale-105">
            <Database className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text">Prompt2SQL</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-muted hover:text-text transition-colors">Log In</Link>
          <Link to="/dashboard">
            <Button className="rounded-full shadow-sm" size="md">Get Started</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
    </div>
  );
};
