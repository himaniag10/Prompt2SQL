import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatLayout } from '@/components/layout/ChatLayout';
import { EmptyLayout } from '@/components/layout/EmptyLayout';

import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { SchemaBuilderPage } from '@/pages/SchemaBuilderPage';
import { ChatPage } from '@/pages/ChatPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Main Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Dashboard Routes with Sidebar */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/schema" element={<SchemaBuilderPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Chat Specific Layout */}
        <Route element={<ChatLayout />}>
          <Route path="/chat" element={<ChatPage />} />
        </Route>

        {/* Catch All - Empty Layout */}
        <Route element={<EmptyLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
