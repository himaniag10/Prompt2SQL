import React from 'react';

export const SettingsPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted">Manage your account and application preferences.</p>
      </div>
      <div className="space-y-6">
        <div className="border border-border bg-surface p-6 rounded-xl">
          <h3 className="text-lg font-medium mb-4">Profile</h3>
          <p className="text-sm text-muted">Profile settings placeholder</p>
        </div>
        <div className="border border-border bg-surface p-6 rounded-xl">
          <h3 className="text-lg font-medium mb-4">API Keys</h3>
          <p className="text-sm text-muted">API keys management placeholder</p>
        </div>
      </div>
    </div>
  );
};
