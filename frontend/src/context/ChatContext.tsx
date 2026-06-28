import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  projectId: string;
  schemaVersionId: string;
  title: string;
  messages: ChatMessage[];
  updatedAt?: string;
  isPinned?: boolean;
}

interface ChatContextType {
  activeChatId: string | null;
  activeChat: Chat | null;
  isTyping: boolean;
  chats: Chat[];
  projectId: string | undefined;
  schemaId: string | undefined;
  loadChats: (projectId: string) => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  sendMessage: (content: string, schemaId?: string) => Promise<void>;
  startNewChat: () => void;
  renameChat: (chatId: string, title: string) => Promise<void>;
  pinChat: (chatId: string, isPinned: boolean) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  chatContextData: { tables: string[], relationships: string[] } | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const { projectId, schemaId } = useParams<{ projectId: string, schemaId: string }>();
  const [chatContextData, setChatContextData] = useState<{ tables: string[], relationships: string[] } | null>(null);

  useEffect(() => {
    if (projectId) {
      loadChats(projectId);
    }
  }, [projectId]);

  const loadChats = async (pId: string) => {
    try {
      const res = await api.get(`/chat?projectId=${pId}`);
      setChats(res.data);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const selectChat = async (chatId: string) => {
    try {
      const res = await api.get(`/chat/${chatId}`);
      setActiveChatId(chatId);
      setActiveChat(res.data);
    } catch (error) {
      console.error('Failed to select chat:', error);
    }
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setActiveChat(null);
    setChatContextData(null);
  };

  const renameChat = async (chatId: string, title: string) => {
    try {
      await api.put(`/chat/${chatId}`, { title });
      if (projectId) loadChats(projectId);
      if (activeChatId === chatId) {
        setActiveChat(prev => prev ? { ...prev, title } : null);
      }
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
  };

  const pinChat = async (chatId: string, isPinned: boolean) => {
    try {
      await api.put(`/chat/${chatId}/pin`, { isPinned });
      if (projectId) loadChats(projectId);
      if (activeChatId === chatId) {
        setActiveChat(prev => prev ? { ...prev, isPinned } : null);
      }
    } catch (error) {
      console.error('Failed to pin chat:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await api.delete(`/chat/${chatId}`);
      if (projectId) loadChats(projectId);
      if (activeChatId === chatId) {
        startNewChat();
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const sendMessage = async (content: string, paramSchemaId?: string) => {
    if (!content.trim()) return;

    // Optimistic UI update
    const tempUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'USER',
      content,
      createdAt: new Date().toISOString()
    };

    setActiveChat(prev => {
      if (prev) {
        return { ...prev, messages: [...prev.messages, tempUserMessage] };
      }
      return null; // Don't have a chat yet, we'll get it from response
    });

    setIsTyping(true);
    try {
      const payload: any = { content };
      if (activeChatId) payload.chatId = activeChatId;
      if (projectId) payload.projectId = projectId;
      if (schemaId) payload.schemaId = schemaId;

      const token = localStorage.getItem('accessToken');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

      const response = await fetch(`${baseUrl}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let isFirstChunk = true;
      let assistantMessageId = Date.now().toString() + '-ai';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));

              if (data.type === 'init') {
                if (!activeChatId && data.chatId) {
                  // We need to fetch the real chat if it was just created to get title etc
                  await selectChat(data.chatId);
                  loadChats(projectId!); // refresh list
                }
                if (data.context) {
                  setChatContextData(data.context);
                }
              } else if (data.type === 'chunk') {
                if (isFirstChunk) {
                  // Add the initial empty assistant message
                  setActiveChat(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      messages: [...prev.messages, {
                        id: assistantMessageId,
                        role: 'ASSISTANT',
                        content: data.content,
                        createdAt: new Date().toISOString()
                      }]
                    };
                  });
                  isFirstChunk = false;
                } else {
                  // Append to existing assistant message
                  setActiveChat(prev => {
                    if (!prev) return prev;
                    const messages = [...prev.messages];
                    const lastMsg = messages[messages.length - 1];
                    if (lastMsg && lastMsg.role === 'ASSISTANT') {
                      lastMsg.content += data.content;
                    }
                    return { ...prev, messages };
                  });
                }
              } else if (data.type === 'done') {
                // Finalize if needed
              }
            } catch (e) {
              console.error('Error parsing SSE data', e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      // If it was an ambiguous response, we would handle it here by showing project selection
      // For now, we log the error
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider 
      value={{ 
        activeChatId, 
        activeChat, 
        isTyping, 
        chats, 
        projectId, 
        schemaId,
        loadChats, 
        selectChat, 
        sendMessage, 
        startNewChat,
        renameChat,
        pinChat,
        deleteChat,
        chatContextData
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
