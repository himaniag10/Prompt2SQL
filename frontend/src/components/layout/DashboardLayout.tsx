import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Database, Settings, Menu, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Projects', href: '/projects', icon: LayoutDashboard },
    { name: 'Schema', href: '/schema', icon: Database },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full border-r border-border bg-surface flex flex-col"
          >
            <div className="h-16 flex items-center px-4 border-b border-border">
              <span className="text-lg font-bold text-primary truncate">Dashboard</span>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-border text-sm font-medium text-text transition-colors"
                  >
                    <Icon className="w-5 h-5 text-muted" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-surface flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-border text-muted transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <Link to="/chat" className="text-sm font-medium hover:text-primary transition-colors">Go to Chat</Link>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
