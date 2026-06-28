import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

interface ChatContextType {
  activeChatId: string | null;
  activeChat: Chat | null;
  isTyping: boolean;
  chats: Chat[];
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  schemaId: string | null;
  setSchemaId: (id: string | null) => void;
  loadChats: (projectId: string) => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  sendMessage: (content: string, schemaId?: string) => Promise<void>;
  startNewChat: () => void;
  renameChat: (chatId: string, title: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  chatContextData: { tables: string[], relationships: string[] } | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [schemaId, setSchemaId] = useState<string | null>(null);
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
      if (paramSchemaId || schemaId) payload.schemaId = paramSchemaId || schemaId;

      const res = await api.post('/chat/message', payload);
      
      // Update with real chat if it was just created
      if (!activeChatId && res.data.chatId) {
        await selectChat(res.data.chatId);
        loadChats(projectId!); // reload chat list
      } else {
        // Just append the assistant message
        setActiveChat(prev => {
          if (prev) {
            return { ...prev, messages: [...prev.messages, res.data.message] };
          }
          return prev;
        });
      }
      
      if (res.data.context) {
        setChatContextData(res.data.context);
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
        setProjectId, 
        schemaId,
        setSchemaId,
        loadChats, 
        selectChat, 
        sendMessage, 
        startNewChat,
        renameChat,
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
