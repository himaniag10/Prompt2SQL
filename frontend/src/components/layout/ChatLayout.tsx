import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Menu, X, ArrowLeft } from 'lucide-react';

export const ChatLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background overflow-hidden text-text">
      {/* Sidebar - Chat History */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full border-r border-border bg-surface flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Link to="/dashboard" className="text-muted hover:text-text transition-colors" title="Back to Dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <button className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="text-xs font-semibold text-muted px-2 py-1 mb-2">Today</div>
              {/* Placeholder History Items */}
              {[1, 2, 3].map((i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-border text-sm text-left truncate transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-muted shrink-0" />
                  <span className="truncate">Explain SQL JOINs...</span>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center px-4 border-b border-border bg-background">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-md hover:bg-surface text-muted transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1 text-center font-medium text-sm text-muted">Prompt2SQL Model</div>
          <div className="w-9" /> {/* spacer to center title */}
        </header>
        <main className="flex-1 overflow-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
