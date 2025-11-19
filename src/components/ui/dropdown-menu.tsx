'use client';

import * as React from 'react';
import { cn } from '@/src/lib/utils';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'end';
}

export function DropdownMenu({ trigger, children, align = 'end' }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      // Trigger animation after render
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    }
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setOpen(false), 200); // Match animation duration
  };

  return (
    <div className="relative">
      <button
        onClick={() => open ? handleClose() : handleOpen()}
        className="focus:outline-none transition-transform active:scale-95"
      >
        {trigger}
      </button>

      {open && (
        <>
          <div
            className={cn(
              'fixed inset-0 z-10 transition-opacity duration-200 ease-out',
              isAnimating ? 'opacity-100' : 'opacity-0'
            )}
            onClick={handleClose}
          />
          <div
            className={cn(
              'absolute mt-2 min-w-[12rem] overflow-hidden rounded-md border border-border text-card-foreground shadow-xl z-20 origin-top-right',
              'transition-all duration-200 ease-out',
              align === 'end' ? 'right-0' : 'left-0',
              isAnimating 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 -translate-y-2'
            )}
            style={{ 
              backgroundColor: 'hsl(var(--card))'
            }}
          >
            {React.Children.map(children, (child, index) => {
              if (React.isValidElement(child)) {
                return (
                  <div
                    className={cn(
                      'transition-all duration-200 ease-out',
                      isAnimating 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 translate-x-2'
                    )}
                    style={{ 
                      transitionDelay: isAnimating ? `${index * 50}ms` : '0ms'
                    }}
                  >
                    {React.cloneElement(child as React.ReactElement<any>, {
                      onClick: () => {
                        child.props.onClick?.();
                        handleClose();
                      },
                    })}
                  </div>
                );
              }
              return child;
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-4 py-3 text-sm font-medium border-b border-border bg-card', className)}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-3 text-left text-sm bg-card hover:bg-accent hover:text-accent-foreground transition-all duration-150 flex items-center gap-2 active:scale-[0.98]',
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn('h-px bg-border', className)} />;
}

