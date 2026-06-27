import React from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';

export const ChatPage: React.FC = () => {
  return (
    <div className="flex flex-col h-full relative max-w-4xl mx-auto w-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {/* Placeholder Messages */}
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-surface shrink-0 flex items-center justify-center text-sm font-bold">U</div>
          <div className="flex-1 pt-1">
            <p className="text-text">Write a query to get the top 5 highest paying customers.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary shrink-0 flex items-center justify-center text-sm font-bold text-white">AI</div>
          <div className="flex-1 pt-1 space-y-4">
            <p className="text-text">Here is the query you requested based on your schema:</p>
            <div className="bg-surface border border-border rounded-md p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-text">
{`SELECT 
  c.id, c.name, SUM(o.total_amount) as total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_spent DESC
LIMIT 5;`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="relative max-w-3xl mx-auto">
          <Textarea 
            placeholder="Describe the query you want to generate..." 
            className="pr-12 resize-none shadow-sm rounded-xl py-3 min-h-[60px]"
            rows={2}
          />
          <Button size="sm" className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-lg">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-center mt-2 text-xs text-muted">
          AI can make mistakes. Verify important queries.
        </div>
      </div>
    </div>
  );
};
