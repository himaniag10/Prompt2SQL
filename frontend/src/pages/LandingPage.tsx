import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6">
        Turn your ideas into <span className="text-primary">SQL</span> instantly.
      </h1>
      <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
        The intelligent AI assistant that helps you design, optimize, and generate SQL queries using plain English prompts.
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/chat">
          <Button size="lg">Start Chatting</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline" size="lg">View Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};
