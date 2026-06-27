import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = 'left', className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 mt-2 w-56 rounded-md shadow-lg bg-surface border border-border focus:outline-none",
              align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
              className
            )}
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child, {
                    // @ts-ignore - passing close down to items
                    onClick: (e: any) => {
                      if (child.props.onClick) child.props.onClick(e);
                      setIsOpen(false);
                    }
                  });
                }
                return child;
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DropdownItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={cn("block px-4 py-2 text-sm text-text hover:bg-border cursor-pointer transition-colors", className)}
      role="menuitem"
      {...props}
    />
  );
};
