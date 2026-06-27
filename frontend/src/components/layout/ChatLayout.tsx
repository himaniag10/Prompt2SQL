import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Menu, X, ArrowLeft } from 'lucide-react';

export const ChatLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background overflow-hidden text-text selection:bg-primary/20">
      {/* Sidebar - Chat History */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full border-r border-border bg-surface flex flex-col shadow-sm"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Link to="/dashboard" className="p-2 rounded-lg text-muted hover:bg-border/50 hover:text-text transition-colors" title="Back to Dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm">
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center">
              <MessageSquare className="w-8 h-8 text-border mb-3" />
              <p className="text-sm font-medium text-text">No recent chats</p>
              <p className="text-xs text-muted mt-1 max-w-[200px]">Start a new conversation to generate SQL queries.</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center px-6 border-b border-border bg-background/50 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-surface text-muted transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1 text-center font-medium text-sm text-text/80 tracking-wide uppercase">Prompt2SQL Workspace</div>
          <div className="w-9" /> {/* spacer to center title */}
        </header>
        <main className="flex-1 overflow-auto relative bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
