import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-9xl font-extrabold text-primary opacity-20">404</h1>
      <h2 className="text-2xl font-bold tracking-tight mt-4">Page Not Found</h2>
      <p className="text-muted mt-2 mb-6">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/">
        <Button>Go Back Home</Button>
      </Link>
    </div>
  );
};
