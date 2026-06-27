import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = "Something went wrong", 
  message = "An unexpected error occurred while loading this content.", 
  onRetry,
  className,
  ...props 
}) => {
  return (
    <div 
      className={cn("flex flex-col items-center justify-center p-8 text-center bg-error/5 rounded-xl border border-error/20", className)}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10 mb-4 text-error">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm text-muted max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" className="mt-6" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
