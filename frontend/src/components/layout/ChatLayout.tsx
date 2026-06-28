import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Menu, X, ArrowLeft, Database, Info, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SchemaApiService } from '../../services/schema.service';
import { useChat } from '../../context/ChatContext';

export const ChatLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const { chats, activeChat, activeChatId, selectChat, startNewChat, renameChat, pinChat, deleteChat, chatContextData, projectId, schemaId } = useChat();

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: SchemaApiService.getProjects
  });

  const { data: schemas } = useQuery({
    queryKey: ['schemas', projectId],
    queryFn: () => SchemaApiService.getSchemas(projectId!),
    enabled: !!projectId
  });

  const handleRenameSubmit = (chatId: string) => {
    if (editTitle.trim()) {
      renameChat(chatId, editTitle.trim());
    }
    setEditingChatId(null);
    setMenuOpenId(null);
  };

  const activeProject = projects?.find(p => p.id === projectId);
  const activeSchema = schemas?.find(s => s.id === schemaId);

  const getGroupedChats = () => {
    const pinned: typeof chats = [];
    const today: typeof chats = [];
    const yesterday: typeof chats = [];
    const last7Days: typeof chats = [];
    const older: typeof chats = [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    chats.forEach(chat => {
      if (chat.isPinned) {
        pinned.push(chat);
        return;
      }
      
      if (!chat.updatedAt) {
        older.push(chat);
        return;
      }
      const chatDate = new Date(chat.updatedAt);
      chatDate.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(now.getTime() - chatDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) today.push(chat);
      else if (diffDays === 1) yesterday.push(chat);
      else if (diffDays <= 7) last7Days.push(chat);
      else older.push(chat);
    });

    return { pinned, today, yesterday, last7Days, older };
  };

  const groupedChats = getGroupedChats();

  const renderChatGroup = (title: string, groupChats: typeof chats) => {
    if (groupChats.length === 0) return null;
    return (
      <div className="mb-4">
        <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted mb-1">{title}</h4>
        <div className="space-y-1">
          {groupChats.map(renderChatItem)}
        </div>
      </div>
    );
  };

  const renderChatItem = (chat: any) => (
    <div key={chat.id} className="relative group mx-2">
      {editingChatId === chat.id ? (
        <div className="flex items-center px-2 py-1 bg-surface-hover rounded-lg">
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit(chat.id);
              if (e.key === 'Escape') setEditingChatId(null);
            }}
            onBlur={() => handleRenameSubmit(chat.id)}
            className="flex-1 bg-transparent text-sm text-text outline-none border-none py-1.5"
          />
        </div>
      ) : (
        <div className={`flex items-center justify-between rounded-lg transition-colors ${
          activeChatId === chat.id ? 'bg-primary/10' : 'hover:bg-surface-hover'
        }`}>
          <button
            onClick={() => selectChat(chat.id)}
            className={`flex-1 text-left p-2.5 text-sm truncate ${
              activeChatId === chat.id ? 'text-primary font-medium' : 'text-text'
            }`}
          >
            {chat.title || 'New Conversation'}
          </button>
          
          <div className="relative pr-2">
            <button 
              onClick={() => setMenuOpenId(menuOpenId === chat.id ? null : chat.id)}
              className={`p-1.5 rounded text-muted hover:text-text hover:bg-border/50 ${
                menuOpenId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              } transition-opacity`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {menuOpenId === chat.id && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-surface border border-border rounded-md shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    pinChat(chat.id, !chat.isPinned);
                    setMenuOpenId(null);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-text hover:bg-surface-hover flex items-center gap-2"
                >
                  <span className="w-3 h-3 flex items-center justify-center">📌</span> {chat.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={() => {
                    setEditTitle(chat.title || '');
                    setEditingChatId(chat.id);
                    setMenuOpenId(null);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-text hover:bg-surface-hover flex items-center gap-2"
                >
                  <Edit2 className="w-3 h-3" /> Rename
                </button>
                <button
                  onClick={() => {
                    deleteChat(chat.id);
                    setMenuOpenId(null);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-surface-hover flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

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
              <Link to={`/projects/${projectId}`} className="p-2 rounded-lg text-muted hover:bg-border/50 hover:text-text transition-colors" title="Back to Schema">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <button 
                onClick={startNewChat}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-4 mt-8">
                  <MessageSquare className="w-8 h-8 text-border mb-3" />
                  <p className="text-sm font-medium text-text">No recent chats</p>
                  <p className="text-xs text-muted mt-1 max-w-[200px]">Start a new conversation to generate SQL queries.</p>
                </div>
              ) : (
                <div className="py-2">
                  {renderChatGroup('Pinned', groupedChats.pinned)}
                  {renderChatGroup('Today', groupedChats.today)}
                  {renderChatGroup('Yesterday', groupedChats.yesterday)}
                  {renderChatGroup('Previous 7 Days', groupedChats.last7Days)}
                  {renderChatGroup('Older', groupedChats.older)}
                </div>
              )}
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
          
          <div className="flex-1 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/projects" className="text-muted hover:text-text transition-colors">Projects</Link>
              <span className="text-muted">/</span>
              <Link to={`/projects/${projectId}`} className="text-text font-medium hover:text-primary transition-colors">{activeProject?.name || 'Loading...'}</Link>
              <span className="text-muted">/</span>
              <span className="text-text font-medium">{activeSchema?.name || 'Loading...'}</span>
              
              {activeProject && (
                <>
                  <span className="mx-2 text-border">|</span>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 border border-primary/20 rounded-full">{activeProject.databaseType}</span>
                </>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setRightSidebarOpen(!isRightSidebarOpen)}
            className="p-2 -mr-2 rounded-lg hover:bg-surface text-muted transition-colors"
            title="Toggle Context"
          >
            <Info className="w-5 h-5" />
          </button>
        </header>
        
        <main className="flex-1 overflow-auto relative bg-background flex flex-row">
          <div className="flex-1 overflow-y-auto">
             <Outlet />
          </div>
          
          {/* Right Sidebar - Context */}
          <AnimatePresence initial={false}>
            {isRightSidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="h-full border-l border-border bg-surface flex flex-col"
              >
                <div className="p-4 border-b border-border font-medium flex items-center justify-between">
                  <span>Chat Context</span>
                  <button onClick={() => setRightSidebarOpen(false)} className="text-muted hover:text-text">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 text-sm text-muted">
                  {activeChat ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-text font-medium mb-1">Project</h4>
                        <p>{activeChat.projectId}</p>
                      </div>
                      <div>
                        <h4 className="text-text font-medium mb-1">Schema Version</h4>
                        <p>{activeChat.schemaVersionId}</p>
                      </div>
                      {/* Context from backend response */}
                      {chatContextData && (
                        <>
                          <div className="pt-2 border-t border-border/50">
                            <h4 className="text-text font-medium mb-2 flex items-center gap-1 text-xs uppercase tracking-wider">
                              <Database className="w-3 h-3" /> Detected Tables
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {chatContextData.tables.map(t => (
                                <span key={t} className="px-2 py-1 bg-surface-hover rounded text-xs border border-border/50 text-text/90">
                                  {t}
                                </span>
                              ))}
                              {chatContextData.tables.length === 0 && <span className="text-xs text-muted">None detected</span>}
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-border/50">
                            <h4 className="text-text font-medium mb-2 text-xs uppercase tracking-wider">Relationships</h4>
                            <ul className="text-xs space-y-1">
                              {chatContextData.relationships.map(r => (
                                <li key={r} className="text-muted-foreground break-all">{r}</li>
                              ))}
                              {chatContextData.relationships.length === 0 && <li className="text-muted">None used</li>}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p>No active chat. Context will be resolved automatically from your question.</p>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
