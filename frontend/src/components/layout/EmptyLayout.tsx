import React from 'react';
import { Outlet } from 'react-router-dom';

export const EmptyLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};
