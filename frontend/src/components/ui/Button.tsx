import React from 'react';
import { cn } from '@/utils/cn';
import { motion, HTMLMotionProps } from 'framer-motion';
import { animations } from '@/theme';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    
    const variants = {
      primary: 'bg-primary text-white hover:opacity-90',
      secondary: 'bg-secondary text-white hover:opacity-90',
      outline: 'border border-border text-text hover:bg-surface',
      ghost: 'text-text hover:bg-surface',
      danger: 'bg-error text-white hover:opacity-90',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={animations.framer.hover}
        whileTap={animations.framer.tap}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
