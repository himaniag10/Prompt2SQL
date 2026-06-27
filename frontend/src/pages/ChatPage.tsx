import React from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Send, Sparkles } from 'lucide-react';

export const ChatPage: React.FC = () => {
  return (
    <div className="flex flex-col h-full relative max-w-4xl mx-auto w-full">
      {/* Empty State / Initial Prompt */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6 pb-32">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-text text-center">How can I help you today?</h2>
        <p className="text-muted text-center max-w-md">
          Describe the SQL query you need, or ask me to explain and optimize an existing query.
        </p>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <div className="relative max-w-3xl mx-auto bg-surface rounded-2xl border border-border shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Textarea 
            placeholder="E.g., Write a query to get the top 5 highest paying customers..." 
            className="border-0 focus-visible:ring-0 pr-14 resize-none min-h-[60px] bg-transparent py-4 text-base"
            rows={2}
          />
          <div className="absolute right-3 bottom-3 flex items-center">
            <Button size="sm" className="h-9 w-9 p-0 rounded-full shadow-sm bg-primary text-white hover:bg-primary/90">
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
        </div>
        <div className="text-center mt-3 text-xs text-muted">
          AI can make mistakes. Always verify important queries against your production schema.
        </div>
      </div>
    </div>
  );
};
