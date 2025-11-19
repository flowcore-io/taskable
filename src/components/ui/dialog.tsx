'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg">{children}</div>
    </div>
  );
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative bg-card text-card-foreground rounded-lg shadow-lg p-6 mx-4 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 border border-border',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DialogHeader({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className)}>
      {children}
    </div>
  );
}

export function DialogTitle({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
      {children}
    </h2>
  );
}

export function DialogDescription({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>;
}

export function DialogFooter({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DialogClose({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-foreground',
        className,
      )}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}
