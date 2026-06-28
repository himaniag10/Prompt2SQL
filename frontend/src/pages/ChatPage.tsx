import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Send, Sparkles, User, Bot, Copy, Check, Download, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group rounded-md overflow-hidden my-4 border border-border">
        <div className="flex items-center justify-between px-4 py-2 bg-surface-hover border-b border-border text-xs text-muted-foreground">
          <span className="uppercase">{match[1]}</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-1 hover:text-text transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button 
              onClick={() => {
                const blob = new Blob([codeString], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `query_${Date.now()}.sql`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-1 hover:text-text transition-colors"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
          </div>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus as any}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, padding: '1rem', background: '#0d1117' }}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className="bg-surface-hover px-1.5 py-0.5 rounded text-sm text-primary font-mono" {...props}>
      {children}
    </code>
  );
};

export const ChatPage: React.FC = () => {
  const { activeChat, sendMessage, isTyping } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "Show all employees earning more than 50000.",
    "Find duplicate email addresses in users table.",
    "Customers who placed more than five orders.",
    "Average salary by department."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full relative w-full">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {(!activeChat || activeChat.messages.length === 0) ? (
            <div className="flex flex-col items-center justify-center p-4 space-y-6 mt-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-text text-center">How can I help you today?</h2>
              <p className="text-muted text-center max-w-md">
                Describe the SQL query you need, or ask me to explain and optimize an existing query.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(prompt)}
                    className="p-3 border border-border rounded-xl text-sm text-left text-muted-foreground hover:bg-surface-hover hover:text-text transition-colors shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeChat.messages.map((msg, idx) => (
              <div key={msg.id || idx} className={`flex gap-4 ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'USER' && (
                  <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                  msg.role === 'USER' 
                    ? 'bg-primary text-white ml-12 rounded-tr-sm' 
                    : 'bg-surface border border-border mr-12 rounded-tl-sm text-text'
                }`}>
                  {msg.role === 'USER' ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{ code: CodeBlock }}
                      className="prose prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none text-sm"
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                  <div className={`text-[10px] opacity-50 mt-2 ${msg.role === 'USER' ? 'text-right text-primary-foreground' : 'text-left'}`}>
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                {msg.role === 'USER' && (
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border text-muted-foreground flex items-center justify-center shrink-0 mt-1">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-surface border border-border rounded-2xl px-5 py-4 rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-muted rounded-full animate-bounce"></div>
              </div>
            </div>
          )}

          {!isTyping && activeChat && activeChat.messages.length > 0 && activeChat.messages[activeChat.messages.length - 1].role === 'ASSISTANT' && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => {
                  const userMessages = activeChat.messages.filter(m => m.role === 'USER');
                  if (userMessages.length > 0) {
                    sendMessage(userMessages[userMessages.length - 1].content);
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-text bg-surface hover:bg-surface-hover border border-border rounded-full transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Regenerate Response
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <div className="relative max-w-4xl mx-auto bg-surface rounded-2xl border border-border shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your database..." 
            className="border-0 focus-visible:ring-0 pr-14 resize-none min-h-[60px] bg-transparent py-4 text-base shadow-none"
            rows={input.split('\n').length > 2 ? 4 : 2}
            disabled={isTyping}
          />
          <div className="absolute right-3 bottom-3 flex items-center">
            <Button 
              size="sm" 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="h-9 w-9 p-0 rounded-full shadow-sm bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
        </div>
        <div className="text-center mt-3 text-xs text-muted max-w-4xl mx-auto">
          AI can make mistakes. Always verify important queries against your production schema.
        </div>
      </div>
    </div>
  );
};
