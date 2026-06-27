import React from 'react';
import { FileQuestion } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon, 
  action, 
  className,
  ...props 
}) => {
  return (
    <div 
      className={cn("flex flex-col items-center justify-center p-8 text-center", className)}
      {...props}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface mb-4">
        {icon || <FileQuestion className="h-10 w-10 text-muted" />}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-text">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
