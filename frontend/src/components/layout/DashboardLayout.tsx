import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Database, Settings, Menu, X, TerminalSquare } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Avatar } from '@/components/ui/Avatar';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Projects', href: '/projects', icon: LayoutDashboard },
    { name: 'Schema', href: '/schema', icon: Database },
    { name: 'Chat', href: '/chat', icon: TerminalSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden text-text selection:bg-primary/20">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full border-r border-border bg-surface flex flex-col shadow-sm"
          >
            <div className="h-16 flex items-center px-6 border-b border-border">
              <span className="text-xl font-bold tracking-tight text-primary truncate">Prompt2SQL</span>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-border/50 text-sm font-medium text-text transition-all hover:text-primary"
                  >
                    <Icon className="w-4 h-4 text-muted shrink-0" />
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
        <header className="h-16 border-b border-border bg-surface flex items-center px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-border/50 text-muted transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            {/* Profile Dropdown Placeholder */}
            <button className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-border transition-all">
              <Avatar fallback="U" size="sm" className="bg-primary text-white" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
