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
  const { chats, activeChat, activeChatId, selectChat, startNewChat, renameChat, deleteChat, chatContextData, projectId, setProjectId, schemaId, setSchemaId } = useChat();

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
                chats.map(chat => (
                  <div key={chat.id} className="relative group">
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
                          className={`flex-1 text-left p-3 text-sm truncate ${
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
                            <div className="absolute right-0 top-full mt-1 w-32 bg-surface border border-border rounded-md shadow-lg py-1 z-50">
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
                ))
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
            <span className="font-medium text-sm text-text/80 tracking-wide uppercase">Prompt2SQL Workspace</span>
            
            {!activeChatId ? (
              <div className="flex items-center gap-2">
                <select 
                  className="bg-surface border border-border rounded text-sm px-2 py-1 text-text focus:outline-none focus:border-primary"
                  value={projectId || ''}
                  onChange={(e) => {
                    setProjectId(e.target.value);
                    setSchemaId(null);
                  }}
                >
                  <option value="">Select Project</option>
                  {projects?.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <select 
                  className="bg-surface border border-border rounded text-sm px-2 py-1 text-text focus:outline-none focus:border-primary"
                  value={schemaId || ''}
                  onChange={(e) => setSchemaId(e.target.value)}
                  disabled={!projectId}
                >
                  <option value="">Select Schema</option>
                  {schemas?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              activeChat?.projectId && (
                <span className="px-2 py-0.5 rounded-full bg-border text-xs text-muted-foreground flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Context Active
                </span>
              )
            )}
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
