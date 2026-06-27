import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden bg-background">
      {/* Subtle abstract background element */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
        <div className="w-[800px] h-[800px] bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full blur-3xl mix-blend-multiply" />
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-bl from-secondary/10 to-background rounded-full blur-3xl mix-blend-multiply translate-x-1/4 -translate-y-1/4" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-text mb-8">
          Prompt2<span className="text-primary font-serif italic">SQL</span>
        </h1>
        <p className="text-xl md:text-2xl text-text font-medium mb-6 max-w-3xl mx-auto leading-relaxed">
          Transform natural language into production-ready SQL with AI-powered query generation, explanation, validation and optimization.
        </p>
        <p className="text-lg text-muted mb-12 max-w-2xl mx-auto">
          The ultimate intelligent developer tool bridging the gap between human intent and complex database schemas. Design, interact, and deploy with confidence.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/dashboard">
            <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl px-8 h-14 text-lg">
              Get Started
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg bg-surface hover:bg-border">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
