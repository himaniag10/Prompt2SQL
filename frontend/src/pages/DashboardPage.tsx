import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted">Welcome back! Here's what's happening with your schemas.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Generated Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,482</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Schemas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
